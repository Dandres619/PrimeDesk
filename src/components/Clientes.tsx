import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { ConfirmDialog } from './ConfirmDialog';
import { PDFPreviewDialog } from './PDFPreviewDialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Users,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { generateSimplePDF } from "../utils/pdfGenerator";

export function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [viewingClient, setViewingClient] = useState<any>(null);
  
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
    type: 'client' | 'general';
  }>({
    open: false,
    data: null,
    type: 'client'
  });

  const [clients, setClients] = useState([
    { 
      id: 1, 
      nombre: 'Juan Carlos',
      apellido: 'Pérez', 
      email: 'juan.perez@email.com', 
      phone: '+57 300 123 4567',
      direccion: 'Calle 123 #45-67',
      barrio: 'Chapinero',
      fechaNacimiento: '1985-05-15',
      imagen: '',
      document: '12345678',
      documentType: 'CC',
      status: 'Activo',
      motorcycles: 2,
      registeredAt: '2024-01-15'
    },
    { 
      id: 2, 
      nombre: 'María',
      apellido: 'García López', 
      email: 'maria.garcia@email.com', 
      phone: '+57 301 234 5678',
      direccion: 'Carrera 67 #89-12',
      barrio: 'El Poblado',
      fechaNacimiento: '1990-08-22',
      imagen: '',
      document: '87654321',
      documentType: 'CC',
      status: 'Activo',
      motorcycles: 1,
      registeredAt: '2024-02-20'
    },
    { 
      id: 3, 
      nombre: 'Carlos Eduardo',
      apellido: 'López', 
      email: 'carlos.lopez@email.com', 
      phone: '+57 302 345 6789',
      direccion: 'Avenida 45 #12-34',
      barrio: 'Granada',
      fechaNacimiento: '1988-12-10',
      imagen: '',
      document: '11223344',
      documentType: 'CC',
      status: 'Inactivo',
      motorcycles: 0,
      registeredAt: '2024-03-10'
    }
  ]);

  const filteredClients = clients.filter(client => 
    client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.document.includes(searchTerm)
  );

  // Paginación
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveClient = (clientData: any) => {
    if (editingClient) {
      setClients(clients.map(client => client.id === editingClient.id ? { ...client, ...clientData } : client));
    } else {
      const newClient = { 
        id: Date.now(), 
        ...clientData, 
        status: 'Activo',
        motorcycles: 0,
        registeredAt: new Date().toISOString().split('T')[0]
      };
      setClients([...clients, newClient]);
    }
    setIsDialogOpen(false);
    setEditingClient(null);
  };

  const toggleClientStatus = (clientId: number) => {
    setClients(clients.map(client => 
      client.id === clientId 
        ? { ...client, status: client.status === 'Activo' ? 'Inactivo' : 'Activo' }
        : client
    ));
  };

  const showDeleteConfirm = (clientId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Eliminar Cliente',
      description: '¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'delete',
      onConfirm: () => deleteClient(clientId)
    });
  };

  const deleteClient = (clientId: number) => {
    setClients(clients.filter(client => client.id !== clientId));
    toast.success('Cliente eliminado exitosamente');
  };

  const showPDFPreview = () => {
    setPdfPreview({
      open: true,
      data: { title: 'Reporte de Clientes', clients },
      type: 'general'
    });
  };

  const generatePDF = () => {
    try {
      const filename = `clientes_${new Date().toISOString().split('T')[0]}.pdf`;
      generateSimplePDF(filteredClients, 'clients', filename);
      toast.success('PDF generado y descargado exitosamente');
    } catch (error) {
      toast.error('Error al generar el PDF');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingClient(null)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <ClientDialog 
              client={editingClient} 
              onSave={handleSaveClient}
            />
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-muted-foreground">Total Clientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{clients.filter(c => c.status === 'Activo').length}</p>
              <p className="text-muted-foreground">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="w-8 h-8 text-orange-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{clients.filter(c => c.motorcycles > 0).length}</p>
              <p className="text-muted-foreground">Con Motos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{clients.reduce((sum, c) => sum + c.motorcycles, 0)}</p>
              <p className="text-muted-foreground">Total Motos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
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
              {paginatedClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{client.nombre} {client.apellido}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {client.direccion}, {client.barrio}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        {client.email}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {client.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{client.documentType}: {client.document}</p>
                      <p className="text-sm text-muted-foreground">Reg: {client.registeredAt}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {client.motorcycles} motos
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={client.status === 'Activo'}
                        onCheckedChange={() => toggleClientStatus(client.id)}
                      />
                      <span className="text-sm">
                        {client.status === 'Activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setViewingClient(client)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setEditingClient(client);
                          setIsDialogOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => showDeleteConfirm(client.id)}
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

      {/* Client Details Dialog */}
      <Dialog open={!!viewingClient} onOpenChange={() => setViewingClient(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          {viewingClient && (
            <div className="space-y-6">
              {/* Header con imagen y nombre */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                  <img 
                    src={viewingClient.imagen || "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBhdmF0YXJ8ZW58MXx8fHwxNzU4Mzk2MDE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"} 
                    alt={`${viewingClient.nombre} ${viewingClient.apellido}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewingClient.nombre} {viewingClient.apellido}</h3>
                  <p className="text-gray-600">{viewingClient.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={viewingClient.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {viewingClient.status}
                    </Badge>
                    <Badge variant="outline">
                      {viewingClient.motorcycles} motos
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Información personal */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Información Personal</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Nombre</Label>
                    <p className="font-medium">{viewingClient.nombre}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Apellido</Label>
                    <p className="font-medium">{viewingClient.apellido}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Fecha de nacimiento</Label>
                    <p className="font-medium">{new Date(viewingClient.fechaNacimiento).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Edad</Label>
                    <p className="font-medium">{new Date().getFullYear() - new Date(viewingClient.fechaNacimiento).getFullYear()} años</p>
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Información de Contacto</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Correo electrónico</Label>
                    <p className="font-medium">{viewingClient.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Teléfono</Label>
                    <p className="font-medium">{viewingClient.phone}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Dirección</Label>
                    <p className="font-medium">{viewingClient.direccion}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Barrio</Label>
                    <p className="font-medium">{viewingClient.barrio}</p>
                  </div>
                </div>
              </div>

              {/* Información de identificación */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Información de Identificación</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Tipo de documento</Label>
                    <p className="font-medium">
                      {viewingClient.documentType === 'CC' ? 'Cédula de Ciudadanía' : 
                       viewingClient.documentType === 'CE' ? 'Cédula de Extranjería' :
                       viewingClient.documentType === 'PP' ? 'Pasaporte' : viewingClient.documentType}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Número de documento</Label>
                    <p className="font-medium">{viewingClient.document}</p>
                  </div>
                </div>
              </div>

              {/* Información del sistema */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Información del Sistema</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Estado de la cuenta</Label>
                    <div className="mt-1">
                      <Badge className={viewingClient.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {viewingClient.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Motocicletas registradas</Label>
                    <p className="font-medium">{viewingClient.motorcycles} motocicletas</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Fecha de registro</Label>
                    <p className="font-medium">{new Date(viewingClient.registeredAt).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">ID del cliente</Label>
                    <p className="font-medium">#{viewingClient.id}</p>
                  </div>
                </div>
              </div>
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

function ClientDialog({ client, onSave }: any) {
  const [formData, setFormData] = useState({
    nombre: client?.nombre || '',
    apellido: client?.apellido || '',
    email: client?.email || '',
    phone: client?.phone || '',
    direccion: client?.direccion || '',
    barrio: client?.barrio || '',
    fechaNacimiento: client?.fechaNacimiento || '',
    imagen: client?.imagen || '',
    document: client?.document || '',
    documentType: client?.documentType || 'CC'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre del cliente"
              required
            />
          </div>
          <div>
            <Label htmlFor="apellido">Apellido</Label>
            <Input
              id="apellido"
              value={formData.apellido}
              onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
              placeholder="Apellido del cliente"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="documentType">Tipo de Documento</Label>
            {client ? (
              <Input
                value={formData.documentType}
                disabled
                className="bg-gray-100"
              />
            ) : (
              <select
                id="documentType"
                value={formData.documentType}
                onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PP">Pasaporte</option>
              </select>
            )}
          </div>
          <div>
            <Label htmlFor="document">Número de Documento</Label>
            <Input
              id="document"
              value={formData.document}
              onChange={client ? undefined : (e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
              placeholder="12345678"
              disabled={!!client}
              className={client ? "bg-gray-100" : ""}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="cliente@email.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+57 300 123 4567"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
              placeholder="Calle 123 #45-67"
              required
            />
          </div>
          <div>
            <Label htmlFor="barrio">Barrio</Label>
            <Input
              id="barrio"
              value={formData.barrio}
              onChange={(e) => setFormData(prev => ({ ...prev, barrio: e.target.value }))}
              placeholder="Centro"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
            <Input
              id="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="imagen">Imagen (URL)</Label>
            <Input
              id="imagen"
              value={formData.imagen}
              onChange={(e) => setFormData(prev => ({ ...prev, imagen: e.target.value }))}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
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