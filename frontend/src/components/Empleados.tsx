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
import { Plus, Search, Edit, Trash2, Eye, EyeOff, UserCog, ArrowRight, User, Loader2, Camera, Mail } from 'lucide-react';
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

const roleBadges: any = {
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => { } });
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async (silent = false) => {
    if (!silent) setIsLoading(true);
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
      if (!silent) {
        setTimeout(() => setIsLoading(false), 500);
      }
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
      fetchEmployees(true);
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
  ).sort((a, b) => (a.Nombre || '').localeCompare(b.Nombre || ''));
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
      fetchEmployees(true);
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
      fetchEmployees(true);
      setConfirmDialog(prev => ({ ...prev, open: false }));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats removed

  const actions = [
    { label: 'Ver detalles', icon: Eye, onClick: (e: any) => { setViewingEmployee(e); setIsViewDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { label: 'Editar empleado', icon: Edit, onClick: (e: any) => { setEditingEmployee(e); setIsDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { label: 'Eliminar empleado', icon: Trash2, onClick: (e: any) => setConfirmDialog({ open: true, title: 'Eliminar Empleado', description: '¿Está seguro de que desea eliminar este empleado? Esta acción no se puede deshacer.', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => deleteEmployee(e) }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20' }
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
                            {actions.map((a, i) => {
                              const isInactive = !(e.EstadoUsuario === true || e.EstadoUsuario === 1);
                              const isDisabled = isInactive && (a.label === 'Editar empleado' || a.label === 'Eliminar empleado');

                              return (
                                <Tooltip key={i}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => a.onClick(e)}
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
        </>
      )}

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-modal p-0">
          {viewingEmployee && (
            <>
              {/* Hero header */}
              <div className="px-8 pt-8 pb-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    {getPhotoUrl(viewingEmployee.Foto) ? (
                      <img src={getPhotoUrl(viewingEmployee.Foto)!} alt="Perfil" className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl" />
                    ) : (
                      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800">
                        <span className="text-white text-2xl font-bold">{viewingEmployee.Nombre?.[0]}{viewingEmployee.Apellido?.[0]}</span>
                      </div>
                    )}
                    <Badge className={`absolute -bottom-2 -right-2 border-2 border-white dark:border-slate-800 shadow-sm ${viewingEmployee.EstadoUsuario ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                      {viewingEmployee.EstadoUsuario ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {viewingEmployee.Nombre} {viewingEmployee.Apellido}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <Badge variant="outline" className={roleBadges[viewingEmployee.NombreRol as keyof typeof roleBadges]}>
                        {viewingEmployee.NombreRol}
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
                      ['Nombres', `${viewingEmployee.Nombre}`],
                      ['Apellidos', `${viewingEmployee.Apellido}`],
                      ['Tipo de documento', `${viewingEmployee.TipoDocumento}`],
                      ['Documento', `${viewingEmployee.Documento}`],
                      ['Fecha de nacimiento', viewingEmployee.FechaNacimiento ? new Date(viewingEmployee.FechaNacimiento).toLocaleDateString('es-ES') : 'No registrada'],
                      ['Edad', viewingEmployee.FechaNacimiento ? `${new Date().getFullYear() - new Date(viewingEmployee.FechaNacimiento).getFullYear()} años` : '---']
                    ]
                  },
                  {
                    title: 'Contacto y Ubicación',
                    icon: <Mail className="w-4 h-4" />,
                    fields: [
                      ['Correo electrónico', viewingEmployee.Correo],
                      ['Teléfono de contacto', viewingEmployee.Telefono],
                      ['Dirección de residencia', viewingEmployee.Direccion || 'Sin dirección'],
                      ['Barrio', viewingEmployee.Barrio || 'Sin barrio']
                    ]
                  },
                  {
                    title: 'Información Laboral',
                    icon: <UserCog className="w-4 h-4" />,
                    fields: [
                      ['Rol', viewingEmployee.NombreRol],
                      ['Fecha de ingreso', viewingEmployee.FechaIngreso ? new Date(viewingEmployee.FechaIngreso).toLocaleDateString('es-ES') : 'No registrada']
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
    </div>
  );
}

function EmployeeDialog({ employee, onSave, isSaving, onOpenChange, open }: any) {
  const [activeStep, setActiveStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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

  const hasChanges = () => {
    if (!employee) return true;
    return (
      formData.nombre !== (employee.Nombre || '') ||
      formData.apellido !== (employee.Apellido || '') ||
      formData.telefono !== (employee.Telefono || '') ||
      formData.direccion !== (employee.Direccion || '') ||
      formData.barrio !== (employee.Barrio || '') ||
      formData.fecha_nacimiento !== (employee.FechaNacimiento ? employee.FechaNacimiento.split('T')[0] : '') ||
      formData.fecha_ingreso !== (employee.FechaIngreso ? employee.FechaIngreso.split('T')[0] : '') ||
      formData.fotoFile !== null ||
      (formData.contrasena !== '' && formData.contrasena === formData.confirmarContrasena)
    );
  };

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
        else if (!/^\d{7,10}$/.test(value)) error = 'Debe tener entre 7 y 10 dígitos';
        break;
      case 'fecha_nacimiento':
        if (value) {
          const d = new Date(value + 'T00:00:00');
          const today = new Date();
          const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
          if (isNaN(d.getTime())) error = 'Fecha inválida';
          else if (d > today) error = 'Fecha en el futuro';
          else if (d > minAge) error = 'Debe ser mayor de 18 años';
          else if (d.getFullYear() < 1950) error = 'El año mínimo es 1950';
        }
        break;
      case 'fecha_ingreso':
        if (!value) error = 'La fecha de ingreso es obligatoria';
        else {
          const d = new Date(value + 'T00:00:00');
          if (isNaN(d.getTime())) error = 'Fecha inválida';
          else if (d.getFullYear() < 1950) error = 'El año mínimo es 1950';
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

    if (formData.fecha_nacimiento) {
      const d = new Date(formData.fecha_nacimiento + 'T00:00:00');
      const today = new Date();
      const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      if (isNaN(d.getTime())) errors.fecha_nacimiento = 'Fecha inválida';
      else if (d > today) errors.fecha_nacimiento = 'Fecha en el futuro';
      else if (d > minAge) errors.fecha_nacimiento = 'Debe ser mayor de 18 años';
      else if (d.getFullYear() < 1950) errors.fecha_nacimiento = 'El año mínimo es 1950';
    }
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
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-modal p-0">
      <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-600">
            <Edit className="w-5 h-5" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{employee ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
          </DialogHeader>
        </div>
      </div>

      <div className="p-8">
        <form onSubmit={handleFinalSubmit} className="space-y-8" noValidate>
          {/* Section: Access Data (Only for NEW employees) */}
          {(!employee || activeStep === 1) && !employee && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emp-correo" className="text-sm font-semibold">Correo electrónico *</Label>
                  <Input
                    id="emp-correo"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.correo}
                    onChange={(e) => handleChange('correo', e.target.value)}
                    onBlur={() => markAsTouched('correo')}
                    className={`h-11 ${touchedFields.correo && formErrors.correo ? 'border-red-500' : ''}`}
                    required
                  />
                  {touchedFields.correo && formErrors.correo && <p className="text-red-500 text-xs font-medium">{formErrors.correo}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-rol" className="text-sm font-semibold">Rol del Sistema *</Label>
                  <select
                    id="emp-rol"
                    value={formData.id_rol}
                    onChange={(e) => setFormData(prev => ({ ...prev, id_rol: parseInt(e.target.value) }))}
                    className="w-full h-11 px-3 border border-input rounded-md bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value={2}>Mecánico</option>
                    <option value={1}>Administrador</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-pass" className="text-sm font-semibold">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="emp-pass"
                      type={showPassword ? "text" : "password"}
                      value={formData.contrasena}
                      onChange={(e) => handleChange('contrasena', e.target.value)}
                      onBlur={() => markAsTouched('contrasena')}
                      className={`h-11 pr-10 ${touchedFields.contrasena && formErrors.contrasena ? 'border-red-500' : ''}`}
                      placeholder="********"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {touchedFields.contrasena && formErrors.contrasena && <p className="text-red-500 text-xs font-medium">{formErrors.contrasena}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-confirm-pass" className="text-sm font-semibold">Confirmar Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="emp-confirm-pass"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmarContrasena}
                      onChange={(e) => handleChange('confirmarContrasena', e.target.value)}
                      onBlur={() => markAsTouched('confirmarContrasena')}
                      className={`h-11 pr-10 ${touchedFields.confirmarContrasena && formErrors.confirmarContrasena ? 'border-red-500' : ''}`}
                      placeholder="********"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-slate-400">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {touchedFields.confirmarContrasena && formErrors.confirmarContrasena && <p className="text-red-500 text-xs font-medium">{formErrors.confirmarContrasena}</p>}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 h-11 px-8">
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {(employee || activeStep === 2) && (
            <div className="space-y-10 animate-fadeIn">
              {/* Photo & Header Section */}
              <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
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
                <div className="text-center md:text-left space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {formData.nombre || 'Nombre'} {formData.apellido || 'Apellido'}
                  </h3>
                </div>
              </div>

              {/* Main Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-sm font-semibold">Nombres *</Label>
                  <Input id="nombre" value={formData.nombre} onChange={(e) => handleChange('nombre', e.target.value)} onBlur={() => markAsTouched('nombre')} className={`h-11 ${formErrors.nombre ? 'border-red-500' : ''}`} />
                  {formErrors.nombre && <p className="text-red-500 text-xs font-medium">{formErrors.nombre}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido" className="text-sm font-semibold">Apellidos *</Label>
                  <Input id="apellido" value={formData.apellido} onChange={(e) => handleChange('apellido', e.target.value)} onBlur={() => markAsTouched('apellido')} className={`h-11 ${formErrors.apellido ? 'border-red-500' : ''}`} />
                  {formErrors.apellido && <p className="text-red-500 text-xs font-medium">{formErrors.apellido}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_documento" className="text-sm font-semibold">Tipo de Documento</Label>
                  <select
                    id="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={(e) => handleChange('tipo_documento', e.target.value)}
                    disabled={!!employee}
                    className="w-full h-11 px-3 border border-input rounded-md bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-900"
                  >
                    {Object.entries(docTypes).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento" className="text-sm font-semibold">Número de Documento *</Label>
                  <Input id="documento" value={formData.documento} onChange={(e) => handleChange('documento', e.target.value)} onBlur={() => markAsTouched('documento')} disabled={!!employee} className={`h-11 ${formErrors.documento ? 'border-red-500' : ''} disabled:bg-slate-50 dark:disabled:bg-slate-900`} />
                  {formErrors.documento && <p className="text-red-500 text-xs font-medium">{formErrors.documento}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-sm font-semibold">Teléfono de Contacto *</Label>
                  <Input id="telefono" value={formData.telefono} onChange={(e) => handleChange('telefono', e.target.value)} onBlur={() => markAsTouched('telefono')} className={`h-11 ${formErrors.telefono ? 'border-red-500' : ''}`} placeholder="300 000 0000" />
                  {formErrors.telefono && <p className="text-red-500 text-xs font-medium">{formErrors.telefono}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento" className="text-sm font-semibold">Fecha de Nacimiento (Opcional)</Label>
                  <DatePickerInput
                    value={formData.fecha_nacimiento}
                    onChange={(v) => handleChange('fecha_nacimiento', v)}
                    minAgeDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                    error={!!formErrors.fecha_nacimiento}
                  />
                  {formErrors.fecha_nacimiento && <p className="text-red-500 text-xs font-medium">{formErrors.fecha_nacimiento}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barrio" className="text-sm font-semibold">Barrio *</Label>
                  <Input id="barrio" value={formData.barrio} onChange={(e) => handleChange('barrio', e.target.value)} onBlur={() => markAsTouched('barrio')} className={`h-11 ${formErrors.barrio ? 'border-red-500' : ''}`} />
                  {formErrors.barrio && <p className="text-red-500 text-xs font-medium">{formErrors.barrio}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion" className="text-sm font-semibold">Dirección de Residencia *</Label>
                  <Input id="direccion" value={formData.direccion} onChange={(e) => handleChange('direccion', e.target.value)} onBlur={() => markAsTouched('direccion')} className={`h-11 ${formErrors.direccion ? 'border-red-500' : ''}`} />
                  {formErrors.direccion && <p className="text-red-500 text-xs font-medium">{formErrors.direccion}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_ingreso" className="text-sm font-semibold">Fecha de Ingreso a la Empresa *</Label>
                  <DatePickerInput
                    value={formData.fecha_ingreso}
                    onChange={(v) => handleChange('fecha_ingreso', v)}
                    error={!!formErrors.fecha_ingreso}
                  />
                  {formErrors.fecha_ingreso && <p className="text-red-500 text-xs font-medium">{formErrors.fecha_ingreso}</p>}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-4 pt-10 border-t border-slate-100 dark:border-slate-800">
                {!employee && (
                  <Button type="button" variant="ghost" onClick={() => setActiveStep(1)} className="text-slate-500 font-medium">
                    Atrás
                  </Button>
                )}
                <Button variant="outline" type="button" onClick={handleCancel} className="h-11 px-6 font-medium">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving || (!!employee && !hasChanges())} className="bg-blue-600 hover:bg-blue-700 h-11 px-10 shadow-lg shadow-blue-100 dark:shadow-none font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  {employee ? 'Actualizar Información' : 'Registrar Empleado'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </DialogContent>
  );
}
