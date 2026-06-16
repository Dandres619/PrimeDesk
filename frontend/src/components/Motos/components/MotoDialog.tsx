import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Loader2, ChevronsUpDown, Check, Search } from 'lucide-react';
import { PiMotorcycle } from 'react-icons/pi';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMotorcycleData } from '../hooks/useMotorcycleData';

export function MotoDialog({ moto, motos, clients, onSave, isSaving, onOpenChange }: any) {
  const [formData, setFormData] = useState({
    id_cliente: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    placa: '',
    color: '',
    motor: '',
    kilometraje: 1000,
    estado: true
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClientPopoverOpen, setIsClientPopoverOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [isMarcaPopoverOpen, setIsMarcaPopoverOpen] = useState(false);
  const [marcaSearch, setMarcaSearch] = useState('');
  const [isModeloPopoverOpen, setIsModeloPopoverOpen] = useState(false);
  const [modeloSearch, setModeloSearch] = useState('');

  const { data: motorcycleDataset, loading: loadingDataset } = useMotorcycleData();

  const currentYear = new Date().getFullYear();

  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'marca': if (!value) error = 'La marca es obligatoria'; break;
      case 'modelo': if (!value) error = 'El modelo es obligatorio'; break;
      case 'anio':
        if (!value) error = 'El año es obligatorio';
        else if (value < 1900) error = 'Año no válido';
        else if (value > currentYear + 1) error = 'El año no puede ser futuro';
        break;
      case 'placa':
        if (!value) {
          error = 'La placa es obligatoria';
        } else if (!/^[A-Z]{3}\d{2}[A-Z]$/.test(value.toUpperCase())) {
          error = 'Formato inválido (Ej: XYZ25H)';
        } else if (motos && motos.some((m: any) => m.Placa.trim().toUpperCase() === value.trim().toUpperCase() && m.ID_Motocicleta !== moto?.ID_Motocicleta)) {
          error = 'Ya existe una motocicleta registrada con esta placa';
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
      case 'motor':
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
      case 'id_cliente': if (!value) error = 'Debe seleccionar un propietario'; break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const resetForm = () => {
    if (moto) {
      setFormData({
        id_cliente: moto.ID_Cliente || '',
        marca: moto.Marca || '',
        modelo: moto.Modelo || '',
        anio: moto.Anio || currentYear,
        placa: moto.Placa || '',
        color: moto.Color || '',
        motor: moto.Motor || '',
        kilometraje: moto.Kilometraje || 1000,
        estado: moto.Estado ?? true
      });
    } else {
      setFormData({
        id_cliente: '',
        marca: '',
        modelo: '',
        anio: currentYear,
        placa: '',
        color: '',
        motor: '',
        kilometraje: 1000,
        estado: true
      });
    }
    setErrors({});
    setTouched({});
    setClientSearch('');
    setMarcaSearch('');
    setModeloSearch('');
  };

  useEffect(() => {
    resetForm();
  }, [moto, currentYear]);

  const blockInvalidChar = (e: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-', ',', '.'].includes(e.key)) e.preventDefault();
    if (e.key === '0' && (e.currentTarget as HTMLInputElement).value === '') e.preventDefault();
  };

  const handleInputChange = (name: string, value: any) => {
    let finalValue = value;
    if (name === 'color') {
      finalValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
    }
    if (name === 'placa') finalValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (name === 'anio' || name === 'motor' || name === 'kilometraje') {
      if (value === '') finalValue = '';
      else {
        const strValue = value.toString().replace(/\D/g, '');
        let num = parseInt(strValue);
        if (name === 'anio') {
          finalValue = strValue.slice(0, 4);
          num = parseInt(finalValue);
          if (num > currentYear + 1) num = currentYear + 1;
        } else if (name === 'motor') {
          num = parseInt(strValue.slice(0, 4));
          if (num > 2500) num = 2500;
        } else if (name === 'kilometraje') {
          num = parseInt(strValue.slice(0, 7));
        }
        finalValue = isNaN(num) ? '' : num;
      }
    }
    if (name === 'marca') {
      setFormData(prev => ({ ...prev, [name]: finalValue, modelo: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, finalValue);
  };

  const handleFocus = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, (formData as any)[name]);
  };

  const hasChanges = () => {
    if (!moto) return true;
    return (
      formData.id_cliente !== (moto.ID_Cliente || '') ||
      formData.marca !== (moto.Marca || '') ||
      formData.modelo !== (moto.Modelo || '') ||
      formData.anio !== (moto.Anio || currentYear) ||
      formData.placa !== (moto.Placa || '') ||
      formData.color !== (moto.Color || '') ||
      formData.motor !== (moto.Motor || '') ||
      formData.kilometraje !== (moto.Kilometraje || 1000) ||
      formData.estado !== (moto.Estado ?? true)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    Object.keys(formData).forEach(key => {
      const error = validateField(key, (formData as any)[key]);
      if (error) { newErrors[key] = error; hasErrors = true; }
    });
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    if (hasErrors) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }
    onSave(formData);
  };

  const filteredClients = clients.filter((c: any) =>
    `${c.Nombre} ${c.Apellido}`.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.Documento.toString().includes(clientSearch)
  );

  const selectedClient = clients.find((c: any) => c.ID_Cliente === formData.id_cliente);

  const brands = Object.keys(motorcycleDataset).sort();
  const filteredBrands = brands.filter(b => b.toLowerCase().includes(marcaSearch.toLowerCase()));

  const models = formData.marca ? (motorcycleDataset[formData.marca] || []) : [];
  const filteredModels = models.filter(m => m.toLowerCase().includes(modeloSearch.toLowerCase()));

  // Display limits for performance
  const VISIBLE_ITEMS = 50;

  return (
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
                  {moto ? 'Editar Información' : 'Nueva Motocicleta'}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {moto ? `Editando detalles de la placa ${moto.Placa}` : 'Registra una nueva motocicleta en el sistema'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-140px)]" noValidate>
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                      <div className="py-4 px-2 text-center">
                        <p className="text-sm text-muted-foreground">No se encontró la marca.</p>
                      </div>
                    ) : (
                      filteredBrands.slice(0, VISIBLE_ITEMS).map((brand) => (
                        <div
                          key={brand}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent",
                            formData.marca === brand && "bg-blue-50 text-blue-700 font-medium"
                          )}
                          onClick={() => {
                            handleInputChange('marca', brand);
                            setIsMarcaPopoverOpen(false);
                            setMarcaSearch('');
                          }}
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
                      <div className="py-4 px-2 text-center">
                        <p className="text-sm text-muted-foreground">No se encontró el modelo.</p>
                      </div>
                    ) : (
                      filteredModels.slice(0, VISIBLE_ITEMS).map((model) => (
                        <div
                          key={model}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent",
                            formData.modelo === model && "bg-blue-50 text-blue-700 font-medium"
                          )}
                          onClick={() => {
                            handleInputChange('modelo', model);
                            setIsModeloPopoverOpen(false);
                            setModeloSearch('');
                          }}
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
                <Label htmlFor="anio">Año *</Label>
                {touched.anio && errors.anio && <span className="text-red-500 text-[10px] font-medium">{errors.anio}</span>}
              </div>
              <Input id="anio" type="number" value={formData.anio} onChange={(e) => handleInputChange('anio', e.target.value)} onFocus={() => handleFocus('anio')} onKeyDown={blockInvalidChar} className={cn("no-arrows", touched.anio && errors.anio ? 'border-red-500' : '')} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="placa">Placa *</Label>
                {touched.placa && errors.placa && <span className="text-red-500 text-[10px] font-medium">{errors.placa}</span>}
              </div>
              <Input id="placa" value={formData.placa} onChange={(e) => handleInputChange('placa', e.target.value)} onFocus={() => handleFocus('placa')} placeholder="ABC123" className={touched.placa && errors.placa ? 'border-red-500' : ''} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="color">Color *</Label>
                {touched.color && errors.color && <span className="text-red-500 text-[10px] font-medium">{errors.color}</span>}
              </div>
              <Input id="color" value={formData.color} onChange={(e) => handleInputChange('color', e.target.value)} onFocus={() => handleFocus('color')} placeholder="Ej: Rojo" className={touched.color && errors.color ? 'border-red-500' : ''} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="motor">Cilindraje (cc) *</Label>
                {touched.motor && errors.motor && <span className="text-red-500 text-[10px] font-medium">{errors.motor}</span>}
              </div>
              <Input id="motor" type="number" value={formData.motor} onChange={(e) => handleInputChange('motor', e.target.value)} onFocus={() => handleFocus('motor')} onKeyDown={blockInvalidChar} placeholder="Ej: 600" className={cn("no-arrows", touched.motor && errors.motor ? 'border-red-500' : '')} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="kilometraje">Kilometraje *</Label>
                {touched.kilometraje && errors.kilometraje && <span className="text-red-500 text-[10px] font-medium">{errors.kilometraje}</span>}
              </div>
              <Input id="kilometraje" type="number" value={formData.kilometraje} onChange={(e) => handleInputChange('kilometraje', e.target.value)} onFocus={() => handleFocus('kilometraje')} onKeyDown={blockInvalidChar} className={cn("no-arrows", touched.kilometraje && errors.kilometraje ? 'border-red-500' : '')} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Propietario *</Label>
                {touched.id_cliente && errors.id_cliente && <span className="text-red-500 text-[10px] font-medium">{errors.id_cliente}</span>}
              </div>
              <Popover open={isClientPopoverOpen} onOpenChange={setIsClientPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn("w-full justify-between font-normal h-11 px-4 text-left overflow-hidden", !formData.id_cliente && "text-muted-foreground", touched.id_cliente && errors.id_cliente && "border-red-500")}
                    onClick={() => handleFocus('id_cliente')}
                  >
                    <span className="truncate">{selectedClient ? `${selectedClient.Nombre} ${selectedClient.Apellido} - ${selectedClient.Documento}` : "Seleccionar cliente..."}</span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <div className="p-2 border-b">
                    <div className="flex items-center px-3 py-2 bg-muted/50 rounded-md">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Buscar por nombre o cédula..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
                    </div>
                  </div>
                  <div
                    className="max-h-[200px] overflow-y-auto p-1"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {filteredClients.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No se encontraron clientes.</p> : filteredClients.map((client: any) => (
                      <div key={client.ID_Cliente} className={cn("relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent", formData.id_cliente === client.ID_Cliente && "bg-blue-50 text-blue-700 font-medium")} onClick={() => { handleInputChange('id_cliente', client.ID_Cliente); setIsClientPopoverOpen(false); }}>
                        <Check className={cn("mr-2 h-4 w-4", formData.id_cliente === client.ID_Cliente ? "opacity-100" : "opacity-0")} />
                        <div className="flex flex-col"><span>{client.Nombre} {client.Apellido}</span><span className="text-[10px] text-muted-foreground">CC: {client.Documento}</span></div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="h-11 px-6 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl flex-1 sm:flex-none"
            >
              {moto ? 'Cerrar' : 'Cancelar'}
            </Button>
          </div>

          <Button type="submit" disabled={isSaving || (!!moto && !hasChanges())} className="h-12 px-12 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95">
            {isSaving ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : (moto ? 'Actualizar Motocicleta' : 'Registrar Motocicleta')}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
