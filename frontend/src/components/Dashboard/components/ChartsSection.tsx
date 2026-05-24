import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { CustomTooltip } from './CustomTooltip';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface ChartsSectionProps {
  charts: {
    ingresosMensuales: { mes: string; total: number }[];
    estadoReparaciones: { estado: string; cantidad: number }[];
    topServicios: { nombre: string; cantidad: number }[];
  };
  period: string;
}

export function ChartsSection({ charts, period }: ChartsSectionProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Colores consistentes para los estados
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reparación finalizada': return '#10b981'; // emerald
      case 'Anulado':
      case 'Anulada': return '#ef4444'; // red
      case 'Esperando motocicleta': return '#f59e0b'; // amber
      default: return '#3b82f6'; // blue
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 chart-section-animate">

      {/* Ingresos Area Chart (Toma 2 columnas en lg, o 1 si prefieres que comparta) */}
      <Card className="lg:col-span-2 dashboard-chart-card border-slate-200 dark:border-indigo-500/20 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg font-bold">
              {period === 'day' ? 'Ingresos de Hoy' :
                period === 'week' ? 'Ingresos Semanales' :
                  period === 'quarter' ? 'Ingresos Trimestrales' :
                    period === 'semester' ? 'Ingresos Semestrales' :
                      'Ingresos Mensuales'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            {charts.ingresosMensuales && charts.ingresosMensuales.length > 0 && charts.ingresosMensuales.some(item => item.total > 0) ? (
              isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.ingresosMensuales} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis
                      dataKey="mes"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip isCurrency />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIngresos)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-100/50 dark:bg-slate-800/10 animate-pulse rounded-lg" />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No hay ingresos registrados en este período
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estados Pie Chart */}
      <Card className="dashboard-chart-card border-slate-200 dark:border-indigo-500/20 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <PieChartIcon className="w-5 h-5 text-emerald-500" />
          <CardTitle className="text-lg font-bold">Estado de Reparaciones</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[250px] w-full">
            {charts.estadoReparaciones.length > 0 ? (
              isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.estadoReparaciones}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="cantidad"
                      nameKey="estado"
                    >
                      {charts.estadoReparaciones.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.estado)} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-100/50 dark:bg-slate-800/10 animate-pulse rounded-lg" />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No hay datos suficientes
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Servicios Bar Chart */}
      <Card className="dashboard-chart-card border-slate-200 dark:border-indigo-500/20 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <BarChart3 className="w-5 h-5 text-violet-500" />
          <CardTitle className="text-lg font-bold">
            Top 5 Servicios más solicitados (Solo {charts.topServicios.length} actualmente)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[250px] w-full">
            {charts.topServicios.length > 0 ? (
              isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.topServicios} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis type="category" dataKey="nombre" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="cantidad" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                      {charts.topServicios.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#a855f7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-100/50 dark:bg-slate-800/10 animate-pulse rounded-lg" />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No hay datos suficientes
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
