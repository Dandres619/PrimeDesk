import React, { useState } from 'react';
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
  TrendingUp,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export function Ventas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<any>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  
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
    onConfirm: () => {}
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

  const [sales, setSales] = useState([
    { 
      id: 1, 
      date: '2024-01-16',
      invoiceNumber: 'VEN-001',
      serviceOrderId: 1,
      serviceOrderNumber: 'OS-001',
      clientId: 1,
      clientName: 'Juan Carlos Pérez',
      clientPhone: '+57 300 123 4567',
      clientDocument: '12345678',
      clientEmail: 'juan.perez@email.com',
      clientAddress: 'Calle 123 #45-67, Chapinero',
      motorcycleId: 1,
      motorcycleBrand: 'Honda',
      motorcycleModel: 'CB600F',
      motorcyclePlate: 'ABC123',
      motorcycleYear: '2020',
      serviceTypes: ['Mantenimiento Preventivo', 'Cambio de Aceite'],
      purchaseIds: [1, 2],
      purchaseInvoices: ['COMP-001', 'COMP-002'],
      parts: [
        { id: 1, product: 'Aceite Motor 10W-40', quantity: 1, unitCost: 25000, total: 25000 },
        { id: 2, product: 'Filtro de Aceite', quantity: 1, unitCost: 15000, total: 15000 }
      ],
      serviceCost: 80000,
      partsCost: 40000,
      partsTotal: 40000,
      subtotal: 120000,
      tax: 22800,
      total: 142800,
      notes: 'Mantenimiento según programación',
      anulada: false
    },
    { 
      id: 2, 
      date: '2024-01-22',
      invoiceNumber: 'VEN-002',
      serviceOrderId: 2,
      serviceOrderNumber: 'OS-002',
      clientId: 2,
      clientName: 'María García López',
      clientPhone: '+57 301 234 5678',
      clientDocument: '87654321',
      clientEmail: 'maria.garcia@email.com',
      clientAddress: 'Carrera 67 #89-12, El Poblado',
      motorcycleId: 2,
      motorcycleBrand: 'Yamaha',
      motorcycleModel: 'R6',
      motorcyclePlate: 'XYZ789',
      motorcycleYear: '2019',
      serviceTypes: ['Reparación de Frenos'],
      purchaseIds: [3],
      purchaseInvoices: ['COMP-003'],
      parts: [
        { id: 1, product: 'Pastillas de Freno R6', quantity: 1, unitCost: 80000, total: 80000 },
        { id: 2, product: 'Disco de Freno Delantero', quantity: 1, unitCost: 120000, total: 120000 }
      ],
      serviceCost: 150000,
      partsCost: 200000,
      partsTotal: 200000,
      subtotal: 350000,
      tax: 66500,
      total: 416500,
      notes: 'Reparación urgente, cliente esperando',
      anulada: false
    }
  ]);

  const clients = [
    { id: 1, name: 'Juan Carlos Pérez', phone: '+57 300 123 4567', document: '12345678', email: 'juan.perez@email.com', address: 'Calle 123 #45-67, Chapinero' },
    { id: 2, name: 'María García López', phone: '+57 301 234 5678', document: '87654321', email: 'maria.garcia@email.com', address: 'Carrera 67 #89-12, El Poblado' },
    { id: 3, name: 'Carlos Eduardo López', phone: '+57 302 345 6789', document: '11223344', email: 'carlos.lopez@email.com', address: 'Avenida 45 #12-34, Granada' }
  ];

  const motorcycles = [
    { id: 1, brand: 'Honda', model: 'CB600F', plate: 'ABC123', year: '2020', clientId: 1 },
    { id: 2, brand: 'Yamaha', model: 'R6', plate: 'XYZ789', year: '2019', clientId: 2 },
    { id: 3, brand: 'Suzuki', model: 'GSX-R750', plate: 'DEF456', year: '2021', clientId: 3 }
  ];

  const purchases = [
    { 
      id: 1, 
      invoiceNumber: 'COMP-001', 
      total: 40000, // 25000 + 15000
      items: [
        { id: 1, product: 'Aceite Motor 10W-40', category: 'Lubricantes', quantity: 1, unitCost: 25000 },
        { id: 2, product: 'Filtro de Aceite', category: 'Filtros', quantity: 1, unitCost: 15000 }
      ]
    },
    { 
      id: 2, 
      invoiceNumber: 'COMP-002', 
      total: 200000, // 80000 + 120000
      items: [
        { id: 1, product: 'Pastillas de Freno R6', category: 'Frenos', quantity: 1, unitCost: 80000 },
        { id: 2, product: 'Disco de Freno Delantero', category: 'Frenos', quantity: 1, unitCost: 120000 }
      ]
    },
    { 
      id: 3, 
      invoiceNumber: 'COMP-003', 
      total: 235000, // 150000 + 85000
      items: [
        { id: 1, product: 'Cadena de Transmisión', category: 'Transmisión', quantity: 1, unitCost: 150000 },
        { id: 2, product: 'Piñón Trasero', category: 'Transmisión', quantity: 1, unitCost: 85000 }
      ]
    }
  ];

  // Servicios disponibles (estos deberían venir del módulo de Servicios en una implementación real)
  const serviceTypes = [
    'Mantenimiento Preventivo',
    'Reparación de Motor',
    'Reparación de Frenos',
    'Cambio de Transmisión',
    'Diagnóstico General',
    'Personalización',
    'Cambio de Aceite',
    'Afinación'
  ];

  // Pedidos de servicio disponibles para vincular con ventas
  const serviceOrders = [
    { 
      id: 1,
      orderNumber: 'OS-001',
      clientId: 1,
      clientName: 'Juan Carlos Pérez',
      motorcycleId: 1,
      motorcycleBrand: 'Honda',
      motorcycleModel: 'CB600F',
      motorcyclePlate: 'ABC123',
      description: 'Mantenimiento preventivo y cambio de aceite',
      status: 'completado',
      associatedSaleId: 1
    },
    { 
      id: 2,
      orderNumber: 'OS-002',
      clientId: 2,
      clientName: 'María García López',
      motorcycleId: 2,
      motorcycleBrand: 'Yamaha',
      motorcycleModel: 'R6',
      motorcyclePlate: 'XYZ789',
      description: 'Reparación sistema de frenos - Cambio de pastillas y discos',
      status: 'completado',
      associatedSaleId: 2
    },
    { 
      id: 3,
      orderNumber: 'OS-003',
      clientId: 1,
      clientName: 'Juan Carlos Pérez',
      motorcycleId: 1,
      motorcycleBrand: 'Honda',
      motorcycleModel: 'CB600F',
      motorcyclePlate: 'ABC123',
      description: 'Reparación de transmisión',
      status: 'completado',
      associatedSaleId: null
    },
    { 
      id: 4,
      orderNumber: 'OS-004',
      clientId: 3,
      clientName: 'Carlos Eduardo López',
      motorcycleId: 3,
      motorcycleBrand: 'Suzuki',
      motorcycleModel: 'GSX-R750',
      motorcyclePlate: 'DEF456',
      description: 'Diagnóstico general y afinación',
      status: 'completado',
      associatedSaleId: null
    }
  ];

  const filteredSales = sales.filter(sale => 
    sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.motorcycleBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.motorcycleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.motorcyclePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveSale = (saleData: any) => {
    const client = clients.find(c => c.id === parseInt(saleData.clientId));
    const motorcycle = motorcycles.find(m => m.id === parseInt(saleData.motorcycleId));
    const serviceOrder = serviceOrders.find(so => so.id === parseInt(saleData.serviceOrderId));
    
    // Obtener productos de las compras seleccionadas
    const selectedPurchases = purchases.filter(p => saleData.selectedPurchases.includes(p.id));
    const allProducts = selectedPurchases.flatMap(purchase => 
      purchase.items.map(item => ({
        ...item,
        purchaseInvoice: purchase.invoiceNumber,
        quantity: 1, // Por defecto 1, en una implementación real sería configurable
        total: item.unitCost * 1
      }))
    );
    
    // Calcular totales
    const partsCost = allProducts.reduce((sum: number, part: any) => sum + (part.quantity * part.unitCost), 0);
    const partsTotal = allProducts.reduce((sum: number, part: any) => sum + part.total, 0);
    const subtotal = partsTotal + parseInt(saleData.serviceCost);
    const tax = subtotal * 0.19;
    const total = subtotal + tax;

    const purchaseInvoices = saleData.selectedPurchases.map((id: number) => 
      purchases.find((p: any) => p.id === id)?.invoiceNumber || ''
    );

    const completeData = {
      ...saleData,
      serviceOrderId: serviceOrder?.id || null,
      serviceOrderNumber: serviceOrder?.orderNumber || '',
      clientName: client?.name || '',
      clientPhone: client?.phone || '',
      clientDocument: client?.document || '',
      clientEmail: client?.email || '',
      clientAddress: client?.address || '',
      motorcycleBrand: motorcycle?.brand || '',
      motorcycleModel: motorcycle?.model || '',
      motorcyclePlate: motorcycle?.plate || '',
      motorcycleYear: motorcycle?.year || '',
      purchaseInvoices,
      parts: allProducts,
      partsCost,
      partsTotal,
      subtotal,
      tax,
      total,
      serviceCost: parseInt(saleData.serviceCost),
      serviceTypes: saleData.selectedServices,
      anulada: false
    };

    const newSale = { 
      id: Date.now(), 
      ...completeData,
      invoiceNumber: `VEN-${(sales.length + 1).toString().padStart(3, '0')}`
    };
    setSales([...sales, newSale]);
    setIsDialogOpen(false);
    toast.success('Venta creada exitosamente');
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

  const cancelSale = (saleId: number) => {
    setSales(sales.map(sale => 
      sale.id === saleId 
        ? { ...sale, anulada: true }
        : sale
    ));
    toast.success('Venta anulada exitosamente');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ventas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{sales.filter(s => !s.anulada).length}</p>
              <p className="text-muted-foreground">Total Ventas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                ${sales.filter(s => !s.anulada).reduce((sum, s) => sum + s.total, 0).toLocaleString()}
              </p>
              <p className="text-muted-foreground">Ingresos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="w-8 h-8 text-red-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{sales.filter(s => s.anulada).length}</p>
              <p className="text-muted-foreground">Anuladas</p>
            </div>
          </CardContent>
        </Card>
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
                <TableHead>Cliente</TableHead>
                <TableHead>Moto</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sale.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(sale.date), 'PPP', { locale: es })}
                      </p>
                      {sale.anulada && (
                        <Badge className="bg-red-100 text-red-800 mt-1">
                          Anulada
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sale.clientName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sale.motorcycleBrand} {sale.motorcycleModel}</p>
                      <p className="text-sm text-muted-foreground">
                        Placa: {sale.motorcyclePlate}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sale.serviceTypes.join(', ')}</p>
                      <p className="text-sm text-muted-foreground">{sale.parts.length} repuestos</p>
                      <p className="text-sm text-muted-foreground">
                        Servicios: ${sale.serviceCost.toLocaleString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">${sale.total.toLocaleString()}</p>
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
              ))}
            </TableBody>
          </Table>
          
          {/* Paginación */}
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                )}
                
                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => totalPages > 1 ? setCurrentPage(page) : undefined}
                      isActive={currentPage === page}
                      className={totalPages > 1 ? "cursor-pointer" : "cursor-default"}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                )}
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
                      <Label>Pedido de Servicio</Label>
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
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${viewingSale.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IVA (19%):</span>
                        <span>${viewingSale.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
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

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        selectedServices: [...prev.selectedServices, service]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedServices: prev.selectedServices.filter(s => s !== service)
      }));
    }
  };

  const handleServiceOrderChange = (serviceOrderId: string) => {
    const selectedOrder = serviceOrders.find((order: any) => order.id === parseInt(serviceOrderId));
    
    setFormData(prev => ({
      ...prev,
      serviceOrderId,
      clientId: selectedOrder ? selectedOrder.clientId.toString() : '',
      motorcycleId: selectedOrder ? selectedOrder.motorcycleId.toString() : ''
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
          <Label htmlFor="serviceOrderId">Pedido de Servicio *</Label>
          <select
            id="serviceOrderId"
            value={formData.serviceOrderId}
            onChange={(e) => handleServiceOrderChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Seleccionar pedido de servicio</option>
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
            {serviceTypes.map((service: string) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={`service-${service}`}
                  checked={formData.selectedServices.includes(service)}
                  onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                />
                <Label htmlFor={`service-${service}`} className="text-sm">
                  {service}
                </Label>
              </div>
            ))}
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