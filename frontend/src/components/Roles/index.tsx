import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useRoles } from './hooks/useRoles';
import { RolesStyles } from './styles/RolesStyles';
import { RolesHeader } from './components/RolesHeader';
import { RolesTable } from './components/RolesTable';
import { ViewRoleDialog } from './components/ViewRoleDialog';

export function Roles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [viewingRole, setViewingRole] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    title: '', 
    description: '', 
    confirmText: '', 
    variant: 'default' as any, 
    onConfirm: () => { } 
  });

  const {
    roles,
    allPermissions,
    isLoading,
    isProcessing,
    isDeleting,
    handleSaveRole,
    handleDeleteRole,
    toggleRoleStatus
  } = useRoles();

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / itemsPerPage));
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const onSave = async (formData: any, editingRole: any) => {
    const success = await handleSaveRole(formData, editingRole);
    if (success) {
      setIsRoleDialogOpen(false);
      setEditingRole(null);
    }
    return success;
  };

  return (
    <div className="space-y-6">
      <RolesStyles />

      {isLoading ? (
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando información...</p>
        </div>
      ) : (
        <>
          <RolesHeader 
            isRoleDialogOpen={isRoleDialogOpen}
            setIsRoleDialogOpen={setIsRoleDialogOpen}
            allPermissions={allPermissions}
            handleSaveRole={onSave}
            isProcessing={isProcessing}
            setEditingRole={setEditingRole}
            editingRole={editingRole}
          />

          <div className="flex justify-start">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar roles..." 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                className="pl-10" 
              />
            </div>
          </div>

          <RolesTable 
            roles={filteredRoles}
            paginatedRoles={paginatedRoles}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            toggleRoleStatus={toggleRoleStatus}
            setViewingRole={setViewingRole}
            setIsViewDialogOpen={setIsViewDialogOpen}
            setEditingRole={setEditingRole}
            setIsRoleDialogOpen={setIsRoleDialogOpen}
            setConfirmDialog={setConfirmDialog}
            handleDeleteRole={handleDeleteRole}
          />

          <ViewRoleDialog 
            viewingRole={viewingRole}
            setIsViewDialogOpen={setIsViewDialogOpen}
            isViewDialogOpen={isViewDialogOpen}
          />

          <ConfirmDialog
            open={confirmDialog.open}
            onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
            title={confirmDialog.title}
            description={confirmDialog.description}
            confirmText={confirmDialog.confirmText}
            variant={confirmDialog.variant}
            onConfirm={confirmDialog.onConfirm}
            loading={isDeleting}
            autoClose={false}
            loadingText="Eliminando"
          />
        </>
      )}
    </div>
  );
}
