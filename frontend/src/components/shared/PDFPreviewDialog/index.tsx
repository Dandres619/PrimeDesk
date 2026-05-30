import { useState } from 'react';
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
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    const wrapper = document.getElementById('pdf-content-wrapper');
    const element = wrapper?.firstElementChild as HTMLElement;
    if (!element) return;

    let customFilename = `RafaMotos_${type}_${Date.now()}.pdf`;
    if (type === 'purchase') customFilename = `Compras_RafaMotos_${data?.invoiceNumber || 'SinNumero'}.pdf`;
    else if (type === 'service-order') customFilename = `Reparaciones_RafaMotos_${data?.orderNumber || 'SinNumero'}.pdf`;
    else if (type === 'sale') customFilename = `Venta_RafaMotos_${data?.invoiceNumber || 'SinNumero'}.pdf`;

    const elementHeight = Math.ceil(element.scrollHeight) + 5;
    const elementWidth = Math.ceil(element.scrollWidth);

    const opt = {
      margin: 0,
      filename: customFilename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0, height: elementHeight, windowHeight: elementHeight },
      jsPDF: { unit: 'px', format: [elementWidth, elementHeight], orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      onGenerate();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
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
      <DialogContent className="max-w-4xl max-h-[98vh] overflow-hidden flex flex-col p-0 bg-slate-100 dark:bg-slate-900 border-none">
        <DialogHeader className="px-6 py-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-white text-base font-semibold">
            <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            Vista Previa del Documento
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center custom-scrollbar">
          <div
            id="pdf-content-wrapper"
            className="bg-white dark:bg-slate-950 shadow-md ring-1 ring-slate-200 dark:ring-slate-800"
            style={{ width: '240mm', height: 'max-content' }}
          >
            <div className="w-full h-full p-8 font-sans text-slate-800 dark:text-slate-200 flex flex-col bg-white dark:bg-slate-950">
              {renderContent()}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" onClick={() => !isGenerating && onOpenChange(false)} disabled={isGenerating} className="w-32 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-32 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white shadow-sm disabled:opacity-70 flex items-center justify-center">
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generando...' : 'Descargar PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
