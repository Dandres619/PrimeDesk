import { Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Dialog, DialogTrigger } from '../../ui/dialog';
import { MotoDialog } from './MotoDialog.tsx';

interface MotosHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  setEditingMoto: (moto: any) => void;
  editingMoto: any;
  clients: any[];
  onSave: (formData: any) => Promise<boolean>;
  isSaving: boolean;
}

export function MotosHeader({
  isDialogOpen,
  setIsDialogOpen,
  setEditingMoto,
  editingMoto,
  clients,
  onSave,
  isSaving
}: MotosHeaderProps) {
  return (
    <div className="flex justify-between items-center gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Motocicletas</h1>
        <p className="text-muted-foreground">Gestión de vehículos de clientes</p>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditingMoto(null)} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Moto
          </Button>
        </DialogTrigger>
        <MotoDialog moto={editingMoto} clients={clients} onSave={onSave} isSaving={isSaving} />
      </Dialog>
    </div>
  );
}
