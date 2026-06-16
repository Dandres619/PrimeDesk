import React, { useState, useEffect } from 'react';
import { Loader2, Save, ChevronsUpDown, Check, Search } from 'lucide-react';
import { PiMotorcycle } from 'react-icons/pi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMotorcycleData } from '../../Motos/hooks/useMotorcycleData';

interface MotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMoto: any;
  formData: any;
  setFormData: (data: any) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  motos?: any[];
}

export function MotoDialog({
  open,
  onOpenChange,
  editingMoto,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  motos
}: MotoDialogProps) {
  const { data: motorcycleDataset, loading: loadingDataset } = useMotorcycleData();
  const [marcaSearch, setMarcaSearch] = useState('');
  const [modeloSearch, setModeloSearch] = useState('');
  const [isMarcaPopoverOpen, setIsMarcaPopoverOpen] = useState(false);
  const [isModeloPopoverOpen, setIsModeloPopoverOpen] = useState(false);
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const currentYear = new Date().getFullYear();

  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'marca': if (!value) error = 'La marca es obligatoria'; break;
      case 'modelo': if (!value) error = 'El modelo es obligatorio'; break;
      case 'ano':
        if (!value) error = 'El año es obligatorio';
        else if (value < 1990) error = 'Año no válido';
        else if (value > currentYear + 1) error = 'El año no puede ser futuro';
        break;
      case 'placa':
        if (!value) {
          error = 'La placa es obligatoria';
        } else if (!/^[A-Z]{3}\d{2}[A-Z]$/.test(value.toUpperCase())) {
          error = 'Formato inválido (Ej: XYZ25H)';
        } else if (motos && motos.some((m: any) => m.placa.trim().toUpperCase() === value.trim().toUpperCase() && m.id !== editingMoto?.id)) {
          error = 'Ya tienes una motocicleta registrada con esta placa';
        }
        break;
      case 'color':
        if (!value) {
          error = 'El color es obligatorio';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(value)) {
          error = 'Solo letras';
        } else if (value.length > 50) {
          error = 'Máximo 50 caracteres';
        }
        break;
      case 'cilindraje':
        if (value === '') error = 'El cilindraje es obligatorio';
        else if (isNaN(value)) error = 'Solo números';
        else if (value < 50) error = 'Mínimo 50cc';
        else if (value > 2500) error = 'Máximo 2500cc';
        break;
      case 'kilometraje':
        if (value === '') error = 'El kilometraje es obligatorio';
        else if (isNaN(value)) error = 'Solo números';
        else if (value <= 0) error = 'El kilometraje no puede ser 0 o menor';
        else if (value > 360000) error = 'Máximo 360,000 km';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const brands = Object.keys(motorcycleDataset).sort();
  const filteredBrands = brands.filter(b => b.toLowerCase().includes(marcaSearch.toLowerCase()));

  const models = formData.marca ? (motorcycleDataset[formData.marca] || []) : [];
  const filteredModels = models.filter(m => m.toLowerCase().includes(modeloSearch.toLowerCase()));

  const VISIBLE_ITEMS = 50;

  useEffect(() => {
    if (!open) {
      setMarcaSearch('');
      setModeloSearch('');
      setErrors({});
      setTouched({});
    }
  }, [open]);

  const blockInvalidChar = (e: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-', ',', '.'].includes(e.key)) e.preventDefault();
    if (e.key === '0' && (e.currentTarget as HTMLInputElement).value === '') e.preventDefault();
  };

  const handleInputChange = (name: string, value: any) => {
    let finalValue = value;
    
    if (name === 'color') {
      finalValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
    } else if (name === 'placa') {
      finalValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    } else if (name === 'ano' || name === 'cilindraje' || name === 'kilometraje') {
      if (value === '') {
        finalValue = '';
      } else {
        const strValue = value.toString().replace(/\D/g, '');
        let num = parseInt(strValue);
        
        if (name === 'ano') {
          const yearStr = strValue.slice(0, 4);
          num = parseInt(yearStr);
          if (num > currentYear + 1) num = currentYear + 1;
          finalValue = isNaN(num) ? '' : num;
        } else if (name === 'cilindraje') {
          num = parseInt(strValue.slice(0, 4));
          if (num > 2500) num = 2500;
          finalValue = isNaN(num) ? '' : num;
        } else if (name === 'kilometraje') {
          finalValue = strValue.slice(0, 7);
          num = parseInt(finalValue);
          finalValue = isNaN(num) ? '' : num;
        }
      }
    }
    
    if (name === 'marca') {
      setFormData({ ...formData, [name]: finalValue, modelo: '' });
    } else {
      setFormData({ ...formData, [name]: finalValue });
    }
    
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, finalValue);
  };

  const handleFocus = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, (formData as any)[name]);
  };

  const handleBrandSelect = (brand: string) => {
    handleInputChange('marca', brand);
    setIsMarcaPopoverOpen(false);
    setMarcaSearch('');
  };

  const handleModelSelect = (model: string) => {
    handleInputChange('modelo', model);
    setIsModeloPopoverOpen(false);
    setModeloSearch('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    
    const fieldsToValidate = ['marca', 'modelo', 'ano', 'placa', 'color', 'cilindraje', 'kilometraje'];
    fieldsToValidate.forEach(key => {
      const error = validateField(key, (formData as any)[key]);
      if (error) { newErrors[key] = error; hasErrors = true; }
    });
    
    setErrors(newErrors);
    setTouched(fieldsToValidate.reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    if (hasErrors) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }
    
    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl animate-modal p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl rounded-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-20 -mt-20 rounded-full" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0 transition-transform hover:scale-105">
                <PiMotorcycle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {editingMoto ? 'Editar Información' : 'Nueva Motocicleta'}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {editingMoto ? `Actualizando detalles de la placa ${editingMoto.placa}` : 'Registra un nuevo vehículo en tu perfil'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} noValidate className="flex flex-col max-h-[calc(90vh-140px)]">
          <div 
            className="flex-1 overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Marca */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="marca">Marca *</Label>
                  {touched.marca && errors.marca && <span className="text-red-500 text-[10px] font-medium">{errors.marca}</span>}
                </div>
                <Popover open={isMarcaPopoverOpen} onOpenChange={setIsMarcaPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between font-normal h-11 px-4 text-left overflow-hidden", !formData.marca && "text-muted-foreground", touched.marca && errors.marca && "border-red-500")}
                      onClick={() => handleFocus('marca')}
                      disabled={loadingDataset}
                    >
                      <span className="truncate">{formData.marca || "Seleccionar marca..."}</span>
                      {loadingDataset ? <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50 ml-2" /> : <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <div className="p-2 border-b">
                      <div className="flex items-center px-3 py-2 bg-muted/50 rounded-md">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                          className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                          placeholder="Buscar marca..."
                          value={marcaSearch}
                          onChange={(e) => setMarcaSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div 
                      className="max-h-[200px] overflow-y-auto p-1 custom-scrollbar"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      {filteredBrands.length === 0 ? (
                        <div className="py-4 px-2 text-center text-sm text-muted-foreground">No se encontró la marca.</div>
                      ) : (
                        filteredBrands.slice(0, VISIBLE_ITEMS).map((brand) => (
                          <div
                            key={brand}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent",
                              formData.marca === brand && "bg-blue-50 text-blue-700 font-medium"
                            )}
                            onClick={() => handleBrandSelect(brand)}
                          >
                            <Check className={cn("mr-2 h-4 w-4", formData.marca === brand ? "opacity-100" : "opacity-0")} />
                            {brand}
                          </div>
                        ))
                      )}
                      {filteredBrands.length > VISIBLE_ITEMS && (
                        <p className="text-[10px] text-center py-2 text-muted-foreground border-t mt-1">
                          Mostrando {VISIBLE_ITEMS} de {filteredBrands.length} marcas. Busque por nombre.
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="modelo">Modelo *</Label>
                  {touched.modelo && errors.modelo && <span className="text-red-500 text-[10px] font-medium">{errors.modelo}</span>}
                </div>
                <Popover open={isModeloPopoverOpen} onOpenChange={setIsModeloPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between font-normal h-11 px-4 text-left overflow-hidden", !formData.modelo && "text-muted-foreground", touched.modelo && errors.modelo && "border-red-500")}
                      onClick={() => handleFocus('modelo')}
                      disabled={loadingDataset || !formData.marca}
                    >
                      <span className="truncate">{formData.modelo || (!formData.marca ? "Primero seleccione marca" : "Seleccionar modelo...")}</span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <div className="p-2 border-b">
                      <div className="flex items-center px-3 py-2 bg-muted/50 rounded-md">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                          className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                          placeholder="Buscar modelo..."
                          value={modeloSearch}
                          onChange={(e) => setModeloSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div 
                      className="max-h-[200px] overflow-y-auto p-1 custom-scrollbar"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      {!formData.marca ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Seleccione una marca primero.</p>
                      ) : filteredModels.length === 0 ? (
                        <div className="py-4 px-2 text-center text-sm text-muted-foreground">No se encontró el modelo.</div>
                      ) : (
                        filteredModels.slice(0, VISIBLE_ITEMS).map((model) => (
                          <div
                            key={model}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent",
                              formData.modelo === model && "bg-blue-50 text-blue-700 font-medium"
                            )}
                            onClick={() => handleModelSelect(model)}
                          >
                            <Check className={cn("mr-2 h-4 w-4", formData.modelo === model ? "opacity-100" : "opacity-0")} />
                            {model}
                          </div>
                        ))
                      )}
                      {filteredModels.length > VISIBLE_ITEMS && (
                        <p className="text-[10px] text-center py-2 text-muted-foreground border-t mt-1">
                          Mostrando {VISIBLE_ITEMS} de {filteredModels.length} modelos. Busque por nombre.
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="ano">Año *</Label>
                  {touched.ano && errors.ano && <span className="text-red-500 text-[10px] font-medium">{errors.ano}</span>}
                </div>
                <Input
                  id="ano"
                  type="number"
                  value={formData.ano}
                  onChange={(e) => handleInputChange('ano', e.target.value)}
                  onFocus={() => handleFocus('ano')}
                  onKeyDown={blockInvalidChar}
                  className={cn(touched.ano && errors.ano && "border-red-500")}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="placa">Placa *</Label>
                  {touched.placa && errors.placa && <span className="text-red-500 text-[10px] font-medium">{errors.placa}</span>}
                </div>
                <Input
                  id="placa"
                  value={formData.placa}
                  onChange={(e) => handleInputChange('placa', e.target.value)}
                  onFocus={() => handleFocus('placa')}
                  placeholder="Ej: ABC123"
                  className={cn(touched.placa && errors.placa && "border-red-500")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="cilindraje">Cilindraje (cc) *</Label>
                  {touched.cilindraje && errors.cilindraje && <span className="text-red-500 text-[10px] font-medium">{errors.cilindraje}</span>}
                </div>
                <Input
                  id="cilindraje"
                  type="number"
                  value={formData.cilindraje}
                  onChange={(e) => handleInputChange('cilindraje', e.target.value)}
                  onFocus={() => handleFocus('cilindraje')}
                   onKeyDown={blockInvalidChar}
                   placeholder="Ej: 600"
                   className={cn(touched.cilindraje && errors.cilindraje && "border-red-500")}
                 />
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between items-center">
                   <Label htmlFor="kilometraje">Kilometraje *</Label>
                  {touched.kilometraje && errors.kilometraje && <span className="text-red-500 text-[10px] font-medium">{errors.kilometraje}</span>}
                </div>
                <Input
                  id="kilometraje"
                  type="number"
                  value={formData.kilometraje}
                  onChange={(e) => handleInputChange('kilometraje', e.target.value)}
                  onFocus={() => handleFocus('kilometraje')}
                  onKeyDown={blockInvalidChar}
                  placeholder="Ej: 5000"
                  className={cn(touched.kilometraje && errors.kilometraje && "border-red-500")}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="color">Color *</Label>
                  {touched.color && errors.color && <span className="text-red-500 text-[10px] font-medium">{errors.color}</span>}
                </div>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  onFocus={() => handleFocus('color')}
                  placeholder="Ej: Negro Mate"

                  className={cn(touched.color && errors.color && "border-red-500")}
                />
              </div>
            </div>
          </div>

          <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-12 w-full sm:w-auto motos-btn-primary rounded-xl shadow-xl transition-all hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingMoto ? 'Actualizar Motocicleta' : 'Registrar Motocicleta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
