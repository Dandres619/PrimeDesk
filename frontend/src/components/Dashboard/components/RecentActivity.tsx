import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Activity, ShoppingCart, Wrench, CalendarClock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecentActivityProps {
  activities: {
    tipo: 'venta' | 'reparacion' | 'agendamiento';
    descripcion: string;
    fecha: string;
  }[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  
  const getActivityStyle = (tipo: string) => {
    switch(tipo) {
      case 'venta': 
        return { icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/20' };
      case 'reparacion': 
        return { icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' };
      case 'agendamiento': 
        return { icon: CalendarClock, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-500/20' };
      default:
        return { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-500/20' };
    }
  };

  return (
    <Card className="activity-section-animate dashboard-chart-card border-slate-200 dark:border-indigo-500/20 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <CalendarClock className="w-5 h-5 text-indigo-500" />
        <CardTitle className="text-lg font-bold">Próximos agendamientos</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const style = getActivityStyle(activity.tipo);
              const Icon = style.icon;
              
              let timeAgo = '';
              try {
                timeAgo = formatDistanceToNow(new Date(activity.fecha), { addSuffix: true, locale: es });
              } catch (e) {
                timeAgo = 'Reciente';
              }

              return (
                <div key={index} className="activity-item flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.bg}`}>
                      <Icon className={`w-5 h-5 ${style.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {activity.descripcion}
                      </p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                        {activity.tipo}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                    {timeAgo}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500 dark:text-slate-400">
            <CalendarClock className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No hay próximos agendamientos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
