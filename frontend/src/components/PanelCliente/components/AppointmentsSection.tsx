import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface AppointmentsSectionProps {
  currentDate: Date;
  isLoadingData?: boolean;
  setCurrentDate: (date: Date) => void;
  getAppointmentsForDate: (date: Date) => any[];
  handleDateClick: (date: Date) => void;
  setSelectedAppointment: (apt: any) => void;
  setAppointmentDetailsOpen: (open: boolean) => void;
}

export function AppointmentsSection({
  currentDate,
  isLoadingData,
  setCurrentDate,
  getAppointmentsForDate,
  handleDateClick,
  setSelectedAppointment,
  setAppointmentDetailsOpen
}: AppointmentsSectionProps) {
  if (isLoadingData) {
    return (
      <div className="mp-loading">
        <div className="mp-loading-ring" />
        <p className="mp-loading-text">Cargando información...</p>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const rows: Date[][] = [];
  let days: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado': return 'bg-blue-500';
      case 'en_proceso': return 'bg-yellow-500';
      case 'completado': return 'bg-emerald-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <CardTitle>Calendario de Citas</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="calendar-grid rounded-xl overflow-hidden shadow-sm">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="bg-slate-50 dark:bg-slate-900/50 p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                {d}
              </div>
            ))}
            {rows.map((row, i) => (
              row.map((d, j) => {
                const dayApts = getAppointmentsForDate(d);
                return (
                  <div
                    key={`${i}-${j}`}
                    onClick={() => handleDateClick(d)}
                    className={`calendar-day ${!isSameMonth(d, monthStart) ? 'other-month' : ''} ${isToday(d) ? 'today' : ''} cursor-pointer relative group`}
                  >
                    <span className={`text-sm font-bold ${isToday(d) ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`}>
                      {format(d, 'd')}
                    </span>
                    <div className="mt-2 space-y-1">
                      {dayApts.map(apt => (
                        <div
                          key={apt.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedAppointment(apt); setAppointmentDetailsOpen(true); }}
                          className={`text-[10px] p-1.5 rounded-lg text-white truncate shadow-sm hover:scale-105 transition-transform ${getStatusColor(apt.serviceTypes[0] || 'Confirmado')}`}
                        >
                          {apt.startTime} - {apt.motoPlate}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
