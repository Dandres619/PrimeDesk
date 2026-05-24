import { DollarSign, Wrench, CalendarClock, Users, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { PiMotorcycle } from 'react-icons/pi';
import { Card } from '../../ui/card';

interface StatsGridProps {
  stats?: {
    ingresosMes?: number;
    ingresosMesAnterior?: number;
    ventasMes?: number;
    ventasMesAnterior?: number;
    reparacionesActivas?: number;
    agendamientosPeriodo?: number;
    agendamientosHoy?: number;
    totalClientes?: number;
    totalMotos?: number;
    clientesNuevosSemana?: number;
    period?: string;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  const formatCurrency = (val: number) => 
    `$${val.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const period = stats?.period || 'month';

  const getTitleIngreso = () => {
    switch(period) {
      case 'day': return 'Ingresos Hoy';
      case 'week': return 'Ingresos Semanales';
      case 'quarter': return 'Ingresos Trimestre';
      case 'semester': return 'Ingresos Semestre';
      case 'month':
      default: return 'Ingresos del Mes';
    }
  };

  const getTitleVentas = () => {
    switch(period) {
      case 'day': return 'Ventas Hoy';
      case 'week': return 'Ventas Semanales';
      case 'quarter': return 'Ventas Trimestre';
      case 'semester': return 'Ventas Semestre';
      case 'month':
      default: return 'Ventas del Mes';
    }
  };

  const getTitleAgendamientos = () => {
    switch(period) {
      case 'day': return 'Agendamientos Hoy';
      case 'week': return 'Agendamientos Semanales';
      case 'quarter': return 'Agendamientos Trimestre';
      case 'semester': return 'Agendamientos Semestre';
      case 'month':
      default: return 'Agendamientos del Mes';
    }
  };

  const cards = [
    {
      title: getTitleIngreso(),
      value: formatCurrency(stats?.ingresosMes ?? 0),
      icon: DollarSign,
      trendText: 'Total acumulado',
      gradientClass: 'gradient-blue',
      iconBg: 'bg-blue-100 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Reparaciones Activas',
      value: (stats?.reparacionesActivas ?? 0).toString(),
      icon: Wrench,
      trendText: 'En proceso actualmente',
      gradientClass: 'gradient-amber',
      iconBg: 'bg-amber-100 dark:bg-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      title: getTitleAgendamientos(),
      value: (stats?.agendamientosPeriodo ?? stats?.agendamientosHoy ?? 0).toString(),
      icon: CalendarClock,
      trendText: 'Agendados en el periodo',
      gradientClass: 'gradient-emerald',
      iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: getTitleVentas(),
      value: (stats?.ventasMes ?? 0).toString(),
      icon: ShoppingCart,
      trendText: 'Total de ventas',
      gradientClass: 'gradient-violet',
      iconBg: 'bg-violet-100 dark:bg-violet-500/20',
      iconColor: 'text-violet-600 dark:text-violet-400'
    },
    {
      title: 'Clientes Registrados',
      value: (stats?.totalClientes ?? 0).toString(),
      icon: Users,
      trendText: 'Total de clientes',
      gradientClass: 'gradient-indigo',
      iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      title: 'Motos en Sistema',
      value: (stats?.totalMotos ?? 0).toString(),
      icon: PiMotorcycle,
      trendText: 'Motos registradas',
      gradientClass: 'gradient-rose',
      iconBg: 'bg-rose-100 dark:bg-rose-500/20',
      iconColor: 'text-rose-600 dark:text-rose-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {cards.map((card, i) => (
        <Card 
          key={i} 
          className={`dashboard-stat-card ${card.gradientClass} stat-card-animate border-none bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg ring-1 ring-border/50`}
        >
          <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white value-animate">
                  {card.value}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center stat-icon-container ${card.iconBg}`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
