import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';
import { Wrench, User, Bike, AlertCircle, Plus, Check } from 'lucide-react';
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
  mechanics,
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
  const [newProgress, setNewProgress] = useState({ description: '', technicianId: '' });

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

  const addProgress = () => {
    if (!newProgress.description || !newProgress.technicianId) {
      toast.error('Complete la descripción y seleccione el mecánico');
      return;
    }
    const mech = mechanics.find((m: any) => m.ID_Empleado.toString() === newProgress.technicianId);
    setFormData(prev => ({
      ...prev,
      progress: [
        ...prev.progress,
        {
          id: `new_${Date.now()}`,
          description: newProgress.description,
          technicianId: parseInt(newProgress.technicianId),
          technician: `${mech.Nombre} ${mech.Apellido}`
        }
      ]
    }));
    setNewProgress({ description: '', technicianId: '' });
    toast.success('Avance agregado');
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

          {/* Observaciones */}
          <div className="space-y-2 text-left">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Motivo de Ingreso / Observaciones</Label>
            <Textarea
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Describa el problema o requerimientos..."
              className="min-h-[80px] rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-sm p-4 focus:ring-blue-500"
            />
          </div>

          {/* Avances - Rediseñado */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cronograma de Avances</Label>
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 font-bold">
                {formData.progress.length} registros
              </Badge>
            </div>

            {formData.progress.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                {formData.progress.map((p: any) => (
                  <div key={p.id} className="flex gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="w-1 h-auto bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.description}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Técnico: {p.technician}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-slate-100/30 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-left">Registrar nuevo avance</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newProgress.description}
                  onChange={(e) => setNewProgress(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="¿Qué se realizó?"
                  className="h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
                <div className="flex gap-2 flex-1">
                  <select
                    value={newProgress.technicianId}
                    onChange={(e) => setNewProgress(prev => ({ ...prev, technicianId: e.target.value }))}
                    className="flex-1 h-10 px-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-[size:1rem_1rem] bg-no-repeat"
                  >
                    <option value="">Técnico...</option>
                    {mechanics.map((m: any) => (
                      <option key={m.ID_Empleado} value={m.ID_Empleado}>{m.Nombre} {m.Apellido}</option>
                    ))}
                  </select>
                  <Button type="button" onClick={addProgress} size="icon" className="h-10 w-10 bg-slate-900 hover:bg-black text-white rounded-xl shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
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
