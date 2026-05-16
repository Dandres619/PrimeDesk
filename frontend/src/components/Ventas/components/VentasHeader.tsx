import { DollarSign, Plus } from 'lucide-react';
import { Button } from '../../ui/button';

interface VentasHeaderProps {
  onNewSale: () => void;
}

export function VentasHeader({ onNewSale }: VentasHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
          <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <p className="text-sm text-muted-foreground font-medium">Gestión y facturación de servicios y repuestos</p>
        </div>
      </div>
      <Button 
        onClick={onNewSale}
        className="ventas-btn-primary whitespace-nowrap flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Nueva Venta
      </Button>
    </div>
  );
}
