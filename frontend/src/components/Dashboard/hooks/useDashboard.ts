import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export interface DashboardStats {
  kpis: {
    ingresosMes: number;
    ingresosMesAnterior: number;
    ventasMes: number;
    ventasMesAnterior: number;
    reparacionesActivas: number;
    agendamientosPeriodo: number;
    totalClientes: number;
    totalMotos: number;
    clientesNuevosSemana: number;
    period: string;
  };
  charts: {
    ingresosMensuales: { mes: string; total: number }[];
    estadoReparaciones: { estado: string; cantidad: number }[];
    topServicios: { nombre: string; cantidad: number }[];
  };
  recentActivity: {
    tipo: 'venta' | 'reparacion' | 'agendamiento';
    descripcion: string;
    fecha: string;
  }[];
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [period, setPeriod] = useState('day');

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/dashboard/stats?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Error al obtener estadísticas del dashboard');
      }

      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar las estadísticas del dashboard');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    isLoading,
    isFetching,
    period,
    setPeriod
  };
}
