import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PDFPreviewDialog } from './shared/PDFPreviewDialog';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import {
  Search,
  Loader2,
  XCircle,
  Eye,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function Compras() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnuling, setIsAnuling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [purchaseToCancel, setPurchaseToCancel] = useState<any>(null);
  const [viewingPurchase, setViewingPurchase] = useState<any>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      await fetchPurchases();
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPurchases = async () => {
    const response = await fetch(`${API_URL}/compras`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    setPurchases(data);
  };

  const filteredPurchases = purchases.filter((p: any) =>
    (p.ID_Compra?.toString() || '').includes(searchTerm.toLowerCase()) ||
    (p.NombreEmpresa || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / itemsPerPage));
  const paginatedPurchases = filteredPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCancelPurchase = async () => {
    setIsAnuling(true);
    try {
      const resp = await fetch(`${API_URL}/compras/${purchaseToCancel.ID_Compra}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message || 'Error al anular');
      }
      toast.success('Compra anulada');
      fetchInitialData();
      setShowConfirmDialog(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsAnuling(false);
    }
  };

  const handleGeneratePDF = async (purchase: any) => {
    try {
      // Cargamos detalles completos desde el servidor para tener los productos
      const resp = await fetch(`${API_URL}/compras/${purchase.ID_Compra}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const fullPurchase = await resp.json();

      setPdfData({
        invoiceNumber: `COMP-${fullPurchase.ID_Compra}`,
        date: fullPurchase.FechaCompra,
        status: fullPurchase.Estado,
        supplier: fullPurchase.NombreEmpresa,
        supplierContact: fullPurchase.NombreEmpresa,
        supplierPhone: fullPurchase.TelefonoProveedor,
        supplierEmail: fullPurchase.EmailProveedor,
        // Usamos los items detallados que vienen en fullPurchase.detalle
        items: (fullPurchase.detalle || []).map((item: any) => ({
          product: item.NombreProducto,
          category: item.NombreCategoria,
          quantity: item.Cantidad,
          unitCost: Number(item.PrecioUnitario), // Asegurar que sea número para toLocaleString()
          total: Number(item.Subtotal)
        })),
        subtotal: Number(fullPurchase.Total),
        tax: 0,
        total: Number(fullPurchase.Total),
        notes: fullPurchase.Notas
      });
      setShowPDFPreview(true);
    } catch (error) {
      toast.error('Error al cargar detalles para el PDF');
    }
  };

  const fetchPurchaseDetails = async (id: number) => {
    const resp = await fetch(`${API_URL}/compras/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await resp.json();
    setViewingPurchase(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pendiente de venta':
        return <Badge className="bg-blue-100 text-blue-800 border-none">{status}</Badge>;
      case 'Anulada':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-none">{status}</Badge>;
      case 'Con Venta':
        return <Badge className="bg-green-100 text-green-800 border-none">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Compras (Historial)</h1>
          <p className="text-muted-foreground">Registro de repuestos comprados para reparaciones</p>
        </div>
      </div>

      <div className="flex justify-start">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar compras..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10" />
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Lista de Compras ({filteredPurchases.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Compra</TableHead><TableHead>Proveedor</TableHead><TableHead>Fecha</TableHead><TableHead>Total</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              {paginatedPurchases.length > 0 ? paginatedPurchases.map((p: any) => (
                <TableRow key={p.ID_Compra}>
                  <TableCell className="font-medium">COMP-{p.ID_Compra}</TableCell>
                  <TableCell>{p.NombreEmpresa}</TableCell>
                  <TableCell>{format(new Date(p.FechaCompra), 'PPP', { locale: es })}</TableCell>
                  <TableCell>${parseFloat(p.Total).toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(p.Estado)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchPurchaseDetails(p.ID_Compra)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGeneratePDF(p)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Descargar PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {p.Estado === 'Pendiente de venta' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setPurchaseToCancel(p); setShowConfirmDialog(true); }}
                          title="Anular compra"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No se encontraron compras.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <PaginationItem key={p}>
                    <PaginationLink onClick={() => setCurrentPage(p)} isActive={currentPage === p} className="cursor-pointer">{p}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>



      <Dialog open={!!viewingPurchase} onOpenChange={() => setViewingPurchase(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalles Compra COMP-{viewingPurchase?.ID_Compra}</DialogTitle></DialogHeader>
          {viewingPurchase && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div><Label className="text-xs uppercase">Fecha</Label><p className="font-medium">{format(new Date(viewingPurchase.FechaCompra), 'PPP', { locale: es })}</p></div>
                <div><Label className="text-xs uppercase">Proveedor</Label><p className="font-bold">{viewingPurchase.NombreEmpresa}</p></div>
                <div className="col-span-2 text-blue-600 flex items-center gap-2"><div className="w-2 h-2 bg-blue-600 rounded-full"></div> {viewingPurchase.Estado}</div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead className="text-center">Cant.</TableHead><TableHead className="text-right">Precio</TableHead><TableHead className="text-right">Subtotal</TableHead></TableRow></TableHeader>
                <TableBody>
                  {viewingPurchase.detalle?.map((it: any) => (
                    <TableRow key={it.ID_DetalleCompra}>
                      <TableCell>{it.NombreProducto}</TableCell><TableCell className="text-center">{it.Cantidad}</TableCell>
                      <TableCell className="text-right">${parseFloat(it.PrecioUnitario).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold">${parseFloat(it.Subtotal).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end pt-4"><div className="text-2xl font-black text-blue-600">TOTAL: ${parseFloat(viewingPurchase.Total).toLocaleString()}</div></div>
              {viewingPurchase.Notas && <div className="p-3 border-l-4 border-blue-500 bg-blue-50 text-sm">{viewingPurchase.Notas}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PDFPreviewDialog open={showPDFPreview} onOpenChange={setShowPDFPreview} data={pdfData} type="purchase" onGenerate={() => { }} />

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Anular Compra"
        description="¿Seguro que desea anular esta compra?"
        confirmText="Anular Compra"
        onConfirm={handleCancelPurchase}
        variant="delete"
        loading={isAnuling}
      />
    </div>
  );
}
