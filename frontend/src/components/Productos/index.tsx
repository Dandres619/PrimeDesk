import { useState } from 'react';
import { useProductos } from './hooks/useProductos';
import { ProductosHeader } from './components/ProductosHeader';
import { ProductosTable } from './components/ProductosTable';
import { ProductosStyles } from './styles/ProductosStyles';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { PackageSearch, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function Productos() {
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    products,
    categories,
    brands,
    handleSave,
    handleDelete,
    toggleStatus
  } = useProductos();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
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
  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const onSave = async (data: any, product: any) => {
    const success = await handleSave(data, product);
    if (success) {
      setIsDialogOpen(false);
      setEditingProduct(null);
    }
    return success;
  };

  if (isLoading) {
    return (
      <div className="productos-root">
        <ProductosStyles />
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando Productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="productos-root space-y-6 text-left">
      <ProductosStyles />
      
      <div className="productos-content-animate space-y-6">
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
        />

        <ProductosHeader
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          setEditingProduct={setEditingProduct}
          editingProduct={editingProduct}
          categories={categories}
          brands={brands}
          handleSave={onSave}
        />

        <div className="flex justify-start">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
          </div>
        </div>

        <ProductosTable
          productsCount={products.length}
          paginatedProducts={paginatedProducts}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          onToggleStatus={toggleStatus}
          onView={(p) => { setViewingProduct(p); setIsViewDialogOpen(true); }}
          onEdit={(p) => { setEditingProduct(p); setIsDialogOpen(true); }}
          onDelete={(p) => setConfirmDialog({
            open: true,
            title: 'Eliminar Producto',
            description: `¿Está seguro de que desea eliminar el producto "${p.name}"? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            variant: 'delete',
            onConfirm: () => handleDelete(p)
          })}
        />

        {/* View Details Modal */}
        <Dialog 
          open={isViewDialogOpen} 
          onOpenChange={setIsViewDialogOpen}
        >
          <DialogContent 
            className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal max-w-xl w-[95vw] bg-white dark:bg-slate-950"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                <PackageSearch className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Detalles del Producto
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Información del inventario</p>
              </div>
              {viewingProduct && (
                <Badge className={cn(
                  "font-bold px-3 py-1 border-none rounded-lg",
                  viewingProduct.status === 'Activo' 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                )}>
                  {viewingProduct.status}
                </Badge>
              )}
            </div>

            {viewingProduct && (
              <div className="p-8 space-y-8 text-left overflow-y-auto max-h-[60vh] custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nombre</Label>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{viewingProduct.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Marca</Label>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{viewingProduct.brand}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Categoría</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="px-3 py-1 font-bold border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400">
                        {viewingProduct.categoryName}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Descripción Detallada</Label>
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {viewingProduct.description || "Sin descripción disponible."}
                  </div>
                </div>
              </div>
            )}

            <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <Button 
                variant="ghost" 
                onClick={() => setIsViewDialogOpen(false)}
                className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
              >
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
