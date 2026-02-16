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
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Clock,
  Users,
  CheckCircle,
  XCircle,
  CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface Schedule {
  id: number;
  mechanicId: number;
  mechanicName: string;
  daySchedules: {
    [key: string]: DaySchedule;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function Horarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [viewingSchedule, setViewingSchedule] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: 'delete' | 'cancel' | 'default';
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'default',
    onConfirm: () => {}
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  // Datos de mecánicos (normalmente vendría de otro módulo)
  const mechanics = [
    { id: 1, name: 'Carlos Méndez' },
    { id: 2, name: 'Luis García' },
    { id: 3, name: 'José Rodríguez' },
    { id: 4, name: 'Pedro Martínez' },
    { id: 5, name: 'Miguel Torres' }
  ];

  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: 1,
      mechanicId: 1,
      mechanicName: 'Carlos Méndez',
      daySchedules: {
        'Lunes': { enabled: true, startTime: '07:00', endTime: '17:00' },
        'Martes': { enabled: true, startTime: '08:00', endTime: '18:00' },
        'Miércoles': { enabled: true, startTime: '07:00', endTime: '17:00' },
        'Jueves': { enabled: true, startTime: '08:00', endTime: '17:00' },
        'Viernes': { enabled: true, startTime: '07:00', endTime: '15:00' }
      },
      status: 'Activo',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      mechanicId: 2,
      mechanicName: 'Luis García',
      daySchedules: {
        'Lunes': { enabled: true, startTime: '09:00', endTime: '18:00' },
        'Martes': { enabled: false, startTime: '09:00', endTime: '18:00' },
        'Miércoles': { enabled: true, startTime: '09:00', endTime: '18:00' },
        'Jueves': { enabled: false, startTime: '09:00', endTime: '18:00' },
        'Viernes': { enabled: true, startTime: '09:00', endTime: '18:00' }
      },
      status: 'Activo',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-20'
    },
    {
      id: 3,
      mechanicId: 3,
      mechanicName: 'José Rodríguez',
      daySchedules: {
        'Lunes': { enabled: false, startTime: '07:30', endTime: '16:30' },
        'Martes': { enabled: true, startTime: '07:30', endTime: '16:30' },
        'Miércoles': { enabled: false, startTime: '07:30', endTime: '16:30' },
        'Jueves': { enabled: true, startTime: '06:00', endTime: '19:00' },
        'Viernes': { enabled: false, startTime: '07:30', endTime: '16:30' }
      },
      status: 'Activo',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    }
  ]);

  const daysOfWeek = [
    { id: 'Lunes', label: 'Lunes' },
    { id: 'Martes', label: 'Martes' },
    { id: 'Miércoles', label: 'Miércoles' },
    { id: 'Jueves', label: 'Jueves' },
    { id: 'Viernes', label: 'Viernes' }
  ];

  const getEnabledDays = (schedule: Schedule) => {
    return daysOfWeek.filter(day => schedule.daySchedules[day.id]?.enabled).map(d => d.id);
  };

  const filteredSchedules = schedules.filter(schedule => {
    const enabledDays = getEnabledDays(schedule);
    return (
      schedule.mechanicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enabledDays.some(day => day.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Paginación
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveSchedule = (scheduleData: any) => {
    const mechanic = mechanics.find(m => m.id === parseInt(scheduleData.mechanicId));
    
    if (editingSchedule) {
      setSchedules(schedules.map(schedule => 
        schedule.id === editingSchedule.id 
          ? { 
              ...schedule, 
              mechanicId: parseInt(scheduleData.mechanicId),
              mechanicName: mechanic?.name || '',
              daySchedules: scheduleData.daySchedules,
              updatedAt: new Date().toISOString().split('T')[0]
            } 
          : schedule
      ));
      toast.success('Horario actualizado exitosamente');
    } else {
      const newSchedule: Schedule = { 
        id: Date.now(), 
        mechanicId: parseInt(scheduleData.mechanicId),
        mechanicName: mechanic?.name || '',
        daySchedules: scheduleData.daySchedules,
        status: 'Activo',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setSchedules([...schedules, newSchedule]);
      toast.success('Horario creado exitosamente');
    }
    setIsDialogOpen(false);
    setEditingSchedule(null);
  };

  const toggleScheduleStatus = (scheduleId: number) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { 
            ...schedule, 
            status: schedule.status === 'Activo' ? 'Inactivo' : 'Activo',
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : schedule
    ));
    toast.success('Estado del horario actualizado');
  };

  const showDeleteConfirm = (scheduleId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Eliminar Horario',
      description: '¿Está seguro de que desea eliminar este horario? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'delete',
      onConfirm: () => deleteSchedule(scheduleId)
    });
  };

  const deleteSchedule = (scheduleId: number) => {
    setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
    toast.success('Horario eliminado exitosamente');
  };

  const getStatusColor = (status: string) => {
    return status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300';
  };

  const formatDays = (schedule: Schedule) => {
    const enabledDays = getEnabledDays(schedule);
    if (enabledDays.length === 5) return 'Lunes a Viernes';
    if (enabledDays.length <= 2) return enabledDays.join(', ');
    return `${enabledDays.slice(0, 2).join(', ')} +${enabledDays.length - 2}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar horarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSchedule(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Horario
            </Button>
          </DialogTrigger>
          <ScheduleDialog 
            schedule={editingSchedule} 
            mechanics={mechanics}
            daysOfWeek={daysOfWeek}
            onSave={handleSaveSchedule}
          />
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{schedules.length}</p>
              <p className="text-muted-foreground">Total Horarios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{schedules.filter(s => s.status === 'Activo').length}</p>
              <p className="text-muted-foreground">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="w-8 h-8 text-red-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{schedules.filter(s => s.status === 'Inactivo').length}</p>
              <p className="text-muted-foreground">Inactivos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{mechanics.length}</p>
              <p className="text-muted-foreground">Mecánicos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules Table */}
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
              {paginatedSchedules.map((schedule) => {
                const enabledDays = getEnabledDays(schedule);
                return (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{schedule.mechanicName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatDays(schedule)}</p>
                        <p className="text-sm text-muted-foreground">
                          {enabledDays.length} días laborales
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {enabledDays.slice(0, 2).map(day => {
                          const daySchedule = schedule.daySchedules[day];
                          return (
                            <p key={day} className="text-sm">
                              <span className="font-medium">{day}:</span> {daySchedule.startTime} - {daySchedule.endTime}
                            </p>
                          );
                        })}
                        {enabledDays.length > 2 && (
                          <p className="text-sm text-muted-foreground">
                            +{enabledDays.length - 2} más
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={schedule.status === 'Activo'}
                          onCheckedChange={() => toggleScheduleStatus(schedule.id)}
                        />
                        <span className="text-sm">
                          {schedule.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setViewingSchedule(schedule)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setEditingSchedule(schedule);
                            setIsDialogOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => showDeleteConfirm(schedule.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {/* Paginación */}
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                )}
                
                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => totalPages > 1 ? setCurrentPage(page) : undefined}
                      isActive={currentPage === page}
                      className={totalPages > 1 ? "cursor-pointer" : "cursor-default"}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Details Dialog */}
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
                  <Badge className={getStatusColor(viewingSchedule.status)}>
                    {viewingSchedule.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="mb-3 block">Horarios por Día</Label>
                <div className="space-y-3">
                  {daysOfWeek.map(day => {
                    const daySchedule = viewingSchedule.daySchedules[day.id];
                    if (!daySchedule?.enabled) return null;
                    
                    const start = new Date(`2024-01-01 ${daySchedule.startTime}`);
                    const end = new Date(`2024-01-01 ${daySchedule.endTime}`);
                    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    
                    return (
                      <div 
                        key={day.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300">
                            {day.label}
                          </Badge>
                          <div>
                            <p className="font-medium text-foreground">
                              {daySchedule.startTime} - {daySchedule.endTime}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {hours}h de trabajo
                            </p>
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}

function ScheduleDialog({ schedule, mechanics, daysOfWeek, onSave }: any) {
  const getInitialDaySchedules = () => {
    if (schedule?.daySchedules) {
      return schedule.daySchedules;
    }
    
    // Inicializar con todos los días deshabilitados
    const initial: { [key: string]: DaySchedule } = {};
    daysOfWeek.forEach((day: any) => {
      initial[day.id] = {
        enabled: false,
        startTime: '08:00',
        endTime: '17:00'
      };
    });
    return initial;
  };

  const [formData, setFormData] = useState({
    mechanicId: schedule?.mechanicId?.toString() || '',
    daySchedules: getInitialDaySchedules()
  });

  React.useEffect(() => {
    if (schedule) {
      setFormData({
        mechanicId: schedule.mechanicId?.toString() || '',
        daySchedules: schedule.daySchedules || getInitialDaySchedules()
      });
    }
  }, [schedule]);

  const toggleDay = (dayId: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      daySchedules: {
        ...prev.daySchedules,
        [dayId]: {
          ...prev.daySchedules[dayId],
          enabled
        }
      }
    }));
  };

  const updateDayTime = (dayId: string, field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      daySchedules: {
        ...prev.daySchedules,
        [dayId]: {
          ...prev.daySchedules[dayId],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mechanicId) {
      toast.error('Por favor seleccione un mecánico');
      return;
    }

    // Verificar que al menos un día esté habilitado
    const hasEnabledDay = Object.values(formData.daySchedules).some(day => day.enabled);
    if (!hasEnabledDay) {
      toast.error('Debe habilitar al menos un día de trabajo');
      return;
    }

    // Validar que cada día habilitado tenga horarios válidos
    for (const [dayName, daySchedule] of Object.entries(formData.daySchedules)) {
      if (daySchedule.enabled) {
        if (!daySchedule.startTime || !daySchedule.endTime) {
          toast.error(`Por favor complete los horarios para ${dayName}`);
          return;
        }
        if (daySchedule.startTime >= daySchedule.endTime) {
          toast.error(`La hora de inicio debe ser menor que la hora de fin en ${dayName}`);
          return;
        }
      }
    }

    onSave(formData);
  };

  const enabledDaysCount = Object.values(formData.daySchedules).filter(day => day.enabled).length;

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{schedule ? 'Editar Horario' : 'Nuevo Horario'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="mechanicId">Mecánico *</Label>
          <select
            id="mechanicId"
            value={formData.mechanicId}
            onChange={(e) => setFormData(prev => ({ ...prev, mechanicId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Seleccionar mecánico</option>
            {mechanics.map((mechanic: any) => (
              <option key={mechanic.id} value={mechanic.id.toString()}>
                {mechanic.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-3 block">Horarios por Día de la Semana *</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Seleccione los días laborables y configure el horario específico para cada día
          </p>
          
          <div className="space-y-4">
            {daysOfWeek.map((day: any) => {
              const daySchedule = formData.daySchedules[day.id];
              const isEnabled = daySchedule?.enabled || false;
              
              return (
                <div 
                  key={day.id} 
                  className={`border rounded-lg p-4 transition-colors ${
                    isEnabled ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : 'bg-muted/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`day-${day.id}`}
                        checked={isEnabled}
                        onCheckedChange={(checked) => toggleDay(day.id, checked as boolean)}
                      />
                      <Label 
                        htmlFor={`day-${day.id}`} 
                        className="font-medium cursor-pointer"
                      >
                        {day.label}
                      </Label>
                    </div>
                    {isEnabled && (
                      <Badge className="bg-blue-600 text-white dark:bg-blue-700">
                        Activo
                      </Badge>
                    )}
                  </div>
                  
                  {isEnabled && (
                    <div className="grid grid-cols-2 gap-4 pl-7">
                      <div>
                        <Label htmlFor={`start-${day.id}`} className="text-sm">
                          Hora de Entrada
                        </Label>
                        <Input
                          id={`start-${day.id}`}
                          type="time"
                          value={daySchedule.startTime}
                          onChange={(e) => updateDayTime(day.id, 'startTime', e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`end-${day.id}`} className="text-sm">
                          Hora de Salida
                        </Label>
                        <Input
                          id={`end-${day.id}`}
                          type="time"
                          value={daySchedule.endTime}
                          onChange={(e) => updateDayTime(day.id, 'endTime', e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      {daySchedule.startTime && daySchedule.endTime && (
                        <div className="col-span-2">
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Total: {(() => {
                              const start = new Date(`2024-01-01 ${daySchedule.startTime}`);
                              const end = new Date(`2024-01-01 ${daySchedule.endTime}`);
                              const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                              return `${hours}h de trabajo`;
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
          
          {enabledDaysCount === 0 && (
            <p className="text-sm text-red-600 mt-3">
              Debe habilitar al menos un día de trabajo
            </p>
          )}
          
          {enabledDaysCount > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <CalendarDays className="w-4 h-4 inline mr-1" />
                Total de días laborales: {enabledDaysCount}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {schedule ? 'Actualizar' : 'Crear'} Horario
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}