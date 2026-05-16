import { Truck, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Dialog, DialogTrigger } from '../../ui/dialog';
import { SupplierDialog } from './SupplierDialog.tsx';

interface ProveedoresHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingSupplier: any;
  setEditingSupplier: (s: any) => void;
  handleSave: (data: any, supplier: any) => Promise<boolean>;
}

export function ProveedoresHeader({
  isDialogOpen,
  setIsDialogOpen,
  editingSupplier,
  setEditingSupplier,
  handleSave
}: ProveedoresHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
          <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-semibold">Proveedores</h1>
          <p className="text-sm text-muted-foreground font-medium">Gestión de proveedores del taller</p>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => { setEditingSupplier(null); setIsDialogOpen(true); }}
            className="proveedores-btn-primary whitespace-nowrap h-11 px-6 active:scale-95"
          >
            <Plus className="w-5 h-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </DialogTrigger>
        <SupplierDialog
          supplier={editingSupplier}
          onSave={handleSave}
          onOpenChange={setIsDialogOpen}
        />
      </Dialog>
    </div>
  );
}
