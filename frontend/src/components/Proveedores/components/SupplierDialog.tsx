import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Truck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SupplierDialogProps {
  supplier: any;
  onSave: (data: any, supplier: any) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
}

export function SupplierDialog({ supplier, onSave, onOpenChange }: SupplierDialogProps) {
  const [form, setForm] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Colombia',
    taxId: '',
    website: '',
    specialty: '',
    notes: '',
    personType: 'Natural'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: any, pType?: string) => {
    let error = '';
    const currentPersonType = pType || form.personType;
    
    switch (name) {
      case 'name':
        if (!value?.trim()) error = 'Obligatorio';
        else if (value.length > 60) error = 'Máximo 60 caracteres';
        break;
      case 'taxId':
        if (!value?.trim()) {
          error = 'Obligatorio';
        } else if (currentPersonType === 'Natural') {
          if (!/^\d+$/.test(value)) error = 'Solo números sin puntos ni símbolos';
          else if (value.length < 8 || value.length > 10) error = 'Debe tener entre 8 y 10 dígitos';
        } else {
          // Jurídica (NIT con dígito de verificación DIAN)
          if (!value.includes('-')) {
            error = 'Falta guion y dígito de verificación (Ej: 900123456-1)';
          } else {
            let [nit, digitoVerificador] = value.split('-');
            nit = nit.replace(/[^\d]/g, '');
            if (!/^\d+$/.test(nit) || nit.length < 8 || nit.length > 10) {
              error = 'El cuerpo del NIT debe tener entre 8 y 10 dígitos';
            } else if (!digitoVerificador || digitoVerificador.length !== 1 || !/^\d$/.test(digitoVerificador)) {
              error = 'El dígito de verificación debe ser un número de 1 dígito';
            } else {
              // Algoritmo oficial de pesos DIAN
              const pesos = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
              let suma = 0;
              const nitArray = nit.padStart(15, '0').split('');
              for (let i = 0; i < 15; i++) {
                suma += parseInt(nitArray[i], 10) * pesos[i];
              }
              const modulo = suma % 11;
              const dvCalculado = modulo > 1 ? 11 - modulo : modulo;
              
              if (dvCalculado !== parseInt(digitoVerificador, 10)) {
                error = `NIT inválido (el dígito debería ser ${dvCalculado})`;
              }
            }
          }
        }
        break;
      case 'contact':
        if (!value?.trim()) error = 'Obligatorio';
        else if (value.length > 50) error = 'Máximo 50 caracteres';
        break;
      case 'specialty':
        if (value && value.length > 50) error = 'Máximo 50 caracteres';
        break;
      case 'phone':
        if (!value?.trim()) {
          error = 'Obligatorio';
        } else {
          if (!/^\d+$/.test(value)) error = 'Solo números';
          else if (value.length < 7 || value.length > 10) error = 'Debe tener entre 7 y 10 dígitos';
        }
        break;
      case 'email':
        if (!value?.trim()) {
          error = 'Obligatorio';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) error = 'Email inválido';
          else if (value.length > 50) error = 'Máximo 50 caracteres';
        }
        break;
      case 'address':
        if (!value?.trim()) error = 'Obligatorio';
        else if (value.length > 80) error = 'Máximo 80 caracteres';
        break;
      case 'city':
        if (!value?.trim()) error = 'Obligatorio';
        else if (value.length > 30) error = 'Máximo 30 caracteres';
        break;
      case 'country':
        if (!value?.trim()) error = 'Obligatorio';
        else if (value.length > 30) error = 'Máximo 30 caracteres';
        break;
      case 'website':
        if (currentPersonType === 'Jurídica' && !value?.trim()) {
          error = 'Obligatorio para persona jurídica';
        } else if (value && value.trim()) {
          const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
          if (!urlRegex.test(value)) error = 'URL inválida';
          else if (value.length > 100) error = 'Máximo 100 caracteres';
        }
        break;
      case 'notes':
        if (value && value.length > 200) error = 'Máximo 200 caracteres';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handlePersonTypeChange = (type: 'Natural' | 'Jurídica') => {
    setForm(prev => {
      const next = { ...prev, personType: type };
      validateField('taxId', prev.taxId, type);
      validateField('website', prev.website, type);
      return next;
    });
  };

  const handleInputChange = (name: string, value: any) => {
    let finalValue = value;
    
    // Filtros de entrada en tiempo real
    if (name === 'phone') {
      finalValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'taxId') {
      if (form.personType === 'Natural') {
        finalValue = value.replace(/\D/g, '').slice(0, 10);
      } else {
        finalValue = value.replace(/[^0-9.-]/g, '').slice(0, 15);
      }
    } else {
      const limits: Record<string, number> = {
        name: 60,
        contact: 50,
        specialty: 50,
        address: 80,
        city: 30,
        country: 30,
        email: 50,
        website: 100,
        notes: 200
      };
      if (limits[name] && finalValue.length > limits[name]) {
        finalValue = finalValue.slice(0, limits[name]);
      }
    }

    setForm(prev => ({ ...prev, [name]: finalValue }));
    if (touched[name]) {
      validateField(name, finalValue);
    }
  };

  const handleFocus = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || '',
        contact: supplier.contact || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        city: supplier.city || '',
        country: supplier.country || 'Colombia',
        taxId: supplier.taxId || '',
        website: supplier.website || '',
        specialty: supplier.specialty || '',
        notes: supplier.notes || '',
        personType: supplier.personType || 'Natural'
      });
    } else {
      setForm({
        name: '', contact: '', phone: '', email: '', address: '', city: '',
        country: 'Colombia', taxId: '', website: '', specialty: '', notes: '',
        personType: 'Natural'
      });
    }
    setErrors({});
    setTouched({});
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    Object.keys(form).forEach(key => {
      const error = validateField(key, (form as any)[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (hasErrors) {
      toast.error('Hay errores en el formulario. Por favor corríjalos.');
      return;
    }

    setIsSaving(true);
    const success = await onSave(form, supplier);
    setIsSaving(false);
    if (success) onOpenChange(false);
  };

  return (
    <DialogContent 
      className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal max-w-2xl w-[95vw] bg-white dark:bg-slate-950"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Complete la información del proveedor</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar text-left">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Persona *</Label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
              <button
                type="button"
                className={cn(
                  "py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2",
                  form.personType === 'Natural'
                    ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800/50"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
                onClick={() => handlePersonTypeChange('Natural')}
              >
                👤 Persona Natural
              </button>
              <button
                type="button"
                className={cn(
                  "py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2",
                  form.personType === 'Jurídica'
                    ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800/50"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
                onClick={() => handlePersonTypeChange('Jurídica')}
              >
                🏢 Persona Jurídica
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {form.personType === 'Natural' ? 'Nombre Completo *' : 'Nombre de la Empresa *'}
                </Label>
                {touched.name && errors.name && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.name}</span>}
              </div>
              <Input
                value={form.name}
                onChange={e => handleInputChange('name', e.target.value)}
                onFocus={() => handleFocus('name')}
                placeholder={form.personType === 'Natural' ? "Ej. Juan Pérez" : "Ej. Repuestos ABC"}
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all",
                  touched.name && errors.name ? 'border-red-500 ring-1 ring-red-500/10' : ''
                )}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {form.personType === 'Natural' ? 'Documento de Identidad *' : 'NIT *'}
                </Label>
                {touched.taxId && errors.taxId && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.taxId}</span>}
              </div>
              <Input
                value={form.taxId}
                onChange={e => handleInputChange('taxId', e.target.value)}
                onFocus={() => handleFocus('taxId')}
                placeholder={form.personType === 'Natural' ? "Ej. 1012345678" : "Ej. 900.123.456-1"}
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all",
                  touched.taxId && errors.taxId ? 'border-red-500 ring-1 ring-red-500/10' : ''
                )}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Persona de Contacto *</Label>
                {touched.contact && errors.contact && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.contact}</span>}
              </div>
              <Input
                value={form.contact}
                onChange={e => handleInputChange('contact', e.target.value)}
                onFocus={() => handleFocus('contact')}
                placeholder="Ej. Juan Pérez"
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all",
                  touched.contact && errors.contact ? 'border-red-500 ring-1 ring-red-500/10' : ''
                )}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Especialidad (Opcional)</Label>
                {touched.specialty && errors.specialty && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.specialty}</span>}
              </div>
              <Input
                value={form.specialty}
                onChange={e => handleInputChange('specialty', e.target.value)}
                onFocus={() => handleFocus('specialty')}
                placeholder="Ej. Motor, Frenos"
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all",
                  touched.specialty && errors.specialty ? 'border-red-500 ring-1 ring-red-500/10' : ''
                )}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Teléfono *</Label>
                {touched.phone && errors.phone && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.phone}</span>}
              </div>
              <Input
                value={form.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                onFocus={() => handleFocus('phone')}
                placeholder="Ej. 3101234567"
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all",
                  touched.phone && errors.phone ? 'border-red-500 ring-1 ring-red-500/10' : ''
                )}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email *</Label>
                {touched.email && errors.email && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.email}</span>}
              </div>
              <Input
                value={form.email}
                onChange={e => handleInputChange('email', e.target.value)}
                onFocus={() => handleFocus('email')}
                placeholder="ejemplo@correo.com"
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all",
                  touched.email && errors.email ? 'border-red-500 ring-1 ring-red-500/10' : ''
                )}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Dirección *</Label>
                {touched.address && errors.address && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.address}</span>}
              </div>
              <Input
                value={form.address}
                onChange={e => handleInputChange('address', e.target.value)}
                onFocus={() => handleFocus('address')}
                placeholder="Calle 123 #45-67"
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all",
                  touched.address && errors.address ? 'border-red-500 ring-1 ring-red-500/10' : ''
                )}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ciudad *</Label>
                {touched.city && errors.city && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.city}</span>}
              </div>
              <Input
                value={form.city}
                onChange={e => handleInputChange('city', e.target.value)}
                onFocus={() => handleFocus('city')}
                placeholder="Ej. Medellín"
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all",
                  touched.city && errors.city ? 'border-red-500 ring-1 ring-red-500/10' : ''
                )}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">País *</Label>
                {touched.country && errors.country && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.country}</span>}
              </div>
              <Input
                value={form.country}
                onChange={e => handleInputChange('country', e.target.value)}
                onFocus={() => handleFocus('country')}
                placeholder="Ej. Colombia"
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all",
                  touched.country && errors.country ? 'border-red-500 ring-1 ring-red-500/10' : ''
                )}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Sitio Web {form.personType === 'Jurídica' ? '*' : '(Opcional)'}
                </Label>
                {touched.website && errors.website && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.website}</span>}
              </div>
              <Input
                value={form.website}
                onChange={e => handleInputChange('website', e.target.value)}
                onFocus={() => handleFocus('website')}
                placeholder="https://www.proveedor.com"
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all",
                  touched.website && errors.website ? 'border-red-500 ring-1 ring-red-500/10' : ''
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notas</Label>
              {touched.notes && errors.notes && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.notes}</span>}
            </div>
            <Textarea
              value={form.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              onFocus={() => handleFocus('notes')}
              rows={3}
              placeholder="Observaciones adicionales..."
              className={cn(
                "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all resize-none p-3 text-sm",
                touched.notes && errors.notes ? 'border-red-500 ring-1 ring-red-500/10' : ''
              )}
            />
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex justify-between items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-11 px-6 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button 
            type="submit" 
            disabled={isSaving} 
            className="h-12 px-12 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>{supplier ? 'Actualizar' : 'Guardar'} Proveedor</>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
