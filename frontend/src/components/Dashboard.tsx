import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Calendar, 
  Bike, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertCircle,
  DollarSign,
  Package,
  ShoppingCart
} from 'lucide-react';

export function Dashboard() {
  const [salesPeriod, setSalesPeriod] = useState<'day' | 'week' | 'month'>('month');

  const salesData = {
    day: {
      value: '$185,000',
      change: '+8%'
    },
    week: {
      value: '$950,000',
      change: '+12%'
    },
    month: {
      value: '$2,450,000',
      change: '+15%'
    }
  };

  const getSalesTitle = () => {
    switch (salesPeriod) {
      case 'day': return 'Ventas del Día';
      case 'week': return 'Ventas de la Semana';
      case 'month': return 'Ventas del Mes';
    }
  };

  const stats = [
    {
      title: 'Total Citas Agendadas',
      value: '24',
      change: '+12%',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Motos en Servicio',
      value: '8',
      change: '+3',
      icon: Bike,
      color: 'text-orange-600'
    },
    {
      title: 'Entregas Realizadas',
      value: '16',
      change: '+8%',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: getSalesTitle(),
      value: salesData[salesPeriod].value,
      change: salesData[salesPeriod].change,
      icon: DollarSign,
      color: 'text-purple-600',
      interactive: true
    }
  ];

  const recentAppointments = [
    { id: 1, client: 'Juan Pérez', motorcycle: 'Honda CB600F', time: '10:00 AM' },
    { id: 2, client: 'María García', motorcycle: 'Yamaha R6', time: '11:30 AM' },
    { id: 3, client: 'Carlos López', motorcycle: 'Suzuki GSX-R', time: '2:00 PM' },
    { id: 4, client: 'Ana Rodríguez', motorcycle: 'Kawasaki Ninja', time: '3:30 PM' }
  ];

  const recentActivity = [
    { id: 1, type: 'Compra', item: 'Repuestos Yamaha', date: '20 Oct 2025', icon: ShoppingCart, color: 'text-blue-600' },
    { id: 2, type: 'Venta', item: 'Servicio Mantenimiento', date: '19 Oct 2025', icon: DollarSign, color: 'text-green-600' },
    { id: 3, type: 'Pedido', item: 'Honda CB600F - Cliente: Juan Pérez', date: '18 Oct 2025', icon: Bike, color: 'text-orange-600' },
    { id: 4, type: 'Producto', item: 'Aceite Motul 10W40 - 5 unidades', date: '17 Oct 2025', icon: Package, color: 'text-purple-600' }
  ];

  const technicalObservations = [
    { id: 1, motorcycle: 'Honda CB600F', observation: 'Revisar frenos traseros', tech: 'Miguel Torres' },
    { id: 2, motorcycle: 'Yamaha R6', observation: 'Cambio de aceite programado', tech: 'Roberto Silva' },
    { id: 3, motorcycle: 'Suzuki GSX-R', observation: 'Inspección general completada', tech: 'Carlos Mendez' },
    { id: 4, motorcycle: 'Kawasaki Ninja', observation: 'Ajuste de cadena necesario', tech: 'Miguel Torres' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En progreso': return 'bg-blue-100 text-blue-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Completado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                {stat.change} desde el mes pasado
              </p>
              {stat.interactive && (
                <div className="flex gap-1 mt-3">
                  <Button
                    size="sm"
                    variant={salesPeriod === 'day' ? 'default' : 'outline'}
                    onClick={() => setSalesPeriod('day')}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Día
                  </Button>
                  <Button
                    size="sm"
                    variant={salesPeriod === 'week' ? 'default' : 'outline'}
                    onClick={() => setSalesPeriod('week')}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Semana
                  </Button>
                  <Button
                    size="sm"
                    variant={salesPeriod === 'month' ? 'default' : 'outline'}
                    onClick={() => setSalesPeriod('month')}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Mes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Actividad Reciente del Taller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border">
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">{activity.item}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Agendamientos de hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{appointment.client}</p>
                    <p className="text-sm text-muted-foreground">{appointment.motorcycle}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {appointment.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Observations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Observaciones Recientes de Técnicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {technicalObservations.map((obs) => (
              <div key={obs.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{obs.motorcycle}</p>
                  <p className="text-sm text-muted-foreground mb-1">{obs.observation}</p>
                  <p className="text-xs text-muted-foreground">Técnico: {obs.tech}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
