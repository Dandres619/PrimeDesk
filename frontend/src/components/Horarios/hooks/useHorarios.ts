import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

function groupByEmployee(rows: any[]) {
  const map: Record<number, any> = {};
  for (const row of rows) {
    const id = row.ID_Empleado;
    if (!map[id]) {
      map[id] = {
        id: id,
        mechanicName: `${row.Nombre} ${row.Apellido}`,
        daySchedules: {},
        status: row.Estado ? 'Activo' : 'Inactivo',
        createdAt: row.CreadoEn,
        updatedAt: row.ActualizadoEn
      };
    }
    map[id].daySchedules[row.Dia] = {
      enabled: row.Estado,
      startTime: row.HoraEntrada?.substring(0, 5) ?? '08:00',
      endTime: row.HoraSalida?.substring(0, 5) ?? '17:00',
    };
    if (row.Estado) map[id].status = 'Activo';
  }
  return Object.values(map);
}

export function useHorarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [viewingSchedule, setViewingSchedule] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [resHor, resEmp] = await Promise.allSettled([
        fetch(`${API_URL}/horarios`, { headers }),
        fetch(`${API_URL}/empleados`, { headers })
      ]);

      if (resEmp.status === 'fulfilled' && resEmp.value.ok) {
        const dataEmp = await resEmp.value.json();
        const mechanics = dataEmp.filter((e: any) =>
          (Number(e.ID_Rol) === 2 || Number(e.id_rol) === 2) &&
          e.EstadoUsuario !== false &&
          e.EstadoUsuario !== 'Inactivo'
        );
        setEmployees(mechanics);
      }

      if (resHor.status === 'fulfilled' && resHor.value.ok) {
        const dataHor = await resHor.value.json();
        setSchedules(groupByEmployee(dataHor));
      } else {
        setSchedules([]);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (data: any) => {
    const isEditing = !!editingSchedule;
    const id_empleado = parseInt(data.employeeId);
    const dias = Object.entries(data.daySchedules)
      .filter(([, ds]: any) => ds.enabled)
      .map(([dia, ds]: any) => ({ dia, hora_entrada: ds.startTime, hora_salida: ds.endTime }));

    if (dias.length === 0) {
      toast.error('Debe habilitar al menos un día de trabajo');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/horarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id_empleado, dias })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al guardar horario');
      }
      toast.success(`Horario ${isEditing ? 'actualizado' : 'creado'} exitosamente`);
      setIsDialogOpen(false);
      setEditingSchedule(null);
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleEstado = async (schedule: any) => {
    const newEstado = schedule.status !== 'Activo';
    try {
      const res = await fetch(`${API_URL}/horarios/empleado/${schedule.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: newEstado })
      });
      if (!res.ok) throw new Error('Error al cambiar el estado');
      toast.success('Estado del horario actualizado');
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (schedule: any) => {
    try {
      const res = await fetch(`${API_URL}/horarios/empleado/${schedule.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al eliminar horario');
      }
      toast.success('Horario eliminado exitosamente');
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRegistrarNovedad = async (novedadData: any) => {
    try {
      const res = await fetch(`${API_URL}/novedades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(novedadData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al registrar novedad');
      }
      const data = await res.json();
      const count = data.affectedAppointments?.length || 0;
      if (count > 0) {
        toast.success('Novedad registrada exitosamente. Se envió un correo a cada usuario afectado para que reagende su cita.');
      } else {
        toast.success('Novedad registrada exitosamente.');
      }
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const getEnabledDays = (s: any) => DAYS_OF_WEEK.filter(d => s.daySchedules[d]?.enabled);

  const filteredSchedules = schedules.filter(s =>
    s.mechanicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getEnabledDays(s).some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return {
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    setIsDialogOpen,
    editingSchedule,
    setEditingSchedule,
    viewingSchedule,
    setViewingSchedule,
    currentPage,
    setCurrentPage,
    isLoading,
    schedules: filteredSchedules,
    employees,
    handleSave,
    handleToggleEstado,
    handleDelete,
    handleRegistrarNovedad,
    getEnabledDays
  };
}
