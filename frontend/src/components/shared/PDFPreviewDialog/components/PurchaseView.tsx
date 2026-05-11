import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';
import { SectionTitle, InfoGrid } from './PDFSections';

export function PurchaseView({ data }: { data: any }) {
  return (
    <div className="flex flex-col h-full">
      <PDFHeader title="Orden de Compra" documentNumber={data?.invoiceNumber} date={data?.date} status={data?.status} />
      <InfoGrid>
        <div className="text-left">
          <SectionTitle>Datos del Proveedor</SectionTitle>
          <p className="font-semibold text-slate-800 text-[11px] mb-0.5">{data?.supplier}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Contacto:</span> {data?.supplierContact}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Tel:</span> {data?.supplierPhone}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Email:</span> {data?.supplierEmail}</p>
        </div>
      </InfoGrid>

      {data?.items && data.items.length > 0 && (
        <div className="mb-4">
          <SectionTitle>Detalle de Productos</SectionTitle>
          <table className="w-full text-[10px] mt-2 border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-700 bg-slate-50">
                <th className="py-1.5 px-2 text-left font-semibold">Producto</th>
                <th className="py-1.5 px-2 text-left font-semibold">Categoría</th>
                <th className="py-1.5 px-2 text-center font-semibold">Cant.</th>
                <th className="py-1.5 px-2 text-right font-semibold">V. Unit.</th>
                <th className="py-1.5 px-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item: any, i: number) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-1.5 px-2 text-slate-800 text-left">{item.productName || item.product}</td>
                  <td className="py-1.5 px-2 text-slate-600 text-left">{item.categoryName || item.category}</td>
                  <td className="py-1.5 px-2 text-center text-slate-800">{item.quantity}</td>
                  <td className="py-1.5 px-2 text-right text-slate-600">${Number(item.unitPrice || item.unitCost || 0).toLocaleString('es-CO')}</td>
                  <td className="py-1.5 px-2 text-right font-medium text-slate-900">${Number(item.total || 0).toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <div className="w-56">
          <div className="flex justify-between py-1 text-[10px] text-slate-600"><span>Subtotal:</span><span>${Number(data?.subtotal || 0).toLocaleString('es-CO')}</span></div>
          <div className="flex justify-between py-1.5 text-[12px] font-bold border-t border-slate-300 mt-1 text-slate-900"><span>TOTAL A PAGAR:</span><span>${Number(data?.total || 0).toLocaleString('es-CO')}</span></div>
        </div>
      </div>

      {data?.notes && (
        <div className="mb-4">
          <SectionTitle>Observaciones</SectionTitle>
          <p className="text-[10px] text-slate-700 bg-slate-50 p-2.5 rounded-sm border border-slate-100 text-left">{data.notes}</p>
        </div>
      )}

      <div className="flex-grow"></div>
      <PDFFooter />
    </div>
  );
}
