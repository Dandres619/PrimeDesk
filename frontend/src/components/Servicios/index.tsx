import { useState } from 'react';
import { Dialog } from '../ui/dialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useServicios } from './hooks/useServicios';
import { ServiciosHeader } from './components/ServiciosHeader';
import { ServiciosTable } from './components/ServiciosTable';
import { ServicioDialog } from './components/ServicioDialog';
import { ViewServicioDialog } from './components/ViewServicioDialog';

import { ServiciosStyles } from './styles/ServiciosStyles';

export function Servicios() {
  const {
    services,
    isLoading,
    isSaving,
    isDeleting,
    handleSave,
    deleteService,
    toggleStatus
  } = useServicios();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [viewingService, setViewingService] = useState<any>(null);
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

  const filteredServices = services.filter(s =>
    s.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.Descripcion && s.Descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => a.Nombre.localeCompare(b.Nombre));

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const onSave = async (formData: any) => {
    const success = await handleSave(formData, editingService);
    if (success) {
      setIsDialogOpen(false);
      setEditingService(null);
    }
  };

  const onDelete = (service: any) => {
    setConfirmDialog({
      open: true,
      title: 'Eliminar Servicio',
      description: `¿Está seguro de que desea eliminar el servicio ${service.Nombre}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'delete',
      onConfirm: () => {
        deleteService(service.ID_Servicio).then(success => {
          if (success) setConfirmDialog(prev => ({ ...prev, open: false }));
        });
      }
    });
  };

  return (
    <div className="servicios-root space-y-6">
      <ServiciosStyles />

      {isLoading ? (
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando Servicios...</p>
        </div>
      ) : (
        <div className="servicios-content-animate space-y-6">
          <ServiciosHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onOpenDialog={() => { setEditingService(null); setIsDialogOpen(true); }}
          />

          <ServiciosTable
            services={filteredServices}
            paginatedServices={paginatedServices}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            onView={setViewingService}
            onEdit={(s) => { setEditingService(s); setIsDialogOpen(true); }}
            onDelete={onDelete}
            onToggleStatus={toggleStatus}
          />

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingService(null);
          }}>
            <ServicioDialog
              service={editingService}
              onSave={onSave}
              isSaving={isSaving}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEditingService(null);
              }}
            />
          </Dialog>

          <ViewServicioDialog
            service={viewingService}
            onClose={() => setViewingService(null)}
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
            loadingText="Eliminando..."
          />
        </div>
      )}
    </div>
  );
}
