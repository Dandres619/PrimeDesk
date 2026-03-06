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
  'Empleado': { class: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', label: 'Empleado' },
  'Técnico': { class: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', label: 'Empleado' },
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.id_rol) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    if (!editingUser && (!formData.password || !formData.confirmPassword)) {
      toast.error('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (formData.password && !passwordRegex.test(formData.password)) {
      toast.error('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial');
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

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <p className="font-semibold text-blue-900 dark:text-blue-300">¿Deseas registrar un nuevo usuario?</p>
            <p className="text-blue-700 dark:text-blue-400">Dirígete al módulo de <strong>Empleados</strong> o <strong>Clientes</strong> para registrar una nueva cuenta vinculada a una persona.</p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre, email o rol..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

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
                      <div className="font-medium">{u.ID_Usuario}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{u.Correo}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{u.Nombre || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{u.Apellido || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={tipoBadges[u.NombreRol]?.class || 'bg-gray-100'}>
                        {u.NombreRol}
                      </Badge>
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
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
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
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={(open) => { if (!open) resetForm(); setShowModal(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="correo@ejemplo.com" required />
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="password">{editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder={editingUser ? "Dejar en blanco para no cambiar" : "8+ chars, Mayús, Núm, Espec."} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Verificar contraseña *</Label>
                <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="Repita la contraseña" />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1">Cancelar</Button>
              <Button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700">
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
