import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Label } from '../../ui/label';
import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewServicioDialogProps {
  service: any;
  onClose: () => void;
}

export function ViewServicioDialog({ service, onClose }: ViewServicioDialogProps) {
  // We keep the data even if service becomes null to allow the exit animation to play
  const data = service || {};

  return (
    <Dialog open={!!service} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl animate-modal p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl rounded-2xl">
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-20 -mt-20 rounded-full" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0 transition-transform hover:scale-105">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Detalles del Servicio
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Consulta la información técnica del catálogo
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-100 dark:hover:bg-slate-900/80">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-blue-600 shadow-xl border border-slate-100 dark:border-slate-800">
              <Wrench className="w-12 h-12" />
            </div>
            <div className="space-y-1 text-left">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{data.Nombre || '-'}</h3>
              <div className="flex items-center gap-3">
                <Badge className={cn("px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider",
                  data.Estado ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                )}>
                  {data.Estado ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-left">
            <div className="space-y-1 text-center border-r border-slate-100 dark:border-slate-800 pb-2">
              <Label className="text-[10px] text-muted-foreground uppercase font-black block w-full">Duración Estimada</Label>
              <p className="font-bold text-foreground text-xl tracking-tighter">{data.Duracion || data.duracion || 0} MIN</p>
            </div>
            <div className="space-y-1 text-center pb-2">
              <Label className="text-[10px] text-muted-foreground uppercase font-black block w-full">Precio del Servicio</Label>
              <p className="font-bold text-blue-600 dark:text-blue-400 text-xl tracking-tighter">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(data.Precio || data.precio || 0)}
              </p>
            </div>
            <div className="space-y-1 col-span-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <Label className="text-xs text-muted-foreground uppercase font-semibold">Descripción</Label>
              <p className="mt-1 p-4 bg-slate-50/50 dark:bg-slate-900/50 text-foreground rounded-lg border border-slate-100 dark:border-slate-800 italic">
                {data.Descripcion || 'Sin descripción detallada.'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

