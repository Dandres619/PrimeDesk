import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Calendar,
  Clock,
  AlertCircle,
  DollarSign,
  Wrench,
  ClipboardList,
  CalendarDays,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function Dashboard() {

  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Mock Data reflecting project modules
  const stats = [
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

  // Financial Data (Ventas vs Compras)
  const financialData = [
    { name: 'Lun', ingresos: 450000, egresos: 120000 },
    { name: 'Mar', ingresos: 520000, egresos: 80000 },
    { name: 'Mié', ingresos: 480000, egresos: 450000 },
    { name: 'Jue', ingresos: 610000, egresos: 200000 },
    { name: 'Vie', ingresos: 850000, egresos: 300000 },
    { name: 'Sáb', ingresos: 950000, egresos: 150000 },
    { name: 'Dom', ingresos: 200000, egresos: 50000 },
  ];

  // Repair Status Data
  const repairStatusData = [
    { name: 'En Recepción', value: 4 },
    { name: 'En Diagnóstico', value: 3 },
    { name: 'En Reparación', value: 8 },
    { name: 'Esperando Repuestos', value: 2 },
    { name: 'Completado', value: 10 },
  ];

  // Appointment Capacity
  const appointmentCapacityData = [
    { time: '08:00', ocupacion: 80 },
    { time: '10:00', ocupacion: 100 },
    { time: '12:00', ocupacion: 40 },
    { time: '14:00', ocupacion: 90 },
    { time: '16:00', ocupacion: 60 },
    { time: '18:00', ocupacion: 20 },
  ];

  // Top Services
  const topServicesData = [
    { name: 'Mantenimiento Preventivo', count: 45 },
    { name: 'Cambio de Aceite', count: 32 },
    { name: 'Reparación de Motor', count: 12 },
    { name: 'Frenos', count: 28 },
    { name: 'Suspensión', count: 15 },
  ];

  const recentActivity = [
    { id: 1, type: 'sale', title: 'Nueva Venta: VEN-045', detail: 'Juan Pérez - $450,000', time: 'hace 10 min', icon: DollarSign, color: 'text-emerald-500' },
    { id: 2, type: 'repair', title: 'Orden Actualizada: OS-102', detail: 'Yamaha R6 - En Reparación', time: 'hace 25 min', icon: Wrench, color: 'text-blue-500' },
    { id: 3, type: 'appointment', title: 'Cita Agendada', detail: 'Carlos López - Mañana 09:00 AM', time: 'hace 45 min', icon: Calendar, color: 'text-amber-500' },
    { id: 4, type: 'inventory', title: 'Stock Bajo', detail: 'Aceite Motul 10W40 (3 unid.)', time: 'hace 1 hora', icon: AlertCircle, color: 'text-rose-500' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border p-3 rounded-lg shadow-xl shadow-black/10 transition-all">
          <p className="text-sm font-bold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs py-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground capitalize">{entry.name}:</span>
              <span className="font-semibold">{entry.name.includes('ingresos') || entry.name.includes('egresos') ? `$${entry.value.toLocaleString()}` : `${entry.value}%`}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Panel de Control
            </h1>
            <Badge variant="outline" className="h-6 gap-1 bg-primary/5 text-primary border-primary/20 animate-pulse">
              <Activity className="w-3 h-3" /> EN VIVO
            </Badge>
          </div>
          <p className="text-muted-foreground font-medium">
            Resumen operativo y financiero · <span className="text-primary/80 italic font-semibold">Rafa Motos</span>
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <Card key={i} className={`group relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 ring-1 ring-border/50 hover:ring-primary/20 bg-card/80 backdrop-blur-xl`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${i === 0 ? 'from-blue-500 to-indigo-500' : i === 1 ? 'from-amber-400 to-orange-500' : i === 2 ? 'from-emerald-400 to-teal-500' : 'from-rose-500 to-red-600'}`} />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-black/5`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-5 space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black tracking-tighter tabular-nums">{stat.value}</h3>
                </div>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Primary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Purchases Analytics */}
        <Card className="lg:col-span-2 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Desempeño Financiero
              </CardTitle>
              <CardDescription>Comparativa de flujo de caja (Semana Actual)</CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold">
                <div className="w-3 h-3 rounded-full bg-[#3b82f6]" /> Ingresos
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]" /> Egresos
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                  tick={{ fontSize: 12, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIngresos)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="egresos"
                  stroke="#ef4444"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#colorEgresos)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reparos Distribution (Workload) */}
        <Card className="shadow-lg border-border/50 bg-card/50 backdrop-blur-sm group">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" /> Estado del Taller
            </CardTitle>
            <CardDescription>Carga operativa actual por fase</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col justify-between">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={repairStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {repairStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-4">
              {repairStatusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold text-muted-foreground group-hover/item:text-foreground transition-colors">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black">{item.value}</span>
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full group-hover/item:opacity-100 opacity-70 transition-all duration-1000"
                        style={{
                          backgroundColor: COLORS[i % COLORS.length],
                          width: `${(item.value / 27) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Data Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Services Ranking */}
        <Card className="lg:col-span-2 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm self-stretch">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" /> Servicios Más Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServicesData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--foreground))' }}
                  width={140}
                />
                <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[0, 8, 8, 0]}
                  barSize={18}
                  background={{ fill: 'hsl(var(--muted))', radius: 8 }}
                >
                  {topServicesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#3b82f690'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Capacity/Appointments */}
        <Card className="shadow-lg border-border/50 bg-card/50 backdrop-blur-sm self-stretch">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" /> Flujo de Agendamientos
            </CardTitle>
            <CardDescription>Ocupación por jornada horaria</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appointmentCapacityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide domain={[0, 110]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ocupacion"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorOcupacion)"
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Inventory Alerts */}
      <div className="grid grid-cols-1 gap-6 pb-4">
        {/* Recent Activity Feed */}
        <Card className="shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Actividad Reciente
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">Ver Historial</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl bg-background border border-border shadow-sm group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">{item.detail}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
