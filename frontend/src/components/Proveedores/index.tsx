import { useState } from 'react';
import { useProveedores } from './hooks/useProveedores';
import { ProveedoresHeader } from './components/ProveedoresHeader';
import { ProveedoresTable } from './components/ProveedoresTable';
import { ProveedoresStyles } from './styles/ProveedoresStyles';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Truck, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function Proveedores() {
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    suppliers,
    handleSave,
    handleDelete,
    toggleStatus
  } = useProveedores();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [viewingSupplier, setViewingSupplier] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'delete' as any,
    onConfirm: () => { }
  });

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(suppliers.length / itemsPerPage));
  const paginatedSuppliers = suppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const onSave = async (data: any, supplier: any) => {
    const success = await handleSave(data, supplier);
    if (success) {
      setIsDialogOpen(false);
      setEditingSupplier(null);
    }
    return success;
  };

  if (isLoading) {
    return (
      <div className="proveedores-root">
        <ProveedoresStyles />
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando Proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="proveedores-root space-y-6">
      <ProveedoresStyles />

      <div className="proveedores-content-animate space-y-6">
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
        />

        <ProveedoresHeader
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          setEditingSupplier={setEditingSupplier}
          editingSupplier={editingSupplier}
          handleSave={onSave}
        />

        <div className="flex justify-start">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proveedores..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <ProveedoresTable
          suppliersCount={suppliers.length}
          paginatedSuppliers={paginatedSuppliers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          onToggleStatus={toggleStatus}
          onView={(s) => { setViewingSupplier(s); setIsViewDialogOpen(true); }}
          onEdit={(s) => { setEditingSupplier(s); setIsDialogOpen(true); }}
          onDelete={(s) => setConfirmDialog({
            open: true,
            title: 'Eliminar Proveedor',
            description: `¿Está seguro de que desea eliminar al proveedor "${s.name}"? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            variant: 'delete',
            onConfirm: () => handleDelete(s)
          })}
        />

        {/* View Details Modal */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent
            className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal max-w-2xl w-[95vw] bg-white dark:bg-slate-950"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Detalles del Proveedor
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Información corporativa y de contacto</p>
              </div>
              {viewingSupplier && (
                <Badge className={viewingSupplier.status === 'Activo'
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 font-bold"
                }>
                  {viewingSupplier.status}
                </Badge>
              )}
            </div>

            {viewingSupplier && (
              <div className="p-8 space-y-6 text-left overflow-y-auto max-h-[60vh] custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

                  {/* Column 1: Información General */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-tight text-foreground uppercase border-b border-slate-100 dark:border-slate-800 pb-2">
                      Información General
                    </h3>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase font-semibold">
                        {viewingSupplier.personType === 'Natural' ? 'Nombre' : 'Nombre Empresa'}
                      </Label>
                      <p className="font-medium text-foreground">{viewingSupplier.name || '-'}</p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase font-semibold">
                        Tipo de Persona
                      </Label>
                      <p className="font-medium text-foreground">{viewingSupplier.personType || "Natural"}</p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase font-semibold">
                        {viewingSupplier.personType === 'Natural' ? 'Documento' : 'NIT'}
                      </Label>
                      <p className="font-medium text-foreground">{viewingSupplier.taxId || "-"}</p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase font-semibold">
                        Especialidad
                      </Label>
                      <p className="font-medium text-foreground">{viewingSupplier.specialty || "-"}</p>
                    </div>
                  </div>

                  {/* Column 2: Datos de Contacto */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-tight text-foreground uppercase border-b border-slate-100 dark:border-slate-800 pb-2">
                      Datos de Contacto
                    </h3>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase font-semibold">
                        Persona de Contacto
                      </Label>
                      <p className="font-medium text-foreground">{viewingSupplier.contact || '-'}</p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase font-semibold">
                        Teléfono
                      </Label>
                      <p className="font-medium text-foreground">{viewingSupplier.phone || '-'}</p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase font-semibold">
                        Correo Electrónico
                      </Label>
                      <p className="font-medium text-foreground">{viewingSupplier.email || '-'}</p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase font-semibold">
                        Dirección
                      </Label>
                      <p className="font-medium text-foreground">{viewingSupplier.address}, {viewingSupplier.city}, {viewingSupplier.country}</p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase font-semibold">
                        Sitio Web
                      </Label>
                      <p className="font-medium text-foreground">{viewingSupplier.website || "No registra"}</p>
                    </div>
                  </div>

                </div>

                {viewingSupplier.notes && (
                  <div className="space-y-2 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                    <Label className="text-xs text-muted-foreground uppercase font-semibold">
                      Notas Adicionales
                    </Label>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed">
                      {viewingSupplier.notes}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)} className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl">
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
