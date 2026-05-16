import { PackageSearch, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Dialog, DialogTrigger } from '../../ui/dialog';
import { ProductDialog } from './ProductDialog';

interface ProductosHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingProduct: any;
  setEditingProduct: (p: any) => void;
  categories: any[];
  brands: string[];
  handleSave: (data: any, product: any) => Promise<boolean>;
}

export function ProductosHeader({
  isDialogOpen,
  setIsDialogOpen,
  editingProduct,
  setEditingProduct,
  categories,
  brands,
  handleSave
}: ProductosHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
          <PackageSearch className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">Gestión de inventario de repuestos y accesorios</p>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }} 
            className="productos-btn-primary whitespace-nowrap h-11 px-6 active:scale-95"
          >
            <Plus className="w-5 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </DialogTrigger>
        <ProductDialog 
          product={editingProduct} 
          categories={categories} 
          brands={brands} 
          onSave={handleSave} 
          onOpenChange={setIsDialogOpen}
        />
      </Dialog>
    </div>
  );
}
