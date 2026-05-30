import { useState } from 'react';
import { useMiHorario, DAYS_OF_WEEK } from './hooks/useMiHorario';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlarmClock, Eye, ClipboardList } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HorariosStyles } from '../Horarios/styles/HorariosStyles';

export function MiHorario() {
  const { isLoading, schedule } = useMiHorario();
  const [viewDialog, setViewDialog] = useState(false);

  return (
    <div className="horarios-root space-y-6 text-left">
      <HorariosStyles />

      {isLoading ? (
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando Mi Horario...</p>
        </div>
      ) : (
        <div className="horarios-content-animate space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                <AlarmClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-semibold">Mi Horario</h1>
                <p className="text-sm text-muted-foreground font-medium">Consulta los días y horas que tienes asignados para laborar</p>
              </div>
            </div>
          </div>

          <Card data-slot="card">
            <CardHeader>
              <CardTitle data-slot="card-title" className="text-left flex items-center gap-2">
                Tu Horario Asignado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Días Habilitados</TableHead>
                    <TableHead className="text-left">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule ? (
                    <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <TableCell className="text-left">
                        <p>{DAYS_OF_WEEK.filter(d => schedule.daySchedules[d]?.enabled).map(d => d.substring(0, 3)).join(', ')}</p>
                      </TableCell>
                      <TableCell className="text-left">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => setViewDialog(true)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Ver detalles</p></TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ClipboardList className="w-8 h-8 opacity-20" />
                          <p>No tienes un horario configurado aún.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* View Details Dialog */}
          <Dialog open={viewDialog} onOpenChange={setViewDialog}>
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
                      Detalles de Mi Horario
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Resumen semanal</p>
                </div>
              </div>

              {schedule && (
                <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Mecánico</Label>
                      <p className="font-bold text-slate-900 dark:text-white mt-1 text-lg">{schedule.mechanicName}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Estado</Label>
                      <div className="mt-1">
                        <Badge className={schedule.status === 'Activo' ? 'bg-emerald-100 text-emerald-800 border-none font-bold px-3 py-1 text-sm' : 'bg-rose-100 text-rose-800 border-none font-bold px-3 py-1 text-sm'}>
                          {schedule.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-2">Configuración Semanal</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {DAYS_OF_WEEK.map(day => {
                        const ds = schedule.daySchedules[day];
                        if (!ds?.enabled) return null;
                        const start = new Date(`2024-01-01T${ds.startTime}:00`);
                        let end = new Date(`2024-01-01T${ds.endTime}:00`);
                        if (end <= start) end = new Date(`2024-01-02T${ds.endTime}:00`);

                        const hours = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
                        return (
                          <div key={day} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm transition-transform hover:scale-[1.01]">
                            <div className="flex items-center gap-4">
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-none px-3 py-1 font-bold text-sm w-24 text-center justify-center">{day}</Badge>
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
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setViewDialog(false)}
                  className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
                >
                  Cerrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      )}
    </div>
  );
}
