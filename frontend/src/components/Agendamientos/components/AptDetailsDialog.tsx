import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { CalendarClock, Clock, User, Wrench, Edit, Ban, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../../ui/tooltip';

export function AptDetailsDialog({ selectedApt, onEdit, onDelete, onOpenChange }: any) {
  if (!selectedApt) return null;

  const statusLower = selectedApt.status?.toLowerCase() || '';
  const isFinalizado = statusLower === 'reparación finalizada' || statusLower === 'reparacion finalizada';
  const isEnReparacion = statusLower === 'en reparación' || statusLower === 'en reparacion';
  const isAnulado = statusLower === 'anulado' || statusLower === 'anulada';

  return (
    <DialogContent
      className={cn(
        "p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal",
        "max-w-xl w-[95vw] max-h-[90vh] bg-white dark:bg-slate-950"
      )}
    >
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
          <CalendarClock className="w-6 h-6 text-white" />
        </div>
        <div className="text-left w-full flex justify-between items-center">
          <div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Detalles del Agendamiento
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Reserva de servicio técnico</p>
          </div>
          <Badge className={cn(
            "font-bold px-3 py-1 border-none",
            isAnulado
              ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
              : isEnReparacion
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                : isFinalizado
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          )}>
            {selectedApt.status}
          </Badge>
        </div>
      </div>

      <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
        <div className="p-5 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" /> Cliente, Vehículo y Mecánico
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800/80">
            {/* Cliente */}
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Cliente</span>
              <p className="font-bold text-slate-900 dark:text-white mt-2 text-base">
                {selectedApt.clientName}
              </p>
            </div>

            {/* Vehículo */}
            <div className="flex flex-col text-left md:pl-6 pt-4 md:pt-0">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Motocicleta
              </span>
              <p className="font-bold text-slate-900 dark:text-white mt-2 text-base">
                {selectedApt.motorcyclePlate} - {selectedApt.motorcycleBrand} {selectedApt.motorcycleModel}
              </p>
            </div>

            {/* Mecánico */}
            <div className="flex flex-col text-left md:pl-6 pt-4 md:pt-0">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Mecánico Asignado</span>
              <p className="font-bold text-slate-900 dark:text-white mt-2 text-base">
                {selectedApt.mechanicName}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col gap-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-1.5">
                <CalendarClock className="w-3.5 h-3.5 text-blue-500" /> Fecha del Servicio
              </Label>
              <p className="font-bold text-slate-900 dark:text-white text-base">{selectedApt.date}</p>
            </div>

            <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Horario (finalización estimada)
              </Label>
              <p className="font-bold text-slate-900 dark:text-white text-base">{selectedApt.startTime} - {selectedApt.endTime}</p>
            </div>
          </div>

          {selectedApt.serviceTypes?.length > 0 && (
            <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Servicios Requeridos</Label>
              <TooltipProvider>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
                  {selectedApt.serviceTypes.map((s: any, idx: number) => {
                    const nombre = typeof s === 'object' ? s.Nombre || s.nombre : s;
                    const duracion = typeof s === 'object' ? s.Duracion || s.duracion : null;
                    const precio = typeof s === 'object' ? s.Precio || s.precio : null;

                    return (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <div
                            className="flex items-center gap-3 p-3 rounded-lg border transition-all min-w-0 bg-indigo-50 border-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-500 shadow-sm cursor-help"
                          >
                            <input
                              type="checkbox"
                              checked={true}
                              readOnly
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 shrink-0 pointer-events-none cursor-default"
                            />
                            <div className="flex items-center justify-between gap-3 min-w-0 flex-1">
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-bold text-sm truncate text-indigo-900 dark:text-indigo-100">
                                  {nombre}
                                </span>
                                {duracion !== null && (
                                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                    {duracion} min
                                  </span>
                                )}
                              </div>
                              {precio !== null && (
                                <span className="text-xs font-black shrink-0 text-indigo-700 dark:text-indigo-300">
                                  ${Number(precio).toLocaleString('es-CO')}
                                </span>
                              )}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{nombre}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>
          )}

          {selectedApt.notes && (
            <div className="col-span-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Notas</Label>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {selectedApt.notes}
              </div>
            </div>
          )}
        </div>

        {isFinalizado ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30 mt-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Este agendamiento ha sido finalizado, por lo que no se permiten más modificaciones. Para ver más detalles, consulta la reparación #{selectedApt.repairId} en el módulo de reparaciones.
            </p>
          </div>
        ) : isEnReparacion ? (
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30 mt-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Este agendamiento está actualmente en reparación (#{selectedApt.repairId}), por lo que no se permiten más modificaciones. Para anularla, diríjase al módulo de Reparaciones.
            </p>
          </div>
        ) : isAnulado ? (
          <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-800/30 mt-4">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center shrink-0">
              <Ban className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">
              Este agendamiento ha sido anulado y no se puede modificar.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800/30 mt-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">
              Este agendamiento generó automáticamente la reparación asociada #{selectedApt.repairId} en el módulo principal.
            </p>
          </div>
        )}
      </div>

      <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="h-11 px-6 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
        >
          Cerrar
        </Button>
        {!isFinalizado && !isEnReparacion && !isAnulado && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="destructive"
              onClick={onDelete}
              className="h-11 px-6 font-bold rounded-xl w-full sm:w-auto"
            >
              <Ban className="w-4 h-4 mr-2" /> Anular
            </Button>
            <Button
              onClick={onEdit}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl w-full sm:w-auto"
            >
              <Edit className="w-4 h-4 mr-2" /> Editar
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
