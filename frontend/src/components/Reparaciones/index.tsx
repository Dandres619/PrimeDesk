import { useState } from 'react';
import { useReparaciones } from './hooks/useReparaciones';
import { ReparacionesHeader } from './components/ReparacionesHeader';
import { ReparacionesTable } from './components/ReparacionesTable';
import { ReparacionDialog } from './components/ReparacionDialog';
import { ReparacionDetails } from './components/ReparacionDetails';
import { ReparacionesStyles } from './styles/ReparacionesStyles';
import { Dialog } from '../ui/dialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { PDFPreviewDialog } from '../shared/PDFPreviewDialog';

export function Reparaciones() {
  const {
    reparaciones,
    isLoading,
    isSaving,
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    setIsDialogOpen,
    editingReparacion,
    setEditingReparacion,
    viewingReparacion,
    setViewingReparacion,
    currentPage,
    setCurrentPage,
    clients,
    motorcycles,
    mechanics,
    availableServices,
    handleOpenEdit,
    handleOpenView,
    handleSave,
    anularReparacion,
    refreshData
  } = useReparaciones();

  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', onConfirm: () => { }, confirmText: '', variant: 'default' as any });
  const [pdfPreview, setPdfPreview] = useState({ open: false, data: null as any, type: 'service-order' as any });

  const handleDownload = (order: any) => {
    setPdfPreview({ open: true, data: order, type: 'service-order' });
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(reparaciones.length / itemsPerPage) || 1;
  const paginatedReparaciones = reparaciones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => {
    return <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{status}</span>;
  };

  return (
    <div className="reparaciones-root space-y-6 text-left">
      <ReparacionesStyles />

      {isLoading ? (
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando Reparaciones...</p>
        </div>
      ) : (
        <div className="reparaciones-content-animate space-y-6">
          <ReparacionesHeader
            searchTerm={searchTerm}
            setSearchTerm={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            onNew={() => { setEditingReparacion(null); setIsDialogOpen(true); }}
          />

          <ReparacionesTable
            reparacionesCount={reparaciones.length}
            paginatedReparaciones={paginatedReparaciones}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onAnular={(id) => setConfirmDialog({
              open: true,
              title: 'Anular Reparación',
              description: '¿Está seguro de que desea anular esta reparación? El estado cambiará a Anulada.',
              confirmText: 'Anular',
              variant: 'destructive',
              onConfirm: () => anularReparacion(id)
            })}
            onDownload={handleDownload}
          />

          {/* New/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingReparacion(null); }}>
            <ReparacionDialog
              isOpen={isDialogOpen}
              clients={clients}
              motorcycles={motorcycles}
              mechanics={mechanics}
              availableServices={availableServices}
              editingOrder={editingReparacion}
              isSaving={isSaving}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEditingReparacion(null);
              }}
              onOrderUpdated={refreshData}
              onSave={(data) => {
                if (!data) {
                  setIsDialogOpen(false);
                  setEditingReparacion(null);
                  return;
                }
                handleSave(data);
              }}
            />
          </Dialog>

          {/* View Details Dialog */}
          <Dialog open={!!viewingReparacion} onOpenChange={(open) => { if (!open) setViewingReparacion(null); }}>
            <ReparacionDetails
              reparacion={viewingReparacion}
              availableServices={availableServices}
              mechanics={mechanics}
              getStatusBadge={getStatusBadge}
              onClose={() => setViewingReparacion(null)}
            />
          </Dialog>

          <ConfirmDialog
            open={confirmDialog.open}
            onOpenChange={(open: boolean) => setConfirmDialog(prev => ({ ...prev, open }))}
            title={confirmDialog.title}
            description={confirmDialog.description}
            confirmText={confirmDialog.confirmText}
            variant={confirmDialog.variant}
            onConfirm={confirmDialog.onConfirm}
          />

          <PDFPreviewDialog
            open={pdfPreview.open}
            onOpenChange={(open) => setPdfPreview(prev => ({ ...prev, open }))}
            data={pdfPreview.data}
            type={pdfPreview.type}
            onGenerate={() => { }}
          />
        </div>
      )}
    </div>
  );
}

