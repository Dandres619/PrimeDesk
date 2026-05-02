import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { User, Plus, Search, Edit, Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const tipoBadges: Record<string, any> = {
  'Administrador': { class: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800', label: 'Administrador' },
  'Mecánico': { class: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', label: 'Empleado' },
  'Cliente': { class: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800', label: 'Cliente' }
};

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ email: '', id_rol: '', password: '', confirmPassword: '', estado: true });
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // @ts-ignore
  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('token');

  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener los usuarios');
      const data = await response.json();
      setUsuarios(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [API_URL, token]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchUsuarios();
      setIsLoading(false);
    };
    init();
  }, [fetchUsuarios]);

  const resetForm = () => {
    setFormData({ email: '', id_rol: '', password: '', confirmPassword: '', estado: true });
    setEditingUser(null);
    setTouchedFields({});
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailError || (formData.password && passwordError) || confirmPasswordError) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    setIsSaving(true);
    try {
      let response;
      if (editingUser) {
        response = await fetch(`${API_URL}/usuarios/${editingUser.ID_Usuario}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            correo: formData.email,
            contrasena: formData.password || undefined
          })
        });
      } else {
        response = await fetch(`${API_URL}/usuarios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            correo: formData.email,
            contrasena: formData.password,
            id_rol: parseInt(formData.id_rol)
          })
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al guardar el usuario');
      }

      toast.success(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
      setShowModal(false);
      resetForm();
      fetchUsuarios();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEstado = async (id: number) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.id_usuario === id) {
      toast.error('No puedes inactivar tu propia cuenta.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al cambiar el estado');
      }
      toast.success('Estado actualizado');
      fetchUsuarios();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (u: any) => {
    setEditingUser(u);
    setFormData({
      email: u.Correo,
      id_rol: u.ID_Rol.toString(),
      password: '',
      confirmPassword: '',
      estado: u.Estado === true || u.Estado === 1
    });
    setShowModal(true);
  };

  const filteredUsers = usuarios.filter(u =>
    u.Correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.Nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.Apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.NombreRol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateEmail = (email: string) => {
    if (!email) return 'El correo es obligatorio';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Correo electrónico inválido';
    return '';
  };

  const validatePassword = (pass: string) => {
    if (!pass && editingUser) return ''; // Optional for editing
    if (!pass && !editingUser) return 'La contraseña es obligatoria';
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(pass)) return 'Contraseña insegura';
    return '';
  };

  useEffect(() => {
    if (touchedFields.email) setEmailError(validateEmail(formData.email));
  }, [formData.email, touchedFields.email]);

  useEffect(() => {
    if (touchedFields.password) setPasswordError(validatePassword(formData.password));
  }, [formData.password, touchedFields.password]);

  useEffect(() => {
    if (touchedFields.confirmPassword) {
      if (formData.confirmPassword !== formData.password) setConfirmPasswordError('Las contraseñas no coinciden');
      else setConfirmPasswordError('');
    }
  }, [formData.confirmPassword, formData.password, touchedFields.confirmPassword]);

  const hasChanges = () => {
    if (!editingUser) return true;
    return formData.email !== editingUser.Correo || formData.password.length > 0;
  };

  const isSubmitDisabled = () => {
    if (isSaving) return true;
    if (emailError) return true;
    if (formData.password && passwordError) return true;
    if (confirmPasswordError) return true;
    if (editingUser && !hasChanges()) return true;
    if (!editingUser && (!formData.email || !formData.password || !formData.confirmPassword)) return true;
    return false;
  };

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Usuarios</h1>
            <p className="text-muted-foreground">Gestión de acceso al sistema</p>
          </div>
        </div>
        <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 shrink-0">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-300">¿Deseas registrar o eliminar un usuario?</p>
            <p className="text-blue-700 dark:text-blue-400">Dirígete al módulo de <strong>Empleados</strong> o <strong>Clientes</strong> para registrar o eliminar una cuenta vinculada a una persona.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-start">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar usuarios..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Correo Electrónico</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map(u => (
                    <TableRow key={u.ID_Usuario}>
                      <TableCell>
                        <p>{u.ID_Usuario}</p>
                      </TableCell>
                      <TableCell>
                        <p>{u.Correo}</p>
                      </TableCell>
                      <TableCell>
                        <p>{u.Nombre || '-'}</p>
                      </TableCell>
                      <TableCell>
                        <p>{u.Apellido || '-'}</p>
                      </TableCell>
                      <TableCell>
                        <p>{u.NombreRol}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={u.Estado === true || u.Estado === 1}
                            onCheckedChange={() => handleToggleEstado(u.ID_Usuario)}
                          />
                          <span className="text-sm">{(u.Estado === true || u.Estado === 1) ? 'Activo' : 'Inactivo'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setViewingUser(u)} className="text-blue-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(u)} className="text-blue-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
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
                      <PaginationLink onClick={() => setCurrentPage(p)} isActive={currentPage === p} className="cursor-pointer">
                        {p}
                      </PaginationLink>
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
      )}

      <Dialog open={showModal} onOpenChange={(open) => { if (!open) resetForm(); setShowModal(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="email">Correo electrónico *</Label>
                {touchedFields.email && emailError && <span className="text-red-500 text-xs font-medium">{emailError}</span>}
              </div>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  if (!touchedFields.email) setTouchedFields(prev => ({ ...prev, email: true }));
                }}
                onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                placeholder="correo@ejemplo.com"
                required
                className={touchedFields.email && emailError ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">{editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</Label>
                  {touchedFields.password && passwordError && <span className="text-red-500 text-xs font-medium">{passwordError}</span>}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, password: e.target.value }));
                      if (!touchedFields.password) setTouchedFields(prev => ({ ...prev, password: true }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, password: true }))}
                    placeholder={editingUser ? "Dejar en blanco para no cambiar" : "Mín. 8 caracteres, Mayús, Núm, Espec."}
                    className={touchedFields.password && passwordError ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-gray-700 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="confirmPassword">Verificar contraseña *</Label>
                  {touchedFields.confirmPassword && confirmPasswordError && <span className="text-red-500 text-xs font-medium">{confirmPasswordError}</span>}
                </div>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                      if (!touchedFields.confirmPassword) setTouchedFields(prev => ({ ...prev, confirmPassword: true }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, confirmPassword: true }))}
                    placeholder="Repita la contraseña"
                    className={touchedFields.confirmPassword && confirmPasswordError ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-gray-700 transition-colors">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1">Cancelar</Button>
              <Button type="submit" disabled={isSubmitDisabled()} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingUser ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Cuenta</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-6 pt-2">
              <div className="flex flex-col items-center gap-3 p-6 bg-muted/40 rounded-xl border border-dashed border-muted-foreground/20">
                {viewingUser.Foto ? (
                  <img src={viewingUser.Foto} alt="Perfil" className="w-20 h-20 rounded-full object-cover border-2 border-blue-600 p-0.5" />
                ) : (
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="text-center">
                  <p className="font-bold text-xl">{viewingUser.Nombre} {viewingUser.Apellido}</p>
                  <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
                    <Mail className="w-3 h-3" />
                    {viewingUser.Correo}
                  </p>
                  <Badge className={tipoBadges[viewingUser.NombreRol]?.class + " mt-2"}>{viewingUser.NombreRol}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <Label className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">ID Usuario</Label>
                  <p className="font-mono font-medium">#{viewingUser.ID_Usuario}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <Label className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Estado</Label>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${(viewingUser.Estado === true || viewingUser.Estado === 1) ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className="font-medium text-sm">{(viewingUser.Estado === true || viewingUser.Estado === 1) ? 'Activo' : 'Inactivo'}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed text-center">
                  Este es un perfil de acceso al sistema. Los datos adicionales se gestionan en los módulos de personal.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
