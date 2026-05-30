import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';
import { User, Wrench, FileText, Wrench as MechanicIcon, Clock } from 'lucide-react';

export function ServiceOrderView({ data }: { data: any }) {
  const statusText = data?.estadoBase || (data?.anulada ? 'Anulada' : data?.associatedSaleId ? 'Reparación finalizada' : 'En Proceso');

  const servicesTotal = data?.servicios ? data.servicios.reduce((sum: number, s: any) => sum + Number(s.Precio || s.CostoServicios || 0), 0) : 0;
  const partsTotal = data?.compras ? data.compras.reduce((sum: number, p: any) => sum + Number(p.Subtotal || p.subtotal || p.SubTotal || p.Precio || 0), 0) : 0;
  
  const associatedSaleTotal = data?.associatedSaleTotal !== null && data?.associatedSaleTotal !== undefined ? parseFloat(data.associatedSaleTotal) : null;
  const manoObra = associatedSaleTotal !== null ? Math.max(0, associatedSaleTotal - partsTotal) : 0;
  
  // Si la reparación ya está finalizada y asociada a una venta, el gran total es lo que se pagó. 
  // De lo contrario, es el costo estimado actual.
  const grandTotal = associatedSaleTotal !== null ? associatedSaleTotal : (servicesTotal + partsTotal);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <PDFHeader 
        title="Orden de Reparación" 
        documentNumber={data?.orderNumber} 
        date={data?.diaAgendamiento || data?.date} 
        dateLabel="Fecha de la Reparación:"
        status={statusText} 
        anulada={data?.anulada}
      />

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Cliente</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{data?.clientName}</p>
              {data?.clientDocument && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Doc: {data.clientDocument}</p>}
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{data?.clientPhone}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Motocicleta</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{data?.motorcycleBrand} {data?.motorcycleModel}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Placa: <span className="font-bold text-slate-700 dark:text-slate-300">{data?.motorcyclePlate}</span></p>
              {data?.motorcycleYear && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Año: {data.motorcycleYear}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <MechanicIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Mecánico Asignado</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{data?.mecanico || 'No asignado'}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Horario de Ingreso</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{data?.horaInicio ? `${data.horaInicio} hrs` : 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Servicios y Repuestos</p>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2 px-3 font-bold text-slate-600 dark:text-slate-400">Descripción</th>
                <th className="py-2 px-3 font-bold text-slate-600 dark:text-slate-400 text-right">Costo Estimado</th>
              </tr>
            </thead>
            <tbody>
              {/* Servicios */}
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/50">
                <td colSpan={2} className="py-1.5 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Servicios a Realizar</td>
              </tr>
              {data?.servicios && data.servicios.length > 0 ? (
                data.servicios.map((s: any, i: number) => (
                  <tr key={`service-${i}`} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300 before:content-['•'] before:mr-2 before:text-blue-500">{s.NombreServicio || s.Nombre || s.servicio}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-600 dark:text-blue-400">${Number(s.Precio || s.CostoServicios || 0).toLocaleString('es-CO')}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={2} className="py-2 px-3 text-[10px] text-slate-400 dark:text-slate-600 italic">No hay servicios registrados.</td></tr>
              )}

              {/* Repuestos */}
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/50">
                <td colSpan={2} className="py-1.5 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Repuestos Necesarios</td>
              </tr>
              {data?.compras && data.compras.length > 0 ? (
                data.compras.map((p: any, i: number) => (
                  <tr key={`part-${i}`} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300 before:content-['•'] before:mr-2 before:text-blue-500">{p.NombreProducto || p.Producto || p.product || 'Repuesto'}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-600 dark:text-blue-400">${Number(p.Subtotal || p.subtotal || p.SubTotal || p.Precio || 0).toLocaleString('es-CO')}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={2} className="py-2 px-3 text-[10px] text-slate-400 dark:text-slate-600 italic">No hay repuestos registrados.</td></tr>
              )}
              {/* Mano de Obra */}
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/50">
                <td colSpan={2} className="py-1.5 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Mano de Obra Adicional</td>
              </tr>
              <tr className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300 before:content-['•'] before:mr-2 before:text-blue-500">Mano de Obra</td>
                <td className="py-2 px-3 text-right font-bold text-blue-600 dark:text-blue-400">${manoObra.toLocaleString('es-CO')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {data?.observations || data?.description ? (
        <div className="mb-6 w-full text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Observaciones y Diagnóstico
          </p>
          <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 w-full min-h-[60px]">
            {data.observations || data.description}
          </p>
        </div>
      ) : null}
      
      <div className="flex justify-center mb-6">
        <div className="w-64 p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20 dark:shadow-none text-white flex flex-col items-center justify-center shrink-0">
          <span className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-80 mb-1">{associatedSaleTotal !== null ? 'Total Reparación' : 'Total Estimado'}</span>
          <span className="text-2xl font-black">${grandTotal.toLocaleString('es-CO')}</span>
        </div>
      </div>

      <div className="flex-grow"></div>
      <PDFFooter />
    </div>
  );
}
