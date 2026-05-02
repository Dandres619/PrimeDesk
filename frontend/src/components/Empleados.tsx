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
import { Plus, Search, Edit, Trash2, Eye, EyeOff, UserCog, Lock as LockIcon, ArrowRight, User, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { CustomDatePicker } from './ui/CustomDatePicker';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

const roleBadges = {
  'Administrador': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Mecánico': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
};

const docTypes: any = { CC: 'Cédula de Ciudadanía', CE: 'Cédula de Extranjería', PP: 'Pasaporte' };

export function Empleados() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => { } });
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/empleados`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Error al cargar empleados');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      toast.error('No se pudieron cargar los empleados');
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleSave = async (data: any) => {
    setIsSaving(true);
    try {
      const url = editingEmployee
        ? `${API_URL}/empleados/${editingEmployee.ID_Empleado}`
        : `${API_URL}/empleados`;

      const method = editingEmployee ? 'PUT' : 'POST';

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

      toast.success(`Empleado ${editingEmployee ? 'actualizado' : 'registrado'} exitosamente`);
      setIsDialogOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
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


  const filteredEmployees = employees.filter(e =>
    (e.Nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.Apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.Correo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.Telefono || '').includes(searchTerm) ||
    (e.Documento || '').includes(searchTerm) ||
    (e.NombreRol || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleToggleEstado = async (userId: number) => {
    if (currentUser.id_usuario === userId) {
      toast.error('No puedes inactivar tu propia cuenta.');
      return;
    }
    setIsSaving(true);
    try {
      if (!userId) {
        toast.error('Este empleado no tiene un usuario vinculado');
        return;
      }
      const response = await fetch(`${API_URL}/usuarios/${userId}/estado`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al cambiar el estado');
      }
      toast.success('Estado actualizado correctamente');
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEmployee = async (employee: any) => {
    if (currentUser.id_usuario === employee.ID_Usuario) {
      toast.error('No puedes eliminar tu propia cuenta.');
      return;
    }

    // Verificar si el empleado está activo
    const isActive = employee.EstadoUsuario === true || employee.EstadoUsuario === 1;
    if (isActive) {
      toast.error('No se puede eliminar un empleado activo. Primero debe inactivarlo.');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/empleados/${employee.ID_Empleado}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar');
      }
      toast.success('Empleado eliminado exitosamente');
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats removed

  const actions = [
    { icon: Eye, onClick: (e: any) => setViewingEmployee(e), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { icon: Edit, onClick: (e: any) => { setEditingEmployee(e); setIsDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { icon: Trash2, onClick: (e: any) => setConfirmDialog({ open: true, title: 'Eliminar Empleado', description: '¿Está seguro de que desea eliminar este empleado? Esta acción no se puede deshacer.', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => deleteEmployee(e) }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20' }
  ];

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        loading={isDeleting}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <UserCog className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Empleados</h1>
            <p className="text-muted-foreground">Gestión del personal del taller</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingEmployee(null)} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Empleado
            </Button>
          </DialogTrigger>
          <EmployeeDialog employee={editingEmployee} onSave={handleSave} isSaving={isSaving} onOpenChange={setIsDialogOpen} open={isDialogOpen} />
        </Dialog>
      </div>

      <div className="flex justify-start">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar empleados..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      ) : (
        <>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Lista de Empleados ({filteredEmployees.length})
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
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No se encontraron empleados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEmployees.map(e => (
                      <TableRow key={e.ID_Empleado}>
                        <TableCell>
                          <p>{e.Nombre}</p>
                        </TableCell>
                        <TableCell>
                          <p>{e.Apellido}</p>
                        </TableCell>
                        <TableCell>
                          <p>{e.Correo}</p>
                        </TableCell>
                        <TableCell>
                          <p>{e.Telefono}</p>
                        </TableCell>
                        <TableCell>
                          <p>{e.Documento}</p>
                        </TableCell>
                        <TableCell>
                          <p>{e.NombreRol}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={e.EstadoUsuario === true || e.EstadoUsuario === 1}
                              onCheckedChange={() => handleToggleEstado(e.ID_Usuario)}
                            />
                            <span className="text-sm">{(e.EstadoUsuario === true || e.EstadoUsuario === 1) ? 'Activo' : 'Inactivo'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {actions.map((a, i) => (
                              <Button key={i} size="sm" variant="ghost" onClick={() => a.onClick(e)} className={a.color}>
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
        </>
      )}

      <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Empleado</DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                  {viewingEmployee.Foto ? (
                    <img src={viewingEmployee.Foto} alt={`${viewingEmployee.Nombre} ${viewingEmployee.Apellido}`} className="w-full h-full object-cover" />
                  ) : (
                    <span>{viewingEmployee.Nombre?.[0]}{viewingEmployee.Apellido?.[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewingEmployee.Nombre} {viewingEmployee.Apellido}</h3>
                  <p className="text-muted-foreground">{viewingEmployee.Correo || 'Sin correo registrado'}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={viewingEmployee.EstadoUsuario ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {viewingEmployee.EstadoUsuario ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Badge className={roleBadges[viewingEmployee.NombreRol as keyof typeof roleBadges]}>{viewingEmployee.NombreRol}</Badge>
                  </div>
                </div>
              </div>
              {[
                {
                  title: 'Información Personal',
                  fields: [
                    ['Nombre', viewingEmployee.Nombre],
                    ['Apellido', viewingEmployee.Apellido],
                    ['Fecha de nacimiento', viewingEmployee.FechaNacimiento ? new Date(viewingEmployee.FechaNacimiento).toLocaleDateString('es-ES') : 'No registrada'],
                    ['Edad', viewingEmployee.FechaNacimiento ? `${new Date().getFullYear() - new Date(viewingEmployee.FechaNacimiento).getFullYear()} años` : '---']
                  ]
                },
                {
                  title: 'Información de Contacto',
                  fields: [
                    ['Correo electrónico', viewingEmployee.Correo],
                    ['Teléfono', viewingEmployee.Telefono],
                    ['Dirección', viewingEmployee.Direccion || 'Sin dirección'],
                    ['Barrio', viewingEmployee.Barrio || 'Sin barrio']
                  ]
                },
                {
                  title: 'Información Laboral',
                  fields: [
                    ['Rol', viewingEmployee.NombreRol],
                    ['Fecha de ingreso', viewingEmployee.FechaIngreso ? new Date(viewingEmployee.FechaIngreso).toLocaleDateString('es-ES') : 'No registrada']
                  ]
                },
                {
                  title: 'Información de Identificación',
                  fields: [
                    ['Tipo de documento', docTypes[viewingEmployee.TipoDocumento] || viewingEmployee.TipoDocumento],
                    ['Número de documento', viewingEmployee.Documento]
                  ]
                },
                {
                  title: 'Información del Sistema',
                  fields: [
                    ['ID del empleado', `#${viewingEmployee.ID_Empleado}`],
                    ['Estado de cuenta', viewingEmployee.EstadoUsuario ? 'ACtivo' : 'Inactivo']
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

      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))} title={confirmDialog.title} description={confirmDialog.description} confirmText={confirmDialog.confirmText} variant={confirmDialog.variant} onConfirm={confirmDialog.onConfirm} />
    </div>
  );
}

function EmployeeDialog({ employee, onSave, isSaving, onOpenChange, open }: any) {
  const [activeStep, setActiveStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isBirthCalendarOpen, setIsBirthCalendarOpen] = useState(false);
  const [isJoinCalendarOpen, setIsJoinCalendarOpen] = useState(false);
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    id_rol: 2,
    nombre: '',
    apellido: '',
    tipo_documento: 'CC',
    documento: '',
    telefono: '',
    direccion: '',
    barrio: '',
    fecha_nacimiento: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    foto: '',
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

    if (employee) {
      setFormData({
        correo: employee.Correo || '',
        contrasena: '',
        id_rol: employee.ID_Rol || (employee.NombreRol === 'Administrador' ? 1 : 2),
        nombre: employee.Nombre || '',
        apellido: employee.Apellido || '',
        tipo_documento: employee.TipoDocumento || 'CC',
        documento: employee.Documento || '',
        telefono: employee.Telefono || '',
        direccion: employee.Direccion || '',
        barrio: employee.Barrio || '',
        fecha_nacimiento: employee.FechaNacimiento ? employee.FechaNacimiento.split('T')[0] : '',
        fecha_ingreso: employee.FechaIngreso ? employee.FechaIngreso.split('T')[0] : new Date().toISOString().split('T')[0],
        foto: employee.Foto || '',
        confirmarContrasena: '',
        fotoFile: null
      });
      setFotoPreview(getPhotoUrl(employee.Foto));
      setFormErrors({});
      setTouchedFields({});
      setActiveStep(2);
    } else {
      setFormData({
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        id_rol: 2,
        nombre: '',
        apellido: '',
        tipo_documento: 'CC',
        documento: '',
        telefono: '',
        direccion: '',
        barrio: '',
        fecha_nacimiento: '',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        foto: '',
        fotoFile: null
      });
      setFotoPreview(null);
      setFormErrors({});
      setTouchedFields({});
      setActiveStep(1);
    }
  }, [employee, open]);

  const handleCancel = () => {
    setFormData({
      correo: '',
      contrasena: '',
      confirmarContrasena: '',
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: '',
      barrio: '',
      fecha_nacimiento: '',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      foto: '',
      documento: '',
      tipo_documento: 'CC',
      id_rol: 2,
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
        if (!employee && !value) error = 'La contraseña es obligatoria';
        else if (!employee && value && !passwordRegex.test(value)) {
          error = 'Contraseña insegura';
        } else if (employee && value && !passwordRegex.test(value)) {
          error = 'Contraseña insegura';
        }
        break;
      case 'confirmarContrasena':
        if ((!employee || currentData.contrasena) && value !== currentData.contrasena) {
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
        else if (!/^\d{10}$/.test(value)) error = 'Debe tener exactamente 10 dígitos';
        break;
      case 'fecha_nacimiento':
        if (!value) error = 'La fecha de nacimiento es obligatoria';
        break;
      case 'fecha_ingreso':
        if (!value) error = 'La fecha de ingreso es obligatoria';
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
      if (!employee) {
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

    // Validate Step 1 ONLY FOR NEW EMPLOYEES
    if (!employee) {
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

    if (!formData.fecha_nacimiento) errors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
    if (!formData.fecha_ingreso) errors.fecha_ingreso = 'La fecha de ingreso es obligatoria';
    if (!formData.barrio) errors.barrio = 'El barrio es obligatorio';
    if (!formData.direccion) errors.direccion = 'La dirección es obligatoria';

    setFormErrors(errors);
    setTouchedFields(prev => {
      const allFields = { ...prev };
      Object.keys(errors).forEach(key => allFields[key] = true);
      return allFields;
    });

    if (Object.keys(errors).length > 0) {
      if (!employee && (errors.correo || errors.contrasena || errors.confirmarContrasena)) {
        setActiveStep(1);
      }
      toast.error('Por favor complete todos los campos obligatorios correctamente');
      return;
    }

    onSave(formData);
  };


  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{employee ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
      </DialogHeader>

      {/* Steps Indicator - ONLY FOR NEW EMPLOYEES */}
      {!employee && (
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
        {activeStep === 1 && !employee ? (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <LockIcon className="w-5 h-5 text-blue-600" />
              Datos de Acceso
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="emp-correo">Correo electrónico *</Label>
                  {touchedFields.correo && formErrors.correo && <span className="text-red-500 text-xs font-medium">{formErrors.correo}</span>}
                </div>
                <Input
                  id="emp-correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleChange('correo', e.target.value)}
                  onBlur={() => markAsTouched('correo')}
                  className={touchedFields.correo && formErrors.correo ? 'border-red-500' : ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-rol">Rol *</Label>
                <select
                  id="emp-rol"
                  value={formData.id_rol}
                  onChange={(e) => setFormData(prev => ({ ...prev, id_rol: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={2}>Mecánico</option>
                  <option value={1}>Administrador</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="emp-pass">Contraseña *</Label>
                  {touchedFields.contrasena && formErrors.contrasena && <span className="text-red-500 text-xs font-medium">{formErrors.contrasena}</span>}
                </div>
                <div className="relative">
                  <Input
                    id="emp-pass"
                    type={showPassword ? "text" : "password"}
                    value={formData.contrasena}
                    onChange={(e) => handleChange('contrasena', e.target.value)}
                    onBlur={() => markAsTouched('contrasena')}
                    className={`${touchedFields.contrasena && formErrors.contrasena ? 'border-red-500' : ''} pr-10`}
                    required={!employee}
                    placeholder={employee ? "Dejar en blanco para no cambiar" : "********"}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-gray-700 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="emp-confirm-pass">Confirmar Contraseña {employee ? '' : '*'}</Label>
                  {touchedFields.confirmarContrasena && formErrors.confirmarContrasena && <span className="text-red-500 text-xs font-medium">{formErrors.confirmarContrasena}</span>}
                </div>
                <div className="relative">
                  <Input
                    id="emp-confirm-pass"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmarContrasena}
                    onChange={(e) => handleChange('confirmarContrasena', e.target.value)}
                    onBlur={() => markAsTouched('confirmarContrasena')}
                    className={`${touchedFields.confirmarContrasena && formErrors.confirmarContrasena ? 'border-red-500' : ''} pr-10`}
                    required={!employee}
                    placeholder="********"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-gray-700 transition-colors">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                Siguiente: Datos Personales
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Información Personal
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="nombre">Nombre *</Label>
                  {formErrors.nombre && <span className="text-red-500 text-xs font-medium">{formErrors.nombre}</span>}
                </div>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  onBlur={() => markAsTouched('nombre')}
                  className={touchedFields.nombre && formErrors.nombre ? 'border-red-500' : ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="apellido">Apellido *</Label>
                  {formErrors.apellido && <span className="text-red-500 text-xs font-medium">{formErrors.apellido}</span>}
                </div>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => handleChange('apellido', e.target.value)}
                  onBlur={() => markAsTouched('apellido')}
                  className={touchedFields.apellido && formErrors.apellido ? 'border-red-500' : ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_documento">Tipo de Documento</Label>
                <select
                  id="tipo_documento"
                  value={formData.tipo_documento}
                  onChange={(e) => handleChange('tipo_documento', e.target.value)}
                  disabled={!!employee}
                  className={`w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${employee ? "bg-muted opacity-80" : ""}`}
                >
                  {Object.entries(docTypes).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="documento">Núm. Documento *</Label>
                  {formErrors.documento && <span className="text-red-500 text-xs font-medium">{formErrors.documento}</span>}
                </div>
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => handleChange('documento', e.target.value)}
                  onBlur={() => markAsTouched('documento')}
                  required
                  disabled={!!employee}
                  className={`${employee ? 'bg-muted ' : ''}${touchedFields.documento && formErrors.documento ? 'border-red-500' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  {formErrors.telefono && <span className="text-red-500 text-xs font-medium">{formErrors.telefono}</span>}
                </div>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  onBlur={() => markAsTouched('telefono')}
                  className={touchedFields.telefono && formErrors.telefono ? 'border-red-500' : ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                  {formErrors.fecha_nacimiento && <span className="text-red-500 text-xs font-medium">{formErrors.fecha_nacimiento}</span>}
                </div>
                <Popover open={isBirthCalendarOpen} onOpenChange={setIsBirthCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal border-gray-200 ${!formData.fecha_nacimiento && "text-muted-foreground"} ${touchedFields.fecha_nacimiento && formErrors.fecha_nacimiento ? 'border-red-500 focus:ring-red-200' : 'focus:border-blue-500'}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fecha_nacimiento ? (
                        format(new Date(formData.fecha_nacimiento + 'T00:00:00'), "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomDatePicker
                      value={formData.fecha_nacimiento}
                      onChange={(v) => {
                        handleChange('fecha_nacimiento', v);
                        setIsBirthCalendarOpen(false);
                      }}
                      minAgeDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                      onClose={() => setIsBirthCalendarOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="fecha_ingreso">Fecha de Ingreso *</Label>
                  {formErrors.fecha_ingreso && <span className="text-red-500 text-xs font-medium">{formErrors.fecha_ingreso}</span>}
                </div>
                <Popover open={isJoinCalendarOpen} onOpenChange={setIsJoinCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal border-gray-200 ${!formData.fecha_ingreso && "text-muted-foreground"} ${touchedFields.fecha_ingreso && formErrors.fecha_ingreso ? 'border-red-500 focus:ring-red-200' : 'focus:border-blue-500'}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fecha_ingreso ? (
                        format(new Date(formData.fecha_ingreso + 'T00:00:00'), "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomDatePicker
                      value={formData.fecha_ingreso}
                      onChange={(v) => {
                        handleChange('fecha_ingreso', v);
                        setIsJoinCalendarOpen(false);
                      }}
                      minAgeDate={new Date()} // Can be today
                      onClose={() => setIsJoinCalendarOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="barrio">Barrio *</Label>
                  {formErrors.barrio && <span className="text-red-500 text-xs font-medium">{formErrors.barrio}</span>}
                </div>
                <Input
                  id="barrio"
                  value={formData.barrio}
                  onChange={(e) => handleChange('barrio', e.target.value)}
                  onBlur={() => markAsTouched('barrio')}
                  className={touchedFields.barrio && formErrors.barrio ? 'border-red-500' : ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="direccion">Dirección *</Label>
                  {formErrors.direccion && <span className="text-red-500 text-xs font-medium">{formErrors.direccion}</span>}
                </div>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
                  onBlur={() => markAsTouched('direccion')}
                  className={touchedFields.direccion && formErrors.direccion ? 'border-red-500' : ''}
                  required
                />
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
            <div className="flex justify-between items-center pt-4">
              {!employee && (
                <Button type="button" variant="outline" onClick={() => setActiveStep(1)}>
                  Atrás
                </Button>
              )}
              <div className="flex justify-end gap-2 ml-auto">
                <Button variant="outline" type="button" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {employee ? 'Actualizar Empleado' : 'Finalizar Registro'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </DialogContent>
  );
}
