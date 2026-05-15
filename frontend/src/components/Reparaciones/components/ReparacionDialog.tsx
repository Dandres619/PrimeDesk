import React, { useState, useEffect } from 'react';
import { DialogContent } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Wrench, Bike, AlertCircle, Check } from 'lucide-react';
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
    nota_estado: ''
  });

  const [activeTab, setActiveTab] = useState<'servicios' | 'repuestos'>('servicios');

  useEffect(() => {
    if (editingOrder) {
      setFormData({
        clientId: editingOrder.ID_Cliente?.toString() || '',
        motorcycleId: editingOrder.ID_Motocicleta?.toString() || '',
        selectedServices: editingOrder.servicios?.map((s: any) => s.ID_Servicio) || [],
        observations: editingOrder.Observaciones || '',
        nota_estado: editingOrder.NotaEstado || ''
      });
    } else {
      setFormData({ clientId: '', motorcycleId: '', selectedServices: [], observations: '', nota_estado: '' });
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
    onSave(formData);
  };

  return (
    <DialogContent
      className="sm:max-w-none w-[98vw] max-w-[1300px] h-[90vh] p-0 overflow-hidden bg-slate-950 border-slate-800 shadow-[0_0_80px_-20px_rgba(0,0,0,1)] rounded-[1.5rem] flex flex-col"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">

        {/* TOP BAR - Información de Alto Nivel (Fijo) */}
        <div className="shrink-0 px-10 py-6 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(37,99,235,0.4)]">
              <Wrench className="w-7 h-7 text-blue-400" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-black text-white tracking-tight leading-none uppercase">
                {editingOrder ? 'Expediente de Reparación' : 'Apertura de Orden Técnico'}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded tracking-widest uppercase">
                  {editingOrder ? `ID: ${editingOrder.id}` : 'MODO: REGISTRO'}
                </span>
                <div className="h-1 w-1 rounded-full bg-slate-700" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                  {editingOrder ? `${editingOrder.Placa} • ${editingOrder.NombreCliente}` : 'Ingreso de nuevo vehículo'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right mr-6 border-r border-slate-800 pr-8">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inversión Total</p>
              <p className="text-2xl font-black text-blue-500 tracking-tighter">$0.00</p>
            </div>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 px-6 rounded-xl text-slate-500 font-bold hover:bg-slate-900">
              Cerrar
            </Button>
            <Button type="submit" className="h-12 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95">
              Guardar Cambios
            </Button>
          </div>
        </div>

        {/* MAIN BODY - Tres Secciones Dinámicas */}
        <div className="flex-1 flex overflow-hidden">

          {/* SECCIÓN 1: Status & Info (Sidebar Técnico) */}
          <div className="w-[380px] shrink-0 bg-slate-950 p-8 border-r border-slate-900 overflow-y-auto custom-scrollbar flex flex-col gap-10">

            {/* Status Stepper - Mucho más intuitivo */}
            <div className="space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Progreso de Orden</Label>
              <div className="relative space-y-4">
                {['Recibida', 'En proceso', 'Esperando repuestos', 'Finalizada'].map((estado, idx) => {
                  const isActive = (editingOrder?.Estado || 'Recibida') === estado;
                  return (
                    <div key={estado} className="flex items-start gap-4 group cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                          isActive ? "bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "border-slate-800 bg-slate-900"
                        )}>
                          {isActive && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {idx < 3 && <div className="w-0.5 h-10 bg-slate-900" />}
                      </div>
                      <div className="text-left pt-0.5">
                        <p className={cn("text-xs font-black uppercase tracking-widest transition-colors", isActive ? "text-blue-500" : "text-slate-600 group-hover:text-slate-400")}>
                          {estado}
                        </p>
                        {isActive && (
                          <span className="text-[9px] font-bold text-slate-500 block mt-1">ESTADO ACTUAL</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vehículo e Información */}
            <div className="space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Datos Técnicos</Label>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Vehículo</p>
                    <p className="text-xs font-black text-white">{editingOrder?.Placa || '---'}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Cliente</p>
                    <p className="text-xs font-bold text-slate-400 truncate max-w-[150px]">{editingOrder?.NombreCliente || '---'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase text-slate-600">Bitácora de Observaciones</Label>
                  <Textarea
                    value={formData.observations}
                    onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                    placeholder="Notas internas sobre el estado general..."
                    className="min-h-[120px] text-xs bg-slate-900 border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: El Taller (Centro de Trabajo) */}
          <div className="flex-1 flex flex-col bg-slate-900/20 overflow-hidden">

            {/* Tabs de Navegación Técnica */}
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
                  {tab === 'servicios' ? 'Mano de Obra' : 'Repuestos e Insumos'}
                  {activeTab === tab && <div className="absolute inset-0 bg-blue-600/5 blur-xl rounded-full" />}
                </button>
              ))}
            </div>

            {/* Área de Contenido con Scroll Independiente */}
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">

              {activeTab === 'servicios' && (
                <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4">

                  {/* Selector de Servicios para órdenes nuevas - Ahora como Lista, no botones flotantes */}
                  {!editingOrder && (
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Seleccionar Servicios Disponibles</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availableServices.map((s: any) => {
                          const isSelected = formData.selectedServices.includes(s.ID_Servicio);
                          return (
                            <div
                              key={s.ID_Servicio}
                              onClick={() => handleServiceChange(s.ID_Servicio, !isSelected)}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                                isSelected ? "bg-blue-600/10 border-blue-600 text-white" : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                              )}
                            >
                              <span className="text-[11px] font-black uppercase tracking-tight">{s.Nombre}</span>
                              <div className={cn("w-5 h-5 rounded flex items-center justify-center border", isSelected ? "bg-blue-600 border-blue-600" : "bg-slate-900 border-slate-800")}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Lista de Trabajo Activa */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Servicios en esta Orden</Label>
                    <div className="grid grid-cols-1 gap-4">
                      {editingOrder?.servicios?.map((s: any) => (
                        <div key={s.ID_Servicio} className="bg-slate-950 border border-slate-800 rounded-[1.2rem] overflow-hidden group hover:border-blue-500/40 transition-all">
                          <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                s.Estado === 'Finalizado' ? "bg-green-600/20 text-green-500 border border-green-600/30 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]" : "bg-slate-900 text-slate-600 border border-slate-800"
                              )}>
                                <Check className="w-6 h-6" />
                              </div>
                              <div className="text-left">
                                <h4 className="text-base font-black text-white tracking-tight uppercase">{s.NombreServicio}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={cn("w-1.5 h-1.5 rounded-full", s.Estado === 'Finalizado' ? "bg-green-500" : "bg-blue-500 animate-pulse")} />
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.Estado || 'PENDIENTE'}</p>
                                </div>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="rounded-lg h-10 px-6 border-slate-800 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-white">
                              Marcar Finalizado
                            </Button>
                          </div>
                          <div className="px-6 pb-6 pt-2 border-t border-slate-900 bg-slate-900/20">
                            <Label className="text-[9px] font-black text-slate-600 uppercase mb-3 block">Registro de Procedimiento / Hallazgos</Label>
                            <Textarea
                              value={s.Observaciones || ''}
                              placeholder="Ej: Se detectó desgaste excesivo en las pastas de freno..."
                              className="text-xs bg-slate-950 border-slate-800 rounded-xl min-h-[80px]"
                              onChange={() => { }}
                            />
                          </div>
                        </div>
                      ))}
                      {!editingOrder?.servicios?.length && editingOrder && (
                        <div className="py-24 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center opacity-30">
                          <AlertCircle className="w-12 h-12 mb-4 text-slate-500" />
                          <p className="text-[11px] font-black uppercase tracking-widest">Sin procedimientos activos</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'repuestos' && (
                <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4">

                  {/* Panel de Gestión de Repuestos - Mucho más denso y técnico */}
                  <div className="bg-slate-950 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-slate-900 flex items-center justify-between bg-slate-900/20">
                      <div>
                        <h3 className="text-lg font-black text-white tracking-tight uppercase">Nueva Adquisición</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Registrar compra externa de repuestos</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-4 py-2 bg-slate-900 rounded-lg text-[10px] font-black text-blue-500 border border-blue-500/20">
                          FOTO DE FACTURA OBLIGATORIA
                        </div>
                      </div>
                    </div>

                    <div className="p-8 grid grid-cols-12 gap-8">
                      <div className="col-span-8 space-y-4 text-left">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descripción del Repuesto</Label>
                          <input className="w-full h-12 px-5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-white focus:border-blue-600 outline-none" placeholder="EJ: KIT DE ARRASTRE REFORZADO" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monto Facturado</Label>
                            <input type="number" className="w-full h-12 px-5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-white focus:border-blue-600 outline-none" placeholder="0.00" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoría</Label>
                            <select className="w-full h-12 px-5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-white outline-none">
                              <option>Repuestos</option>
                              <option>Insumos / Lubricantes</option>
                              <option>Tornillería / Varios</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-4 flex flex-col">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Comprobante</Label>
                        <div className="flex-1 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center group cursor-pointer hover:bg-slate-900 hover:border-blue-500/50 transition-all">
                          <Bike className="w-8 h-8 mb-2 text-slate-700 group-hover:text-blue-500 transition-all" />
                          <span className="text-[9px] font-black text-slate-600 uppercase group-hover:text-slate-400">Subir Recibo</span>
                        </div>
                      </div>

                      <div className="col-span-12 pt-4">
                        <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-blue-500/20">
                          Confirmar y Cargar a la Cuenta
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Registro de Gastos */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Historial de Cargos</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {editingOrder?.compras?.map((c: any) => (
                        <div key={c.ID_Compra} className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                              {c.Factura ? <img src={c.Factura} className="w-full h-full object-cover" /> : <Wrench className="w-6 h-6 text-slate-800" />}
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-black text-white uppercase tracking-tight">{c.Observaciones || 'REPUESTO TÉCNICO'}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-widest">Cargo Directo a Orden</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-8">
                            <div>
                              <p className="text-xl font-black text-blue-500 tracking-tighter">${c.Subtotal}</p>
                            </div>
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-red-500/10 text-slate-600 hover:text-red-500">
                              <span className="text-xl">×</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                      {!editingOrder?.compras?.length && (
                        <div className="py-20 flex flex-col items-center justify-center opacity-20">
                          <p className="text-xs font-black uppercase tracking-widest">Sin registros de facturación</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </form>
    </DialogContent>





  );
}
