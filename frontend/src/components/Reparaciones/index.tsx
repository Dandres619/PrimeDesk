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
import { Badge } from '../ui/badge';

export function Reparaciones() {
  const {
    reparaciones,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    clients,
    motorcycles,
    mechanics,
    availableServices,
    handleSave,
    anularReparacion,
    refreshData
  } = useReparaciones();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReparacion, setEditingReparacion] = useState<any>(null);
  const [viewingReparacion, setViewingReparacion] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', onConfirm: () => { }, confirmText: '', variant: 'default' as any });
  const [pdfPreview, setPdfPreview] = useState({ open: false, data: null as any, type: 'service-order' as any });

  const handleOpenEdit = (reparacion: any) => {
    setEditingReparacion(reparacion);
    setIsDialogOpen(true);
  };

  const handleOpenView = (reparacion: any) => {
    setViewingReparacion(reparacion);
  };

  const handleDownload = (order: any) => {
    setPdfPreview({ open: true, data: order, type: 'service-order' });
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(reparaciones.length / itemsPerPage) || 1;
  const paginatedReparaciones = reparaciones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pendiente de Venta':
      case 'Pendiente de venta':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300">{status}</Badge>;
      case 'Anulada':
        return <Badge className="bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300">{status}</Badge>;
      case 'Reparación finalizada':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">{status}</Badge>;
      case 'En proceso':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">{status}</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300">{status}</Badge>;
    }
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
              clients={clients}
              motorcycles={motorcycles}
              mechanics={mechanics}
              availableServices={availableServices}
              editingOrder={editingReparacion}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) refreshData();
              }}
              onOrderUpdated={refreshData}
              onSave={(data) => {
                if (!data) {
                  setIsDialogOpen(false);
                  setEditingReparacion(null);
                  refreshData();
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

