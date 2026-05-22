import React, { useState, useEffect, useMemo } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { AlertTriangle, Clock, CalendarDays, Loader2, User, FileText, AlarmClock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DatePickerInput } from '../../ui/DatePickerInput';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

interface NovedadDialogProps {
  schedule: any;
  onSave: (data: any) => Promise<void>;
  onOpenChange?: (open: boolean) => void;
}

export function NovedadDialog({ schedule, onSave, onOpenChange }: NovedadDialogProps) {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };



  const [activeTab, setActiveTab] = useState<'registrar' | 'ver'>('registrar');

  const [formData, setFormData] = useState({
    id_empleado: schedule?.id?.toString() || '',
    dia: getTodayString(),
    tipo: 'Ausencia parcial', // 'Ausencia parcial' or 'Ausencia total'
    hora_inicio: '12:00',
    hora_fin: '15:00',
    descripcion: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);



  const sixMonthsFromNow = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const [existingNovedades, setExistingNovedades] = useState<any[]>([]);
  const [isLoadingNovedades, setIsLoadingNovedades] = useState(false);

  useEffect(() => {
    if (schedule?.id) {
      setIsLoadingNovedades(true);
      const token = localStorage.getItem('token');
      const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
      fetch(`${API_URL}/novedades/empleado/${schedule.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setExistingNovedades(data);
          }
        })
        .catch(err => console.error('Error fetching novelties:', err))
        .finally(() => setIsLoadingNovedades(false));
    }
  }, [schedule]);

  const formatDiaKey = (diaVal: any) => {
    if (!diaVal) return '';
    try {
      const d = new Date(diaVal);
      if (isNaN(d.getTime())) return '';
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const hasDuplicateNovedad = useMemo(() => {
    if (!formData.dia) return false;
    return existingNovedades.some(n => {
      const existingDate = formatDiaKey(n.Dia || n.dia);
      return existingDate === formData.dia;
    });
  }, [formData.dia, existingNovedades]);

  const parseEnteredDate = (val: string): Date | null => {
    if (!val) return null;
    if (val.includes('-')) {
      const parts = val.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
        const dateObj = new Date(y, m - 1, d);
        return (dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d) ? dateObj : null;
      }
    } else if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
        const dateObj = new Date(y, m - 1, d);
        return (dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d) ? dateObj : null;
      }
    }
    return null;
  };

  const dateError = useMemo(() => {
    const val = formData.dia;
    if (!val) return 'La fecha de la novedad es requerida.';
    
    if (val.length < 10) {
      return 'Ingrese una fecha válida (DD/MM/AAAA).';
    }

    const parsedDate = parseEnteredDate(val);
    if (!parsedDate) {
      return 'La fecha ingresada no es válida.';
    }

    const compareDate = new Date(parsedDate);
    compareDate.setHours(0, 0, 0, 0);

    const todayCompare = new Date();
    todayCompare.setHours(0, 0, 0, 0);

    if (compareDate < todayCompare) {
      return 'La fecha de la novedad no puede ser anterior al día de hoy.';
    }

    const maxCompare = new Date();
    maxCompare.setMonth(maxCompare.getMonth() + 6);
    maxCompare.setHours(23, 59, 59, 999);

    if (compareDate > maxCompare) {
      return 'La fecha de la novedad no puede superar los 6 meses desde hoy.';
    }

    return null;
  }, [formData.dia]);

  const getDayName = (dateStr: string) => {
    if (!dateStr) return '';
    const parsedDate = parseEnteredDate(dateStr);
    if (!parsedDate) return '';
    const daysMap: Record<number, string> = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };
    return daysMap[parsedDate.getDay()];
  };

  const mechanicSchedule = useMemo(() => {
    if (!schedule || !formData.dia) return null;
    const dayName = getDayName(formData.dia);
    return schedule.daySchedules?.[dayName] || null;
  }, [schedule, formData.dia]);

  const isTodayDate = useMemo(() => {
    if (!formData.dia) return false;
    try {
      const today = new Date();
      const parsedDate = parseEnteredDate(formData.dia);
      if (!parsedDate) return false;
      return parsedDate.getDate() === today.getDate() &&
             parsedDate.getMonth() === today.getMonth() &&
             parsedDate.getFullYear() === today.getFullYear();
    } catch {
      return false;
    }
  }, [formData.dia]);

  const timeError = useMemo(() => {
    if (formData.tipo !== 'Ausencia parcial') return null;
    if (!formData.hora_inicio || !formData.hora_fin) return 'Las horas de inicio y fin son requeridas.';
    if (formData.hora_inicio >= formData.hora_fin) {
      return 'La hora de inicio debe ser anterior a la hora de fin.';
    }
    if (isTodayDate) {
      const now = new Date();
      const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (formData.hora_inicio < nowTime) {
        return 'La hora de inicio de la novedad no puede ser anterior a la hora actual.';
      }
    }
    if (mechanicSchedule) {
      if (!mechanicSchedule.enabled) {
        return 'El mecánico no tiene un horario laboral asignado para este día.';
      }
      if (formData.hora_inicio < mechanicSchedule.startTime) {
        return `El mecánico ${schedule?.mechanicName} inicia su turno a las ${formatTime12h(mechanicSchedule.startTime)} y esta novedad inicia a las ${formatTime12h(formData.hora_inicio)}. Elija otro horario.`;
      }
      if (formData.hora_fin > mechanicSchedule.endTime) {
        return `El mecánico ${schedule?.mechanicName} termina su turno a las ${formatTime12h(mechanicSchedule.endTime)} y esta novedad finaliza a las ${formatTime12h(formData.hora_fin)}. Elija otro horario.`;
      }
    }
    return null;
  }, [formData.tipo, formData.hora_inicio, formData.hora_fin, isTodayDate, mechanicSchedule, schedule]);

  const descripcionError = useMemo(() => {
    const val = formData.descripcion;
    if (val && val.length > 80) {
      return 'Máximo 80 caracteres';
    }
    return null;
  }, [formData.descripcion]);

  useEffect(() => {
    if (schedule) {
      setFormData(prev => ({
        ...prev,
        id_empleado: schedule.id?.toString() || ''
      }));
    }
  }, [schedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_empleado) {
      toast.error('Por favor seleccione un mecánico');
      return;
    }
    
    const hasErrors = dateError || hasDuplicateNovedad || (formData.tipo === 'Ausencia parcial' && timeError) || descripcionError;
    if (hasErrors) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id_empleado: parseInt(formData.id_empleado),
        dia: formData.dia,
        tipo: formData.tipo,
        hora_inicio: formData.tipo === 'Ausencia parcial' ? formData.hora_inicio : null,
        hora_fin: formData.tipo === 'Ausencia parcial' ? formData.hora_fin : null,
        descripcion: formData.descripcion || null
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DialogContent
      className={cn(
        "p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal",
        "max-w-xl w-[95vw] bg-white dark:bg-slate-950"
      )}
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Novedades de Horario
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
              Gestione la disponibilidad del mecánico
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-8 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
          <div className="flex border border-slate-100 dark:border-slate-800 p-1 gap-1 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('registrar')}
              className={cn(
                "flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                activeTab === 'registrar'
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <FileText className="w-4 h-4" />
              Registrar Novedad
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ver')}
              className={cn(
                "flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 relative",
                activeTab === 'ver'
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <Clock className="w-4 h-4" />
              Ver novedades
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
          {/* Mechanic static field */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" /> Mecánico Seleccionado
            </Label>
            <div className="h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center font-bold text-slate-950 dark:text-white">
              {schedule?.mechanicName || 'Cargando mecánico...'}
            </div>
          </div>

          {activeTab === 'registrar' ? (
            <>
              {/* Date Selector */}
              <div className="space-y-2 novedad-date-picker-wrap">
                <Label htmlFor="novedad-dia" className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" /> Día de la Novedad
                </Label>
                {hasDuplicateNovedad && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-800/30 text-xs text-red-600 dark:text-red-400 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                      <span className="font-bold">
                        Ya existe una novedad registrada para este día y no es posible crear otra.
                      </span>
                    </div>
                  </div>
                )}
                {dateError && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-800/30 text-xs text-red-600 dark:text-red-400 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                      <span className="font-semibold">
                        {dateError}
                      </span>
                    </div>
                  </div>
                )}
                <DatePickerInput
                  value={formData.dia}
                  onChange={(value) => setFormData(prev => ({ ...prev, dia: value }))}
                  minDate={todayDate}
                  maxDate={sixMonthsFromNow}
                  placeholder="Seleccionar día..."
                  error={!!dateError || hasDuplicateNovedad}
                />
                <style>{`
                  .dark .novedad-date-picker-wrap .bg-white {
                    background-color: rgba(2, 6, 23, 0.6) !important;
                  }
                  .dark .novedad-date-picker-wrap .bg-slate-50 {
                    background-color: rgba(99, 102, 241, 0.15) !important;
                  }
                  .dark .novedad-date-picker-wrap .border-slate-300,
                  .dark .novedad-date-picker-wrap .border-slate-200 {
                    border-color: rgba(99, 102, 241, 0.2) !important;
                  }
                  .dark .novedad-date-picker-wrap input {
                    color: #ffffff !important;
                  }
                  .dark .novedad-date-picker-wrap button {
                    color: #94a3b8 !important;
                    border-right-color: rgba(99, 102, 241, 0.2) !important;
                  }
                `}</style>
              </div>

              {/* Absence Type Switcher */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Tipo de Novedad
                </Label>
                <div className="flex border border-slate-200 dark:border-slate-800 p-1.5 gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  {(['Ausencia parcial', 'Ausencia total'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tipo: t }))}
                      className={cn(
                        "flex-1 py-2 px-3 text-xs font-black rounded-lg transition-all",
                        formData.tipo === t
                          ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800/50"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      )}
                    >
                      {t === 'Ausencia parcial' ? 'Horas Específicas' : 'Todo el Día'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time range picker (only for partial) */}
              {formData.tipo === 'Ausencia parcial' && (
                <div className="space-y-4">
                  {timeError && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-800/30 text-xs text-red-600 dark:text-red-400 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                        <span className="font-semibold">
                          {timeError}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 bg-blue-50/10 dark:bg-blue-950/10">
                    <div className="space-y-2">
                      <Label htmlFor="novedad-inicio" className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" /> Desde las
                      </Label>
                      <TimePickerInput
                        id="novedad-inicio"
                        value={formData.hora_inicio}
                        onChange={(value) => setFormData(prev => ({ ...prev, hora_inicio: value }))}
                        date={formData.dia}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="novedad-fin" className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" /> Hasta las
                      </Label>
                      <TimePickerInput
                        id="novedad-fin"
                        value={formData.hora_fin}
                        onChange={(value) => setFormData(prev => ({ ...prev, hora_fin: value }))}
                        date={formData.dia}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Description textarea */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="novedad-descripcion" className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" /> Razón (opcional)
                  </Label>
                  {descripcionError && <span className="text-red-500 text-[10px] font-medium">{descripcionError}</span>}
                </div>
                <Textarea
                  id="novedad-descripcion"
                  placeholder="Ej. Salida médica, capacitación, ausencia programada..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  className={cn(
                    "min-h-[100px] rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 custom-scrollbar p-3 text-sm",
                    descripcionError ? "border-red-500" : ""
                  )}
                />
              </div>

              {/* Info Warning Alert */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-blue-800 dark:text-blue-300">
                    ALERTA DE NOVEDAD
                  </p>
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-1">
                    Al registrar esta novedad, todos los agendamientos y reparaciones programados para este mecánico dentro del intervalo horario seleccionado se anularán automáticamente.
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Ver novedades view */
            <div className="space-y-4">
              {isLoadingNovedades ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-xs text-slate-500">Cargando novedades...</p>
                </div>
              ) : existingNovedades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                    <CalendarDays className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Sin novedades registradas</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Este mecánico está completamente disponible en sus horarios.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {existingNovedades.map((n) => {
                    const formattedDate = formatDiaKey(n.Dia || n.dia);
                    const dateObj = new Date(formattedDate + 'T00:00:00');
                    const readableDate = isNaN(dateObj.getTime())
                      ? formattedDate
                      : dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

                    const isTotal = (n.Tipo || n.tipo) === 'Ausencia total';

                    return (
                      <div
                        key={n.ID_Novedad || n.id_novedad}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 flex flex-col gap-2 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold capitalize text-slate-900 dark:text-white">
                            {readableDate}
                          </span>
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-full capitalize",
                            isTotal
                              ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                              : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                          )}>
                            {n.Tipo || n.tipo}
                          </span>
                        </div>

                        {!isTotal && (n.HoraInicio || n.HoraFin) && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span>
                              {formatTime12h(n.HoraInicio || n.hora_inicio)} - {formatTime12h(n.HoraFin || n.hora_fin)}
                            </span>
                          </div>
                        )}

                        {(n.Descripcion || n.descripcion) && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 mt-1 italic">
                            "{n.Descripcion || n.descripcion}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
          {activeTab === 'registrar' ? (
            <>
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
                className="h-12 px-10 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-xl shadow-xl shadow-blue-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Registrar Novedad
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => onOpenChange && onOpenChange(false)}
              className="h-11 px-8 w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl"
            >
              Cerrar
            </Button>
          )}
        </div>
      </form>
    </DialogContent>
  );
}

function TimePickerInput({
  id,
  value,
  onChange,
  className,
  date
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
  date?: string;
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

  const isTodayDate = useMemo(() => {
    if (!date) return false;
    try {
      const parseDate = date.includes('T') ? new Date(date) : new Date(date + 'T00:00:00');
      const today = new Date();
      return parseDate.getDate() === today.getDate() &&
             parseDate.getMonth() === today.getMonth() &&
             parseDate.getFullYear() === today.getFullYear();
    } catch {
      return false;
    }
  }, [date]);

  const activeSlots = useMemo(() => {
    const now = new Date();
    const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const sectionSlots = timesList.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      if (selectedSection === 'mañana') return hour >= 6 && hour < 12;
      if (selectedSection === 'tarde') return hour >= 12 && hour < 18;
      return hour >= 18 && hour < 24;
    });

    return sectionSlots.filter(slot => {
      if (isTodayDate && slot < nowTime) {
        return false;
      }
      return true;
    });
  }, [timesList, selectedSection, isTodayDate]);

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
          {activeSlots.length === 0 ? (
            <div className="py-6 px-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                La jornada de la {selectedSection === 'mañana' ? 'mañana' : selectedSection === 'tarde' ? 'tarde' : 'noche'} ya transcurrió para el día de hoy.
              </p>
            </div>
          ) : (
            activeSlots.map(slot => (
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
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function formatTime12h(timeStr: string) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  if (!hStr || !mStr) return timeStr;
  const h = parseInt(hStr);
  const m = parseInt(mStr);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}
