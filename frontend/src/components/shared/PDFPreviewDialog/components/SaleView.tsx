import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';
import { User, Wrench, FileText } from 'lucide-react';

export function SaleView({ data }: { data: any }) {
  // calculate values exactly like the modal
  const isFromRepair = !!(data?.ID_Reparacion || (data?.serviceOrderNumber && data?.serviceOrderNumber !== 'N/A'));
  const partsTotal = data?.parts ? data.parts.reduce((sum: number, p: any) => sum + (p.quantity * parseFloat(p.unitCost || 0)), 0) : 0;
  const serviceCost = parseFloat(data?.serviceCost || 0);
  const totalDb = parseFloat(data?.total || 0);

  let manoObra = 0;
  let grandTotal = totalDb;

  if (isFromRepair) {
    manoObra = Math.max(0, totalDb - partsTotal);
    grandTotal = partsTotal + manoObra + serviceCost;
  } else {
    manoObra = Math.max(0, totalDb - partsTotal - serviceCost);
    grandTotal = totalDb;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <PDFHeader 
        title="Factura de Venta" 
        documentNumber={data?.invoiceNumber} 
        date={data?.date} 
        dateLabel="Fecha de la Venta:"
        status={data?.anulada ? 'ANULADA' : 'COMPLETADA'} 
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
              {isFromRepair && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Reparación: #{data?.serviceOrderNumber}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Detalle de la Venta</p>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="py-2 px-3 font-bold text-slate-600 dark:text-slate-400">Ítem</th>
                <th className="py-2 px-3 font-bold text-slate-600 dark:text-slate-400 text-center">Cant.</th>
                <th className="py-2 px-3 font-bold text-slate-600 dark:text-slate-400 text-right">Precio Unit.</th>
                <th className="py-2 px-3 font-bold text-slate-600 dark:text-slate-400 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {/* Servicios */}
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/50">
                <td colSpan={4} className="py-1.5 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Servicios</td>
              </tr>
              {data?.servicios && data.servicios.length > 0 ? (
                data.servicios.map((s: any, i: number) => (
                  <tr key={`service-${i}`} className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">{s.NombreServicio || s.Nombre}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-600 dark:text-slate-400">1</td>
                    <td className="py-2 px-3 text-right text-slate-500 dark:text-slate-500">${parseFloat(s.CostoServicios || 0).toLocaleString('es-CO')}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-600 dark:text-blue-400">${parseFloat(s.CostoServicios || 0).toLocaleString('es-CO')}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-2 text-center text-[10px] text-slate-400 dark:text-slate-600 italic">No se realizaron servicios.</td></tr>
              )}

              {/* Repuestos */}
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/50">
                <td colSpan={4} className="py-1.5 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Repuestos</td>
              </tr>
              {data?.parts && data.parts.length > 0 ? (
                data.parts.map((p: any, i: number) => (
                  <tr key={`part-${i}`} className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">{p.product}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-600 dark:text-slate-400">{p.quantity}</td>
                    <td className="py-2 px-3 text-right text-slate-500 dark:text-slate-500">${parseFloat(p.unitCost || 0).toLocaleString('es-CO')}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-600 dark:text-blue-400">${(p.quantity * parseFloat(p.unitCost || 0)).toLocaleString('es-CO')}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-2 text-center text-[10px] text-slate-400 dark:text-slate-600 italic">No se agregaron repuestos.</td></tr>
              )}

              {/* Mano de Obra */}
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/50">
                <td colSpan={4} className="py-1.5 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Mano de Obra</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Mano de Obra de Reparación</td>
                <td className="py-2 px-3 text-center font-bold text-slate-600 dark:text-slate-400">1</td>
                <td className="py-2 px-3 text-right text-slate-400 dark:text-slate-600">---</td>
                <td className="py-2 px-3 text-right font-bold text-blue-600 dark:text-blue-400">${manoObra.toLocaleString('es-CO')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {data?.notes ? (
        <div className="mb-6 w-full text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Observaciones
          </p>
          <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
            {data.notes}
          </p>
        </div>
      ) : null}
      
      <div className="flex justify-center mb-6">
        <div className="w-64 p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20 dark:shadow-none text-white flex flex-col items-center justify-center">
          <span className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-80 mb-1">Total Facturado</span>
          <span className="text-2xl font-black">${grandTotal.toLocaleString('es-CO')}</span>
        </div>
      </div>

      <div className="flex-grow"></div>
      <PDFFooter />
    </div>
  );
}
