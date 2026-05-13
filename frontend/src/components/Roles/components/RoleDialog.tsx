import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';

interface RoleDialogProps {
  role: any;
  permissions: any[];
  onSave: (formData: any, editingRole: any) => Promise<boolean>;
  isProcessing: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleDialog({ role, permissions, onSave, isProcessing, isOpen, onOpenChange }: RoleDialogProps) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    status: role?.status || 'Activo',
    permissions: role?.permissions ? role.permissions.map((p: any) => p.ID_Permiso) : []
  });
  const [touched, setTouched] = useState(false);
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (role) {
        setFormData({
          name: role.name,
          description: role.description || '',
          status: role.status,
          permissions: role.permissions.map((p: any) => p.ID_Permiso)
        });
        setTouched(false);
        setNameError('');
        setDescriptionError('');
      } else {
        setFormData({ name: '', description: '', status: 'Activo', permissions: [] });
        setTouched(false);
        setNameError('');
        setDescriptionError('');
      }
    }
  }, [role, isOpen]);

  useEffect(() => {
    if (touched) {
      // Validación Nombre
      if (!formData.name.trim()) {
        setNameError('El nombre del rol no puede estar vacío');
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
        setNameError('Solo se permiten letras');
      } else if (formData.name.length > 50) {
        setNameError('Máximo 50 caracteres');
      } else {
        setNameError('');
      }

      // Validación Descripción
      if (formData.description.length > 80) {
        setDescriptionError('Máximo 80 caracteres');
      } else {
        setDescriptionError('');
      }
    }
  }, [formData.name, formData.description, touched]);

  const togglePermission = (id: number) => setFormData(prev => ({
    ...prev,
    permissions: prev.permissions.includes(id)
      ? prev.permissions.filter((pId: number) => pId !== id)
      : [...prev.permissions, id]
  }));

  const hasChanges = () => {
    if (!role) return true;

    if (formData.name !== role.name) return true;
    if (formData.description !== (role.description || '')) return true;
    if (formData.status !== role.status) return true;

    const originalPermissions = role.permissions ? role.permissions.map((p: any) => p.ID_Permiso) : [];
    if (formData.permissions.length !== originalPermissions.length) return true;

    const hasDifferentPerms = formData.permissions.some((p: number) => !originalPermissions.includes(p));
    if (hasDifferentPerms) return true;

    return false;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setFormData(prev => ({ ...prev, name: val }));
    if (!touched) setTouched(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, description: val }));
    if (!touched) setTouched(true);
  };

  return (
    <DialogContent
      onOpenAutoFocus={(e) => e.preventDefault()}
      className="max-w-2xl animate-modal p-0 overflow-hidden"
    >
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogHeader><DialogTitle className="text-lg font-semibold">{role ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle></DialogHeader>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);

          if (!formData.name.trim()) {
            toast.error('El nombre del rol no puede estar vacío');
            return;
          }
          if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
            toast.error('Solo se permiten letras en el nombre');
            return;
          }
          if (formData.name.length > 50) {
            toast.error('El nombre supera los 50 caracteres');
            return;
          }
          if (formData.description.length > 80) {
            toast.error('La descripción supera los 80 caracteres');
            return;
          }
          if (formData.permissions.length === 0) {
            toast.error('Debe seleccionar por lo menos un permiso');
            return;
          }

          onSave(formData, role);
        }}
        className="px-6 py-5 space-y-5"
        noValidate
      >
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Rol *</Label>
            {nameError && <span className="text-red-500 text-xs font-medium">{nameError}</span>}
          </div>
          <Input
            id="name"
            value={formData.name}
            onChange={handleNameChange}
            onFocus={() => setTouched(true)}
            onBlur={() => setTouched(true)}
            placeholder="Ej: Administrador"
            required
            className={`h-10 ${touched && nameError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">Descripción <span className="text-xs text-muted-foreground">(Opcional)</span></Label>
            {descriptionError && <span className="text-red-500 text-xs font-medium">{descriptionError}</span>}
          </div>
          <Input
            id="description"
            value={formData.description}
            onChange={handleDescriptionChange}
            onFocus={() => setTouched(true)}
            placeholder="Descripción del rol"
            className={`h-10 ${touched && descriptionError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Permisos</Label>
              <span className="text-[10px] text-blue-900 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded italic">
                Debe seleccionar por lo menos uno.
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formData.permissions.length} seleccionado{formData.permissions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800">
            {permissions.length > 0 ? (
              permissions.map((p: any) => {
                const isSelected = formData.permissions.includes(p.id);
                return (
                  <label
                    key={p.id}
                    htmlFor={`perm-${p.id}`}
                    className={`flex items-center gap-2.5 p-2.5 rounded-md border cursor-pointer select-none transition-all duration-150
                      ${isSelected
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800'
                        : 'bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                  >
                    <Checkbox
                      id={`perm-${p.id}`}
                      checked={isSelected}
                      onCheckedChange={() => togglePermission(p.id)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-medium block truncate">{p.name}</span>
                    </div>
                  </label>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-6">No hay permisos disponibles.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 mt-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-11 px-6 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl flex-1 sm:flex-none">
              {role ? 'Cerrar' : 'Cancelar'}
            </Button>
          </div>

          <Button type="submit" disabled={isProcessing || (!!role && !hasChanges())} className="h-12 px-12 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95">
            {isProcessing ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : (role ? 'Actualizar Rol' : 'Crear Rol')}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
