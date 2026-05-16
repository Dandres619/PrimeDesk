import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Truck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

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
        notes: supplier.notes || ''
      });
    } else {
      setForm({
        name: '', contact: '', phone: '', email: '', address: '', city: '',
        country: 'Colombia', taxId: '', website: '', specialty: '', notes: ''
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.contact?.trim() || !form.phone?.trim() || !form.email?.trim() || !form.address?.trim() || !form.city?.trim() || !form.country?.trim()) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Ingrese un correo electrónico válido');
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

        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar space-y-6 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre de la Empresa *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej. Repuestos ABC" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">NIT (Opcional)</Label>
              <Input value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} placeholder="Ej. 900.123.456-1" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Persona de Contacto *</Label>
              <Input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Ej. Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Especialidad (Opcional)</Label>
              <Input value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} placeholder="Ej. Motor, Frenos" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Teléfono *</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Ej. 3101234567" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email *</Label>
              <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ejemplo@correo.com" />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Dirección *</Label>
              <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Calle 123 #45-67" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ciudad *</Label>
              <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Ej. Medellín" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">País *</Label>
              <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Ej. Colombia" />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sitio Web (Opcional)</Label>
              <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://www.proveedor.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notas</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Observaciones adicionales..." />
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
            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</> : (supplier ? 'Actualizar Proveedor' : 'Registrar Proveedor')}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
