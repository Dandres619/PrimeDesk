import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { PackageSearch, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDialogProps {
  product: any;
  categories: any[];
  brands: string[];
  onSave: (data: any, product: any) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
}

export function ProductDialog({ product, categories, brands, onSave, onOpenChange }: ProductDialogProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    brand: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId?.toString() || '',
        brand: product.brand || ''
      });
    } else {
      setForm({
        name: '',
        description: '',
        categoryId: '',
        brand: ''
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.brand?.trim() || !form.categoryId) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    setIsSaving(true);
    const success = await onSave(form, product);
    setIsSaving(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <DialogContent
      className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal max-w-2xl w-[95vw] bg-white dark:bg-slate-950"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
            <PackageSearch className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {product ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Complete la información del inventario</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar space-y-6 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre del Producto *</Label>
              <Input
                placeholder="Ej. Filtro de Aceite"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="h-11 rounded-xl focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Marca *</Label>
              <select
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                className="w-full h-11 px-4 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Seleccione una marca...</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Categoría *</Label>
              <select
                value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                className="w-full h-11 px-4 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Seleccione una categoría...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descripción</Label>
            <Textarea
              placeholder="Detalles del producto, especificaciones, etc."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="min-h-[120px] rounded-xl focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="h-11 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (product ? 'Actualizar Producto' : 'Crear Producto')}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
