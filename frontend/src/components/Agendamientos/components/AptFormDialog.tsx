import React, { useState, useEffect, useMemo } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { CalendarIcon, Clock, Loader2, User, Wrench, CalendarDays } from 'lucide-react';
import { format, parseISO, isBefore, startOfDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function AptFormDialog({ apt, date, clients, motorcycles, mechanics, services, horarios, existingAppointments, onSave, onOpenChange }: any) {
  const [form, setForm] = useState({
    date: apt?.date || (date ? format(date, 'yyyy-MM-dd') : ''),
    startTime: apt?.startTime || '',
    endTime: apt?.endTime || '',
    clientId: apt?.clientId?.toString() || '',
    motorcycleId: apt?.motorcycleId?.toString() || '',
    mechanicId: apt?.mechanicId?.toString() || '',
    serviceIds: apt?.serviceIds || [] as number[],
    notes: apt?.notes || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const daysMap: Record<number, string> = {
    1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo'
  };

  useEffect(() => {
    if (apt) {
      setForm({
        date: apt.date || '',
        startTime: apt.startTime || '',
        endTime: apt.endTime || '',
        clientId: apt.clientId?.toString() || '',
        motorcycleId: apt.motorcycleId?.toString() || '',
        mechanicId: apt.mechanicId?.toString() || '',
        serviceIds: apt.serviceIds || [],
        notes: apt.notes || ''
      });
    } else if (date) {
      setForm(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd'), startTime: '' }));
    }
  }, [apt, date]);

  const availableSlots = useMemo(() => {
    if (!form.mechanicId || !form.date) return [];

    const selectedDate = parseISO(form.date);
    if (isBefore(selectedDate, startOfDay(new Date()))) return [];

    const dayName = daysMap[selectedDate.getDay()];
    const mechanicSched = horarios.filter((h: any) =>
      h.ID_Empleado === parseInt(form.mechanicId) && h.Dia === dayName && h.Estado
    );

    if (mechanicSched.length === 0) return [];

    const slots: string[] = [];
    mechanicSched.forEach((sched: any) => {
      const startStr = sched.HoraEntrada || sched.Hora_entrada;
      const endStr = sched.HoraSalida || sched.Hora_salida;

      if (!startStr || !endStr) return;

      let current = parseInt(startStr.split(':')[0]);
      const end = parseInt(endStr.split(':')[0]);

      while (current < end) {
        const slotTime = `${current.toString().padStart(2, '0')}:00`;
        const slotEndTime = `${(current + 1).toString().padStart(2, '0')}:00`;

        if (isToday(selectedDate)) {
          const now = new Date();
          const currentHour = now.getHours();
          if (current < currentHour) {
            current++;
            continue;
          }
          if (current === currentHour && now.getMinutes() > 0) {
            current++;
            continue;
          }
        }

        const isOccupied = existingAppointments.some((a: any) =>
          a.mechanicId === parseInt(form.mechanicId) &&
          a.date === form.date &&
          a.id !== apt?.id &&
          ((slotTime >= a.startTime && slotTime < a.endTime) ||
            (slotEndTime > a.startTime && slotEndTime <= a.endTime))
        );

        if (!isOccupied) {
          slots.push(slotTime);
        }
        current++;
      }
    });

    return slots;
  }, [form.mechanicId, form.date, horarios, existingAppointments, apt]);

  const clientMotorcycles = motorcycles.filter((m: any) =>
    !form.clientId || m.ID_Cliente === parseInt(form.clientId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.motorcycleId || !form.mechanicId || !form.startTime) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    const [h, m] = form.startTime.split(':');
    const endTime = `${(parseInt(h) + 1).toString().padStart(2, '0')}:${m}`;

    setIsSaving(true);
    try {
      await onSave({ ...form, endTime });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleService = (id: number) => {
    setForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter((s: number) => s !== id)
        : [...prev.serviceIds, id]
    }));
  };

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
                {apt ? 'Editar Agendamiento' : 'Nuevo Agendamiento'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Reserva de servicio técnico</p>
          </div>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" /> Fecha Seleccionada
            </Label>
            <div className="w-full h-11 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white flex items-center shadow-sm">
              <span className="font-semibold capitalize">{form.date ? format(parseISO(form.date), 'EEEE, d MMMM yyyy', { locale: es }) : 'No seleccionada'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4" /> Cliente *
              </Label>
              <select
                value={form.clientId}
                onChange={e => setForm({ ...form, clientId: e.target.value, motorcycleId: '' })}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.1rem_1.1rem] bg-no-repeat"
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map((c: any) => (
                  <option key={c.ID_Cliente} value={c.ID_Cliente}>{c.Nombre} {c.Apellido || ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Motocicleta *</Label>
              <select
                value={form.motorcycleId}
                onChange={e => setForm({ ...form, motorcycleId: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.1rem_1.1rem] bg-no-repeat disabled:opacity-50"
                required
                disabled={!form.clientId}
              >
                <option value="">Seleccionar motocicleta...</option>
                {clientMotorcycles.map((m: any) => (
                  <option key={m.ID_Motocicleta} value={m.ID_Motocicleta}>
                    {m.Marca} {m.Modelo} — {m.Placa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mecánico *</Label>
              <select
                value={form.mechanicId}
                onChange={e => setForm({ ...form, mechanicId: e.target.value, startTime: '' })}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.1rem_1.1rem] bg-no-repeat"
                required
              >
                <option value="">Seleccionar mecánico...</option>
                {mechanics.map((m: any) => (
                  <option key={m.ID_Empleado} value={m.ID_Empleado}>{m.Nombre} {m.Apellido}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Horarios Disponibles *
              </Label>
              {form.mechanicId && form.date ? (
                availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {availableSlots.map(slot => (
                      <Button
                        key={slot}
                        type="button"
                        variant={form.startTime === slot ? "default" : "outline"}
                        className={cn("h-10 text-sm font-bold transition-all rounded-lg", form.startTime === slot ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400")}
                        onClick={() => setForm({ ...form, startTime: slot })}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">No hay horarios disponibles para este mecánico en la fecha seleccionada.</p>
                  </div>
                )
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {!form.mechanicId ? 'Seleccione un mecánico primero para ver disponibilidad.' : 'Seleccione una fecha primero.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {!apt && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/50">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Servicios a realizar</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
                {services.map((s: any) => {
                  const isSelected = form.serviceIds.includes(s.ID_Servicio);
                  return (
                    <label 
                      key={s.ID_Servicio} 
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                        isSelected 
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10" 
                          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-400"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleService(s.ID_Servicio)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="font-semibold text-sm truncate">{s.Nombre}</span>
                    </label>
                  );
                })}
                {services.length === 0 && <p className="text-xs text-slate-500 col-span-2">No hay servicios disponibles.</p>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notas / Observaciones</Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Detalles sobre el motivo de la cita..."
              className="min-h-[80px] rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-sm p-3 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
            />
          </div>

          {!apt && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Al crear este agendamiento, el sistema abrirá automáticamente una <strong className="font-bold">orden de reparación en estado "Esperando motocicleta"</strong> en el módulo principal.
              </p>
            </div>
          )}
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
            className="h-12 px-10 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            disabled={isSaving || !form.startTime || !form.clientId || !form.motorcycleId}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {apt ? 'Actualizar Agendamiento' : 'Crear Agendamiento'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
