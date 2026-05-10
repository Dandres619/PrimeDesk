import React, { useState } from 'react';
import { format, parse, isValid } from 'date-fns';
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
import { Search, Loader2, Eye, EyeOff, User, Edit, Trash2, Users, ArrowRight, Camera, Plus, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { DatePickerInput } from './ui/DatePickerInput';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
const BASE_URL = API_URL.replace('/api', '');

const getPhotoUrl = (photo: string | null) => {
  if (!photo) return undefined;
  if (photo.startsWith('http')) return photo;
  return `${BASE_URL}${photo}`;
};

const docTypes: any = { CC: 'Cédula de Ciudadanía', CE: 'Cédula de Extranjería', PP: 'Pasaporte' };

export function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => { } });
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async (silent = false) => {
    if (!silent) setIsLoading(true);
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
      if (!silent) {
        setTimeout(() => setIsLoading(false), 500);
      }
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
      fetchClients(true);
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

  const deleteClient = async (client: any) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/clientes/${client.ID_Cliente}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar');
      }
      toast.success('Cliente eliminado exitosamente');
      fetchClients(true);
      setConfirmDialog(prev => ({ ...prev, open: false }));
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
  ).sort((a, b) => (a.Nombre || '').localeCompare(b.Nombre || ''));

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      fetchClients(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Stats removed

  const actions = [
    { label: 'Ver detalles', icon: Eye, onClick: (c: any) => { setViewingClient(c); setIsViewDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { label: 'Editar cliente', icon: Edit, onClick: (c: any) => { setEditingClient(c); setIsDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { label: 'Eliminar cliente', icon: Trash2, onClick: (c: any) => setConfirmDialog({ open: true, title: 'Eliminar Cliente', description: '¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => deleteClient(c) }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20' }
  ];

  return (
    <div className="space-y-6">
      <style>{`
        .mp-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 200px);
            gap: 16px;
        }
        .mp-loading-ring {
            width: 40px;
            height: 40px;
            border: 3px solid #cbd5e1;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: mp-spin 0.8s linear infinite;
        }
        @keyframes mp-spin { to { transform: rotate(360deg); } }
        .mp-loading-text {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
        }
      `}</style>

      {isLoading ? (
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando información...</p>
        </div>
      ) : (
        <>
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
                <Button onClick={() => setEditingClient(null)} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
              <ClientDialog client={editingClient} onSave={handleSave} isSaving={isSaving} onOpenChange={setIsDialogOpen} open={isDialogOpen} />
            </Dialog>
          </div>

          <div className="flex justify-start">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar clientes..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10" />
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Lista de Clientes ({filteredClients.length})
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
                          <p>{c.MotosCount} moto(s)</p>
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
                            {actions.map((a, i) => {
                              const isInactive = !(c.ID_Usuario === null || c.EstadoUsuario === true || c.EstadoUsuario === 1);
                              const isDisabled = isInactive && (a.label === 'Editar cliente' || a.label === 'Eliminar cliente');

                              return (
                                <Tooltip key={i}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => a.onClick(c)}
                                      className={a.color}
                                      disabled={isDisabled}
                                    >
                                      <a.icon className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{a.label}</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
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

          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-modal p-0">
              {viewingClient && (
                <>
                  {/* Hero header */}
                  <div className="px-8 pt-8 pb-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative">
                        {getPhotoUrl(viewingClient.Foto) ? (
                          <img src={getPhotoUrl(viewingClient.Foto)!} alt="Perfil" className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl" />
                        ) : (
                          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800">
                            <span className="text-white text-2xl font-bold">{viewingClient.Nombre?.[0]}{viewingClient.Apellido?.[0]}</span>
                          </div>
                        )}
                        <Badge className={`absolute -bottom-2 -right-2 border-2 border-white dark:border-slate-800 shadow-sm ${viewingClient.ID_Usuario === null || viewingClient.EstadoUsuario ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                          {viewingClient.ID_Usuario === null || viewingClient.EstadoUsuario ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <div className="text-center sm:text-left space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {viewingClient.Nombre} {viewingClient.Apellido}
                        </h3>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                          <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                            Cliente
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 py-8 space-y-8">
                    {[
                      {
                        title: 'Información Personal',
                        icon: <User className="w-4 h-4" />,
                        fields: [
                          ['Nombres', `${viewingClient.Nombre}`],
                          ['Apellidos', `${viewingClient.Apellido}`],
                          ['Tipo de documento', `${viewingClient.TipoDocumento}`],
                          ['Documento', `${viewingClient.Documento}`],
                          ['Fecha de nacimiento', viewingClient.FechaNacimiento ? new Date(viewingClient.FechaNacimiento).toLocaleDateString('es-ES') : 'No especificada'],
                          ['Edad', viewingClient.FechaNacimiento ? `${new Date().getFullYear() - new Date(viewingClient.FechaNacimiento).getFullYear()} años` : '---']
                        ]
                      },
                      {
                        title: 'Contacto y Ubicación',
                        icon: <Mail className="w-4 h-4" />,
                        fields: [
                          ['Correo electrónico', viewingClient.Correo || 'Sin cuenta de acceso'],
                          ['Teléfono de contacto', viewingClient.Telefono],
                          ['Dirección de residencia', viewingClient.Direccion || 'Sin dirección'],
                          ['Barrio', viewingClient.Barrio || 'Sin barrio']
                        ]
                      }
                    ].map((section, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                          <div className="text-blue-600">{section.icon}</div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">{section.title}</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {section.fields.map(([label, value], j) => (
                            <div key={j} className="space-y-1">
                              <Label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</Label>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        loading={isDeleting}
        autoClose={false}
        loadingText="Eliminando..."
      />
    </div>
  );
}

function ClientDialog({ client, onSave, isSaving, onOpenChange, open }: any) {
  const [activeStep, setActiveStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
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
    if (!open) return;

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
      setTouchedFields({});
      setActiveStep(2);
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
      setTouchedFields({});
      setActiveStep(1);
    }
  }, [client, open]);

  const hasChanges = () => {
    if (!client) return true;
    return (
      formData.nombre !== (client.Nombre || '') ||
      formData.apellido !== (client.Apellido || '') ||
      formData.telefono !== (client.Telefono || '') ||
      formData.direccion !== (client.Direccion || '') ||
      formData.barrio !== (client.Barrio || '') ||
      formData.fecha_nacimiento !== (client.FechaNacimiento ? client.FechaNacimiento.split('T')[0] : '') ||
      formData.fotoFile !== null ||
      (formData.contrasena !== '' && formData.contrasena === formData.confirmarContrasena)
    );
  };

  const handleCancel = () => {
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
    setTouchedFields({});
    setActiveStep(1);
    onOpenChange(false);
  };

  const validateField = (name: string, value: string, currentData: any) => {
    let error = '';
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    switch (name) {
      case 'correo':
        if (!value) error = 'El correo es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Correo electrónico inválido';
        break;
      case 'contrasena':
        if (!client && !value) error = 'La contraseña es obligatoria';
        else if (value && !passwordRegex.test(value)) {
          error = 'Contraseña insegura';
        }
        break;
      case 'confirmarContrasena':
        if ((!client || currentData.contrasena) && value !== currentData.contrasena) {
          error = 'Las contraseñas no coinciden';
        }
        break;
      case 'nombre':
        if (!value) error = 'El nombre es obligatorio';
        break;
      case 'apellido':
        if (!value) error = 'El apellido es obligatorio';
        break;
      case 'documento':
        if (!value) error = 'El documento es obligatorio';
        else if (!/^\d{7,10}$/.test(value)) error = 'Debe tener entre 7 y 10 dígitos';
        break;
      case 'telefono':
        if (!value) error = 'El teléfono es obligatorio';
        else if (!/^\d{7,10}$/.test(value)) error = 'Debe tener entre 7 y 10 dígitos';
        break;
      case 'fecha_nacimiento':
        if (value) {
          let dateObj: Date | null = null;
          let yearVal = 0;

          if (value === 'INVALID') {
            error = 'Fecha inválida';
          } else if (value.includes('/')) {
            const parts = value.split('/');
            if (parts.length === 3 && parts[2]) {
              yearVal = parseInt(parts[2]);
            }
            if (parts.length < 3 || !parts[2] || parts[2].length < 4) {
              if (yearVal > 0 && yearVal < 1950) error = 'El año mínimo es 1950';
              else error = 'Fecha incompleta';
            } else {
              const d = parse(value, 'dd/MM/yyyy', new Date());
              if (isValid(d)) dateObj = d;
              else error = 'Fecha inválida';
            }
          } else {
            dateObj = new Date(value + 'T00:00:00');
            yearVal = parseInt(value.split('-')[0]);
          }

          if (!error) {
            if (yearVal > 0 && yearVal < 1950) error = 'El año mínimo es 1950';
            else if (dateObj) {
              const today = new Date();
              const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
              if (dateObj > today) error = 'No puede ser en el futuro';
              else if (dateObj > minAge) error = 'Debe ser mayor de 18 años';
            }
          }
        }
        break;
      case 'barrio':
        if (!value) error = 'El barrio es obligatorio';
        break;
      case 'direccion':
        if (!value) error = 'La dirección es obligatoria';
        break;
    }

    setFormErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }

      if (name === 'contrasena') {
        if (currentData.confirmarContrasena && value !== currentData.confirmarContrasena) {
          newErrors.confirmarContrasena = 'Las contraseñas no coinciden';
        } else if (currentData.confirmarContrasena) {
          delete newErrors.confirmarContrasena;
        }
      }
      return newErrors;
    });
  };

  const handleChange = (name: string, value: any) => {
    // Numeric only filters
    if (name === 'documento' || name === 'telefono') {
      value = value.replace(/\D/g, '');
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (touchedFields[name] || activeStep === 2) {
        validateField(name, value, newData);
      }
      return newData;
    });
  };

  const markAsTouched = (name: string) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    validateField(name, (formData as any)[name], formData);
  };

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

      if (!formData.correo) errors.correo = 'El correo es obligatorio';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) errors.correo = 'Correo electrónico inválido';

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!client) {
        if (!formData.contrasena) errors.contrasena = 'La contraseña es obligatoria';
        if (formData.contrasena !== formData.confirmarContrasena) {
          errors.confirmarContrasena = 'Las contraseñas no coinciden';
        }
        if (formData.contrasena && !passwordRegex.test(formData.contrasena)) {
          errors.contrasena = 'Contraseña insegura';
        }
      } else if (formData.contrasena) {
        if (!passwordRegex.test(formData.contrasena)) {
          errors.contrasena = 'Contraseña insegura';
        }
        if (formData.contrasena !== formData.confirmarContrasena) {
          errors.confirmarContrasena = 'Las contraseñas no coinciden';
        }
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(prev => ({ ...prev, ...errors }));
        setTouchedFields(prev => ({ ...prev, correo: true, contrasena: true, confirmarContrasena: true }));
        return;
      }
      setFormErrors({});
      setActiveStep(2);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // Validate Step 1 ONLY FOR NEW CLIENTS
    if (!client) {
      if (!formData.correo) errors.correo = 'El correo es obligatorio';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) errors.correo = 'Correo electrónico inválido';

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!formData.contrasena) errors.contrasena = 'La contraseña es obligatoria';
      if (formData.contrasena && !passwordRegex.test(formData.contrasena)) errors.contrasena = 'Contraseña insegura';
      if (formData.contrasena !== formData.confirmarContrasena) errors.confirmarContrasena = 'Las contraseñas no coinciden';
    }

    // Validate Step 2 (Always required)
    if (!formData.nombre) errors.nombre = 'El nombre es obligatorio';
    if (!formData.apellido) errors.apellido = 'El apellido es obligatorio';

    if (!formData.documento) errors.documento = 'El documento es obligatorio';
    else if (!/^\d{7,10}$/.test(formData.documento)) errors.documento = 'Debe tener entre 7 y 10 dígitos';

    if (!formData.telefono) errors.telefono = 'El teléfono es obligatorio';
    else if (!/^\d{10}$/.test(formData.telefono)) errors.telefono = 'Debe tener exactamente 10 dígitos';

    if (formData.fecha_nacimiento) {
      const d = new Date(formData.fecha_nacimiento + 'T00:00:00');
      const today = new Date();
      const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      if (isNaN(d.getTime())) errors.fecha_nacimiento = 'Fecha inválida';
      else if (d > today) errors.fecha_nacimiento = 'Fecha en el futuro';
      else if (d > minAge) errors.fecha_nacimiento = 'Debe ser mayor de 18 años';
      else if (d.getFullYear() < 1950) errors.fecha_nacimiento = 'El año mínimo es 1950';
    }
    if (!formData.barrio) errors.barrio = 'El barrio es obligatorio';
    if (!formData.direccion) errors.direccion = 'La dirección es obligatoria';

    setFormErrors(errors);
    setTouchedFields(prev => {
      const allFields = { ...prev };
      Object.keys(errors).forEach(key => allFields[key] = true);
      return allFields;
    });

    if (Object.keys(errors).length > 0) {
      if (!client && (errors.correo || errors.contrasena || errors.confirmarContrasena)) {
        setActiveStep(1);
      }
      toast.error('Por favor complete todos los campos obligatorios correctamente');
      return;
    }

    const normalizeDate = (d: string) => {
      if (!d) return d;
      if (d.includes('/')) {
        const parsed = parse(d, 'dd/MM/yyyy', new Date());
        return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : d;
      }
      return d;
    };

    const finalData = {
      ...formData,
      fecha_nacimiento: normalizeDate(formData.fecha_nacimiento)
    };

    onSave(finalData);
  };


  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-modal p-0">
      <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-600">
            <Edit className="w-5 h-5" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{client ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
            {!client && (
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${activeStep >= 1 ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div className={`w-10 h-1 rounded-full transition-colors duration-300 ${activeStep >= 2 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${activeStep >= 2 ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-slate-200 dark:bg-slate-700'}`} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paso {activeStep} / 2</span>
              </div>
            )}
          </DialogHeader>
        </div>
      </div>

      <div className="p-8">
        <form onSubmit={handleFinalSubmit} className="space-y-8" noValidate>
          {/* Section: Access Data (Only for NEW clients - Step 1) */}
          {!client && activeStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="reg-correo" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Correo electrónico *</Label>
                  <Input
                    id="reg-correo"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.correo}
                    onChange={(e) => handleChange('correo', e.target.value)}
                    onBlur={() => markAsTouched('correo')}
                    className={`h-11 ${touchedFields.correo && formErrors.correo ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-600'}`}
                    required
                  />
                  {touchedFields.correo && formErrors.correo && <p className="text-red-500 text-xs font-medium">{formErrors.correo}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pass" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="reg-pass"
                      type={showPassword ? "text" : "password"}
                      value={formData.contrasena}
                      onChange={(e) => handleChange('contrasena', e.target.value)}
                      onBlur={() => markAsTouched('contrasena')}
                      className={`h-11 pr-10 ${touchedFields.contrasena && formErrors.contrasena ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-600'}`}
                      placeholder="********"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Requisitos mínimos:</p>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <li className={`text-[10px] flex items-center gap-1.5 ${formData.contrasena.length >= 8 ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                        <div className={`w-1 h-1 rounded-full ${formData.contrasena.length >= 8 ? 'bg-emerald-600' : 'bg-slate-400'}`} /> 8+ caracteres
                      </li>
                      <li className={`text-[10px] flex items-center gap-1.5 ${/[A-Z]/.test(formData.contrasena) ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                        <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(formData.contrasena) ? 'bg-emerald-600' : 'bg-slate-400'}`} /> 1 mayúscula
                      </li>
                      <li className={`text-[10px] flex items-center gap-1.5 ${/\d/.test(formData.contrasena) ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                        <div className={`w-1 h-1 rounded-full ${/\d/.test(formData.contrasena) ? 'bg-emerald-600' : 'bg-slate-400'}`} /> 1 número
                      </li>
                      <li className={`text-[10px] flex items-center gap-1.5 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.contrasena) ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                        <div className={`w-1 h-1 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.contrasena) ? 'bg-emerald-600' : 'bg-slate-400'}`} /> 1 símbolo
                      </li>
                    </ul>
                  </div>
                  {touchedFields.contrasena && formErrors.contrasena && <p className="text-red-500 text-xs font-medium">{formErrors.contrasena}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm-pass" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirmar Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="reg-confirm-pass"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmarContrasena}
                      onChange={(e) => handleChange('confirmarContrasena', e.target.value)}
                      onBlur={() => markAsTouched('confirmarContrasena')}
                      className={`h-11 pr-10 ${touchedFields.confirmarContrasena && formErrors.confirmarContrasena ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-600'}`}
                      placeholder="********"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {touchedFields.confirmarContrasena && formErrors.confirmarContrasena && <p className="text-red-500 text-xs font-medium">{formErrors.confirmarContrasena}</p>}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 h-11 px-8 shadow-lg shadow-blue-200 dark:shadow-none font-semibold transition-all active:scale-95">
                  Siguiente Paso
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {(client || activeStep === 2) && (
            <div className="space-y-10 animate-fadeIn">
              {/* Section: Personal Information */}
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Información Personal</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nombres *</Label>
                    <Input id="nombre" value={formData.nombre} onChange={(e) => handleChange('nombre', e.target.value)} onBlur={() => markAsTouched('nombre')} className={`h-11 ${formErrors.nombre ? 'border-red-500' : ''}`} />
                    {formErrors.nombre && <p className="text-red-500 text-xs font-medium">{formErrors.nombre}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Apellidos *</Label>
                    <Input id="apellido" value={formData.apellido} onChange={(e) => handleChange('apellido', e.target.value)} onBlur={() => markAsTouched('apellido')} className={`h-11 ${formErrors.apellido ? 'border-red-500' : ''}`} />
                    {formErrors.apellido && <p className="text-red-500 text-xs font-medium">{formErrors.apellido}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_documento" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipo de Documento</Label>
                    <select
                      id="tipo_documento"
                      value={formData.tipo_documento}
                      onChange={(e) => handleChange('tipo_documento', e.target.value)}
                      disabled={!!client}
                      className="w-full h-11 px-3 border border-input rounded-md bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-900"
                    >
                      {Object.entries(docTypes).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documento" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Número de Documento *</Label>
                    <Input id="documento" value={formData.documento} onChange={(e) => handleChange('documento', e.target.value)} onBlur={() => markAsTouched('documento')} disabled={!!client} className={`h-11 ${formErrors.documento ? 'border-red-500' : ''} disabled:bg-slate-50 dark:disabled:bg-slate-900`} />
                    {formErrors.documento && <p className="text-red-500 text-xs font-medium">{formErrors.documento}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Fecha de Nacimiento (Opcional)</Label>
                    <DatePickerInput
                      value={formData.fecha_nacimiento}
                      onChange={(v) => handleChange('fecha_nacimiento', v)}
                      minDate={new Date(1950, 0, 1)}
                      maxDate={new Date()}
                      error={!!formErrors.fecha_nacimiento}
                    />
                    {formErrors.fecha_nacimiento && <p className="text-red-500 text-xs font-medium">{formErrors.fecha_nacimiento}</p>}
                  </div>
                </div>
              </div>

              {/* Section: Contact & Location */}
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Contacto y Ubicación</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Teléfono de Contacto *</Label>
                    <Input id="phone" value={formData.telefono} onChange={(e) => handleChange('telefono', e.target.value)} onBlur={() => markAsTouched('telefono')} className={`h-11 ${formErrors.telefono ? 'border-red-500' : ''}`} placeholder="300 000 0000" />
                    {formErrors.telefono && <p className="text-red-500 text-xs font-medium">{formErrors.telefono}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barrio" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Barrio *</Label>
                    <Input id="barrio" value={formData.barrio} onChange={(e) => handleChange('barrio', e.target.value)} onBlur={() => markAsTouched('barrio')} className={`h-11 ${formErrors.barrio ? 'border-red-500' : ''}`} />
                    {formErrors.barrio && <p className="text-red-500 text-xs font-medium">{formErrors.barrio}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="direccion" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dirección de Residencia *</Label>
                    <Input id="direccion" value={formData.direccion} onChange={(e) => handleChange('direccion', e.target.value)} onBlur={() => markAsTouched('direccion')} className={`h-11 ${formErrors.direccion ? 'border-red-500' : ''}`} />
                    {formErrors.direccion && <p className="text-red-500 text-xs font-medium">{formErrors.direccion}</p>}
                  </div>
                </div>
              </div>

              {/* Photo & Identity Section (BOTTOM) */}
              <div className="flex flex-col md:flex-row items-center gap-8 py-8 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-full border-2 border-white dark:border-slate-700 shadow-lg overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all border-2 border-white dark:border-slate-800"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="text-center md:text-left space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Previsualización de Identidad</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 min-h-[32px]">
                    {formData.nombre} {formData.apellido}
                  </h3>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-4 pt-4">
                {!client && (
                  <Button type="button" variant="ghost" onClick={() => setActiveStep(1)} className="text-slate-500 font-medium">
                    Atrás
                  </Button>
                )}
                <Button variant="outline" type="button" onClick={handleCancel} className="h-11 px-6 font-medium">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving || (!!client && !hasChanges())} className="bg-blue-600 hover:bg-blue-700 h-11 px-10 shadow-lg shadow-blue-100 dark:shadow-none font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  {client ? 'Actualizar Información' : 'Registrar Cliente'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </DialogContent>
  );
}
