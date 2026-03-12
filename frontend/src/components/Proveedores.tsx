import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, Truck, Users, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function Proveedores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [viewingSupplier, setViewingSupplier] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => { } });

  const headers = {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  };

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/proveedores`, { headers });
      if (!res.ok) throw new Error('Error al cargar proveedores');
      const data = await res.json();
      setSuppliers(data.map((s: any) => ({
        id: s.ID_Proveedor,
        name: s.NombreEmpresa,
        taxId: s.NIT,
        contact: s.PersonaContacto,
        specialty: s.Especialidad,
        phone: s.Telefono,
        email: s.Email,
        address: s.Direccion,
        city: s.Ciudad,
        country: s.Pais,
        website: s.SitioWeb,
        notes: s.Notas,
        status: s.Estado ? 'Activo' : 'Inactivo'
      })));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSave = async (data: any) => {
    try {
      const method = editingSupplier ? 'PUT' : 'POST';
      const url = editingSupplier ? `${API_URL}/proveedores/${editingSupplier.id}` : `${API_URL}/proveedores`;

      const payload = {
        nombre_empresa: data.name,
        nit: data.taxId || null,
        persona_contacto: data.contact,
        especialidad: data.specialty || null,
        telefono: data.phone,
        email: data.email,
        direccion: data.address,
        ciudad: data.city,
        pais: data.country,
        sitio_web: data.website || null,
        notas: data.notes || null,
        estado: editingSupplier ? data.status === 'Activo' : true
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Error al guardar el proveedor');

      toast.success(`Proveedor ${editingSupplier ? 'actualizado' : 'registrado'} exitosamente`);
      setIsDialogOpen(false);
      setEditingSupplier(null);
      fetchSuppliers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/proveedores/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al eliminar proveedor');
      }
      toast.success('Proveedor eliminado');
      fetchSuppliers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleStatus = async (supplier: any) => {
    try {
      const res = await fetch(`${API_URL}/proveedores/${supplier.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          nombre_empresa: supplier.name,
          nit: supplier.taxId,
          persona_contacto: supplier.contact,
          especialidad: supplier.specialty,
          telefono: supplier.phone,
          email: supplier.email,
          direccion: supplier.address,
          ciudad: supplier.city,
          pais: supplier.country,
          sitio_web: supplier.website,
          notas: supplier.notes,
          estado: supplier.status !== 'Activo'
        })
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al actualizar estado');
      }
      toast.success('Estado actualizado');
      fetchSuppliers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered = suppliers.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const stats = [{ icon: Truck, color: 'text-blue-600', val: suppliers.length, label: 'Total Proveedores' }, { icon: Users, color: 'text-green-600', val: suppliers.filter(s => s.status === 'Activo').length, label: 'Activos' }, { icon: Phone, color: 'text-purple-600', val: suppliers.filter(s => s.phone).length, label: 'Con Teléfono' }, { icon: Mail, color: 'text-orange-600', val: suppliers.filter(s => s.email).length, label: 'Con Email' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar proveedores..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={() => setEditingSupplier(null)} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Nuevo Proveedor</Button></DialogTrigger>
          <SupplierDialog supplier={editingSupplier} onSave={handleSave} />
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{stats.map((s, i) => (<Card key={i}><CardContent className="flex items-center p-6"><s.icon className={`w-8 h-8 ${s.color} mr-4`} /><div><p className="text-2xl font-bold">{s.val}</p><p className="text-muted-foreground">{s.label}</p></div></CardContent></Card>))}</div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-blue-600" /> Listado de Proveedores</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>NIT</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><p>{s.name}</p></TableCell>

                  <TableCell>
                    <p>{s.taxId || "N/A"}</p>
                  </TableCell>

                  <TableCell><p>{s.contact}</p></TableCell>
                  <TableCell><p>{s.phone}</p></TableCell>
                  <TableCell><p>{s.email}</p></TableCell>

                  <TableCell>
                    <p>{s.specialty || "N/A"}</p>
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={s.status === 'Activo'}
                        onCheckedChange={() => toggleStatus(s)}
                      />
                      <span className="text-sm">{s.status}</span>
                    </div>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewingSupplier(s)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingSupplier(s)
                          setIsDialogOpen(true)
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setConfirmDialog({
                            open: true,
                            title: 'Eliminar Proveedor',
                            description: '¿Confirmar eliminación?',
                            confirmText: 'Eliminar',
                            variant: 'delete',
                            onConfirm: () => handleDelete(s.id),
                          })
                        }
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
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
      <Dialog open={!!viewingSupplier} onOpenChange={() => setViewingSupplier(null)}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Detalles del Proveedor</DialogTitle></DialogHeader>
          {viewingSupplier && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div><h4 className="font-semibold mb-3">Información General</h4><div className="space-y-2"><div><Label>Nombre</Label><p className="font-medium">{viewingSupplier.name}</p></div><div><Label>NIT</Label><p>{viewingSupplier.taxId}</p></div><div><Label>Especialidad</Label><Badge variant="outline">{viewingSupplier.specialty}</Badge></div><div><Label>Estado</Label><Badge className={viewingSupplier.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}>{viewingSupplier.status}</Badge></div></div></div>
                <div><h4 className="font-semibold mb-3">Contacto</h4><div className="space-y-2"><div><Label>Persona</Label><p className="font-medium">{viewingSupplier.contact}</p></div><div><Label>Teléfono</Label><p>{viewingSupplier.phone}</p></div><div><Label>Email</Label><p>{viewingSupplier.email}</p></div><div><Label>Dirección</Label><p>{viewingSupplier.address}</p></div></div></div>
              </div>
              {viewingSupplier.notes && <div><Label>Notas</Label><p className="text-sm mt-1">{viewingSupplier.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog onOpenChange={o => setConfirmDialog(p => ({ ...p, open: o }))} {...confirmDialog} />
    </div>
  );
}


function SupplierDialog({ supplier, onSave }: any) {
  const [form, setForm] = useState({ name: supplier?.name || '', contact: supplier?.contact || '', phone: supplier?.phone || '', email: supplier?.email || '', address: supplier?.address || '', city: supplier?.city || '', country: supplier?.country || 'Colombia', taxId: supplier?.taxId || '', website: supplier?.website || '', specialty: supplier?.specialty || '', notes: supplier?.notes || '' });

  React.useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || '',
        contact: supplier.contact || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        city: supplier.city || '',
        country: supplier.country || 'Colombia',
        taxId: supplier.taxId || '',
        website: supplier.website || '',
        specialty: supplier.specialty || '',
        notes: supplier.notes || ''
      });
    } else {
      setForm({ name: '', contact: '', phone: '', email: '', address: '', city: '', country: 'Colombia', taxId: '', website: '', specialty: '', notes: '' });
    }
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.contact?.trim() || !form.phone?.trim() || !form.email?.trim() || !form.address?.trim() || !form.city?.trim() || !form.country?.trim()) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Ingrese un correo electrónico válido');
      return;
    }
    onSave(form);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{supplier ? 'Editar' : 'Nuevo'} Proveedor</DialogTitle></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>NIT (Opcional)</Label><Input value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} /></div>
          <div><Label>Contacto *</Label><Input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></div>
          <div><Label>Especialidad (Opcional)</Label><Input value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} /></div>
          <div><Label>Teléfono *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Email *</Label><Input type="text" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="col-span-2"><Label>Dirección *</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label>Ciudad *</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
          <div><Label>País *</Label><Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
          <div className="col-span-2"><Label>Sitio Web (Opcional)</Label><Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></div>
        </div>
        <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
        <div className="flex justify-end"><Button type="submit" className="bg-blue-600 hover:bg-blue-700">{supplier ? 'Actualizar' : 'Registrar'}</Button></div>
      </form>
    </DialogContent>
  );
}
