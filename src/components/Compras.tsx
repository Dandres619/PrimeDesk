import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { PDFPreviewDialog } from './PDFPreviewDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { 
  Plus, 
  Search, 
  Eye, 
  FileText, 
  CalendarIcon,
  Trash2,
  X,
  ShoppingCart,
  TrendingUp,

  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export function Compras() {
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const [viewingPurchase, setViewingPurchase] = useState<any>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [purchaseToCancel, setPurchaseToCancel] = useState<any>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  // Productos disponibles (simulando datos del módulo de productos)
  const [availableProducts] = useState([
    {
      id: 1,
      name: 'Pastillas de Freno Delanteras',
      categoryName: 'Sistema de Frenos',
      quantity: 3,
      unitPrice: 35000,
      status: 'Activo'
    },
    {
      id: 2,
      name: 'Aceite de Motor 10W-40',
      categoryName: 'Aceites y Lubricantes',
      quantity: 2,
      unitPrice: 45000,
      status: 'Activo'
    },
    {
      id: 3,
      name: 'Cadena de Transmisión 520',
      categoryName: 'Transmisión',
      quantity: 1,
      unitPrice: 85000,
      status: 'Activo'
    },
    {
      id: 4,
      name: 'Batería 12V 7AH',
      categoryName: 'Sistema Eléctrico',
      quantity: 2,
      unitPrice: 120000,
      status: 'Activo'
    },
    {
      id: 5,
      name: 'Filtro de Aire K&N',
      categoryName: 'Repuestos de Motor',
      quantity: 0,
      unitPrice: 75000,
      status: 'Inactivo'
    },
    {
      id: 6,
      name: 'Piñón de Ataque 15T',
      categoryName: 'Transmisión',
      quantity: 4,
      unitPrice: 25000,
      status: 'Activo'
    }
  ]);

  // Proveedores (simulando datos del módulo de proveedores)
  const [suppliers] = useState([
    { id: 1, name: 'Repuestos Yamaha Colombia', contact: 'Carlos Rodríguez', phone: '+57 311 234 5678', email: 'carlos@yamahacol.com' },
    { id: 2, name: 'Honda Parts Ltda', contact: 'María González', phone: '+57 312 345 6789', email: 'maria@hondaparts.com' },
    { id: 3, name: 'Suzuki Repuestos', contact: 'Juan Pérez', phone: '+57 313 456 7890', email: 'juan@suzukirep.com' },
    { id: 4, name: 'KTM Colombia', contact: 'Ana López', phone: '+57 314 567 8901', email: 'ana@ktmcol.com' }
  ]);

  // Compras (datos de ejemplo)
  const [purchases, setPurchases] = useState([
    {
      id: 1,
      invoiceNumber: 'COMP-001',
      supplierId: 1,
      supplier: 'Repuestos Yamaha Colombia',
      supplierContact: 'Carlos Rodríguez',
      supplierPhone: '+57 311 234 5678',
      supplierEmail: 'carlos@yamahacol.com',
      date: '2024-01-15',
      status: 'Completada',
      items: [
        { 
          id: 1, 
          productId: 2,
          productName: 'Aceite de Motor 10W-40',
          categoryName: 'Aceites y Lubricantes',
          quantity: 2, 
          unitPrice: 45000, 
          total: 90000 
        },
        { 
          id: 2, 
          productId: 1,
          productName: 'Pastillas de Freno Delanteras',
          categoryName: 'Sistema de Frenos',
          quantity: 3, 
          unitPrice: 35000, 
          total: 105000 
        }
      ],
      subtotal: 195000,
      tax: 37050,
      total: 232050,
      notes: 'Compra regular mensual - productos de alta rotación'
    },
    {
      id: 2,
      invoiceNumber: 'COMP-002',
      supplierId: 4,
      supplier: 'KTM Colombia',
      supplierContact: 'Ana López',
      supplierPhone: '+57 314 567 8901',
      supplierEmail: 'ana@ktmcol.com',
      date: '2024-01-20',
      status: 'Completada',
      items: [
        { 
          id: 1, 
          productId: 4,
          productName: 'Batería 12V 7AH',
          categoryName: 'Sistema Eléctrico',
          quantity: 2, 
          unitPrice: 120000, 
          total: 240000 
        }
      ],
      subtotal: 240000,
      tax: 45600,
      total: 285600,
      notes: 'Repuesto especializado para modelos KTM'
    },
    {
      id: 3,
      invoiceNumber: 'COMP-003',
      supplierId: 2,
      supplier: 'Honda Parts Ltda',
      supplierContact: 'María González',
      supplierPhone: '+57 312 345 6789',
      supplierEmail: 'maria@hondaparts.com',
      date: '2024-01-22',
      status: 'Anulada',
      items: [
        { 
          id: 1, 
          productId: 3,
          productName: 'Cadena de Transmisión 520',
          categoryName: 'Transmisión',
          quantity: 1, 
          unitPrice: 85000, 
          total: 85000 
        }
      ],
      subtotal: 85000,
      tax: 16150,
      total: 101150,
      notes: 'Compra anulada por defecto en el producto'
    }
  ]);

  // Funciones utilitarias
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Anulada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Paginación
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPurchases = filteredPurchases.slice(startIndex, startIndex + itemsPerPage);

  const handleSavePurchase = (purchaseData: any) => {
    const subtotal = purchaseData.items.reduce((sum: number, item: any) => sum + item.total, 0);
    const tax = subtotal * 0.19;
    const total = subtotal + tax;

    const newPurchase = {
      ...purchaseData,
      id: editingPurchase ? editingPurchase.id : purchases.length + 1,
      invoiceNumber: editingPurchase ? editingPurchase.invoiceNumber : `COMP-${String(purchases.length + 1).padStart(3, '0')}`,
      supplier: suppliers.find(s => s.id === parseInt(purchaseData.supplierId))?.name || '',
      supplierContact: suppliers.find(s => s.id === parseInt(purchaseData.supplierId))?.contact || '',
      supplierPhone: suppliers.find(s => s.id === parseInt(purchaseData.supplierId))?.phone || '',
      supplierEmail: suppliers.find(s => s.id === parseInt(purchaseData.supplierId))?.email || '',
      status: 'Completada',
      subtotal,
      tax,
      total
    };

    if (editingPurchase) {
      setPurchases(purchases.map(p => p.id === editingPurchase.id ? newPurchase : p));
      toast.success('Compra actualizada exitosamente');
    } else {
      setPurchases([...purchases, newPurchase]);
      toast.success('Compra creada exitosamente');
    }

    setEditingPurchase(null);
    setShowNewDialog(false);
  };

  const handleCancelPurchase = () => {
    if (purchaseToCancel) {
      setPurchases(purchases.map(p => 
        p.id === purchaseToCancel.id 
          ? { ...p, status: 'Anulada' }
          : p
      ));
      setPurchaseToCancel(null);
      setShowConfirmDialog(false);
      toast.success('Compra anulada exitosamente');
    }
  };

  const handleGeneratePDF = (purchase: any) => {
    setPdfData({
      invoiceNumber: purchase.invoiceNumber,
      date: purchase.date,
      status: purchase.status,
      supplier: purchase.supplier,
      supplierContact: purchase.supplierContact,
      supplierPhone: purchase.supplierPhone,
      supplierEmail: purchase.supplierEmail,
      items: purchase.items.map((item: any) => ({
        product: item.productName,
        category: item.categoryName,
        quantity: item.quantity,
        unitCost: item.unitPrice,
        total: item.total
      })),
      subtotal: purchase.subtotal,
      tax: purchase.tax,
      total: purchase.total,
      notes: purchase.notes
    });
    setShowPDFPreview(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar compras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={() => setShowNewDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Compra
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <ShoppingCart className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{purchases.length}</p>
              <p className="text-muted-foreground">Total Compras</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="w-8 h-8 text-red-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{purchases.filter(p => p.status === 'Anulada').length}</p>
              <p className="text-muted-foreground">Anuladas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                ${purchases.filter(p => p.status === 'Completada').reduce((sum, p) => sum + p.total, 0).toLocaleString()}
              </p>
              <p className="text-muted-foreground">Total Invertido</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Compras ({filteredPurchases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compra</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{purchase.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {purchase.items.length} producto{purchase.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{purchase.supplier}</p>
                      <p className="text-sm text-muted-foreground">{purchase.supplierContact}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p>{format(new Date(purchase.date), 'PPP', { locale: es })}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">${purchase.total.toLocaleString()}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingPurchase(purchase)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGeneratePDF(purchase)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {purchase.status === 'Completada' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPurchaseToCancel(purchase);
                            setShowConfirmDialog(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Details Dialog */}
      <Dialog open={!!viewingPurchase} onOpenChange={() => setViewingPurchase(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh]">
          <DialogHeader>
            <DialogTitle>Detalles de la Compra</DialogTitle>
          </DialogHeader>
          
          {viewingPurchase && (
            <div className="space-y-4 max-h-[calc(95vh-8rem)] overflow-y-auto">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Información de la Compra</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <Label className="text-xs">Número de Compra</Label>
                      <p className="font-medium">{viewingPurchase.invoiceNumber}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Fecha</Label>
                      <p>{format(new Date(viewingPurchase.date), 'PPP', { locale: es })}</p>
                    </div>
                    {viewingPurchase.status === 'Anulada' && (
                      <div>
                        <Label className="text-xs">Estado</Label>
                        <Badge className={getStatusColor(viewingPurchase.status)}>
                          {viewingPurchase.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Información del Proveedor</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <Label className="text-xs">Proveedor</Label>
                      <p className="font-medium">{viewingPurchase.supplier}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Contacto</Label>
                      <p>{viewingPurchase.supplierContact}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Teléfono</Label>
                      <p>{viewingPurchase.supplierPhone}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Email</Label>
                      <p>{viewingPurchase.supplierEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">Productos</h4>
                <div className="border rounded-lg">
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs w-[35%]">Producto</TableHead>
                        <TableHead className="text-xs w-[20%]">Categoría</TableHead>
                        <TableHead className="text-xs w-[15%] text-center">Cantidad</TableHead>
                        <TableHead className="text-xs w-[15%] text-right">Precio Unitario</TableHead>
                        <TableHead className="text-xs w-[15%] text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingPurchase.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm">{item.productName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{item.categoryName}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-center">{item.quantity}</TableCell>
                          <TableCell className="text-sm text-right">${item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-sm text-right">${item.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-3">
                <div className="flex justify-end">
                  <div className="space-y-1 min-w-[200px] text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${viewingPurchase.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (19%):</span>
                      <span>${viewingPurchase.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>Total:</span>
                      <span>${viewingPurchase.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewingPurchase.notes && (
                <div>
                  <Label className="text-xs">Notas</Label>
                  <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{viewingPurchase.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New/Edit Purchase Dialog */}
      <Dialog open={showNewDialog || !!editingPurchase} onOpenChange={() => {
        setShowNewDialog(false);
        setEditingPurchase(null);
      }}>
        <PurchaseDialog 
          purchase={editingPurchase}
          suppliers={suppliers}
          availableProducts={availableProducts.filter(p => p.status === 'Activo')}
          onSave={handleSavePurchase}
        />
      </Dialog>

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        data={pdfData}
        type="purchase"
        onGenerate={() => {
          console.log('Generating PDF...', pdfData);
        }}
      />

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Anular Compra"
        description={`¿Estás seguro de que deseas anular la compra ${purchaseToCancel?.invoiceNumber}? Esta acción no se puede deshacer.`}
        confirmText="Anular Compra"
        onConfirm={handleCancelPurchase}
        variant="destructive"
      />
    </div>
  );
}

// Component for Purchase Dialog with FIXED logic
function PurchaseDialog({ purchase, suppliers, availableProducts, onSave }: any) {
  const [date, setDate] = useState<Date | undefined>(
    purchase?.date ? new Date(purchase.date) : new Date()
  );
  
  const [formData, setFormData] = useState({
    supplierId: purchase?.supplierId || '',
    date: purchase?.date || format(new Date(), 'yyyy-MM-dd'),
    notes: purchase?.notes || ''
  });

  const [items, setItems] = useState(purchase?.items || [
    { id: 1, productId: '', productName: '', categoryName: '', quantity: 0, unitPrice: 0, total: 0 }
  ]);

  const addItem = () => {
    const newId = Math.max(...items.map((item: any) => item.id), 0) + 1;
    setItems([...items, { 
      id: newId, 
      productId: '', 
      productName: '',
      categoryName: '',
      quantity: 0, 
      unitPrice: 0, 
      total: 0 
    }]);
  };

  const removeItem = (itemId: number) => {
    setItems(items.filter((item: any) => item.id !== itemId));
  };

  const updateItem = (itemId: number, field: string, value: any) => {
    setItems(prevItems => prevItems.map((item: any) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'productId') {
          if (value) {
            const product = availableProducts.find((p: any) => p.id === parseInt(value));
            if (product) {
              updatedItem.productName = product.name;
              updatedItem.categoryName = product.categoryName;
              updatedItem.quantity = product.quantity;
              updatedItem.unitPrice = product.unitPrice;
              updatedItem.total = product.quantity * product.unitPrice;
            }
          } else {
            // Si no se selecciona producto, limpiar los campos
            updatedItem.productName = '';
            updatedItem.categoryName = '';
            updatedItem.quantity = 0;
            updatedItem.unitPrice = 0;
            updatedItem.total = 0;
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const getSelectedProductIds = () => {
    return items.filter((item: any) => item.productId).map((item: any) => parseInt(item.productId));
  };

  const getAvailableProductsForItem = (currentItemId: number) => {
    const currentItem = items.find((item: any) => item.id === currentItemId);
    const currentProductId = currentItem?.productId ? parseInt(currentItem.productId) : null;
    const selectedIds = getSelectedProductIds();
    
    return availableProducts.filter((product: any) => 
      !selectedIds.includes(product.id) || product.id === currentProductId
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    
    const finalData = {
      ...formData,
      date: format(date, 'yyyy-MM-dd'),
      items: items.filter((item: any) => item.productId && item.total > 0)
    }

    if (finalData.items.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }
    
    onSave(finalData);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);
    const tax = subtotal * 0.19;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <DialogContent className="max-w-6xl max-h-[95vh]">
      <DialogHeader>
        <DialogTitle>{purchase ? 'Editar Compra' : 'Nueva Compra'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(95vh-8rem)] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="supplierId">Proveedor</Label>
            <select
              id="supplierId"
              value={formData.supplierId}
              onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Seleccionar proveedor</option>
              {suppliers.map((supplier: any) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Productos</h4>
            <Button 
              type="button" 
              onClick={addItem} 
              variant="outline" 
              size="sm"
              disabled={getSelectedProductIds().length >= availableProducts.length}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
          
          <div className="space-y-3">
            {items.map((item: any, index: number) => (
              <div key={item.id} className="grid grid-cols-6 gap-2 items-end p-3 border border-gray-200 rounded-lg">
                <div className="col-span-2">
                  <Label>Producto</Label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {getAvailableProductsForItem(item.id).map((product: any) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (${product.unitPrice.toLocaleString()})
                      </option>
                    ))}
                  </select>
                  {item.productName && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">{item.productName}</p>
                  )}
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    value={item.quantity || ''}
                    disabled
                    className="bg-gray-50 text-center"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Precio Unit.</Label>
                  <Input
                    value={item.unitPrice > 0 ? `$${item.unitPrice.toLocaleString()}` : ''}
                    disabled
                    className="bg-gray-50"
                    placeholder="$0"
                  />
                </div>
                <div>
                  <Label>Total</Label>
                  <Input
                    value={item.total > 0 ? `$${item.total.toLocaleString()}` : ''}
                    disabled
                    className="bg-gray-50"
                    placeholder="$0"
                  />
                </div>
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="text-red-600 px-2 w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="space-y-2 min-w-[250px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (19%):</span>
                <span>${tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notas adicionales sobre la compra..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {purchase ? 'Actualizar Compra' : 'Crear Compra'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}