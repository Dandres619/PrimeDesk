import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { CalendarClock, Clock, User, Wrench, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AptDetailsDialog({ selectedApt, onEdit, onDelete, onOpenChange }: any) {
  if (!selectedApt) return null;

  return (
    <DialogContent 
      className={cn(
        "p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal",
        "max-w-xl w-[95vw] bg-white dark:bg-slate-950"
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
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-bold px-3 py-1">
            Programado
          </Badge>
        </div>
      </div>

      <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
        <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4" /> Cliente y Vehículo
          </p>
          <div className="mt-2">
            <p className="text-lg font-black text-slate-900 dark:text-white">{selectedApt.clientName}</p>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
              {selectedApt.motorcycleBrand} {selectedApt.motorcycleModel} <span className="text-slate-300 dark:text-slate-600 mx-2">•</span> <span className="font-bold text-slate-800 dark:text-slate-200">{selectedApt.motorcyclePlate}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <CalendarClock className="w-3.5 h-3.5 text-blue-500" /> Fecha
            </Label>
            <p className="font-bold text-slate-900 dark:text-white mt-2 text-base">{selectedApt.date}</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Horario
            </Label>
            <p className="font-bold text-slate-900 dark:text-white mt-2 text-base">{selectedApt.startTime} - {selectedApt.endTime}</p>
          </div>
          <div className="col-span-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-blue-500" /> Mecánico Asignado
            </Label>
            <p className="font-bold text-slate-900 dark:text-white mt-2 text-base">{selectedApt.mechanicName}</p>
          </div>
          
          {selectedApt.serviceTypes?.length > 0 && (
            <div className="col-span-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Servicios Requeridos</Label>
              <div className="flex flex-wrap gap-2">
                {selectedApt.serviceTypes.map((s: string) => (
                  <Badge key={s} className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 border-none font-semibold px-3 py-1">
                    {s}
                  </Badge>
                ))}
              </div>
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

        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30 mt-4">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            Este agendamiento generó automáticamente una reparación asociada en el módulo principal.
          </p>
        </div>
      </div>

      <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => onOpenChange(false)} 
          className="h-11 px-6 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
        >
          Cerrar
        </Button>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="destructive" 
            onClick={onDelete}
            className="h-11 px-6 font-bold rounded-xl w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
          </Button>
          <Button 
            onClick={onEdit}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl w-full sm:w-auto"
          >
            <Edit className="w-4 h-4 mr-2" /> Editar
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
