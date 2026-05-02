import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { PDFPreviewDialog } from './PDFPreviewDialog';
import {
  Plus,
  Search,
  Eye,
  FileText,
  DollarSign,
  XCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export function Ventas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<any>(null);

  // States para la conexión al backend
  const [sales, setSales] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [motorcycles, setMotorcycles] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('token');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: 'delete' | 'cancel' | 'default';
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'default',
    onConfirm: () => { }
  });

  const [pdfPreview, setPdfPreview] = useState<{
    open: boolean;
    data: any;
    type: 'sale';
  }>({
    open: false,
    data: null,
    type: 'sale'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resVentas, resClientes, resMotos, resCompras, resServicios, resReparaciones] = await Promise.all([
        fetch(`${API_URL}/ventas`, { headers }),
        fetch(`${API_URL}/clientes`, { headers }),
        fetch(`${API_URL}/motocicletas`, { headers }),
        fetch(`${API_URL}/compras`, { headers }),
        fetch(`${API_URL}/servicios`, { headers }),
        fetch(`${API_URL}/reparaciones`, { headers })
      ]);

      if (resVentas.ok) {
        const dataVentas = await resVentas.json();
        const mappedSales = dataVentas.map((v: any) => ({
          ...v,
          id: v.ID_Venta,
          invoiceNumber: `VEN-${v.ID_Venta.toString().padStart(3, '0')}`,
          date: v.Fecha,
          serviceOrderId: v.ID_Reparacion,
          serviceOrderNumber: v.ID_Reparacion ? `R-${v.ID_Reparacion.toString().padStart(3, '0')}` : '',
          clientName: `${v.NombreCliente} ${v.ApellidoCliente}`.trim(),
          clientPhone: v.TelefonoCliente,
          clientDocument: v.DocumentoCliente,
          clientEmail: v.EmailCliente,
          clientAddress: v.DireccionCliente,
          motorcycleBrand: v.MarcaMoto,
          motorcycleModel: v.ModeloMoto,
          motorcyclePlate: v.Placa,
          motorcycleYear: v.AnioMoto,
          serviceTypes: v.TiposServicio || [],
          parts: v.Repuestos || [],
          purchaseInvoices: v.FacturasCompras || [],
          serviceCost: parseFloat(v.CostoServicios || 0),
          partsCost: v.Repuestos?.reduce((sum: number, p: any) => sum + (p.quantity * (parseFloat(p.unitCost) || 0)), 0) || 0,
          partsTotal: v.Repuestos?.reduce((sum: number, p: any) => sum + parseFloat(p.total || 0), 0) || 0,
          subtotal: parseFloat(v.Total),
          tax: 0,
          total: parseFloat(v.Total),
          notes: v.Observaciones || v.NotasReparacion,
          anulada: v.Estado === false
        }));
        setSales(mappedSales);
      }

      if (resClientes.ok) {
        const data = await resClientes.json();
        setClients(data.map((c: any) => ({
          id: c.ID_Cliente,
          name: `${c.Nombre} ${c.Apellido}`.trim(),
          phone: c.Telefono,
          document: c.Documento,
          email: c.Correo,
          address: c.Direccion
        })));
      }

      if (resMotos.ok) {
        const data = await resMotos.json();
        setMotorcycles(data.map((m: any) => ({
          id: m.ID_Motocicleta,
          brand: m.Marca,
          model: m.Modelo,
          plate: m.Placa,
          year: m.Anio,
          clientId: m.ID_Cliente
        })));
      }

      if (resCompras.ok) {
        const data = await resCompras.json();
        setPurchases(data.filter((c: any) => c.Estado === 'Pendiente de venta').map((c: any) => ({
          id: c.ID_Compra,
          invoiceNumber: `COMP-${c.ID_Compra.toString().padStart(3, '0')}`,
          total: parseFloat(c.Total),
          items: c.items || []
        })));
      }

      if (resServicios.ok) {
        const data = await resServicios.json();
        setServiceTypes(data.map((s: any) => ({ id: s.ID_Servicio.toString(), name: s.Nombre })));
      }

      if (resReparaciones.ok) {
        const data = await resReparaciones.json();
        setServiceOrders(data.map((r: any) => ({
          id: r.ID_Reparacion,
          orderNumber: r.id ? `R-${r.id.toString().padStart(3, '0')}` : r.ID_Reparacion,
          clientId: r.ID_Cliente,
          clientName: r.NombreCliente,
          motorcycleId: r.ID_Motocicleta,
          motorcycleBrand: r.Marca,
          motorcycleModel: r.Modelo,
          motorcyclePlate: r.Placa,
          description: r.Observaciones,
          status: r.Estado,
          associatedSaleId: r.AssociatedSaleId,
          services: r.servicios || []
        })));
      }
    } catch (e) {
      toast.error('Error cargando datos del servidor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSales = sales.filter(sale =>
    sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.motorcycleBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.motorcycleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.motorcyclePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveSale = async (saleData: any) => {
    // Calcular totales
    const selectedPurchases = purchases.filter(p => saleData.selectedPurchases.includes(p.id));
    const allProducts = selectedPurchases.flatMap(purchase =>
      purchase.items.map((item: any) => ({
        ...item,
        purchaseInvoice: purchase.invoiceNumber,
        quantity: item.quantity,
        total: item.unitCost * item.quantity
      }))
    );

    const partsTotal = allProducts.reduce((sum: number, part: any) => sum + part.total, 0);
    const total = partsTotal + parseFloat(saleData.serviceCost || '0');

    const payload = {
      id_reparacion: saleData.serviceOrderId ? parseInt(saleData.serviceOrderId) : null,
      id_motocicleta: parseInt(saleData.motorcycleId),
      fecha: saleData.date,
      total: total,
      observaciones: saleData.notes,
      servicios: saleData.selectedServices.map((idServ: string) => ({
        id_servicio: parseInt(idServ),
        costo: parseFloat(saleData.serviceCost || '0') / saleData.selectedServices.length
      })),
      compras: selectedPurchases.map(p => ({
        id_compra: p.id,
        subtotal: p.total
      }))
    };

    try {
      const res = await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al registrar la venta');
      toast.success('Venta registrada exitosamente');
      setIsDialogOpen(false);
      fetchData();
    } catch (e) {
      toast.error('Ocurrió un error al guardar la venta');
    }
  };

  const showCancelConfirm = (saleId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Anular Venta',
      description: '¿Está seguro de que desea anular esta venta? Esta acción no se puede deshacer.',
      confirmText: 'Anular',
      variant: 'cancel',
      onConfirm: () => cancelSale(saleId)
    });
  };

  const cancelSale = async (saleId: number) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;
    try {
      const res = await fetch(`${API_URL}/ventas/${saleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ total: sale.total, observaciones: sale.notes, estado: false })
      });
      if (!res.ok) throw new Error('Error al anular la venta');
      toast.success('Venta anulada exitosamente');
      fetchData();
    } catch (e) {
      toast.error('Error al anular la venta');
    }
  };

  const showPDFPreview = (saleId: number) => {
    const sale = sales.find(s => s.id === saleId);
    setPdfPreview({
      open: true,
      data: sale,
      type: 'sale'
    });
  };

  const generatePDF = () => {
    toast.success('PDF generado exitosamente');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <p className="text-muted-foreground">Gestión y registro de ventas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <SaleDialog
            clients={clients}
            motorcycles={motorcycles}
            purchases={purchases}
            serviceTypes={serviceTypes}
            serviceOrders={serviceOrders}
            onSave={handleSaveSale}
          />
        </Dialog>
      </div>

      <div className="flex justify-end">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar ventas..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10" />
        </div>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Listado de Ventas ({filteredSales.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Venta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Moto</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSales.length > 0 ? paginatedSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div>
                      <p>{sale.invoiceNumber}</p>
                      {sale.anulada && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 mt-1">
                          Anulada
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{format(new Date(sale.date), 'PPP', { locale: es })}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{sale.clientName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{sale.motorcyclePlate}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>
                        ${sale.serviceCost.toLocaleString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>${sale.total.toLocaleString()}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewingSale(sale)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => showPDFPreview(sale.id)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {!sale.anulada && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => showCancelConfirm(sale.id)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No se encontraron ventas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
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

      {/* Sale Details Dialog */}
      <Dialog open={!!viewingSale} onOpenChange={() => setViewingSale(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta</DialogTitle>
          </DialogHeader>
          {viewingSale && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Información de la Venta</h4>
                  <div className="space-y-2">
                    <div>
                      <Label>Número de Factura</Label>
                      <p className="font-medium text-foreground">{viewingSale.invoiceNumber}</p>
                    </div>
                    <div>
                      <Label>Fecha</Label>
                      <p className="text-foreground">{format(new Date(viewingSale.date), 'PPP', { locale: es })}</p>
                    </div>
                    <div>
                      <Label>Reparación</Label>
                      <p className="font-medium text-foreground">{viewingSale.serviceOrderNumber}</p>
                    </div>
                    <div>
                      <Label>Compras Asociadas</Label>
                      <p className="text-foreground">{viewingSale.purchaseInvoices.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Cliente y Motocicleta</h4>
                  <div className="space-y-2">
                    <div>
                      <Label>Cliente</Label>
                      <p className="font-medium text-foreground">{viewingSale.clientName}</p>
                      <p className="text-sm text-muted-foreground">{viewingSale.clientPhone}</p>
                    </div>
                    <div>
                      <Label>Motocicleta</Label>
                      <p className="font-medium text-foreground">{viewingSale.motorcycleBrand} {viewingSale.motorcycleModel}</p>
                      <p className="text-sm text-muted-foreground">Placa: {viewingSale.motorcyclePlate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="font-semibold mb-3">Tipos de Servicio</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingSale.serviceTypes.map((service: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Parts */}
              <div>
                <h4 className="font-semibold mb-3">Productos y Servicios</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Costo</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingSale.parts.map((part: any) => (
                      <TableRow key={part.id}>
                        <TableCell>{part.product}</TableCell>
                        <TableCell>{part.quantity}</TableCell>
                        <TableCell>${part.unitCost.toLocaleString()}</TableCell>
                        <TableCell>${(part.quantity * part.unitCost).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {/* Fila de servicios como producto */}
                    <TableRow>
                      <TableCell>
                        <div className="font-medium">Servicios</div>
                      </TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>${viewingSale.serviceCost.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ${viewingSale.serviceCost.toLocaleString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="space-y-2">
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total:</span>
                        <span>${viewingSale.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {viewingSale.notes && (
                <div>
                  <Label>Observaciones</Label>
                  <p className="mt-1 p-3 bg-muted/50 text-foreground rounded">{viewingSale.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={pdfPreview.open}
        onOpenChange={(open) => setPdfPreview(prev => ({ ...prev, open }))}
        data={pdfPreview.data}
        type={pdfPreview.type}
        onGenerate={generatePDF}
      />
    </div>
  );
}

function SaleDialog({ clients, motorcycles, purchases, serviceTypes, serviceOrders, onSave }: any) {
  const [formData, setFormData] = useState({
    serviceOrderId: '',
    clientId: '',
    motorcycleId: '',
    selectedPurchases: [] as number[],
    selectedServices: [] as string[],
    serviceCost: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceOrderId || !formData.clientId || !formData.motorcycleId || formData.selectedPurchases.length === 0 ||
      formData.selectedServices.length === 0 || !formData.serviceCost) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    onSave(formData);
  };

  const handlePurchaseChange = (purchaseId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        selectedPurchases: [...prev.selectedPurchases, purchaseId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedPurchases: prev.selectedPurchases.filter(id => id !== purchaseId)
      }));
    }
  };

  const handleServiceOrderChange = (serviceOrderId: string) => {
    const selectedOrder = serviceOrders.find((order: any) => order.id === parseInt(serviceOrderId));

    setFormData(prev => ({
      ...prev,
      serviceOrderId,
      clientId: selectedOrder ? selectedOrder.clientId.toString() : '',
      motorcycleId: selectedOrder ? selectedOrder.motorcycleId.toString() : '',
      selectedServices: selectedOrder && selectedOrder.services ? selectedOrder.services.map((s: any) => s.ID_Servicio.toString()) : []
    }));
  };

  // Obtener productos de las compras seleccionadas
  const getSelectedPurchaseProducts = () => {
    return formData.selectedPurchases.map(purchaseId => {
      const purchase = purchases.find((p: any) => p.id === purchaseId);
      return purchase ? {
        ...purchase,
        items: purchase.items || []
      } : null;
    }).filter(Boolean);
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Nueva Venta</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="serviceOrderId">Reparación *</Label>
          <select
            id="serviceOrderId"
            value={formData.serviceOrderId}
            onChange={(e) => handleServiceOrderChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Seleccionar reparación</option>
            {serviceOrders
              .filter((order: any) => !order.associatedSaleId) // Solo mostrar pedidos sin venta asociada
              .map((order: any) => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber} - {order.clientName} - {order.motorcycleBrand} {order.motorcycleModel} ({order.motorcyclePlate})
                </option>
              ))
            }
          </select>
          {formData.serviceOrderId && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Descripción:</strong> {serviceOrders.find((o: any) => o.id === parseInt(formData.serviceOrderId))?.description}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientId">Cliente *</Label>
            <select
              id="clientId"
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={true}
              required
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((client: any) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="motorcycleId">Motocicleta *</Label>
            <select
              id="motorcycleId"
              value={formData.motorcycleId}
              onChange={(e) => setFormData(prev => ({ ...prev, motorcycleId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={true}
              required
            >
              <option value="">Seleccionar motocicleta</option>
              {motorcycles
                .filter((m: any) => !formData.clientId || m.clientId === parseInt(formData.clientId))
                .map((moto: any) => (
                  <option key={moto.id} value={moto.id}>
                    {moto.brand} {moto.model} - {moto.plate}
                  </option>
                ))
              }
            </select>
          </div>
        </div>

        <div>
          <Label>Compras Asociadas *</Label>
          <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto border rounded p-2">
            {purchases.map((purchase: any) => (
              <div key={purchase.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`purchase-${purchase.id}`}
                  checked={formData.selectedPurchases.includes(purchase.id)}
                  onCheckedChange={(checked) => handlePurchaseChange(purchase.id, checked as boolean)}
                />
                <Label htmlFor={`purchase-${purchase.id}`} className="text-sm">
                  {purchase.invoiceNumber}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Mostrar productos de las compras seleccionadas */}
        {formData.selectedPurchases.length > 0 && (
          <div>
            <Label>Productos de las Compras Seleccionadas</Label>
            <div className="mt-2 space-y-4 max-h-64 overflow-y-auto border rounded p-4">
              {getSelectedPurchaseProducts().map((purchase: any) => (
                <div key={purchase.id}>
                  <h5 className="font-medium text-blue-600 mb-2">{purchase.invoiceNumber} - Total: ${purchase.total.toLocaleString()}</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {purchase.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div>
                          <span className="font-medium">{item.product}</span>
                          <Badge variant="outline" className="ml-2">{item.category}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Cantidad: {item.quantity}</p>
                          <p className="font-medium">${(item.unitCost * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>Tipos de Servicio *</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border rounded p-2">
            {!formData.serviceOrderId ? (
              <p className="text-sm text-muted-foreground col-span-2 pl-1">Seleccione una reparación obligatoriamente para cargar los servicios.</p>
            ) : (
              serviceTypes
                .filter((service: any) => formData.selectedServices.includes(service.id))
                .map((service: any) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={true}
                      disabled={true}
                    />
                    <Label htmlFor={`service-${service.id}`} className="text-sm">
                      {service.name}
                    </Label>
                  </div>
                ))
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="serviceCost">Costo de los servicios *</Label>
          <Input
            id="serviceCost"
            type="number"
            value={formData.serviceCost}
            onChange={(e) => setFormData(prev => ({ ...prev, serviceCost: e.target.value }))}
            placeholder="0"
            required
          />
        </div>

        {/* Resumen de Totales */}
        {(formData.selectedPurchases.length > 0 || formData.serviceCost) && (
          <div className="border-t pt-4">
            <Label className="text-lg font-semibold">Resumen de la Venta</Label>
            <div className="mt-3 space-y-2 bg-gray-50 p-4 rounded-lg">
              {/* Subtotales de compras */}
              {formData.selectedPurchases.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Compras Asociadas:</p>
                  {getSelectedPurchaseProducts().map((purchase: any) => (
                    <div key={purchase.id} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{purchase.invoiceNumber}:</span>
                      <span className="font-medium">${purchase.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Costo de servicios */}
              {formData.serviceCost && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Servicios:</span>
                  <span className="font-medium">${parseInt(formData.serviceCost || '0').toLocaleString()}</span>
                </div>
              )}

              {/* Total general */}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    ${(
                      getSelectedPurchaseProducts().reduce((sum: number, p: any) => sum + p.total, 0) +
                      parseInt(formData.serviceCost || '0')
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="notes">Observaciones</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Observaciones adicionales..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Crear Venta
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}