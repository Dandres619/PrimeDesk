import { useMemo, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

const daysMap: Record<number, string> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo'
};

export function useReparacionDerived({
  formData, setFormData, search, servicesSearch, clients, motorcycles, mechanics, availableServices,
  selectedSection, setSelectedSection, horarios, existingAppointments, novedades, products, proveedores, localOrder, newRepuesto
}: any) {

  const filteredServices = useMemo(() => {
    const q = servicesSearch.toLowerCase().trim();
    if (!q) return availableServices;
    return availableServices.filter((s: any) =>
      s.Nombre?.toLowerCase().includes(q)
    );
  }, [availableServices, servicesSearch]);

  const filteredClients = useMemo(() => {
    return clients.filter((c: any) =>
      `${c.Nombre} ${c.Apellido}`.toLowerCase().includes(search.client.toLowerCase()) ||
      c.Documento.toString().includes(search.client)
    );
  }, [clients, search.client]);

  const clientMotorcycles = useMemo(() => {
    return motorcycles.filter((m: any) =>
      (!formData.clientId || m.ID_Cliente === parseInt(formData.clientId)) &&
      (m.Placa.toLowerCase().includes(search.motorcycle.toLowerCase()) ||
        m.Marca.toLowerCase().includes(search.motorcycle.toLowerCase()) ||
        m.Modelo.toLowerCase().includes(search.motorcycle.toLowerCase()))
    );
  }, [motorcycles, formData.clientId, search.motorcycle]);

  const selectedClient = useMemo(() => clients.find((c: any) => c.ID_Cliente === parseInt(formData.clientId)), [clients, formData.clientId]);
  const selectedMoto = useMemo(() => motorcycles.find((m: any) => m.ID_Motocicleta === parseInt(formData.motorcycleId)), [motorcycles, formData.motorcycleId]);

  useEffect(() => {
    if (formData.startTime) {
      const hour = parseInt(formData.startTime.split(':')[0]);
      if (hour >= 6 && hour < 12) {
        setSelectedSection('mañana');
      } else if (hour >= 12 && hour < 18) {
        setSelectedSection('tarde');
      } else if (hour >= 18 && hour < 24) {
        setSelectedSection('noche');
      }
    }
  }, [formData.startTime, setSelectedSection]);

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
    if (formData.selectedServices.length === 0) return { minutes: 0, text: '0 min', endTime: formData.startTime };

    const servicesMinutes = formData.selectedServices.reduce((acc: number, id: number) => {
      const service = availableServices.find((s: any) => s.ID_Servicio === id || s.id_servicio === id);
      return acc + (service?.Duracion || service?.duracion || 0);
    }, 0);

    const hours = Math.floor(servicesMinutes / 60);
    const mins = servicesMinutes % 60;

    let text = '';
    if (hours > 0) text += `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    if (mins > 0) text += `${hours > 0 ? ' y ' : ''}${mins} min`;
    if (text === '') text = '0 min';

    let endTime = '';
    if (formData.startTime) {
      const [h, m] = formData.startTime.split(':').map(Number);
      const totalStartMins = h * 60 + m;
      const totalEndMins = totalStartMins + servicesMinutes;
      const endH = Math.floor(totalEndMins / 60) % 24;
      const endM = totalEndMins % 60;
      endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    }

    return { minutes: servicesMinutes, text, endTime };
  }, [formData.selectedServices, formData.startTime, availableServices]);

  const totalPrice = useMemo(() => {
    return formData.selectedServices.reduce((acc: number, id: number) => {
      const service = availableServices.find((s: any) => s.ID_Servicio === id || s.id_servicio === id);
      const val = Number(service?.Precio || service?.precio || 0);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }, [formData.selectedServices, availableServices]);

  useEffect(() => {
    if (durationData.endTime) {
      setFormData((prev: any) => {
        if (prev.endTime !== durationData.endTime) {
          return { ...prev, endTime: durationData.endTime };
        }
        return prev;
      });
    }
  }, [durationData.endTime, setFormData]);

  const availableMechanicsForTime = useMemo(() => {
    if (!formData.date || !formData.startTime) return [];

    const selectedDate = parseISO(formData.date);
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
      const hasSchedule = horarios.some((h: any) => {
        const entrada = (h.HoraEntrada || h.Hora_entrada || '00:00').slice(0, 5);
        const salida = (h.HoraSalida || h.Hora_salida || '23:59').slice(0, 5);
        return (
          h.ID_Empleado === mech.ID_Empleado &&
          h.Dia === dayName &&
          h.Estado &&
          formData.startTime >= entrada &&
          formData.startTime < salida
        );
      });

      if (!hasSchedule) return false;

      const isBusy = existingAppointments.some((a: any) => {
        if (a.mechanicId !== mech.ID_Empleado || a.date !== formData.date) return false;

        const existStart = (a.startTime || '').slice(0, 5);
        const existEndBase = (a.endTime || '').slice(0, 5);
        const existBlockedUntil = addMinutesToTime(existEndBase, 20);

        const newStart = formData.startTime;
        const newBlockedUntil = addMinutesToTime(formData.startTime, durationData.minutes + 20);

        return newStart < existBlockedUntil && existStart < newBlockedUntil;
      });

      if (isBusy) return false;

      const isDateToday = formData.date === format(new Date(), 'yyyy-MM-dd');
      if (isDateToday) {
        const hasNovelty = novedades.some((n: any) => {
          if (Number(n.ID_Empleado) !== Number(mech.ID_Empleado)) return false;

          let novDateStr = n.Dia;
          if (n.Dia instanceof Date) {
            novDateStr = n.Dia.toISOString().split('T')[0];
          } else if (novDateStr && typeof novDateStr === 'string') {
            novDateStr = novDateStr.substring(0, 10);
          }

          if (novDateStr !== formData.date) return false;

          const novStart = n.HoraInicio || n.Hora_inicio || n.horainicio;
          const novEnd = n.HoraFin || n.Hora_fin || n.horafin;

          if (!novStart || !novEnd) return true;

          const ns = novStart.slice(0, 5);
          const ne = novEnd.slice(0, 5);

          const newStart = formData.startTime;
          const newEnd = addMinutesToTime(formData.startTime, durationData.minutes);

          return newStart < ne && ns < newEnd;
        });

        if (hasNovelty) return false;
      }

      return true;
    });
  }, [formData.date, formData.startTime, mechanics, horarios, existingAppointments, durationData.minutes, novedades]);

  const selectedMechanic = useMemo(() => mechanics.find((m: any) => m.ID_Empleado === parseInt(formData.mechanicId)), [mechanics, formData.mechanicId]);

  const selectedMechanicSchedule = useMemo(() => {
    if (!formData.mechanicId || !formData.date) return null;
    const selectedDate = parseISO(formData.date);
    const dayName = daysMap[selectedDate.getDay()];
    const schedule = horarios.find((h: any) =>
      h.ID_Empleado === parseInt(formData.mechanicId) &&
      h.Dia === dayName &&
      h.Estado
    );
    if (!schedule) return null;
    return {
      entrada: (schedule.HoraEntrada || schedule.Hora_entrada || '00:00').slice(0, 5),
      salida: (schedule.HoraSalida || schedule.Hora_salida || '23:59').slice(0, 5)
    };
  }, [formData.mechanicId, formData.date, horarios]);

  const selectedTimeDisplay = useMemo(() => {
    if (!formData.startTime) return 'Seleccionar hora de inicio...';
    const [h, m] = formData.startTime.split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m), 0);
    return format(d, 'hh:mm a');
  }, [formData.startTime]);

  const hasSectionPassed = useMemo(() => {
    const isDateToday = formData.date === format(new Date(), 'yyyy-MM-dd');
    if (!isDateToday) return false;

    const nowTime = format(new Date(), 'HH:mm');
    if (selectedSection === 'mañana') return nowTime >= '12:00';
    if (selectedSection === 'tarde') return nowTime >= '18:00';
    return nowTime >= '23:50';
  }, [formData.date, selectedSection]);

  const activeSlots = useMemo(() => {
    const sectionSlots = potentialStartTimes.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      if (selectedSection === 'mañana') return hour >= 6 && hour < 12;
      if (selectedSection === 'tarde') return hour >= 12 && hour < 18;
      return hour >= 18 && hour < 24;
    });

    const isDateToday = formData.date === format(new Date(), 'yyyy-MM-dd');
    const nowTime = format(new Date(), 'HH:mm');

    const isMechanicAvailable = (mech: any, dateStr: string, startTime: string) => {
      const selectedDate = parseISO(dateStr);
      const dayName = daysMap[selectedDate.getDay()];

      const addMinutesToTime = (timeStr: string, mins: number) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':').map(Number);
        const totalMins = h * 60 + m + mins;
        const endH = Math.floor(totalMins / 60) % 24;
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
        if (a.mechanicId !== mech.ID_Empleado || a.date !== dateStr) return false;

        const existStart = (a.startTime || '').slice(0, 5);
        const existEndBase = (a.endTime || '').slice(0, 5);
        const existBlockedUntil = addMinutesToTime(existEndBase, 20);

        const newStart = startTime;
        const newBlockedUntil = addMinutesToTime(startTime, durationData.minutes + 20);

        return newStart < existBlockedUntil && existStart < newBlockedUntil;
      });
      if (isBusy) return false;

      if (isDateToday) {
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
        if (hasNovelty) return false;
      }

      return true;
    };

    return sectionSlots.filter(slot => {
      if (isDateToday && slot < nowTime) {
        return false;
      }

      if (formData.date) {
        const anyMechAvailable = mechanics.some((m: any) => isMechanicAvailable(m, formData.date, slot));
        if (!anyMechAvailable) return false;
      }

      return true;
    });
  }, [potentialStartTimes, selectedSection, formData.date, mechanics, horarios, existingAppointments, durationData.minutes, novedades]);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!formData.clientId) errs.clientId = 'El cliente responsable es obligatorio.';
    if (!formData.motorcycleId) errs.motorcycleId = 'El vehículo es obligatorio.';
    if (!formData.startTime) errs.startTime = 'La hora de inicio es obligatoria.';

    if (!formData.mechanicId) {
      errs.mechanicId = 'El mecánico disponible es obligatorio.';
    } else if (selectedMechanicSchedule && durationData.endTime) {
      if (durationData.endTime > selectedMechanicSchedule.salida) {
        errs.scheduleExceeded = 'La duración estimada excede la jornada del mecánico.';
      }
    }

    if (formData.selectedServices.length === 0) {
      errs.services = 'Debe seleccionar al menos un servicio requerido.';
    }
    return errs;
  }, [formData, selectedMechanicSchedule, durationData.endTime]);

  const allServicesFinalized = useMemo(() => {
    if (!localOrder?.servicios || localOrder.servicios.length === 0) return false;
    return localOrder.servicios.every((s: any) => s.Estado === 'Finalizado');
  }, [localOrder?.servicios]);

  const isRepuestosLocked = useMemo(() => {
    if (!localOrder) return true;
    const currentEstado = localOrder.Estado || localOrder.estadoBase || 'Esperando motocicleta';
    if (currentEstado === 'Esperando motocicleta') return true;
    if (currentEstado === 'En reparación') {
      return !allServicesFinalized;
    }
    return false;
  }, [localOrder, allServicesFinalized]);

  const formattedFecha = useMemo(() => {
    const f = localOrder?.DiaAgendamiento ||
      localOrder?.diaAgendamiento ||
      localOrder?.Fecha ||
      localOrder?.fecha ||
      localOrder?.date ||
      localOrder?.Dia ||
      localOrder?.dia;
    if (!f) return '---';
    try {
      const cleanDate = f.includes('T') ? f.split('T')[0] : f;
      return format(parseISO(cleanDate), 'dd/MM/yyyy');
    } catch {
      return '---';
    }
  }, [localOrder]);

  const formattedHora = useMemo(() => {
    const h = localOrder?.HoraInicio ||
      localOrder?.horaInicio ||
      localOrder?.Hora_inicio ||
      localOrder?.hora_inicio ||
      localOrder?.startTime;
    if (!h) return '';
    try {
      const cleanTime = h.slice(0, 5);
      return format(parseISO(`2026-01-01T${cleanTime}`), 'hh:mm a');
    } catch {
      return '';
    }
  }, [localOrder]);

  const repuestoErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    const qty = Number(newRepuesto.cantidad);
    if (!newRepuesto.cantidad || newRepuesto.cantidad === '') {
      errs.cantidad = 'La cantidad es obligatoria.';
    } else if (qty <= 0) {
      errs.cantidad = 'Debe ser mayor a 0.';
    } else if (newRepuesto.cantidad.length > 2) {
      errs.cantidad = 'Máximo 2 dígitos.';
    }

    const price = Number(newRepuesto.precio_unitario);
    if (!newRepuesto.precio_unitario || newRepuesto.precio_unitario === '') {
      errs.precio_unitario = 'El precio es obligatorio.';
    } else if (price < 1000) {
      errs.precio_unitario = 'Mínimo $1.000.';
    } else if (price > 5000000) {
      errs.precio_unitario = 'Máximo $5.000.000.';
    } else if (newRepuesto.precio_unitario.length > 7) {
      errs.precio_unitario = 'Máximo 7 dígitos.';
    }

    if (!newRepuesto.id_proveedor || newRepuesto.id_proveedor === '') {
      errs.id_proveedor = 'El proveedor es obligatorio.';
    }

    if (newRepuesto.observaciones && newRepuesto.observaciones.length > 50) {
      errs.observaciones = 'Máximo 50 caracteres.';
    }

    return errs;
  }, [newRepuesto]);

  const filteredProducts = useMemo(() => {
    const addedProductIds = new Set(
      localOrder?.compras?.map((c: any) => c.ID_Producto?.toString() || c.id_producto?.toString()) || []
    );
    return products.filter((p: any) => {
      if (addedProductIds.has(p.ID_Producto.toString())) return false;
      if (!p.Estado) return false;
      return (
        p.Nombre.toLowerCase().includes((search.product || '').toLowerCase()) ||
        p.ID_Producto.toString().includes(search.product || '')
      );
    });
  }, [products, search.product, localOrder?.compras]);

  const filteredProveedores = useMemo(() => {
    return proveedores.filter((p: any) =>
      (p.nombreempresa || p.NombreEmpresa || p.nombre || '').toLowerCase().includes((search.proveedor || '').toLowerCase()) ||
      (p.ID_Proveedor || p.id_proveedor || '').toString().includes(search.proveedor || '')
    );
  }, [proveedores, search.proveedor]);

  return {
    filteredServices,
    filteredClients,
    clientMotorcycles,
    selectedClient,
    selectedMoto,
    potentialStartTimes,
    durationData,
    totalPrice,
    availableMechanicsForTime,
    selectedMechanic,
    selectedMechanicSchedule,
    selectedTimeDisplay,
    hasSectionPassed,
    activeSlots,
    errors,
    allServicesFinalized,
    isRepuestosLocked,
    formattedFecha,
    formattedHora,
    repuestoErrors,
    filteredProducts,
    filteredProveedores
  };
}
