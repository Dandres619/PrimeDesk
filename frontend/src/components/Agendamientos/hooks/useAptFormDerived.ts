import { useMemo, useEffect } from 'react';
import { parseISO, format, isToday } from 'date-fns';

const daysMap: Record<number, string> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo'
};

export function useAptFormDerived({
  form, setForm, search, servicesSearch, services, mechanics, horarios, existingAppointments, apt, novedades,
  clients, motorcycles, selectedSection
}: any) {
  
  const filteredServices = useMemo(() => {
    const q = servicesSearch.toLowerCase().trim();
    if (!q) return services;
    return services.filter((s: any) =>
      (s.Nombre || s.nombre)?.toLowerCase().includes(q)
    );
  }, [services, servicesSearch]);

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
      const endH = Math.floor(totalEndMins / 60);
      const endM = totalEndMins % 60;
      endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    }

    return { minutes: servicesMinutes, text, endTime };
  }, [form.serviceIds, form.startTime, services]);

  const totalPrice = useMemo(() => {
    return form.serviceIds.reduce((acc: number, id: number) => {
      const service = services.find((s: any) => s.ID_Servicio === id);
      const val = Number(service?.Precio || service?.precio || 0);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }, [form.serviceIds, services]);

  const availableMechanicsForTime = useMemo(() => {
    if (!form.date || !form.startTime) return [];

    const selectedDate = parseISO(form.date);
    const dayName = daysMap[selectedDate.getDay()];

    const addMinutesToTime = (timeStr: string, mins: number) => {
      if (!timeStr) return '';
      const [h, m] = timeStr.split(':').map(Number);
      const totalMins = h * 60 + m + mins;
      const endH = Math.floor(totalMins / 60);
      const endM = totalMins % 60;
      return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    };

    return mechanics.filter((mech: any) => {
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

      const isBusy = existingAppointments.some((a: any) => {
        if (a.mechanicId !== mech.ID_Empleado || a.date !== form.date || a.id === apt?.id) return false;

        const existStart = (a.startTime || '').slice(0, 5);
        const existEndBase = (a.endTime || '').slice(0, 5);
        const existBlockedUntil = addMinutesToTime(existEndBase, 20);

        const newStart = form.startTime;
        const newBlockedUntil = addMinutesToTime(form.startTime, durationData.minutes + 20);

        return newStart < existBlockedUntil && existStart < newBlockedUntil;
      });

      if (isBusy) return false;

      const hasNovelty = novedades.some((n: any) => {
        if (Number(n.ID_Empleado) !== Number(mech.ID_Empleado)) return false;

        let novDateStr = n.Dia;
        if (n.Dia instanceof Date) {
          novDateStr = n.Dia.toISOString().split('T')[0];
        } else if (novDateStr && typeof novDateStr === 'string') {
          novDateStr = novDateStr.substring(0, 10);
        }

        if (novDateStr !== form.date) return false;

        const novStart = n.HoraInicio || n.Hora_inicio || n.horainicio;
        const novEnd = n.HoraFin || n.Hora_fin || n.horafin;

        if (!novStart || !novEnd) return true;

        const ns = novStart.slice(0, 5);
        const ne = novEnd.slice(0, 5);

        const newStart = form.startTime;
        const newEnd = addMinutesToTime(form.startTime, durationData.minutes);

        return newStart < ne && ns < newEnd;
      });

      return !hasNovelty;
    });
  }, [form.date, form.startTime, mechanics, horarios, existingAppointments, apt, durationData.minutes, novedades]);

  useEffect(() => {
    if (durationData.endTime) {
      setForm((prev: any) => {
        if (prev.endTime !== durationData.endTime) {
          return { ...prev, endTime: durationData.endTime };
        }
        return prev;
      });
    }
  }, [durationData.endTime, setForm]);

  const clientMotorcycles = useMemo(() => motorcycles.filter((m: any) =>
    (!form.clientId || m.ID_Cliente === parseInt(form.clientId)) &&
    (m.Placa.toLowerCase().includes(search.motorcycle.toLowerCase()) ||
      m.Marca.toLowerCase().includes(search.motorcycle.toLowerCase()) ||
      m.Modelo.toLowerCase().includes(search.motorcycle.toLowerCase()))
  ), [motorcycles, form.clientId, search.motorcycle]);

  const filteredClients = useMemo(() => clients.filter((c: any) =>
    `${c.Nombre} ${c.Apellido}`.toLowerCase().includes(search.client.toLowerCase()) ||
    c.Documento.toString().includes(search.client)
  ), [clients, search.client]);

  const selectedClient = useMemo(() => clients.find((c: any) => c.ID_Cliente === parseInt(form.clientId)), [clients, form.clientId]);
  const selectedMoto = useMemo(() => motorcycles.find((m: any) => m.ID_Motocicleta === parseInt(form.motorcycleId)), [motorcycles, form.motorcycleId]);
  const selectedMechanic = useMemo(() => mechanics.find((m: any) => m.ID_Empleado === parseInt(form.mechanicId)), [mechanics, form.mechanicId]);

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
  }, [form.mechanicId, form.date, horarios]);

  const selectedTimeDisplay = useMemo(() => {
    if (!form.startTime) return 'Seleccionar hora de inicio...';
    const [h, m] = form.startTime.split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m), 0);
    return format(d, 'hh:mm a');
  }, [form.startTime]);

  const hasSectionPassed = useMemo(() => {
    const isDateToday = form.date ? isToday(parseISO(form.date)) : false;
    if (!isDateToday) return false;

    const nowTime = format(new Date(), 'HH:mm');
    if (selectedSection === 'mañana') return nowTime >= '12:00';
    if (selectedSection === 'tarde') return nowTime >= '18:00';
    return nowTime >= '23:50';
  }, [form.date, selectedSection]);

  const activeSlots = useMemo(() => {
    const sectionSlots = potentialStartTimes.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      if (selectedSection === 'mañana') return hour >= 6 && hour < 12;
      if (selectedSection === 'tarde') return hour >= 12 && hour < 18;
      return hour >= 18 && hour < 24;
    });

    const isDateToday = form.date ? isToday(parseISO(form.date)) : false;
    const nowTime = format(new Date(), 'HH:mm');

    const isMechanicAvailable = (mech: any, dateStr: string, startTime: string) => {
      const selectedDate = parseISO(dateStr);
      const dayName = daysMap[selectedDate.getDay()];

      const addMinutesToTime = (timeStr: string, mins: number) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':').map(Number);
        const totalMins = h * 60 + m + mins;
        const endH = Math.floor(totalMins / 60);
        const endM = totalMins % 60;
        return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
      };

      const hasSchedule = horarios.some((h: any) => {
        const entrada = (h.HoraEntrada || h.Hora_entrada || '00:00').slice(0, 5);
        const salida = (h.HoraSalida || h.Hora_salida || '23:59').slice(0, 5);
        return (
          h.ID_Empleado === mech.ID_Empleado &&
          h.Dia === dayName &&
          h.Estado &&
          startTime >= entrada &&
          startTime < salida
        );
      });
      if (!hasSchedule) return false;

      const isBusy = existingAppointments.some((a: any) => {
        if (a.mechanicId !== mech.ID_Empleado || a.date !== dateStr || a.id === apt?.id) return false;

        const existStart = (a.startTime || '').slice(0, 5);
        const existEndBase = (a.endTime || '').slice(0, 5);
        const existBlockedUntil = addMinutesToTime(existEndBase, 20);

        const newStart = startTime;
        const newBlockedUntil = addMinutesToTime(startTime, durationData.minutes + 20);

        return newStart < existBlockedUntil && existStart < newBlockedUntil;
      });
      if (isBusy) return false;

      const hasNovelty = novedades.some((n: any) => {
        if (Number(n.ID_Empleado) !== Number(mech.ID_Empleado)) return false;

        let novDateStr = n.Dia;
        if (n.Dia instanceof Date) {
          novDateStr = n.Dia.toISOString().split('T')[0];
        } else if (novDateStr && typeof novDateStr === 'string') {
          novDateStr = novDateStr.substring(0, 10);
        }

        if (novDateStr !== dateStr) return false;

        const novStart = n.HoraInicio || n.Hora_inicio || n.horainicio;
        const novEnd = n.HoraFin || n.Hora_fin || n.horafin;

        if (!novStart || !novEnd) return true;

        const ns = novStart.slice(0, 5);
        const ne = novEnd.slice(0, 5);

        const newStart = startTime;
        const newEnd = addMinutesToTime(startTime, durationData.minutes);

        return newStart < ne && ns < newEnd;
      });

      return !hasNovelty;
    };

    return sectionSlots.filter(slot => {
      if (isDateToday && slot < nowTime) {
        return false;
      }

      if (form.date) {
        const anyMechAvailable = mechanics.some((m: any) => isMechanicAvailable(m, form.date, slot));
        if (!anyMechAvailable) return false;
      }

      return true;
    });
  }, [potentialStartTimes, selectedSection, form.date, mechanics, horarios, existingAppointments, apt, durationData.minutes, novedades]);

  return {
    filteredServices,
    potentialStartTimes,
    durationData,
    totalPrice,
    availableMechanicsForTime,
    clientMotorcycles,
    filteredClients,
    selectedClient,
    selectedMoto,
    selectedMechanic,
    selectedMechanicSchedule,
    selectedTimeDisplay,
    hasSectionPassed,
    activeSlots
  };
}
