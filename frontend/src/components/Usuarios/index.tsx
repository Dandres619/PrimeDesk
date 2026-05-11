import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { useUsers } from './hooks/useUsers';
import { UsersStyles } from './styles/UsersStyles';
import { UsersHeader } from './components/UsersHeader';
import { UsersTable } from './components/UsersTable';
import { UserDialog } from './components/UserDialog';
import { ViewUserDialog } from './components/ViewUserDialog';

const tipoBadges: Record<string, any> = {
  'Administrador': { class: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800', label: 'Administrador' },
  'Mecánico': { class: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', label: 'Empleado' },
  'Cliente': { class: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800', label: 'Cliente' }
};

export function Usuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({ email: '', id_rol: '', password: '', confirmPassword: '', estado: true });

  const {
    usuarios,
    isLoading,
    isSaving,
    handleToggleEstado,
    handleSaveUser
  } = useUsers();

  const resetForm = () => {
    setFormData({ email: '', id_rol: '', password: '', confirmPassword: '', estado: true });
    setEditingUser(null);
  };

  const handleEdit = (u: any) => {
    setEditingUser(u);
    setFormData({
      email: u.Correo,
      id_rol: u.ID_Rol.toString(),
      password: '',
      confirmPassword: '',
      estado: u.Estado === true || u.Estado === 1
    });
    setShowModal(true);
  };

  const filteredUsers = usuarios.filter(u =>
    u.Correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.Nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.Apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.NombreRol.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.Correo.localeCompare(b.Correo));

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <UsersStyles />

      {isLoading ? (
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando información...</p>
        </div>
      ) : (
        <>
          <UsersHeader />

          <div className="flex justify-start">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar usuarios..." 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                className="pl-10" 
              />
            </div>
          </div>

          <UsersTable 
            usersCount={filteredUsers.length}
            paginatedUsers={paginatedUsers}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            handleToggleEstado={handleToggleEstado}
            setViewingUser={setViewingUser}
            setIsViewDialogOpen={setIsViewDialogOpen}
            handleEdit={handleEdit}
          />

          <UserDialog 
            showModal={showModal}
            setShowModal={setShowModal}
            editingUser={editingUser}
            onSave={handleSaveUser}
            isSaving={isSaving}
            formData={formData}
            setFormData={setFormData}
            resetForm={resetForm}
          />

          <ViewUserDialog 
            viewingUser={viewingUser}
            isViewDialogOpen={isViewDialogOpen}
            setIsViewDialogOpen={setIsViewDialogOpen}
            tipoBadges={tipoBadges}
          />
        </>
      )}
    </div>
  );
}
