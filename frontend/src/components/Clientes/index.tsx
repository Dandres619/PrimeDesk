import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useClients } from './hooks/useClients';
import { ClientsStyles } from './styles/ClientsStyles';
import { ClientsHeader } from './components/ClientsHeader';
import { ClientsTable } from './components/ClientsTable';
import { ViewClientDialog } from './components/ViewClientDialog';

export function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [viewingClient, setViewingClient] = useState<any>(null);
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
    clients,
    isLoading,
    isSaving,
    isDeleting,
    handleSave,
    handleToggleEstado,
    deleteClient
  } = useClients();

  const filteredClients = clients.filter(c =>
    (c.Nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.Apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.Correo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.Telefono || '').includes(searchTerm) ||
    (c.Documento || '').includes(searchTerm)
  ).sort((a, b) => (a.Nombre || '').localeCompare(b.Nombre || ''));

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const onSave = async (data: any, client: any) => {
    const success = await handleSave(data, client);
    if (success) {
      setIsDialogOpen(false);
      setEditingClient(null);
    }
    return success;
  };

  const onDelete = async (client: any) => {
    const success = await deleteClient(client);
    if (success) {
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
    return success;
  };

  return (
    <div className="clients-root space-y-6">
      <ClientsStyles />

      {isLoading ? (
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando Clientes...</p>
        </div>
      ) : (
        <div className="clients-content-animate space-y-6">
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

          <ClientsHeader
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            setEditingClient={setEditingClient}
            editingClient={editingClient}
            handleSave={onSave}
            isSaving={isSaving}
          />

          <div className="flex justify-start">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
          </div>

          <ClientsTable
            clientsCount={filteredClients.length}
            paginatedClients={paginatedClients}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            handleToggleEstado={handleToggleEstado}
            setViewingClient={setViewingClient}
            setIsViewDialogOpen={setIsViewDialogOpen}
            setEditingClient={setEditingClient}
            setIsDialogOpen={setIsDialogOpen}
            setConfirmDialog={setConfirmDialog}
            deleteClient={onDelete}
          />

          <ViewClientDialog
            client={viewingClient}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
          />
        </div>
      )}
    </div>
  );
}
