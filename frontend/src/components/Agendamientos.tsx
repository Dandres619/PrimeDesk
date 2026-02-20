import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Search, Edit, Trash2, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const mechanics = [{ id: 1, name: 'Carlos Méndez', schedule: { days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], startTime: '08:00', endTime: '17:00' } }, { id: 2, name: 'Luis García', schedule: { days: ['Lunes', 'Miércoles', 'Viernes'], startTime: '09:00', endTime: '18:00' } }, { id: 3, name: 'José Rodríguez', schedule: { days: ['Martes', 'Jueves'], startTime: '07:30', endTime: '16:30' } }, { id: 4, name: 'Miguel Torres', schedule: { days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], startTime: '08:30', endTime: '17:30' } }];
const clients = [{ id: 1, name: 'Juan Carlos Pérez', phone: '+57 300 123 4567' }, { id: 2, name: 'María García López', phone: '+57 301 234 5678' }, { id: 3, name: 'Carlos Eduardo López', phone: '+57 302 345 6789' }, { id: 4, name: 'Ana Sofía Martínez', phone: '+57 303 456 7890' }];
const motorcycles = [{ id: 1, brand: 'Honda', model: 'CB600F', plate: 'ABC123', clientId: 1 }, { id: 2, brand: 'Yamaha', model: 'R6', plate: 'XYZ789', clientId: 2 }, { id: 3, brand: 'Suzuki', model: 'GSX-R750', plate: 'DEF456', clientId: 3 }, { id: 4, brand: 'Kawasaki', model: 'Ninja 650', plate: 'GHI789', clientId: 4 }];
const serviceTypes = ['Mantenimiento Preventivo', 'Reparación de Motor', 'Reparación de Frenos', 'Cambio de Transmisión', 'Diagnóstico General', 'Personalización', 'Cambio de Aceite', 'Afinación'];

const initialAppointments = [
  { id: 1, date: '2025-10-16', startTime: '09:00', endTime: '11:00', clientId: 1, clientName: 'Juan Carlos Pérez', motorcycleId: 1, motorcycleBrand: 'Honda', motorcycleModel: 'CB600F', motorcyclePlate: 'ABC123', mechanicId: 1, mechanicName: 'Carlos Méndez', serviceTypes: ['Mantenimiento Preventivo'], notes: 'Cliente requiere entrega antes de las 5 PM', status: 'Programada' },
  { id: 2, date: '2025-10-16', startTime: '14:00', endTime: '16:00', clientId: 2, clientName: 'María García López', motorcycleId: 2, motorcycleBrand: 'Yamaha', motorcycleModel: 'R6', motorcyclePlate: 'XYZ789', mechanicId: 2, mechanicName: 'Luis García', serviceTypes: ['Reparación de Frenos'], notes: 'Requiere piezas especiales', status: 'Programada' },
  { id: 3, date: '2025-10-17', startTime: '10:00', endTime: '12:00', clientId: 3, clientName: 'Carlos Eduardo López', motorcycleId: 3, motorcycleBrand: 'Suzuki', motorcycleModel: 'GSX-R750', motorcyclePlate: 'DEF456', mechanicId: 3, mechanicName: 'José Rodríguez', serviceTypes: ['Diagnóstico General'], notes: '', status: 'Programada' },
  { id: 4, date: '2025-10-20', startTime: '15:00', endTime: '17:00', clientId: 4, clientName: 'Ana Sofía Martínez', motorcycleId: 4, motorcycleBrand: 'Kawasaki', motorcycleModel: 'Ninja 650', motorcyclePlate: 'GHI789', mechanicId: 4, mechanicName: 'Miguel Torres', serviceTypes: ['Cambio de Aceite', 'Afinación'], notes: 'Revisar nivel de líquidos', status: 'Programada' }
];

export function Agendamientos() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<any>(null);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [moreApts, setMoreApts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => {} });

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    const days = [];
    let day = start;
    while (day <= end) { days.push(day); day = addDays(day, 1); }
    return days;
  }, [currentDate]);

  const handleSave = (data: any) => {
    const client = clients.find(c => c.id === parseInt(data.clientId));
    const moto = motorcycles.find(m => m.id === parseInt(data.motorcycleId));
    const mechanic = mechanics.find(m => m.id === parseInt(data.mechanicId));
    const newApt = { ...data, clientName: client?.name, motorcyclePlate: moto?.plate, motorcycleBrand: moto?.brand, motorcycleModel: moto?.model, mechanicName: mechanic?.name, status: 'Programada' };
    editingApt ? setAppointments(appointments.map(a => a.id === editingApt.id ? { ...a, ...newApt } : a)) : setAppointments([...appointments, { id: Date.now(), ...newApt }]);
    toast.success(`Agendamiento ${editingApt ? 'actualizado' : 'creado'}`);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-border/50">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
              <span>Calendario de Agendamientos</span>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="h-9 w-9 p-0"><ChevronLeft className="w-4 h-4" /></Button>
              <div className="min-w-[200px] text-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50">
                <h3 className="font-semibold capitalize text-blue-900 dark:text-blue-100">{format(currentDate, 'MMMM yyyy', { locale: es })}</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="h-9 w-9 p-0"><ChevronRight className="w-4 h-4" /></Button>
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
              const isEnd = day.getDay() === 0 || day.getDay() === 6;
              const dayApts = appointments.filter(a => a.date === format(day, 'yyyy-MM-dd'));
              const isClick = isCurr && !isEnd && (day >= new Date() || isToday(day));
              return (
                <div key={i} onClick={() => isClick && (setSelectedDate(day), setEditingApt(null), setIsModalOpen(true))} className={`min-h-[100px] p-2 rounded-xl border-2 transition-all relative group ${!isCurr ? 'bg-muted/30 opacity-60' : 'bg-card border-border'} ${isEnd ? 'bg-muted/50' : ''} ${isToday(day) ? 'bg-blue-50/50 border-blue-400' : ''} ${isClick ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                  {isToday(day) && <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-r-[24px] border-t-blue-500 border-r-transparent" />}
                  <div className={`font-semibold mb-2 flex items-center justify-between ${isToday(day) ? 'text-blue-700' : ''}`}>
                    <span className={isToday(day) ? 'w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center' : ''}>{format(day, 'd')}</span>
                    {dayApts.length > 0 && <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{dayApts.length}</div>}
                  </div>
                  <div className="space-y-1.5">
                    {dayApts.slice(0, 2).map(a => (
                      <div key={a.id} onClick={(e) => { e.stopPropagation(); setSelectedApt(a); setIsDetailsOpen(true); }} className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1.5 rounded-lg truncate font-medium">
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> <span>{a.startTime}</span></div>
                        <div className="truncate opacity-90">{a.clientName}</div>
                      </div>
                    ))}
                    {dayApts.length > 2 && <div className="text-xs text-blue-700 font-semibold pl-2 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setMoreApts(dayApts.slice(2)); setIsMoreOpen(true); }}>+{dayApts.length - 2} más</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editingApt ? 'Editar' : 'Nuevo'} Agendamiento</DialogTitle></DialogHeader>
          <AptForm apt={editingApt} date={selectedDate} onSave={handleSave} />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalles de Agendamiento</DialogTitle></DialogHeader>
          {selectedApt && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg flex justify-between">
                <div><p className="text-sm font-bold">{selectedApt.clientName}</p><p className="text-xs">{selectedApt.motorcycleBrand} {selectedApt.motorcycleModel} ({selectedApt.motorcyclePlate})</p></div>
                <Badge>{selectedApt.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><Label className="text-muted-foreground">Fecha</Label><p>{selectedApt.date}</p></div>
                <div><Label className="text-muted-foreground">Hora</Label><p>{selectedApt.startTime} - {selectedApt.endTime}</p></div>
                <div className="col-span-2"><Label className="text-muted-foreground">Mecánico</Label><p>{selectedApt.mechanicName}</p></div>
                <div className="col-span-2"><Label className="text-muted-foreground">Servicios</Label><div className="flex flex-wrap gap-1 mt-1">{selectedApt.serviceTypes.map((s:any) => <Badge key={s} variant="secondary">{s}</Badge>)}</div></div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setEditingApt(selectedApt); setIsDetailsOpen(false); setIsModalOpen(true); }}><Edit className="w-4 h-4 mr-2" /> Editar</Button>
                <Button variant="destructive" onClick={() => setConfirmDialog({ open: true, title: 'Eliminar', description: '¿Confirmar?', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => { setAppointments(appointments.filter(a => a.id !== selectedApt.id)); setIsDetailsOpen(false); toast.success('Eliminado'); } })}><Trash2 className="w-4 h-4 mr-2" /> Eliminar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <DialogContent><DialogHeader><DialogTitle>Agendamientos del día</DialogTitle></DialogHeader>
          <div className="space-y-2">{moreApts.map(a => (
            <div key={a.id} onClick={() => { setSelectedApt(a); setIsMoreOpen(false); setIsDetailsOpen(true); }} className="p-3 border rounded-lg hover:bg-muted cursor-pointer flex justify-between items-center">
              <div><p className="font-bold">{a.startTime} - {a.clientName}</p><p className="text-xs text-muted-foreground">{a.motorcyclePlate}</p></div>
              <Eye className="w-4 h-4" />
            </div>
          ))}</div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={confirmDialog.open} onOpenChange={o => setConfirmDialog(p => ({ ...p, open: o }))} {...confirmDialog} />
    </div>
  );
}

function AptForm({ apt, date, onSave }: any) {
  const [form, setForm] = useState({ date: apt?.date || (date ? format(date, 'yyyy-MM-dd') : ''), startTime: apt?.startTime || '', endTime: apt?.endTime || '', clientId: apt?.clientId?.toString() || '', motorcycleId: apt?.motorcycleId?.toString() || '', mechanicId: apt?.mechanicId?.toString() || '', serviceTypes: apt?.serviceTypes || [], notes: apt?.notes || '' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="grid grid-cols-2 gap-4 py-4">
      <div className="col-span-2 space-y-1"><Label>Fecha</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
      <div className="space-y-1"><Label>Inicio</Label><Input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required /></div>
      <div className="space-y-1"><Label>Fin</Label><Input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required /></div>
      <div className="space-y-1"><Label>Cliente</Label><select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="w-full h-10 px-3 border rounded-md" required>
        <option value="">Seleccionar...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select></div>
      <div className="space-y-1"><Label>Moto</Label><select value={form.motorcycleId} onChange={e => setForm({ ...form, motorcycleId: e.target.value })} className="w-full h-10 px-3 border rounded-md" required>
        <option value="">Seleccionar...</option>{motorcycles.filter(m => !form.clientId || m.clientId === parseInt(form.clientId)).map(m => <option key={m.id} value={m.id}>{m.plate} - {m.model}</option>)}
      </select></div>
      <div className="col-span-2 space-y-1"><Label>Mecánico</Label><select value={form.mechanicId} onChange={e => setForm({ ...form, mechanicId: e.target.value })} className="w-full h-10 px-3 border rounded-md" required>
        <option value="">Seleccionar...</option>{mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select></div>
      <div className="col-span-2 space-y-1"><Label>Servicios</Label><div className="flex flex-wrap gap-2 p-2 border rounded-md">
        {serviceTypes.map(s => (
          <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.serviceTypes.includes(s)} onChange={e => setForm({ ...form, serviceTypes: e.target.checked ? [...form.serviceTypes, s] : form.serviceTypes.filter((t: string) => t !== s) })} /> {s}
          </label>
        ))}
      </div></div>
      <div className="col-span-2 space-y-1"><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      <Button type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-700">{apt ? 'Actualizar' : 'Agendar'}</Button>
    </form>
  );
}
