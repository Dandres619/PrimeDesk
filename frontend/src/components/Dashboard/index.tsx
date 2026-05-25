import { useState } from 'react';
import { useDashboard } from './hooks/useDashboard';
import { DashboardHeader } from './components/DashboardHeader';
import { StatsGrid } from './components/StatsGrid';
import { ChartsSection } from './components/ChartsSection';
import { RecentActivity } from './components/RecentActivity';
import { DashboardStyles } from './styles/DashboardStyles';
import { SalesDetailDialog } from './components/SalesDetailDialog';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function Dashboard() {
  const { stats, isLoading, isFetching, period, setPeriod } = useDashboard();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSales, setModalSales] = useState<any[] | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalPeriodLabel, setModalPeriodLabel] = useState('');

  const handlePointClick = async (point: any) => {
    console.log("handlePointClick triggered. Point:", point, "Period:", period);
    setIsModalOpen(true);
    setIsModalLoading(true);
    
    let label = point.mes;
    if (period === 'day' && point.dateStr) {
      try {
        const [year, month, day] = point.dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const weekday = date.toLocaleDateString('es-CO', { weekday: 'long' });
        const d = String(day).padStart(2, '0');
        const m = String(month).padStart(2, '0');
        label = `${weekday} ${d}/${m}/${year}`;
      } catch (e) {
        console.error("Error formatting day label:", e);
      }
    }
    setModalPeriodLabel(label);
    try {
      const token = localStorage.getItem('token');
      const url = `${API_URL}/dashboard/period-sales?period=${period}&dateStr=${point.dateStr || ''}&offset=${point.offset !== null && point.offset !== undefined ? point.offset : ''}`;
      console.log("Fetching period sales from URL:", url);
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log("Response status:", res.status);
      if (!res.ok) throw new Error(`Error al obtener ventas (status: ${res.status})`);
      const data = await res.json();
      console.log("Fetched sales count:", data?.length, "Data:", data);
      setModalSales(data);
    } catch (e) {
      console.error("Error in handlePointClick:", e);
      toast.error('No se pudieron obtener las ventas de este periodo');
      setIsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };

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
            <ChartsSection charts={stats.charts} period={period} onPointClick={handlePointClick} />
          </div>
          
          <div className="mt-8">
            <RecentActivity activities={stats.recentActivity} />
          </div>
        </div>
      </div>

      <SalesDetailDialog 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        sales={modalSales}
        isLoading={isModalLoading}
        periodLabel={modalPeriodLabel}
      />
    </div>
  );
}
