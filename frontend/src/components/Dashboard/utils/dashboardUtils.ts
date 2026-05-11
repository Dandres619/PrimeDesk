import { DollarSign, Wrench, CalendarDays } from 'lucide-react';

export const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const mockStats = [
  {
    title: 'Ingresos Mensuales',
    value: '$12,450,000',
    description: '+12.5% vs mes anterior',
    trend: 'up',
    icon: DollarSign,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    accent: 'border-blue-500/20'
  },
  {
    title: 'Reparaciones Activas',
    value: '18',
    description: '',
    trend: 'up',
    icon: Wrench,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    accent: 'border-amber-500/20'
  },
  {
    title: 'Agendamientos Programados',
    value: '24',
    description: 'Próxima: 08:30 AM',
    trend: 'up',
    icon: CalendarDays,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    accent: 'border-emerald-500/20'
  }
];

export const financialData = [
  { name: 'Lun', ingresos: 450000, egresos: 120000 },
  { name: 'Mar', ingresos: 520000, egresos: 80000 },
  { name: 'Mié', ingresos: 480000, egresos: 450000 },
  { name: 'Jue', ingresos: 610000, egresos: 200000 },
  { name: 'Vie', ingresos: 850000, egresos: 300000 },
  { name: 'Sáb', ingresos: 950000, egresos: 150000 },
  { name: 'Dom', ingresos: 200000, egresos: 50000 },
];

export const repairStatusData = [
  { name: 'En Recepción', value: 4 },
  { name: 'En Diagnóstico', value: 3 },
  { name: 'En Reparación', value: 8 },
  { name: 'Esperando Repuestos', value: 2 },
  { name: 'Completado', value: 10 },
];

export const appointmentCapacityData = [
  { time: '08:00', ocupacion: 80 },
  { time: '10:00', ocupacion: 100 },
  { time: '12:00', ocupacion: 40 },
  { time: '14:00', ocupacion: 90 },
  { time: '16:00', ocupacion: 60 },
  { time: '18:00', ocupacion: 20 },
];

export const topServicesData = [
  { name: 'Mantenimiento Preventivo', count: 45 },
  { name: 'Cambio de Aceite', count: 32 },
  { name: 'Reparación de Motor', count: 12 },
  { name: 'Frenos', count: 28 },
  { name: 'Suspensión', count: 15 },
];
