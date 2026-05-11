import { useState, useEffect } from 'react';
import { DollarSign, Wrench, Calendar, AlertCircle } from 'lucide-react';

export function useDashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const recentActivity = [
    { id: 1, type: 'sale', title: 'Nueva Venta: VEN-045', detail: 'Juan Pérez - $450,000', time: 'hace 10 min', icon: DollarSign, color: 'text-emerald-500' },
    { id: 2, type: 'repair', title: 'Orden Actualizada: OS-102', detail: 'Yamaha R6 - En Reparación', time: 'hace 25 min', icon: Wrench, color: 'text-blue-500' },
    { id: 3, type: 'appointment', title: 'Cita Agendada', detail: 'Carlos López - Mañana 09:00 AM', time: 'hace 45 min', icon: Calendar, color: 'text-amber-500' },
    { id: 4, type: 'inventory', title: 'Stock Bajo', detail: 'Aceite Motul 10W40 (3 unid.)', time: 'hace 1 hora', icon: AlertCircle, color: 'text-rose-500' },
  ];

  return {
    isMounted,
    recentActivity
  };
}
