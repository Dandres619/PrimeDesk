import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Loader2, ChevronsUpDown, Check, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function MotoDialog({ moto, clients, onSave, isSaving }: any) {
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
        if (!value) error = 'La placa es obligatoria';
        else if (!/^[a-zA-Z0-9]+$/.test(value)) error = 'Solo letras y números';
        else if (value.length > 6) error = 'Máximo 6 caracteres';
        break;
      case 'color': if (!value) error = 'El color es obligatorio'; break;
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
        break;
      case 'id_cliente': if (!value) error = 'Debe seleccionar un propietario'; break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  useEffect(() => {
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
      setErrors({});
      setTouched({});
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
      setErrors({});
      setTouched({});
    }
  }, [moto, currentYear]);

  const blockInvalidChar = (e: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
  };

  const handleInputChange = (name: string, value: any) => {
    let finalValue = value;
    if (name === 'placa') finalValue = value.toUpperCase().replace(/[^A-DF-Z0-9]/g, '').slice(0, 6);
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
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (touched[name]) validateField(name, finalValue);
  };

  const handleFocus = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, (formData as any)[name]);
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

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{moto ? 'Editar Motocicleta' : 'Nueva Motocicleta'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="marca">Marca *</Label>
              {touched.marca && errors.marca && <span className="text-red-500 text-[10px] font-medium">{errors.marca}</span>}
            </div>
            <Input id="marca" value={formData.marca} onChange={(e) => handleInputChange('marca', e.target.value)} onFocus={() => handleFocus('marca')} placeholder="Ej: Honda" className={touched.marca && errors.marca ? 'border-red-500' : ''} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="modelo">Modelo *</Label>
              {touched.modelo && errors.modelo && <span className="text-red-500 text-[10px] font-medium">{errors.modelo}</span>}
            </div>
            <Input id="modelo" value={formData.modelo} onChange={(e) => handleInputChange('modelo', e.target.value)} onFocus={() => handleFocus('modelo')} placeholder="Ej: Hornet CB600" className={touched.modelo && errors.modelo ? 'border-red-500' : ''} />
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
                  className={cn("w-full justify-between font-normal", !formData.id_cliente && "text-muted-foreground", touched.id_cliente && errors.id_cliente && "border-red-500")}
                  onClick={() => handleFocus('id_cliente')}
                >
                  {selectedClient ? `${selectedClient.Nombre} ${selectedClient.Apellido} - ${selectedClient.Documento}` : "Seleccionar cliente..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <div className="p-2 border-b">
                  <div className="flex items-center px-3 py-2 bg-muted/50 rounded-md">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Buscar por nombre o cédula..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1">
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
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 px-8">
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{moto ? 'Actualizando...' : 'Registrando...'}</> : <>{moto ? 'Actualizar' : 'Registrar'} Motocicleta</>}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
