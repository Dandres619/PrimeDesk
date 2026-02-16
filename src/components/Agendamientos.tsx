import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ConfirmDialog } from './ConfirmDialog';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  User,
  Edit,
  Trash2,
  AlertCircle,
  Wrench
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export function Agendamientos() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);
  const [additionalAppointmentsOpen, setAdditionalAppointmentsOpen] = useState(false);
  const [additionalAppointments, setAdditionalAppointments] = useState<any[]>([]);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: 'delete' | 'cancel' | 'default';
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'default',
    onConfirm: () => {}
  });

  // Datos de ejemplo - en producción vendrían de APIs
  const mechanics = [
    { 
      id: 1, 
      name: 'Carlos Méndez', 
      schedule: {
        days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        startTime: '08:00',
        endTime: '17:00'
      }
    },
    { 
      id: 2, 
      name: 'Luis García', 
      schedule: {
        days: ['Lunes', 'Miércoles', 'Viernes'],
        startTime: '09:00',
        endTime: '18:00'
      }
    },
    { 
      id: 3, 
      name: 'José Rodríguez', 
      schedule: {
        days: ['Martes', 'Jueves'],
        startTime: '07:30',
        endTime: '16:30'
      }
    },
    { 
      id: 4, 
      name: 'Miguel Torres', 
      schedule: {
        days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        startTime: '08:30',
        endTime: '17:30'
      }
    }
  ];

  const clients = [
    { id: 1, name: 'Juan Carlos Pérez', phone: '+57 300 123 4567' },
    { id: 2, name: 'María García López', phone: '+57 301 234 5678' },
    { id: 3, name: 'Carlos Eduardo López', phone: '+57 302 345 6789' },
    { id: 4, name: 'Ana Sofía Martínez', phone: '+57 303 456 7890' }
  ];

  const motorcycles = [
    { id: 1, brand: 'Honda', model: 'CB600F', plate: 'ABC123', clientId: 1 },
    { id: 2, brand: 'Yamaha', model: 'R6', plate: 'XYZ789', clientId: 2 },
    { id: 3, brand: 'Suzuki', model: 'GSX-R750', plate: 'DEF456', clientId: 3 },
    { id: 4, brand: 'Kawasaki', model: 'Ninja 650', plate: 'GHI789', clientId: 4 }
  ];

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      date: '2025-10-16',
      startTime: '09:00',
      endTime: '11:00',
      clientId: 1,
      clientName: 'Juan Carlos Pérez',
      motorcycleId: 1,
      motorcycleBrand: 'Honda',
      motorcycleModel: 'CB600F',
      motorcyclePlate: 'ABC123',
      mechanicId: 1,
      mechanicName: 'Carlos Méndez',
      serviceTypes: ['Mantenimiento Preventivo'],
      notes: 'Cliente requiere entrega antes de las 5 PM',
      status: 'Programada'
    },
    {
      id: 2,
      date: '2025-10-16',
      startTime: '14:00',
      endTime: '16:00',
      clientId: 2,
      clientName: 'María García López',
      motorcycleId: 2,
      motorcycleBrand: 'Yamaha',
      motorcycleModel: 'R6',
      motorcyclePlate: 'XYZ789',
      mechanicId: 2,
      mechanicName: 'Luis García',
      serviceTypes: ['Reparación de Frenos'],
      notes: 'Requiere piezas especiales',
      status: 'Programada'
    },
    {
      id: 3,
      date: '2025-10-17',
      startTime: '10:00',
      endTime: '12:00',
      clientId: 3,
      clientName: 'Carlos Eduardo López',
      motorcycleId: 3,
      motorcycleBrand: 'Suzuki',
      motorcycleModel: 'GSX-R750',
      motorcyclePlate: 'DEF456',
      mechanicId: 3,
      mechanicName: 'José Rodríguez',
      serviceTypes: ['Diagnóstico General'],
      notes: '',
      status: 'Programada'
    },
    {
      id: 4,
      date: '2025-10-20',
      startTime: '15:00',
      endTime: '17:00',
      clientId: 4,
      clientName: 'Ana Sofía Martínez',
      motorcycleId: 4,
      motorcycleBrand: 'Kawasaki',
      motorcycleModel: 'Ninja 650',
      motorcyclePlate: 'GHI789',
      mechanicId: 4,
      mechanicName: 'Miguel Torres',
      serviceTypes: ['Cambio de Aceite', 'Afinación'],
      notes: 'Revisar nivel de líquidos',
      status: 'Programada'
    },
    {
      id: 5,
      date: '2025-10-21',
      startTime: '08:00',
      endTime: '10:00',
      clientId: 2,
      clientName: 'María García López',
      motorcycleId: 2,
      motorcycleBrand: 'Yamaha',
      motorcycleModel: 'R6',
      motorcyclePlate: 'XYZ789',
      mechanicId: 1,
      mechanicName: 'Carlos Méndez',
      serviceTypes: ['Mantenimiento Preventivo', 'Diagnóstico General'],
      notes: 'Primera revisión del mes',
      status: 'Programada'
    },
    {
      id: 6,
      date: '2025-10-22',
      startTime: '11:30',
      endTime: '13:00',
      clientId: 3,
      clientName: 'Carlos Eduardo López',
      motorcycleId: 3,
      motorcycleBrand: 'Suzuki',
      motorcycleModel: 'GSX-R750',
      motorcyclePlate: 'DEF456',
      mechanicId: 3,
      mechanicName: 'José Rodríguez',
      serviceTypes: ['Reparación de Motor'],
      notes: 'Revisar sistema de enfriamiento',
      status: 'Programada'
    },
    {
      id: 7,
      date: '2025-10-23',
      startTime: '14:00',
      endTime: '16:00',
      clientId: 1,
      clientName: 'Juan Carlos Pérez',
      motorcycleId: 1,
      motorcycleBrand: 'Honda',
      motorcycleModel: 'CB600F',
      motorcyclePlate: 'ABC123',
      mechanicId: 1,
      mechanicName: 'Carlos Méndez',
      serviceTypes: ['Revisión General'],
      notes: 'Chequeo completo',
      status: 'Programada'
    },
    {
      id: 8,
      date: '2025-10-24',
      startTime: '16:30',
      endTime: '18:00',
      clientId: 4,
      clientName: 'Ana Sofía Martínez',
      motorcycleId: 4,
      motorcycleBrand: 'Kawasaki',
      motorcycleModel: 'Ninja 650',
      motorcyclePlate: 'GHI789',
      mechanicId: 2,
      mechanicName: 'Luis García',
      serviceTypes: ['Cambio de Pastillas'],
      notes: 'Pastillas delanteras',
      status: 'Programada'
    }
  ]);

  const serviceTypes = [
    'Mantenimiento Preventivo',
    'Reparación de Motor',
    'Reparación de Frenos',
    'Cambio de Transmisión',
    'Diagnóstico General',
    'Personalización',
    'Cambio de Aceite',
    'Afinación'
  ];

  // Función para generar horas disponibles
  const generateTimeSlots = (start: string, end: string) => {
    const slots = [];
    const startHour = parseInt(start.split(':')[0]);
    const startMinute = parseInt(start.split(':')[1]);
    const endHour = parseInt(end.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour + 1 < endHour) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    
    return slots;
  };

  // Función para obtener disponibilidad de mecánicos en una fecha
  const getMechanicAvailability = (date: Date, selectedMechanicId?: number) => {
    const dayName = format(date, 'EEEE', { locale: es });
    const dayNameSpanish = {
      'lunes': 'Lunes',
      'martes': 'Martes',
      'miércoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sábado': 'Sábado',
      'domingo': 'Domingo'
    }[dayName] || dayName;

    return mechanics.filter(mechanic => 
      mechanic.schedule.days.includes(dayNameSpanish)
    ).map(mechanic => {
      const timeSlots = generateTimeSlots(mechanic.schedule.startTime, mechanic.schedule.endTime);
      const dateString = format(date, 'yyyy-MM-dd');
      
      // Filtrar slots ocupados
      const occupiedSlots = appointments
        .filter(apt => apt.date === dateString && apt.mechanicId === mechanic.id)
        .map(apt => {
          const startHour = parseInt(apt.startTime.split(':')[0]);
          const endHour = parseInt(apt.endTime.split(':')[0]);
          const slots = [];
          for (let hour = startHour; hour < endHour; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
          }
          return slots;
        })
        .flat();

      const availableSlots = timeSlots.filter(slot => !occupiedSlots.includes(slot));

      return {
        ...mechanic,
        availableSlots,
        occupiedSlots: [...new Set(occupiedSlots)]
      };
    });
  };

  // Función para obtener citas de un día específico
  const getDayAppointments = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === dateString);
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  // Función para manejar clic en día
  const handleDayClick = (date: Date) => {
    // Solo permitir días laborables (lunes a viernes) y días futuros o hoy
    const dayOfWeek = date.getDay();
    
    // Validación para fines de semana
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast.error('No se pueden agendar citas los fines de semana');
      return;
    }

    // Validación para días pasados
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0);
    
    if (selectedDay < today) {
      toast.error('No se pueden agendar citas en fechas pasadas');
      return;
    }

    // Ir directo al modal de crear agendamiento
    setSelectedDate(date);
    setEditingAppointment(null);
    setAppointmentModalOpen(true);
  };

  // Función para manejar clic en "+x más"
  const handleShowAdditionalAppointments = (dayAppointments: any[]) => {
    setAdditionalAppointments(dayAppointments.slice(2));
    setAdditionalAppointmentsOpen(true);
  };

  // Función para editar cita
  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    setAppointmentDetailsOpen(false);
    setAdditionalAppointmentsOpen(false);
    setAppointmentModalOpen(true);
  };

  // Función para eliminar cita
  const handleDeleteAppointment = (appointmentId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Eliminar Agendamiento',
      description: '¿Está seguro de que desea eliminar este agendamiento? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'delete',
      onConfirm: () => {
        setAppointments(appointments.filter(apt => apt.id !== appointmentId));
        setAppointmentDetailsOpen(false);
        setAdditionalAppointmentsOpen(false);
        toast.success('Agendamiento eliminado exitosamente');
      }
    });
  };

  // Función para guardar cita
  const handleSaveAppointment = (appointmentData: any) => {
    if (editingAppointment) {
      setAppointments(appointments.map(apt => 
        apt.id === editingAppointment.id ? { ...apt, ...appointmentData } : apt
      ));
      toast.success('Agendamiento actualizado exitosamente');
    } else {
      const newAppointment = {
        id: Date.now(),
        ...appointmentData,
        status: 'Programada'
      };
      setAppointments([...appointments, newAppointment]);
      toast.success('Agendamiento creado exitosamente');
    }
    setAppointmentModalOpen(false);
    setEditingAppointment(null);
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      {/* Calendario */}
      <Card className="shadow-lg border-border/50">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Calendario de Agendamientos</span>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-[200px] text-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50">
                <h3 className="font-semibold capitalize text-blue-900 dark:text-blue-100">
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {day}
              </div>
            ))}
          </div>

          {/* Días del calendario */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const dayAppointments = getDayAppointments(day);
              const isClickable = isCurrentMonth && !isWeekend && (day >= new Date() || isSameDay(day, new Date()));
              const isTodayDate = isToday(day);
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 rounded-xl border-2 transition-all duration-200 relative overflow-hidden group
                    ${!isCurrentMonth ? 'bg-muted/30 text-muted-foreground border-border/30' : 'bg-card border-border'}
                    ${isWeekend ? 'bg-muted/50 dark:bg-muted/20 border-border/50' : ''}
                    ${isTodayDate ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-400 dark:border-blue-600 shadow-md' : ''}
                    ${isClickable ? 'hover:shadow-lg hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer hover:-translate-y-0.5' : 'cursor-not-allowed opacity-60'}
                  `}
                  onClick={() => isClickable && handleDayClick(day)}
                >
                  {/* Indicador de esquina para día actual */}
                  {isTodayDate && (
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-r-[24px] border-t-blue-500 dark:border-t-blue-400 border-r-transparent" />
                  )}
                  
                  <div className={`
                    font-semibold mb-2 flex items-center justify-between
                    ${isTodayDate ? 'text-blue-700 dark:text-blue-300' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    <span className={`
                      ${isTodayDate ? 'w-7 h-7 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {dayAppointments.length > 0 && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                        {dayAppointments.length}
                      </div>
                    )}
                  </div>
                  
                  {/* Eventos del día */}
                  <div className="space-y-1.5">
                    {dayAppointments.slice(0, 2).map(appointment => (
                      <div
                        key={appointment.id}
                        className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 text-white px-2 py-1.5 rounded-lg cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-150 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(appointment);
                          setAppointmentDetailsOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="truncate">{appointment.startTime}</span>
                        </div>
                        <div className="truncate opacity-90">
                          {appointment.clientName}
                        </div>
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div 
                        className="text-xs text-blue-700 dark:text-blue-300 font-semibold pl-2 cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowAdditionalAppointments(dayAppointments);
                        }}
                      >
                        +{dayAppointments.length - 2} más
                      </div>
                    )}
                  </div>
                  
                  {/* Efecto hover para días clickeables */}
                  {isClickable && (
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 dark:group-hover:bg-blue-400/5 rounded-xl transition-colors duration-200 pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal de agendamiento */}
      <AppointmentModal
        open={appointmentModalOpen}
        onOpenChange={setAppointmentModalOpen}
        appointment={editingAppointment}
        selectedDate={selectedDate}
        clients={clients}
        motorcycles={motorcycles}
        mechanics={mechanics}
        serviceTypes={serviceTypes}
        appointments={appointments}
        getMechanicAvailability={getMechanicAvailability}
        onSave={handleSaveAppointment}
      />

      {/* Modal de detalles de cita */}
      <AppointmentDetailsModal
        open={appointmentDetailsOpen}
        onOpenChange={setAppointmentDetailsOpen}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onDelete={handleDeleteAppointment}
      />

      {/* Modal de agendamientos adicionales */}
      <AdditionalAppointmentsModal
        open={additionalAppointmentsOpen}
        onOpenChange={setAdditionalAppointmentsOpen}
        appointments={additionalAppointments}
        onSelectAppointment={(appointment) => {
          setSelectedAppointment(appointment);
          setAdditionalAppointmentsOpen(false);
          setAppointmentDetailsOpen(true);
        }}
      />

      {/* Dialog de confirmación */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}

// Componente para crear/editar agendamientos
function AppointmentModal({ open, onOpenChange, appointment, selectedDate, clients, motorcycles, mechanics, serviceTypes, appointments, getMechanicAvailability, onSave }: any) {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    clientId: '',
    motorcycleId: '',
    mechanicId: '',
    serviceTypes: [] as string[],
    notes: ''
  });

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  React.useEffect(() => {
    if (appointment) {
      setFormData({
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        clientId: appointment.clientId.toString(),
        motorcycleId: appointment.motorcycleId.toString(),
        mechanicId: appointment.mechanicId.toString(),
        serviceTypes: appointment.serviceTypes,
        notes: appointment.notes || ''
      });
    } else if (selectedDate) {
      setFormData({
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: '',
        endTime: '',
        clientId: '',
        motorcycleId: '',
        mechanicId: '',
        serviceTypes: [],
        notes: ''
      });
    }
  }, [appointment, selectedDate, open]);

  // Actualizar horarios disponibles cuando cambia el mecánico o la fecha
  React.useEffect(() => {
    console.log('🔄 useEffect ejecutándose');
    console.log('mechanicId:', formData.mechanicId);
    console.log('date:', formData.date);
    console.log('Total appointments:', appointments.length);
    
    if (formData.mechanicId && formData.date) {
      // Usar parseISO para evitar problemas de zona horaria
      const selectedDate = parseISO(formData.date);
      const dateString = formData.date; // Usar directamente el string de fecha
      
      const mechanic = mechanics.find((m: any) => m.id === parseInt(formData.mechanicId));
      
      console.log('Mecánico encontrado:', mechanic);
      
      if (mechanic) {
        const dayName = format(selectedDate, 'EEEE', { locale: es });
        const dayNameSpanish = {
          'lunes': 'Lunes',
          'martes': 'Martes',
          'miércoles': 'Miércoles',
          'jueves': 'Jueves',
          'viernes': 'Viernes',
          'sábado': 'Sábado',
          'domingo': 'Domingo'
        }[dayName.toLowerCase()] || dayName;

        console.log('Día de la semana:', dayNameSpanish);
        console.log('Horario del mecánico:', mechanic.schedule);

        if (mechanic.schedule.days.includes(dayNameSpanish)) {
          console.log('✅ Mecánico trabaja este día. Fecha:', dateString);
          
          // Generar slots de tiempo
          const timeSlots = [];
          const startHour = parseInt(mechanic.schedule.startTime.split(':')[0]);
          const endHour = parseInt(mechanic.schedule.endTime.split(':')[0]);
          
          for (let hour = startHour; hour < endHour; hour++) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            if (hour + 1 < endHour) {
              timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
            }
          }

          console.log('Slots de tiempo generados:', timeSlots);

          // Filtrar agendamientos del mecánico para esta fecha
          const mechanicAppointmentsOnDate = appointments.filter((apt: any) => {
            const matches = apt.date === dateString && 
                           apt.mechanicId === parseInt(formData.mechanicId) &&
                           (!appointment || apt.id !== appointment.id);
            
            if (matches) {
              console.log('📅 Agendamiento encontrado:', {
                id: apt.id,
                startTime: apt.startTime,
                endTime: apt.endTime,
                mechanicName: apt.mechanicName
              });
            }
            
            return matches;
          });

          console.log('Agendamientos del mecánico en esta fecha:', mechanicAppointmentsOnDate);

          // Calcular slots ocupados
          const occupiedSlots = mechanicAppointmentsOnDate
            .map((apt: any) => {
              const startHour = parseInt(apt.startTime.split(':')[0]);
              const startMinute = parseInt(apt.startTime.split(':')[1] || '0');
              const endHour = parseInt(apt.endTime.split(':')[0]);
              const endMinute = parseInt(apt.endTime.split(':')[1] || '0');
              const slots = [];
              
              let currentHour = startHour;
              let currentMinute = startMinute;
              
              while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
                slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
                
                currentMinute += 30;
                if (currentMinute >= 60) {
                  currentMinute = 0;
                  currentHour += 1;
                }
              }
              
              console.log(`Slots ocupados para agendamiento ${apt.id}:`, slots);
              return slots;
            })
            .flat();

          const uniqueOccupiedSlots = [...new Set(occupiedSlots)];
          console.log('🚫 Slots ocupados totales:', uniqueOccupiedSlots);
          
          const availableSlots = timeSlots.filter(slot => !uniqueOccupiedSlots.includes(slot));
          console.log('✅ Slots disponibles:', availableSlots);
          
          setAvailableTimeSlots(availableSlots);
        } else {
          console.log('❌ Mecánico NO trabaja este día');
          setAvailableTimeSlots([]);
        }
      }
    } else {
      console.log('❌ Falta mecánico o fecha');
      setAvailableTimeSlots([]);
    }
  }, [formData.mechanicId, formData.date, appointments, appointment, mechanics]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.mechanicId || !formData.startTime || !formData.endTime) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    if (formData.serviceTypes.length === 0) {
      toast.error('Por favor seleccione al menos un tipo de servicio');
      return;
    }

    const client = clients.find((c: any) => c.id === parseInt(formData.clientId));
    const motorcycle = motorcycles.find((m: any) => m.id === parseInt(formData.motorcycleId));
    const mechanic = mechanics.find((m: any) => m.id === parseInt(formData.mechanicId));

    const appointmentData = {
      ...formData,
      clientId: parseInt(formData.clientId),
      clientName: client?.name || '',
      motorcycleId: parseInt(formData.motorcycleId),
      motorcycleBrand: motorcycle?.brand || '',
      motorcycleModel: motorcycle?.model || '',
      motorcyclePlate: motorcycle?.plate || '',
      mechanicId: parseInt(formData.mechanicId),
      mechanicName: mechanic?.name || ''
    };

    onSave(appointmentData);
    
    // Reset form
    setFormData({
      date: '',
      startTime: '',
      endTime: '',
      clientId: '',
      motorcycleId: '',
      mechanicId: '',
      serviceTypes: [],
      notes: ''
    });
  };

  const clientMotorcycles = motorcycles.filter((m: any) => 
    m.clientId === parseInt(formData.clientId)
  );

  // Verificar qué clientes ya tienen agendamiento en la fecha seleccionada
  const getClientStatus = (clientId: number) => {
    if (!formData.date) return { hasAppointment: false, isEditing: false };
    
    const hasAppointment = appointments.some((apt: any) => 
      apt.date === formData.date && 
      apt.clientId === clientId &&
      (!appointment || apt.id !== appointment.id) // Excluir si es la cita que se está editando
    );
    
    const isEditing = appointment && appointment.clientId === clientId;
    
    return { hasAppointment, isEditing };
  };

  const availableMechanics = formData.date ? 
    getMechanicAvailability(new Date(formData.date)) : 
    mechanics;

  const formattedDate = formData.date ? format(parseISO(formData.date), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es }) : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {appointment ? 'Editar Agendamiento' : 'Nuevo Agendamiento'}
              </DialogTitle>
              {formData.date && (
                <p className="text-sm text-muted-foreground mt-1 capitalize">
                  {formattedDate}
                </p>
              )}
            </div>
            <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Sección de cliente y moto */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-4 h-4" />
              <span className="font-medium">Cliente y Motocicleta</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div>
                <Label htmlFor="client" className="text-xs text-muted-foreground">
                  Cliente *
                </Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value, motorcycleId: '' }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => {
                      const status = getClientStatus(client.id);
                      const isDisabled = status.hasAppointment && !status.isEditing;
                      
                      return (
                        <SelectItem 
                          key={client.id} 
                          value={client.id.toString()}
                          disabled={isDisabled}
                          className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{client.name}</span>
                            {isDisabled && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                Ya tiene agendamiento
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="motorcycle" className="text-xs text-muted-foreground">
                  Motocicleta *
                </Label>
                <Select
                  value={formData.motorcycleId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, motorcycleId: value }))}
                  disabled={!formData.clientId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar moto" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientMotorcycles.map((motorcycle: any) => (
                      <SelectItem key={motorcycle.id} value={motorcycle.id.toString()}>
                        {motorcycle.brand} {motorcycle.model} - {motorcycle.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t pt-4" />

          {/* Sección de mecánico */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4" />
              <span className="font-medium">Mecánico Asignado</span>
            </div>
            <div className="pl-6">
              <Select
                value={formData.mechanicId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, mechanicId: value, startTime: '', endTime: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mecánico" />
                </SelectTrigger>
                <SelectContent>
                  {availableMechanics.map((mechanic: any) => (
                    <SelectItem key={mechanic.id} value={mechanic.id.toString()}>
                      {mechanic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4" />

          {/* Sección de horario */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Horario</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div>
                <Label htmlFor="startTime" className="text-xs text-muted-foreground">
                  Hora de inicio *
                </Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}
                  disabled={!formData.mechanicId || availableTimeSlots.length === 0}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={availableTimeSlots.length === 0 && formData.mechanicId ? "Sin horarios disponibles" : "Seleccionar hora"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endTime" className="text-xs text-muted-foreground">
                  Hora de fin *
                </Label>
                <Select
                  value={formData.endTime}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
                  disabled={!formData.startTime}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots
                      .filter(time => time > formData.startTime)
                      .map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t pt-4" />

          {/* Sección de servicios */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Wrench className="w-4 h-4" />
              <span className="font-medium">Servicios a realizar *</span>
            </div>
            <div className="pl-6">
              <div className="grid grid-cols-2 gap-3">
                {serviceTypes.map((service: string) => (
                  <div key={service} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      id={`service-${service}`}
                      checked={formData.serviceTypes.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            serviceTypes: [...prev.serviceTypes, service]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            serviceTypes: prev.serviceTypes.filter(s => s !== service)
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`service-${service}`} className="text-sm cursor-pointer">
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-4" />

          {/* Sección de notas */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Notas adicionales
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Agregar instrucciones especiales, observaciones o detalles importantes..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6">
              {appointment ? 'Guardar Cambios' : 'Crear Agendamiento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Componente para mostrar detalles de cita
function AppointmentDetailsModal({ open, onOpenChange, appointment, onEdit, onDelete }: any) {
  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-1">
                {appointment.clientName}
              </DialogTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {format(parseISO(appointment.date), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Botones de acción arriba */}
        <div className="flex gap-2 pb-4 border-b">
          <Button
            variant="outline"
            onClick={() => onEdit(appointment)}
            className="flex items-center gap-2 flex-1"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete(appointment.id)}
            className="flex items-center gap-2 flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </Button>
        </div>
        
        {/* Información del agendamiento */}
        <div className="space-y-4 py-2">
          {/* Horario */}
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-700 p-2 rounded-lg mt-1">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Horario</p>
              <p className="font-medium">{appointment.startTime} – {appointment.endTime}</p>
              <p className="text-xs text-muted-foreground mt-0.5">La duración es aproximada</p>
            </div>
          </div>

          {/* Mecánico */}
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 text-purple-700 p-2 rounded-lg mt-1">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Mecánico asignado</p>
              <p className="font-medium">{appointment.mechanicName}</p>
            </div>
          </div>

          {/* Motocicleta */}
          <div className="flex items-start gap-3">
            <div className="bg-green-100 text-green-700 p-2 rounded-lg mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Motocicleta</p>
              <p className="font-medium">
                {appointment.motorcycleBrand} {appointment.motorcycleModel}
              </p>
              <p className="text-sm text-muted-foreground">
                Placa: {appointment.motorcyclePlate}
              </p>
            </div>
          </div>

          {/* Servicios */}
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 text-orange-700 p-2 rounded-lg mt-1">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">Servicios a realizar</p>
              <div className="flex flex-wrap gap-2">
                {appointment.serviceTypes.map((service: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Notas */}
          {appointment.notes && (
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 text-gray-700 p-2 rounded-lg mt-1">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Notas adicionales</p>
                <p className="text-sm bg-gray-50 p-3 rounded-lg border">
                  {appointment.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente para mostrar agendamientos adicionales
function AdditionalAppointmentsModal({ open, onOpenChange, appointments, onSelectAppointment }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agendamientos Adicionales</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {appointments.map((appointment: any) => (
            <div
              key={appointment.id}
              className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              onClick={() => onSelectAppointment(appointment)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{appointment.startTime} - {appointment.endTime}</span>
                </div>
              </div>
              <p className="font-medium text-foreground">{appointment.clientName}</p>
              <p className="text-sm text-muted-foreground">
                {appointment.motorcycleBrand} {appointment.motorcycleModel}
              </p>
              <p className="text-sm text-muted-foreground">
                Mecánico: {appointment.mechanicName}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}