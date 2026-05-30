import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Clock, ChevronLeft, ChevronRight, Eye, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '../../ui/input';
import { format, subMonths, addMonths, isSameMonth, isToday, isBefore, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn, isColombianHoliday } from '@/lib/utils';
import { ClientAptFormDialog } from './ClientAptFormDialog';
import { ClientAptDetailsDialog } from './ClientAptDetailsDialog';
import { AgendamientosStyles } from '../../Agendamientos/styles/AgendamientosStyles';

interface AppointmentsSectionProps {
  currentDate: Date;
  isLoadingData?: boolean;
  setCurrentDate: (date: Date) => void;
  motos: any[];
  mechanics: any[];
  availableServices: any[];
  horarios: any[];
  novedades: any[];
  reparaciones: any[];
  agendamientos: any[];
  fetchClientData: (showLoading?: boolean) => Promise<void>;
  currentUser: any;
}

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function AppointmentsSection({
  currentDate,
  isLoadingData,
  setCurrentDate,
  motos,
  mechanics,
  availableServices,
  horarios,
  novedades,
  reparaciones,
  agendamientos,
  fetchClientData,
  currentUser
}: AppointmentsSectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<any>(null);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [moreApts, setMoreApts] = useState<any[]>([]);
  const [moreAptsSearch, setMoreAptsSearch] = useState('');

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'destructive' as any,
    onConfirm: () => { }
  });

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  const filteredMoreApts = useMemo(() => {
    const q = moreAptsSearch.toLowerCase().trim();
    if (!q) return moreApts;
    return moreApts.filter(a =>
      a.motoPlate?.toLowerCase().includes(q) ||
      a.mechanicName?.toLowerCase().includes(q) ||
      a.startTime?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q) ||
      a.notes?.toLowerCase().includes(q)
    );
  }, [moreApts, moreAptsSearch]);

  const handleSave = async (data: any) => {
    const isEditing = !!editingApt;
    const token = localStorage.getItem('token');
    try {
      if (!isEditing) {
        const res = await fetch(`${API_URL}/agendamientos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
        toast.success(`Agendamiento creado exitosamente.`);
      } else {
        const res = await fetch(`${API_URL}/agendamientos/${editingApt.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
      await fetchClientData(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (apt: any) => {
    const rep = reparaciones.find((r: any) => Number(r.ID_Agendamiento) === Number(apt.id));
    const status = (rep?.estadoBase || apt.status || 'Confirmado').toLowerCase();

    if (!['esperando motocicleta', 'confirmado'].includes(status)) {
      toast.error('No se puede cancelar un agendamiento que ya inició o finalizó.');
      return;
    }

    const aptDateTime = new Date(apt.date + 'T' + apt.startTime);
    const now = new Date();
    const diffHours = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      toast.error('Solo se puede anular con al menos una hora de anticipación.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/agendamientos/${apt.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al anular');
      }
      toast.success('Agendamiento cancelado exitosamente');
      setIsDetailsOpen(false);
      await fetchClientData(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const linkedReparacion = useMemo(() => {
    if (!selectedApt) return null;
    return reparaciones.find((r: any) => Number(r.ID_Agendamiento) === Number(selectedApt.id));
  }, [selectedApt, reparaciones]);

  if (isLoadingData) {
    return (
      <div className="agendamientos-root flex flex-col items-center justify-center min-h-[400px]">
        <AgendamientosStyles />
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agendamientos-root space-y-6 text-left">
      <AgendamientosStyles />
      <div className="agendamientos-content-animate space-y-6">
        <Card>
          <CardHeader className="pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <span>Calendario de Agendamientos</span>
                </CardTitle>
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none font-bold">
                  {agendamientos.length === 1 ? '1 agendamiento' : `${agendamientos.length} agendamientos`}
                </Badge>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all"
                  disabled={isSameMonth(currentDate, new Date())}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="min-w-[150px] text-center">
                  <h3 className="font-bold capitalize text-slate-900 dark:text-white text-sm tracking-wide">
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all"
                  disabled={isSameMonth(currentDate, addMonths(new Date(), 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} className="p-3 text-center font-bold text-xs text-slate-500 uppercase tracking-widest">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-3">
              {calendarDays.map((day, i) => {
                const isCurr = isSameMonth(day, currentDate);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayApts = agendamientos.filter(a => a.date === dayStr || a.fecha === dayStr);
                const past = isBefore(startOfDay(day), startOfDay(new Date()));
                const isHoliday = isColombianHoliday(day);
                const isClickable = isCurr && !isWeekend && !past && !isHoliday;

                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (!isCurr) return;
                      if (isWeekend) {
                        toast.error('No se pueden agendar servicios en fines de semana');
                        return;
                      }
                      if (past) {
                        toast.error('No se pueden agendar servicios en fechas pasadas');
                        return;
                      }
                      if (isHoliday) {
                        toast.error('No se pueden agendar servicios en días festivos');
                        return;
                      }
                      const activeApt = dayApts.find(a => {
                        const status = (a.status || '').toLowerCase();
                        return status !== 'anulado' && status !== 'anulada';
                      });
                      if (activeApt) {
                        toast.error('Ya tienes un agendamiento registrado para este día. Por favor, selecciona otra fecha.');
                        return;
                      }
                      setSelectedDate(day);
                      setEditingApt(null);
                      setIsModalOpen(true);
                    }}
                    className={cn(
                      "min-h-[120px] p-3 rounded-2xl border transition-all relative group flex flex-col gap-2",
                      !isCurr ? "bg-slate-50/50 dark:bg-slate-900/20 opacity-40 border-transparent" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800",
                      (isWeekend || past || isHoliday) && isCurr ? "bg-slate-50 dark:bg-slate-900/50 opacity-80" : "",
                      isToday(day) ? "border-blue-500 shadow-sm bg-blue-50/10 dark:bg-blue-900/10 ring-1 ring-blue-500/20" : "",
                      isClickable ? "hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer" : (isCurr ? "cursor-pointer" : "cursor-default")
                    )}
                  >
                    {isToday(day) && (
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-r-[30px] border-t-blue-500 border-r-transparent rounded-tr-2xl" />
                    )}
                    <div className={cn("font-black mb-1 flex items-center justify-between z-10", isToday(day) ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300")}>
                      <span className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors",
                        isToday(day) ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : ""
                      )}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    <div className="space-y-1.5 flex-1">
                      {dayApts.length === 1 ? (
                        dayApts.map(a => (
                          <div
                            key={a.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApt(a);
                              setIsDetailsOpen(true);
                            }}
                            className={cn(
                              "text-xs p-2 rounded-lg truncate font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer relative overflow-hidden group/apt text-left",
                              past
                                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                                : "text-white bg-gradient-to-r from-blue-500 to-indigo-600",
                              (a.status === 'Anulado' || a.status === 'Anulada') && "line-through opacity-60"
                            )}
                          >
                            {!past && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/apt:translate-y-0 transition-transform" />}
                            <div className="relative z-10 flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 opacity-90">
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] tracking-wider">{a.startTime}</span>
                              </div>
                              <div className="truncate">{a.motoPlate}</div>
                            </div>
                          </div>
                        ))
                      ) : dayApts.length > 1 ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setMoreApts(dayApts);
                            setIsMoreOpen(true);
                          }}
                          className="text-xs p-2.5 rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                        >
                          <span className="font-bold block tracking-tight leading-snug">{dayApts.length} agendamientos en total</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingApt(null); }}>
          {isModalOpen && (
            <ClientAptFormDialog
              apt={editingApt}
              date={selectedDate}
              clientId={currentUser.id_cliente}
              motorcycles={motos}
              mechanics={mechanics}
              services={availableServices}
              horarios={horarios}
              novedades={novedades}
              existingAppointments={agendamientos}
              onSave={handleSave}
              onOpenChange={setIsModalOpen}
            />
          )}
        </Dialog>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          {isDetailsOpen && (
            <ClientAptDetailsDialog
              apt={selectedApt}
              linkedReparacion={linkedReparacion}
              availableServices={availableServices}
              mechanics={mechanics}
              onClose={() => setIsDetailsOpen(false)}
              onDelete={(apt) => {
                setConfirmDialog({
                  open: true,
                  title: 'Cancelar Agendamiento',
                  description: '¿Estás seguro de que deseas cancelar este agendamiento? Esta acción no se puede deshacer.',
                  confirmText: 'Aceptar',
                  variant: 'destructive',
                  onConfirm: () => handleDelete(apt)
                });
              }}
            />
          )}
        </Dialog>

        <Dialog open={isMoreOpen} onOpenChange={(open) => { setIsMoreOpen(open); if (!open) setMoreAptsSearch(''); }}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl animate-modal bg-white dark:bg-slate-950">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-left">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Agendamientos del día</DialogTitle>
              </DialogHeader>
            </div>
            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar agendamiento (placa, mecánico)..."
                  value={moreAptsSearch}
                  onChange={(e) => setMoreAptsSearch(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>
            </div>
            <div className="p-6 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {filteredMoreApts.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400 font-semibold">
                  No se encontraron agendamientos.
                </div>
              ) : (
                filteredMoreApts.map(a => (
                  <div
                    key={a.id}
                    onClick={() => {
                      setSelectedApt(a);
                      setIsMoreOpen(false);
                      setIsDetailsOpen(true);
                    }}
                    className={cn(
                      "p-4 border rounded-xl hover:shadow-md cursor-pointer flex justify-between items-center transition-all group border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-blue-400 dark:hover:border-blue-600",
                      (a.status === 'Anulado' || a.status === 'Anulada') && "opacity-60"
                    )}
                  >
                    <div className="space-y-1 text-left">
                      <p className={cn(
                        "font-bold text-sm flex items-center gap-2",
                        (a.status === 'Anulado' || a.status === 'Anulada') ? "text-slate-500 line-through" : "text-slate-900 dark:text-white"
                      )}>
                        <Clock className={cn(
                          "w-3.5 h-3.5",
                          (a.status === 'Anulado' || a.status === 'Anulada') ? "text-slate-400" : "text-blue-500"
                        )} /> {a.startTime} <span className="text-slate-300 dark:text-slate-600 px-1">•</span> {a.motoPlate}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Mecánico: {a.mechanicName}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                      <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => setIsMoreOpen(false)}
                className="h-10 px-6 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
              >
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog((prev: any) => ({ ...prev, open }))}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
        />
      </div>
    </div>
  );
}
