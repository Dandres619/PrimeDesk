import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Loader2, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ServicioDialogProps {
  service: any;
  onSave: (formData: any) => void;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServicioDialog({ service, onSave, isSaving, onOpenChange }: ServicioDialogProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion: 30,
    precio: 0,
    estado: true
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'nombre':
        if (!value) error = 'El nombre es obligatorio';
        break;
      case 'duracion':
        if (value === '') error = 'La duración es obligatoria';
        else if (isNaN(value)) error = 'Solo números';
        else if (value < 5) error = 'Mínimo 5 min';
        else if (value > 1440) error = 'Máximo 1440 min (24h)';
        break;
      case 'precio':
        if (value === '') error = 'El precio es obligatorio';
        else if (isNaN(value)) error = 'Solo números';
        else if (value < 5000) error = 'Mínimo $5.000';
        else if (value > 500000) error = 'Máximo $500.000';
        break;
      case 'descripcion':
        if (value && value.length > 80) error = 'Máximo 80 caracteres';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  useEffect(() => {
    if (service) {
      setFormData({
        nombre: service.Nombre || '',
        descripcion: service.Descripcion || '',
        duracion: service.Duracion || 30,
        precio: Math.round(parseFloat(service.Precio)) || 0,
        estado: service.Estado ?? true
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        duracion: 30,
        precio: 0,
        estado: true
      });
      setErrors({});
      setTouched({});
    }
  }, [service]);

  const blockInvalidChar = (e: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault();
  };

  const formatPrice = (value: any) => {
    if (value === '' || value === undefined || value === null) return '';
    // Convertir a número y redondear para eliminar decimales de la DB
    const numValue = Math.round(parseFloat(value.toString().replace(/[^\d.]/g, '')));
    if (isNaN(numValue)) return '';
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleInputChange = (name: string, value: any) => {
    let finalValue = value;
    if (name === 'duracion' || name === 'precio') {
      if (value === '') {
        finalValue = '';
      } else {
        const strValue = value.toString().replace(/\D/g, '');
        const clipped = name === 'duracion' ? strValue.slice(0, 4) : strValue.slice(0, 6);
        let num = parseInt(clipped);

        if (name === 'duracion' && num > 1440) num = 1440;
        finalValue = isNaN(num) ? '' : num;
      }
    }

    if (finalValue === undefined) return;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (touched[name]) {
      validateField(name, finalValue);
    }
  };

  const handleFocus = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, (formData as any)[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (hasErrors) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    onSave(formData);
  };

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
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {service ? 'Editar Servicio' : 'Nuevo Servicio'}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {service ? `Actualizando detalles de ${service.Nombre}` : 'Registra un nuevo servicio en el catálogo'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-140px)]" noValidate>
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="nombre" className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre del Servicio *</Label>
                {touched.nombre && errors.nombre && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.nombre}</span>}
              </div>
              <Input
                id="nombre"
                name="service-name"
                autoComplete="on"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                onInput={(e) => handleInputChange('nombre', e.currentTarget.value)}
                onFocus={() => handleFocus('nombre')}
                placeholder="Ej: Mantenimiento Preventivo"
                className={cn(
                  "h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 transition-all focus:ring-2",
                  touched.nombre && errors.nombre ? 'border-red-500 ring-red-500/10' : 'focus:ring-blue-500/10'
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="duracion" className="text-sm font-bold text-slate-700 dark:text-slate-300">Duración (minutos) *</Label>
                {touched.duracion && errors.duracion && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.duracion}</span>}
              </div>
              <div className="relative">
                <Input
                  id="duracion"
                  name="service-duration"
                  type="text"
                  autoComplete="on"
                  value={formData.duracion}
                  onChange={(e) => handleInputChange('duracion', e.target.value)}
                  onInput={(e) => handleInputChange('duracion', e.currentTarget.value)}
                  onFocus={() => handleFocus('duracion')}
                  onKeyDown={blockInvalidChar}
                  className={cn(
                    "h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 pr-12 transition-all focus:ring-2",
                    touched.duracion && errors.duracion ? 'border-red-500 ring-red-500/10' : 'focus:ring-blue-500/10'
                  )}
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-slate-400 pointer-events-none">MIN</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="precio" className="text-sm font-bold text-slate-700 dark:text-slate-300">Precio *</Label>
                {touched.precio && errors.precio && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.precio}</span>}
              </div>
              <div className="relative">
                <Input
                  id="precio"
                  name="precio"
                  type="text"
                  autoComplete="on"
                  value={formatPrice(formData.precio)}
                  onChange={(e) => handleInputChange('precio', e.target.value)}
                  onFocus={() => handleFocus('precio')}
                  onKeyDown={blockInvalidChar}
                  className={cn(
                    "h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 pl-8",
                    touched.precio && errors.precio ? 'border-red-500' : ''
                  )}
                />
                <span className="absolute left-4 top-3 text-xs font-bold text-slate-400 pointer-events-none">$</span>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label htmlFor="descripcion" className="text-sm font-bold text-slate-700 dark:text-slate-300">Descripción <span className='text-xs text-slate-400 font-medium'>Opcional</span></Label>
                </div>
                {touched.descripcion && errors.descripcion && <span className="text-red-500 text-[10px] font-bold uppercase">{errors.descripcion}</span>}
              </div>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => {
                  if (e.target.value.length <= 120) { // Permitir un poco más para que vean el error pero validar a 80
                    handleInputChange('descripcion', e.target.value);
                  }
                }}
                onFocus={() => handleFocus('descripcion')}
                placeholder="Describa detalladamente el servicio..."
                rows={3}
                className={cn(
                  "rounded-xl bg-slate-50/50 dark:bg-slate-900/50 resize-none transition-all focus:ring-2",
                  touched.descripcion && errors.descripcion ? 'border-red-500 ring-red-500/10' : 'focus:ring-blue-500/10'
                )}
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setFormData({
                nombre: '',
                descripcion: '',
                duracion: 30,
                precio: 0,
                estado: true
              });
              setErrors({});
              setTouched({});
              onOpenChange(false);
            }}
            className="h-11 px-6 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={isSaving} className="h-12 px-12 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95">
            {isSaving ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>{service ? 'Actualizar' : 'Crear'} Servicio</>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

