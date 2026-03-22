import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { PDFPreviewDialog } from './PDFPreviewDialog';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Plus,
  Search,
  CalendarIcon,
  Trash2,
  ShoppingCart,
  TrendingUp,
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
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [motorbikes, setMotorbikes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnuling, setIsAnuling] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [purchaseToCancel, setPurchaseToCancel] = useState<any>(null);
  const [viewingPurchase, setViewingPurchase] = useState<any>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const itemsPerPage = 6;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchPurchases(), fetchSuppliers(), fetchProducts(), fetchMotorbikes()]);
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

  const fetchSuppliers = async () => {
    const response = await fetch(`${API_URL}/proveedores`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    setSuppliers(data);
  };

  const fetchProducts = async () => {
    const response = await fetch(`${API_URL}/productos`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    setAvailableProducts(data);
  };

  const fetchMotorbikes = async () => {
    const response = await fetch(`${API_URL}/motocicletas`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    setMotorbikes(data);
  };

  const filteredPurchases = purchases.filter((p: any) =>
    (p.ID_Compra?.toString() || '').includes(searchTerm.toLowerCase()) ||
    (p.NombreEmpresa || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedPurchases = filteredPurchases.slice(0, itemsPerPage);

  const handleSavePurchase = async (pData: any) => {
    if (!pData) { setShowNewDialog(false); return; }
    setIsSaving(true);
    try {
      const resp = await fetch(`${API_URL}/compras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          id_proveedor: parseInt(pData.supplierId),
          id_motocicleta: parseInt(pData.motorcycleId),
          fechacompra: pData.date,
          total: pData.total,
          notas: pData.notes,
          detalle: pData.items.map((it: any) => ({
            id_producto: parseInt(it.productId),
            cantidad: it.quantity,
            precio_unitario: it.unitPrice,
            subtotal: it.total
          }))
        })
      });
      if (!resp.ok) throw new Error('Error al guardar');
      toast.success('Compra registrada');
      fetchInitialData();
      setShowNewDialog(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

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
      case 'Anulado':
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
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar compras..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Nueva Compra
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="flex items-center p-6"><ShoppingCart className="w-8 h-8 text-blue-600 mr-4" /><div><p className="text-2xl font-bold">{purchases.length}</p><p className="text-muted-foreground">Total Compras</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-6"><XCircle className="w-8 h-8 text-red-600 mr-4" /><div><p className="text-2xl font-bold">{purchases.filter((p: any) => p.Estado === 'Anulado').length}</p><p className="text-muted-foreground">Anuladas</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-6"><TrendingUp className="w-8 h-8 text-purple-600 mr-4" /><div><p className="text-2xl font-bold">${purchases.filter((p: any) => p.Estado !== 'Anulado').reduce((s: any, p: any) => s + parseFloat(p.Total), 0).toLocaleString()}</p><p className="text-muted-foreground">Total Invertido</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Compras ({filteredPurchases.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Compra</TableHead><TableHead>Proveedor</TableHead><TableHead>Fecha</TableHead><TableHead>Total</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              {paginatedPurchases.map((p: any) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <PurchaseDialog suppliers={suppliers} availableProducts={availableProducts} motorbikes={motorbikes} onSave={handleSavePurchase} isSaving={isSaving} />
      </Dialog>

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

function PurchaseDialog({ suppliers, availableProducts, motorbikes, onSave, isSaving }: any) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({ supplierId: '', motorcycleId: '', notes: '' });
  const [items, setItems] = useState<any[]>([{ id: Date.now(), productId: '', quantity: 0, unitPrice: '', total: 0 }]);

  const addItem = () => {
    if (items.length < availableProducts.length) {
      setItems([...items, { id: Date.now(), productId: '', quantity: 0, unitPrice: '', total: 0 }]);
    }
  };

  const updateItem = (id: number, f: string, v: any) => {
    setItems(items.map(it => {
      if (it.id === id) {
        const up = { ...it, [f]: v };
        if (f === 'productId') {
          const p = availableProducts.find((prod: any) => prod.ID_Producto === parseInt(v));
          if (p) { up.quantity = p.Cantidad; up.unitPrice = ''; up.total = 0; }
          else { up.quantity = 0; up.unitPrice = ''; up.total = 0; }
        } else if (f === 'unitPrice') {
          up.unitPrice = v === '' ? '' : parseFloat(v);
          up.total = (up.quantity || 0) * (parseFloat(v) || 0);
        }
        return up;
      }
      return it;
    }));
  };

  const total = items.reduce((s, it) => s + (it.total || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId) return toast.error('Debe seleccionar un proveedor');
    if (!date) return toast.error('Debe seleccionar una fecha');
    if (!formData.motorcycleId) return toast.error('Debe seleccionar una motocicleta');
    const validItems = items.filter(it => it.productId);
    if (validItems.length === 0) return toast.error('Agregue al menos un producto');

    for (const it of validItems) {
      const product = availableProducts.find((p: any) => p.ID_Producto === parseInt(it.productId));
      if (product && product.Cantidad === 0) return toast.error(`El producto "${product.Nombre}" tiene cantidad 0`);
      if (parseFloat(it.unitPrice) < 1000) return toast.error(`El precio de "${product?.Nombre}" debe ser mayor a 1000`);
    }

    onSave({ ...formData, date: format(date, 'yyyy-MM-dd HH:mm:ss'), items: validItems, total });
  };

  return (
    <DialogContent className="max-w-6xl">
      <DialogHeader><DialogTitle>Nueva Compra</DialogTitle></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6 pr-2 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Proveedor *</Label>
            <select value={formData.supplierId} onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })} className="w-full p-2 border rounded">
              <option value="">Seleccionar proveedor...</option>
              {suppliers.map((s: any) => <option key={s.ID_Proveedor} value={s.ID_Proveedor}>{s.NombreEmpresa}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Fecha de Compra *</Label>
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" className="w-full text-left font-normal border-gray-300"><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP", { locale: es }) : "Fecha"}</Button></PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} className="p-4" disabled={(d) => d > new Date()} style={{ '--cell-size': '45px' } as any} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Motocicleta *</Label>
          <select value={formData.motorcycleId} onChange={(e) => setFormData({ ...formData, motorcycleId: e.target.value })} className="w-full p-2 border rounded text-sm">
            <option value="">Seleccionar motocicleta...</option>
            {motorbikes.map((m: any) => <option key={m.ID_Motocicleta} value={m.ID_Motocicleta}>{m.Placa} - {m.NombreCliente} {m.ApellidoCliente}</option>)}
          </select>
        </div>
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center mb-2"><h4 className="font-semibold">Productos</h4><Button type="button" onClick={addItem} variant="outline" size="sm" disabled={items.length >= availableProducts.length}><Plus className="w-4 h-4 mr-1" /> Agregar Producto</Button></div>
          {items.map((it) => (
            <div key={it.id} className="grid grid-cols-6 gap-2 items-end p-3 border rounded-lg bg-white shadow-sm">
              <div className="col-span-2"><Label className="text-xs">Producto</Label>
                <select value={it.productId} onChange={(e) => updateItem(it.id, 'productId', e.target.value)} className="w-full p-2 border rounded-md text-sm">
                  <option value="">Seleccionar</option>
                  {availableProducts.filter((p: any) => !items.some(selected => selected.productId === p.ID_Producto.toString() && selected.id !== it.id)).map((p: any) => <option key={p.ID_Producto} value={p.ID_Producto}>{p.Nombre}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Cantidad</Label><Input type="number" value={it.quantity} readOnly className="bg-gray-100 text-center" /></div>
              <div><Label className="text-xs">Precio</Label>
                <Input type="number" value={it.unitPrice} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} onChange={(e) => updateItem(it.id, 'unitPrice', e.target.value)} placeholder="0.00" />
              </div>
              <div><Label className="text-xs">Subtotal</Label><div className="h-10 flex items-center font-bold px-2">${(it.total || 0).toLocaleString()}</div></div>
              <div className="flex justify-center pb-1"><Button type="button" variant="ghost" className="text-red-500" onClick={() => setItems(items.filter((i: any) => i.id !== it.id))} disabled={items.length === 1}><Trash2 className="w-5 h-5" /></Button></div>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t mt-6 space-y-4">
          <div className="space-y-2 w-full"><Label className="text-xs uppercase font-bold text-muted-foreground">Observaciones</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="h-20 resize-none" placeholder="Notas de la compra..." /></div>
          <div className="flex justify-between items-center">
            <div className="text-left"><p className="text-xs text-muted-foreground uppercase font-semibold">Total Compra</p><div className="text-3xl font-black text-blue-600">${total.toLocaleString()}</div></div>
            <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => onSave(null)} className="px-6 h-11">Cerrar</Button><Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 px-8 h-11 font-bold shadow-md">{isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Registrar Compra</Button></div>
          </div>
        </div>
      </form>
    </DialogContent>
  );
}