import { useState } from 'react';
import { useVentas } from './hooks/useVentas';
import { VentasHeader } from './components/VentasHeader';
import { VentasTable } from './components/VentasTable';
import { VentasStyles } from './styles/VentasStyles';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { PDFPreviewDialog } from '../shared/PDFPreviewDialog';
// react-icons/pi imports removed as they were mostly unused or incorrect
import { DollarSign as LucideDollarSign, Search as LucideSearch, Calendar as LucideCalendar, User as LucideUser, FileText as LucideFileText, Wrench as LucideWrench, Info as LucideInfo } from 'lucide-react';
import { Input } from '../ui/input';
import { formatLocalDate } from '../../lib/utils';

export function Ventas() {
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    sales,
    getSaleDetails
  } = useVentas();

  const [viewingSale, setViewingSale] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(sales.length / itemsPerPage));
  const paginatedSales = sales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewDetails = (id: number) => {
    const sale = sales.find(s => s.id === id);
    if (sale) {
      setViewingSale(sale);
      setIsDetailsOpen(true);
    }
  };

  const handleShowPDF = async (id: number) => {
    const details = await getSaleDetails(id);
    if (details) {
      setPdfData(details);
      setShowPDFPreview(true);
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
        <VentasHeader />

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
        />

        {/* View Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
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
                    Detalles de la Venta #{viewingSale?.invoiceNumber}
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
                {(() => {
                  const isFromRepair = !!(viewingSale.ID_Reparacion || (viewingSale.serviceOrderNumber && viewingSale.serviceOrderNumber !== 'N/A'));
                  const partsTotal = viewingSale.parts ? viewingSale.parts.reduce((sum: number, p: any) => sum + (p.quantity * parseFloat(p.unitCost || 0)), 0) : 0;
                  const serviceCost = parseFloat(viewingSale.serviceCost || 0);
                  const totalDb = parseFloat(viewingSale.total || 0);

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
                    <>
                      {/* Single vertical details container */}
                      <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-5">
                        {/* 1. Fecha */}
                        <div className="flex items-start gap-3">
                          <LucideCalendar className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fecha de facturación</Label>
                            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                              {formatLocalDate(viewingSale.date, 'PPP, p')}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-slate-200/50 dark:border-slate-800/50" />

                        {/* 2. Orden de Reparacion */}
                        <div className="flex items-start gap-3">
                          <LucideFileText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Reparación asociada</Label>
                            <p className="font-bold text-slate-900 dark:text-white mt-0.5">#{viewingSale.serviceOrderNumber}</p>
                          </div>
                        </div>

                        <div className="border-t border-slate-200/50 dark:border-slate-800/50" />

                        {/* 3. Cliente */}
                        <div className="flex items-start gap-3">
                          <LucideUser className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cliente</Label>
                            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{viewingSale.clientName}</p>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">
                              {viewingSale.clientPhone && `Teléfono: ${viewingSale.clientPhone}`}
                              {viewingSale.clientPhone && viewingSale.clientEmail && ' • '}
                              {viewingSale.clientEmail && `Email: ${viewingSale.clientEmail}`}
                              {viewingSale.clientDocument && ` • Documento: ${viewingSale.clientDocument}`}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-slate-200/50 dark:border-slate-800/50" />

                        {/* 4. Moto */}
                        <div className="flex items-start gap-3">
                          <LucideWrench className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Motocicleta</Label>
                            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{viewingSale.motorcycleBrand} {viewingSale.motorcycleModel}</p>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">Placa: {viewingSale.motorcyclePlate}</p>
                          </div>
                        </div>
                      </div>

                      {/* Productos y Mano de Obra Table */}
                      <div className="space-y-4">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Detalle de la Venta</Label>
                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                          <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                              <TableRow>
                                <TableHead className="font-bold">Ítem</TableHead>
                                <TableHead className="text-center font-bold">Cant.</TableHead>
                                <TableHead className="text-center font-bold">Precio Unit.</TableHead>
                                <TableHead className="text-right font-bold">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {/* SECCIÓN: SERVICIOS */}
                              <TableRow className="bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800">
                                <TableCell colSpan={4} className="py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                                  Servicios
                                </TableCell>
                              </TableRow>
                              {viewingSale.servicios && viewingSale.servicios.length > 0 ? (
                                viewingSale.servicios.map((s: any, i: number) => (
                                  <TableRow key={`service-${i}`}>
                                    <TableCell className="font-semibold text-slate-700 dark:text-slate-300">{s.NombreServicio || s.Nombre}</TableCell>
                                    <TableCell className="text-center font-bold">1</TableCell>
                                    <TableCell className="text-center">${parseFloat(s.CostoServicios || 0).toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                                      ${parseFloat(s.CostoServicios || 0).toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-3 text-xs text-slate-400 dark:text-slate-500 italic">
                                    No se realizaron servicios en esta venta.
                                  </TableCell>
                                </TableRow>
                              )}

                              {/* SECCIÓN: REPUESTOS */}
                              <TableRow className="bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 border-t border-b border-slate-100 dark:border-slate-800">
                                <TableCell colSpan={4} className="py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                                  Repuestos
                                </TableCell>
                              </TableRow>
                              {viewingSale.parts && viewingSale.parts.length > 0 ? (
                                viewingSale.parts.map((p: any, i: number) => (
                                  <TableRow key={`part-${i}`}>
                                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">{p.product}</TableCell>
                                    <TableCell className="text-center font-bold">{p.quantity}</TableCell>
                                    <TableCell className="text-center">${parseFloat(p.unitCost).toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                                      ${(p.quantity * parseFloat(p.unitCost)).toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-4 text-xs text-slate-400 dark:text-slate-500 italic">
                                    No se agregaron repuestos en esta venta.
                                  </TableCell>
                                </TableRow>
                              )}

                              {/* SECCIÓN: MANO DE OBRA */}
                              <TableRow className="bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 border-t border-b border-slate-100 dark:border-slate-800">
                                <TableCell colSpan={4} className="py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                                  Mano de Obra
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-semibold text-slate-700 dark:text-slate-300">Mano de Obra de Reparación</TableCell>
                                <TableCell className="text-center font-bold">1</TableCell>
                                <TableCell className="text-center text-slate-400 dark:text-slate-650">---</TableCell>
                                <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                                  ${manoObra.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* Total Facturado (Centered) */}
                      <div className="flex justify-center pt-4">
                        <div className="w-full sm:w-72 p-6 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 flex flex-col items-center justify-center text-white">
                          <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80 mb-1">Total Facturado</span>
                          <span className="text-3xl font-black">${grandTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Observaciones (in its own separate full-width row) */}
                      <div className="space-y-2 pt-6 border-t border-slate-100 dark:border-slate-800 w-full">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <LucideFileText className="w-3.5 h-3.5" /> Observaciones
                        </Label>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[60px] w-full">
                          {viewingSale.notes || "Sin observaciones adicionales."}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <Button variant="ghost" onClick={() => setIsDetailsOpen(false)} className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl">
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
