import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Checkbox } from '../../ui/checkbox';
import { Badge } from '../../ui/badge';
import { Clock, CalendarDays, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleDialogProps {
  schedule: any;
  employees: any[];
  daysOfWeek: string[];
  onSave: (data: any) => void;
}

export function ScheduleDialog({ schedule, employees, daysOfWeek, onSave }: ScheduleDialogProps) {
  const getInitialDaySchedules = () => {
    if (schedule?.daySchedules) return JSON.parse(JSON.stringify(schedule.daySchedules));
    const initial: any = {};
    daysOfWeek.forEach((day: string) => { 
      initial[day] = { enabled: false, startTime: '08:00', endTime: '17:00' }; 
    });
    return initial;
  };

  const [formData, setFormData] = useState({
    employeeId: schedule?.id?.toString() || '',
    daySchedules: getInitialDaySchedules()
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (schedule) {
      setFormData({
        employeeId: schedule.id?.toString() || '',
        daySchedules: JSON.parse(JSON.stringify(schedule.daySchedules || getInitialDaySchedules()))
      });
    } else {
      const initial: any = {};
      daysOfWeek.forEach((day: string) => { 
        initial[day] = { enabled: false, startTime: '08:00', endTime: '17:00' }; 
      });
      setFormData({ employeeId: '', daySchedules: initial });
    }
  }, [schedule]);

  const toggleDay = (day: string, enabled: boolean) =>
    setFormData(prev => ({ 
      ...prev, 
      daySchedules: { ...prev.daySchedules, [day]: { ...prev.daySchedules[day], enabled } } 
    }));

  const updateDayTime = (day: string, field: 'startTime' | 'endTime', value: string) =>
    setFormData(prev => ({ 
      ...prev, 
      daySchedules: { ...prev.daySchedules, [day]: { ...prev.daySchedules[day], [field]: value } } 
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) { 
      toast.error('Por favor seleccione un mecánico'); 
      return; 
    }
    const hasEnabled = Object.values(formData.daySchedules).some((d: any) => d.enabled);
    if (!hasEnabled) { 
      toast.error('Debe habilitar al menos un día de trabajo'); 
      return; 
    }
    
    for (const [dayName, ds] of Object.entries(formData.daySchedules)) {
      const d = ds as any;
      if (d.enabled) {
        if (!d.startTime || !d.endTime) { 
          toast.error(`Complete los horarios para ${dayName}`); 
          return; 
        }
        if (d.startTime >= d.endTime) { 
          toast.error(`Hora de inicio debe ser menor que la de fin en ${dayName}`); 
          return; 
        }
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
            <option value="" className="bg-background text-foreground">
              {schedule ? `${schedule.mechanicName}` : 'Seleccionar mecánico'}
            </option>
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
                    {isEnabled && <Badge className="bg-blue-600 text-white dark:bg-blue-700 border-none">Activo</Badge>}
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

        <DialogFooter className="flex justify-end gap-2 border-t pt-4">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {schedule ? 'Actualizar' : 'Crear'} Horario
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
