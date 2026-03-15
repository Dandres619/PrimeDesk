import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, Clock, Users, CheckCircle, XCircle, CalendarDays, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Transform flat rows from DB into grouped schedule-per-employee objects
function groupByEmployee(rows: any[]) {
  const map: Record<number, any> = {};
  for (const row of rows) {
    const id = row.ID_Empleado;
    if (!map[id]) {
      map[id] = {
        id: id,
        mechanicName: `${row.Nombre} ${row.Apellido}`,
        daySchedules: {},
        // status: active if at least one día is active
        status: row.Estado ? 'Activo' : 'Inactivo',
        createdAt: row.CreadoEn,
        updatedAt: row.ActualizadoEn
      };
    }
    map[id].daySchedules[row.Dia] = {
      enabled: row.Estado,
      startTime: row.HoraEntrada?.substring(0, 5) ?? '08:00',
      endTime: row.HoraSalida?.substring(0, 5) ?? '17:00',
    };
    // If any day is active, mark the whole record as active
    if (row.Estado) map[id].status = 'Activo';
  }
  return Object.values(map);
}

export function Horarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [viewingSchedule, setViewingSchedule] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => { } });

  const [schedules, setSchedules] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      // Fetch employees and horarios independently so one failure doesn't block the other
      const [resHor, resEmp] = await Promise.allSettled([
        fetch(`${API_URL}/horarios`, { headers }),
        fetch(`${API_URL}/empleados`, { headers })
      ]);

      // Load employees (mechanics with rol Empleado)
      if (resEmp.status === 'fulfilled' && resEmp.value.ok) {
        const dataEmp = await resEmp.value.json();
        // NombreRol 'Empleado' = rol 2 (mecánicos). EstadoUsuario may be boolean or string.
        const mechanics = dataEmp.filter((e: any) =>
          e.NombreRol === 'Empleado' &&
          e.EstadoUsuario !== false &&
          e.EstadoUsuario !== 'Inactivo'
        );
        setEmployees(mechanics);
      } else {
        toast.error('No se pudieron cargar los empleados');
      }

      // Load horarios
      if (resHor.status === 'fulfilled' && resHor.value.ok) {
        const dataHor = await resHor.value.json();
        setSchedules(groupByEmployee(dataHor));
      } else {
        // Horarios vacíos si la ruta aún no responde (ej. servidor sin reiniciar)
        setSchedules([]);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getEnabledDays = (s: any) => DAYS_OF_WEEK.filter(d => s.daySchedules[d]?.enabled);
  const formatDays = (s: any) => {
    const enabled = getEnabledDays(s);
    if (enabled.length === 0) return 'Sin días configurados';
    if (enabled.length === 5 && !enabled.includes('Sábado') && !enabled.includes('Domingo')) return 'Lunes a Viernes';
    if (enabled.length === 7) return 'Todos los días';
    return enabled.length <= 2 ? enabled.join(', ') : `${enabled.slice(0, 2).join(', ')} +${enabled.length - 2}`;
  };

  const filteredSchedules = schedules.filter(s =>
    s.mechanicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getEnabledDays(s).some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredSchedules.length / 5);
  const paginatedSchedules = filteredSchedules.slice((currentPage - 1) * 5, currentPage * 5);

  const handleSave = async (data: any) => {
    const isEditing = !!editingSchedule;
    const id_empleado = parseInt(data.employeeId);
    const dias = Object.entries(data.daySchedules)
      .filter(([, ds]: any) => ds.enabled)
      .map(([dia, ds]: any) => ({ dia, hora_entrada: ds.startTime, hora_salida: ds.endTime }));

    if (dias.length === 0) {
      toast.error('Debe habilitar al menos un día de trabajo');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/horarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id_empleado, dias })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al guardar horario');
      }
      toast.success(`Horario ${isEditing ? 'actualizado' : 'creado'} exitosamente`);
      setIsDialogOpen(false);
      setEditingSchedule(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleEstado = async (schedule: any) => {
    const newEstado = schedule.status !== 'Activo';
    try {
      const res = await fetch(`${API_URL}/horarios/empleado/${schedule.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: newEstado })
      });
      if (!res.ok) throw new Error('Error al cambiar el estado');
      toast.success('Estado del horario actualizado');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id_empleado: number) => {
    try {
      const res = await fetch(`${API_URL}/horarios/empleado/${id_empleado}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar horario');
      toast.success('Horario eliminado exitosamente');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const stats = [
    { icon: Clock, color: 'text-blue-600', value: schedules.length, label: 'Total Horarios' },
    { icon: CheckCircle, color: 'text-green-600', value: schedules.filter(s => s.status === 'Activo').length, label: 'Activos' },
    { icon: XCircle, color: 'text-red-600', value: schedules.filter(s => s.status === 'Inactivo').length, label: 'Inactivos' },
    { icon: Users, color: 'text-purple-600', value: employees.length, label: 'Mecánicos' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar horarios..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingSchedule(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSchedule(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Horario
            </Button>
          </DialogTrigger>
          <ScheduleDialog schedule={editingSchedule} employees={employees} daysOfWeek={DAYS_OF_WEEK} onSave={handleSave} />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="flex items-center p-6">
              <s.icon className={`w-8 h-8 ${s.color} mr-4`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Horarios de Trabajo ({filteredSchedules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mecánico</TableHead>
                <TableHead>Días Laborales</TableHead>
                <TableHead>Horarios</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSchedules.length === 0 ? (
                <TableRow>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground">
                    No hay horarios registrados aún.
                  </td>
                </TableRow>
              ) : paginatedSchedules.map(s => {
                const enabledDays = getEnabledDays(s);
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium">{s.mechanicName}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatDays(s)}</p>
                        <p className="text-sm text-muted-foreground">{enabledDays.length} días laborales</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {enabledDays.slice(0, 2).map(day => {
                          const ds = s.daySchedules[day];
                          return (
                            <p key={day} className="text-sm">
                              <span className="font-medium">{day}:</span> {ds.startTime} - {ds.endTime}
                            </p>
                          );
                        })}
                        {enabledDays.length > 2 && <p className="text-sm text-muted-foreground">+{enabledDays.length - 2} más</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={s.status === 'Activo'}
                          onCheckedChange={() => handleToggleEstado(s)}
                        />
                        <span className="text-sm">{s.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setViewingSchedule(s)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingSchedule(s); setIsDialogOpen(true); }} className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDialog({ open: true, title: 'Eliminar Horario', description: `¿Está seguro de que desea eliminar el horario de ${s.mechanicName}? Esta acción no se puede deshacer.`, confirmText: 'Eliminar', variant: 'delete', onConfirm: () => handleDelete(s.id) })} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                {totalPages > 1 && <PaginationItem><PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>}
                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map(p => (
                  <PaginationItem key={p}><PaginationLink onClick={() => totalPages > 1 ? setCurrentPage(p) : undefined} isActive={currentPage === p} className={totalPages > 1 ? "cursor-pointer" : "cursor-default"}>{p}</PaginationLink></PaginationItem>
                ))}
                {totalPages > 1 && <PaginationItem><PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>}
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={!!viewingSchedule} onOpenChange={() => setViewingSchedule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Horario</DialogTitle>
          </DialogHeader>
          {viewingSchedule && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mecánico</Label>
                  <p className="font-medium text-foreground mt-1">{viewingSchedule.mechanicName}</p>
                </div>
                <div>
                  <Label>Estado General</Label>
                  <div className="mt-1">
                    <Badge className={viewingSchedule.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}>
                      {viewingSchedule.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="mb-3 block">Horarios por Día</Label>
                <div className="space-y-3">
                  {DAYS_OF_WEEK.map(day => {
                    const ds = viewingSchedule.daySchedules[day];
                    if (!ds?.enabled) return null;
                    const start = new Date(`2024-01-01T${ds.startTime}:00`);
                    const end = new Date(`2024-01-01T${ds.endTime}:00`);
                    const hours = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
                    return (
                      <div key={day} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{day}</Badge>
                          <div>
                            <p className="font-medium text-foreground">{ds.startTime} - {ds.endTime}</p>
                            <p className="text-sm text-muted-foreground">{hours}h de trabajo</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))} title={confirmDialog.title} description={confirmDialog.description} confirmText={confirmDialog.confirmText} variant={confirmDialog.variant} onConfirm={confirmDialog.onConfirm} />
    </div>
  );
}

function ScheduleDialog({ schedule, employees, daysOfWeek, onSave }: any) {
  const getInitialDaySchedules = () => {
    if (schedule?.daySchedules) return JSON.parse(JSON.stringify(schedule.daySchedules));
    const initial: any = {};
    daysOfWeek.forEach((day: string) => { initial[day] = { enabled: false, startTime: '08:00', endTime: '17:00' }; });
    return initial;
  };

  const [formData, setFormData] = useState({
    employeeId: schedule?.id?.toString() || '',
    daySchedules: getInitialDaySchedules()
  });
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (schedule) {
      setFormData({
        employeeId: schedule.id?.toString() || '',
        daySchedules: JSON.parse(JSON.stringify(schedule.daySchedules || getInitialDaySchedules()))
      });
    } else {
      const initial: any = {};
      daysOfWeek.forEach((day: string) => { initial[day] = { enabled: false, startTime: '08:00', endTime: '17:00' }; });
      setFormData({ employeeId: '', daySchedules: initial });
    }
  }, [schedule]);

  const toggleDay = (day: string, enabled: boolean) =>
    setFormData(prev => ({ ...prev, daySchedules: { ...prev.daySchedules, [day]: { ...prev.daySchedules[day], enabled } } }));

  const updateDayTime = (day: string, field: 'startTime' | 'endTime', value: string) =>
    setFormData(prev => ({ ...prev, daySchedules: { ...prev.daySchedules, [day]: { ...prev.daySchedules[day], [field]: value } } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) { toast.error('Por favor seleccione un mecánico'); return; }
    const hasEnabled = Object.values(formData.daySchedules).some((d: any) => d.enabled);
    if (!hasEnabled) { toast.error('Debe habilitar al menos un día de trabajo'); return; }
    for (const [dayName, ds] of Object.entries(formData.daySchedules)) {
      const d = ds as any;
      if (d.enabled) {
        if (!d.startTime || !d.endTime) { toast.error(`Complete los horarios para ${dayName}`); return; }
        if (d.startTime >= d.endTime) { toast.error(`Hora de inicio debe ser menor que la de fin en ${dayName}`); return; }
      }
    }
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const enabledDaysCount = Object.values(formData.daySchedules).filter((d: any) => d.enabled).length;

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{schedule ? 'Editar Horario' : 'Nuevo Horario'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="employeeId">Mecánico *</Label>
          <select
            id="employeeId"
            value={formData.employeeId}
            onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
            className="w-full px-3 py-2 mt-1 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={!!schedule}
          >
            <option value="" className="bg-background text-foreground">{schedule ? `${schedule.mechanicName}` : 'Seleccionar mecánico'}</option>
            {employees.map((emp: any) => (
              <option key={emp.ID_Empleado} value={emp.ID_Empleado.toString()} className="bg-background text-foreground">
                {emp.Nombre} {emp.Apellido}
              </option>
            ))}
          </select>
          {schedule && <p className="text-xs text-muted-foreground mt-1">El mecánico no se puede cambiar al editar un horario.</p>}
        </div>

        <div>
          <Label className="mb-3 block">Horarios por Día de la Semana *</Label>
          <p className="text-sm text-muted-foreground mb-4">Seleccione los días laborables y configure el horario específico para cada día</p>
          <div className="space-y-3">
            {daysOfWeek.map((day: string) => {
              const ds = formData.daySchedules[day];
              const isEnabled = ds?.enabled || false;
              return (
                <div key={day} className={`border rounded-lg p-4 transition-colors ${isEnabled ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : 'bg-muted/20'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox id={`day-${day}`} checked={isEnabled} onCheckedChange={(checked) => toggleDay(day, checked as boolean)} />
                      <Label htmlFor={`day-${day}`} className="font-medium cursor-pointer">{day}</Label>
                    </div>
                    {isEnabled && <Badge className="bg-blue-600 text-white dark:bg-blue-700">Activo</Badge>}
                  </div>
                  {isEnabled && (
                    <div className="grid grid-cols-2 gap-4 pl-7">
                      <div>
                        <Label htmlFor={`start-${day}`} className="text-sm">Hora de Entrada</Label>
                        <Input id={`start-${day}`} type="time" value={ds.startTime} onChange={(e) => updateDayTime(day, 'startTime', e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor={`end-${day}`} className="text-sm">Hora de Salida</Label>
                        <Input id={`end-${day}`} type="time" value={ds.endTime} onChange={(e) => updateDayTime(day, 'endTime', e.target.value)} className="mt-1" />
                      </div>
                      {ds.startTime && ds.endTime && ds.startTime < ds.endTime && (
                        <div className="col-span-2">
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Total: {(() => {
                              const start = new Date(`2024-01-01T${ds.startTime}:00`);
                              const end = new Date(`2024-01-01T${ds.endTime}:00`);
                              return `${((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1)}h de trabajo`;
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {enabledDaysCount === 0 && <p className="text-sm text-red-600 mt-3">Debe habilitar al menos un día de trabajo</p>}
          {enabledDaysCount > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <CalendarDays className="w-4 h-4 inline mr-1" />
                Total de días laborales: {enabledDaysCount}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {schedule ? 'Actualizar' : 'Crear'} Horario
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
