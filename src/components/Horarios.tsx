import React, { useState } from 'react';
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
import { Plus, Search, Edit, Trash2, Eye, Clock, Users, CheckCircle, XCircle, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

const mechanics = [
  { id: 1, name: 'Carlos Méndez' },
  { id: 2, name: 'Luis García' },
  { id: 3, name: 'José Rodríguez' },
  { id: 4, name: 'Pedro Martínez' },
  { id: 5, name: 'Miguel Torres' }
];

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const initialSchedules = [
  { id: 1, mechanicId: 1, mechanicName: 'Carlos Méndez', daySchedules: { 'Lunes': { enabled: true, startTime: '07:00', endTime: '17:00' }, 'Martes': { enabled: true, startTime: '08:00', endTime: '18:00' }, 'Miércoles': { enabled: true, startTime: '07:00', endTime: '17:00' }, 'Jueves': { enabled: true, startTime: '08:00', endTime: '17:00' }, 'Viernes': { enabled: true, startTime: '07:00', endTime: '15:00' } }, status: 'Activo', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
  { id: 2, mechanicId: 2, mechanicName: 'Luis García', daySchedules: { 'Lunes': { enabled: true, startTime: '09:00', endTime: '18:00' }, 'Martes': { enabled: false, startTime: '09:00', endTime: '18:00' }, 'Miércoles': { enabled: true, startTime: '09:00', endTime: '18:00' }, 'Jueves': { enabled: false, startTime: '09:00', endTime: '18:00' }, 'Viernes': { enabled: true, startTime: '09:00', endTime: '18:00' } }, status: 'Activo', createdAt: '2024-01-12', updatedAt: '2024-01-20' },
  { id: 3, mechanicId: 3, mechanicName: 'José Rodríguez', daySchedules: { 'Lunes': { enabled: false, startTime: '07:30', endTime: '16:30' }, 'Martes': { enabled: true, startTime: '07:30', endTime: '16:30' }, 'Miércoles': { enabled: false, startTime: '07:30', endTime: '16:30' }, 'Jueves': { enabled: true, startTime: '06:00', endTime: '19:00' }, 'Viernes': { enabled: false, startTime: '07:30', endTime: '16:30' } }, status: 'Activo', createdAt: '2024-01-10', updatedAt: '2024-01-18' }
];

export function Horarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [viewingSchedule, setViewingSchedule] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => {} });
  const [schedules, setSchedules] = useState(initialSchedules);

  const getEnabledDays = (s: any) => daysOfWeek.filter(d => s.daySchedules[d]?.enabled);
  const formatDays = (s: any) => { const enabled = getEnabledDays(s); return enabled.length === 5 ? 'Lunes a Viernes' : enabled.length <= 2 ? enabled.join(', ') : `${enabled.slice(0, 2).join(', ')} +${enabled.length - 2}`; };
  
  const filteredSchedules = schedules.filter(s => s.mechanicName.toLowerCase().includes(searchTerm.toLowerCase()) || getEnabledDays(s).some(d => d.toLowerCase().includes(searchTerm.toLowerCase())));
  const totalPages = Math.ceil(filteredSchedules.length / 2);
  const paginatedSchedules = filteredSchedules.slice((currentPage - 1) * 2, currentPage * 2);

  const handleSave = (data: any) => {
    const mechanic = mechanics.find(m => m.id === parseInt(data.mechanicId));
    const now = new Date().toISOString().split('T')[0];
    editingSchedule ? setSchedules(schedules.map(s => s.id === editingSchedule.id ? { ...s, mechanicId: parseInt(data.mechanicId), mechanicName: mechanic?.name || '', daySchedules: data.daySchedules, updatedAt: now } : s)) : setSchedules([...schedules, { id: Date.now(), mechanicId: parseInt(data.mechanicId), mechanicName: mechanic?.name || '', daySchedules: data.daySchedules, status: 'Activo', createdAt: now, updatedAt: now }]);
    toast.success(`Horario ${editingSchedule ? 'actualizado' : 'creado'} exitosamente`);
    setIsDialogOpen(false);
    setEditingSchedule(null);
  };

  const stats = [
    { icon: Clock, color: 'text-blue-600', value: schedules.length, label: 'Total Horarios' },
    { icon: CheckCircle, color: 'text-green-600', value: schedules.filter(s => s.status === 'Activo').length, label: 'Activos' },
    { icon: XCircle, color: 'text-red-600', value: schedules.filter(s => s.status === 'Inactivo').length, label: 'Inactivos' },
    { icon: Users, color: 'text-purple-600', value: mechanics.length, label: 'Mecánicos' }
  ];

  const actions = [
    { icon: Eye, onClick: (s: any) => setViewingSchedule(s), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30' },
    { icon: Edit, onClick: (s: any) => { setEditingSchedule(s); setIsDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30' },
    { icon: Trash2, onClick: (s: any) => setConfirmDialog({ open: true, title: 'Eliminar Horario', description: '¿Está seguro de que desea eliminar este horario? Esta acción no se puede deshacer.', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => { setSchedules(schedules.filter(sc => sc.id !== s.id)); toast.success('Horario eliminado exitosamente'); } }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar horarios..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSchedule(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Horario
            </Button>
          </DialogTrigger>
          <ScheduleDialog schedule={editingSchedule} mechanics={mechanics} daysOfWeek={daysOfWeek} onSave={handleSave} />
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
              {paginatedSchedules.map(s => {
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
                          const daySchedule = s.daySchedules[day];
                          return (
                            <p key={day} className="text-sm">
                              <span className="font-medium">{day}:</span> {daySchedule.startTime} - {daySchedule.endTime}
                            </p>
                          );
                        })}
                        {enabledDays.length > 2 && <p className="text-sm text-muted-foreground">+{enabledDays.length - 2} más</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={s.status === 'Activo'} onCheckedChange={() => { const now = new Date().toISOString().split('T')[0]; setSchedules(schedules.map(sc => sc.id === s.id ? { ...sc, status: sc.status === 'Activo' ? 'Inactivo' : 'Activo', updatedAt: now } : sc)); toast.success('Estado del horario actualizado'); }} />
                        <span className="text-sm">{s.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {actions.map((a, i) => (
                          <Button key={i} size="sm" variant="ghost" onClick={() => a.onClick(s)} className={a.color}>
                            <a.icon className="w-4 h-4" />
                          </Button>
                        ))}
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
                  <p className="font-medium text-foreground">{viewingSchedule.mechanicName}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge className={viewingSchedule.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300'}>{viewingSchedule.status}</Badge>
                </div>
              </div>
              <div>
                <Label className="mb-3 block">Horarios por Día</Label>
                <div className="space-y-3">
                  {daysOfWeek.map(day => {
                    const daySchedule = viewingSchedule.daySchedules[day];
                    if (!daySchedule?.enabled) return null;
                    const start = new Date(`2024-01-01 ${daySchedule.startTime}`);
                    const end = new Date(`2024-01-01 ${daySchedule.endTime}`);
                    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    return (
                      <div key={day} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300">{day}</Badge>
                          <div>
                            <p className="font-medium text-foreground">{daySchedule.startTime} - {daySchedule.endTime}</p>
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

function ScheduleDialog({ schedule, mechanics, daysOfWeek, onSave }: any) {
  const getInitialDaySchedules = () => {
    if (schedule?.daySchedules) return schedule.daySchedules;
    const initial: any = {};
    daysOfWeek.forEach((day: string) => { initial[day] = { enabled: false, startTime: '08:00', endTime: '17:00' }; });
    return initial;
  };

  const [formData, setFormData] = useState({ mechanicId: schedule?.mechanicId?.toString() || '', daySchedules: getInitialDaySchedules() });

  React.useEffect(() => {
    if (schedule) setFormData({ mechanicId: schedule.mechanicId?.toString() || '', daySchedules: schedule.daySchedules || getInitialDaySchedules() });
  }, [schedule]);

  const toggleDay = (dayId: string, enabled: boolean) => setFormData(prev => ({ ...prev, daySchedules: { ...prev.daySchedules, [dayId]: { ...prev.daySchedules[dayId], enabled } } }));
  const updateDayTime = (dayId: string, field: 'startTime' | 'endTime', value: string) => setFormData(prev => ({ ...prev, daySchedules: { ...prev.daySchedules, [dayId]: { ...prev.daySchedules[dayId], [field]: value } } }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mechanicId) { toast.error('Por favor seleccione un mecánico'); return; }
    const hasEnabledDay = Object.values(formData.daySchedules).some((day: any) => day.enabled);
    if (!hasEnabledDay) { toast.error('Debe habilitar al menos un día de trabajo'); return; }
    for (const [dayName, daySchedule] of Object.entries(formData.daySchedules)) {
      const ds = daySchedule as any;
      if (ds.enabled) {
        if (!ds.startTime || !ds.endTime) { toast.error(`Por favor complete los horarios para ${dayName}`); return; }
        if (ds.startTime >= ds.endTime) { toast.error(`La hora de inicio debe ser menor que la hora de fin en ${dayName}`); return; }
      }
    }
    onSave(formData);
  };

  const enabledDaysCount = Object.values(formData.daySchedules).filter((day: any) => day.enabled).length;

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{schedule ? 'Editar Horario' : 'Nuevo Horario'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="mechanicId">Mecánico *</Label>
          <select id="mechanicId" value={formData.mechanicId} onChange={(e) => setFormData(prev => ({ ...prev, mechanicId: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground" required>
            <option value="">Seleccionar mecánico</option>
            {mechanics.map((m: any) => <option key={m.id} value={m.id.toString()}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <Label className="mb-3 block">Horarios por Día de la Semana *</Label>
          <p className="text-sm text-muted-foreground mb-4">Seleccione los días laborables y configure el horario específico para cada día</p>
          <div className="space-y-4">
            {daysOfWeek.map(day => {
              const daySchedule = formData.daySchedules[day];
              const isEnabled = daySchedule?.enabled || false;
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
                        <Input id={`start-${day}`} type="time" value={daySchedule.startTime} onChange={(e) => updateDayTime(day, 'startTime', e.target.value)} className="mt-1" required />
                      </div>
                      <div>
                        <Label htmlFor={`end-${day}`} className="text-sm">Hora de Salida</Label>
                        <Input id={`end-${day}`} type="time" value={daySchedule.endTime} onChange={(e) => updateDayTime(day, 'endTime', e.target.value)} className="mt-1" required />
                      </div>
                      {daySchedule.startTime && daySchedule.endTime && (
                        <div className="col-span-2">
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Total: {(() => { const start = new Date(`2024-01-01 ${daySchedule.startTime}`); const end = new Date(`2024-01-01 ${daySchedule.endTime}`); const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60); return `${hours}h de trabajo`; })()}
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
        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {schedule ? 'Actualizar' : 'Crear'} Horario
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
