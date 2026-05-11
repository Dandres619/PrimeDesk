import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Bike } from 'lucide-react';

interface ViewMotoDialogProps {
  viewingMoto: any;
}

const statusColors: any = {
  true: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  false: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

export function ViewMotoDialog({ viewingMoto }: ViewMotoDialogProps) {
  if (!viewingMoto) return null;

  return (
    <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>Detalles de la Motocicleta</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
            <Bike className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 uppercase tracking-tight">{viewingMoto.Placa}</h3>
            <p className="text-blue-700 dark:text-blue-400 font-medium">{viewingMoto.Marca} {viewingMoto.Modelo}</p>
            <Badge className={statusColors[viewingMoto.Estado]}>{viewingMoto.Estado ? 'Activo' : 'Inactivo'}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <DetailItem label="Marca" value={viewingMoto.Marca} />
          <DetailItem label="Modelo" value={viewingMoto.Modelo} />
          <DetailItem label="Año" value={viewingMoto.Anio} />
          <DetailItem label="Color" value={viewingMoto.Color} />
          <DetailItem label="Cilindraje (cc)" value={viewingMoto.Motor} />
          <DetailItem label="Kilometraje" value={`${viewingMoto.Kilometraje?.toLocaleString()} km`} />
          <DetailItem label="Propietario" value={`${viewingMoto.NombreCliente} ${viewingMoto.ApellidoCliente}`} />
          <DetailItem label="ID Motocicleta" value={viewingMoto.ID_Motocicleta} />
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
