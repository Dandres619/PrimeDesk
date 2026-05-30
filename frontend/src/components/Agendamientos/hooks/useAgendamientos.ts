import { useState, useEffect, useMemo, useCallback } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useAgendamientos() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<any>(null);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [moreApts, setMoreApts] = useState<any[]>([]);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [motorcycles, setMotorcycles] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [novedades, setNovedades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ 'Authorization': `Bearer ${token}` }), [token]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    const results = await Promise.allSettled([
      fetch(`${API_URL}/agendamientos`, { headers }),
      fetch(`${API_URL}/clientes`, { headers }),
      fetch(`${API_URL}/motocicletas`, { headers }),
      fetch(`${API_URL}/empleados`, { headers }),
      fetch(`${API_URL}/servicios`, { headers }),
      fetch(`${API_URL}/horarios`, { headers }),
      fetch(`${API_URL}/novedades`, { headers }),
    ]);

    try {
      const [resAg, resCli, resMot, resEmp, resSer, resHor, resNov] = results;

      if (resAg.status === 'fulfilled' && resAg.value.ok) {
        const data = await resAg.value.json();
        setAppointments(data.map((a: any) => ({
          id: a.ID_Agendamiento,
          date: a.Dia ? a.Dia.substring(0, 10) : '',
          startTime: a.HoraInicio ? a.HoraInicio.substring(0, 5) : '',
          endTime: a.HoraFin ? a.HoraFin.substring(0, 5) : '',
          motorcycleId: a.ID_Motocicleta,
          repairId: a.ID_Reparacion,
          motorcyclePlate: a.Placa,
          motorcycleBrand: a.Marca,
          motorcycleModel: a.Modelo,
          mechanicId: a.ID_Empleado,
          mechanicName: `${a.NombreEmpleado} ${a.ApellidoEmpleado}`,
          notes: a.Notas || '',
          status: a.Estado || 'Esperando motocicleta',
          serviceTypes: Array.isArray(a.Servicios) ? a.Servicios : [],
          serviceIds: [],
        })));
      }

      if (resCli.status === 'fulfilled' && resCli.value.ok) {
        setClients(await resCli.value.json());
      }

      if (resMot.status === 'fulfilled' && resMot.value.ok) {
        const motoData = await resMot.value.json();
        setMotorcycles(motoData.filter((m: any) => m.Estado !== false));
      }

      if (resEmp.status === 'fulfilled' && resEmp.value.ok) {
        const empData = await resEmp.value.json();
        setMechanics(empData.filter((e: any) => 
          (Number(e.ID_Rol) === 2 || Number(e.id_rol) === 2 || e.NombreRol === 'Mecánico') && 
          e.EstadoUsuario !== false && e.EstadoUsuario !== 'Inactivo'
        ));
      }

      if (resSer.status === 'fulfilled' && resSer.value.ok) {
        const svcData = await resSer.value.json();
        setServices(svcData.filter((s: any) => s.Estado !== false));
      }

      if (resHor.status === 'fulfilled' && resHor.value.ok) {
        setHorarios(await resHor.value.json());
      }

      if (resNov.status === 'fulfilled' && resNov.value.ok) {
        setNovedades(await resNov.value.json());
      }
    } catch {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const enrichedApts = useMemo(() => appointments.map(a => {
    const moto = motorcycles.find(m => m.ID_Motocicleta === a.motorcycleId);
    const client = clients.find(c => c.ID_Cliente === moto?.ID_Cliente);
    
    const detailedServices = a.serviceTypes.map((st: any) => {
      const name = typeof st === 'object' ? (st.Nombre || st.nombre) : st;
      const foundSvc = services.find((s: any) => 
        (s.Nombre || s.nombre)?.toLowerCase() === name?.toLowerCase()
      );
      return {
        Nombre: name,
        Duracion: foundSvc ? (foundSvc.Duracion || foundSvc.duracion) : (typeof st === 'object' ? (st.Duracion || st.duracion) : null),
        Precio: foundSvc ? (foundSvc.Precio || foundSvc.precio) : (typeof st === 'object' ? (st.Precio || st.precio) : null)
      };
    });

    return {
      ...a,
      motorcyclePlate: moto?.Placa || a.motorcyclePlate,
      motorcycleBrand: moto?.Marca || a.motorcycleBrand,
      motorcycleModel: moto?.Modelo || a.motorcycleModel,
      clientId: client?.ID_Cliente,
      clientName: client ? `${client.Nombre} ${client.Apellido || ''}`.trim() : 'Cliente desconocido',
      clientPhone: client?.Telefono || '',
      serviceTypes: detailedServices
    };
  }), [appointments, motorcycles, clients, services]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) { days.push(day); day = addDays(day, 1); }
    return days;
  }, [currentDate]);

  const handleSave = async (data: any) => {
    const isEditing = !!editingApt;
    try {
      if (!isEditing) {
        const res = await fetch(`${API_URL}/agendamientos`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_motocicleta: parseInt(data.motorcycleId),
            id_empleado: parseInt(data.mechanicId),
            dia: data.date,
            horainicio: data.startTime,
            horafin: data.endTime,
            notas: data.notes || null,
            servicios: data.serviceIds || []
          })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || err.errors?.[0]?.msg || 'Error al crear agendamiento');
        }
        const created = await res.json();
        toast.success(`Agendamiento creado. Reparación #${created.ID_Reparacion} generada automáticamente.`);
      } else {
        const res = await fetch(`${API_URL}/agendamientos/${editingApt.id}`, {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_motocicleta: parseInt(data.motorcycleId),
            id_empleado: parseInt(data.mechanicId),
            dia: data.date,
            horainicio: data.startTime,
            horafin: data.endTime,
            notas: data.notes || null
          })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Error al actualizar agendamiento');
        }
        toast.success('Agendamiento actualizado exitosamente');
      }
      setIsModalOpen(false);
      setEditingApt(null);
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (apt: any) => {
    const aptDateTime = new Date(apt.date + 'T' + apt.startTime);
    const now = new Date();
    const diffHours = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      toast.error('Solo se puede anular con al menos una hora de anticipación.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/agendamientos/${apt.id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al anular');
      }
      toast.success('Agendamiento y reparación vinculada anulados exitosamente');
      setIsDetailsOpen(false);
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return {
    currentDate, setCurrentDate,
    selectedDate, setSelectedDate,
    isModalOpen, setIsModalOpen,
    editingApt, setEditingApt,
    selectedApt, setSelectedApt,
    isDetailsOpen, setIsDetailsOpen,
    isMoreOpen, setIsMoreOpen,
    moreApts, setMoreApts,
    appointments, clients, motorcycles, mechanics, horarios, services, novedades,
    isLoading, enrichedApts, calendarDays,
    handleSave, handleDelete
  };
}
