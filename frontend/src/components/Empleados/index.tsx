import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useEmployees } from './hooks/useEmployees';
import { EmployeesStyles } from './styles/EmployeesStyles';
import { EmployeesHeader } from './components/EmployeesHeader';
import { EmployeesTable } from './components/EmployeesTable';
import { ViewEmployeeDialog } from './components/ViewEmployeeDialog';

export function Empleados() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    title: '', 
    description: '', 
    confirmText: '', 
    variant: 'delete' as any, 
    onConfirm: () => { } 
  });

  const {
    employees,
    isLoading,
    isSaving,
    isDeleting,
    handleSave,
    handleToggleEstado,
    deleteEmployee
  } = useEmployees();

  const filteredEmployees = employees.filter(e =>
    (e.Nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.Apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.Correo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.Telefono || '').includes(searchTerm) ||
    (e.Documento || '').includes(searchTerm) ||
    (e.NombreRol || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => (a.Nombre || '').localeCompare(b.Nombre || ''));

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const onSave = async (data: any, employee: any) => {
    const success = await handleSave(data, employee);
    if (success) {
      setIsDialogOpen(false);
      setEditingEmployee(null);
    }
    return success;
  };

  const onDelete = async (employee: any) => {
    const success = await deleteEmployee(employee);
    if (success) {
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
    return success;
  };

  return (
    <div className="space-y-6">
      <EmployeesStyles />

      {isLoading ? (
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando información...</p>
        </div>
      ) : (
        <>
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
            loadingText="Eliminando..."
          />

          <EmployeesHeader 
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            setEditingEmployee={setEditingEmployee}
            editingEmployee={editingEmployee}
            handleSave={onSave}
            isSaving={isSaving}
          />

          <div className="flex justify-start">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar empleados..." 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                className="pl-10" 
              />
            </div>
          </div>

          <EmployeesTable 
            employeesCount={filteredEmployees.length}
            paginatedEmployees={paginatedEmployees}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            handleToggleEstado={handleToggleEstado}
            setViewingEmployee={setViewingEmployee}
            setIsViewDialogOpen={setIsViewDialogOpen}
            setEditingEmployee={setEditingEmployee}
            setIsDialogOpen={setIsDialogOpen}
            setConfirmDialog={setConfirmDialog}
            deleteEmployee={onDelete}
          />

          <ViewEmployeeDialog 
            employee={viewingEmployee}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
          />
        </>
      )}
    </div>
  );
}
