import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Dialog } from '../ui/dialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useMotos } from './hooks/useMotos';
import { MotosHeader } from './components/MotosHeader';
import { MotosTable } from './components/MotosTable';
import { ViewMotoDialog } from './components/ViewMotoDialog';
import { MotosStyles } from './styles/MotosStyles';

export function Motos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMoto, setEditingMoto] = useState<any>(null);
  const [viewingMoto, setViewingMoto] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'delete' as any,
    onConfirm: () => { }
  });

  const {
    motos,
    clients,
    isLoading,
    isSaving,
    isDeleting,
    handleSave,
    handleDelete,
    toggleStatus
  } = useMotos();

  const filteredMotos = motos.filter(m =>
    m.Placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.Marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.Modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${m.NombreCliente} ${m.ApellidoCliente}`.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.Marca.localeCompare(b.Marca));

  const totalPages = Math.max(1, Math.ceil(filteredMotos.length / itemsPerPage));
  const paginatedMotos = filteredMotos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const onSave = async (formData: any) => {
    const success = await handleSave(formData, editingMoto);
    if (success) {
      setIsDialogOpen(false);
      setEditingMoto(null);
    }
    return success;
  };

  return (
    <div className="motos-root space-y-6">
      <MotosStyles />

      {isLoading ? (
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando Motocicletas...</p>
        </div>
      ) : (
        <div className="motos-content-animate space-y-6">
          <MotosHeader
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            setEditingMoto={setEditingMoto}
            editingMoto={editingMoto}
            clients={clients}
            onSave={onSave}
            isSaving={isSaving}
          />

          <div className="flex justify-start">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar motocicletas..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
          </div>

          <MotosTable
            paginatedMotos={paginatedMotos}
            totalFilteredMotos={filteredMotos.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            toggleStatus={toggleStatus}
            setViewingMoto={setViewingMoto}
            setEditingMoto={setEditingMoto}
            setIsDialogOpen={setIsDialogOpen}
            setConfirmDialog={setConfirmDialog}
            deleteMoto={handleDelete}
          />

          <Dialog open={!!viewingMoto} onOpenChange={() => setViewingMoto(null)}>
            <ViewMotoDialog viewingMoto={viewingMoto} />
          </Dialog>

          <ConfirmDialog
            open={confirmDialog.open}
            onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
            title={confirmDialog.title}
            description={confirmDialog.description}
            confirmText={confirmDialog.confirmText}
            variant={confirmDialog.variant}
            onConfirm={confirmDialog.onConfirm}
            loading={isDeleting}
          />
        </div>
      )}
    </div>
  );
}
