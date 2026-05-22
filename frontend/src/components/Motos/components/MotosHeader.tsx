import { Plus } from 'lucide-react';
import { PiMotorcycle } from 'react-icons/pi';
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
  motos: any[];
}

export function MotosHeader({
  isDialogOpen,
  setIsDialogOpen,
  setEditingMoto,
  editingMoto,
  clients,
  onSave,
  isSaving,
  motos
}: MotosHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center transition-transform hover:scale-105">
          <PiMotorcycle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Motocicletas</h1>
          <p className="text-sm text-muted-foreground">Gestión y registro de vehículos</p>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditingMoto(null)} className="motos-btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Motocicleta
          </Button>
        </DialogTrigger>
        <MotoDialog
          moto={editingMoto}
          motos={motos}
          clients={clients}
          onSave={onSave}
          isSaving={isSaving}
          onOpenChange={setIsDialogOpen}
        />
      </Dialog>
    </div>
  );
}
