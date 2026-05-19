import { useState } from 'react';
import { useCompras } from './hooks/useCompras';
import { ComprasHeader } from './components/ComprasHeader';
import { ComprasTable } from './components/ComprasTable';
import { ComprasStyles } from './styles/ComprasStyles';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { PDFPreviewDialog } from '../shared/PDFPreviewDialog';
import { Search, ShoppingBag, Calendar, Truck, FileText } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Compras() {
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    isAnuling,
    purchases,
    cancelPurchase,
    getPurchaseDetails
  } = useCompras();

  const [viewingPurchase, setViewingPurchase] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [purchaseToCancel, setPurchaseToCancel] = useState<any>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(purchases.length / itemsPerPage));
  const paginatedPurchases = purchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewDetails = async (id: number) => {
    const details = await getPurchaseDetails(id);
    if (details) setViewingPurchase(details);
  };

  const handleGeneratePDF = async (purchase: any) => {
    const fullPurchase = await getPurchaseDetails(purchase.ID_Compra);
    if (!fullPurchase) return;

    setPdfData({
      invoiceNumber: `#${fullPurchase.ID_Compra}`,
      date: fullPurchase.FechaCompra,
      status: fullPurchase.Estado,
      supplier: fullPurchase.NombreEmpresa,
      supplierContact: fullPurchase.NombreEmpresa,
      supplierPhone: fullPurchase.TelefonoProveedor,
      supplierEmail: fullPurchase.EmailProveedor,
      items: (fullPurchase.detalle || []).map((item: any) => ({
        product: item.NombreProducto,
        category: item.NombreCategoria,
        quantity: item.Cantidad,
        unitCost: Number(item.PrecioUnitario),
        total: Number(item.Subtotal)
      })),
      subtotal: Number(fullPurchase.Total),
      tax: 0,
      total: Number(fullPurchase.Total),
      notes: fullPurchase.Notas
    });
    setShowPDFPreview(true);
  };

  const onConfirmCancel = async () => {
    if (purchaseToCancel) {
      const success = await cancelPurchase(purchaseToCancel.ID_Compra);
      if (success) setShowConfirmDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="compras-root">
        <ComprasStyles />
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando Historial de Compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="compras-root space-y-6">
      <ComprasStyles />

      <div className="compras-content-animate space-y-6">
        <ConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          title="Anular Compra"
          description="¿Está seguro de que desea anular esta compra? Esta acción no se puede deshacer."
          confirmText="Anular Compra"
          onConfirm={onConfirmCancel}
          variant="delete"
          loading={isAnuling}
        />

        <ComprasHeader />

        <div className="flex justify-start">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar compras..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
          </div>
        </div>

        <ComprasTable
          purchasesCount={purchases.length}
          paginatedPurchases={paginatedPurchases}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          onView={handleViewDetails}
          onPDF={handleGeneratePDF}
          onCancel={(p) => { setPurchaseToCancel(p); setShowConfirmDialog(true); }}
        />

        {/* View Details Modal */}
        <Dialog open={!!viewingPurchase} onOpenChange={() => setViewingPurchase(null)}>
          <DialogContent
            className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal max-w-4xl w-[95vw] bg-white dark:bg-slate-950"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Detalles de la compra #{viewingPurchase?.ID_Compra}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Resumen detallado de la transacción</p>
              </div>
            </div>

            {viewingPurchase && (
              <div className="p-8 space-y-8 text-left overflow-y-auto max-h-[60vh] custom-scrollbar">
                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-5 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fecha de Compra</Label>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{format(new Date(viewingPurchase.FechaCompra), 'PPP', { locale: es })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-slate-100/50 dark:border-slate-800/50 pt-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Proveedor</Label>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{viewingPurchase.NombreEmpresa}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-slate-100/50 dark:border-slate-800/50 pt-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Estado de la compra</Label>
                      <div className="mt-0.5">
                        <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg inline-block ${viewingPurchase.Estado === 'Activa' || viewingPurchase.Estado === 'Pendiente de venta' ? 'bg-blue-600/10 text-blue-500 dark:text-blue-400' :
                          viewingPurchase.Estado === 'Anulada' || viewingPurchase.Estado === 'Anulado' ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400' :
                            'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                          }`}>
                          {viewingPurchase.Estado}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Items de la Compra</Label>
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                        <TableRow>
                          <TableHead className="font-bold">Producto</TableHead>
                          <TableHead className="text-center font-bold">Cant.</TableHead>
                          <TableHead className="text-right font-bold">Precio Unit.</TableHead>
                          <TableHead className="text-right font-bold">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingPurchase.detalle?.map((it: any) => (
                          <TableRow key={it.ID_DetalleCompra}>
                            <TableCell className="font-medium text-slate-900 dark:text-slate-200">{it.NombreProducto}</TableCell>
                            <TableCell className="text-center font-bold">{it.Cantidad}</TableCell>
                            <TableCell className="text-right font-medium">${parseFloat(it.PrecioUnitario).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-black text-blue-600 dark:text-blue-400">${parseFloat(it.Subtotal).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="w-full space-y-2 text-left">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-500" /> Notas Adicionales
                    </Label>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[60px] w-full">
                      {viewingPurchase.Notas || "Sin observaciones."}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center w-full py-4">
                    <div className="px-10 py-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-500/10 flex flex-col items-center text-white min-w-[280px]">
                      <span className="text-[10px] uppercase font-bold tracking-[0.25em] opacity-80 mb-1">Total de la Compra</span>
                      <span className="text-3xl font-black">${parseFloat(viewingPurchase.Total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <Button variant="ghost" onClick={() => setViewingPurchase(null)} className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl">
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <PDFPreviewDialog open={showPDFPreview} onOpenChange={setShowPDFPreview} data={pdfData} type="purchase" onGenerate={() => { }} />
      </div>
    </div>
  );
}
