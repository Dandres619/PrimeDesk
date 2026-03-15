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
import { Plus, Search, Edit, Trash2, Eye, Package, CheckCircle, XCircle, Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function Productos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => { } });

  const headers = {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_URL}/productos`, { headers }),
        fetch(`${API_URL}/categorias`, { headers })
      ]);

      if (!prodRes.ok) {
        const err = await prodRes.json();
        throw new Error(err.message || 'Error al cargar productos');
      }
      if (!catRes.ok) {
        const err = await catRes.json();
        throw new Error(err.message || 'Error al cargar categorías');
      }

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setCategories(catData.map((c: any) => ({ id: c.ID_Categoria, name: c.Nombre })));
      setProducts(prodData.map((p: any) => ({
        id: p.ID_Producto,
        name: p.Nombre,
        description: p.Descripcion,
        brand: p.Marca,
        categoryId: p.ID_Categoria,
        categoryName: p.NombreCategoria,
        quantity: p.Cantidad,
        status: p.Estado ? 'Activo' : 'Inactivo'
      })));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: any) => {
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `${API_URL}/productos/${editingProduct.id}` : `${API_URL}/productos`;

      const payload = {
        id_categoria: parseInt(data.categoryId),
        nombre: data.name,
        marca: data.brand,
        cantidad: parseInt(data.quantity),
        descripcion: data.description,
        estado: editingProduct ? (data.status === 'Activo' ? 1 : 0) : 1
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Error al guardar el producto');

      toast.success(`Producto ${editingProduct ? 'actualizado' : 'creado'} exitosamente`);
      setIsDialogOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al eliminar producto');
      }
      toast.success('Producto eliminado');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleStatus = async (product: any) => {
    try {
      const res = await fetch(`${API_URL}/productos/${product.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          id_categoria: product.categoryId,
          nombre: product.name,
          marca: product.brand,
          cantidad: product.quantity,
          descripcion: product.description,
          estado: product.status !== 'Activo'
        })
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al actualizar estado');
      }
      toast.success('Estado actualizado');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const brands = ['Auteco', 'Yamaha', 'Honda', 'Suzuki', 'Kawasaki', 'Bajaj', 'TVS', 'KTM', 'Genérica', 'Otros'];

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const getCatColor = (n: string) => {
    const c: any = { 'Repuestos de Motor': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', 'Sistema de Frenos': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 'Transmisión': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', 'Sistema Eléctrico': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 'Carrocería': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 'Aceites y Lubricantes': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' };
    return c[n] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const stats = [
    { icon: Package, color: 'text-blue-600', label: 'Total Productos', val: products.length },
    { icon: CheckCircle, color: 'text-green-600', label: 'Activos', val: products.filter(p => p.status === 'Activo').length },
    { icon: XCircle, color: 'text-red-600', label: 'Inactivos', val: products.filter(p => p.status === 'Inactivo').length }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={() => setEditingProduct(null)} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Nuevo Producto</Button></DialogTrigger>
          <ProductDialog product={editingProduct} onSave={handleSave} categories={categories} brands={brands} />
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{stats.map((s, i) => (<Card key={i}><CardContent className="flex items-center p-6"><s.icon className={`w-8 h-8 ${s.color} mr-4`} /><div><p className="text-2xl font-bold">{s.val}</p><p className="text-muted-foreground">{s.label}</p></div></CardContent></Card>))}</div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /> Productos ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Marca</TableHead><TableHead>Categoría</TableHead><TableHead>Cantidad</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              {paginated.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><p>{p.name}</p></TableCell>
                  <TableCell><p>{p.brand}</p></TableCell>
                  <TableCell><p>{p.categoryName}</p></TableCell>
                  <TableCell><p>{p.quantity} unidades</p></TableCell>

                  <TableCell><div className="flex items-center gap-2"><Switch checked={p.status === 'Activo'} onCheckedChange={() => toggleStatus(p)} /><span className="text-sm">{p.status}</span></div></TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setViewingProduct(p)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingProduct(p); setIsDialogOpen(true); }} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDialog({
                      open: true,
                      title: 'Eliminar Producto',
                      description: '¿Está seguro de que desea eliminar este producto?',
                      confirmText: 'Eliminar',
                      variant: 'delete',
                      onConfirm: () => handleDelete(p.id)
                    })} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></Button>
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
                <div><Label>Categoría</Label><p>{viewingProduct.categoryName}</p></div>
                <div><Label>Cantidad</Label><p>{viewingProduct.quantity} unidades</p></div>

                <div><Label>Estado</Label><Badge className={viewingProduct.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}>{viewingProduct.status}</Badge></div>
              </div>
              <div><Label>Descripción</Label><p className="mt-1 p-3 bg-muted/50 rounded">{viewingProduct.description}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog onOpenChange={o => setConfirmDialog(p => ({ ...p, open: o }))} {...confirmDialog} />
    </div>
  );
}

function ProductDialog({ product, onSave, categories, brands }: any) {
  const [form, setForm] = useState({ name: product?.name || '', description: product?.description || '', categoryId: product?.categoryId?.toString() || '', quantity: product?.quantity?.toString() || '', brand: product?.brand || '' });

  React.useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId?.toString() || '',
        quantity: product.quantity?.toString() || '0',
        brand: product.brand || ''
      });
    } else {
      setForm({ name: '', description: '', categoryId: '', quantity: '0', brand: '' });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.brand?.trim() || !form.categoryId || !form.description?.trim()) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }
    onSave(form);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{product ? 'Editar' : 'Nuevo'} Producto</DialogTitle></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Marca *</Label><select value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="" className="bg-background text-foreground">Marca...</option>{brands.map((b: any) => <option key={b} value={b} className="bg-background text-foreground">{b}</option>)}
          </select></div>
          <div><Label>Categoría *</Label><select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="" disabled hidden className="bg-background text-foreground">Categoría...</option>{categories.map((c: any) => <option key={c.id} value={c.id} className="bg-background text-foreground">{c.name}</option>)}
          </select></div>
          <div><Label>Cantidad *</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
        </div>
        <div><Label>Descripción *</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
        <div className="flex justify-end"><Button type="submit" className="bg-blue-600 hover:bg-blue-700">{product ? 'Actualizar' : 'Crear'}</Button></div>
      </form>
    </DialogContent>
  );
}
