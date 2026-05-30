import React from 'react';
import { Badge } from '../../ui/badge';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { cn } from '@/lib/utils';
import { Wrench, Check, Loader2, Info, Plus, ChevronsUpDown, Search, Trash2, FileImage, ExternalLink } from 'lucide-react';

interface EditRepairCommandCenterProps {
  localOrder: any;
  activeTab: 'servicios' | 'repuestos';
  setActiveTab: (tab: 'servicios' | 'repuestos') => void;
  loadingAction: string | null;
  availableServices: any[];
  products: any[];
  filteredProducts: any[];
  proveedores: any[];
  filteredProveedores: any[];
  newRepuesto: any;
  setNewRepuesto: React.Dispatch<React.SetStateAction<any>>;
  touchedRepuesto: any;
  setTouchedRepuesto: React.Dispatch<React.SetStateAction<any>>;
  repuestoErrors: Record<string, string>;
  facturaFile: File | null;
  setFacturaFile: (file: File | null) => void;
  isSubmittingRepuesto: boolean;
  search: any;
  setSearch: React.Dispatch<React.SetStateAction<any>>;
  popovers: any;
  setPopovers: React.Dispatch<React.SetStateAction<any>>;
  formattedFecha: string;
  formattedHora: string;
  allServicesFinalized: boolean;
  isRepuestosLocked: boolean;
  setFinalizeServiceDialog: React.Dispatch<React.SetStateAction<any>>;
  setDeleteConfirm: React.Dispatch<React.SetStateAction<any>>;
  setFinalizeRepairDialog: React.Dispatch<React.SetStateAction<any>>;
  handleAddRepuesto: () => void;
  handleProductSelect: (idStr: string) => void;
  handleNumberKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  handleUpdateEstado: (nuevoEstado: string) => void;
  setConfirmDialog: React.Dispatch<React.SetStateAction<any>>;
}

export function EditRepairCommandCenter({
  localOrder,
  activeTab,
  setActiveTab,
  loadingAction,
  availableServices,
  products,
  filteredProducts,
  proveedores,
  filteredProveedores,
  newRepuesto,
  setNewRepuesto,
  touchedRepuesto,
  setTouchedRepuesto,
  repuestoErrors,
  setFacturaFile,
  isSubmittingRepuesto,
  search,
  setSearch,
  popovers,
  setPopovers,
  formattedFecha,
  formattedHora,
  allServicesFinalized,
  isRepuestosLocked,
  setFinalizeServiceDialog,
  setDeleteConfirm,
  setFinalizeRepairDialog,
  handleAddRepuesto,
  handleProductSelect,
  handleNumberKeyDown,
  scrollContainerRef,
  setConfirmDialog,
}: EditRepairCommandCenterProps) {
  const currentEstado = localOrder?.Estado || localOrder?.estadoBase || 'Esperando motocicleta';

  return (
    <>
      {/* TOP BAR - Información de Alto Nivel */}
      <div className="shrink-0 px-10 py-6 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(37,99,235,0.4)]">
            <Wrench className="w-7 h-7 text-blue-400" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-black text-white tracking-tight leading-none uppercase">
              Reparación #{localOrder?.id || localOrder?.ID_Reparacion}
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
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Repuestos</p>
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
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Cliente</p>
                <p className="text-xs font-bold text-slate-400 truncate max-w-[150px]">{localOrder?.clientName || localOrder?.NombreCliente || localOrder?.cliente_nombre || '---'}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Programación</p>
                <p className="text-xs font-bold text-slate-400">
                  {formattedFecha}{formattedHora ? ` · ${formattedHora}` : ''}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[9px] font-black uppercase text-slate-600">Observaciones Globales</Label>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl min-h-[100px] text-xs text-slate-400">
                {localOrder?.Observaciones || localOrder?.observations || 'Sin observaciones...'}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN WORKSPACE */}
        <div className="flex-1 bg-slate-950/20 flex flex-col overflow-hidden">
          {/* TABS DE TRABAJO */}
          <div className="px-10 border-b border-slate-900 bg-slate-950 flex gap-8 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('servicios')}
              className={cn(
                "py-5 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                activeTab === 'servicios' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-400"
              )}
            >
              Servicios en la Orden ({localOrder?.servicios?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isRepuestosLocked) {
                  setActiveTab('repuestos');
                }
              }}
              disabled={isRepuestosLocked}
              className={cn(
                "py-5 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                activeTab === 'repuestos' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-400",
                isRepuestosLocked && "opacity-45 cursor-not-allowed hover:text-slate-500"
              )}
            >
              Compras de repuestos ({localOrder?.compras?.length || 0})
            </button>
          </div>

          {/* CONTENIDO TABS */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar" ref={scrollContainerRef}>
            {activeTab === 'servicios' ? (
              <div className="max-w-4xl mx-auto space-y-6">
                {currentEstado === 'Esperando motocicleta' ? (
                  <div className="flex flex-col items-center justify-center text-center py-16 px-6 max-w-xl mx-auto space-y-8 bg-slate-900/30 border border-slate-900 rounded-[2rem] shadow-xl">
                    <style>{`
                      @keyframes needle-wiggle {
                        0%, 100% { transform: rotate(-40deg); }
                        20% { transform: rotate(40deg); }
                        40% { transform: rotate(10deg); }
                        60% { transform: rotate(80deg); }
                        80% { transform: rotate(50deg); }
                      }
                      .animate-needle {
                        transform-origin: 12px 12px;
                        animation: needle-wiggle 4s infinite ease-in-out;
                      }
                    `}</style>

                    {/* Animated Speedometer Icon */}
                    <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden group">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-12 h-12 text-blue-400 animate-pulse"
                      >
                        <path d="M12 2a10 10 0 0 0-10 10c0 2.2.7 4.3 2 6" />
                        <path d="M12 22a10 10 0 0 0 10-10c0-2.2-.7-4.3-2-6" />
                        <circle cx="12" cy="12" r="1" />
                        <path d="m12 12 5-5" className="animate-needle" />
                        <path d="M12 2v2" />
                        <path d="M19 12h2" />
                        <path d="M3 12h2" />
                        <path d="m18.4 5.6-1.4 1.4" />
                        <path d="m5.6 5.6 1.4 1.4" />
                      </svg>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-extrabold text-white tracking-tight leading-none uppercase">
                        Esperando Motocicleta
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-sm mx-auto">
                        Los servicios y repuestos se podrán gestionar una vez que la motocicleta ingrese al taller y se inicie formalmente el proceso.
                      </p>

                      <Button
                        type="button"
                        onClick={() => setConfirmDialog({
                          open: true,
                          type: 'start',
                          title: '¿Iniciar reparación?',
                          description: 'Una vez iniciada se registrará el ingreso del vehículo y no podrá volver al estado anterior.'
                        })}
                        disabled={loadingAction === 'estado-En reparación'}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                      >
                        {loadingAction === 'estado-En reparación' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
                        Iniciar Reparación
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">
                        Servicios Requeridos
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {localOrder?.servicios?.map((s: any) => {
                        const matchService = availableServices.find((as: any) =>
                          Number(as.ID_Servicio || as.id_servicio) === Number(s.ID_Servicio || s.id_servicio)
                        );
                        const servicePrice = parseFloat(s.Precio || matchService?.Precio || matchService?.precio || 0);

                        return (
                          <div key={s.ID_Servicio} className="bg-slate-950 border border-slate-800 rounded-[1.2rem] overflow-hidden group hover:border-blue-500/40 transition-all text-left">
                            <div className="p-6 flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border border-slate-800", s.Estado === 'Finalizado' ? "bg-green-600/20 text-green-500" : "bg-slate-900 text-slate-600")}>
                                  <Check className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                  <h4 className="text-base font-black text-white tracking-tight uppercase">{s.NombreServicio || s.Nombre}</h4>
                                  <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase">{s.Estado || 'PENDIENTE'}</p>
                                    <span className="text-slate-800">•</span>
                                    <p className="text-xs font-bold text-blue-400/90">
                                      {!isNaN(servicePrice) && servicePrice > 0 ? `$${servicePrice.toLocaleString()}` : 'Sin costo'}
                                    </p>
                                  </div>
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
                        );
                      })}

                      {currentEstado === 'En reparación' && (
                        <div className="space-y-6 mt-8">
                          <div className="p-6 rounded-2xl border border-blue-500/10 bg-blue-500/5 flex items-start gap-4">
                            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="space-y-1.5 text-left">
                              <p className="text-xs font-black text-blue-300 uppercase tracking-wider">Pasos para completar la orden</p>
                              <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                                Para completar la reparación, primero finaliza todos los servicios de esta lista. Una vez completados, podrás acceder a la pestaña de <strong>"Compras de repuestos"</strong> para registrar los repuestos utilizados (en caso de haberlos) y agregar el costo de la mano de obra para finalizar la reparación.
                              </p>
                            </div>
                          </div>

                          {allServicesFinalized && (
                            <div className="flex justify-center pt-2">
                              <Button
                                type="button"
                                onClick={() => setActiveTab('repuestos')}
                                className="h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                              >
                                Continuar a registrar Repuestos ➜
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Lista de Repuestos Actuales */}
                <div className="xl:col-span-2 space-y-6">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    Repuestos Utilizados <Badge className="bg-slate-800 text-slate-400 border-none">{localOrder?.compras?.length || 0}</Badge>
                  </h3>
                  <div className="space-y-4">
                    {localOrder?.compras?.length > 0 ? localOrder.compras.map((compra: any) => (
                      <div key={compra.ID_Reparacion_Compra} className="bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 flex flex-col sm:flex-row items-center gap-6">
                        {/* Left Column: Image preview thumbnail / Wrench fallback */}
                        {compra.Factura ? (
                          <a
                            href={compra.Factura}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-16 h-16 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800 shrink-0 transition-transform duration-300 hover:scale-105 active:scale-95 group/img"
                            title="Ver factura de compra"
                          >
                            <img
                              src={compra.Factura}
                              alt="Factura"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const icon = parent.querySelector('.fallback-icon');
                                  if (icon) {
                                    icon.classList.remove('hidden');
                                    icon.classList.add('flex');
                                  }
                                }
                              }}
                            />
                            <div className="fallback-icon hidden w-full h-full items-center justify-center text-blue-500">
                              <FileImage className="w-6 h-6" />
                            </div>
                            {/* Overlay hover effect */}
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="w-5 h-5 text-white" />
                            </div>
                          </a>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                            <Wrench className="w-8 h-8 text-slate-600" />
                          </div>
                        )}

                        <div className="flex-1 flex flex-row items-center justify-between gap-4 w-full">
                          <div className="text-left space-y-1">
                            <h4 className="text-base font-black text-white leading-tight">
                              {compra.NombreProducto || 'Producto ID ' + compra.ID_Producto}
                            </h4>
                            <p className="text-xs text-slate-500 font-bold">
                              {compra.Cantidad} {compra.Cantidad === 1 ? 'unidad' : 'unidades'} x ${parseFloat(compra.PrecioUnitario).toLocaleString()}
                            </p>
                            {compra.NombreProveedor && (
                              <div className="mt-1">
                                <Badge className="bg-slate-900 text-blue-400 border-slate-800 text-[9px] font-black uppercase">
                                  Proveedor: {compra.NombreProveedor}
                                </Badge>
                              </div>
                            )}
                            {compra.Observaciones && (
                              <p className="text-xs text-slate-400 font-medium italic mt-2 pt-2 border-t border-slate-800/50">
                                "{compra.Observaciones}"
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0 flex items-center gap-4">
                            <div>
                              <p className="text-lg font-black text-blue-400">
                                ${parseFloat(compra.Subtotal).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={loadingAction === `delete-compra-${compra.ID_Reparacion_Compra}`}
                              onClick={() => setDeleteConfirm({ open: true, purchaseId: compra.ID_Reparacion_Compra })}
                              className="h-10 w-10 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Eliminar repuesto"
                            >
                              {loadingAction === `delete-compra-${compra.ID_Reparacion_Compra}` ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center p-12 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                        <p className="text-sm font-bold text-slate-500">No hay repuestos registrados aún.</p>
                      </div>
                    )}
                    {/* Botón de Finalizar Reparación Completa */}
                    {currentEstado === 'En reparación' && localOrder?.servicios?.every((s: any) => s.Estado === 'Finalizado') && (
                      <div className="pt-10 border-t border-slate-800 flex justify-end">
                        <Button
                          type="button"
                          onClick={() => setFinalizeRepairDialog({ open: true, manoObra: '', observaciones: '', error: '' })}
                          className="h-14 px-12 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          Finalizar reparación
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Formulario Nueva Compra */}
                {currentEstado !== 'Reparación finalizada' && (
                  <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 space-y-6 h-fit sticky top-0 text-left">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blue-500" /> Agregar repuesto
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2 text-left">
                        <Label className="text-[10px] font-black text-slate-500 uppercase">Repuesto</Label>
                        <Popover open={popovers.product} onOpenChange={(open) => setPopovers({ ...popovers, product: open })}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              type="button"
                              className={cn(
                                "w-full justify-between font-black h-11 px-4 text-left overflow-hidden bg-slate-900 border border-slate-800 rounded-xl text-xs text-white hover:bg-slate-850 hover:text-white transition-all",
                                !newRepuesto.id_producto && "text-slate-500"
                              )}
                            >
                              <span className="truncate">
                                {products.find(p => p.ID_Producto.toString() === newRepuesto.id_producto)?.Nombre || "Seleccionar producto..."}
                              </span>
                              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2 text-slate-400" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto bg-slate-950 border border-slate-800"
                            align="start"
                            onCloseAutoFocus={(e) => e.preventDefault()}
                          >
                            <div className="p-2 border-b border-slate-850 bg-slate-950">
                              <div className="flex items-center px-3 py-2 bg-slate-900 rounded-xl border border-slate-800">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" />
                                <input
                                  className="flex h-7 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-slate-500 text-white"
                                  placeholder="Buscar producto/repuesto..."
                                  value={search.product || ''}
                                  onChange={(e) => setSearch({ ...search, product: e.target.value })}
                                />
                              </div>
                            </div>
                            <div
                              className="max-h-[200px] overflow-y-auto p-1 bg-slate-950 custom-scrollbar"
                              onWheel={(e) => e.stopPropagation()}
                            >
                              {filteredProducts.length === 0 ? (
                                <div className="py-6 px-2 text-center">
                                  <p className="text-xs text-slate-500">No se encontraron productos.</p>
                                </div>
                              ) : (
                                filteredProducts.map((p: any) => (
                                  <div
                                    key={p.ID_Producto}
                                    className={cn(
                                      "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-xs outline-none transition-colors text-slate-300",
                                      "hover:bg-slate-900 hover:text-white",
                                      newRepuesto.id_producto === p.ID_Producto.toString() && "bg-blue-600/10 text-blue-400 font-bold"
                                    )}
                                    onClick={() => {
                                      handleProductSelect(p.ID_Producto.toString());
                                      setPopovers({ ...popovers, product: false });
                                      setSearch({ ...search, product: '' });
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4 text-blue-500", newRepuesto.id_producto === p.ID_Producto.toString() ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-col text-left">
                                      <span>{p.Nombre}</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2 text-left">
                        <Label className="text-[10px] font-black text-slate-500 uppercase">Proveedor</Label>
                        <Popover open={popovers.proveedor} onOpenChange={(open) => setPopovers({ ...popovers, proveedor: open })}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              type="button"
                              className={cn(
                                "w-full justify-between font-black h-11 px-4 text-left overflow-hidden bg-slate-900 border border-slate-800 rounded-xl text-xs text-white hover:bg-slate-850 hover:text-white transition-all",
                                !newRepuesto.id_proveedor && "text-slate-500",
                                touchedRepuesto.id_proveedor && repuestoErrors.id_proveedor && "border-red-500 focus:ring-red-500/20 bg-red-500/5"
                              )}
                              onFocus={() => setTouchedRepuesto((prev: any) => ({ ...prev, id_proveedor: true }))}
                            >
                              <span className="truncate">
                                {proveedores.find(p => (p.ID_Proveedor || p.id_proveedor || '').toString() === newRepuesto.id_proveedor)
                                  ? (proveedores.find(p => (p.ID_Proveedor || p.id_proveedor || '').toString() === newRepuesto.id_proveedor).nombreempresa ||
                                    proveedores.find(p => (p.ID_Proveedor || p.id_proveedor || '').toString() === newRepuesto.id_proveedor).NombreEmpresa ||
                                    proveedores.find(p => (p.ID_Proveedor || p.id_proveedor || '').toString() === newRepuesto.id_proveedor).nombre)
                                  : "Seleccionar proveedor..."}
                              </span>
                              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2 text-slate-400" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto bg-slate-950 border border-slate-800"
                            align="start"
                            onCloseAutoFocus={(e) => e.preventDefault()}
                          >
                            <div className="p-2 border-b border-slate-850 bg-slate-950">
                              <div className="flex items-center px-3 py-2 bg-slate-900 rounded-xl border border-slate-800">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" />
                                <input
                                  className="flex h-7 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-slate-500 text-white"
                                  placeholder="Buscar proveedor..."
                                  value={search.proveedor || ''}
                                  onChange={(e) => setSearch({ ...search, proveedor: e.target.value })}
                                />
                              </div>
                            </div>
                            <div
                              className="max-h-[200px] overflow-y-auto p-1 bg-slate-950 custom-scrollbar"
                              onWheel={(e) => e.stopPropagation()}
                            >
                              {filteredProveedores.length === 0 ? (
                                <div className="py-6 px-2 text-center">
                                  <p className="text-xs text-slate-500">No se encontraron proveedores.</p>
                                </div>
                              ) : (
                                filteredProveedores.map((prov: any) => (
                                  <div
                                    key={prov.ID_Proveedor || prov.id_proveedor}
                                    className={cn(
                                      "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-xs outline-none transition-colors text-slate-300",
                                      "hover:bg-slate-900 hover:text-white",
                                      newRepuesto.id_proveedor === (prov.ID_Proveedor || prov.id_proveedor || '').toString() && "bg-blue-600/10 text-blue-400 font-bold"
                                    )}
                                    onClick={() => {
                                      setNewRepuesto({ ...newRepuesto, id_proveedor: (prov.ID_Proveedor || prov.id_proveedor).toString() });
                                      setPopovers({ ...popovers, proveedor: false });
                                      setSearch({ ...search, proveedor: '' });
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4 text-blue-500", newRepuesto.id_proveedor === (prov.ID_Proveedor || prov.id_proveedor || '').toString() ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-col text-left">
                                      <span>{prov.nombreempresa || prov.NombreEmpresa || prov.nombre}</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                        {touchedRepuesto.id_proveedor && repuestoErrors.id_proveedor && (
                          <p className="text-[10px] font-bold text-red-500 mt-1">{repuestoErrors.id_proveedor}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-left">
                          <Label className="text-[10px] font-black text-slate-500 uppercase">Cantidad</Label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={newRepuesto.cantidad}
                            onKeyDown={handleNumberKeyDown}
                            onFocus={() => setTouchedRepuesto((prev: any) => ({ ...prev, cantidad: true }))}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2);
                              setNewRepuesto({ ...newRepuesto, cantidad: cleaned });
                            }}
                            className={cn(
                              "w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200",
                              touchedRepuesto.cantidad && repuestoErrors.cantidad && "border-red-500 focus:ring-red-500/20 bg-red-500/5"
                            )}
                          />
                          {touchedRepuesto.cantidad && repuestoErrors.cantidad && (
                            <p className="text-[10px] font-bold text-red-500 mt-1">{repuestoErrors.cantidad}</p>
                          )}
                        </div>
                        <div className="space-y-2 text-left">
                          <Label className="text-[10px] font-black text-slate-500 uppercase">Precio Unitario</Label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={newRepuesto.precio_unitario}
                            onKeyDown={handleNumberKeyDown}
                            onFocus={() => setTouchedRepuesto((prev: any) => ({ ...prev, precio_unitario: true }))}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/\D/g, '').slice(0, 7);
                              setNewRepuesto({ ...newRepuesto, precio_unitario: cleaned });
                            }}
                            className={cn(
                              "w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200",
                              touchedRepuesto.precio_unitario && repuestoErrors.precio_unitario && "border-red-500 focus:ring-red-500/20 bg-red-500/5"
                            )}
                          />
                          {touchedRepuesto.precio_unitario && repuestoErrors.precio_unitario && (
                            <p className="text-[10px] font-bold text-red-500 mt-1">{repuestoErrors.precio_unitario}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-black text-slate-500 uppercase">Observaciones (opcional)</Label>
                          <span className={cn(
                            "text-[9px] font-black tracking-wider uppercase",
                            (newRepuesto.observaciones?.length || 0) > 50 ? "text-red-500 animate-pulse" : "text-slate-500"
                          )}>
                            {newRepuesto.observaciones?.length || 0} / 50
                          </span>
                        </div>
                        <Textarea
                          value={newRepuesto.observaciones}
                          onChange={(e) => setNewRepuesto({ ...newRepuesto, observaciones: e.target.value.slice(0, 50) })}
                          placeholder="Razón de compra..."
                          maxLength={50}
                          className={cn(
                            "bg-slate-900 border-slate-800 rounded-xl text-xs resize-none h-16 text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200",
                            (newRepuesto.observaciones?.length || 0) > 50 && "border-red-500 focus:ring-red-500/20 bg-red-500/5"
                          )}
                        />
                        {repuestoErrors.observaciones && (
                          <p className="text-[10px] font-bold text-red-500 mt-1">{repuestoErrors.observaciones}</p>
                        )}
                      </div>
                      <div className="space-y-2 text-left">
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
                          <span className="text-lg font-black text-blue-500">${((Number(newRepuesto.cantidad) || 0) * (parseFloat(newRepuesto.precio_unitario) || 0)).toLocaleString()}</span>
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddRepuesto}
                          disabled={
                            isSubmittingRepuesto ||
                            !newRepuesto.id_producto ||
                            Object.keys(repuestoErrors).length > 0 ||
                            !newRepuesto.cantidad ||
                            !newRepuesto.precio_unitario ||
                            !newRepuesto.id_proveedor
                          }
                          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl disabled:opacity-50 transition-all duration-200"
                        >
                          {isSubmittingRepuesto ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar repuesto'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
