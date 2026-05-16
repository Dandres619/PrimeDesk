import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { ClipboardPen, Check, User, Bike, AlertCircle, FileImage, Plus, Loader2, Info, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

interface ReparacionDialogProps {
  clients: any[];
  motorcycles: any[];
  mechanics: any[];
  availableServices: any[];
  editingOrder: any;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  onOrderUpdated?: () => void; // New prop to notify parent of changes
}

export function ReparacionDialog({
  clients,
  motorcycles,
  availableServices,
  editingOrder,
  onOpenChange,
  onSave,
}: ReparacionDialogProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    motorcycleId: '',
    selectedServices: [] as number[],
    observations: '',
    nota_estado: ''
  });

  const [activeTab, setActiveTab] = useState<'servicios' | 'repuestos'>('servicios');
  const [localOrder, setLocalOrder] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  // States for new Repuesto
  const [newRepuesto, setNewRepuesto] = useState({ id_producto: '', cantidad: 1, precio_unitario: '', observaciones: '' });
  const [facturaFile, setFacturaFile] = useState<File | null>(null);
  const [isSubmittingRepuesto, setIsSubmittingRepuesto] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Modals state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: 'start' as 'start' | 'finish', title: '', description: '' });
  const [finalizeServiceDialog, setFinalizeServiceDialog] = useState({ open: false, serviceId: null as number | null, obs: '', serviceName: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (editingOrder) {
      setLocalOrder(editingOrder);
      setFormData({
        clientId: editingOrder.ID_Cliente?.toString() || '',
        motorcycleId: editingOrder.ID_Motocicleta?.toString() || '',
        selectedServices: editingOrder.servicios?.map((s: any) => s.ID_Servicio) || [],
        observations: editingOrder.Observaciones || '',
        nota_estado: editingOrder.NotaEstado || ''
      });
      fetchProducts();
    } else {
      setLocalOrder(null);
      setFormData({ clientId: '', motorcycleId: '', selectedServices: [], observations: '', nota_estado: '' });
    }
  }, [editingOrder]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/productos`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setProducts(data);
    } catch (e) { }
  };

  const reloadLocalOrder = async () => {
    if (!localOrder) return;
    try {
      const res = await fetch(`${API_URL}/reparaciones/${localOrder.id || localOrder.ID_Reparacion}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLocalOrder({ ...localOrder, ...data });
      return { ...localOrder, ...data };
    } catch (e) {
      return null;
    }
  };

  const handleUpdateEstado = async (nuevoEstado: string) => {
    if (!localOrder || localOrder.Estado === nuevoEstado) return;
    setLoadingAction(`estado-${nuevoEstado}`);
    try {
      const res = await fetch(`${API_URL}/reparaciones/${localOrder.id || localOrder.ID_Reparacion}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      toast.success(`Estado actualizado a: ${nuevoEstado}`);
      await reloadLocalOrder();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFinalizeService = async () => {
    if (!localOrder || !finalizeServiceDialog.serviceId) return;
    const sId = finalizeServiceDialog.serviceId;
    setLoadingAction(`servicio-${sId}`);
    try {
      const res = await fetch(`${API_URL}/reparaciones/${localOrder.id || localOrder.ID_Reparacion}/servicios/${sId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: 'Finalizado', observaciones: finalizeServiceDialog.obs })
      });
      if (!res.ok) throw new Error('Error al finalizar servicio');
      toast.success('Servicio finalizado');

      const newOrderData = await reloadLocalOrder();
      setFinalizeServiceDialog({ open: false, serviceId: null, obs: '', serviceName: '' });

      // Check if all services are now finalized using the fresh data
      if (newOrderData?.servicios?.every((s: any) => s.Estado === 'Finalizado')) {
        toast.info('Todos los servicios finalizados. Puede proceder a registrar repuestos si es necesario.');
        setActiveTab('repuestos');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAddRepuesto = async () => {
    if (!localOrder || !newRepuesto.id_producto || !newRepuesto.cantidad || !newRepuesto.precio_unitario) {
      return toast.error('Complete los campos obligatorios del repuesto.');
    }
    setIsSubmittingRepuesto(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('id_producto', newRepuesto.id_producto);
      formDataObj.append('cantidad', newRepuesto.cantidad.toString());
      formDataObj.append('precio_unitario', newRepuesto.precio_unitario.toString());
      formDataObj.append('observaciones', newRepuesto.observaciones);
      if (facturaFile) {
        formDataObj.append('facturaFile', facturaFile);
      }

      const res = await fetch(`${API_URL}/reparaciones/${localOrder.id || localOrder.ID_Reparacion}/compras`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataObj
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al registrar repuesto');
      }

      toast.success('Repuesto/Insumo agregado a la reparación.');
      setNewRepuesto({ id_producto: '', cantidad: 1, precio_unitario: '', observaciones: '' });
      setFacturaFile(null);
      await reloadLocalOrder();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmittingRepuesto(false);
    }
  };

  const handleProductSelect = (idStr: string) => {
    const prod = products.find(p => p.ID_Producto.toString() === idStr);
    if (prod) {
      // Assuming a suggested price is needed, we could use a field from product if available. Just leave blank for user to input
      setNewRepuesto({ ...newRepuesto, id_producto: idStr, precio_unitario: prod.Precio || '' });
    } else {
      setNewRepuesto({ ...newRepuesto, id_producto: idStr });
    }
  };

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
    onSave(formData);
  };

  return (
    <DialogContent
      className={cn(
        "p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal",
        editingOrder
          ? "sm:max-w-none w-[98vw] max-w-[1300px] h-[90vh] bg-white dark:bg-slate-950 transition-all duration-500"
          : "max-w-lg w-[95vw] bg-white dark:bg-slate-950"
      )}
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">

        {/* LAYOUT PARA NUEVA REPARACIÓN (ESTÁNDAR PRIME DESK) */}
        {!editingOrder ? (
          <>
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                <ClipboardPen className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Registro de Reparación
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Nueva orden presencial</p>
              </div>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4" /> Cliente Responsable
                  </Label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value, motorcycleId: '' }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.1rem_1.1rem] bg-no-repeat"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clients.map((c: any) => (
                      <option key={c.ID_Cliente} value={c.ID_Cliente}>{c.Nombre} {c.Apellido}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Bike className="w-4 h-4" /> Vehículo (Placa)
                  </Label>
                  <select
                    value={formData.motorcycleId}
                    onChange={(e) => setFormData(prev => ({ ...prev, motorcycleId: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.1rem_1.1rem] bg-no-repeat disabled:opacity-50"
                    disabled={!formData.clientId}
                  >
                    <option value="">Seleccionar moto...</option>
                    {motorcycles
                      .filter((m: any) => m.ID_Cliente === parseInt(formData.clientId))
                      .map((m: any) => (
                        <option key={m.ID_Motocicleta} value={m.ID_Motocicleta}>{m.Placa} - {m.Marca}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" /> Servicios Requeridos
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
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
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-400"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0",
                          isSelected ? "bg-white border-white text-blue-600" : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                        )}>
                          {isSelected && <Check className="w-3.5 h-3.5 font-bold" />}
                        </div>
                        <span className={cn("text-sm font-bold truncate", isSelected ? "text-white" : "text-slate-700 dark:text-slate-300")}>
                          {s.Nombre}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Observaciones</Label>
                <Textarea
                  value={formData.observations}
                  onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Describa detalladamente el problema..."
                  className="min-h-[100px] rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-sm p-4 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFormData({ clientId: '', motorcycleId: '', selectedServices: [], observations: '', nota_estado: '' });
                  onOpenChange(false);
                }}
                className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-12 px-12 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
              >
                Crear Reparación
              </Button>
            </div>
          </>
        ) : (

          /* LAYOUT PARA EDITAR REPARACIÓN (COMMAND CENTER) */
          <>
            {/* TOP BAR - Información de Alto Nivel */}
            <div className="shrink-0 px-10 py-6 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(37,99,235,0.4)]">
                  <Wrench className="w-7 h-7 text-blue-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-black text-white tracking-tight leading-none uppercase">
                    Reparación #{localOrder?.id || localOrder?.ID_Reparacion || editingOrder?.id}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                      Motocicleta: {localOrder?.motorcyclePlate || localOrder?.Placa} • Cliente: {localOrder?.clientName || localOrder?.cliente_nombre || localOrder?.NombreCliente}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right mr-6 border-r border-slate-800 pr-8">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inversión Repuestos</p>
                  <p className="text-2xl font-black text-blue-500 tracking-tighter">
                    ${localOrder?.compras?.reduce((acc: number, cur: any) => acc + Number(cur.Subtotal || 0), 0).toLocaleString() || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* SIDEBAR IZQUIERDO */}
              <div className="w-[380px] shrink-0 bg-slate-950 p-8 border-r border-slate-900 overflow-y-auto custom-scrollbar flex flex-col gap-10">
                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estado de la Reparación</Label>
                  <div className="relative space-y-4">
                    {['Esperando motocicleta', 'En reparación', 'Reparación finalizada'].map((estado, idx) => {
                      const currentEstado = localOrder?.Estado || localOrder?.estadoBase || 'Esperando motocicleta';
                      const isActive = currentEstado === estado;
                      const isPast = ['Esperando motocicleta', 'En reparación', 'Reparación finalizada'].indexOf(currentEstado) > idx;
                      return (
                        <div key={estado} className="flex items-start gap-4 group text-left">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10",
                              isActive ? "bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" : isPast ? "bg-slate-800 border-blue-500" : "border-slate-800 bg-slate-900"
                            )}>
                              {loadingAction === `estado-${estado}` ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : (isActive || isPast) && <Check className={cn("w-4 h-4", isActive ? "text-white" : "text-blue-500")} />}
                            </div>
                            {idx < 2 && <div className={cn("w-1 h-14 -mt-2 -mb-2", isPast ? "bg-blue-900/50" : "bg-slate-900")} />}
                          </div>
                          <div className="text-left pt-1.5">
                            <p className={cn("text-sm font-black uppercase tracking-widest transition-colors", isActive ? "text-blue-400" : isPast ? "text-slate-400" : "text-slate-600 group-hover:text-slate-500")}>
                              {estado}
                            </p>
                            {isActive && <span className="text-[10px] font-bold text-slate-500 block mt-1">ESTADO ACTUAL</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Datos Técnicos</Label>
                  <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Motocicleta</p>
                      <p className="text-xs font-bold text-slate-400 truncate max-w-[150px]">{localOrder?.motorcycleBrand || localOrder?.Marca} {localOrder?.motorcycleModel || localOrder?.Modelo || '---'} • {localOrder?.motorcyclePlate || localOrder?.Placa || '---'}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Cliente</p>
                      <p className="text-xs font-bold text-slate-400 truncate max-w-[150px]">{localOrder?.clientName || localOrder?.NombreCliente || localOrder?.cliente_nombre || '---'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase text-slate-600">Observaciones Globales</Label>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl min-h-[100px] text-xs text-slate-400">
                      {localOrder?.Observaciones || 'Sin observaciones...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* MAIN WORKSPACE */}
              <div className="flex-1 flex flex-col bg-slate-900/20 overflow-hidden">
                <div className="shrink-0 flex px-10 gap-10 border-b border-slate-800 bg-slate-950/40">
                  {['servicios', 'repuestos'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab as any)}
                      className={cn(
                        "h-16 border-b-2 text-[11px] font-black uppercase tracking-[0.25em] transition-all relative",
                        activeTab === tab ? "border-blue-600 text-blue-500" : "border-transparent text-slate-600 hover:text-slate-400"
                      )}
                    >
                      {tab === 'servicios' ? 'Servicios' : 'Compras de Repuestos'}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar text-left relative">
                  {activeTab === 'servicios' ? (() => {
                    const currentEstado = localOrder?.Estado || localOrder?.estadoBase || 'Esperando motocicleta';

                    if (currentEstado === 'Esperando motocicleta') {
                      return (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 h-full">
                          <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
                            <Bike className="w-10 h-10 text-blue-500" />
                          </div>
                          <div className="max-w-sm space-y-2">
                            <h3 className="text-xl font-black text-white tracking-tight">Esperando ingreso</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                              Cuando la motocicleta ingrese al taller, presione el botón <strong className="text-slate-300">"Iniciar reparación"</strong> para comenzar.
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => setConfirmDialog({ open: true, type: 'start', title: 'Iniciar reparación', description: '¿Está seguro de iniciar la reparación? Esta acción no se puede deshacer y cambiará el estado a En reparación.' })}
                            className="h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                          >
                            Iniciar reparación
                          </Button>
                        </div>
                      );
                    }

                    return (
                      <div className="max-w-4xl mx-auto space-y-4">
                        {localOrder?.servicios?.map((s: any) => (
                          <div key={s.ID_Servicio} className="bg-slate-950 border border-slate-800 rounded-[1.2rem] overflow-hidden group hover:border-blue-500/40 transition-all text-left">
                            <div className="p-6 flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border border-slate-800", s.Estado === 'Finalizado' ? "bg-green-600/20 text-green-500" : "bg-slate-900 text-slate-600")}>
                                  <Check className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                  <h4 className="text-base font-black text-white tracking-tight uppercase">{s.NombreServicio || s.Nombre}</h4>
                                  <p className="text-[9px] font-black text-slate-500 uppercase mt-1">{s.Estado || 'PENDIENTE'}</p>
                                </div>
                              </div>
                              {s.Estado !== 'Finalizado' && currentEstado === 'En reparación' && (
                                <Button
                                  type="button"
                                  onClick={() => setFinalizeServiceDialog({ open: true, serviceId: s.ID_Servicio, obs: '', serviceName: s.NombreServicio || s.Nombre })}
                                  disabled={loadingAction === `servicio-${s.ID_Servicio}`}
                                  size="sm"
                                  variant="outline"
                                  className="rounded-lg h-10 border-slate-800 font-black text-[10px] uppercase text-blue-400 hover:text-blue-300 hover:bg-slate-900"
                                >
                                  {loadingAction === `servicio-${s.ID_Servicio}` ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalizar servicio'}
                                </Button>
                              )}
                            </div>
                            {s.Observaciones && s.Estado === 'Finalizado' && (
                              <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/30">
                                <p className="text-xs font-medium text-slate-400"><span className="font-bold text-slate-500 mr-2">OBSERVACIÓN:</span>{s.Observaciones}</p>
                              </div>
                            )}
                          </div>
                        ))}

                        {currentEstado === 'En reparación' && (
                          <div className="mt-10 p-6 rounded-2xl border border-blue-500/10 bg-blue-500/5 text-center flex items-center justify-center gap-4">
                            <Info className="w-5 h-5 text-blue-500 shrink-0" />
                            <p className="text-xs font-bold text-blue-400/80 leading-relaxed text-left">
                              Cuando todos los servicios estén finalizados y las compras de repuestos estén registradas, <br />podrá pasar a "Reparación finalizada" desde la sección de Compras.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })() : (() => {
                    return (
                      <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-10">
                        {/* Lista de Repuestos Actuales */}
                        <div className="xl:col-span-2 space-y-6">
                          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                            Repuestos Utilizados <Badge className="bg-slate-800 text-slate-400 border-none">{localOrder?.compras?.length || 0}</Badge>
                          </h3>
                          <div className="space-y-4">
                            {localOrder?.compras?.length > 0 ? localOrder.compras.map((compra: any) => (
                              <div key={compra.ID_Reparacion_Compra} className="bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 flex flex-col sm:flex-row gap-6">
                                <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                                  <Wrench className="w-8 h-8 text-slate-600" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="text-base font-black text-white">{compra.NombreProducto || 'Producto ID ' + compra.ID_Producto}</h4>
                                      <p className="text-xs text-slate-500">{compra.Cantidad} unid. x ${parseFloat(compra.PrecioUnitario).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-black text-blue-400">${parseFloat(compra.Subtotal).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  {compra.Observaciones && <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/50 mt-2">{compra.Observaciones}</p>}
                                </div>
                                {compra.Factura && (
                                  <div className="shrink-0 flex items-center justify-center">
                                    <a href={compra.Factura} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors group">
                                      <FileImage className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )) : (
                              <div className="text-center p-12 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                                <p className="text-sm font-bold text-slate-500">No hay repuestos registrados aún.</p>
                              </div>
                            )}
                            {/* Botón de Finalizar Reparación Completa */}
                            {(localOrder?.Estado || localOrder?.estadoBase) === 'En reparación' && localOrder?.servicios?.every((s: any) => s.Estado === 'Finalizado') && (
                              <div className="pt-10 border-t border-slate-800 flex justify-end">
                                <Button
                                  type="button"
                                  onClick={() => setConfirmDialog({ open: true, type: 'finish', title: 'Finalizar Reparación', description: '¿Está seguro de finalizar la reparación? Verifique que ya haya subido todas las fotos de recibos y facturas necesarias.' })}
                                  className="h-14 px-12 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                  Finalizar reparación
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Formulario Nueva Compra */}
                        {localOrder?.Estado !== 'Reparación finalizada' && (
                          <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 space-y-6 h-fit sticky top-0">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                              <Plus className="w-4 h-4 text-blue-500" /> Agregar repuesto
                            </h3>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase">Producto/Repuesto</Label>
                                <select
                                  value={newRepuesto.id_producto}
                                  onChange={(e) => handleProductSelect(e.target.value)}
                                  className="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                >
                                  <option value="">Seleccione...</option>
                                  {products.map(p => (
                                    <option key={p.ID_Producto} value={p.ID_Producto}>{p.Nombre}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black text-slate-500 uppercase">Cantidad</Label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={newRepuesto.cantidad}
                                    onChange={(e) => setNewRepuesto({ ...newRepuesto, cantidad: parseInt(e.target.value) || 0 })}
                                    className="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-white outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black text-slate-500 uppercase">Precio Un.</Label>
                                  <input
                                    type="number"
                                    value={newRepuesto.precio_unitario}
                                    onChange={(e) => setNewRepuesto({ ...newRepuesto, precio_unitario: e.target.value })}
                                    className="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-white outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase">Observaciones (opcional)</Label>
                                <Textarea
                                  value={newRepuesto.observaciones}
                                  onChange={(e) => setNewRepuesto({ ...newRepuesto, observaciones: e.target.value })}
                                  placeholder="Razón de uso..."
                                  className="bg-slate-900 border-slate-800 rounded-xl text-xs resize-none h-16 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase">Foto Factura/Recibo (Opcional)</Label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setFacturaFile(e.target.files ? e.target.files[0] : null)}
                                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-800 file:text-blue-400 hover:file:bg-slate-700"
                                />
                              </div>
                              <div className="pt-4 border-t border-slate-800">
                                <div className="flex justify-between items-center mb-4">
                                  <span className="text-[10px] font-black text-slate-500 uppercase">Subtotal</span>
                                  <span className="text-lg font-black text-blue-500">${((newRepuesto.cantidad || 0) * (parseFloat(newRepuesto.precio_unitario) || 0)).toLocaleString()}</span>
                                </div>
                                <Button
                                  type="button"
                                  onClick={handleAddRepuesto}
                                  disabled={isSubmittingRepuesto || !newRepuesto.id_producto || !newRepuesto.cantidad || !newRepuesto.precio_unitario}
                                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl disabled:opacity-50"
                                >
                                  {isSubmittingRepuesto ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar repuesto'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
      </form>

      {/* Confirmation Dialog para transiciones de estado principales */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.type === 'start' ? 'Iniciar' : 'Finalizar'}
        variant={confirmDialog.type === 'finish' ? 'default' : 'default'} // Assuming default is blue, but finish can also be default or constructive if available
        onConfirm={() => {
          if (confirmDialog.type === 'start') handleUpdateEstado('En reparación');
          else if (confirmDialog.type === 'finish') handleUpdateEstado('Reparación finalizada');
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }}
      />

      {/* Dialog para finalizar un servicio con observación opcional */}
      <Dialog open={finalizeServiceDialog.open} onOpenChange={(open) => setFinalizeServiceDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-left">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Finalizar Servicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{finalizeServiceDialog.serviceName}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Observación (Opcional)</Label>
              <Textarea
                value={finalizeServiceDialog.obs}
                onChange={(e) => setFinalizeServiceDialog(prev => ({ ...prev, obs: e.target.value }))}
                placeholder="Agregue alguna nota sobre el trabajo realizado si es necesario..."
                className="h-24 bg-transparent border-slate-200 dark:border-slate-800 rounded-xl resize-none"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="ghost" onClick={() => setFinalizeServiceDialog(prev => ({ ...prev, open: false }))} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleFinalizeService} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={loadingAction !== null}>
              {loadingAction ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Guardar y Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContent>
  );
}
