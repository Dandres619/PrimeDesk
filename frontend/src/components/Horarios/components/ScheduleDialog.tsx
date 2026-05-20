import React, { useState, useEffect, useMemo } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Checkbox } from '../../ui/checkbox';
import { Badge } from '../../ui/badge';
import { AlarmClock, CalendarDays, Loader2, User, Search, Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
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
    const initial: any = {};
    daysOfWeek.forEach((day: string) => {
      const existing = schedule?.daySchedules?.[day];
      initial[day] = {
        enabled: existing?.enabled || false,
        startTime: existing?.startTime || '08:00',
        endTime: existing?.endTime || '17:00'
      };
    });
    return initial;
  };

  const [formData, setFormData] = useState({
    employeeId: schedule?.id?.toString() || '',
    daySchedules: getInitialDaySchedules()
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isEmployeePopoverOpen, setIsEmployeePopoverOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');

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
      setEmployeeSearch('');
    }
  }, [schedule]);

  const filteredEmployees = employees.filter((emp: any) =>
    `${emp.Nombre} ${emp.Apellido}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.Documento?.toString().includes(employeeSearch)
  );

  const selectedEmployee = employees.find((emp: any) => emp.ID_Empleado.toString() === formData.employeeId);

  const toggleDay = (day: string, enabled: boolean) =>
    setFormData(prev => ({
      ...prev,
      daySchedules: {
        ...prev.daySchedules,
        [day]: {
          startTime: '08:00',
          endTime: '17:00',
          ...prev.daySchedules[day],
          enabled
        }
      }
    }));

  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2024-01-01T${startTime}:00`);
    let end = new Date(`2024-01-01T${endTime}:00`);
    if (end <= start) {
      end = new Date(`2024-01-02T${endTime}:00`);
    }
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

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

        const duration = calculateDuration(d.startTime, d.endTime);
        if (duration > 12) {
          toast.error(`La jornada de ${dayName} no puede superar las 12 horas`);
          return;
        }
        if (duration < 5) {
          toast.error(`La jornada de ${dayName} debe ser de al menos 5 horas`);
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
            <AlarmClock className="w-6 h-6 text-white" />
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
            <Popover open={isEmployeePopoverOpen} onOpenChange={setIsEmployeePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                    !formData.employeeId && "text-slate-500"
                  )}
                  disabled={!!schedule}
                >
                  <span className="truncate">
                    {selectedEmployee ? `${selectedEmployee.Nombre} ${selectedEmployee.Apellido}` : "Seleccionar mecánico..."}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
                align="start"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500 dark:text-white"
                      placeholder="Buscar mecánico..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div
                  className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {filteredEmployees.length === 0 ? (
                    <div className="py-6 px-2 text-center">
                      <p className="text-sm text-slate-500">No se encontraron mecánicos.</p>
                    </div>
                  ) : (
                    filteredEmployees.map((emp: any) => (
                      <div
                        key={emp.ID_Empleado}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                          "hover:bg-slate-50 dark:hover:bg-slate-900",
                          formData.employeeId === emp.ID_Empleado.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                        )}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, employeeId: emp.ID_Empleado.toString() }));
                          setIsEmployeePopoverOpen(false);
                          setEmployeeSearch('');
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", formData.employeeId === emp.ID_Empleado.toString() ? "opacity-100" : "opacity-0")} />
                        <div className="flex flex-col text-left">
                          <span className="font-bold">{emp.Nombre} {emp.Apellido}</span>
                          <span className="text-[10px] opacity-60">CC: {emp.Documento || 'S/N'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {schedule && <p className="text-xs font-semibold text-slate-500 mt-1">El mecánico no se puede cambiar al editar un horario.</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <AlarmClock className="w-4 h-4 text-blue-600" /> Horarios por Día de la Semana
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
                          <TimePickerInput
                            id={`start-${day}`}
                            value={ds.startTime}
                            onChange={(value) => updateDayTime(day, 'startTime', value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`end-${day}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hora de Salida</Label>
                          <TimePickerInput
                            id={`end-${day}`}
                            value={ds.endTime}
                            onChange={(value) => updateDayTime(day, 'endTime', value)}
                          />
                        </div>
                        {ds.startTime && ds.endTime && (
                          <div className="col-span-2 mt-1">
                            {(() => {
                              const duration = calculateDuration(ds.startTime, ds.endTime);
                              const isTooLong = duration > 12;
                              const isTooShort = duration < 5;
                              const isInvalid = isTooLong || isTooShort;
                              return (
                                <>
                                  {isTooLong && (
                                    <p className="text-[11px] font-bold text-red-500 mb-1">
                                      La jornada no puede superar las 12 horas
                                    </p>
                                  )}
                                  {isTooShort && (
                                    <p className="text-[11px] font-bold text-red-500 mb-1">
                                      La jornada debe ser de al menos 5 horas
                                    </p>
                                  )}
                                  <p className={cn(
                                    "text-xs font-bold flex items-center gap-1",
                                    isInvalid ? "text-red-500" : "text-blue-600 dark:text-blue-400"
                                  )}>
                                    <AlarmClock className="w-3 h-3" />
                                    Jornada: {duration.toFixed(1)}h {ds.startTime >= ds.endTime ? '(Horario nocturno)' : ''}
                                  </p>
                                </>
                              );
                            })()}
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

function TimePickerInput({
  id,
  value,
  onChange,
  className
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'mañana' | 'tarde' | 'noche'>('mañana');

  useEffect(() => {
    if (value) {
      const hour = parseInt(value.split(':')[0]);
      if (hour >= 6 && hour < 12) {
        setSelectedSection('mañana');
      } else if (hour >= 12 && hour < 18) {
        setSelectedSection('tarde');
      } else if (hour >= 18 && hour < 24) {
        setSelectedSection('noche');
      }
    }
  }, [value]);

  const timesList = useMemo(() => {
    const times: string[] = [];
    for (let h = 6; h < 24; h++) {
      for (let m = 0; m < 60; m += 10) {
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return times;
  }, []);

  const filteredTimes = useMemo(() => {
    return timesList.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      if (selectedSection === 'mañana') return hour >= 6 && hour < 12;
      if (selectedSection === 'tarde') return hour >= 12 && hour < 18;
      return hour >= 18 && hour < 24;
    });
  }, [selectedSection, timesList]);

  const formatTime12h = (timeStr: string) => {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    if (!hStr || !mStr) return timeStr;
    const h = parseInt(hStr);
    const m = parseInt(mStr);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative mt-1 flex items-center w-full cursor-pointer">
          <Input
            id={id}
            type="text"
            value={value}
            readOnly
            className={cn("pr-10 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 w-full h-10 text-sm cursor-pointer", className)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pointer-events-none"
          >
            <AlarmClock className="h-4 w-4" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto flex flex-col bg-white dark:bg-slate-950"
        align="end"
      >
        <div className="flex border-b border-slate-100 dark:border-slate-800 p-1 gap-1 bg-slate-50 dark:bg-slate-900 shrink-0">
          {(['mañana', 'tarde', 'noche'] as const).map((section) => (
            <button
              key={section}
              type="button"
              className={cn(
                "flex-1 py-1 px-1 text-[10px] font-black rounded-lg transition-all capitalize",
                selectedSection === section
                  ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800/50"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              onClick={() => setSelectedSection(section)}
            >
              {section}
            </button>
          ))}
        </div>
        <div
          className="max-h-[160px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar flex-1"
          onWheel={(e) => e.stopPropagation()}
        >
          {filteredTimes.map(slot => (
            <div
              key={slot}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-1.5 text-xs outline-none transition-colors",
                "hover:bg-slate-50 dark:hover:bg-slate-900",
                value === slot && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
              )}
              onClick={() => {
                onChange(slot);
                setIsOpen(false);
              }}
            >
              <Check className={cn("mr-2 h-3.5 w-3.5", value === slot ? "opacity-100" : "opacity-0")} />
              <span className="uppercase text-[11px] font-bold">{formatTime12h(slot)}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
