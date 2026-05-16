import { useState } from 'react';
import { useVentas } from './hooks/useVentas';
import { VentasHeader } from './components/VentasHeader';
import { VentasTable } from './components/VentasTable';
import { VentasStyles } from './styles/VentasStyles';
import { SaleDialog } from './components/SaleDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { PDFPreviewDialog } from '../shared/PDFPreviewDialog';
// react-icons/pi imports removed as they were mostly unused or incorrect
import { DollarSign as LucideDollarSign, Search as LucideSearch, Calendar as LucideCalendar, User as LucideUser, FileText as LucideFileText } from 'lucide-react';
import { Input } from '../ui/input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Ventas() {
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    sales,
    purchases,
    serviceOrders,
    saveSale,
    cancelSale,
    getSaleDetails
  } = useVentas();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [saleToCancel, setSaleToCancel] = useState<any>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(sales.length / itemsPerPage));
  const paginatedSales = sales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewDetails = async (id: number) => {
    const details = await getSaleDetails(id);
    if (details) setViewingSale(details);
  };

  const handleShowPDF = async (id: number) => {
    const details = await getSaleDetails(id);
    if (details) {
      setPdfData(details);
      setShowPDFPreview(true);
    }
  };

  const onConfirmCancel = async () => {
    if (saleToCancel) {
      const success = await cancelSale(saleToCancel);
      if (success) setShowConfirmDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ventas-root">
        <VentasStyles />
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando Ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ventas-root space-y-6">
      <VentasStyles />

      <div className="ventas-content-animate space-y-6">
        <ConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          title="Anular Venta"
          description="¿Está seguro de que desea anular esta venta? Esta acción no se puede deshacer y los repuestos volverán a estar disponibles."
          confirmText="Anular Venta"
          onConfirm={onConfirmCancel}
          variant="delete"
        />

        <VentasHeader onNewSale={() => setIsDialogOpen(true)} />

        <div className="flex justify-start">
          <div className="relative w-full sm:w-72">
            <LucideSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ventas..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
          </div>
        </div>

        <VentasTable
          salesCount={sales.length}
          paginatedSales={paginatedSales}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          onView={handleViewDetails}
          onPDF={handleShowPDF}
          onCancel={(s) => { setSaleToCancel(s); setShowConfirmDialog(true); }}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <SaleDialog
            purchases={purchases}
            serviceOrders={serviceOrders}
            onSave={saveSale}
            onOpenChange={setIsDialogOpen}
          />
        </Dialog>

        {/* View Details Modal */}
        <Dialog open={!!viewingSale} onOpenChange={() => setViewingSale(null)}>
          <DialogContent
            className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal max-w-4xl w-[95vw] bg-white dark:bg-slate-950"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                <LucideDollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Detalles de Venta {viewingSale?.invoiceNumber}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Resumen de facturación y servicios</p>
              </div>
              {viewingSale && (
                <Badge className={viewingSale.anulada
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 font-bold"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold"
                }>
                  {viewingSale.anulada ? 'ANULADA' : 'ACTIVA'}
                </Badge>
              )}
            </div>

            {viewingSale && (
              <div className="p-8 space-y-8 text-left overflow-y-auto max-h-[65vh] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-3">
                        <LucideCalendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fecha</Label>
                          <p className="font-bold text-slate-900 dark:text-white">{format(new Date(viewingSale.date), 'PPP', { locale: es })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <LucideUser className="w-5 h-5 text-blue-600" />
                        <div>
                          <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cliente</Label>
                          <p className="font-bold text-slate-900 dark:text-white">{viewingSale.clientName}</p>
                          <p className="text-xs text-slate-500 font-semibold">{viewingSale.clientPhone} • {viewingSale.clientEmail}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-3">
                        <LucideDollarSign className="w-5 h-5 text-blue-600" />
                        <div>
                          <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Orden de Reparación</Label>
                          <p className="font-bold text-slate-900 dark:text-white">{viewingSale.serviceOrderNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <LucideDollarSign className="w-5 h-5 text-blue-600" />
                        <div>
                          <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Motocicleta</Label>
                          <p className="font-bold text-slate-900 dark:text-white">{viewingSale.motorcycleBrand} {viewingSale.motorcycleModel}</p>
                          <p className="text-xs text-slate-500 font-semibold">Placa: {viewingSale.motorcyclePlate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Servicios Realizados</Label>
                  <div className="flex flex-wrap gap-2">
                    {viewingSale.serviceTypes.map((s: string, i: number) => (
                      <Badge key={i} className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800 font-bold px-4 py-1.5 rounded-xl">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Productos y Mano de Obra</Label>
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                        <TableRow>
                          <TableHead className="font-bold">Ítem</TableHead>
                          <TableHead className="text-center font-bold">Cant.</TableHead>
                          <TableHead className="text-right font-bold">Precio Unit.</TableHead>
                          <TableHead className="text-right font-bold">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingSale.parts.map((p: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{p.product}</TableCell>
                            <TableCell className="text-center font-bold">{p.quantity}</TableCell>
                            <TableCell className="text-right">{parseFloat(p.unitCost).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">{(p.quantity * parseFloat(p.unitCost)).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-slate-50/30 dark:bg-slate-900/20">
                          <TableCell className="font-bold">Mano de Obra (Servicios)</TableCell>
                          <TableCell className="text-center">1</TableCell>
                          <TableCell className="text-right">{viewingSale.serviceCost.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">{viewingSale.serviceCost.toLocaleString()}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <LucideFileText className="w-3.5 h-3.5" /> Observaciones
                    </Label>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[60px]">
                      {viewingSale.notes || "Sin observaciones adicionales."}
                    </p>
                  </div>
                  <div className="w-full sm:w-64 p-6 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 flex flex-col items-center justify-center text-white">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80 mb-1">Total Facturado</span>
                    <span className="text-3xl font-black">{viewingSale.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <Button variant="ghost" onClick={() => setViewingSale(null)} className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl">
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <PDFPreviewDialog
          open={showPDFPreview}
          onOpenChange={setShowPDFPreview}
          data={pdfData}
          type="sale"
          onGenerate={() => { }}
        />
      </div>
    </div>
  );
}
