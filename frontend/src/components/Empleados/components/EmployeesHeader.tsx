import { UserCog, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Dialog, DialogTrigger } from '../../ui/dialog';
import { EmployeeDialog } from './EmployeeDialog.tsx';

interface EmployeesHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  setEditingEmployee: (employee: any) => void;
  editingEmployee: any;
  handleSave: (data: any, editingEmployee: any) => Promise<boolean>;
  isSaving: boolean;
}

export function EmployeesHeader({
  isDialogOpen,
  setIsDialogOpen,
  setEditingEmployee,
  editingEmployee,
  handleSave,
  isSaving
}: EmployeesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <UserCog className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Empleados</h1>
          <p className="text-muted-foreground">Gestión del personal del taller</p>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditingEmployee(null)} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Empleado
          </Button>
        </DialogTrigger>
        <EmployeeDialog 
          employee={editingEmployee} 
          onSave={handleSave} 
          isSaving={isSaving} 
          onOpenChange={setIsDialogOpen} 
          open={isDialogOpen} 
        />
      </Dialog>
    </div>
  );
}
