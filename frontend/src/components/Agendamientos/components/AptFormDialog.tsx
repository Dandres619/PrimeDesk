import React, { useState, useEffect, useMemo } from 'react';
import { PiMotorcycle } from 'react-icons/pi';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { CalendarClock, Clock, Loader2, User, Wrench, Search, Check, ChevronsUpDown, MessageSquare } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { format, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '../../ui/badge';

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
  const [selectedSection, setSelectedSection] = useState<'mañana' | 'tarde' | 'noche'>('mañana');
  const [showErrors, setShowErrors] = useState(false);
  const [popovers, setPopovers] = useState({
    client: false,
    motorcycle: false,
    mechanic: false,
    startTime: false
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
      setForm({
        date: format(date, 'yyyy-MM-dd'),
        startTime: '',
        endTime: '',
        clientId: '',
        motorcycleId: '',
        mechanicId: '',
        serviceIds: [],
        notes: ''
      });
      setShowErrors(false);
    }
  }, [apt, date]);

  useEffect(() => {
    if (popovers.startTime && form.startTime) {
      const timer = setTimeout(() => {
        const selectedEl = document.getElementById(`time-slot-${form.startTime}`);
        if (selectedEl) {
          selectedEl.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [popovers.startTime, form.startTime]);

  useEffect(() => {
    if (form.startTime) {
      const hour = parseInt(form.startTime.split(':')[0]);
      if (hour >= 6 && hour < 12) {
        setSelectedSection('mañana');
      } else if (hour >= 12 && hour < 18) {
        setSelectedSection('tarde');
      } else if (hour >= 18 && hour < 24) {
        setSelectedSection('noche');
      }
    }
  }, [form.startTime]);

  const potentialStartTimes = useMemo(() => {
    const times: string[] = [];
    const startHour = 6;
    const endHour = 24;
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += 10) {
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return times;
  }, []);

  const durationData = useMemo(() => {
    if (form.serviceIds.length === 0) return { minutes: 0, text: '0 min', endTime: form.startTime };

    const servicesMinutes = form.serviceIds.reduce((acc: number, id: number) => {
      const service = services.find((s: any) => s.ID_Servicio === id);
      return acc + (service?.Duracion || 0);
    }, 0);

    const hours = Math.floor(servicesMinutes / 60);
    const mins = servicesMinutes % 60;

    let text = '';
    if (hours > 0) text += `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    if (mins > 0) text += `${hours > 0 ? ' y ' : ''}${mins} min`;
    if (text === '') text = '0 min';

    let endTime = '';
    if (form.startTime) {
      const [h, m] = form.startTime.split(':').map(Number);
      const totalStartMins = h * 60 + m;
      const totalEndMins = totalStartMins + servicesMinutes;
      const endH = Math.floor(totalEndMins / 60) % 24;
      const endM = totalEndMins % 60;
      endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    }

    return { minutes: servicesMinutes, text, endTime };
  }, [form.serviceIds, form.startTime, services]);

  const availableMechanicsForTime = useMemo(() => {
    if (!form.date || !form.startTime) return [];

    const selectedDate = parseISO(form.date);
    const dayName = daysMap[selectedDate.getDay()];

    const addMinutesToTime = (timeStr: string, mins: number) => {
      if (!timeStr) return '';
      const [h, m] = timeStr.split(':').map(Number);
      const totalMins = h * 60 + m + mins;
      const endH = Math.floor(totalMins / 60) % 24;
      const endM = totalMins % 60;
      return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    };

    return mechanics.filter((mech: any) => {
      // 1. Check if mechanic is scheduled for this day
      const hasSchedule = horarios.some((h: any) => {
        const entrada = (h.HoraEntrada || h.Hora_entrada || '00:00').slice(0, 5);
        const salida = (h.HoraSalida || h.Hora_salida || '23:59').slice(0, 5);
        return (
          h.ID_Empleado === mech.ID_Empleado &&
          h.Dia === dayName &&
          h.Estado &&
          form.startTime >= entrada &&
          form.startTime < salida
        );
      });

      if (!hasSchedule) return false;

      // 2. Check for overlaps with existing appointments (considering 20-min mechanic margin after appointment end)
      const isBusy = existingAppointments.some((a: any) => {
        if (a.mechanicId !== mech.ID_Empleado || a.date !== form.date || a.id === apt?.id) return false;

        const existStart = (a.startTime || '').slice(0, 5);
        const existEndBase = (a.endTime || '').slice(0, 5);
        const existBlockedUntil = addMinutesToTime(existEndBase, 20);

        const newStart = form.startTime;
        const newBlockedUntil = addMinutesToTime(form.startTime, durationData.minutes + 20);

        return newStart < existBlockedUntil && existStart < newBlockedUntil;
      });

      return !isBusy;
    });
  }, [form.date, form.startTime, mechanics, horarios, existingAppointments, apt, durationData.minutes]);

  useEffect(() => {
    if (durationData.endTime && durationData.endTime !== form.endTime) {
      setForm(prev => ({ ...prev, endTime: durationData.endTime }));
    }
  }, [durationData.endTime]);

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


  const selectedClient = clients.find((c: any) => c.ID_Cliente === parseInt(form.clientId));
  const selectedMoto = motorcycles.find((m: any) => m.ID_Motocicleta === parseInt(form.motorcycleId));
  const selectedMechanic = mechanics.find((m: any) => m.ID_Empleado === parseInt(form.mechanicId));

  const selectedMechanicSchedule = useMemo(() => {
    if (!form.mechanicId || !form.date) return null;
    const selectedDate = parseISO(form.date);
    const dayName = daysMap[selectedDate.getDay()];
    const schedule = horarios.find((h: any) =>
      h.ID_Empleado === parseInt(form.mechanicId) &&
      h.Dia === dayName &&
      h.Estado
    );
    if (!schedule) return null;
    return {
      entrada: (schedule.HoraEntrada || schedule.Hora_entrada || '00:00').slice(0, 5),
      salida: (schedule.HoraSalida || schedule.Hora_salida || '23:59').slice(0, 5)
    };
  }, [form.mechanicId, form.date, horarios, daysMap]);

  const format12h = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const selectedTimeDisplay = useMemo(() => {
    if (!form.startTime) return 'Seleccionar hora de inicio...';
    const [h, m] = form.startTime.split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m), 0);
    return format(d, 'hh:mm a');
  }, [form.startTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (!form.clientId || !form.motorcycleId || !form.startTime || (!apt && form.serviceIds.length === 0) || !form.mechanicId) {
      toast.error('Por favor, complete todos los campos obligatorios.');
      return;
    }

    if (selectedMechanicSchedule && durationData.endTime > selectedMechanicSchedule.salida) {
      toast.error(`El mecánico ${selectedMechanic?.Nombre} termina su turno a las ${format12h(selectedMechanicSchedule.salida)}. Los servicios exceden su horario laboral.`);
      return;
    }

    const endTime = durationData.endTime;

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

  const handleCancel = () => {
    setForm({
      date: date ? format(date, 'yyyy-MM-dd') : '',
      startTime: '',
      endTime: '',
      clientId: '',
      motorcycleId: '',
      mechanicId: '',
      serviceIds: [],
      notes: ''
    });
    setShowErrors(false);
    setSearch({ client: '', motorcycle: '', mechanic: '' });
    if (onOpenChange) onOpenChange(false);
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
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Agenda de servicio técnico</p>
          </div>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-blue-500" /> Fecha
            </Label>
            <div className="w-full h-11 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white flex items-center shadow-sm">
              <span className="font-semibold capitalize">{form.date ? format(parseISO(form.date), 'EEEE, d MMMM yyyy', { locale: es }) : 'No seleccionada'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" /> Cliente *
                {showErrors && !form.clientId && <span className="text-[10px] text-red-500 font-bold ml-auto">Requerido</span>}
              </Label>
              <Popover open={popovers.client} onOpenChange={(open) => setPopovers({ ...popovers, client: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                      !form.clientId && "text-slate-500",
                      showErrors && !form.clientId && "border-red-500 ring-1 ring-red-500/20 bg-red-50/10"
                    )}
                  >
                    <span className="truncate">
                      {selectedClient ? `${selectedClient.Nombre} ${selectedClient.Apellido}` : "Seleccionar cliente..."}
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
                        className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                        placeholder="Buscar cliente..."
                        value={search.client}
                        onChange={(e) => setSearch({ ...search, client: e.target.value })}
                      />
                    </div>
                  </div>
                  <div
                    className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar"
                    onWheel={(e) => e.stopPropagation()}
                  >
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
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PiMotorcycle className="w-5 h-5 text-blue-500" /> Motocicleta *
                </div>
                {showErrors && !form.motorcycleId && <span className="text-[10px] text-red-500 font-bold">Requerido</span>}
              </Label>
              <Popover open={popovers.motorcycle} onOpenChange={(open) => setPopovers({ ...popovers, motorcycle: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                      !form.motorcycleId && "text-slate-500",
                      showErrors && !form.motorcycleId && "border-red-500 ring-1 ring-red-500/20 bg-red-50/10"
                    )}
                    disabled={!form.clientId}
                  >
                    <span className="truncate">
                      {selectedMoto ? `${selectedMoto.Placa} — ${selectedMoto.Marca} ${selectedMoto.Modelo}` : "Seleccionar motocicleta..."}
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
                        className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                        placeholder="Buscar placa o modelo..."
                        value={search.motorcycle}
                        onChange={(e) => setSearch({ ...search, motorcycle: e.target.value })}
                      />
                    </div>
                  </div>
                  <div
                    className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar"
                    onWheel={(e) => e.stopPropagation()}
                  >
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
                            <span>{m.Placa}</span>
                            <span className="text-[10px] opacity-60">{m.Marca} {m.Modelo}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Hora de Inicio *</div>
              {showErrors && !form.startTime && <span className="text-[10px] text-red-500 font-bold">Seleccione una hora</span>}
            </Label>

            <Popover open={popovers.startTime} onOpenChange={(open) => setPopovers({ ...popovers, startTime: open })}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between font-bold h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl transition-all",
                    !form.startTime && "text-slate-500 font-medium",
                    showErrors && !form.startTime && "border-red-500 ring-1 ring-red-500/20 bg-red-50/10"
                  )}
                >
                  <span className="truncate">
                    {selectedTimeDisplay}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto flex flex-col"
                align="start"
              >
                <div className="flex border-b border-slate-100 dark:border-slate-800 p-1 gap-1 bg-slate-50 dark:bg-slate-900 shrink-0">
                  {(['mañana', 'tarde', 'noche'] as const).map((section) => (
                    <button
                      key={section}
                      type="button"
                      className={cn(
                        "flex-1 py-1.5 px-3 text-xs font-black rounded-lg transition-all capitalize",
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
                  className="max-h-[200px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar flex-1"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {potentialStartTimes
                    .filter(slot => {
                      const hour = parseInt(slot.split(':')[0]);
                      if (selectedSection === 'mañana') return hour >= 6 && hour < 12;
                      if (selectedSection === 'tarde') return hour >= 12 && hour < 18;
                      return hour >= 18 && hour < 24;
                    })
                    .map(slot => {
                      const isPast = isToday(parseISO(form.date)) && slot < format(new Date(), 'HH:mm');
                      if (isPast) return null;

                      const [h, m] = slot.split(':');
                      const slotDate = new Date();
                      slotDate.setHours(parseInt(h), parseInt(m), 0);
                      const formattedSlot = format(slotDate, 'hh:mm a');

                      return (
                        <div
                          key={slot}
                          id={`time-slot-${slot}`}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                            "hover:bg-slate-50 dark:hover:bg-slate-900",
                            form.startTime === slot && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                          )}
                          onClick={() => {
                            setForm({ ...form, startTime: slot, mechanicId: '' });
                            setPopovers({ ...popovers, startTime: false });
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", form.startTime === slot ? "opacity-100" : "opacity-0")} />
                          <span className="uppercase">{formattedSlot}</span>
                        </div>
                      );
                    })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> Mecánico Disponible *</div>
                {showErrors && !form.mechanicId && <span className="text-[10px] text-red-500 font-bold">Requerido</span>}
              </Label>
              {!form.startTime ? (
                <Button
                  variant="outline"
                  disabled
                  className="w-full justify-between font-medium h-11 px-4 text-left bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-70"
                >
                  <span className="truncate">Primero seleccione la hora de inicio...</span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-30 ml-2" />
                </Button>
              ) : availableMechanicsForTime.length > 0 ? (
                <Popover open={popovers.mechanic} onOpenChange={(open) => setPopovers({ ...popovers, mechanic: open })}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                        !form.mechanicId && "text-slate-500",
                        showErrors && !form.mechanicId && "border-red-500 ring-1 ring-red-500/20 bg-red-50/10"
                      )}
                    >
                      <span className="truncate">
                        {selectedMechanic ? `${selectedMechanic.Nombre} ${selectedMechanic.Apellido}` : "Seleccionar mecánico disponible..."}
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
                          className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                          placeholder="Buscar mecánico..."
                          value={search.mechanic}
                          onChange={(e) => setSearch({ ...search, mechanic: e.target.value })}
                        />
                      </div>
                    </div>
                    <div
                      className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      {availableMechanicsForTime.map((m: any) => (
                        <div
                          key={m.ID_Empleado}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                            "hover:bg-slate-50 dark:hover:bg-slate-900",
                            form.mechanicId === m.ID_Empleado.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                          )}
                          onClick={() => {
                            setForm({ ...form, mechanicId: m.ID_Empleado.toString() });
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
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                  <p className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                    No hay ningún mecánico disponible a las {form.startTime} en esta fecha.
                  </p>
                </div>
              )}

              {selectedMechanicSchedule && durationData.endTime > selectedMechanicSchedule.salida && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 mt-2 text-left">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    ⚠️ El mecánico {selectedMechanic?.Nombre} {selectedMechanic?.Apellido} termina su turno a las {format12h(selectedMechanicSchedule.salida)} y este agendamiento finaliza a las {format12h(durationData.endTime)}. Elija otro mecánico o reduzca los servicios.
                  </p>
                </div>
              )}
            </div>
          </div>

          {!apt && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-500" /> Servicios a realizar *
                  {showErrors && form.serviceIds.length === 0 && <span className="text-[10px] text-red-500 font-bold">(Seleccione al menos uno)</span>}
                </Label>
                {form.serviceIds.length > 0 && (
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                    Duración: {durationData.text}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
                {services.map((s: any) => {
                  const isSelected = form.serviceIds.includes(s.ID_Servicio);
                  return (
                    <label
                      key={s.ID_Servicio}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                        isSelected
                          ? "bg-indigo-50 border-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-500 shadow-sm"
                          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleService(s.ID_Servicio)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={cn("font-bold text-sm truncate", isSelected ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-300")}>{s.Nombre}</span>
                        <span className={cn("text-[10px] font-semibold", isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500")}>
                          {s.Duracion} min
                        </span>
                      </div>
                    </label>
                  );
                })}
                {services.length === 0 && <p className="text-xs text-slate-500 col-span-2">No hay servicios disponibles.</p>}
              </div>

              {form.serviceIds.length > 0 && form.startTime && (
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-indigo-900 dark:text-indigo-100 uppercase">
                      Hora de finalización estimada: {durationData.endTime}
                    </p>
                    <p className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 opacity-80">
                      Hora de finalización estimada según los servicios seleccionados. La hora final puede ser antes o después de lo estimado.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-500" /> Observaciones <span className="font-normal text-xs text-slate-400">(opcional)</span></Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Detalles sobre el motivo del agendamiento..."
              className="min-h-[80px] rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-sm p-3 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
            />
          </div>

          {!apt && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Al crear este agendamiento, el sistema abrirá automáticamente una <strong className="font-bold">Reparación en estado "Esperando motocicleta"</strong> en el módulo de Reparaciones.
              </p>
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="h-12 px-10 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {apt ? 'Actualizar Agendamiento' : 'Crear Agendamiento'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
