import { Plus, Shield } from 'lucide-react';
import { Button } from '../../ui/button';
import { Dialog, DialogTrigger } from '../../ui/dialog';
import { RoleDialog } from './RoleDialog.tsx';

interface RolesHeaderProps {
  isRoleDialogOpen: boolean;
  setIsRoleDialogOpen: (open: boolean) => void;
  allPermissions: any[];
  handleSaveRole: (formData: any, editingRole: any) => Promise<boolean>;
  isProcessing: boolean;
  setEditingRole: (role: any) => void;
  editingRole: any;
}

export function RolesHeader({
  isRoleDialogOpen,
  setIsRoleDialogOpen,
  allPermissions,
  handleSaveRole,
  isProcessing,
  setEditingRole,
  editingRole
}: RolesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Roles</h1>
          <p className="text-muted-foreground">Gestión de permisos y acceso</p>
        </div>
      </div>
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditingRole(null)} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Rol
          </Button>
        </DialogTrigger>
        <RoleDialog
          role={editingRole}
          permissions={allPermissions}
          onSave={handleSaveRole}
          isProcessing={isProcessing}
        />
      </Dialog>
    </div>
  );
}
