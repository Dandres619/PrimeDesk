import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Loader2 } from 'lucide-react';

interface ServiceFinalizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceName: string;
  obs: string;
  onObsChange: (val: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function ServiceFinalizeDialog({
  open,
  onOpenChange,
  serviceName,
  obs,
  onObsChange,
  onConfirm,
  loading,
}: ServiceFinalizeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-left">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Finalizar Servicio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{serviceName}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Observación (Opcional)</Label>
            <Textarea
              value={obs}
              onChange={(e) => onObsChange(e.target.value)}
              placeholder="Agregue alguna nota sobre el trabajo realizado si es necesario..."
              className="h-24 bg-transparent border-slate-200 dark:border-slate-800 rounded-xl resize-none"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancelar</Button>
          <Button onClick={onConfirm} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Guardar y Finalizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
