import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';
import { ShoppingBag, Truck, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function PurchaseView({ data }: { data: any }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <PDFHeader 
        title="Orden de Compra" 
        documentNumber={data?.invoiceNumber} 
        date={data?.date} 
        dateLabel="Fecha de la Compra:"
        status={data?.status} 
        anulada={data?.status === 'Anulada' || data?.status === 'Anulado'}
      />

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Proveedor</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{data?.supplier}</p>
              {data?.supplierPhone && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Tel: {data.supplierPhone}</p>}
              {data?.supplierEmail && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Email: {data.supplierEmail}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      {data?.items && data.items.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Detalle de Productos</p>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2 px-3 font-bold text-slate-600 dark:text-slate-400">Producto</th>
                  <th className="py-2 px-3 font-bold text-slate-600 dark:text-slate-400">Categoría</th>
                  <th className="py-2 px-3 font-bold text-slate-600 dark:text-slate-400 text-center">Cant.</th>
                  <th className="py-2 px-3 font-bold text-slate-600 dark:text-slate-400 text-right">V. Unit.</th>
                  <th className="py-2 px-3 font-bold text-slate-600 dark:text-slate-400 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">{item.productName || item.product}</td>
                    <td className="py-2 px-3 font-medium text-slate-500 dark:text-slate-400">{item.categoryName || item.category}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-600 dark:text-slate-300">{item.quantity}</td>
                    <td className="py-2 px-3 text-right text-slate-500 dark:text-slate-400">${Number(item.unitPrice || item.unitCost || 0).toLocaleString('es-CO')}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-600 dark:text-blue-400">${Number(item.total || 0).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
          <span className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-80 mb-1">Total a Pagar</span>
          <span className="text-2xl font-black">${Number(data?.total || 0).toLocaleString('es-CO')}</span>
        </div>
      </div>

      <div className="flex-grow"></div>
      <PDFFooter />
    </div>
  );
}
