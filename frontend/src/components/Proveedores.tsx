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
import { Plus, Search, Edit, Trash2, Eye, Truck, Users, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const initialSuppliers = [
  { id: 1, name: 'Repuestos Honda Colombia', contact: 'Luis Martínez', phone: '+57 300 111 2222', email: 'luis@hondacol.com', address: 'Calle 100 #15-20, Bogotá', city: 'Bogotá', country: 'Colombia', taxId: '900123456-1', website: 'www.hondacol.com', specialty: 'Repuestos Honda', status: 'Activo', notes: 'Proveedor principal de repuestos Honda originales' },
  { id: 2, name: 'Yamaha Parts & Service', contact: 'Ana Rodríguez', phone: '+57 301 333 4444', email: 'ana@yamahaparts.com', address: 'Av. El Dorado #45-67, Bogotá', city: 'Bogotá', country: 'Colombia', taxId: '900654321-2', website: 'www.yamahaparts.com', specialty: 'Repuestos Yamaha', status: 'Activo', notes: 'Especialistas en motos deportivas Yamaha' },
  { id: 3, name: 'Suzuki Genuine Parts', contact: 'Carlos Mendoza', phone: '+57 302 555 6666', email: 'carlos@suzukiparts.com', address: 'Carrera 7 #85-12, Bogotá', city: 'Bogotá', country: 'Colombia', taxId: '900789123-3', website: 'www.suzukiparts.com', specialty: 'Repuestos Suzuki', status: 'Activo', notes: 'Distribuidor autorizado Suzuki' },
  { id: 4, name: 'Kawasaki Original Parts', contact: 'María García', phone: '+57 303 777 8888', email: 'maria@kawasakiparts.com', address: 'Calle 72 #10-34, Bogotá', city: 'Bogotá', country: 'Colombia', taxId: '900456789-4', website: 'www.kawasakiparts.com', specialty: 'Repuestos Kawasaki', status: 'Inactivo', notes: 'Temporalmente suspendido por reorganización' }
];

export function Proveedores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [viewingSupplier, setViewingSupplier] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => {} });

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.contact.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()) || s.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
  const paginated = filtered.slice((currentPage - 1) * 2, currentPage * 2);
  const totalPages = Math.ceil(filtered.length / 2);

  const handleSave = (data: any) => {
    editingSupplier ? setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? { ...s, ...data } : s)) : setSuppliers([...suppliers, { id: Date.now(), ...data, status: 'Activo' }]);
    setIsDialogOpen(false);
    setEditingSupplier(null);
    toast.success(`Proveedor ${editingSupplier ? 'actualizado' : 'registrado'} exitosamente`);
  };

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
            <TableHeader><TableRow><TableHead>Proveedor</TableHead><TableHead>Contacto</TableHead><TableHead>Especialidad</TableHead><TableHead>Ubicación</TableHead><TableHead>Estado</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              {paginated.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><div><p className="font-medium">{s.name}</p><p className="text-sm text-muted-foreground">NIT: {s.taxId}</p></div></TableCell>
                  <TableCell><div><p className="font-medium">{s.contact}</p><p className="text-sm text-muted-foreground">{s.phone}</p><p className="text-sm text-muted-foreground">{s.email}</p></div></TableCell>
                  <TableCell><Badge variant="outline">{s.specialty}</Badge></TableCell>
                  <TableCell><div className="text-sm"><p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.city}</p><p className="text-muted-foreground">{s.country}</p></div></TableCell>
                  <TableCell><div className="flex items-center gap-2"><Switch checked={s.status === 'Activo'} onCheckedChange={() => { setSuppliers(suppliers.map(sup => sup.id === s.id ? { ...sup, status: sup.status === 'Activo' ? 'Inactivo' : 'Activo' } : sup)); toast.success('Estado actualizado'); }} /><span className="text-sm">{s.status}</span></div></TableCell>
                  <TableCell><div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setViewingSupplier(s)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingSupplier(s); setIsDialogOpen(true); }} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDialog({ open: true, title: 'Eliminar Proveedor', description: '¿Confirmar?', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => { setSuppliers(suppliers.filter(sup => sup.id !== s.id)); toast.success('Proveedor eliminado'); } })} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
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
      <ConfirmDialog open={confirmDialog.open} onOpenChange={o => setConfirmDialog(p => ({ ...p, open: o }))} {...confirmDialog} />
    </div>
  );
}

function SupplierDialog({ supplier, onSave }: any) {
  const [form, setForm] = useState({ name: supplier?.name || '', contact: supplier?.contact || '', phone: supplier?.phone || '', email: supplier?.email || '', address: supplier?.address || '', city: supplier?.city || '', country: supplier?.country || 'Colombia', taxId: supplier?.taxId || '', website: supplier?.website || '', specialty: supplier?.specialty || '', notes: supplier?.notes || '' });
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{supplier ? 'Editar' : 'Nuevo'} Proveedor</DialogTitle></DialogHeader>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Nombre</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div><Label>NIT</Label><Input value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} required /></div>
          <div><Label>Contacto</Label><Input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} required /></div>
          <div><Label>Especialidad</Label><Input value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} required /></div>
          <div><Label>Teléfono</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="col-span-2"><Label>Dirección</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required /></div>
          <div><Label>Ciudad</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required /></div>
          <div><Label>País</Label><Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required /></div>
        </div>
        <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
        <div className="flex justify-end"><Button type="submit" className="bg-blue-600 hover:bg-blue-700">{supplier ? 'Actualizar' : 'Registrar'}</Button></div>
      </form>
    </DialogContent>
  );
}
