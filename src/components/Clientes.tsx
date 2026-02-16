import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { Switch } from './ui/switch';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, Users, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const initialClients = [
  { id: 1, nombre: 'Juan Carlos', apellido: 'Pérez', email: 'juan.perez@email.com', phone: '+57 300 123 4567', direccion: 'Calle 123 #45-67', barrio: 'Chapinero', fechaNacimiento: '1985-05-15', imagen: '', document: '12345678', documentType: 'CC', status: 'Activo', motorcycles: 2, registeredAt: '2024-01-15' },
  { id: 2, nombre: 'María', apellido: 'García López', email: 'maria.garcia@email.com', phone: '+57 301 234 5678', direccion: 'Carrera 67 #89-12', barrio: 'El Poblado', fechaNacimiento: '1990-08-22', imagen: '', document: '87654321', documentType: 'CC', status: 'Activo', motorcycles: 1, registeredAt: '2024-02-20' },
  { id: 3, nombre: 'Carlos Eduardo', apellido: 'López', email: 'carlos.lopez@email.com', phone: '+57 302 345 6789', direccion: 'Avenida 45 #12-34', barrio: 'Granada', fechaNacimiento: '1988-12-10', imagen: '', document: '11223344', documentType: 'CC', status: 'Inactivo', motorcycles: 0, registeredAt: '2024-03-10' }
];

const docTypes: any = { CC: 'Cédula de Ciudadanía', CE: 'Cédula de Extranjería', PP: 'Pasaporte' };

export function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => {} });
  const [clients, setClients] = useState(initialClients);

  const filteredClients = clients.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || c.apellido.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm) || c.document.includes(searchTerm));
  const totalPages = Math.ceil(filteredClients.length / 2);
  const paginatedClients = filteredClients.slice((currentPage - 1) * 2, currentPage * 2);

  const handleSave = (data: any) => {
    editingClient ? setClients(clients.map(c => c.id === editingClient.id ? { ...c, ...data } : c)) : setClients([...clients, { id: Date.now(), ...data, status: 'Activo', motorcycles: 0, registeredAt: new Date().toISOString().split('T')[0] }]);
    toast.success(`Cliente ${editingClient ? 'actualizado' : 'registrado'} exitosamente`);
    setIsDialogOpen(false);
    setEditingClient(null);
  };

  const stats = [
    { icon: Users, color: 'text-blue-600', value: clients.length, label: 'Total Clientes' },
    { icon: Users, color: 'text-green-600', value: clients.filter(c => c.status === 'Activo').length, label: 'Activos' },
    { icon: Users, color: 'text-orange-600', value: clients.filter(c => c.motorcycles > 0).length, label: 'Con Motos' },
    { icon: Users, color: 'text-purple-600', value: clients.reduce((sum, c) => sum + c.motorcycles, 0), label: 'Total Motos' }
  ];

  const actions = [
    { icon: Eye, onClick: (c: any) => setViewingClient(c), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' },
    { icon: Edit, onClick: (c: any) => { setEditingClient(c); setIsDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' },
    { icon: Trash2, onClick: (c: any) => setConfirmDialog({ open: true, title: 'Eliminar Cliente', description: '¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => { setClients(clients.filter(cl => cl.id !== c.id)); toast.success('Cliente eliminado exitosamente'); } }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar clientes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingClient(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <ClientDialog client={editingClient} onSave={handleSave} />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="flex items-center p-6">
              <s.icon className={`w-8 h-8 ${s.color} mr-4`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Listado de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Motos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{c.nombre} {c.apellido}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {c.direccion}, {c.barrio}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        {c.email}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {c.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{c.documentType}: {c.document}</p>
                      <p className="text-sm text-muted-foreground">Reg: {c.registeredAt}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.motorcycles} motos</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={c.status === 'Activo'} onCheckedChange={() => { setClients(clients.map(cl => cl.id === c.id ? { ...cl, status: cl.status === 'Activo' ? 'Inactivo' : 'Activo' } : cl)); toast.success('Estado actualizado exitosamente'); }} />
                      <span className="text-sm">{c.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {actions.map((a, i) => (
                        <Button key={i} size="sm" variant="ghost" onClick={() => a.onClick(c)} className={a.color}>
                          <a.icon className="w-4 h-4" />
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                {totalPages > 1 && <PaginationItem><PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>}
                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map(p => (
                  <PaginationItem key={p}><PaginationLink onClick={() => totalPages > 1 ? setCurrentPage(p) : undefined} isActive={currentPage === p} className={totalPages > 1 ? "cursor-pointer" : "cursor-default"}>{p}</PaginationLink></PaginationItem>
                ))}
                {totalPages > 1 && <PaginationItem><PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>}
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewingClient} onOpenChange={() => setViewingClient(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          {viewingClient && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                  <img src={viewingClient.imagen || "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBhdmF0YXJ8ZW58MXx8fHwxNzU4Mzk2MDE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"} alt={`${viewingClient.nombre} ${viewingClient.apellido}`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewingClient.nombre} {viewingClient.apellido}</h3>
                  <p className="text-muted-foreground">{viewingClient.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={viewingClient.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}>{viewingClient.status}</Badge>
                    <Badge variant="outline">{viewingClient.motorcycles} motos</Badge>
                  </div>
                </div>
              </div>
              {[
                { title: 'Información Personal', fields: [['Nombre', viewingClient.nombre], ['Apellido', viewingClient.apellido], ['Fecha de nacimiento', new Date(viewingClient.fechaNacimiento).toLocaleDateString('es-ES')], ['Edad', `${new Date().getFullYear() - new Date(viewingClient.fechaNacimiento).getFullYear()} años`]] },
                { title: 'Información de Contacto', fields: [['Correo electrónico', viewingClient.email], ['Teléfono', viewingClient.phone], ['Dirección', viewingClient.direccion], ['Barrio', viewingClient.barrio]] },
                { title: 'Información de Identificación', fields: [['Tipo de documento', docTypes[viewingClient.documentType] || viewingClient.documentType], ['Número de documento', viewingClient.document]] },
                { title: 'Información del Sistema', fields: [['Estado de la cuenta', <Badge key="status" className={viewingClient.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}>{viewingClient.status}</Badge>], ['Motocicletas registradas', `${viewingClient.motorcycles} motocicletas`], ['Fecha de registro', new Date(viewingClient.registeredAt).toLocaleDateString('es-ES')], ['ID del cliente', `#${viewingClient.id}`]] }
              ].map((section, i) => (
                <div key={i}>
                  <h4 className="font-semibold mb-3">{section.title}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {section.fields.map(([label, value], j) => (
                      <div key={j}>
                        <Label className="text-muted-foreground">{label}</Label>
                        {typeof value === 'string' ? <p className="font-medium">{value}</p> : <div className="mt-1">{value}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))} title={confirmDialog.title} description={confirmDialog.description} confirmText={confirmDialog.confirmText} variant={confirmDialog.variant} onConfirm={confirmDialog.onConfirm} />
    </div>
  );
}

function ClientDialog({ client, onSave }: any) {
  const [formData, setFormData] = useState({ nombre: client?.nombre || '', apellido: client?.apellido || '', email: client?.email || '', phone: client?.phone || '', direccion: client?.direccion || '', barrio: client?.barrio || '', fechaNacimiento: client?.fechaNacimiento || '', imagen: client?.imagen || '', document: client?.document || '', documentType: client?.documentType || 'CC' });

  const fields = [
    { id: 'nombre', label: 'Nombre', placeholder: 'Nombre del cliente', required: true },
    { id: 'apellido', label: 'Apellido', placeholder: 'Apellido del cliente', required: true },
    { id: 'email', label: 'Correo Electrónico', placeholder: 'cliente@email.com', type: 'email', required: true, full: true },
    { id: 'phone', label: 'Teléfono', placeholder: '+57 300 123 4567', required: true, full: true },
    { id: 'direccion', label: 'Dirección', placeholder: 'Calle 123 #45-67', required: true },
    { id: 'barrio', label: 'Barrio', placeholder: 'Centro', required: true },
    { id: 'fechaNacimiento', label: 'Fecha de Nacimiento', type: 'date', required: true },
    { id: 'imagen', label: 'Imagen (URL)', placeholder: 'https://ejemplo.com/imagen.jpg' }
  ];

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
        {fields.filter(f => f.full).map(f => (
          <div key={f.id}>
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input id={f.id} type={f.type || 'text'} value={formData[f.id as keyof typeof formData]} onChange={(e) => setFormData(prev => ({ ...prev, [f.id]: e.target.value }))} placeholder={f.placeholder} required={f.required} />
          </div>
        ))}
        
        <div className="grid grid-cols-2 gap-4">
          {fields.filter(f => !f.full).map(f => (
            <div key={f.id}>
              <Label htmlFor={f.id}>{f.label}</Label>
              <Input id={f.id} type={f.type || 'text'} value={formData[f.id as keyof typeof formData]} onChange={(e) => setFormData(prev => ({ ...prev, [f.id]: e.target.value }))} placeholder={f.placeholder} required={f.required} />
            </div>
          ))}
          <div>
            <Label htmlFor="documentType">Tipo de Documento</Label>
            {client ? (
              <Input value={formData.documentType} disabled className="bg-muted/50" />
            ) : (
              <select id="documentType" value={formData.documentType} onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-input-background dark:bg-input/30">
                {Object.entries(docTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            )}
          </div>
          <div>
            <Label htmlFor="document">Número de Documento</Label>
            <Input id="document" value={formData.document} onChange={client ? undefined : (e) => setFormData(prev => ({ ...prev, document: e.target.value }))} placeholder="12345678" disabled={!!client} className={client ? "bg-muted/50" : ""} required />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {client ? 'Actualizar' : 'Registrar'} Cliente
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
