import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { PiMotorcycle } from 'react-icons/pi';
import { cn } from '@/lib/utils';

interface ViewMotoDialogProps {
  viewingMoto: any;
}

const statusColors: any = {
  true: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  false: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

export function ViewMotoDialog({ viewingMoto }: ViewMotoDialogProps) {
  const data = viewingMoto || {};

  return (
    <DialogContent className="max-w-2xl animate-modal overflow-hidden p-0 bg-white dark:bg-slate-950 border-none shadow-2xl rounded-2xl">
      <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-20 -mt-20 rounded-full" />
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0 transition-transform hover:scale-105">
              <PiMotorcycle className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Detalles de la Motocicleta
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Consulta la información técnica de tu vehículo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-100 dark:hover:bg-slate-900/80">
          <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-blue-600 shadow-xl border border-slate-100 dark:border-slate-800">
            <PiMotorcycle className="w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{data.placa}</h3>
            <div className="flex items-center gap-3">
              <Badge className={cn("px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider", statusColors[String(data.estado ?? true)])}>
                {data.estado ?? true ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
          <DetailItem label="Marca" value={data.marca} />
          <DetailItem label="Modelo" value={data.modelo} />
          <DetailItem label="Año" value={data.ano} />
          <DetailItem label="Color" value={data.color} />
          <DetailItem label="Cilindraje" value={data.cilindraje ? `${data.cilindraje}` : '-'} />
          <DetailItem label="Kilometraje" value={data.kilometraje ? `${data.kilometraje.toLocaleString()} km` : '-'} />
          <DetailItem label="Placa" value={data.placa} />
          <DetailItem label="Estado" value={data.estado ?? true ? 'Activo' : 'Inactivo'} />
        </div>
      </div>
    </DialogContent>
  );
}

function DetailItem({ label, value }: { label: string, value: any }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground uppercase font-semibold">{label}</Label>
      <p className="font-medium text-foreground">{value || '-'}</p>
    </div>
  );
}
