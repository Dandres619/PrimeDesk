import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';
import { SectionTitle, InfoGrid } from './PDFSections';

export function SaleView({ data }: { data: any }) {
  return (
    <div className="flex flex-col h-full">
      <PDFHeader title="Factura de Venta" documentNumber={data?.invoiceNumber} date={data?.date} status={data?.anulada ? 'ANULADA' : 'COMPLETADA'} />
      <InfoGrid>
        <div className="text-left">
          <SectionTitle>Datos del Cliente</SectionTitle>
          <p className="font-semibold text-slate-800 text-[11px] mb-0.5">{data?.clientName}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Doc:</span> {data?.clientDocument || 'N/A'}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Tel:</span> {data?.clientPhone}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Dir:</span> {data?.clientAddress || 'N/A'}</p>
        </div>
        <div className="text-left">
          <SectionTitle>Motocicleta & Referencia</SectionTitle>
          <p className="font-semibold text-slate-800 text-[11px] mb-0.5">{data?.motorcycleBrand} {data?.motorcycleModel}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Placa:</span> <span className="font-semibold text-slate-800">{data?.motorcyclePlate}</span></p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Año:</span> {data?.motorcycleYear}</p>
          {data?.serviceOrderNumber && <p className="text-[10px] text-slate-600 mt-0.5"><span className="font-medium">Ref Reparación:</span> <span className="font-semibold text-slate-800">{data.serviceOrderNumber}</span></p>}
        </div>
      </InfoGrid>

      {data?.parts && data.parts.length > 0 && (
        <div className="mb-4">
          <SectionTitle>Repuestos Utilizados</SectionTitle>
          <table className="w-full text-[10px] mt-2 border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-700 bg-slate-50">
                <th className="py-1.5 px-2 text-left font-semibold">Producto</th>
                <th className="py-1.5 px-2 text-center font-semibold">Cant.</th>
                <th className="py-1.5 px-2 text-right font-semibold">V. Unit.</th>
                <th className="py-1.5 px-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.parts.map((part: any, i: number) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-1.5 px-2 text-slate-800 text-left">{part.product}</td>
                  <td className="py-1.5 px-2 text-center text-slate-800">{part.quantity}</td>
                  <td className="py-1.5 px-2 text-right text-slate-600">${Number(part.unitCost || 0).toLocaleString('es-CO')}</td>
                  <td className="py-1.5 px-2 text-right font-medium text-slate-900">${Number(part.quantity * (part.unitCost || 0)).toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.serviceTypes && data.serviceTypes.length > 0 && (
        <div className="mb-4">
          <SectionTitle>Servicios Realizados</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2">
            {data.serviceTypes.map((svc: string, i: number) => (
              <div key={i} className="text-[10px] text-slate-700 flex items-center before:content-['•'] before:mr-2 before:text-slate-400 text-left">{svc}</div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <div className="w-64">
          <div className="flex justify-between py-1 text-[10px] text-slate-600"><span>Subtotal Repuestos:</span><span>${Number(data?.partsCost || data?.parts?.reduce((sum: number, p: any) => sum + (p.total || 0), 0) || 0).toLocaleString('es-CO')}</span></div>
          <div className="flex justify-between py-1 text-[10px] text-slate-600"><span>Costo Servicios:</span><span>${Number(data?.serviceCost || 0).toLocaleString('es-CO')}</span></div>
          <div className="flex justify-between py-1.5 text-[12px] font-bold border-t border-slate-300 mt-1 text-slate-900"><span>TOTAL:</span><span>${Number(data?.total || 0).toLocaleString('es-CO')}</span></div>
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
