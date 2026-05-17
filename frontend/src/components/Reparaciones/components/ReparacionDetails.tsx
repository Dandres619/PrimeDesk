import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { ClipboardPen, Wrench, User, FileText, Info, Calendar, Clock, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReparacionDetailsProps {
  reparacion: any;
  availableServices: any[];
  mechanics?: any[];
  getStatusBadge: (status: string) => React.ReactNode;
  onClose: () => void;
}

export function ReparacionDetails({ reparacion, availableServices = [], mechanics = [], getStatusBadge, onClose }: ReparacionDetailsProps) {
  const [cachedReparacion, setCachedReparacion] = React.useState<any>(null);

  React.useEffect(() => {
    if (reparacion) {
      setCachedReparacion(reparacion);
    } else {
      const timer = setTimeout(() => {
        setCachedReparacion(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [reparacion]);

  const data = reparacion || cachedReparacion;
  if (!data) return null;

  const mappedServices = (data.servicios || []).map((s: any) => {
    const catalog = availableServices.find((cs: any) => cs.ID_Servicio === s.ID_Servicio || cs.id_servicio === s.ID_Servicio);
    return {
      ...s,
      Precio: catalog ? Number(catalog.Precio) : 0,
      Duracion: catalog ? Number(catalog.Duracion) : 0
    };
  });

  const totalServices = mappedServices.reduce((acc: number, cur: any) => acc + (cur.Precio || 0), 0);
  const totalPurchases = (data.compras || []).reduce((acc: number, cur: any) => acc + Number(cur.Subtotal || 0), 0);
  const grandTotal = totalServices + totalPurchases;

  // Resolve mechanic document by cross-referencing name or using direct db field
  const matchedMechanic = mechanics.find((m: any) => {
    const fullName = `${m.Nombre || m.nombre || ''} ${m.Apellido || m.apellido || ''}`.trim();
    return fullName.toLowerCase() === (data.mecanico || '').toLowerCase();
  });
  const resolvedMecanicoDoc = matchedMechanic ? (matchedMechanic.Documento || matchedMechanic.documento) : data.mecanicoDocumento;
  const resolvedMecanicoPhone = matchedMechanic ? (matchedMechanic.Telefono || matchedMechanic.telefono) : data.mecanicoTelefono;

  // Format date using simple custom JS splitting (safer than external library)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Registro directo (Hoy)';
    try {
      const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const [year, month, day] = cleanDate.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };
  const formattedDate = formatDate(data.diaAgendamiento);

  // Format time in 12-hour AM/PM format
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hourNum = parseInt(hours, 10);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };
  const formattedTime = formatTime(data.horaInicio);

  return (
    <DialogContent
      className="sm:max-w-5xl w-[95vw] h-[85vh] max-h-[800px] animate-modal p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl rounded-2xl flex flex-col"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      {/* Header Banner (Sticky) */}
      <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-20 -mt-20 rounded-full" />
        <div className="relative z-10 flex flex-col gap-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0 transition-transform hover:scale-105">
              <ClipboardPen className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Detalles de la reparación
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>Recibida el {formattedDate} a las {formattedTime}</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1.5">
                  <span>Estado actual:</span>
                  {getStatusBadge(data.estadoBase)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Central content - two columns layout (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: VEHICLE & OPERATIVE INFO */}
          <div className="lg:col-span-5 space-y-6 lg:border-r lg:border-slate-100 lg:dark:border-slate-800/80 lg:pr-8">

            {/* Colombian Plate Styled Banner */}
            <div className="relative bg-gradient-to-b from-yellow-300 to-yellow-400 dark:from-yellow-400 dark:to-yellow-500 text-slate-950 p-6 rounded-2xl border border-slate-950/20 shadow-lg flex flex-col items-center justify-center gap-2 transition-transform duration-300 hover:scale-[1.02]">
              <div className="absolute top-2 left-0 right-0 text-center text-[7px] font-black tracking-[0.2em] text-slate-800 uppercase">REPUBLICA DE COLOMBIA</div>
              <span className="text-4xl font-extrabold tracking-widest uppercase font-mono px-5 py-1.5 bg-white/40 dark:bg-white/20 rounded-xl border border-slate-950/20">
                {data.motorcyclePlate}
              </span>
              <div className="text-[10px] font-black tracking-[0.2em] text-slate-950 uppercase mt-0.5 text-center">
                {data.motorcycleBrand} {data.motorcycleModel} · {data.motorcycleYear}
              </div>
            </div>

            {/* Client Info Card */}
            <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block text-left">Cliente Responsable</Label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{data.clientName}</p>
                  <p className="text-xs text-slate-400 font-medium">CC · {data.clientDocument}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{data.clientPhone || 'Sin teléfono'}</span>
                </span>
              </div>
            </div>

            {/* Mechanic & Date Card */}
            <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block text-left">Mecánico Asignado</Label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{data.mecanico}</p>
                  <p className="text-xs text-slate-400 font-medium">CC · {resolvedMecanicoDoc || 'Sin documento'}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{resolvedMecanicoPhone || 'Sin teléfono'}</span>
                </span>
              </div>
            </div>

            {/* State Notes */}
            {data.notaEstado && (
              <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-left flex items-start gap-2.5">
                <Info className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Nota de Estado</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">{data.notaEstado}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: SERVICES, PARTS & FINANCE */}
          <div className="lg:col-span-7 space-y-6">

            {/* Services List */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 text-left">
                <Wrench className="w-3.5 h-3.5 text-blue-600" /> Servicios Requeridos ({mappedServices.length})
              </Label>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {mappedServices.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-left">No se han registrado servicios.</p>
                ) : (
                  mappedServices.map((s: any) => (
                    <div key={s.ID_Servicio || s.NombreServicio} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/60">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{s.NombreServicio || s.Nombre}</p>
                          <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span>{s.Duracion || 0} min</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(s.Precio || 0)}
                        </p>
                        <span className={cn(
                          "inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1",
                          s.Estado === 'Finalizado'
                            ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                            : s.Estado === 'En progreso'
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
                        )}>
                          {s.Estado || 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Purchases / Repuestos List */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 text-left">
                <FileText className="w-3.5 h-3.5 text-indigo-600" /> Repuestos y Materiales ({data.compras?.length || 0})
              </Label>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                {!data.compras || data.compras.length === 0 ? (
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center py-6">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No se han registrado repuestos</p>
                  </div>
                ) : (
                  data.compras.map((c: any) => (
                    <div key={c.ID_Reparacion_Compra} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{c.NombreProducto || c.Nombre || 'Repuesto'}</p>
                        <p className="text-xs text-slate-400 font-medium">Cant: {c.Cantidad} · Unit: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(c.PrecioUnitario || 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(c.Subtotal || 0)}
                        </p>
                        {c.Factura && (
                          <span className="inline-block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fac. #{c.Factura}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-900 dark:bg-slate-900 text-white rounded-2xl border border-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 shadow-lg shadow-blue-500/5 text-left">
              <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto text-left justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Servicios</span>
                  <p className="text-sm font-black text-slate-200">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalServices)}
                  </p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-slate-800" />
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Repuestos (Materiales)</span>
                  <p className="text-sm font-black text-indigo-200">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalPurchases)}
                  </p>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400">Total Orden de Reparación</span>
                <p className="text-2xl font-black text-blue-400 tracking-tight">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(grandTotal)}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* General Observations */}
        <div className="space-y-2 text-left pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Observaciones Generales</Label>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/80">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
              {data.observations ? `${data.observations}` : 'Sin observaciones registradas'}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex justify-end">
        <Button
          onClick={onClose}
          className="h-11 px-8 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
        >
          Cerrar Vista
        </Button>
      </div>
    </DialogContent>
  );
}
