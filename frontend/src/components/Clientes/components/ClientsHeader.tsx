import { Users, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Dialog, DialogTrigger } from '../../ui/dialog';
import { ClientDialog } from './ClientDialog.tsx';

interface ClientsHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  setEditingClient: (client: any) => void;
  editingClient: any;
  handleSave: (data: any, editingClient: any) => Promise<boolean>;
  isSaving: boolean;
}

export function ClientsHeader({
  isDialogOpen,
  setIsDialogOpen,
  setEditingClient,
  editingClient,
  handleSave,
  isSaving
}: ClientsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground">Gestión de la base de datos de clientes</p>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditingClient(null)} className="cli-btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </DialogTrigger>
        <ClientDialog
          client={editingClient}
          onSave={handleSave}
          isSaving={isSaving}
          onOpenChange={setIsDialogOpen}
          open={isDialogOpen}
        />
      </Dialog>
    </div>
  );
}
