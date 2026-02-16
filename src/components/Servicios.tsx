import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, Wrench, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const initialServices = [
  { id: 1, name: 'Mantenimiento Preventivo', description: 'Revisión general de la motocicleta, cambio de filtros y fluidos', status: 'Activo', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
  { id: 2, name: 'Reparación de Motor', description: 'Diagnóstico y reparación de problemas del motor', status: 'Activo', createdAt: '2024-01-10', updatedAt: '2024-01-20' },
  { id: 3, name: 'Reparación de Frenos', description: 'Cambio de pastillas, discos y revisión del sistema de frenos', status: 'Activo', createdAt: '2024-01-12', updatedAt: '2024-01-12' },
  { id: 4, name: 'Cambio de Transmisión', description: 'Reemplazo completo del sistema de transmisión', status: 'Activo', createdAt: '2024-01-08', updatedAt: '2024-01-25' },
  { id: 5, name: 'Diagnóstico General', description: 'Evaluación completa del estado de la motocicleta', status: 'Activo', createdAt: '2024-01-18', updatedAt: '2024-01-18' },
  { id: 6, name: 'Personalización', description: 'Modificaciones estéticas y de rendimiento', status: 'Activo', createdAt: '2024-01-14', updatedAt: '2024-01-22' },
  { id: 7, name: 'Cambio de Aceite', description: 'Cambio de aceite del motor y filtro', status: 'Activo', createdAt: '2024-01-16', updatedAt: '2024-01-16' },
  { id: 8, name: 'Afinación', description: 'Ajuste de carburador, bujías y sistema de encendido', status: 'Inactivo', createdAt: '2024-01-05', updatedAt: '2024-01-28' }
];

export function Servicios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [viewingService, setViewingService] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => {} });
  const [services, setServices] = useState(initialServices);

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.description.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredServices.length / 2);
  const paginatedServices = filteredServices.slice((currentPage - 1) * 2, currentPage * 2);

  const handleSave = (data: any) => {
    if (!data.name || !data.description) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }
    const now = new Date().toISOString().split('T')[0];
    editingService ? setServices(services.map(s => s.id === editingService.id ? { ...s, ...data, updatedAt: now } : s)) : setServices([...services, { id: Date.now(), ...data, status: 'Activo', createdAt: now, updatedAt: now }]);
    toast.success(`Servicio ${editingService ? 'actualizado' : 'creado'} exitosamente`);
    setIsDialogOpen(false);
    setEditingService(null);
  };

  const stats = [
    { icon: Wrench, color: 'text-blue-600', value: services.length, label: 'Total Servicios' },
    { icon: CheckCircle, color: 'text-green-600', value: services.filter(s => s.status === 'Activo').length, label: 'Activos' },
    { icon: XCircle, color: 'text-red-600', value: services.filter(s => s.status === 'Inactivo').length, label: 'Inactivos' }
  ];

  const actions = [
    { icon: Eye, onClick: (s: any) => setViewingService(s), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' },
    { icon: Edit, onClick: (s: any) => { setEditingService(s); setIsDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' },
    { icon: Trash2, onClick: (s: any) => setConfirmDialog({ open: true, title: 'Eliminar Servicio', description: '¿Está seguro de que desea eliminar este servicio? Esta acción no se puede deshacer.', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => { setServices(services.filter(se => se.id !== s.id)); toast.success('Servicio eliminado exitosamente'); } }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar servicios..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingService(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <ServiceDialog service={editingService} onSave={handleSave} />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Wrench className="w-5 h-5 text-blue-600" />
            Listado de Servicios ({filteredServices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServices.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={s.status === 'Activo'} onCheckedChange={() => { const now = new Date().toISOString().split('T')[0]; setServices(services.map(se => se.id === s.id ? { ...se, status: se.status === 'Activo' ? 'Inactivo' : 'Activo', updatedAt: now } : se)); toast.success('Estado del servicio actualizado'); }} />
                      <span className="text-sm">{s.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {actions.map((a, i) => (
                        <Button key={i} size="sm" variant="ghost" onClick={() => a.onClick(s)} className={a.color}>
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

      <Dialog open={!!viewingService} onOpenChange={() => setViewingService(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Servicio</DialogTitle>
          </DialogHeader>
          {viewingService && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del Servicio</Label>
                  <p className="font-medium">{viewingService.name}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge className={viewingService.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}>{viewingService.status}</Badge>
                </div>
              </div>
              <div>
                <Label>Descripción</Label>
                <p className="mt-1 p-3 bg-muted/50 text-foreground rounded">{viewingService.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))} title={confirmDialog.title} description={confirmDialog.description} confirmText={confirmDialog.confirmText} variant={confirmDialog.variant} onConfirm={confirmDialog.onConfirm} />
    </div>
  );
}

function ServiceDialog({ service, onSave }: any) {
  const [formData, setFormData] = useState({ name: service?.name || '', description: service?.description || '' });

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{service ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre del Servicio *</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ej: Mantenimiento Preventivo" required />
        </div>
        <div>
          <Label htmlFor="description">Descripción *</Label>
          <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Descripción detallada del servicio..." rows={4} required />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {service ? 'Actualizar' : 'Crear'} Servicio
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
