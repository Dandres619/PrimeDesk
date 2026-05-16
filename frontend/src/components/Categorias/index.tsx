import { useState } from 'react';
import { useCategorias } from './hooks/useCategorias';
import { CategoriasHeader } from './components/CategoriasHeader';
import { CategoriasTable } from './components/CategoriasTable';
import { CategoriasStyles } from './styles/CategoriasStyles';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tags, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function Categorias() {
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    categories,
    handleSave,
    handleDelete,
    toggleStatus
  } = useCategorias();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'delete' as any,
    onConfirm: () => { }
  });

  // Pagination logic consistent with Employees module
  const itemsPerPage = 10;
  const filteredCategories = categories.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const onSave = async (data: any, category: any) => {
    const success = await handleSave(data, category);
    if (success) {
      setIsDialogOpen(false);
      setEditingCategory(null);
    }
    return success;
  };

  if (isLoading) {
    return (
      <div className="categorias-root flex flex-col items-center justify-center min-h-[500px]">
        <CategoriasStyles />
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando Categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categorias-root space-y-6 text-left">
      <CategoriasStyles />
      
      <div className="categorias-content-animate space-y-6">
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
        />

        <CategoriasHeader
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          setEditingCategory={setEditingCategory}
          editingCategory={editingCategory}
          handleSave={onSave}
        />

        <div className="flex justify-start">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
          </div>
        </div>

        <CategoriasTable
          categoriesCount={filteredCategories.length}
          paginatedCategories={paginatedCategories}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          onToggleStatus={toggleStatus}
          onView={(c) => { setViewingCategory(c); setIsViewDialogOpen(true); }}
          onEdit={(c) => { setEditingCategory(c); setIsDialogOpen(true); }}
          onDelete={(c) => setConfirmDialog({
            open: true,
            title: 'Eliminar Categoría',
            description: `¿Está seguro de que desea eliminar la categoría "${c.name}"? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            variant: 'delete',
            onConfirm: () => handleDelete(c)
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
                <Tags className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Detalles de la Categoría
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Información del catálogo</p>
              </div>
              {viewingCategory && (
                <Badge className={cn(
                  "font-bold px-3 py-1 border-none",
                  viewingCategory.status === 'Activo' 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                )}>
                  {viewingCategory.status}
                </Badge>
              )}
            </div>

            {viewingCategory && (
              <div className="p-8 space-y-6 text-left">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nombre de Categoría</Label>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{viewingCategory.name}</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Descripción Completa</Label>
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {viewingCategory.description}
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
