import React, { useState, useEffect, useMemo } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { PackageSearch, Loader2, Search, Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const [touched, setTouched] = useState(false);
  
  const [popovers, setPopovers] = useState({
    brand: false,
    category: false
  });
  
  const [search, setSearch] = useState({
    brand: '',
    category: ''
  });

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

  const filteredBrands = brands.filter(b => 
    b.toLowerCase().includes(search.brand.toLowerCase())
  );

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.category.toLowerCase())
  );

  const selectedCategory = categories.find(c => c.id.toString() === form.categoryId);

  const nameError = useMemo(() => {
    if (form.name && form.name.length > 50) return 'Máximo 50 caracteres';
    return null;
  }, [form.name]);

  const descriptionError = useMemo(() => {
    const val = form.description;
    if (val && val.length > 80) return 'Máximo 80 caracteres';
    return null;
  }, [form.description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!form.name?.trim() || !form.brand?.trim() || !form.categoryId) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }
    if (nameError) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }
    if (descriptionError) {
      toast.error('Por favor corrija los errores en el formulario');
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
            {/* Full width row for Name */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre del Producto *</Label>
                {touched && nameError && <span className="text-red-500 text-[10px] font-bold">{nameError}</span>}
              </div>
              <Input
                placeholder="Ej. Filtro de Aceite"
                value={form.name}
                onChange={e => { setForm({ ...form, name: e.target.value }); setTouched(true); }}
                className={cn(
                  "h-11 rounded-xl focus:ring-2 outline-none transition-all",
                  touched && nameError ? "border-red-500 focus:ring-red-500/20" : "focus:ring-blue-500/20"
                )}
              />
            </div>

            {/* Same row for Brand and Category */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Marca *</Label>
              <Popover open={popovers.brand} onOpenChange={(open) => setPopovers({ ...popovers, brand: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                      !form.brand && "text-slate-500"
                    )}
                  >
                    <span className="truncate">
                      {form.brand || "Seleccionar marca..."}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto" 
                  align="start"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input
                        className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                        placeholder="Buscar marca..."
                        value={search.brand}
                        onChange={(e) => setSearch({ ...search, brand: e.target.value })}
                      />
                    </div>
                  </div>
                  <div 
                    className="max-h-[200px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {filteredBrands.length === 0 ? (
                      <div className="py-6 px-2 text-center text-sm text-slate-500">
                        No se encontraron marcas.
                      </div>
                    ) : (
                      filteredBrands.map(b => (
                        <div
                          key={b}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                            "hover:bg-slate-50 dark:hover:bg-slate-900",
                            form.brand === b && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                          )}
                          onClick={() => {
                            setForm({ ...form, brand: b });
                            setPopovers({ ...popovers, brand: false });
                            setSearch({ ...search, brand: '' });
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", form.brand === b ? "opacity-100" : "opacity-0")} />
                          <span>{b}</span>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Categoría *</Label>
              <Popover open={popovers.category} onOpenChange={(open) => setPopovers({ ...popovers, category: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                      !form.categoryId && "text-slate-500"
                    )}
                  >
                    <span className="truncate">
                      {selectedCategory ? selectedCategory.name : "Seleccionar categoría..."}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto" 
                  align="start"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input
                        className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                        placeholder="Buscar categoría..."
                        value={search.category}
                        onChange={(e) => setSearch({ ...search, category: e.target.value })}
                      />
                    </div>
                  </div>
                  <div 
                    className="max-h-[200px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {filteredCategories.length === 0 ? (
                      <div className="py-6 px-2 text-center text-sm text-slate-500">
                        No se encontraron categorías.
                      </div>
                    ) : (
                      filteredCategories.map(c => (
                        <div
                          key={c.id}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                            "hover:bg-slate-50 dark:hover:bg-slate-900",
                            form.categoryId === c.id.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                          )}
                          onClick={() => {
                            setForm({ ...form, categoryId: c.id.toString() });
                            setPopovers({ ...popovers, category: false });
                            setSearch({ ...search, category: '' });
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", form.categoryId === c.id.toString() ? "opacity-100" : "opacity-0")} />
                          <span>{c.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Description Row */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descripción</Label>
                {descriptionError && <span className="text-red-500 text-[10px] font-bold">{descriptionError}</span>}
              </div>
              <Textarea
                placeholder="Detalles del producto, especificaciones, etc."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className={cn(
                  "min-h-[120px] rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none",
                  descriptionError ? "border-red-500 focus:ring-red-500/20" : ""
                )}
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="h-12 px-10 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
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
