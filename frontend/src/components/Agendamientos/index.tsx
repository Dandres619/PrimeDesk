import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Clock, ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { format, subMonths, addMonths, isSameMonth, isToday, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAgendamientos } from './hooks/useAgendamientos';
import { AgendamientosStyles } from './styles/AgendamientosStyles';
import { AptFormDialog } from './components/AptFormDialog';
import { AptDetailsDialog } from './components/AptDetailsDialog';

export function Agendamientos() {
  const {
    currentDate, setCurrentDate,
    selectedDate, setSelectedDate,
    isModalOpen, setIsModalOpen,
    editingApt, setEditingApt,
    selectedApt, setSelectedApt,
    isDetailsOpen, setIsDetailsOpen,
    isMoreOpen, setIsMoreOpen,
    moreApts, setMoreApts,
    appointments, clients, motorcycles, mechanics, horarios, services, novedades,
    isLoading, enrichedApts, calendarDays,
    handleSave, handleDelete
  } = useAgendamientos();

  const [moreAptsSearch, setMoreAptsSearch] = useState('');

  const filteredMoreApts = useMemo(() => {
    const q = moreAptsSearch.toLowerCase().trim();
    if (!q) return moreApts;
    return moreApts.filter(a =>
      a.clientName?.toLowerCase().includes(q) ||
      a.motorcyclePlate?.toLowerCase().includes(q) ||
      a.mechanicName?.toLowerCase().includes(q) ||
      a.startTime?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q) ||
      a.notes?.toLowerCase().includes(q)
    );
  }, [moreApts, moreAptsSearch]);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'destructive' as any,
    onConfirm: () => { }
  });

  if (isLoading) {
    return (
      <div className="agendamientos-root flex flex-col items-center justify-center min-h-[500px]">
        <AgendamientosStyles />
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando Agendamientos...</p>
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
                <CardTitle className="text-lg">Calendario de Agendamientos</CardTitle>
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none font-bold">
                  {enrichedApts.length === 1 ? '1 agendamiento' : `${enrichedApts.length} agendamientos`}
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
                const dayApts = enrichedApts.filter(a => a.date === dayStr);
                const past = isBefore(startOfDay(day), startOfDay(new Date()));
                const isClickable = isCurr && !isWeekend && !past;

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
                      setSelectedDate(day);
                      setEditingApt(null);
                      setIsModalOpen(true);
                    }}
                    className={cn(
                      "min-h-[120px] p-3 rounded-2xl border transition-all relative group flex flex-col gap-2",
                      !isCurr ? "bg-slate-50/50 dark:bg-slate-900/20 opacity-40 border-transparent" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800",
                      (isWeekend || past) && isCurr ? "bg-slate-50 dark:bg-slate-900/50 opacity-80" : "",
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
                            onClick={(e) => { e.stopPropagation(); setSelectedApt(a); setIsDetailsOpen(true); }}
                            className={cn(
                              "text-xs p-2 rounded-lg truncate font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer relative overflow-hidden group/apt",
                              past
                                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                                : "text-white bg-gradient-to-r from-blue-500 to-indigo-600",
                              (a.status === 'Anulado' || a.status === 'Anulada') && "line-through opacity-60"
                            )}
                          >
                            {!past && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/apt:translate-y-0 transition-transform" />}
                            <div className="relative z-10 flex flex-col gap-0.5 text-left">
                              <div className="flex items-center gap-1.5 opacity-90">
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] tracking-wider">{a.startTime}</span>
                              </div>
                              <div className="truncate">{a.clientName}</div>
                            </div>
                          </div>
                        ))
                      ) : dayApts.length > 1 ? (
                        <div
                          onClick={(e) => { e.stopPropagation(); setMoreApts(dayApts); setIsMoreOpen(true); }}
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
          <AptFormDialog
            apt={editingApt}
            date={selectedDate}
            clients={clients}
            motorcycles={motorcycles}
            mechanics={mechanics}
            services={services}
            horarios={horarios}
            novedades={novedades}
            existingAppointments={appointments}
            onSave={handleSave}
            onOpenChange={setIsModalOpen}
          />
        </Dialog>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <AptDetailsDialog
            selectedApt={selectedApt}
            onEdit={() => { setEditingApt(selectedApt); setIsDetailsOpen(false); setIsModalOpen(true); }}
            onDelete={() => setConfirmDialog({
              open: true,
              title: 'Anular Agendamiento',
              description: '¿Está seguro de que desea anular este agendamiento? Esto también anulará la reparación vinculada.',
              confirmText: 'Anular',
              variant: 'destructive',
              onConfirm: () => handleDelete(selectedApt)
            })}
            onOpenChange={setIsDetailsOpen}
          />
        </Dialog>

        <Dialog open={isMoreOpen} onOpenChange={(open) => { setIsMoreOpen(open); if (!open) setMoreAptsSearch(''); }}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl animate-modal bg-white dark:bg-slate-950">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Agendamientos del día</DialogTitle>
              </DialogHeader>
            </div>
            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar agendamiento (cliente, placa, mecánico)..."
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
                    onClick={() => { setSelectedApt(a); setIsMoreOpen(false); setIsDetailsOpen(true); }}
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
                        )} /> {a.startTime} <span className="text-slate-300 dark:text-slate-600 px-1">•</span> {a.clientName}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Moto: {a.motorcyclePlate} <span className="px-1">•</span> Mecánico: {a.mechanicName}
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
