import React, { useState } from 'react';
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
import { Plus, Search, Edit, Trash2, Shield, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function Roles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [viewingRole, setViewingRole] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'default' as any, onConfirm: () => {} });

  const [roles, setRoles] = useState([
    { id: 1, name: 'Administrador', description: 'Acceso completo al sistema', status: 'Activo', permissions: ['tablero', 'usuarios', 'roles', 'motocicletas', 'agendamientos', 'ventas', 'compras', 'proveedores'] },
    { id: 2, name: 'Técnico', description: 'Acceso a servicios y reparaciones', status: 'Activo', permissions: ['tablero', 'motocicletas', 'agendamientos'] },
    { id: 3, name: 'Recepcionista', description: 'Gestión de citas y clientes', status: 'Activo', permissions: ['tablero', 'clientes', 'agendamientos'] },
    { id: 4, name: 'Cliente', description: 'Acceso limitado para clientes', status: 'Activo', permissions: ['motocicletas-cliente', 'agendamientos-cliente'] }
  ]);

  const permissions = [
    { id: 1, name: 'tablero', description: 'Ver dashboard principal', module: 'Dashboard', status: 'Activo' },
    { id: 2, name: 'usuarios', description: 'Gestionar usuarios', module: 'Usuarios', status: 'Activo' },
    { id: 3, name: 'roles', description: 'Gestionar roles y permisos', module: 'Roles', status: 'Activo' },
    { id: 4, name: 'clientes', description: 'Gestionar clientes', module: 'Clientes', status: 'Activo' },
    { id: 5, name: 'motocicletas', description: 'Gestionar motocicletas (Admin, Mecánico)', module: 'Motos', status: 'Activo' },
    { id: 6, name: 'motocicletas-cliente', description: 'Ver motocicletas (Cliente)', module: 'Motos Cliente', status: 'Activo' },
    { id: 7, name: 'agendamientos', description: 'Gestionar agendamientos (Admin, Mecánico)', module: 'Agendamientos', status: 'Activo' },
    { id: 8, name: 'agendamientos-cliente', description: 'Gestionar agendamientos (Cliente)', module: 'Agendamientos Cliente', status: 'Activo' },
    { id: 9, name: 'ventas', description: 'Gestionar ventas', module: 'Ventas', status: 'Activo' },
    { id: 10, name: 'compras', description: 'Gestionar compras', module: 'Compras', status: 'Activo' },
    { id: 11, name: 'proveedores', description: 'Gestionar proveedores', module: 'Proveedores', status: 'Activo' }
  ];

  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredRoles.length / 2);
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * 2, currentPage * 2);

  const handleSaveRole = (data: any) => {
    editingRole ? setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...data } : r)) : setRoles([...roles, { id: Date.now(), ...data, status: 'Activo' }]);
    setIsRoleDialogOpen(false);
    setEditingRole(null);
  };

  const actions = [
    { icon: Eye, onClick: (r: any) => setViewingRole(r), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' },
    { icon: Edit, onClick: (r: any) => { setEditingRole(r); setIsRoleDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' },
    { icon: Trash2, onClick: (r: any) => setConfirmDialog({ open: true, title: 'Eliminar Rol', description: '¿Está seguro de que desea eliminar este rol? Esta acción no se puede deshacer.', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => { setRoles(roles.filter(ro => ro.id !== r.id)); toast.success('Rol eliminado exitosamente'); } }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar roles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRole(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Rol
            </Button>
          </DialogTrigger>
          <RoleDialog role={editingRole} permissions={permissions} onSave={handleSaveRole} />
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Gestión de Roles ({filteredRoles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRoles.map(r => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-sm text-muted-foreground">{r.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={r.status === 'Activo'} onCheckedChange={() => setRoles(roles.map(ro => ro.id === r.id ? { ...ro, status: ro.status === 'Activo' ? 'Inactivo' : 'Activo' } : ro))} />
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
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                  </PaginationItem>
                )}
                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map(p => (
                  <PaginationItem key={p}>
                    <PaginationLink onClick={() => totalPages > 1 ? setCurrentPage(p) : undefined} isActive={currentPage === p} className={totalPages > 1 ? "cursor-pointer" : "cursor-default"}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

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
                <p>{viewingRole.description}</p>
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
                  {viewingRole.permissions.map((p: string) => (
                    <Badge key={p} variant="secondary">{p}</Badge>
                  ))}
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
  const [formData, setFormData] = useState({ name: role?.name || '', description: role?.description || '', permissions: role?.permissions || [] });

  const togglePermission = (p: string) => setFormData(prev => ({ ...prev, permissions: prev.permissions.includes(p) ? prev.permissions.filter((perm: string) => perm !== p) : [...prev.permissions, p] }));

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
          <Input id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Descripción del rol" required />
        </div>
        <div>
          <Label>Permisos</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
            {permissions.filter((p: any) => p.status === 'Activo').map((p: any) => (
              <div key={p.id} className="flex items-center space-x-2">
                <Checkbox id={p.name} checked={formData.permissions.includes(p.name)} onCheckedChange={() => togglePermission(p.name)} />
                <Label htmlFor={p.name} className="text-sm">{p.name}</Label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {role ? 'Actualizar' : 'Crear'} Rol
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
