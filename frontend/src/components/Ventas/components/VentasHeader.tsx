import { DollarSign } from 'lucide-react';

export function VentasHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
          <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-semibold">Ventas (Historial)</h1>
          <p className="text-sm text-muted-foreground font-medium">Historico de facturaciones de las reparaciones</p>
        </div>
      </div>
    </div>
  );
}
