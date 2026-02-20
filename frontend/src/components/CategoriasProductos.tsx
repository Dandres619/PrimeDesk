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
import { Plus, Search, Edit, Trash2, Eye, Tag, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const initialCategories = [
  { id: 1, name: 'Repuestos de Motor', description: 'Componentes y repuestos para el sistema del motor', status: 'Activo', createdAt: '2024-01-15' },
  { id: 2, name: 'Sistema de Frenos', description: 'Pastillas, discos, líquidos y componentes de frenos', status: 'Activo', createdAt: '2024-01-12' },
  { id: 3, name: 'Transmisión', description: 'Cadenas, piñones, embragues y componentes de transmisión', status: 'Activo', createdAt: '2024-01-10' },
  { id: 4, name: 'Sistema Eléctrico', description: 'Baterías, cables, luces y componentes eléctricos', status: 'Activo', createdAt: '2024-01-08' },
  { id: 5, name: 'Carrocería', description: 'Espejos, guardabarros, tanques y partes de carrocería', status: 'Inactivo', createdAt: '2024-01-14' },
  { id: 6, name: 'Aceites y Lubricantes', description: 'Aceites de motor, lubricantes y fluidos especializados', status: 'Activo', createdAt: '2024-01-16' }
];

export function CategoriasProductos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState(initialCategories);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => {} });

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / 2);
  const paginated = filtered.slice((currentPage - 1) * 2, currentPage * 2);

  const handleSave = (data: any) => {
    editingCategory ? setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...data } : c)) : setCategories([...categories, { id: Date.now(), ...data, status: 'Activo', createdAt: new Date().toISOString().split('T')[0] }]);
    toast.success(`Categoría ${editingCategory ? 'actualizada' : 'creada'} exitosamente`);
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const stats = [
    { label: 'Total Categorías', value: categories.length, icon: Tag, color: 'text-blue-600' },
    { label: 'Activas', value: categories.filter(c => c.status === 'Activo').length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Inactivas', value: categories.filter(c => c.status === 'Inactivo').length, icon: XCircle, color: 'text-red-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar categorías..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCategory(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Nueva Categoría
            </Button>
          </DialogTrigger>
          <CategoryDialog category={editingCategory} onSave={handleSave} />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="flex items-center p-6">
              <s.icon className={`w-8 h-8 ${s.color} mr-4`} />
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            Categorías de Productos ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={c.status === 'Activo'} onCheckedChange={() => { setCategories(categories.map(cat => cat.id === c.id ? { ...cat, status: cat.status === 'Activo' ? 'Inactivo' : 'Activo' } : cat)); toast.success('Estado actualizado'); }} />
                      <span className="text-sm">{c.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setViewingCategory(c)} className="text-blue-600"><Eye className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingCategory(c); setIsDialogOpen(true); }} className="text-blue-600"><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDialog({ open: true, title: 'Eliminar Categoría', description: '¿Está seguro de que desea eliminar esta categoría?', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => { setCategories(categories.filter(cat => cat.id !== c.id)); toast.success('Categoría eliminada'); } })} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                {totalPages > 1 && <PaginationItem><PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="cursor-pointer" /></PaginationItem>}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <PaginationItem key={p}><PaginationLink onClick={() => setCurrentPage(p)} isActive={currentPage === p} className="cursor-pointer">{p}</PaginationLink></PaginationItem>
                ))}
                {totalPages > 1 && <PaginationItem><PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="cursor-pointer" /></PaginationItem>}
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
      <ConfirmDialog open={confirmDialog.open} onOpenChange={o => setConfirmDialog(p => ({ ...p, open: o }))} {...confirmDialog} />
    </div>
  );
}

function CategoryDialog({ category, onSave }: any) {
  const [form, setForm] = useState({ name: category?.name || '', description: category?.description || '' });
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader><DialogTitle>{category ? 'Editar' : 'Nueva'} Categoría</DialogTitle></DialogHeader>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
        <div><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
        <div><Label>Descripción *</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} required /></div>
        <div className="flex justify-end"><Button type="submit" className="bg-blue-600 hover:bg-blue-700">{category ? 'Actualizar' : 'Crear'}</Button></div>
      </form>
    </DialogContent>
  );
}
