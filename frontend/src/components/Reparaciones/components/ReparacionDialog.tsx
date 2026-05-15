import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';
import { Wrench, User, Bike, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReparacionDialogProps {
  clients: any[];
  motorcycles: any[];
  mechanics: any[];
  availableServices: any[];
  editingOrder: any;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

export function ReparacionDialog({
  clients,
  motorcycles,
  availableServices,
  editingOrder,
  onOpenChange,
  onSave
}: ReparacionDialogProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    motorcycleId: '',
    selectedServices: [] as number[],
    observations: '',
    progress: [] as any[]
  });

  useEffect(() => {
    if (editingOrder) {
      setFormData({
        clientId: editingOrder.clientId?.toString() || '',
        motorcycleId: editingOrder.motorcycleId?.toString() || '',
        selectedServices: editingOrder.selectedServices || [],
        observations: editingOrder.observations || '',
        progress: editingOrder.progress || []
      });
    } else {
      setFormData({ clientId: '', motorcycleId: '', selectedServices: [], observations: '', progress: [] });
    }
  }, [editingOrder]);

  const handleServiceChange = (serviceId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: checked
        ? [...prev.selectedServices, serviceId]
        : prev.selectedServices.filter(s => s !== serviceId)
    }));
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.motorcycleId) {
      toast.error('Seleccione una motocicleta');
      return;
    }
    if (formData.selectedServices.length === 0) {
      toast.error('Seleccione al menos un servicio');
      return;
    }
    onSave(formData);
  };

  return (
    <DialogContent
      className="max-w-3xl animate-modal p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl rounded-2xl"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      {/* Header Banner */}
      <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-20 -mt-20 rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {editingOrder ? 'Editar Reparación' : 'Nueva reparación'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {editingOrder ? 'Actualiza los detalles técnicos' : 'Registra un nuevo ingreso al taller'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-140px)]">
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar space-y-8">

          {/* Cliente y Moto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <User className="w-3 h-3" /> Cliente Responsable
              </Label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value, motorcycleId: '' }))}
                className="w-full h-11 px-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat"
                disabled={!!editingOrder}
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map((c: any) => (
                  <option key={c.ID_Cliente} value={c.ID_Cliente}>{c.Nombre} {c.Apellido} - {c.Documento}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 text-left">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Bike className="w-3 h-3" /> Motocicleta
              </Label>
              <select
                value={formData.motorcycleId}
                onChange={(e) => setFormData(prev => ({ ...prev, motorcycleId: e.target.value }))}
                className="w-full h-11 px-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat"
                disabled={!!editingOrder || !formData.clientId}
              >
                <option value="">Seleccionar motocicleta...</option>
                {motorcycles
                  .filter((m: any) => m.ID_Cliente === parseInt(formData.clientId))
                  .map((m: any) => (
                    <option key={m.ID_Motocicleta} value={m.ID_Motocicleta}>{m.Marca} {m.Modelo} · {m.Placa}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Servicios - Rediseñado */}
          <div className="space-y-3 text-left">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-blue-600" /> Servicios Requeridos
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/30 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
              {availableServices.map((s: any) => {
                const isSelected = formData.selectedServices.includes(s.ID_Servicio);
                return (
                  <div
                    key={s.ID_Servicio}
                    onClick={() => handleServiceChange(s.ID_Servicio, !isSelected)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                      isSelected ? "bg-white border-white text-blue-600" : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    )}>
                      {isSelected && <Check className="w-3.5 h-3.5 font-bold" />}
                    </div>
                    <span className={cn("text-xs font-bold truncate", isSelected ? "text-white" : "text-slate-700 dark:text-slate-300")}>
                      {s.Nombre}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 text-left">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Motivo de Ingreso / Observaciones</Label>
            <Textarea
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Describa el problema o requerimientos..."
              className="min-h-[120px] rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-sm p-4 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-10 px-6 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="reparaciones-btn-primary h-11 px-8 w-full sm:w-auto text-sm"
          >
            {editingOrder ? 'Actualizar Información' : 'Nueva reparación'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
