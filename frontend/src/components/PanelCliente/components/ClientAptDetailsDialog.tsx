import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { ClipboardPen, Wrench, FileText, Info, Calendar, Clock, Phone, FileImage, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function FacturaImage({ src }: { src: string }) {
  const [imgLoading, setImgLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  return (
    <>
      {imgLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl z-10">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        </div>
      )}
      {!hasError ? (
        <img
          src={src}
          alt="Factura"
          onLoad={() => setImgLoading(false)}
          onError={() => {
            setImgLoading(false);
            setHasError(true);
          }}
          className={cn(
            "w-full h-full object-cover transition-all duration-500 group-hover/img:scale-110",
            imgLoading ? "opacity-0" : "opacity-100"
          )}
        />
      ) : (
        <div className="fallback-icon flex w-full h-full items-center justify-center text-blue-500">
          <FileImage className="w-5 h-5" />
        </div>
      )}
    </>
  );
}

interface ClientAptDetailsDialogProps {
  apt: any;
  linkedReparacion: any;
  availableServices: any[];
  mechanics?: any[];
  onClose: () => void;
  onDelete?: (apt: any) => void;
}

export function ClientAptDetailsDialog({
  apt,
  linkedReparacion,
  availableServices = [],
  mechanics = [],
  onClose,
  onDelete
}: ClientAptDetailsDialogProps) {
  const [cachedReparacion, setCachedReparacion] = React.useState<any>(null);

  const resolvedReparacion = React.useMemo(() => {
    const data = linkedReparacion || cachedReparacion;
    if (data) {
      return {
        ...data,
        mecanico: data.mecanico || data.Mecanico || 'No asignado',
        mecanicoDocumento: data.mecanicoDocumento || data.MecanicoDocumento || '',
        mecanicoTelefono: data.mecanicoTelefono || data.MecanicoTelefono || '',
        diaAgendamiento: data.diaAgendamiento || data.DiaAgendamiento || '',
        horaInicio: data.horaInicio || data.HoraInicio || '',
        estadoBase: data.estadoBase || data.Estado || 'Confirmado',
        motorcyclePlate: data.motorcyclePlate || data.Placa || '',
        motorcycleBrand: data.motorcycleBrand || data.Marca || '',
        motorcycleModel: data.motorcycleModel || data.Modelo || '',
        motorcycleYear: data.motorcycleYear || data.Anio || '',
        clientName: data.clientName || data.NombreCliente || '',
        clientDocument: data.clientDocument || data.DocumentoCliente || '',
        clientPhone: data.clientPhone || data.TelefonoCliente || '',
        observations: data.observations || data.Observaciones || '',
        servicios: data.servicios || [],
        compras: data.compras || []
      };
    }
    if (!apt) return null;

    return {
      ID_Reparacion: null,
      diaAgendamiento: apt.fecha || apt.date,
      horaInicio: apt.startTime,
      estadoBase: apt.status || 'Confirmado',
      motorcyclePlate: apt.motoPlate || apt.motorcyclePlate,
      motorcycleBrand: apt.motoBrand || apt.motorcycleBrand || '',
      motorcycleModel: apt.motoModel || apt.motorcycleModel || '',
      motorcycleYear: apt.motoYear || apt.motorcycleYear || '',
      clientName: apt.clientName || '',
      clientDocument: apt.clientDocument || '',
      clientPhone: apt.clientPhone || '',
      mecanico: apt.mechanicName || '',
      mecanicoDocumento: '',
      mecanicoTelefono: '',
      observations: apt.notes || '',
      servicios: (apt.serviceTypes || []).map((srvName: string, idx: number) => {
        const matched = availableServices.find((s: any) => (s.Nombre || s.nombre) === srvName);
        return {
          ID_Servicio: matched ? matched.ID_Servicio : idx,
          NombreServicio: srvName,
          Estado: 'Pendiente',
          FechaFinalizacion: null
        };
      }),
      compras: []
    };
  }, [linkedReparacion, cachedReparacion, apt, availableServices]);

  React.useEffect(() => {
    if (linkedReparacion) {
      setCachedReparacion(linkedReparacion);
    } else {
      const timer = setTimeout(() => {
        setCachedReparacion(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [linkedReparacion]);

  const data = resolvedReparacion;
  if (!data) return null;

  const isSaleCompleted = !!(data.associatedSaleId || data.AssociatedSaleId);
  const displayStatus = (data.estadoBase === 'Reparación finalizada' && !isSaleCompleted)
    ? 'Reparación finalizada - Pendiente de facturación'
    : data.estadoBase;

  const isCancelable = onDelete && [
    'esperando motocicleta',
    'confirmado'
  ].includes((data.estadoBase || '').toLowerCase());

  const mappedServices = (data.servicios || []).map((s: any) => {
    const catalog = availableServices.find((cs: any) => cs.ID_Servicio === s.ID_Servicio || cs.id_servicio === s.ID_Servicio);
    return {
      ...s,
      Precio: catalog ? Number(catalog.Precio || catalog.precio) : 0,
      Duracion: catalog ? Number(catalog.Duracion || catalog.duracion) : 0
    };
  });

  const totalServices = mappedServices.reduce((acc: number, cur: any) => acc + (cur.Precio || 0), 0);
  const totalPurchases = (data.compras || []).reduce((acc: number, cur: any) => acc + Number(cur.Subtotal || 0), 0);
  const associatedSaleTotal = (data.associatedSaleTotal !== undefined && data.associatedSaleTotal !== null)
    ? Number(data.associatedSaleTotal)
    : (data.AssociatedSaleTotal !== undefined && data.AssociatedSaleTotal !== null)
      ? Number(data.AssociatedSaleTotal)
      : null;
  const manoObra = (isSaleCompleted && associatedSaleTotal !== null)
    ? Math.max(0, associatedSaleTotal - totalPurchases)
    : 0;
  const grandTotal = totalServices + totalPurchases + manoObra;

  const matchedMechanic = mechanics.find((m: any) => {
    if (m.ID_Empleado && apt?.mechanicId && Number(m.ID_Empleado) === Number(apt.mechanicId)) {
      return true;
    }
    const fullName = `${m.Nombre || m.nombre || ''} ${m.Apellido || m.apellido || ''}`.trim();
    return fullName.toLowerCase() === (data.mecanico || '').toLowerCase();
  });
  const resolvedMecanicoDoc = matchedMechanic ? (matchedMechanic.Documento || matchedMechanic.documento) : data.mecanicoDocumento;
  const resolvedMecanicoPhone = matchedMechanic ? (matchedMechanic.Telefono || matchedMechanic.telefono) : data.mecanicoTelefono;

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

  const formatCompletionTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return '';
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    } catch {
      return '';
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    let bg = 'bg-slate-100 text-slate-800 dark:bg-slate-900/60 dark:text-slate-400';
    if (s.includes('pendiente') || s.includes('esperando')) {
      bg = 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400';
    } else if (s.includes('progreso') || s.includes('reparando')) {
      bg = 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400';
    } else if (s.includes('finalizado') || s.includes('terminado') || s.includes('entregado')) {
      bg = 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400';
    } else if (s.includes('anulado') || s.includes('cancelado')) {
      bg = 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400';
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${bg}`}>
        {status || 'Confirmado'}
      </span>
    );
  };

  return (
    <DialogContent
      className="sm:max-w-5xl w-[95vw] h-[85vh] max-h-[800px] animate-modal p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl rounded-2xl flex flex-col"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
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
                  Detalles del Agendamiento
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>Agendada para el {formattedDate} a las {formattedTime}</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1.5">
                  <span>Estado actual:</span>
                  {getStatusBadge(displayStatus)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6 lg:border-r lg:border-slate-100 lg:dark:border-slate-800/80 lg:pr-8">
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-white py-3.5 px-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center gap-1.5 transition-transform duration-300 hover:scale-[1.02]">
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Datos de la motocicleta</span>
              <span className="text-3xl font-extrabold tracking-widest uppercase font-mono px-4 py-1 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
                {data.motorcyclePlate}
              </span>
              <div className="text-[9px] font-black tracking-[0.2em] text-slate-600 dark:text-slate-400 uppercase mt-0.5 text-center">
                {data.motorcycleBrand} {data.motorcycleModel} · {data.motorcycleYear}
              </div>
            </div>

            <div className="space-y-3.5 text-left">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Datos generales</Label>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 space-y-5">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mecánico Asignado</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                      <Wrench className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate leading-none">{data.mecanico || 'Sin asignar'}</p>
                      <p className="text-[11px] text-slate-400 font-bold mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>CC · {resolvedMecanicoDoc || '---'}</span>
                        {resolvedMecanicoPhone && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="flex items-center gap-1.5 font-bold">
                              <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                              <span>{resolvedMecanicoPhone}</span>
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/60" />

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Programación</p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4.5 h-4.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4.5 h-4.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formattedTime || '---'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 text-left">
                <Wrench className="w-3.5 h-3.5 text-blue-600" /> Servicios Requeridos ({mappedServices.length})
              </Label>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {mappedServices.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-left">No se han registrado servicios.</p>
                ) : (
                  mappedServices.map((s: any) => (
                    <div key={s.ID_Servicio || s.NombreServicio || s.Nombre} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/60">
                      <div className="flex items-center gap-3">
                        {s.Estado !== 'Finalizado' && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{s.NombreServicio || s.Nombre}</p>
                          <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span>{s.Duracion || 0} min</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(s.Precio || 0)}
                        </p>
                        <span className={cn(
                          "inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mt-1.5",
                          s.Estado === 'Finalizado'
                            ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                            : s.Estado === 'En progreso'
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
                        )}>
                          {s.Estado === 'Finalizado'
                            ? s.FechaFinalizacion
                              ? `Finalizado a las ${formatCompletionTime(s.FechaFinalizacion)}`
                              : 'Finalizado'
                            : (s.Estado || 'Pendiente')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 text-left">
                <FileText className="w-3.5 h-3.5 text-indigo-600" /> Repuestos ({data.compras?.length || 0})
              </Label>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                {!data.compras || data.compras.length === 0 ? (
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center py-6">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No se agregaron repuestos</p>
                  </div>
                ) : (
                  data.compras.map((c: any) => (
                    <div
                      key={c.ID_Reparacion_Compra}
                      className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl transition-all duration-300 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {c.Factura ? (
                          <a
                            href={c.Factura}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 transition-transform duration-300 hover:scale-105 active:scale-95 group/img"
                            title="Ver factura de compra"
                          >
                            <FacturaImage src={c.Factura} />
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                          </a>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center text-slate-400 dark:text-slate-600 shrink-0 border border-slate-200/50 dark:border-slate-800/50">
                            <Wrench className="w-5 h-5" />
                          </div>
                        )}

                        <div className="text-left min-w-0">
                          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate leading-snug">
                            {c.NombreProducto || c.Nombre || 'Repuesto'}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
                            {c.Cantidad} {c.Cantidad === 1 ? 'unidad' : 'unidades'} x{' '}
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(c.PrecioUnitario || 0)}
                          </p>
                          {c.Observaciones && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium italic mt-1 leading-relaxed truncate max-w-[280px]">
                              "{c.Observaciones}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800/60 shrink-0">
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest md:hidden">Subtotal</span>
                        <div className="text-right">
                          <p className="text-base font-black text-indigo-600 dark:text-indigo-400">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(c.Subtotal || 0)}
                          </p>
                          {c.Factura && (
                            <a
                              href={c.Factura}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[9px] font-black text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-widest mt-1.5 transition-colors"
                            >
                              <FileImage className="w-3.5 h-3.5" />
                              <span>Ver Factura</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 shadow-sm text-left">
              <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto text-left justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Servicios</span>
                  <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalServices)}
                  </p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800" />
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Mano de obra</span>
                  <p className={cn("text-sm font-black", isSaleCompleted ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 italic")}>
                    {isSaleCompleted
                      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(manoObra)
                      : "Por calcular"}
                  </p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800" />
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Repuestos</span>
                  <p className={cn("text-sm font-black", totalPurchases === 0 ? "text-slate-500 dark:text-slate-400 italic" : "text-indigo-600 dark:text-indigo-400")}>
                    {totalPurchases === 0 
                      ? (isSaleCompleted || data.estadoBase === 'Reparación finalizada' || data.estadoBase === 'Anulada' ? "No requeridos" : "Por calcular")
                      : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalPurchases)}
                  </p>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Total de la Reparación</span>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(grandTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-left pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Observaciones Generales</Label>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/80">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
              {data.observations ? `${data.observations}` : 'Sin observaciones registradas'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex justify-end gap-3">
        {isCancelable && (
          <Button
            variant="destructive"
            onClick={() => onDelete(apt)}
            className="h-11 px-6 font-bold rounded-xl shadow-lg transition-transform active:scale-95 bg-red-600 hover:bg-red-700 text-white"
          >
            Cancelar Agendamiento
          </Button>
        )}
        <Button
          onClick={onClose}
          className="h-11 px-8 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
        >
          Cerrar detalles
        </Button>
      </div>
    </DialogContent>
  );
}
