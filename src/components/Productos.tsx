import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Switch } from './ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, Package, CheckCircle, XCircle, DollarSign, Tag } from 'lucide-react';
import { toast } from 'sonner';

const categories = [{ id: 1, name: 'Repuestos de Motor' }, { id: 2, name: 'Sistema de Frenos' }, { id: 3, name: 'Transmisión' }, { id: 4, name: 'Sistema Eléctrico' }, { id: 5, name: 'Carrocería' }, { id: 6, name: 'Aceites y Lubricantes' }];
const brands = ['Auteco', 'Yamaha', 'Honda', 'Suzuki', 'Kawasaki', 'Bajaj', 'TVS', 'KTM', 'Genérica', 'Otra'];
const initialProducts = [
  { id: 1, name: 'Pastillas de Freno Delanteras', description: 'Pastillas de freno para motocicletas deportivas', brand: 'Yamaha', categoryId: 2, categoryName: 'Sistema de Frenos', quantity: 3, unitPrice: 35000, status: 'Activo' },
  { id: 2, name: 'Aceite de Motor 10W-40', description: 'Aceite sintético para motores de 4 tiempos', brand: 'Honda', categoryId: 6, categoryName: 'Aceites y Lubricantes', quantity: 2, unitPrice: 45000, status: 'Activo' },
  { id: 3, name: 'Cadena de Transmisión 520', description: 'Cadena reforzada para motocicletas', brand: 'Kawasaki', categoryId: 3, categoryName: 'Transmisión', quantity: 1, unitPrice: 85000, status: 'Activo' },
  { id: 4, name: 'Batería 12V 7AH', description: 'Batería libre de mantenimiento', brand: 'Auteco', categoryId: 4, categoryName: 'Sistema Eléctrico', quantity: 2, unitPrice: 120000, status: 'Activo' },
  { id: 5, name: 'Filtro de Aire K&N', description: 'Filtro de aire de alto rendimiento', brand: 'KTM', categoryId: 1, categoryName: 'Repuestos de Motor', quantity: 0, unitPrice: 75000, status: 'Inactivo' },
  { id: 6, name: 'Piñón de Ataque 15T', description: 'Piñón de ataque endurecido', brand: 'Suzuki', categoryId: 3, categoryName: 'Transmisión', quantity: 4, unitPrice: 25000, status: 'Activo' }
];

export function Productos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState(initialProducts);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => {} });

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()) || p.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
  const paginated = filtered.slice((currentPage - 1) * 2, currentPage * 2);
  const totalPages = Math.ceil(filtered.length / 2);

  const handleSave = (data: any) => {
    const cat = categories.find(c => c.id === parseInt(data.categoryId));
    const newProd = { ...data, categoryId: parseInt(data.categoryId), categoryName: cat?.name || '', quantity: parseInt(data.quantity), unitPrice: parseInt(data.unitPrice) };
    editingProduct ? setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...newProd } : p)) : setProducts([...products, { id: Date.now(), ...newProd, status: 'Activo' }]);
    setIsDialogOpen(false);
    toast.success(`Producto ${editingProduct ? 'actualizado' : 'creado'} exitosamente`);
  };

  const getCatColor = (n: string) => {
    const c: any = { 'Repuestos de Motor': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', 'Sistema de Frenos': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 'Transmisión': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', 'Sistema Eléctrico': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 'Carrocería': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 'Aceites y Lubricantes': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' };
    return c[n] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const stats = [{ icon: Package, color: 'text-blue-600', label: 'Total Productos', val: products.length }, { icon: CheckCircle, color: 'text-green-600', label: 'Activos', val: products.filter(p => p.status === 'Activo').length }, { icon: XCircle, color: 'text-red-600', label: 'Inactivos', val: products.filter(p => p.status === 'Inactivo').length }, { icon: DollarSign, color: 'text-purple-600', label: 'Precio Promedio', val: `$${Math.round(products.reduce((s, p) => s + p.unitPrice, 0) / products.length || 0).toLocaleString()}` }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={() => setEditingProduct(null)} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Nuevo Producto</Button></DialogTrigger>
          <ProductDialog product={editingProduct} onSave={handleSave} />
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{stats.map((s, i) => (<Card key={i}><CardContent className="flex items-center p-6"><s.icon className={`w-8 h-8 ${s.color} mr-4`} /><div><p className="text-2xl font-bold">{s.val}</p><p className="text-muted-foreground">{s.label}</p></div></CardContent></Card>))}</div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /> Productos ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Marca</TableHead><TableHead>Categoría</TableHead><TableHead>Cantidad</TableHead><TableHead>Precio</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              {paginated.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><p className="font-medium">{p.name}</p></TableCell>
                  <TableCell><div className="flex items-center gap-1 text-sm"><Tag className="w-3 h-3" /> {p.brand}</div></TableCell>
                  <TableCell><Badge className={getCatColor(p.categoryName)}>{p.categoryName}</Badge></TableCell>
                  <TableCell><p className={`font-medium ${p.quantity === 0 ? 'text-red-600 dark:text-red-400' : p.quantity <= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>{p.quantity} uds</p></TableCell>
                  <TableCell><p className="font-medium">${p.unitPrice.toLocaleString()}</p></TableCell>
                  <TableCell><div className="flex items-center gap-2"><Switch checked={p.status === 'Activo'} onCheckedChange={() => { setProducts(products.map(prod => prod.id === p.id ? { ...prod, status: prod.status === 'Activo' ? 'Inactivo' : 'Activo' } : prod)); toast.success('Estado actualizado'); }} /><span className="text-sm">{p.status}</span></div></TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setViewingProduct(p)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingProduct(p); setIsDialogOpen(true); }} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDialog({ open: true, title: 'Eliminar Producto', description: '¿Confirmar?', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => { setProducts(products.filter(prod => prod.id !== p.id)); toast.success('Producto eliminado'); } })} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 flex justify-center">
            <Pagination><PaginationContent>
              {totalPages > 1 && <PaginationItem><PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="cursor-pointer" /></PaginationItem>}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (<PaginationItem key={p}><PaginationLink onClick={() => setCurrentPage(p)} isActive={currentPage === p} className="cursor-pointer">{p}</PaginationLink></PaginationItem>))}
              {totalPages > 1 && <PaginationItem><PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="cursor-pointer" /></PaginationItem>}
            </PaginationContent></Pagination>
          </div>
        </CardContent>
      </Card>
      <Dialog open={!!viewingProduct} onOpenChange={() => setViewingProduct(null)}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Detalles del Producto</DialogTitle></DialogHeader>
          {viewingProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nombre</Label><p className="font-medium">{viewingProduct.name}</p></div>
                <div><Label>Marca</Label><p className="font-medium">{viewingProduct.brand}</p></div>
                <div><Label>Categoría</Label><Badge className={getCatColor(viewingProduct.categoryName)}>{viewingProduct.categoryName}</Badge></div>
                <div><Label>Cantidad</Label><p className={`font-medium ${viewingProduct.quantity === 0 ? 'text-red-600' : 'text-green-600'}`}>{viewingProduct.quantity} uds</p></div>
                <div><Label>Precio Unitario</Label><p className="font-medium">${viewingProduct.unitPrice.toLocaleString()}</p></div>
                <div><Label>Estado</Label><Badge className={viewingProduct.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}>{viewingProduct.status}</Badge></div>
              </div>
              <div><Label>Descripción</Label><p className="mt-1 p-3 bg-muted/50 rounded">{viewingProduct.description}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={confirmDialog.open} onOpenChange={o => setConfirmDialog(p => ({ ...p, open: o }))} {...confirmDialog} />
    </div>
  );
}

function ProductDialog({ product, onSave }: any) {
  const [form, setForm] = useState({ name: product?.name || '', description: product?.description || '', categoryId: product?.categoryId?.toString() || '', quantity: product?.quantity?.toString() || '', unitPrice: product?.unitPrice?.toString() || '', brand: product?.brand || '' });
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{product ? 'Editar' : 'Nuevo'} Producto</DialogTitle></DialogHeader>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Nombre</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div><Label>Marca</Label><select value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full h-10 px-3 border rounded-md bg-background" required>
            <option value="">Marca...</option>{brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select></div>
          <div><Label>Categoría</Label><select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full h-10 px-3 border rounded-md bg-background" required>
            <option value="">Categoría...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
          <div><Label>Cantidad</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></div>
        </div>
        <div><Label>Descripción</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required /></div>
        <div><Label>Precio Unitario</Label><Input type="number" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} required /></div>
        <div className="flex justify-end"><Button type="submit" className="bg-blue-600 hover:bg-blue-700">{product ? 'Actualizar' : 'Crear'}</Button></div>
      </form>
    </DialogContent>
  );
}
