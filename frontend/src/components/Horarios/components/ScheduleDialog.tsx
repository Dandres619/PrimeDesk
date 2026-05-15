import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Checkbox } from '../../ui/checkbox';
import { Badge } from '../../ui/badge';
import { Clock, CalendarDays, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ScheduleDialogProps {
  schedule: any;
  employees: any[];
  daysOfWeek: string[];
  onSave: (data: any) => void;
  onOpenChange?: (open: boolean) => void;
}

export function ScheduleDialog({ schedule, employees, daysOfWeek, onSave, onOpenChange }: ScheduleDialogProps) {
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
    <DialogContent 
      className={cn(
        "p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal",
        "max-w-2xl w-[95vw] bg-white dark:bg-slate-950"
      )}
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {schedule ? 'Editar Horario' : 'Nuevo Horario'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Configuración semanal</p>
          </div>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4" /> Mecánico
            </Label>
            <select
              id="employeeId"
              value={formData.employeeId}
              onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.1rem_1.1rem] bg-no-repeat disabled:opacity-50"
              disabled={!!schedule}
            >
              <option value="">Seleccionar mecánico...</option>
              {employees.map((emp: any) => (
                <option key={emp.ID_Empleado} value={emp.ID_Empleado.toString()}>
                  {emp.Nombre} {emp.Apellido}
                </option>
              ))}
            </select>
            {schedule && <p className="text-xs font-semibold text-slate-500 mt-1">El mecánico no se puede cambiar al editar un horario.</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Horarios por Día de la Semana
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-4">Seleccione los días laborables y configure el horario específico para cada día.</p>
            <div className="space-y-3">
              {daysOfWeek.map((day: string) => {
                const ds = formData.daySchedules[day];
                const isEnabled = ds?.enabled || false;
                return (
                  <div key={day} className={cn(
                    "border rounded-xl p-4 transition-all",
                    isEnabled 
                      ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm" 
                      : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800"
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id={`day-${day}`} 
                          checked={isEnabled} 
                          onCheckedChange={(checked) => toggleDay(day, checked as boolean)} 
                        />
                        <Label htmlFor={`day-${day}`} className={cn("font-bold cursor-pointer text-sm", isEnabled ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400")}>
                          {day}
                        </Label>
                      </div>
                      {isEnabled && <Badge className="bg-blue-600 text-white dark:bg-blue-700 border-none font-bold">Activo</Badge>}
                    </div>
                    {isEnabled && (
                      <div className="grid grid-cols-2 gap-4 pl-7 mt-4">
                        <div>
                          <Label htmlFor={`start-${day}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hora de Entrada</Label>
                          <Input 
                            id={`start-${day}`} 
                            type="time" 
                            value={ds.startTime} 
                            onChange={(e) => updateDayTime(day, 'startTime', e.target.value)} 
                            className="mt-1 h-10 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" 
                          />
                        </div>
                        <div>
                          <Label htmlFor={`end-${day}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hora de Salida</Label>
                          <Input 
                            id={`end-${day}`} 
                            type="time" 
                            value={ds.endTime} 
                            onChange={(e) => updateDayTime(day, 'endTime', e.target.value)} 
                            className="mt-1 h-10 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" 
                          />
                        </div>
                        {ds.startTime && ds.endTime && ds.startTime < ds.endTime && (
                          <div className="col-span-2 mt-1">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Jornada: {(() => {
                                const start = new Date(`2024-01-01T${ds.startTime}:00`);
                                const end = new Date(`2024-01-01T${ds.endTime}:00`);
                                return `${((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1)}h`;
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

            {enabledDaysCount === 0 && <p className="text-sm font-bold text-red-500 mt-3">Debe habilitar al menos un día de trabajo.</p>}
            {enabledDaysCount > 0 && (
              <div className="mt-4 p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
                  Total de días laborales en la semana: {enabledDaysCount}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange && onOpenChange(false)}
            className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="h-12 px-10 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {schedule ? 'Actualizar Horario' : 'Crear Horario'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
