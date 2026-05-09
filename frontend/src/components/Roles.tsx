import { useState, useEffect, useCallback } from 'react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function Roles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [viewingRole, setViewingRole] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'default' as any, onConfirm: () => { } });

  const [roles, setRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsProcessing(true);
    try {
      if (!formData.permissions || formData.permissions.length === 0) {
        throw new Error('Debe seleccionar, por lo menos, un permiso.');
      }

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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRole = async (id: number) => {
    setIsDeleting(true);
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
      setConfirmDialog(prev => ({ ...prev, open: false }));
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
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
  ).sort((a, b) => a.name.localeCompare(b.name));

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / itemsPerPage));
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Roles</h1>
                <p className="text-muted-foreground">Gestión de permisos y acceso</p>
              </div>
            </div>
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingRole(null)} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Rol
                </Button>
              </DialogTrigger>
              <RoleDialog role={editingRole} permissions={allPermissions} onSave={handleSaveRole} isProcessing={isProcessing} />
            </Dialog>
          </div>

          <div className="flex justify-start">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar roles..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10" />
            </div>
          </div>

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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setViewingRole(r); setIsViewDialogOpen(true); }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
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
                                size="sm"
                                variant="ghost"
                                onClick={() => { setEditingRole(r); setIsRoleDialogOpen(true); }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                disabled={r.status === 'Inactivo'}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar rol</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirmDialog({
                                  open: true,
                                  title: 'Eliminar Rol',
                                  description: '¿Está seguro de que desea eliminar este rol? Esta acción no se puede deshacer.',
                                  confirmText: 'Eliminar',
                                  variant: 'delete',
                                  onConfirm: () => handleDeleteRole(r.id)
                                })}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={r.status === 'Inactivo'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Eliminar rol</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No se encontraron roles.
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

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-lg max-h-[90vh] overflow-y-auto animate-modal p-0"
        >
          {viewingRole && (
            <>
              {/* Hero header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <DialogHeader><DialogTitle className="text-lg font-semibold">{viewingRole.name}</DialogTitle></DialogHeader>
                        <Badge className={`text-[11px] px-2 py-0.5 ${viewingRole.status === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                          {viewingRole.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{viewingRole.description || 'Sin descripción'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* Permissions section */}
              <div className="px-6 pb-6 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Permisos asignados</span>
                  <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5">
                    {viewingRole.permissions?.length || 0}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {viewingRole.permissions && viewingRole.permissions.length > 0 ? (
                    viewingRole.permissions.map((p: any) => (
                      <span key={p.ID_Permiso} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40 transition-colors">
                        <Shield className="w-3 h-3" />
                        {p.Nombre}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tiene permisos asignados.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
        loadingText="Eliminando"
      />
        </>
      )}
    </div>
  );
}

function RoleDialog({ role, permissions, onSave, isProcessing }: any) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    status: role?.status || 'Activo',
    permissions: role?.permissions ? role.permissions.map((p: any) => p.ID_Permiso) : []
  });
  const [touched, setTouched] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        status: role.status,
        permissions: role.permissions.map((p: any) => p.ID_Permiso)
      });
      setTouched(false);
      setNameError('');
    } else {
      setFormData({ name: '', description: '', status: 'Activo', permissions: [] });
      setTouched(false);
      setNameError('');
    }
  }, [role]);

  useEffect(() => {
    if (touched) {
      if (!formData.name.trim()) {
        setNameError('El nombre del rol no puede estar vacío');
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
        setNameError('Solo se permiten letras');
      } else {
        setNameError('');
      }
    }
  }, [formData.name, touched]);

  const togglePermission = (id: number) => setFormData(prev => ({
    ...prev,
    permissions: prev.permissions.includes(id)
      ? prev.permissions.filter((pId: number) => pId !== id)
      : [...prev.permissions, id]
  }));

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setFormData(prev => ({ ...prev, name: val }));
    if (!touched) setTouched(true);
  };

  return (
    <DialogContent
      onOpenAutoFocus={(e) => e.preventDefault()}
      className="max-w-2xl max-h-[90vh] overflow-y-auto animate-modal p-0"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogHeader><DialogTitle className="text-lg font-semibold">{role ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle></DialogHeader>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (!nameError) onSave(formData); }} className="px-6 py-5 space-y-5">
        {/* Name field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Rol *</Label>
            {nameError && <span className="text-red-500 text-xs font-medium">{nameError}</span>}
          </div>
          <Input
            id="name"
            value={formData.name}
            onChange={handleNameChange}
            onFocus={() => setTouched(true)}
            onBlur={() => setTouched(true)}
            placeholder="Ej: Administrador"
            required
            className={`h-10 ${touched && nameError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
        </div>

        {/* Description field */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</Label>
          <Input id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Descripción del rol" className="h-10" />
        </div>

        {/* Permissions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Permisos</Label>
            <span className="text-xs text-muted-foreground">
              {formData.permissions.length} seleccionado{formData.permissions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800">
            {permissions.length > 0 ? (
              permissions.map((p: any) => {
                const isSelected = formData.permissions.includes(p.id);
                return (
                  <label
                    key={p.id}
                    htmlFor={`perm-${p.id}`}
                    className={`flex items-center gap-2.5 p-2.5 rounded-md border cursor-pointer select-none transition-all duration-150
                      ${isSelected
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800'
                        : 'bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                  >
                    <Checkbox
                      id={`perm-${p.id}`}
                      checked={isSelected}
                      onCheckedChange={() => togglePermission(p.id)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-medium block truncate">{p.name}</span>
                      {p.description && <span className="text-[11px] text-muted-foreground block truncate">{p.description}</span>}
                    </div>
                  </label>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-6">No hay permisos disponibles.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="submit"
            disabled={isProcessing || (touched && !!nameError)}
            className="bg-blue-600 hover:bg-blue-700 px-6"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {role ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>{role ? 'Actualizar' : 'Crear'} Rol</>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
