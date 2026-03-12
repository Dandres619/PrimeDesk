import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ConfirmDialog } from './ConfirmDialog';
import { Edit, Trash2, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Eye, Loader2, Wrench } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, parseISO, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function Agendamientos() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<any>(null);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [moreApts, setMoreApts] = useState<any[]>([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => { } });

  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [motorcycles, setMotorcycles] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const results = await Promise.allSettled([
      fetch(`${API_URL}/agendamientos`, { headers }),
      fetch(`${API_URL}/clientes`, { headers }),
      fetch(`${API_URL}/motocicletas`, { headers }),
      fetch(`${API_URL}/empleados`, { headers }),
      fetch(`${API_URL}/servicios`, { headers }),
      fetch(`${API_URL}/horarios`, { headers }),
    ]);

    try {
      const [resAg, resCli, resMot, resEmp, resSer, resHor] = results;

      if (resAg.status === 'fulfilled' && resAg.value.ok) {
        const data = await resAg.value.json();
        setAppointments(data.map((a: any) => ({
          id: a.ID_Agendamiento,
          date: a.Dia ? a.Dia.substring(0, 10) : '',
          startTime: a.HoraInicio ? a.HoraInicio.substring(0, 5) : '',
          endTime: a.HoraFin ? a.HoraFin.substring(0, 5) : '',
          motorcycleId: a.ID_Motocicleta,
          motorcyclePlate: a.Placa,
          motorcycleBrand: a.Marca,
          motorcycleModel: a.Modelo,
          mechanicId: a.ID_Empleado,
          mechanicName: `${a.NombreEmpleado} ${a.ApellidoEmpleado}`,
          notes: a.Notas || '',
          serviceTypes: Array.isArray(a.Servicios) ? a.Servicios : [],
          serviceIds: [],
        })));
      }

      if (resCli.status === 'fulfilled' && resCli.value.ok) {
        setClients(await resCli.value.json());
      }

      if (resMot.status === 'fulfilled' && resMot.value.ok) {
        const motoData = await resMot.value.json();
        setMotorcycles(motoData.filter((m: any) => m.Estado !== false));
      }

      if (resEmp.status === 'fulfilled' && resEmp.value.ok) {
        const empData = await resEmp.value.json();
        setMechanics(empData.filter((e: any) => e.NombreRol === 'Empleado' && e.EstadoUsuario !== false));
      }

      if (resSer.status === 'fulfilled' && resSer.value.ok) {
        const svcData = await resSer.value.json();
        setServices(svcData.filter((s: any) => s.Estado !== false));
      }

      if (resHor.status === 'fulfilled' && resHor.value.ok) {
        setHorarios(await resHor.value.json());
      }
    } catch (err: any) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhance appointments with client info from motorcycles + clients
  const enrichedApts = useMemo(() => appointments.map(a => {
    const moto = motorcycles.find(m => m.ID_Motocicleta === a.motorcycleId);
    const client = clients.find(c => c.ID_Cliente === moto?.ID_Cliente);
    return {
      ...a,
      clientId: client?.ID_Cliente,
      clientName: client ? `${client.Nombre} ${client.Apellido || ''}`.trim() : 'Cliente desconocido',
      clientPhone: client?.Telefono || ''
    };
  }), [appointments, motorcycles, clients]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) { days.push(day); day = addDays(day, 1); }
    return days;
  }, [currentDate]);

  const handleSave = async (data: any) => {
    const isEditing = !!editingApt;
    try {
      if (!isEditing) {
        // POST create
        const res = await fetch(`${API_URL}/agendamientos`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_motocicleta: parseInt(data.motorcycleId),
            id_empleado: parseInt(data.mechanicId),
            dia: data.date,
            horainicio: data.startTime,
            horafin: data.endTime,
            notas: data.notes || null,
            servicios: data.serviceIds || []
          })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || err.errors?.[0]?.msg || 'Error al crear agendamiento');
        }
        const created = await res.json();
        toast.success(`Agendamiento creado. Reparación #${created.ID_Reparacion} generada automáticamente.`);
      } else {
        // PUT update (no creates reparación again)
        const res = await fetch(`${API_URL}/agendamientos/${editingApt.id}`, {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_motocicleta: parseInt(data.motorcycleId),
            id_empleado: parseInt(data.mechanicId),
            dia: data.date,
            horainicio: data.startTime,
            horafin: data.endTime,
            notas: data.notes || null
          })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Error al actualizar agendamiento');
        }
        toast.success('Agendamiento actualizado exitosamente');
      }
      setIsModalOpen(false);
      setEditingApt(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (apt: any) => {
    // 1 hour check
    const aptDateTime = new Date(apt.date + 'T' + apt.startTime);
    const now = new Date();
    const diffHours = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      toast.error('Solo se puede eliminar con al menos una hora de anticipación.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/agendamientos/${apt.id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Agendamiento eliminado y reparación anulada exitosamente');
      setIsDetailsOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-border/50">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Calendario de Agendamientos</span>
              <Badge variant="secondary" className="ml-2">{enrichedApts.length} total</Badge>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="h-9 w-9 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-[200px] text-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50">
                <h3 className="font-semibold capitalize text-blue-900 dark:text-blue-100">
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="h-9 w-9 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
              <div key={d} className="p-3 text-center font-semibold text-sm text-muted-foreground uppercase tracking-wide">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, i) => {
              const isCurr = isSameMonth(day, currentDate);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayApts = enrichedApts.filter(a => a.date === dayStr);
              const isClickable = isCurr && !isWeekend;
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (!isClickable) return;
                    if (isBefore(startOfDay(day), startOfDay(new Date()))) {
                      toast.error('No se pueden agendar servicios en fechas pasadas');
                      return;
                    }
                    setSelectedDate(day);
                    setEditingApt(null);
                    setIsModalOpen(true);
                  }}
                  className={`min-h-[100px] p-2 rounded-xl border-2 transition-all relative group
                    ${!isCurr ? 'bg-muted/20 opacity-50 border-transparent' : 'bg-card border-border'}
                    ${isWeekend && isCurr ? 'bg-muted/40 border-muted opacity-70' : ''}
                    ${isToday(day) ? 'bg-blue-500/10 border-blue-400 dark:bg-blue-900/20' : ''}
                    ${isClickable ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {isToday(day) && <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-r-[24px] border-t-blue-500 border-r-transparent" />}
                  <div className={`font-semibold mb-2 flex items-center justify-between ${isToday(day) ? 'text-blue-700' : ''}`}>
                    <span className={isToday(day) ? 'w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm' : ''}>
                      {format(day, 'd')}
                    </span>
                    {dayApts.length > 0 && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                        {dayApts.length}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {dayApts.slice(0, 2).map(a => (
                      <div
                        key={a.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedApt(a); setIsDetailsOpen(true); }}
                        className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1.5 rounded-lg truncate font-medium hover:from-blue-600 hover:to-indigo-600 transition-all"
                      >
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> <span>{a.startTime}</span></div>
                        <div className="truncate opacity-90">{a.clientName}</div>
                      </div>
                    ))}
                    {dayApts.length > 2 && (
                      <div
                        className="text-xs text-blue-700 font-semibold pl-2 cursor-pointer hover:underline"
                        onClick={(e) => { e.stopPropagation(); setMoreApts(dayApts); setIsMoreOpen(true); }}
                      >
                        +{dayApts.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingApt(null); }}>
        <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingApt ? 'Editar' : 'Nuevo'} Agendamiento</DialogTitle>
          </DialogHeader>
          <AptForm
            apt={editingApt}
            date={selectedDate}
            clients={clients}
            motorcycles={motorcycles}
            mechanics={mechanics}
            services={services}
            horarios={horarios}
            existingAppointments={appointments}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>

      {/* Details dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detalles del Agendamiento</DialogTitle></DialogHeader>
          {selectedApt && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-foreground">{selectedApt.clientName}</p>
                    <p className="text-sm text-muted-foreground">{selectedApt.motorcycleBrand} {selectedApt.motorcycleModel} · {selectedApt.motorcyclePlate}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Programado</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground text-xs">Fecha</Label>
                  <p className="font-medium mt-0.5">{selectedApt.date}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Hora</Label>
                  <p className="font-medium mt-0.5">{selectedApt.startTime} - {selectedApt.endTime}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground text-xs">Mecánico Asignado</Label>
                  <p className="font-medium mt-0.5">{selectedApt.mechanicName}</p>
                </div>
                {selectedApt.serviceTypes?.length > 0 && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground text-xs">Servicios</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApt.serviceTypes.map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedApt.notes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground text-xs">Notas</Label>
                    <p className="text-sm mt-0.5 text-foreground">{selectedApt.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Wrench className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-300">Al crear este agendamiento se generó automáticamente una reparación en el módulo de Reparaciones.</p>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => { setEditingApt(selectedApt); setIsDetailsOpen(false); setIsModalOpen(true); }}>
                  <Edit className="w-4 h-4 mr-2" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setConfirmDialog({ open: true, title: 'Eliminar Agendamiento', description: '¿Está seguro? Esto también anulará la reparación vinculada.', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => handleDelete(selectedApt) })}>
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* More apts dialog */}
      <Dialog open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Agendamientos del día</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {moreApts.map(a => (
              <div
                key={a.id}
                onClick={() => { setSelectedApt(a); setIsMoreOpen(false); setIsDetailsOpen(true); }}
                className="p-3 border rounded-lg hover:bg-muted cursor-pointer flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-sm">{a.startTime} · {a.clientName}</p>
                  <p className="text-xs text-muted-foreground">{a.motorcyclePlate} · {a.mechanicName}</p>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog onOpenChange={o => setConfirmDialog(p => ({ ...p, open: o }))} {...confirmDialog} />
    </div>
  );
}

function AptForm({ apt, date, clients, motorcycles, mechanics, services, horarios, existingAppointments, onSave }: any) {
  const [form, setForm] = useState({
    date: apt?.date || (date ? format(date, 'yyyy-MM-dd') : ''),
    startTime: apt?.startTime || '',
    endTime: apt?.endTime || '',
    clientId: apt?.clientId?.toString() || '',
    motorcycleId: apt?.motorcycleId?.toString() || '',
    mechanicId: apt?.mechanicId?.toString() || '',
    serviceIds: apt?.serviceIds || [] as number[],
    notes: apt?.notes || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const daysMap: Record<number, string> = {
    1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo'
  };

  useEffect(() => {
    if (apt) {
      setForm({
        date: apt.date || '',
        startTime: apt.startTime || '',
        endTime: apt.endTime || '',
        clientId: apt.clientId?.toString() || '',
        motorcycleId: apt.motorcycleId?.toString() || '',
        mechanicId: apt.mechanicId?.toString() || '',
        serviceIds: apt.serviceIds || [],
        notes: apt.notes || ''
      });
    } else if (date) {
      setForm(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd'), startTime: '' }));
    }
  }, [apt, date]);

  // Calculate available slots
  const availableSlots = useMemo(() => {
    if (!form.mechanicId || !form.date) return [];
    
    // Check if date is in the past
    const selectedDate = parseISO(form.date);
    if (isBefore(selectedDate, startOfDay(new Date()))) return [];

    const dayName = daysMap[selectedDate.getDay()];
    const mechanicSched = horarios.filter((h: any) => 
      h.ID_Empleado === parseInt(form.mechanicId) && h.Dia === dayName && h.Estado
    );

    if (mechanicSched.length === 0) return [];

    const slots: string[] = [];
    mechanicSched.forEach((sched: any) => {
      const startStr = sched.HoraEntrada || sched.Hora_entrada;
      const endStr = sched.HoraSalida || sched.Hora_salida;

      if (!startStr || !endStr) return;

      let current = parseInt(startStr.split(':')[0]);
      const end = parseInt(endStr.split(':')[0]);
      
      while (current < end) {
        const slotTime = `${current.toString().padStart(2, '0')}:00`;
        const slotEndTime = `${(current + 1).toString().padStart(2, '0')}:00`;
        
        // Check if slot is occupied
        const isOccupied = existingAppointments.some((a: any) => 
          a.mechanicId === parseInt(form.mechanicId) &&
          a.date === form.date &&
          a.id !== apt?.id && // Don't block self when editing
          ((slotTime >= a.startTime && slotTime < a.endTime) || 
           (slotEndTime > a.startTime && slotEndTime <= a.endTime))
        );

        if (!isOccupied) {
          slots.push(slotTime);
        }
        current++;
      }
    });

    return slots;
  }, [form.mechanicId, form.date, horarios, existingAppointments, apt]);

  const clientMotorcycles = motorcycles.filter((m: any) =>
    !form.clientId || m.ID_Cliente === parseInt(form.clientId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.motorcycleId || !form.mechanicId || !form.startTime) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }
    
    // Auto-set endTime (1 hour later by default for slots)
    const [h, m] = form.startTime.split(':');
    const endTime = `${(parseInt(h) + 1).toString().padStart(2, '0')}:${m}`;
    
    setIsSaving(true);
    try {
      await onSave({ ...form, endTime });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleService = (id: number) => {
    setForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter((s: number) => s !== id)
        : [...prev.serviceIds, id]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* 1. Mechanic Selection */}
      <div className="space-y-1">
        <Label>Mecánico *</Label>
        <select
          value={form.mechanicId}
          onChange={e => setForm({ ...form, mechanicId: e.target.value, startTime: '' })}
          className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          required
        >
          <option value="">Seleccionar mecánico...</option>
          {mechanics.map((m: any) => (
            <option key={m.ID_Empleado} value={m.ID_Empleado}>{m.Nombre} {m.Apellido}</option>
          ))}
        </select>
      </div>

      {/* 2. Date Selection */}
      <div className="space-y-1">
        <Label>Fecha *</Label>
        <Input
          type="date"
          min={format(new Date(), 'yyyy-MM-dd')}
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value, startTime: '' })}
          required
          disabled={!!apt}
        />
        {apt && <p className="text-xs text-muted-foreground">La fecha no se puede cambiar al editar.</p>}
        {form.mechanicId && !form.date && <p className="text-[10px] text-blue-600">Seleccione una fecha para ver horarios disponibles</p>}
      </div>

      {/* 3. Time Slot Selection */}
      <div className="space-y-2">
        <Label>Horarios Disponibles *</Label>
        {form.mechanicId && form.date ? (
          availableSlots.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map(slot => (
                <Button
                  key={slot}
                  type="button"
                  variant={form.startTime === slot ? "default" : "outline"}
                  className="text-xs h-9"
                  onClick={() => setForm({ ...form, startTime: slot })}
                >
                  {slot}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-red-500 py-2">No hay horarios disponibles para este mecánico en la fecha seleccionada.</p>
          )
        ) : (
          <p className="text-xs text-muted-foreground py-2 italic font-light">
            {!form.mechanicId ? 'Seleccione un mecánico primero' : 'Seleccione una fecha primero'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Client */}
        <div className="space-y-1">
          <Label>Cliente *</Label>
          <select
            value={form.clientId}
            onChange={e => setForm({ ...form, clientId: e.target.value, motorcycleId: '' })}
            className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          >
            <option value="">Seleccionar cliente...</option>
            {clients.map((c: any) => (
              <option key={c.ID_Cliente} value={c.ID_Cliente}>{c.Nombre} {c.Apellido || ''}</option>
            ))}
          </select>
        </div>

        {/* Motorcycle */}
        <div className="space-y-1">
          <Label>Motocicleta *</Label>
          <select
            value={form.motorcycleId}
            onChange={e => setForm({ ...form, motorcycleId: e.target.value })}
            className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
            disabled={!form.clientId}
          >
            <option value="">Seleccionar motocicleta...</option>
            {clientMotorcycles.map((m: any) => (
              <option key={m.ID_Motocicleta} value={m.ID_Motocicleta}>
                {m.Marca} {m.Modelo} — {m.Placa}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Services */}
      {!apt && (
        <div className="space-y-2">
          <Label>Servicios</Label>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-input rounded-lg p-3">
            {services.map((s: any) => (
              <label key={s.ID_Servicio} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.serviceIds.includes(s.ID_Servicio)}
                  onChange={() => toggleService(s.ID_Servicio)}
                  className="rounded"
                />
                <span>{s.Nombre}</span>
              </label>
            ))}
            {services.length === 0 && <p className="text-xs text-muted-foreground col-span-2">No hay servicios disponibles</p>}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1">
        <Label>Notas</Label>
        <Textarea
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          placeholder="Observaciones adicionales..."
          rows={2}
        />
      </div>

      {!apt && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
          <Wrench className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Al crear este agendamiento se generará automáticamente una reparación en el módulo de Reparaciones.</span>
        </div>
      )}

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold" disabled={isSaving || !form.startTime}>
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {apt ? 'Actualizar Agendamiento' : 'Crear Agendamiento'}
      </Button>
    </form>
  );
}

