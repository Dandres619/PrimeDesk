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
import { User, Plus, Search, Edit, Eye, EyeOff, Mail, Loader2, Lock as LockIcon, Save as SaveIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
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
  ).sort((a, b) => a.Correo.localeCompare(b.Correo));

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

          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
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
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => { setViewingUser(u); setIsViewDialogOpen(true); }} className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ver detalles</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(u)}
                                  className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  disabled={!(u.Estado === true || u.Estado === 1)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar usuario</p>
                              </TooltipContent>
                            </Tooltip>
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

          <Dialog open={showModal} onOpenChange={(open) => { if (!open) resetForm(); setShowModal(open); }}>
            <DialogContent className="max-w-lg animate-modal p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl">
              {/* Header Section */}
              <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0 transition-transform hover:scale-105">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        Editar Usuario
                      </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-500 mt-1">
                      Modificando acceso para {editingUser?.Correo}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-8 py-7 space-y-7" noValidate>
                {/* Account Information Section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Información de Acceso</h4>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Correo electrónico</Label>
                      {touchedFields.email && emailError && (
                        <span className="flex items-center gap-1 text-red-500 text-[11px] font-medium bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                          {emailError}
                        </span>
                      )}
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, email: e.target.value }));
                          if (!touchedFields.email) setTouchedFields(prev => ({ ...prev, email: true }));
                        }}
                        onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                        placeholder="ejemplo@correo.com"
                        required
                        className={`pl-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all ${touchedFields.email && emailError ? 'border-red-500 focus:ring-red-500/10 bg-red-50/30' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="space-y-5 pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <LockIcon className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Seguridad de la Cuenta</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                        </Label>
                        {touchedFields.password && passwordError && (
                          <span className="text-red-500 text-[10px] font-bold uppercase tracking-tight">{passwordError}</span>
                        )}
                      </div>
                      <div className="relative group">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, password: e.target.value }));
                            if (!touchedFields.password) setTouchedFields(prev => ({ ...prev, password: true }));
                          }}
                          onBlur={() => setTouchedFields(prev => ({ ...prev, password: true }))}
                          placeholder={editingUser ? "•••••••••" : "•••••••••"}
                          className={`h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all pr-11 ${touchedFields.password && passwordError ? 'border-red-500 focus:ring-red-500/10' : ''}`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirmar</Label>
                        {touchedFields.confirmPassword && confirmPasswordError && (
                          <span className="text-red-500 text-[10px] font-bold uppercase tracking-tight">No coincide</span>
                        )}
                      </div>
                      <div className="relative group">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                            if (!touchedFields.confirmPassword) setTouchedFields(prev => ({ ...prev, confirmPassword: true }));
                          }}
                          onBlur={() => setTouchedFields(prev => ({ ...prev, confirmPassword: true }))}
                          placeholder={editingUser ? "••••••••" : "••••••••"}
                          className={`h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all pr-11 ${touchedFields.confirmPassword && confirmPasswordError ? 'border-red-500 focus:ring-red-500/10' : ''}`}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {!editingUser && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Requisitos de seguridad:</span>
                        Mínimo 8 caracteres, incluir una mayúscula, un número y un carácter especial.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 h-11 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitDisabled()}
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none text-white font-bold transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SaveIcon className="w-4 h-4 mr-2" />
                    )}
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-md animate-modal p-0 overflow-hidden">
              {viewingUser && (
                <>
                  {/* Hero header */}
                  <div className="px-6 pt-6 pb-6 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="relative">
                        {viewingUser.Foto ? (
                          <img src={viewingUser.Foto} alt="Perfil" className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-md" />
                        ) : (
                          <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
                            <User className="w-12 h-12 text-white" />
                          </div>
                        )}
                        <Badge className={`absolute -bottom-2 -right-2 border-2 border-white dark:border-slate-800 shadow-sm ${viewingUser.Estado ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                          {viewingUser.Estado ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {viewingUser.Nombre || viewingUser.Apellido ? `${viewingUser.Nombre || ''} ${viewingUser.Apellido || ''}` : 'Sin nombre asignado'}
                        </h3>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <Badge variant="outline" className={tipoBadges[viewingUser.NombreRol]?.class}>
                            {viewingUser.NombreRol}
                          </Badge>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-xs font-mono text-slate-500">ID #{viewingUser.ID_Usuario}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-6 space-y-5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Correo Electrónico</p>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{viewingUser.Correo}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100/50 dark:border-blue-800/50">
                      <div className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Plus className="w-4 h-4 rotate-45" />
                        </div>
                        <p className="text-xs text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                          Este es un perfil de acceso al sistema. Los datos personales detallados se gestionan en los módulos de <strong>Empleados</strong> o <strong>Clientes</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
