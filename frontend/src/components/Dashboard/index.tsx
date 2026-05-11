import { useDashboard } from './hooks/useDashboard';
import { DashboardHeader } from './components/DashboardHeader';
import { StatCard } from './components/StatCard';
import { ChartsSection } from './components/ChartsSection';
import { RecentActivity } from './components/RecentActivity';
import { mockStats } from './utils/dashboardUtils';

export function Dashboard() {
  const { isMounted, recentActivity } = useDashboard();

  if (!isMounted) {
    return (
      <div className="p-6 h-[80vh] w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <DashboardHeader />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockStats.map((stat, i) => (
          <StatCard key={i} stat={stat} index={i} />
        ))}
      </div>

      <ChartsSection />

      <div className="grid grid-cols-1 gap-6 pb-4">
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  );
}
