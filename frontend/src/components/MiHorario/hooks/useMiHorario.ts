import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export function useMiHorario() {
  const { currentUser } = useAuth();
  const [schedule, setSchedule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!currentUser?.id_empleado) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const headers = { 'Authorization': `Bearer ${token}` };
    
    try {
      const res = await fetch(`${API_URL}/horarios/empleado/${currentUser.id_empleado}`, { headers });
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          // Parse data just like in useHorarios
          const map: any = {
            mechanicName: `${data[0].Nombre} ${data[0].Apellido}`,
            status: 'Activo',
            daySchedules: {}
          };
          
          for (const row of data) {
            map.daySchedules[row.Dia] = {
              enabled: row.Estado,
              startTime: row.HoraEntrada?.substring(0, 5) ?? '08:00',
              endTime: row.HoraSalida?.substring(0, 5) ?? '17:00',
            };
            if (!row.Estado) map.status = 'Inactivo';
          }
          setSchedule(map);
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return {
    isLoading,
    schedule
  };
}
