import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  type: 'purchase' | 'sale' | 'supplier' | 'client' | 'appointment' | 'service-order' | 'general';
  onGenerate: () => void;
}

export function PDFPreviewDialog({
  open,
  onOpenChange,
  data,
  type,
  onGenerate
}: PDFPreviewDialogProps) {

  const handleGenerate = async () => {
    const wrapper = document.getElementById('pdf-content-wrapper');
    const element = wrapper?.firstElementChild as HTMLElement;
    if (!element) return;

    let customFilename = `RafaMotos_${type}_${Date.now()}.pdf`;
    if (type === 'purchase') customFilename = `Compras_RafaMotos_${data?.invoiceNumber || 'SinNumero'}.pdf`;
    else if (type === 'service-order') customFilename = `Reparaciones_RafaMotos_${data?.orderNumber || 'SinNumero'}.pdf`;
    else if (type === 'sale') customFilename = `Venta_RafaMotos_${data?.invoiceNumber || 'SinNumero'}.pdf`;

    const opt = {
      margin: 5,
      filename: customFilename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      pagebreak: { mode: 'avoid-all' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      onGenerate();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    }
  };

  const Header = ({ title, documentNumber, date, status }: any) => (
    <div className="flex justify-between items-start border-b border-slate-300 pb-3 mb-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">RAFA MOTOS</h1>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">Taller de Motocicletas Especializado</p>
        <p className="text-[9px] text-slate-500">Cra 54 #96a-17, Medellín | NIT: 900.123.456-7</p>
        <p className="text-[9px] text-slate-500">info@rafamotos.com | +57 300 123 4567</p>
      </div>
      <div className="text-right">
        <h2 className="text-sm font-bold text-slate-800 tracking-wider uppercase mb-1">{title}</h2>
        <p className="text-[10px] text-slate-600"><span className="font-semibold text-slate-800">Nº Documento:</span> {documentNumber}</p>
        <p className="text-[10px] text-slate-600 mt-0.5"><span className="font-semibold text-slate-800">Fecha:</span> {date ? format(new Date(date), 'PP', { locale: es }) : ''}</p>
        {status && <p className="text-[9px] font-bold text-slate-800 mt-1.5 border border-slate-300 inline-block px-2 py-0.5 rounded-sm uppercase bg-slate-50">{status}</p>}
      </div>
    </div>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">{children}</h3>
  );

  const InfoGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-6 mb-4">{children}</div>
  );

  const Footer = () => (
    <div className="mt-4 pt-3 border-t border-slate-300 text-center text-[8px] text-slate-500">
      <p>Documento generado el {format(new Date(), 'PPpp', { locale: es })}</p>
      <p className="mt-0.5">Rafa Motos - Sistema de Gestión Administrativa | Este documento tiene validez administrativa interna.</p>
    </div>
  );

  const renderPurchasePDF = () => (
    <div className="flex flex-col h-full">
      <Header title="Orden de Compra" documentNumber={data?.invoiceNumber} date={data?.date} status={data?.status} />
      <InfoGrid>
        <div>
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
                  <td className="py-1.5 px-2 text-slate-800">{item.productName || item.product}</td>
                  <td className="py-1.5 px-2 text-slate-600">{item.categoryName || item.category}</td>
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
          <p className="text-[10px] text-slate-700 bg-slate-50 p-2.5 rounded-sm border border-slate-100">{data.notes}</p>
        </div>
      )}

      <div className="flex-grow"></div>
      <Footer />
    </div>
  );

  const renderSalePDF = () => (
    <div className="flex flex-col h-full">
      <Header title="Factura de Venta" documentNumber={data?.invoiceNumber} date={data?.date} status={data?.anulada ? 'ANULADA' : 'COMPLETADA'} />
      <InfoGrid>
        <div>
          <SectionTitle>Datos del Cliente</SectionTitle>
          <p className="font-semibold text-slate-800 text-[11px] mb-0.5">{data?.clientName}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Doc:</span> {data?.clientDocument || 'N/A'}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Tel:</span> {data?.clientPhone}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Dir:</span> {data?.clientAddress || 'N/A'}</p>
        </div>
        <div>
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
                  <td className="py-1.5 px-2 text-slate-800">{part.product}</td>
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
              <div key={i} className="text-[10px] text-slate-700 flex items-center before:content-['•'] before:mr-2 before:text-slate-400">{svc}</div>
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
          <p className="text-[10px] text-slate-700 bg-slate-50 p-2.5 rounded-sm border border-slate-100">{data.notes}</p>
        </div>
      )}

      <div className="flex-grow"></div>
      <Footer />
    </div>
  );

  const renderServiceOrderPDF = () => {
    const statusText = data?.estadoBase || (data?.anulada ? 'Anulada' : data?.associatedSaleId ? 'Reparación finalizada' : 'Pendiente de Venta');

    return (
      <div className="flex flex-col h-full">
        <Header title="Orden de Reparación" documentNumber={data?.orderNumber} date={data?.date} status={statusText} />
        <InfoGrid>
          <div>
            <SectionTitle>Datos del Cliente</SectionTitle>
            <p className="font-semibold text-slate-800 text-[11px] mb-0.5">{data?.clientName}</p>
            <p className="text-[10px] text-slate-600"><span className="font-medium">Doc:</span> {data?.clientDocument}</p>
            <p className="text-[10px] text-slate-600"><span className="font-medium">Tel:</span> {data?.clientPhone}</p>
          </div>
          <div>
            <SectionTitle>Motocicleta</SectionTitle>
            <p className="font-semibold text-slate-800 text-[11px] mb-0.5">{data?.motorcycleBrand} {data?.motorcycleModel}</p>
            <p className="text-[10px] text-slate-600"><span className="font-medium">Placa:</span> <span className="font-semibold text-slate-800">{data?.motorcyclePlate}</span></p>
            <p className="text-[10px] text-slate-600"><span className="font-medium">Año:</span> {data?.motorcycleYear}</p>
          </div>
        </InfoGrid>

        {data?.description && (
          <div className="mb-4">
            <SectionTitle>Descripción del Servicio</SectionTitle>
            <p className="text-[10px] text-slate-700 bg-slate-50 p-2.5 rounded-sm border border-slate-100">{data.description}</p>
          </div>
        )}

        {data?.observations && (
          <div className="mb-4">
            <SectionTitle>Observaciones del Cliente</SectionTitle>
            <p className="text-[10px] text-slate-700 bg-slate-50 p-2.5 rounded-sm border border-slate-100">{data.observations}</p>
          </div>
        )}

        <div className="mb-4">
          <SectionTitle>Avances del Trabajo</SectionTitle>
          {data?.progress && data.progress.length > 0 ? (
            <div className="space-y-2 mt-2">
              {data.progress.map((prog: any, i: number) => (
                <div key={i} className="flex gap-3 text-[10px] border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-400 mt-0.5">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="text-slate-800 leading-snug">{prog.description}</p>
                    <p className="text-slate-500 text-[9px] mt-1"><span className="font-medium">Técnico:</span> {prog.technician}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 italic mt-2">Sin avances registrados.</p>
          )}
        </div>

        <div className="flex-grow"></div>
        <Footer />
      </div>
    )
  };

  const renderGeneralPDF = () => (
    <div className="flex flex-col h-full">
      <Header title={`Reporte de ${type}`} documentNumber="N/A" date={new Date().toISOString()} />
      <div className="flex-grow flex items-center justify-center">
        <p className="text-[12px] text-slate-400">Documento General</p>
      </div>
      <Footer />
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'purchase': return renderPurchasePDF();
      case 'sale': return renderSalePDF();
      case 'service-order': return renderServiceOrderPDF();
      default: return renderGeneralPDF();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[98vh] overflow-hidden flex flex-col p-0 bg-slate-100 border-none">
        <DialogHeader className="px-6 py-4 bg-white border-b border-slate-200">
          <DialogTitle className="flex items-center gap-2 text-slate-800 text-base font-semibold">
            <FileText className="w-5 h-5 text-slate-500" />
            Vista Previa del Documento
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center custom-scrollbar">
          {/* El Wrapper A4 (190mm x 270mm = proportion cercana a Carta) */}
          <div
            id="pdf-content-wrapper"
            className="bg-white shadow-md ring-1 ring-slate-200"
            style={{ width: '190mm', minHeight: '270mm', height: 'max-content' }}
          >
            {/* El contenedor real impreso */}
            <div className="w-full h-full p-8 font-sans text-slate-800 flex flex-col bg-white">
              {renderContent()}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-white border-t border-slate-200">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-32 border-slate-300 text-slate-700">
            Cancelar
          </Button>
          <Button onClick={handleGenerate} className="w-32 bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}