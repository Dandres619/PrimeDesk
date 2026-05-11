import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Activity, Wrench, ClipboardList, Clock } from 'lucide-react';
import { CustomTooltip } from './CustomTooltip';
import { financialData, repairStatusData, COLORS, topServicesData, appointmentCapacityData } from '../utils/dashboardUtils';

export function ChartsSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Performance */}
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
            <ResponsiveContainer width="100%" height="100%" debounce={50} minHeight={0}>
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
                <Area type="monotone" dataKey="ingresos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" animationDuration={1500} />
                <Area type="monotone" dataKey="egresos" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorEgresos)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workshop Status */}
        <Card className="shadow-lg border-border/50 bg-card/50 backdrop-blur-sm group">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" /> Estado del Taller
            </CardTitle>
            <CardDescription>Carga operativa actual por fase</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col justify-between">
            <ResponsiveContainer width="100%" height={200} debounce={50} minHeight={0}>
              <PieChart>
                <Pie data={repairStatusData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value">
                  {repairStatusData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
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
                      <div className="h-full group-hover/item:opacity-100 opacity-70 transition-all duration-1000" style={{ backgroundColor: COLORS[i % COLORS.length], width: `${(item.value / 27) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Ranking */}
        <Card className="lg:col-span-2 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm self-stretch">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" /> Servicios Más Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] pt-4">
            <ResponsiveContainer width="100%" height="100%" debounce={50} minHeight={0}>
              <BarChart data={topServicesData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--foreground))' }} width={140} />
                <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={18} background={{ fill: 'hsl(var(--muted))', radius: 8 }}>
                  {topServicesData.map((_, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#3b82f690'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointments Capacity */}
        <Card className="shadow-lg border-border/50 bg-card/50 backdrop-blur-sm self-stretch">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" /> Flujo de Agendamientos
            </CardTitle>
            <CardDescription>Ocupación por jornada horaria</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] pt-2">
            <ResponsiveContainer width="100%" height="100%" debounce={50} minHeight={0}>
              <AreaChart data={appointmentCapacityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis hide domain={[0, 110]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ocupacion" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOcupacion)" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
