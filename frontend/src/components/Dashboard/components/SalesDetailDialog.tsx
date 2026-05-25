import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ShoppingBag, Calendar, User, Wrench, Package, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SalesDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sales: any[] | null;
  isLoading: boolean;
  periodLabel: string;
}

export function SalesDetailDialog({ isOpen, onOpenChange, sales, isLoading, periodLabel }: SalesDetailDialogProps) {
  const formatCurrency = (val: number) =>
    `$${Number(val).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal",
          "max-w-2xl w-[95vw] max-h-[85vh] bg-white dark:bg-slate-950"
        )}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div className="text-left w-full flex justify-between items-center">
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Ventas del Periodo
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
                Detalles para: <span className="text-indigo-600 dark:text-indigo-400">{periodLabel}</span>
              </p>
            </div>
            {sales && !isLoading && (
              <Badge className="font-bold px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-none">
                {sales.length} {sales.length === 1 ? 'venta' : 'ventas'}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar text-left space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Cargando detalles de ventas...</p>
            </div>
          ) : sales && sales.length > 0 ? (
            <div className="space-y-6">
              {sales.map((sale, idx) => (
                <div
                  key={sale.ID_Venta || idx}
                  className="p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all flex flex-col gap-4 shadow-sm"
                >
                  {/* Top Sale Info */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        Venta #{sale.ID_Venta}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(sale.Fecha)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(sale.Total)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-200/50 dark:bg-slate-800/50" />

                  {/* Customer, Moto, and Mechanic details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Cliente</p>
                        <p className="text-slate-800 dark:text-slate-200 font-bold">
                          {sale.NombreCliente ? `${sale.NombreCliente} ${sale.ApellidoCliente || ''}` : 'Cliente General'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Vehículo</p>
                        <p className="text-slate-800 dark:text-slate-200 font-bold">
                          {sale.Placa ? `${sale.Placa} - ${sale.MarcaMoto} ${sale.ModeloMoto}` : 'Venta Directa'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Services & Parts */}
                  <div className="flex flex-col gap-4 mt-2">
                    {/* Services */}
                    {sale.servicios && sale.servicios.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-indigo-500" /> Servicios Realizados ({sale.servicios.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto custom-scrollbar pr-1">
                          {sale.servicios.map((serv: string, sIdx: number) => (
                            <Badge key={sIdx} variant="secondary" className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/30 break-all sm:break-normal">
                              {serv}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spare parts (Repuestos) */}
                    {sale.repuestos && sale.repuestos.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                          <Package className="w-3 h-3 text-emerald-500" /> Repuestos Vendidos ({sale.repuestos.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                          {sale.repuestos.map((rep: any, rIdx: number) => (
                            <div key={rIdx} className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center bg-slate-100/60 dark:bg-slate-800/40 px-2.5 py-1.5 rounded-md border border-slate-200/30 dark:border-slate-800/20">
                              <span className="truncate pr-2" title={rep.product}>{rep.product}</span>
                              <span className="text-slate-400 font-bold shrink-0">x{rep.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Observations */}
                  {sale.Observaciones && (
                    <div className="flex gap-2 items-start text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/30 dark:bg-slate-800/20 p-3 rounded-xl border border-slate-200/20 dark:border-slate-800/10">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="italic">"{sale.Observaciones}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
              <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-semibold">No se encontraron ventas para este periodo.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/10 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="h-10 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl shadow-md"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
