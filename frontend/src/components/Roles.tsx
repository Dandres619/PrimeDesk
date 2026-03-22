import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Search, Edit, Trash2, Shield, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function Roles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [viewingRole, setViewingRole] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'default' as any, onConfirm: () => { } });

  const [roles, setRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // @ts-ignore
  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('token');

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener los roles');
      const data = await response.json();

      // Fetch permissions for each role to match the frontend structure
      const rolesWithPermissions = await Promise.all(data.map(async (role: any) => {
        const permRes = await fetch(`${API_URL}/roles/${role.ID_Rol}/permisos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const perms = permRes.ok ? await permRes.json() : [];
        return {
          ...role,
          id: role.ID_Rol,
          name: role.Nombre,
          description: role.Descripcion,
          status: (role.Estado === true || role.Estado === 1) ? 'Activo' : 'Inactivo',
          permissions: perms // This will be the full permission objects
        };
      }));

      setRoles(rolesWithPermissions);
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [API_URL, token]);

  const fetchAllPermissions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/permisos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener los permisos');
      const data = await response.json();
      setAllPermissions(data.map((p: any) => ({
        id: p.ID_Permiso,
        name: p.Nombre,
        description: p.Descripcion,
        status: 'Activo' // Assuming all are active for now
      })));
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [API_URL, token]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchRoles(), fetchAllPermissions()]);
      setIsLoading(false);
    };
    init();
  }, [fetchRoles, fetchAllPermissions]);

  const handleSaveRole = async (formData: any) => {
    try {
      const roleData = {
        nombre: formData.name,
        descripcion: formData.description,
        estado: formData.status === 'Activo' // resolves to boolean true/false
      };

      let roleId = editingRole?.id;
      let response;

      if (editingRole) {
        response = await fetch(`${API_URL}/roles/${roleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(roleData)
        });
      } else {
        response = await fetch(`${API_URL}/roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(roleData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el rol');
      }

      const savedRole = await response.json();
      if (!savedRole.ID_Rol && !roleId) roleId = savedRole.id; // Just in case
      const finalRoleId = roleId || savedRole.ID_Rol;

      // Handle permissions
      // For simplicity in this refactor, we'll sync permissions by removing all and adding current
      // Get current permissions from backend
      const currentPermsRes = await fetch(`${API_URL}/roles/${finalRoleId}/permisos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const currentPerms = currentPermsRes.ok ? await currentPermsRes.json() : [];

      // Find permissions to add and remove
      const newPermIds = formData.permissions; // These are IDs now
      const currentPermIds = currentPerms.map((p: any) => p.ID_Permiso);

      const toAdd = newPermIds.filter((id: number) => !currentPermIds.includes(id));
      const toRemove = currentPermIds.filter((id: number) => !newPermIds.includes(id));

      await Promise.all([
        ...toAdd.map((idPerm: number) => fetch(`${API_URL}/roles/${finalRoleId}/permisos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id_permiso: idPerm })
        })),
        ...toRemove.map((idPerm: number) => fetch(`${API_URL}/roles/${finalRoleId}/permisos/${idPerm}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }))
      ]);

      toast.success(editingRole ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
      setIsRoleDialogOpen(false);
      setEditingRole(null);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteRole = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar el rol');
      }
      toast.success('Rol eliminado exitosamente');
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleRoleStatus = async (role: any) => {
    try {
      const newStatus = role.status === 'Activo' ? false : true;
      const response = await fetch(`${API_URL}/roles/${role.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: role.name,
          descripcion: role.description,
          estado: newStatus
        })
      });
      if (!response.ok) throw new Error('No se puede inactivar este rol dado que hay uno o más usuarios que tienen este rol activo.');
      toast.success('Estado actualizado');
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const actions = [
    { icon: Eye, onClick: (r: any) => setViewingRole(r), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' },
    { icon: Edit, onClick: (r: any) => { setEditingRole(r); setIsRoleDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' },
    {
      icon: Trash2, onClick: (r: any) => setConfirmDialog({
        open: true,
        title: 'Eliminar Rol',
        description: '¿Está seguro de que desea eliminar este rol? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        variant: 'delete',
        onConfirm: () => handleDeleteRole(r.id)
      }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50'
    }
  ];



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Roles</h1>
            <p className="text-muted-foreground">Gestión de permisos y acceso</p>
          </div>
        </div>
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRole(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Rol
            </Button>
          </DialogTrigger>
          <RoleDialog role={editingRole} permissions={allPermissions} onSave={handleSaveRole} />
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar roles por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Lista de Roles ({filteredRoles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rol</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRoles.length > 0 ? (
                  paginatedRoles.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p>{r.name}</p>
                      </TableCell>
                      <TableCell>
                        <p>{r.description ? r.description : 'Sin descripción'}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={r.status === 'Activo'} onCheckedChange={() => toggleRoleStatus(r)} />
                          <span className="text-sm">{r.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {actions.map((a, i) => (
                            <Button key={i} size="sm" variant="ghost" onClick={() => a.onClick(r)} className={a.color}>
                              <a.icon className="w-4 h-4" />
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No se encontraron roles.
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
      )}

      <Dialog open={!!viewingRole} onOpenChange={() => setViewingRole(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Rol</DialogTitle>
          </DialogHeader>
          {viewingRole && (
            <div className="space-y-4">
              <div>
                <Label>Nombre del Rol</Label>
                <p className="font-medium">{viewingRole.name}</p>
              </div>
              <div>
                <Label>Descripción</Label>
                <p>{viewingRole.description || 'Sin descripción'}</p>
              </div>
              <div>
                <Label>Estado</Label>
                <Badge className={viewingRole.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}>
                  {viewingRole.status}
                </Badge>
              </div>
              <div>
                <Label>Permisos Asignados</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {viewingRole.permissions && viewingRole.permissions.length > 0 ? (
                    viewingRole.permissions.map((p: any) => (
                      <Badge key={p.ID_Permiso} variant="secondary">{p.Nombre}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tiene permisos asignados.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))} title={confirmDialog.title} description={confirmDialog.description} confirmText={confirmDialog.confirmText} variant={confirmDialog.variant} onConfirm={confirmDialog.onConfirm} />
    </div>
  );
}

function RoleDialog({ role, permissions, onSave }: any) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    status: role?.status || 'Activo',
    permissions: role?.permissions ? role.permissions.map((p: any) => p.ID_Permiso) : []
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        status: role.status,
        permissions: role.permissions.map((p: any) => p.ID_Permiso)
      });
    } else {
      setFormData({ name: '', description: '', status: 'Activo', permissions: [] });
    }
  }, [role]);

  const togglePermission = (id: number) => setFormData(prev => ({
    ...prev,
    permissions: prev.permissions.includes(id)
      ? prev.permissions.filter((pId: number) => pId !== id)
      : [...prev.permissions, id]
  }));

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{role ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre del Rol</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ej: Administrador" required />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Input id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Descripción del rol" />
        </div>
        <div>
          <Label>Permisos</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto p-2 border rounded-md bg-muted/20">
            {permissions.length > 0 ? (
              permissions.map((p: any) => (
                <div key={p.id} className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded transition-colors">
                  <Checkbox
                    id={`perm-${p.id}`}
                    checked={formData.permissions.includes(p.id)}
                    onCheckedChange={() => togglePermission(p.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={`perm-${p.id}`} className="text-sm font-medium leading-none cursor-pointer">
                      {p.name}
                    </Label>
                    <p className="text-[10px] text-muted-foreground">{p.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-4">No hay permisos disponibles definidos en el sistema.</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto px-8">
            {role ? 'Actualizar' : 'Crear'} Rol
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
