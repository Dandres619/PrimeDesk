import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ConfirmDialog } from './ConfirmDialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { User, Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  barrio: string;
  imagen?: string;
  tipo: 'admin' | 'mecanico' | 'cliente';
  estado: 'activo' | 'inactivo';
}

const initialUsers: Usuario[] = [
  { id: 1, nombre: 'Rafael', apellido: 'Administrador', email: 'admin@rafamotos.com', telefono: '3001234567', direccion: 'Calle 123 #45-67', barrio: 'Centro', tipo: 'admin', estado: 'activo' },
  { id: 2, nombre: 'Carlos', apellido: 'Mécanico', email: 'carlos@rafamotos.com', telefono: '3007654321', direccion: 'Carrera 45 #12-34', barrio: 'La Candelaria', tipo: 'mecanico', estado: 'activo' },
  { id: 3, nombre: 'María', apellido: 'García', email: 'maria@email.com', telefono: '3009876543', direccion: 'Avenida 68 #23-45', barrio: 'Chapinero', tipo: 'cliente', estado: 'activo' },
  { id: 4, nombre: 'Juan', apellido: 'Pérez', email: 'juan@email.com', telefono: '3005555555', direccion: 'Calle 72 #11-22', barrio: 'Zona Rosa', tipo: 'cliente', estado: 'inactivo' },
  { id: 5, nombre: 'Ana', apellido: 'López', email: 'ana@rafamotos.com', telefono: '3003333333', direccion: 'Carrera 7 #85-96', barrio: 'Usaquén', tipo: 'admin', estado: 'activo' }
];

const tipoBadges = {
  admin: { class: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800', label: 'Administrador' },
  mecanico: { class: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', label: 'Mecánico' },
  cliente: { class: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800', label: 'Cliente' }
};

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [viewingUser, setViewingUser] = useState<Usuario | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'destructive' as any, onConfirm: () => {} });
  const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', telefono: '', direccion: '', barrio: '', imagen: '', tipo: 'cliente' as const, password: '', confirmPassword: '' });

  const filteredUsers = usuarios.filter(u => u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.telefono.includes(searchTerm));
  const totalPages = Math.ceil(filteredUsers.length / 2);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * 2, currentPage * 2);

  const resetForm = () => {
    setFormData({ nombre: '', apellido: '', email: '', telefono: '', direccion: '', barrio: '', imagen: '', tipo: 'cliente', password: '', confirmPassword: '' });
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono || !formData.direccion || !formData.barrio) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    if (!editingUser && (!formData.password || !formData.confirmPassword)) {
      toast.error('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    if (!editingUser && formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!editingUser && formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (usuarios.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== editingUser?.id)) {
      toast.error('Este correo electrónico ya está registrado');
      return;
    }

    if (editingUser) {
      setUsuarios(usuarios.map(u => u.id === editingUser.id ? { ...u, nombre: formData.nombre, apellido: formData.apellido, email: formData.email, telefono: formData.telefono, direccion: formData.direccion, barrio: formData.barrio, imagen: formData.imagen, tipo: formData.tipo } : u));
      toast.success('Usuario actualizado exitosamente');
    } else {
      setUsuarios([...usuarios, { id: Date.now(), nombre: formData.nombre, apellido: formData.apellido, email: formData.email, telefono: formData.telefono, direccion: formData.direccion, barrio: formData.barrio, imagen: formData.imagen, tipo: formData.tipo, estado: 'activo' }]);
      toast.success('Usuario creado exitosamente');
    }

    setShowModal(false);
    resetForm();
  };

  const handleEdit = (u: Usuario) => {
    setEditingUser(u);
    setFormData({ nombre: u.nombre, apellido: u.apellido, email: u.email, telefono: u.telefono, direccion: u.direccion, barrio: u.barrio, imagen: u.imagen || '', tipo: u.tipo, password: '', confirmPassword: '' });
    setShowModal(true);
  };

  const fields = [
    { id: 'nombre', label: 'Nombre *', placeholder: 'Nombre del usuario', col: 2 },
    { id: 'apellido', label: 'Apellido *', placeholder: 'Apellido del usuario', col: 2 },
    { id: 'email', label: 'Correo electrónico *', placeholder: 'correo@ejemplo.com', type: 'email', col: 1 },
    { id: 'telefono', label: 'Teléfono *', placeholder: '3001234567', col: 2 },
    { id: 'imagen', label: 'Imagen (URL)', placeholder: 'https://ejemplo.com/imagen.jpg', col: 2 },
    { id: 'direccion', label: 'Dirección *', placeholder: 'Calle 123 #45-67', col: 2 },
    { id: 'barrio', label: 'Barrio *', placeholder: 'Centro', col: 2 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Usuarios</h1>
            <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre, email o teléfono..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
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
                <TableHead>Usuario</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{u.nombre} {u.apellido}</div>
                      <div className="text-sm text-muted-foreground">{u.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{u.telefono}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={tipoBadges[u.tipo].class}>{tipoBadges[u.tipo].label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={u.estado === 'activo'} onCheckedChange={() => setConfirmDialog({ open: true, title: u.estado === 'activo' ? 'Inactivar Usuario' : 'Activar Usuario', description: `¿Estás seguro de que deseas ${u.estado === 'activo' ? 'inactivar' : 'activar'} el usuario "${u.nombre}"?`, confirmText: u.estado === 'activo' ? 'Inactivar' : 'Activar', variant: 'default', onConfirm: () => { setUsuarios(usuarios.map(us => us.id === u.id ? { ...us, estado: us.estado === 'activo' ? 'inactivo' : 'activo' } : us)); toast.success(`Usuario ${u.estado === 'activo' ? 'inactivado' : 'activado'} exitosamente`); } })} />
                      <span className="text-sm">{u.estado === 'activo' ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {[
                        { icon: Eye, onClick: () => setViewingUser(u), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/30' },
                        { icon: Edit, onClick: () => handleEdit(u), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/30' },
                        { icon: Trash2, onClick: () => setConfirmDialog({ open: true, title: 'Eliminar Usuario', description: `¿Estás seguro de que deseas eliminar el usuario "${u.nombre}"? Esta acción no se puede deshacer.`, confirmText: 'Eliminar', variant: 'destructive', onConfirm: () => { setUsuarios(usuarios.filter(us => us.id !== u.id)); toast.success('Usuario eliminado exitosamente'); } }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30' }
                      ].map((a, i) => (
                        <Button key={i} variant="ghost" size="sm" onClick={a.onClick} className={a.color}>
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

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.id} className={f.col === 2 ? "grid grid-cols-2 gap-4" : ""}>
                <div className={f.col === 2 ? "" : "space-y-2"}>
                  <Label htmlFor={f.id}>{f.label}</Label>
                  <Input id={f.id} type={f.type || 'text'} value={formData[f.id as keyof typeof formData]} onChange={(e) => setFormData(prev => ({ ...prev, [f.id]: e.target.value }))} placeholder={f.placeholder} />
                </div>
                {f.col === 2 && fields[fields.indexOf(f) + 1] && fields[fields.indexOf(f) + 1].col === 2 && (() => {
                  const nextField = fields[fields.indexOf(f) + 1];
                  return (
                    <div>
                      <Label htmlFor={nextField.id}>{nextField.label}</Label>
                      <Input id={nextField.id} type={nextField.type || 'text'} value={formData[nextField.id as keyof typeof formData]} onChange={(e) => setFormData(prev => ({ ...prev, [nextField.id]: e.target.value }))} placeholder={nextField.placeholder} />
                    </div>
                  );
                })()}
              </div>
            )).filter((_, i, arr) => i === 0 || fields[i].col !== 2 || fields[i - 1].col !== 2)}

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de usuario *</Label>
              <Select value={formData.tipo} onValueChange={(value: 'admin' | 'mecanico' | 'cliente') => setFormData(prev => ({ ...prev, tipo: value }))}>
                <SelectTrigger className="bg-background dark:bg-input-background text-foreground dark:text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-input-background border-border">
                  {Object.entries(tipoBadges).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-muted">{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!editingUser && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="Mínimo 6 caracteres" className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                  <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="Confirme la contraseña" />
                </div>
              </>
            )}

            {editingUser && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Nota:</strong> Para cambiar la contraseña, el usuario debe usar la opción "Recuperar contraseña" en el login.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1">Cancelar</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">{editingUser ? 'Actualizar' : 'Crear'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                  <img src={viewingUser.imagen || "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBhdmF0YXJ8ZW58MXx8fHwxNzU4Mzk2MDE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"} alt={`${viewingUser.nombre} ${viewingUser.apellido}`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewingUser.nombre} {viewingUser.apellido}</h3>
                  <p className="text-muted-foreground">{viewingUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={tipoBadges[viewingUser.tipo].class}>{tipoBadges[viewingUser.tipo].label}</Badge>
                    <Badge className={viewingUser.estado === 'activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}>{viewingUser.estado === 'activo' ? 'Activo' : 'Inactivo'}</Badge>
                  </div>
                </div>
              </div>
              {[
                { title: 'Información Personal', fields: [['Nombre', viewingUser.nombre], ['Apellido', viewingUser.apellido], ['Correo electrónico', viewingUser.email], ['Teléfono', viewingUser.telefono]] },
                { title: 'Información de Ubicación', fields: [['Dirección', viewingUser.direccion], ['Barrio', viewingUser.barrio]] },
                { title: 'Información del Sistema', fields: [['Tipo de usuario', <Badge key="tipo" className={tipoBadges[viewingUser.tipo].class}>{tipoBadges[viewingUser.tipo].label}</Badge>], ['Estado de la cuenta', <Badge key="estado" className={viewingUser.estado === 'activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}>{viewingUser.estado === 'activo' ? 'Activo' : 'Inactivo'}</Badge>], ['ID de usuario', `#${viewingUser.id}`], ['Fecha de registro', new Date().toLocaleDateString('es-ES')]] }
              ].map((section, i) => (
                <div key={i}>
                  <h4 className="font-semibold mb-3">{section.title}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {section.fields.map(([label, value], j) => (
                      <div key={j}>
                        <Label className="text-muted-foreground">{label}</Label>
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

      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))} title={confirmDialog.title} description={confirmDialog.description} confirmText={confirmDialog.confirmText} onConfirm={confirmDialog.onConfirm} variant={confirmDialog.variant} />
    </div>
  );
}
