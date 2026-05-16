import { Tags, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Dialog, DialogTrigger } from '../../ui/dialog';
import { CategoryDialog } from './CategoryDialog';

interface CategoriasHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  setEditingCategory: (category: any) => void;
  editingCategory: any;
  handleSave: (data: any, editingCategory: any) => Promise<boolean>;
}

export function CategoriasHeader({
  isDialogOpen,
  setIsDialogOpen,
  setEditingCategory,
  editingCategory,
  handleSave
}: CategoriasHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
          <Tags className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-semibold">Categorías de Productos</h1>
          <p className="text-muted-foreground">Gestión y clasificación del inventario</p>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditingCategory(null)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        </DialogTrigger>
        <CategoryDialog
          category={editingCategory}
          onSave={(data) => handleSave(data, editingCategory)}
          onOpenChange={setIsDialogOpen}
        />
      </Dialog>
    </div>
  );
}
