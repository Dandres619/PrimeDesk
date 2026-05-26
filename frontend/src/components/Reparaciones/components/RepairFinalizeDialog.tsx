import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Check, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RepairFinalizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manoObra: string;
  onManoObraChange: (val: string) => void;
  observaciones: string;
  onObservacionesChange: (val: string) => void;
  error: string;
  onErrorChange: (val: string) => void;
  loading: boolean;
  onConfirm: () => void;
  handleManoObraKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function RepairFinalizeDialog({
  open,
  onOpenChange,
  manoObra,
  onManoObraChange,
  observaciones,
  onObservacionesChange,
  error,
  onErrorChange,
  loading,
  onConfirm,
  handleManoObraKeyDown,
}: RepairFinalizeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-2xl flex flex-col text-left">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Finalizar Reparación
              </DialogTitle>
            </DialogHeader>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Completar orden y registrar venta</p>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
          <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-left flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                Advertencia
              </p>
              <p className="text-[11px] font-medium text-blue-600/95 dark:text-blue-400/80 leading-relaxed">
                Esta acción finalizará la reparación de forma definitiva y registrará la venta automáticamente en el sistema. Por favor, asegúrese de haber subido todas las facturas de los repuestos en caso de haber sido necesario, ya que no se podrá modificar después.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Costo de Mano de Obra ($) *</Label>
              {error && (
                <p className="text-xs font-bold text-red-500">{error}</p>
              )}
            </div>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={manoObra}
              onKeyDown={handleManoObraKeyDown}
              onChange={(e) => {
                let val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length > 7) {
                  val = val.slice(0, 7);
                }
                onManoObraChange(val);
                const numericVal = parseFloat(val);
                if (val === '') {
                  onErrorChange('Ingrese un valor válido mayor o igual a 0.');
                } else if (isNaN(numericVal) || numericVal < 0) {
                  onErrorChange('Ingrese un valor válido mayor o igual a 0.');
                } else if (numericVal > 1000000) {
                  onErrorChange('Máximo $1.000.000.');
                } else {
                  onErrorChange('');
                }
              }}
              placeholder="Ej. 50000"
              className={cn(
                "bg-transparent border-slate-200 dark:border-slate-800 rounded-xl transition-colors",
                error && "border-red-500 focus-visible:ring-red-500/20"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Observaciones de la Venta (Opcional)</Label>
            <Textarea
              value={observaciones}
              onChange={(e) => onObservacionesChange(e.target.value)}
              placeholder="Ej. Reparación y mantenimiento general..."
              className="h-24 bg-transparent border-slate-200 dark:border-slate-800 rounded-xl resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/10 flex flex-col sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-11 px-6 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={!!error || !manoObra || loading}
            className="h-11 px-8 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline-block" /> : null} Finalizar Reparación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
