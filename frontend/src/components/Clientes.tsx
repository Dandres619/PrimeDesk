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
import { Search, Loader2, Eye, User, Edit, Trash2, Users, Lock as LockIcon, ArrowRight, Camera, Plus } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

const docTypes: any = { CC: 'Cédula de Ciudadanía', CE: 'Cédula de Extranjería', PP: 'Pasaporte' };

export function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => { } });
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/clientes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Error al cargar clientes');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      toast.error('No se pudieron cargar los clientes');
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleSave = async (data: any) => {
    setIsSaving(true);
    try {
      const url = editingClient
        ? `${API_URL}/clientes/${editingClient.ID_Cliente}`
        : `${API_URL}/clientes`;

      const method = editingClient ? 'PUT' : 'POST';

      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'fotoFile') {
          if (data[key]) formDataToSend.append('fotoFile', data[key]);
        } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formDataToSend.append(key, String(data[key]));
        }
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        const err = new Error(errorData.message || 'Error al guardar') as any;
        err.errors = errorData.errors;
        throw err;
      }

      toast.success(`Cliente ${editingClient ? 'actualizado' : 'registrado'} exitosamente`);
      setIsDialogOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (error: any) {
      let errorMsg = error.message || 'Error de conexión';
      if (errorMsg === 'Error de validación.' && error.errors) {
         errorMsg = `Error de validación: ${error.errors.map((e: any) => `${e.campo}: ${e.mensaje}`).join(', ')}`;
      }
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteClient = async (id: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/clientes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Error al eliminar');
      toast.success('Cliente eliminado exitosamente');
      fetchClients();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClients = clients.filter(c =>
    (c.Nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.Apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.Correo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.Telefono || '').includes(searchTerm) ||
    (c.Documento || '').includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredClients.length / 5);
  const paginatedClients = filteredClients.slice((currentPage - 1) * 5, currentPage * 5);

  const handleToggleEstado = async (userId: number) => {
    try {
      if (!userId) {
        toast.error('Este cliente no tiene un usuario vinculado');
        return;
      }
      const response = await fetch(`${API_URL}/usuarios/${userId}/estado`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Error al cambiar el estado');
      toast.success('Estado actualizado correctamente');
      fetchClients();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const stats = [
    { icon: Users, color: 'text-blue-600', value: clients.length, label: 'Total Clientes' },
    { icon: Users, color: 'text-green-600', value: clients.filter(c => c.ID_Usuario === null || c.EstadoUsuario === true || c.EstadoUsuario === 1).length, label: 'Activos' },
    { icon: Users, color: 'text-orange-600', value: clients.filter(c => (c.MotosCount || 0) > 0).length, label: 'Con Motos' },
  ];

  const actions = [
    { icon: Eye, onClick: (c: any) => setViewingClient(c), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { icon: Edit, onClick: (c: any) => { setEditingClient(c); setIsDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { icon: Trash2, onClick: (c: any) => setConfirmDialog({ open: true, title: 'Eliminar Cliente', description: '¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => deleteClient(c.ID_Cliente) }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Clientes</h1>
            <p className="text-muted-foreground">Gestión de la base de datos de clientes</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingClient(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <ClientDialog client={editingClient} onSave={handleSave} isSaving={isSaving} />
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar clientes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellido</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Telefono</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Motos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No se encontraron clientes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedClients.map(c => (
                      <TableRow key={c.ID_Cliente}>
                        <TableCell>
                          <p>{c.Nombre}</p>
                        </TableCell>
                        <TableCell>
                          <p>{c.Apellido}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{c.Correo}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{c.Telefono}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{c.Documento}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{(c.MotosCount || 0)} moto(s)</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={c.ID_Usuario === null || c.EstadoUsuario === true || c.EstadoUsuario === 1}
                              onCheckedChange={() => handleToggleEstado(c.ID_Usuario)}
                            />
                            <span className="text-sm">{(c.ID_Usuario === null || c.EstadoUsuario === true || c.EstadoUsuario === 1) ? 'Activo' : 'Inactivo'}</span>
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
                    ))
                  )}
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
        </>
      )}

      <Dialog open={!!viewingClient} onOpenChange={() => setViewingClient(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          {viewingClient && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                  {viewingClient.Foto ? (
                    <img src={viewingClient.Foto} alt={`${viewingClient.Nombre} ${viewingClient.Apellido}`} className="w-full h-full object-cover" />
                  ) : (
                    <span>{viewingClient.Nombre?.[0]}{viewingClient.Apellido?.[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewingClient.Nombre} {viewingClient.Apellido}</h3>
                  <p className="text-muted-foreground">{viewingClient.Correo || 'Sin cuenta de acceso'}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={viewingClient.ID_Usuario === null || viewingClient.EstadoUsuario ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {viewingClient.ID_Usuario === null || viewingClient.EstadoUsuario ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Badge variant="outline">{(viewingClient.MotosCount || 0)} motos</Badge>
                  </div>
                </div>
              </div>
              {[
                {
                  title: 'Información Personal',
                  fields: [
                    ['Nombre', viewingClient.Nombre],
                    ['Apellido', viewingClient.Apellido],
                    ['Fecha de nacimiento', viewingClient.FechaNacimiento ? new Date(viewingClient.FechaNacimiento).toLocaleDateString('es-ES') : 'No especificada'],
                    ['Edad', viewingClient.FechaNacimiento ? `${new Date().getFullYear() - new Date(viewingClient.FechaNacimiento).getFullYear()} años` : '---']
                  ]
                },
                {
                  title: 'Información de Contacto',
                  fields: [
                    ['Correo electrónico', viewingClient.Correo || 'No tiene cuenta'],
                    ['Teléfono', viewingClient.Telefono],
                    ['Dirección', viewingClient.Direccion || 'Sin dirección'],
                    ['Barrio', viewingClient.Barrio || 'Sin barrio']
                  ]
                },
                {
                  title: 'Información de Identificación',
                  fields: [
                    ['Tipo de documento', docTypes[viewingClient.TipoDocumento] || viewingClient.TipoDocumento],
                    ['Número de documento', viewingClient.Documento]
                  ]
                },
                {
                  title: 'Información del Sistema',
                  fields: [
                    ['ID del cliente', `#${viewingClient.ID_Cliente}`],
                    ['Motocicletas registradas', `${viewingClient.MotosCount || 0} motocicletas`]
                  ]
                }
              ].map((section, i) => (
                <div key={i}>
                  <h4 className="font-semibold mb-3 pb-1 border-b text-blue-700">{section.title}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {section.fields.map(([label, value], j) => (
                      <div key={j}>
                        <Label className="text-xs text-muted-foreground uppercase">{label}</Label>
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

      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))} title={confirmDialog.title} description={confirmDialog.description} confirmText={confirmDialog.confirmText} variant={confirmDialog.variant} onConfirm={confirmDialog.onConfirm} loading={isDeleting} />
    </div>
  );
}

function ClientDialog({ client, onSave, isSaving }: any) {
  const [activeStep, setActiveStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    crear_usuario: true,
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    barrio: '',
    fecha_nacimiento: '',
    foto: '',
    documento: '',
    tipo_documento: 'CC',
    fotoFile: null as File | null
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const BASE_URL = API_URL.replace('/api', '');

  const getPhotoUrl = (photo: string | null) => {
      if (!photo) return null;
      if (photo.startsWith('http')) return photo;
      return `${BASE_URL}${photo}`;
  };

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (client) {
      setFormData({
        crear_usuario: false,
        correo: client.Correo || '',
        contrasena: '',
        confirmarContrasena: '',
        nombre: client.Nombre || '',
        apellido: client.Apellido || '',
        telefono: client.Telefono || '',
        direccion: client.Direccion || '',
        barrio: client.Barrio || '',
        fecha_nacimiento: client.FechaNacimiento ? client.FechaNacimiento.split('T')[0] : '',
        foto: client.Foto || '',
        documento: client.Documento || '',
        tipo_documento: client.TipoDocumento || 'CC',
        fotoFile: null
      });
      setFotoPreview(getPhotoUrl(client.Foto));
      setFormErrors({});
    } else {
      setFormData({
        crear_usuario: true,
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: '',
        barrio: '',
        fecha_nacimiento: '',
        foto: '',
        documento: '',
        tipo_documento: 'CC',
        fotoFile: null
      });
      setFotoPreview(null);
      setFormErrors({});
    }
  }, [client]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onFileChange(e.target.files);
  };

  const onFileChange = (files: FileList | null) => {
      if (files && files.length > 0) {
          const file = files[0];
          setFormData(prev => ({ ...prev, fotoFile: file, foto: '' }));

          const reader = new FileReader();
          reader.onloadend = () => {
              setFotoPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const nextStep = () => {
    if (activeStep === 1) {
      let errors: Record<string, string> = {};
      
      if (!formData.correo) errors.correo = 'Requerido';
      if (!client && !formData.contrasena) errors.contrasena = 'Requerido';
      if (!client && formData.contrasena !== formData.confirmarContrasena) {
        errors.confirmarContrasena = 'Las contraseñas no coinciden';
      }
      
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!client && formData.contrasena && !passwordRegex.test(formData.contrasena)) {
        errors.contrasena = 'Debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setFormErrors({});
      setActiveStep(2);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let errors: Record<string, string> = {};

    if (!formData.nombre) errors.nombre = 'Requerido';
    if (!formData.apellido) errors.apellido = 'Requerido';
    
    if (!formData.documento) errors.documento = 'Requerido';
    else if (!/^\d{7,10}$/.test(formData.documento) && !client) errors.documento = 'Entre 7 y 10 números';
    
    if (!formData.telefono) errors.telefono = 'Requerido';
    else if (!/^\d{10}$/.test(formData.telefono)) errors.telefono = 'Exactamente 10 números';

    if (!formData.fecha_nacimiento) errors.fecha_nacimiento = 'Requerido';
    if (!formData.barrio) errors.barrio = 'Requerido';
    if (!formData.direccion) errors.direccion = 'Requerido';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    onSave(formData);
  };


  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
      </DialogHeader>

      {/* Steps Indicator */}
      {!client && (
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${activeStep >= step ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400'}`}>
                {step}
              </div>
              {step === 1 && <div className={`w-12 h-0.5 mx-1 ${activeStep > 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleFinalSubmit} className="space-y-6" noValidate>
        {activeStep === 1 && !client ? (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <LockIcon className="w-5 h-5 text-blue-600" />
              Datos de Acceso
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="reg-correo">Correo electrónico *</Label>
                   {formErrors.correo && <span className="text-red-500 text-xs">{formErrors.correo}</span>}
                </div>
                <Input
                  id="reg-correo"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.correo}
                  onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                  className={formErrors.correo ? 'border-red-500' : ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="reg-pass">Contraseña *</Label>
                   {formErrors.contrasena && <span className="text-red-500 text-xs max-w-[60%] text-right leading-tight">{formErrors.contrasena}</span>}
                </div>
                <Input
                  id="reg-pass"
                  type="password"
                  placeholder="********"
                  value={formData.contrasena}
                  onChange={(e) => setFormData(prev => ({ ...prev, contrasena: e.target.value }))}
                  className={formErrors.contrasena ? 'border-red-500' : ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="reg-confirm-pass">Confirmar *</Label>
                   {formErrors.confirmarContrasena && <span className="text-red-500 text-xs">{formErrors.confirmarContrasena}</span>}
                </div>
                <Input
                  id="reg-confirm-pass"
                  type="password"
                  placeholder="Repita la contraseña"
                  value={formData.confirmarContrasena}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmarContrasena: e.target.value }))}
                  className={formErrors.confirmarContrasena ? 'border-red-500' : ''}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                Siguiente: Datos Personales
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <h4 className="font-semibold text-lg">Datos Personales</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="nombre">Nombre *</Label>
                   {formErrors.nombre && <span className="text-red-500 text-xs">{formErrors.nombre}</span>}
                </div>
                <Input id="nombre" value={formData.nombre} onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))} className={formErrors.nombre ? 'border-red-500' : ''} required />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="apellido">Apellido *</Label>
                   {formErrors.apellido && <span className="text-red-500 text-xs">{formErrors.apellido}</span>}
                </div>
                <Input id="apellido" value={formData.apellido} onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))} className={formErrors.apellido ? 'border-red-500' : ''} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_documento">Tipo de Documento</Label>
                <select
                  id="tipo_documento"
                  value={formData.tipo_documento}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo_documento: e.target.value }))}
                  disabled={!!client}
                  className={`w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${client ? "bg-muted opacity-80" : ""}`}
                >
                  {Object.entries(docTypes).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="documento">Núm. Documento *</Label>
                   {formErrors.documento && <span className="text-red-500 text-xs">{formErrors.documento}</span>}
                </div>
                <Input id="documento" value={formData.documento} onChange={(e) => setFormData(prev => ({ ...prev, documento: e.target.value }))} required disabled={!!client} className={`${client ? 'bg-muted ' : ''}${formErrors.documento ? 'border-red-500' : ''}`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="phone">Teléfono *</Label>
                   {formErrors.telefono && <span className="text-red-500 text-xs">{formErrors.telefono}</span>}
                </div>
                <Input id="phone" value={formData.telefono} onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))} className={formErrors.telefono ? 'border-red-500' : ''} required />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="fecha_nacimiento">Fec. Nacimiento *</Label>
                   {formErrors.fecha_nacimiento && <span className="text-red-500 text-xs">{formErrors.fecha_nacimiento}</span>}
                </div>
                <Input id="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={(e) => setFormData(prev => ({ ...prev, fecha_nacimiento: e.target.value }))} className={formErrors.fecha_nacimiento ? 'border-red-500' : ''} required />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="barrio">Barrio *</Label>
                   {formErrors.barrio && <span className="text-red-500 text-xs">{formErrors.barrio}</span>}
                </div>
                <Input id="barrio" value={formData.barrio} onChange={(e) => setFormData(prev => ({ ...prev, barrio: e.target.value }))} className={formErrors.barrio ? 'border-red-500' : ''} required />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="direccion">Dirección *</Label>
                   {formErrors.direccion && <span className="text-red-500 text-xs">{formErrors.direccion}</span>}
                </div>
                <Input id="direccion" value={formData.direccion} onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))} className={formErrors.direccion ? 'border-red-500' : ''} required />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Foto de Perfil</Label>
                <div className="flex items-center gap-6 mt-4">
                  <div className="relative group overflow-hidden w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="foto" className="flex items-center gap-2 cursor-pointer">
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Camera className="w-4 h-4 mr-2" />
                          Subir desde PC
                        </Button>
                      </Label>
                      <Input
                        id="foto"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => (document.querySelector('[data-state="open"]')?.parentElement as any)?.click()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {client ? 'Actualizar Cliente' : 'Finalizar Registro'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </DialogContent>
  );
}
