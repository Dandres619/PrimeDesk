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
import { Plus, Search, Edit, Trash2, Eye, UserCog, Lock as LockIcon, ArrowRight, User, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';

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
  const totalPages = Math.ceil(filteredEmployees.length / 5);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * 5, currentPage * 5);

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

  const deleteEmployee = async (id: number) => {
    const emp = employees.find(e => e.ID_Empleado === id);
    if (emp && currentUser.id_usuario === emp.ID_Usuario) {
      toast.error('No puedes eliminar tu propia cuenta.');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/empleados/${id}`, {
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

  const stats = [
    { icon: UserCog, color: 'text-blue-600', value: employees.length, label: 'Total Empleados' },
    { icon: UserCog, color: 'text-green-600', value: employees.filter(e => e.EstadoUsuario === true || e.EstadoUsuario === 1).length, label: 'Activos' },
    { icon: UserCog, color: 'text-red-600', value: employees.filter(e => e.NombreRol?.toLowerCase().includes('admin')).length, label: 'Administradores' },
    { icon: UserCog, color: 'text-purple-600', value: employees.filter(e => e.NombreRol?.toLowerCase().includes('mecánico')).length, label: 'Mecánicos' }
  ];

  const actions = [
    { icon: Eye, onClick: (e: any) => setViewingEmployee(e), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { icon: Edit, onClick: (e: any) => { setEditingEmployee(e); setIsDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { icon: Trash2, onClick: (e: any) => setConfirmDialog({ open: true, title: 'Eliminar Empleado', description: '¿Está seguro de que desea eliminar este empleado? Esta acción no se puede deshacer.', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => deleteEmployee(e.ID_Empleado) }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20' }
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
            <Button onClick={() => setEditingEmployee(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Empleado
            </Button>
          </DialogTrigger>
          <EmployeeDialog employee={editingEmployee} onSave={handleSave} isSaving={isSaving} />
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre, email o rol..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
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
                <UserCog className="w-5 h-5 text-blue-600" />
                Listado de Empleados
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
                          <Badge className={roleBadges[e.NombreRol as keyof typeof roleBadges]}>{e.NombreRol}</Badge>
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

function EmployeeDialog({ employee, onSave, isSaving }: any) {
  const [activeStep, setActiveStep] = useState(1);
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
    if (employee) {
      setFormData({
        correo: employee.Correo || '',
        contrasena: '',
        id_rol: employee.id_rol || (employee.NombreRol === 'Administrador' ? 1 : 2),
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
    }
  }, [employee]);

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
      if (!employee && !formData.contrasena) errors.contrasena = 'Requerido';
      if (!employee && formData.contrasena !== formData.confirmarContrasena) {
        errors.confirmarContrasena = 'Las contraseñas no coinciden';
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!employee && formData.contrasena && !passwordRegex.test(formData.contrasena)) {
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
    else if (!/^\d{7,10}$/.test(formData.documento) && !employee) errors.documento = 'Entre 7 y 10 números';

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
        <DialogTitle>{employee ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
      </DialogHeader>

      {/* Steps Indicator */}
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
                  {formErrors.correo && <span className="text-red-500 text-xs">{formErrors.correo}</span>}
                </div>
                <Input id="emp-correo" type="email" value={formData.correo} onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))} className={formErrors.correo ? 'border-red-500' : ''} required />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="emp-pass">Contraseña *</Label>
                  {formErrors.contrasena && <span className="text-red-500 text-xs max-w-[60%] text-right leading-tight">{formErrors.contrasena}</span>}
                </div>
                <Input id="emp-pass" type="password" value={formData.contrasena} onChange={(e) => setFormData(prev => ({ ...prev, contrasena: e.target.value }))} className={formErrors.contrasena ? 'border-red-500' : ''} required placeholder="********" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="emp-confirm-pass">Confirmar *</Label>
                  {formErrors.confirmarContrasena && <span className="text-red-500 text-xs">{formErrors.confirmarContrasena}</span>}
                </div>
                <Input id="emp-confirm-pass" type="password" value={formData.confirmarContrasena} onChange={(e) => setFormData(prev => ({ ...prev, confirmarContrasena: e.target.value }))} className={formErrors.confirmarContrasena ? 'border-red-500' : ''} required placeholder="********" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-rol">Rol</Label>
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
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Información Personal
            </h4>
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
                  disabled={!!employee}
                  className={`w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${employee ? "bg-muted opacity-80" : ""}`}
                >
                  {Object.entries(docTypes).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="documento">Núm. Documento *</Label>
                  {formErrors.documento && <span className="text-red-500 text-xs">{formErrors.documento}</span>}
                </div>
                <Input id="documento" value={formData.documento} onChange={(e) => setFormData(prev => ({ ...prev, documento: e.target.value }))} required disabled={!!employee} className={`${employee ? 'bg-muted ' : ''}${formErrors.documento ? 'border-red-500' : ''}`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  {formErrors.telefono && <span className="text-red-500 text-xs">{formErrors.telefono}</span>}
                </div>
                <Input id="telefono" value={formData.telefono} onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))} className={formErrors.telefono ? 'border-red-500' : ''} required />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="fecha_nacimiento">Fec. Nacimiento *</Label>
                  {formErrors.fecha_nacimiento && <span className="text-red-500 text-xs">{formErrors.fecha_nacimiento}</span>}
                </div>
                <Input id="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={(e) => setFormData(prev => ({ ...prev, fecha_nacimiento: e.target.value }))} className={formErrors.fecha_nacimiento ? 'border-red-500' : ''} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
                <Input id="fecha_ingreso" type="date" value={formData.fecha_ingreso} onChange={(e) => setFormData(prev => ({ ...prev, fecha_ingreso: e.target.value }))} required />
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
            <div className="flex justify-between pt-4">
              {!employee && (
                <Button type="button" variant="outline" onClick={() => setActiveStep(1)}>
                  Atrás
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" type="button" onClick={() => (document.querySelector('[data-state="open"]')?.parentElement as any)?.click()}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {employee ? 'Actualizar' : 'Finalizar Registro'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </DialogContent>
  );
}
