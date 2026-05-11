import React from 'react';
import { Bike, Loader2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface MotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMoto: any;
  formData: any;
  setFormData: (data: any) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function MotoDialog({
  open,
  onOpenChange,
  editingMoto,
  formData,
  setFormData,
  isSubmitting,
  onSubmit
}: MotoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md animate-modal p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl">
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0 transition-transform hover:scale-105">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingMoto ? 'Editar Motocicleta' : 'Nueva Motocicleta'}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-500 mt-1">
                {editingMoto ? 'Actualiza los datos de tu vehículo' : 'Registra un nuevo vehículo en tu perfil'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="px-8 py-7 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Ej: Yamaha"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="Ej: MT-03"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ano">Año *</Label>
              <Input
                id="ano"
                type="number"
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                placeholder="Ej: ABC12D"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cilindraje">Cilindraje</Label>
              <Input
                id="cilindraje"
                value={formData.cilindraje}
                onChange={(e) => setFormData({ ...formData, cilindraje: e.target.value })}
                placeholder="Ej: 321cc"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kilometraje">Kilometraje</Label>
              <Input
                id="kilometraje"
                type="number"
                value={formData.kilometraje}
                onChange={(e) => setFormData({ ...formData, kilometraje: e.target.value })}
                placeholder="Ej: 5000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Ej: Azul Racing"
            />
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 text-slate-600 dark:text-slate-400 font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingMoto ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
