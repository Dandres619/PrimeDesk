import React, { useState, useEffect } from 'react';
import { Shield, Loader2 } from 'lucide-react';
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
}

export function RoleDialog({ role, permissions, onSave, isProcessing }: RoleDialogProps) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    status: role?.status || 'Activo',
    permissions: role?.permissions ? role.permissions.map((p: any) => p.ID_Permiso) : []
  });
  const [touched, setTouched] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        status: role.status,
        permissions: role.permissions.map((p: any) => p.ID_Permiso)
      });
      setTouched(false);
      setNameError('');
    } else {
      setFormData({ name: '', description: '', status: 'Activo', permissions: [] });
      setTouched(false);
      setNameError('');
    }
  }, [role]);

  useEffect(() => {
    if (touched) {
      if (!formData.name.trim()) {
        setNameError('El nombre del rol no puede estar vacío');
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
        setNameError('Solo se permiten letras');
      } else {
        setNameError('');
      }
    }
  }, [formData.name, touched]);

  const togglePermission = (id: number) => setFormData(prev => ({
    ...prev,
    permissions: prev.permissions.includes(id)
      ? prev.permissions.filter((pId: number) => pId !== id)
      : [...prev.permissions, id]
  }));

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setFormData(prev => ({ ...prev, name: val }));
    if (!touched) setTouched(true);
  };

  return (
    <DialogContent
      onOpenAutoFocus={(e) => e.preventDefault()}
      className="max-w-2xl max-h-[90vh] overflow-y-auto animate-modal p-0"
    >
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogHeader><DialogTitle className="text-lg font-semibold">{role ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle></DialogHeader>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (!nameError) onSave(formData, role); }} className="px-6 py-5 space-y-5">
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
          <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</Label>
          <Input id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Descripción del rol" className="h-10" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Permisos</Label>
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
                      {p.description && <span className="text-[11px] text-muted-foreground block truncate">{p.description}</span>}
                    </div>
                  </label>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-6">No hay permisos disponibles.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="submit"
            disabled={isProcessing || (touched && !!nameError)}
            className="bg-blue-600 hover:bg-blue-700 px-6"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {role ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>{role ? 'Actualizar' : 'Crear'} Rol</>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
