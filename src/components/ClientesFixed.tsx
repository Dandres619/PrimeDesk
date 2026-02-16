import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Switch } from './ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
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
import { toast } from 'sonner@2.0.3';

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

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    phone: '',
    direccion: '',
    barrio: '',
    documentType: 'CC',
    document: '',
    fechaNacimiento: '',
    imagen: ''
  });

  const [clients, setClients] = useState([
    {
      id: 1,
      nombre: 'María',
      apellido: 'García',
      email: 'maria.garcia@email.com',
      phone: '+57 300 123 4567',
      direccion: 'Calle 123 #45-67',
      barrio: 'Centro',
      documentType: 'CC',
      document: '12345678',
      fechaNacimiento: '1990-05-15',
      status: 'Activo',
      motorcycles: 2,
      registeredAt: '2023-01-15',
      imagen: 'https://images.unsplash.com/photo-1494790108755-2616b612cee5?w=150'
    },
    {
      id: 2,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+57 301 234 5678',
      direccion: 'Carrera 45 #12-34',
      barrio: 'Chapinero',
      documentType: 'CC',
      document: '87654321',
      fechaNacimiento: '1985-03-22',
      status: 'Activo',
      motorcycles: 1,
      registeredAt: '2023-02-20',
      imagen: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    },
    {
      id: 3,
      nombre: 'Ana',
      apellido: 'López',
      email: 'ana.lopez@email.com',
      phone: '+57 302 345 6789',
      direccion: 'Avenida 68 #23-45',
      barrio: 'Zona Rosa',
      documentType: 'CE',
      document: '11223344',
      fechaNacimiento: '1992-11-08',
      status: 'Inactivo',
      motorcycles: 0,
      registeredAt: '2023-03-10',
      imagen: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
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

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      phone: '',
      direccion: '',
      barrio: '',
      documentType: 'CC',
      document: '',
      fechaNacimiento: '',
      imagen: ''
    });
    setEditingClient(null);
  };

  const openEditDialog = (client?: any) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        nombre: client.nombre,
        apellido: client.apellido,
        email: client.email,
        phone: client.phone,
        direccion: client.direccion,
        barrio: client.barrio,
        documentType: client.documentType,
        document: client.document,
        fechaNacimiento: client.fechaNacimiento,
        imagen: client.imagen || ''
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.phone || 
        !formData.direccion || !formData.barrio || !formData.document || !formData.fechaNacimiento) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    // Validar email único
    const emailExists = clients.find(c => 
      c.email.toLowerCase() === formData.email.toLowerCase() && 
      c.id !== editingClient?.id
    );
    
    if (emailExists) {
      toast.error('Este correo electrónico ya está registrado');
      return;
    }

    // Validar documento único
    const documentExists = clients.find(c => 
      c.document === formData.document && 
      c.id !== editingClient?.id
    );
    
    if (documentExists) {
      toast.error('Este número de documento ya está registrado');
      return;
    }

    if (editingClient) {
      setClients(clients.map(client => 
        client.id === editingClient.id 
          ? { 
              ...client, 
              ...formData,
              registeredAt: client.registeredAt // Mantener fecha original
            }
          : client
      ));
      toast.success('Cliente actualizado exitosamente');
    } else {
      const newClient = {
        id: Date.now(),
        ...formData,
        status: 'Activo',
        motorcycles: 0,
        registeredAt: new Date().toISOString().split('T')[0]
      };
      setClients([...clients, newClient]);
      toast.success('Cliente registrado exitosamente');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const deleteClient = (clientId: number) => {
    setClients(clients.filter(c => c.id !== clientId));
    toast.success('Cliente eliminado exitosamente');
  };

  const toggleClientStatus = (clientId: number) => {
    setClients(clients.map(client =>
      client.id === clientId
        ? { ...client, status: client.status === 'Activo' ? 'Inactivo' : 'Activo' }
        : client
    ));
  };

  const showDeleteConfirmation = (client: any) => {
    if (client.motorcycles > 0) {
      toast.error('No se puede eliminar un cliente que tiene motocicletas registradas');
      return;
    }
    
    setConfirmDialog({
      open: true,
      title: 'Eliminar Cliente',
      description: `¿Estás seguro de que deseas eliminar al cliente "${client.nombre} ${client.apellido}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'delete',
      onConfirm: () => {
        deleteClient(client.id);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleExport = () => {
    toast.success('Exportando lista de clientes a PDF...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground dark:text-foreground">Clientes</h1>
            <p className="text-muted-foreground dark:text-muted-foreground">Gestiona la información de los clientes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-600">
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={() => openEditDialog()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, teléfono o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Motos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <img 
                            src={client.imagen || "https://images.unsplash.com/photo-1494790108755-2616b612cee5?w=150"} 
                            alt={`${client.nombre} ${client.apellido}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{client.nombre} {client.apellido}</div>
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {client.barrio}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{client.documentType}: {client.document}</div>
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
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/30"
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
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/30"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => showDeleteConfirmation(client)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
              <div className="flex items-center gap-4 p-4 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                  <img 
                    src={viewingClient.imagen || "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBhdmF0YXJ8ZW58MXx8fHwxNzU4Mzk2MDE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"} 
                    alt={`${viewingClient.nombre} ${viewingClient.apellido}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground dark:text-foreground">{viewingClient.nombre} {viewingClient.apellido}</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground">{viewingClient.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={viewingClient.status === 'Activo' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}>
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
                <h4 className="font-semibold mb-3 text-foreground dark:text-foreground">Información Personal</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Nombre</Label>
                    <p className="font-medium text-foreground dark:text-foreground">{viewingClient.nombre}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Apellido</Label>
                    <p className="font-medium text-foreground dark:text-foreground">{viewingClient.apellido}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Fecha de nacimiento</Label>
                    <p className="font-medium text-foreground dark:text-foreground">{new Date(viewingClient.fechaNacimiento).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Edad</Label>
                    <p className="font-medium text-foreground dark:text-foreground">{new Date().getFullYear() - new Date(viewingClient.fechaNacimiento).getFullYear()} años</p>
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div>
                <h4 className="font-semibold mb-3 text-foreground dark:text-foreground">Información de Contacto</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Correo electrónico</Label>
                    <p className="font-medium text-foreground dark:text-foreground">{viewingClient.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Teléfono</Label>
                    <p className="font-medium text-foreground dark:text-foreground">{viewingClient.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Dirección</Label>
                    <p className="font-medium text-foreground dark:text-foreground">{viewingClient.direccion}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Barrio</Label>
                    <p className="font-medium text-foreground dark:text-foreground">{viewingClient.barrio}</p>
                  </div>
                </div>
              </div>

              {/* Información de identificación */}
              <div>
                <h4 className="font-semibold mb-3 text-foreground dark:text-foreground">Información de Identificación</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Tipo de documento</Label>
                    <p className="font-medium text-foreground dark:text-foreground">
                      {viewingClient.documentType === 'CC' ? 'Cédula de Ciudadanía' : 
                       viewingClient.documentType === 'CE' ? 'Cédula de Extranjería' :
                       viewingClient.documentType === 'PP' ? 'Pasaporte' : viewingClient.documentType}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Número de documento</Label>
                    <p className="font-medium text-foreground dark:text-foreground">{viewingClient.document}</p>
                  </div>
                </div>
              </div>

              {/* Información del sistema */}
              <div>
                <h4 className="font-semibold mb-3 text-foreground dark:text-foreground">Información del Sistema</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Estado de la cuenta</Label>
                    <div className="mt-1">
                      <Badge className={viewingClient.status === 'Activo' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}>
                        {viewingClient.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Motocicletas registradas</Label>
                    <p className="font-medium text-foreground dark:text-foreground">{viewingClient.motorcycles} motocicletas</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">Fecha de registro</Label>
                    <p className="font-medium text-foreground dark:text-foreground">{new Date(viewingClient.registeredAt).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground dark:text-muted-foreground">ID del cliente</Label>
                    <p className="font-medium text-foreground dark:text-foreground">#{viewingClient.id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create Client Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <ClientForm 
            client={editingClient} 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant === 'delete' ? 'destructive' : 'default'}
      />
    </div>
  );
}

function ClientForm({ client, formData, setFormData, onSubmit }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, nombre: e.target.value }))}
            placeholder="Nombre del cliente"
            required
          />
        </div>
        <div>
          <Label htmlFor="apellido">Apellido</Label>
          <Input
            id="apellido"
            value={formData.apellido}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, apellido: e.target.value }))}
            placeholder="Apellido del cliente"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="documentType">Tipo de Documento</Label>
          {client ? (
            <Input
              value={formData.documentType === 'CC' ? 'Cédula de Ciudadanía' : 
                     formData.documentType === 'CE' ? 'Cédula de Extranjería' :
                     formData.documentType === 'PP' ? 'Pasaporte' : formData.documentType}
              disabled
              className="bg-gray-100 dark:bg-gray-800"
            />
          ) : (
            <select
              id="documentType"
              value={formData.documentType}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, documentType: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground dark:bg-input-background dark:text-foreground"
              required
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
            onChange={client ? undefined : (e) => setFormData((prev: any) => ({ ...prev, document: e.target.value }))}
            placeholder="12345678"
            disabled={!!client}
            className={client ? "bg-gray-100 dark:bg-gray-800" : ""}
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
          onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
          placeholder="cliente@email.com"
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, phone: e.target.value }))}
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
            onChange={(e) => setFormData((prev: any) => ({ ...prev, direccion: e.target.value }))}
            placeholder="Calle 123 #45-67"
            required
          />
        </div>
        <div>
          <Label htmlFor="barrio">Barrio</Label>
          <Input
            id="barrio"
            value={formData.barrio}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, barrio: e.target.value }))}
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
            onChange={(e) => setFormData((prev: any) => ({ ...prev, fechaNacimiento: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="imagen">Imagen (URL)</Label>
          <Input
            id="imagen"
            value={formData.imagen}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, imagen: e.target.value }))}
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
  );
}