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
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function CategoriasProductos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => { } });

  const headers = {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/categorias`, { headers });
      if (!res.ok) throw new Error('Error al cargar categorías');
      const data = await res.json();
      setCategories(data.map((c: any) => ({
        id: c.ID_Categoria,
        name: c.Nombre,
        description: c.Descripcion,
        status: c.Estado ? 'Activo' : 'Inactivo',
        createdAt: c.createdAt // Assuming backend might have it
      })));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (data: any) => {
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `${API_URL}/categorias/${editingCategory.id}` : `${API_URL}/categorias`;

      const payload = {
        nombre: data.name,
        descripcion: data.description,
        estado: editingCategory ? (editingCategory.status === 'Activo') : true
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Error al guardar la categoría');

      toast.success(`Categoría ${editingCategory ? 'actualizada' : 'creada'} exitosamente`);
      setIsDialogOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (category: any) => {
    if (category.status === 'Activo') {
      toast.error('No se puede eliminar una categoría activa. Primero debe inactivarla.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/categorias/${category.id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al eliminar categoría');
      }
      toast.success('Categoría eliminada');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleStatus = async (category: any) => {
    try {
      const newStatus = category.status !== 'Activo';
      const res = await fetch(`${API_URL}/categorias/${category.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          nombre: category.name,
          descripcion: category.description,
          estado: newStatus
        })
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al actualizar estado');
      }
      toast.success('Estado actualizado');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Stats removed

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Categorías de Productos</h1>
          <p className="text-muted-foreground">Gestiona las categorías de los productos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCategory(null)} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" /> Nueva Categoría
            </Button>
          </DialogTrigger>
          <CategoryDialog category={editingCategory} onSave={handleSave} />
        </Dialog>
      </div>

      <div className="flex justify-start">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar categorías..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Categorías de Productos ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? paginated.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p>{c.name}</p>
                  </TableCell>
                  <TableCell>
                    <p>{c.description}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={c.status === 'Activo'} onCheckedChange={() => toggleStatus(c)} />
                      <span className="text-sm">{c.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setViewingCategory(c)} className="text-blue-600"><Eye className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingCategory(c); setIsDialogOpen(true); }} className="text-blue-600"><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDialog({
                        open: true,
                        title: 'Eliminar Categoría',
                        description: '¿Está seguro de que desea eliminar esta categoría?',
                        confirmText: 'Eliminar',
                        variant: 'delete',
                        onConfirm: () => handleDelete(c)
                      })} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No se encontraron categorías.
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

      <Dialog open={!!viewingCategory} onOpenChange={() => setViewingCategory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Detalles de la Categoría</DialogTitle></DialogHeader>
          {viewingCategory && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nombre</Label><p className="font-medium">{viewingCategory.name}</p></div>
                <div><Label>Estado</Label><Badge className={viewingCategory.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{viewingCategory.status}</Badge></div>
              </div>
              <div><Label>Descripción</Label><p className="mt-1 p-3 bg-muted/50 rounded">{viewingCategory.description}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog onOpenChange={o => setConfirmDialog(p => ({ ...p, open: o }))} {...confirmDialog} />
    </div>
  );
}

function CategoryDialog({ category, onSave }: any) {
  const [form, setForm] = useState({ name: category?.name || '', description: category?.description || '' });

  React.useEffect(() => {
    if (category) {
      setForm({ name: category.name || '', description: category.description || '' });
    } else {
      setForm({ name: '', description: '' });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.description?.trim()) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }
    onSave(form);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader><DialogTitle>{category ? 'Editar' : 'Nueva'} Categoría</DialogTitle></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Descripción *</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} /></div>
        <div className="flex justify-end"><Button type="submit" className="bg-blue-600 hover:bg-blue-700">{category ? 'Actualizar' : 'Crear'}</Button></div>
      </form>
    </DialogContent>
  );
}
