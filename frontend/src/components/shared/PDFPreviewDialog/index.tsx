import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { FileText, Download } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { PurchaseView } from './components/PurchaseView';
import { SaleView } from './components/SaleView';
import { ServiceOrderView } from './components/ServiceOrderView';
import { PDFHeader } from './components/PDFHeader';
import { PDFFooter } from './components/PDFFooter';

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

  const renderContent = () => {
    switch (type) {
      case 'purchase': return <PurchaseView data={data} />;
      case 'sale': return <SaleView data={data} />;
      case 'service-order': return <ServiceOrderView data={data} />;
      default: return (
        <div className="flex flex-col h-full">
          <PDFHeader title={`Reporte de ${type}`} documentNumber="N/A" date={new Date().toISOString()} />
          <div className="flex-grow flex items-center justify-center">
            <p className="text-[12px] text-slate-400">Documento General</p>
          </div>
          <PDFFooter />
        </div>
      );
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
          <div
            id="pdf-content-wrapper"
            className="bg-white shadow-md ring-1 ring-slate-200"
            style={{ width: '190mm', minHeight: '270mm', height: 'max-content' }}
          >
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
