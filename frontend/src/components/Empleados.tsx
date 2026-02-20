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
import { Plus, Search, Edit, Trash2, Eye, UserCog, Phone, Mail, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const initialEmployees = [
  { id: 1, nombre: 'Rafael', apellido: 'Martínez', email: 'rafael.martinez@rafamotos.com', phone: '+57 310 555 0001', direccion: 'Avenida Principal #100-50', barrio: 'Centro', fechaNacimiento: '1980-03-15', imagen: '', document: '80123456', documentType: 'CC', status: 'Activo', role: 'Administrador', registeredAt: '2023-01-01', specialty: 'Gestión y Administración' },
  { id: 2, nombre: 'Carlos', apellido: 'Rodríguez', email: 'carlos.rodriguez@rafamotos.com', phone: '+57 311 555 0002', direccion: 'Calle 45 #23-10', barrio: 'San Antonio', fechaNacimiento: '1988-07-22', imagen: '', document: '88234567', documentType: 'CC', status: 'Activo', role: 'Mecánico', registeredAt: '2023-02-15', specialty: 'Motores y Transmisión' },
  { id: 3, nombre: 'Miguel Ángel', apellido: 'Sánchez', email: 'miguel.sanchez@rafamotos.com', phone: '+57 312 555 0003', direccion: 'Carrera 30 #15-20', barrio: 'La Primavera', fechaNacimiento: '1992-11-08', imagen: '', document: '92345678', documentType: 'CC', status: 'Activo', role: 'Mecánico', registeredAt: '2023-05-20', specialty: 'Sistemas Eléctricos' },
  { id: 4, nombre: 'Juan Pablo', apellido: 'Moreno', email: 'juan.moreno@rafamotos.com', phone: '+57 313 555 0004', direccion: 'Diagonal 50 #80-30', barrio: 'El Recreo', fechaNacimiento: '1990-05-18', imagen: '', document: '90456789', documentType: 'CC', status: 'Activo', role: 'Mecánico', registeredAt: '2023-08-10', specialty: 'Frenos y Suspensión' },
  { id: 5, nombre: 'Diego', apellido: 'Ramírez', email: 'diego.ramirez@rafamotos.com', phone: '+57 314 555 0005', direccion: 'Transversal 20 #40-15', barrio: 'Villa Nueva', fechaNacimiento: '1995-09-25', imagen: '', document: '95567890', documentType: 'CC', status: 'Activo', role: 'Mecánico', registeredAt: '2024-01-05', specialty: 'Carrocería y Pintura' }
];

const roleBadges = {
  'Administrador': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Mecánico': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
};

const docTypes: any = { CC: 'Cédula de Ciudadanía', CE: 'Cédula de Extranjería', PP: 'Pasaporte' };

export function Empleados() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => {} });
  const [employees, setEmployees] = useState(initialEmployees);

  const filteredEmployees = employees.filter(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || e.apellido.toLowerCase().includes(searchTerm.toLowerCase()) || e.email.toLowerCase().includes(searchTerm.toLowerCase()) || e.phone.includes(searchTerm) || e.document.includes(searchTerm) || e.role.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredEmployees.length / 2);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * 2, currentPage * 2);

  const handleSave = (data: any) => {
    editingEmployee ? setEmployees(employees.map(e => e.id === editingEmployee.id ? { ...e, ...data } : e)) : setEmployees([...employees, { id: Date.now(), ...data, status: 'Activo', registeredAt: new Date().toISOString().split('T')[0] }]);
    toast.success(`Empleado ${editingEmployee ? 'actualizado' : 'registrado'} exitosamente`);
    setIsDialogOpen(false);
    setEditingEmployee(null);
  };

  const stats = [
    { icon: UserCog, color: 'text-blue-600', value: employees.length, label: 'Total Empleados' },
    { icon: UserCog, color: 'text-green-600', value: employees.filter(e => e.status === 'Activo').length, label: 'Activos' },
    { icon: UserCog, color: 'text-red-600', value: employees.filter(e => e.role === 'Administrador').length, label: 'Administradores' },
    { icon: UserCog, color: 'text-purple-600', value: employees.filter(e => e.role === 'Mecánico').length, label: 'Mecánicos' }
  ];

  const actions = [
    { icon: Eye, onClick: (e: any) => setViewingEmployee(e), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30' },
    { icon: Edit, onClick: (e: any) => { setEditingEmployee(e); setIsDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30' },
    { icon: Trash2, onClick: (e: any) => setConfirmDialog({ open: true, title: 'Eliminar Empleado', description: '¿Está seguro de que desea eliminar este empleado? Esta acción no se puede deshacer.', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => { setEmployees(employees.filter(emp => emp.id !== e.id)); toast.success('Empleado eliminado exitosamente'); } }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar empleados..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingEmployee(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Empleado
            </Button>
          </DialogTrigger>
          <EmployeeDialog employee={editingEmployee} onSave={handleSave} />
        </Dialog>
      </div>

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
                <TableHead>Empleado</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.map(e => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{e.nombre} {e.apellido}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {e.specialty}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        {e.email}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {e.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{e.documentType}: {e.document}</p>
                      <p className="text-sm text-muted-foreground">Reg: {e.registeredAt}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleBadges[e.role as keyof typeof roleBadges]}>{e.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={e.status === 'Activo'} onCheckedChange={() => { setEmployees(employees.map(emp => emp.id === e.id ? { ...emp, status: emp.status === 'Activo' ? 'Inactivo' : 'Activo' } : emp)); toast.success('Estado actualizado exitosamente'); }} />
                      <span className="text-sm">{e.status}</span>
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

      <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Empleado</DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img src={viewingEmployee.imagen || "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBhdmF0YXJ8ZW58MXx8fHwxNzU4Mzk2MDE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"} alt={`${viewingEmployee.nombre} ${viewingEmployee.apellido}`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewingEmployee.nombre} {viewingEmployee.apellido}</h3>
                  <p className="text-muted-foreground">{viewingEmployee.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={viewingEmployee.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}>{viewingEmployee.status}</Badge>
                    <Badge className={roleBadges[viewingEmployee.role as keyof typeof roleBadges]}>{viewingEmployee.role}</Badge>
                  </div>
                </div>
              </div>
              {[
                { title: 'Información Personal', fields: [['Nombre', viewingEmployee.nombre], ['Apellido', viewingEmployee.apellido], ['Fecha de nacimiento', new Date(viewingEmployee.fechaNacimiento).toLocaleDateString('es-ES')], ['Edad', `${new Date().getFullYear() - new Date(viewingEmployee.fechaNacimiento).getFullYear()} años`]] },
                { title: 'Información de Contacto', fields: [['Correo electrónico', viewingEmployee.email], ['Teléfono', viewingEmployee.phone], ['Dirección', viewingEmployee.direccion], ['Barrio', viewingEmployee.barrio]] },
                { title: 'Información Laboral', fields: [['Rol', viewingEmployee.role], ['Especialidad', viewingEmployee.specialty]] },
                { title: 'Información de Identificación', fields: [['Tipo de documento', docTypes[viewingEmployee.documentType] || viewingEmployee.documentType], ['Número de documento', viewingEmployee.document]] },
                { title: 'Información del Sistema', fields: [['Estado de la cuenta', <Badge key="status" className={viewingEmployee.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}>{viewingEmployee.status}</Badge>], ['Fecha de ingreso', new Date(viewingEmployee.registeredAt).toLocaleDateString('es-ES')], ['ID del empleado', `#${viewingEmployee.id}`]] }
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

      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))} title={confirmDialog.title} description={confirmDialog.description} confirmText={confirmDialog.confirmText} variant={confirmDialog.variant} onConfirm={confirmDialog.onConfirm} />
    </div>
  );
}

function EmployeeDialog({ employee, onSave }: any) {
  const [formData, setFormData] = useState({ nombre: employee?.nombre || '', apellido: employee?.apellido || '', email: employee?.email || '', phone: employee?.phone || '', direccion: employee?.direccion || '', barrio: employee?.barrio || '', fechaNacimiento: employee?.fechaNacimiento || '', imagen: employee?.imagen || '', document: employee?.document || '', documentType: employee?.documentType || 'CC', role: employee?.role || 'Mecánico', specialty: employee?.specialty || '' });

  const fields = [
    { id: 'nombre', label: 'Nombre', placeholder: 'Nombre del empleado', required: true },
    { id: 'apellido', label: 'Apellido', placeholder: 'Apellido del empleado', required: true },
    { id: 'email', label: 'Correo Electrónico', placeholder: 'empleado@rafamotos.com', type: 'email', required: true, full: true },
    { id: 'phone', label: 'Teléfono', placeholder: '+57 300 123 4567', required: true, full: true },
    { id: 'direccion', label: 'Dirección', placeholder: 'Calle 123 #45-67', required: true },
    { id: 'barrio', label: 'Barrio', placeholder: 'Centro', required: true },
    { id: 'fechaNacimiento', label: 'Fecha de Nacimiento', type: 'date', required: true },
    { id: 'imagen', label: 'Imagen (URL)', placeholder: 'https://ejemplo.com/imagen.jpg' }
  ];

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{employee ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
        {fields.map(f => f.full ? (
          <div key={f.id}>
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input id={f.id} type={f.type || 'text'} value={formData[f.id as keyof typeof formData]} onChange={(e) => setFormData(prev => ({ ...prev, [f.id]: e.target.value }))} placeholder={f.placeholder} required={f.required} />
          </div>
        ) : null)}
        
        <div className="grid grid-cols-2 gap-4">
          {fields.filter(f => !f.full).map(f => (
            <div key={f.id}>
              <Label htmlFor={f.id}>{f.label}</Label>
              <Input id={f.id} type={f.type || 'text'} value={formData[f.id as keyof typeof formData]} onChange={(e) => setFormData(prev => ({ ...prev, [f.id]: e.target.value }))} placeholder={f.placeholder} required={f.required} />
            </div>
          ))}
          <div>
            <Label htmlFor="documentType">Tipo de Documento</Label>
            {employee ? (
              <Input value={formData.documentType} disabled className="bg-muted/50" />
            ) : (
              <select id="documentType" value={formData.documentType} onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-input-background dark:bg-input/30">
                {Object.entries(docTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            )}
          </div>
          <div>
            <Label htmlFor="document">Número de Documento</Label>
            <Input id="document" value={formData.document} onChange={employee ? undefined : (e) => setFormData(prev => ({ ...prev, document: e.target.value }))} placeholder="12345678" disabled={!!employee} className={employee ? "bg-muted/50" : ""} required />
          </div>
          <div>
            <Label htmlFor="role">Rol</Label>
            <select id="role" value={formData.role} onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-input-background dark:bg-input/30" required>
              <option value="Administrador">Administrador</option>
              <option value="Mecánico">Mecánico</option>
            </select>
          </div>
          <div>
            <Label htmlFor="specialty">Especialidad</Label>
            <Input id="specialty" value={formData.specialty} onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))} placeholder="Ej: Motores y Transmisión" required />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {employee ? 'Actualizar' : 'Registrar'} Empleado
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
