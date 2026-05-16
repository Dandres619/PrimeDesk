import React, { useState, useEffect, useMemo } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { CalendarClock, Clock, Loader2, User, Wrench, Search, Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
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
  const [popovers, setPopovers] = useState({
    client: false,
    motorcycle: false,
    mechanic: false
  });
  const [search, setSearch] = useState({
    client: '',
    motorcycle: '',
    mechanic: ''
  });

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
    (!form.clientId || m.ID_Cliente === parseInt(form.clientId)) &&
    (m.Placa.toLowerCase().includes(search.motorcycle.toLowerCase()) ||
      m.Marca.toLowerCase().includes(search.motorcycle.toLowerCase()) ||
      m.Modelo.toLowerCase().includes(search.motorcycle.toLowerCase()))
  );

  const filteredClients = clients.filter((c: any) =>
    `${c.Nombre} ${c.Apellido}`.toLowerCase().includes(search.client.toLowerCase()) ||
    c.Documento.toString().includes(search.client)
  );

  const filteredMechanics = mechanics.filter((m: any) =>
    `${m.Nombre} ${m.Apellido}`.toLowerCase().includes(search.mechanic.toLowerCase()) ||
    m.Documento?.toString().includes(search.mechanic)
  );

  const selectedClient = clients.find((c: any) => c.ID_Cliente === parseInt(form.clientId));
  const selectedMoto = motorcycles.find((m: any) => m.ID_Motocicleta === parseInt(form.motorcycleId));
  const selectedMechanic = mechanics.find((m: any) => m.ID_Empleado === parseInt(form.mechanicId));

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
            <CalendarClock className="w-6 h-6 text-white" />
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
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <CalendarClock className="w-3.5 h-3.5 text-blue-500" /> Fecha
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
              <Popover open={popovers.client} onOpenChange={(open) => setPopovers({ ...popovers, client: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                      !form.clientId && "text-slate-500"
                    )}
                  >
                    <span className="truncate">
                      {selectedClient ? `${selectedClient.Nombre} ${selectedClient.Apellido}` : "Seleccionar cliente..."}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden" align="start">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input
                        className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                        placeholder="Buscar cliente..."
                        value={search.client}
                        onChange={(e) => setSearch({ ...search, client: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar">
                    {filteredClients.length === 0 ? (
                      <div className="py-6 px-2 text-center">
                        <p className="text-sm text-slate-500">No se encontraron clientes.</p>
                      </div>
                    ) : (
                      filteredClients.map((c: any) => (
                        <div
                          key={c.ID_Cliente}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                            "hover:bg-slate-50 dark:hover:bg-slate-900",
                            form.clientId === c.ID_Cliente.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                          )}
                          onClick={() => {
                            setForm({ ...form, clientId: c.ID_Cliente.toString(), motorcycleId: '' });
                            setPopovers({ ...popovers, client: false });
                            setSearch({ ...search, client: '' });
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", form.clientId === c.ID_Cliente.toString() ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span>{c.Nombre} {c.Apellido}</span>
                            <span className="text-[10px] opacity-60">CC: {c.Documento}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Motocicleta *</Label>
              <Popover open={popovers.motorcycle} onOpenChange={(open) => setPopovers({ ...popovers, motorcycle: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                      !form.motorcycleId && "text-slate-500"
                    )}
                    disabled={!form.clientId}
                  >
                    <span className="truncate">
                      {selectedMoto ? `${selectedMoto.Marca} ${selectedMoto.Modelo} — ${selectedMoto.Placa}` : "Seleccionar motocicleta..."}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden" align="start">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input
                        className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                        placeholder="Buscar placa o modelo..."
                        value={search.motorcycle}
                        onChange={(e) => setSearch({ ...search, motorcycle: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar">
                    {clientMotorcycles.length === 0 ? (
                      <div className="py-6 px-2 text-center">
                        <p className="text-sm text-slate-500">No se encontraron motocicletas.</p>
                      </div>
                    ) : (
                      clientMotorcycles.map((m: any) => (
                        <div
                          key={m.ID_Motocicleta}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                            "hover:bg-slate-50 dark:hover:bg-slate-900",
                            form.motorcycleId === m.ID_Motocicleta.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                          )}
                          onClick={() => {
                            setForm({ ...form, motorcycleId: m.ID_Motocicleta.toString() });
                            setPopovers({ ...popovers, motorcycle: false });
                            setSearch({ ...search, motorcycle: '' });
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", form.motorcycleId === m.ID_Motocicleta.toString() ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span>{m.Marca} {m.Modelo}</span>
                            <span className="text-[10px] opacity-60">Placa: {m.Placa}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mecánico *</Label>
              <Popover open={popovers.mechanic} onOpenChange={(open) => setPopovers({ ...popovers, mechanic: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                      !form.mechanicId && "text-slate-500"
                    )}
                  >
                    <span className="truncate">
                      {selectedMechanic ? `${selectedMechanic.Nombre} ${selectedMechanic.Apellido}` : "Seleccionar mecánico..."}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden" align="start">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input
                        className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                        placeholder="Buscar mecánico..."
                        value={search.mechanic}
                        onChange={(e) => setSearch({ ...search, mechanic: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar">
                    {filteredMechanics.length === 0 ? (
                      <div className="py-6 px-2 text-center">
                        <p className="text-sm text-slate-500">No se encontraron mecánicos.</p>
                      </div>
                    ) : (
                      filteredMechanics.map((m: any) => (
                        <div
                          key={m.ID_Empleado}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                            "hover:bg-slate-50 dark:hover:bg-slate-900",
                            form.mechanicId === m.ID_Empleado.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                          )}
                          onClick={() => {
                            setForm({ ...form, mechanicId: m.ID_Empleado.toString(), startTime: '' });
                            setPopovers({ ...popovers, mechanic: false });
                            setSearch({ ...search, mechanic: '' });
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", form.mechanicId === m.ID_Empleado.toString() ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col text-left">
                            <span className="font-bold">{m.Nombre} {m.Apellido}</span>
                            <span className="text-[10px] opacity-60 font-black uppercase">CC: {m.Documento || 'S/N'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
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
