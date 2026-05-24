import { useDashboard } from './hooks/useDashboard';
import { DashboardHeader } from './components/DashboardHeader';
import { StatsGrid } from './components/StatsGrid';
import { ChartsSection } from './components/ChartsSection';
import { RecentActivity } from './components/RecentActivity';
import { DashboardStyles } from './styles/DashboardStyles';

export function Dashboard() {
  const { stats, isLoading, isFetching, period, setPeriod } = useDashboard();

  if (isLoading || !stats) {
    return (
      <div className="dashboard-root">
        <DashboardStyles />
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <DashboardStyles />
      
      <div className="space-y-8 pb-4">
        <DashboardHeader period={period} setPeriod={setPeriod} isFetching={isFetching} />
        
        <div className={`transition-all duration-500 ease-out transform-gpu origin-top ${isFetching ? 'opacity-40 scale-[0.98] blur-[2px] pointer-events-none' : 'opacity-100 scale-100 blur-0'}`}>
          <StatsGrid stats={stats.kpis} />
          
          <div className="mt-8">
            <ChartsSection charts={stats.charts} period={period} />
          </div>
          
          <div className="mt-8">
            <RecentActivity activities={stats.recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}
