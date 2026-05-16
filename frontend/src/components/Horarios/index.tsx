import { useState } from 'react';
import { useHorarios, DAYS_OF_WEEK } from './hooks/useHorarios';
import { HorariosHeader } from './components/HorariosHeader';
import { HorariosTable } from './components/HorariosTable';
import { ScheduleDialog } from './components/ScheduleDialog';
import { HorariosStyles } from './styles/HorariosStyles';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { AlarmClock } from 'lucide-react';
import { Button as UIButton } from '../ui/button';

export function Horarios() {
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    schedules,
    employees,
    handleSave,
    handleToggleEstado,
    handleDelete,
    getEnabledDays
  } = useHorarios();
  
  const [viewDialog, setViewDialog] = useState({
    open: false,
    schedule: null as any
  });

  const [editDialog, setEditDialog] = useState({
    open: false,
    schedule: null as any
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'destructive' as any,
    onConfirm: () => { }
  });

  const handleOpenEdit = (schedule: any) => {
    setEditDialog({ open: true, schedule });
  };

  const handleOpenView = (schedule: any) => {
    setViewDialog({ open: true, schedule });
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(schedules.length / itemsPerPage) || 1;
  const paginatedSchedules = schedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="horarios-root space-y-6 text-left">
      <HorariosStyles />

      {isLoading ? (
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando Horarios...</p>
        </div>
      ) : (
        <div className="horarios-content-animate space-y-6">
          <HorariosHeader
            searchTerm={searchTerm}
            setSearchTerm={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            onNew={() => setEditDialog({ open: true, schedule: null })}
          />

          <HorariosTable
            schedulesCount={schedules.length}
            paginatedSchedules={paginatedSchedules}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={(s) => setConfirmDialog({
              open: true,
              title: 'Eliminar Horario',
              description: `¿Está seguro de que desea eliminar el horario de ${s.mechanicName}? Esta acción no se puede deshacer.`,
              confirmText: 'Eliminar',
              variant: 'destructive',
              onConfirm: () => handleDelete(s)
            })}
            onToggleEstado={handleToggleEstado}
            getEnabledDays={getEnabledDays}
          />

          {/* New/Edit Dialog */}
          <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}>
            <ScheduleDialog
              schedule={editDialog.schedule}
              employees={employees}
              daysOfWeek={DAYS_OF_WEEK.filter(d => d !== 'Sábado' && d !== 'Domingo')}
              onSave={(data) => {
                handleSave(data);
                setEditDialog(prev => ({ ...prev, open: false }));
              }}
              onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}
            />
          </Dialog>

          {/* View Details Dialog */}
          <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog(prev => ({ ...prev, open }))}>
            <DialogContent 
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="max-w-2xl w-[95vw] max-h-[90vh] rounded-2xl overflow-hidden border-none p-0 bg-slate-50 dark:bg-slate-950 shadow-2xl flex flex-col animate-modal"
            >
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center gap-4 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                  <AlarmClock className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Detalles del Horario
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Resumen semanal</p>
                </div>
              </div>

              {viewDialog.schedule && (
                <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Mecánico</Label>
                      <p className="font-bold text-slate-900 dark:text-white mt-1 text-lg">{viewDialog.schedule.mechanicName}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Estado</Label>
                      <div className="mt-1">
                        <Badge className={viewDialog.schedule.status === 'Activo' ? 'bg-emerald-100 text-emerald-800 border-none font-bold px-3 py-1 text-sm' : 'bg-rose-100 text-rose-800 border-none font-bold px-3 py-1 text-sm'}>
                          {viewDialog.schedule.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-2">Configuración Semanal</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {DAYS_OF_WEEK.map(day => {
                        const ds = viewDialog.schedule.daySchedules[day];
                        if (!ds?.enabled) return null;
                        const start = new Date(`2024-01-01T${ds.startTime}:00`);
                        let end = new Date(`2024-01-01T${ds.endTime}:00`);
                        if (end <= start) {
                          end = new Date(`2024-01-02T${ds.endTime}:00`);
                        }
                        const hours = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
                        return (
                          <div key={day} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm transition-transform hover:scale-[1.01]">
                            <div className="flex items-center gap-4">
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-none px-3 py-1 font-bold text-sm">{day}</Badge>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white leading-tight text-base">{ds.startTime} - {ds.endTime}</p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">{hours} horas de jornada</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950 flex justify-end">
                <UIButton
                  type="button"
                  variant="ghost"
                  onClick={() => setViewDialog(prev => ({ ...prev, open: false }))}
                  className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
                >
                  Cerrar
                </UIButton>
              </div>
            </DialogContent>
          </Dialog>

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
      )}
    </div>
  );
}
