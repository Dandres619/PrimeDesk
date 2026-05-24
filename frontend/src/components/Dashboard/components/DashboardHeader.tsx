import { LayoutDashboard } from 'lucide-react';

interface DashboardHeaderProps {
  period: string;
  setPeriod: (val: string) => void;
  isFetching: boolean;
}

export function DashboardHeader({ period, setPeriod, isFetching }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
          <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Resumen general del sistema
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="day" className="dark:bg-slate-800 dark:text-white">Hoy</option>
          <option value="week" className="dark:bg-slate-800 dark:text-white">Esta Semana</option>
          <option value="month" className="dark:bg-slate-800 dark:text-white">Mensual</option>
          <option value="quarter" className="dark:bg-slate-800 dark:text-white">Trimestral</option>
          <option value="semester" className="dark:bg-slate-800 dark:text-white">Semestral</option>
        </select>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors duration-300 ${isFetching ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50'}`}>
          {isFetching ? (
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          ) : (
            <div className="pulse-dot" />
          )}
          <span className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${isFetching ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {isFetching ? 'Actualizando' : 'En vivo'}
          </span>
        </div>
      </div>
    </div>
  );
}
