import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { PDFPreviewDialog } from './PDFPreviewDialog';
import { Plus, Search, Eye, Edit2, XCircle, FileText, Wrench, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const initialOrders = [
  { id: 1, orderNumber: 'OS-001', date: '2024-01-15', clientId: 1, clientName: 'Juan Carlos Pérez', clientPhone: '+57 300 123 4567', clientDocument: '12345678', motorcycleId: 1, motorcycleBrand: 'Honda', motorcycleModel: 'CB600F', motorcyclePlate: 'ABC123', motorcycleYear: '2020', selectedServices: ['Mantenimiento Preventivo', 'Cambio de Aceite'], observations: 'Cliente reporta ruido en el motor al acelerar', progress: [{ id: 1, description: 'Recepción de la motocicleta - Inspección inicial', technician: 'Carlos Méndez' }, { id: 2, description: 'Cambio de aceite y filtro completado', technician: 'Carlos Méndez' }], associatedSaleId: null, anulado: false },
  { id: 2, orderNumber: 'OS-002', date: '2024-01-20', clientId: 2, clientName: 'María García López', clientPhone: '+57 301 234 5678', clientDocument: '87654321', motorcycleId: 2, motorcycleBrand: 'Yamaha', motorcycleModel: 'R6', motorcyclePlate: 'XYZ789', motorcycleYear: '2019', selectedServices: ['Reparación de Frenos'], observations: 'Frenos desgastados por uso intensivo en pista', progress: [{ id: 1, description: 'Recepción - Diagnóstico sistema de frenos', technician: 'Luis Torres' }, { id: 2, description: 'Desmontaje y evaluación de componentes', technician: 'Luis Torres' }, { id: 3, description: 'Instalación de nuevas pastillas y discos', technician: 'Luis Torres' }, { id: 4, description: 'Pruebas finales - Trabajo completado', technician: 'Luis Torres' }], associatedSaleId: 2, anulado: false }
];

const clients = [
  { id: 1, name: 'Juan Carlos Pérez', phone: '+57 300 123 4567', document: '12345678' },
  { id: 2, name: 'María García López', phone: '+57 301 234 5678', document: '87654321' },
  { id: 3, name: 'Carlos Eduardo López', phone: '+57 302 345 6789', document: '11223344' }
];

const motorcycles = [
  { id: 1, brand: 'Honda', model: 'CB600F', plate: 'ABC123', year: '2020', clientId: 1 },
  { id: 2, brand: 'Yamaha', model: 'R6', plate: 'XYZ789', year: '2019', clientId: 2 },
  { id: 3, brand: 'Suzuki', model: 'GSX-R750', plate: 'DEF456', year: '2021', clientId: 3 }
];

const mechanics = [
  { id: 1, name: 'Carlos Méndez' },
  { id: 2, name: 'Luis Torres' },
  { id: 3, name: 'Pedro Ramírez' },
  { id: 4, name: 'Jorge Martínez' }
];

const availableServices = [
  { id: 1, name: 'Mantenimiento Preventivo' },
  { id: 2, name: 'Reparación de Motor' },
  { id: 3, name: 'Reparación de Frenos' },
  { id: 4, name: 'Cambio de Transmisión' },
  { id: 5, name: 'Diagnóstico General' },
  { id: 6, name: 'Personalización' },
  { id: 7, name: 'Cambio de Aceite' },
  { id: 8, name: 'Afinación' }
];

export function PedidosServicios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServiceOrder, setEditingServiceOrder] = useState<any>(null);
  const [viewingServiceOrder, setViewingServiceOrder] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'cancel' as any, onConfirm: () => {} });
  const [pdfPreview, setPdfPreview] = useState({ open: false, data: null as any, type: 'service-order' as const });
  const [serviceOrders, setServiceOrders] = useState(initialOrders);

  const filteredServiceOrders = serviceOrders.filter(o => o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.motorcycleBrand.toLowerCase().includes(searchTerm.toLowerCase()) || o.motorcycleModel.toLowerCase().includes(searchTerm.toLowerCase()) || o.motorcyclePlate.toLowerCase().includes(searchTerm.toLowerCase()) || o.selectedServices.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
  const totalPages = Math.ceil(filteredServiceOrders.length / 2);
  const paginatedServiceOrders = filteredServiceOrders.slice((currentPage - 1) * 2, currentPage * 2);

  const handleSave = (data: any) => {
    const client = clients.find(c => c.id === parseInt(data.clientId));
    const motorcycle = motorcycles.find(m => m.id === parseInt(data.motorcycleId));
    const completeData = { ...data, clientName: client?.name || '', clientPhone: client?.phone || '', clientDocument: client?.document || '', motorcycleBrand: motorcycle?.brand || '', motorcycleModel: motorcycle?.model || '', motorcyclePlate: motorcycle?.plate || '', motorcycleYear: motorcycle?.year || '', progress: data.progress || [], associatedSaleId: null };
    
    editingServiceOrder ? setServiceOrders(serviceOrders.map(o => o.id === editingServiceOrder.id ? { ...completeData, id: editingServiceOrder.id, anulado: o.anulado } : o)) : setServiceOrders([...serviceOrders, { id: Date.now(), ...completeData, orderNumber: `OS-${(serviceOrders.length + 1).toString().padStart(3, '0')}`, anulado: false }]);
    toast.success(`Reparación ${editingServiceOrder ? 'actualizado' : 'creado'} exitosamente`);
    setIsDialogOpen(false);
    setEditingServiceOrder(null);
  };

  const stats = [
    { icon: Wrench, color: 'text-blue-600', value: serviceOrders.filter(o => !o.anulado).length, label: 'Total Activos' },
    { icon: CheckCircle, color: 'text-green-600', value: serviceOrders.filter(o => !o.anulado && o.associatedSaleId).length, label: 'Con Venta' },
    { icon: Clock, color: 'text-orange-600', value: serviceOrders.filter(o => !o.anulado && !o.associatedSaleId).length, label: 'Pendientes Venta' }
  ];

  const actions = (o: any) => [
    { icon: Eye, onClick: () => setViewingServiceOrder(o), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30' },
    { icon: FileText, onClick: () => setPdfPreview({ open: true, data: o, type: 'service-order' }), color: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30' },
    ...(o.anulado ? [] : [
      { icon: Edit2, onClick: () => { setEditingServiceOrder(o); setIsDialogOpen(true); }, color: 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30' },
      { icon: XCircle, onClick: () => { if (o.associatedSaleId) { toast.error('No se puede anular una reparación que ya tiene una venta asociada'); return; } setConfirmDialog({ open: true, title: 'Anular Reparación', description: '¿Está seguro de que desea anular esta reparación? Esta acción no se puede deshacer.', confirmText: 'Anular', variant: 'cancel', onConfirm: () => { setServiceOrders(serviceOrders.map(or => or.id === o.id ? { ...or, anulado: true } : or)); toast.success('Reparación anulada exitosamente'); } }); }, color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30' }
    ])
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar reparaciones..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingServiceOrder(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva reparación
            </Button>
          </DialogTrigger>
          <ServiceOrderDialog clients={clients} motorcycles={motorcycles} mechanics={mechanics} availableServices={availableServices} editingOrder={editingServiceOrder} onSave={handleSave} />
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
            Listado de Reparaciones ({filteredServiceOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reparación</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Motocicleta</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServiceOrders.map(o => (
                <TableRow key={o.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{o.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(o.date), 'PPP', { locale: es })}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {o.anulado && <Badge className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300">Anulado</Badge>}
                        {!o.anulado && o.associatedSaleId && <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300">Facturado</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{o.clientName}</p>
                      <p className="text-sm text-muted-foreground">{o.clientPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{o.motorcycleBrand} {o.motorcycleModel}</p>
                      <p className="text-sm text-muted-foreground">Placa: {o.motorcyclePlate}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {o.selectedServices.map((s: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {actions(o).map((a, i) => (
                        <Button key={i} size="sm" variant="ghost" onClick={a.onClick} className={a.color}>
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

      <Dialog open={!!viewingServiceOrder} onOpenChange={() => setViewingServiceOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Reparación</DialogTitle>
          </DialogHeader>
          {viewingServiceOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { title: 'Información de la Reparación', fields: [['Número de la Reparación', viewingServiceOrder.orderNumber], ['Fecha de Recepción', format(new Date(viewingServiceOrder.date), 'PPP', { locale: es })], ['Estado', viewingServiceOrder.anulado ? <Badge key="status" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300">Anulado</Badge> : viewingServiceOrder.associatedSaleId ? <Badge key="status" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300">Facturado</Badge> : <Badge key="status" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300">Pendiente</Badge>]] },
                  { title: 'Cliente y Motocicleta', fields: [['Cliente', <div key="client"><p className="font-medium text-foreground">{viewingServiceOrder.clientName}</p><p className="text-sm text-muted-foreground">{viewingServiceOrder.clientPhone}</p></div>], ['Motocicleta', <div key="moto"><p className="font-medium text-foreground">{viewingServiceOrder.motorcycleBrand} {viewingServiceOrder.motorcycleModel}</p><p className="text-sm text-muted-foreground">Placa: {viewingServiceOrder.motorcyclePlate}</p><p className="text-sm text-muted-foreground">Año: {viewingServiceOrder.motorcycleYear}</p></div>]] }
                ].map((section, i) => (
                  <div key={i}>
                    <h4 className="font-semibold mb-3">{section.title}</h4>
                    <div className="space-y-2">
                      {section.fields.map(([label, value], j) => (
                        <div key={j}>
                          <Label>{label}</Label>
                          {typeof value === 'string' ? <p className="font-medium text-foreground">{value}</p> : <div className="mt-1">{value}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <Label>Servicios Solicitados</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {viewingServiceOrder.selectedServices.map((s: string, i: number) => (
                    <Badge key={i} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>
              {viewingServiceOrder.observations && (
                <div>
                  <Label>Observaciones</Label>
                  <p className="mt-1 p-3 bg-muted/50 text-foreground rounded">{viewingServiceOrder.observations}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-3">Avances del Trabajo</h4>
                <div className="space-y-3">
                  {viewingServiceOrder.progress.map((p: any) => (
                    <div key={p.id} className="flex gap-4 p-3 border rounded-lg">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-2">{p.description}</p>
                        <p className="text-sm text-muted-foreground">Técnico: {p.technician}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))} title={confirmDialog.title} description={confirmDialog.description} confirmText={confirmDialog.confirmText} variant={confirmDialog.variant} onConfirm={confirmDialog.onConfirm} />
      <PDFPreviewDialog open={pdfPreview.open} onOpenChange={(open) => setPdfPreview(prev => ({ ...prev, open }))} data={pdfPreview.data} type={pdfPreview.type} onGenerate={() => toast.success('PDF generado exitosamente')} />
    </div>
  );
}

function ServiceOrderDialog({ clients, motorcycles, mechanics, editingOrder, onSave, availableServices }: any) {
  const [formData, setFormData] = useState({ clientId: editingOrder?.clientId || '', motorcycleId: editingOrder?.motorcycleId || '', selectedServices: editingOrder?.selectedServices || [], observations: editingOrder?.observations || '', date: editingOrder?.date || new Date().toISOString().split('T')[0], progress: editingOrder?.progress || [] });
  const [newProgress, setNewProgress] = useState({ description: '', technician: '' });

  React.useEffect(() => {
    if (editingOrder) setFormData({ clientId: editingOrder.clientId || '', motorcycleId: editingOrder.motorcycleId || '', selectedServices: editingOrder.selectedServices || [], observations: editingOrder.observations || '', date: editingOrder.date || new Date().toISOString().split('T')[0], progress: editingOrder.progress || [] });
  }, [editingOrder]);

  const handleServiceChange = (serviceName: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, selectedServices: checked ? [...prev.selectedServices, serviceName] : prev.selectedServices.filter((s: string) => s !== serviceName) }));
  };

  const addProgress = () => {
    if (!newProgress.description || !newProgress.technician) {
      toast.error('Por favor complete la descripción y el técnico');
      return;
    }
    setFormData(prev => ({ ...prev, progress: [...prev.progress, { id: Date.now(), ...newProgress }] }));
    setNewProgress({ description: '', technician: '' });
    toast.success('Avance agregado exitosamente');
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{editingOrder ? 'Editar Reparación' : 'Nueva Reparación'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); if (!formData.clientId || !formData.motorcycleId || formData.selectedServices.length === 0) { toast.error('Por favor complete todos los campos obligatorios y seleccione al menos un servicio'); return; } onSave(formData); }} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'clientId', label: 'Cliente *', options: clients },
            { id: 'motorcycleId', label: 'Motocicleta *', options: motorcycles.filter((m: any) => m.clientId === parseInt(formData.clientId)), displayFn: (m: any) => `${m.brand} ${m.model} - ${m.plate}` }
          ].map(field => (
            <div key={field.id}>
              <Label htmlFor={field.id}>{field.label}</Label>
              <select id={field.id} value={formData[field.id as keyof typeof formData]} onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground" required>
                <option value="">Seleccionar {field.label.replace(' *', '').toLowerCase()}</option>
                {field.options.map((opt: any) => <option key={opt.id} value={opt.id}>{field.displayFn ? field.displayFn(opt) : opt.name}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div>
          <Label htmlFor="date">Fecha de Recepción *</Label>
          <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} required />
        </div>
        <div>
          <Label>Servicios Solicitados *</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
            {availableServices.map((s: any) => (
              <div key={s.id} className="flex items-center space-x-2">
                <Checkbox id={`service-${s.id}`} checked={formData.selectedServices.includes(s.name)} onCheckedChange={(checked) => handleServiceChange(s.name, checked as boolean)} />
                <Label htmlFor={`service-${s.id}`} className="text-sm cursor-pointer">{s.name}</Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="observations">Observaciones</Label>
          <Textarea id="observations" value={formData.observations} onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))} placeholder="Observaciones del cliente sobre el servicio..." rows={3} />
        </div>
        <div>
          <Label>Avances del Trabajo</Label>
          <div className="space-y-3 mt-2">
            {formData.progress.map((p: any) => (
              <div key={p.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{p.description}</p>
                  <p className="text-sm text-muted-foreground">Técnico: {p.technician}</p>
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => setFormData(prev => ({ ...prev, progress: prev.progress.filter((pr: any) => pr.id !== p.id) }))} className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <Input value={newProgress.description} onChange={(e) => setNewProgress(prev => ({ ...prev, description: e.target.value }))} placeholder="Descripción del avance..." />
            </div>
            <div className="flex gap-2">
              <select value={newProgress.technician} onChange={(e) => setNewProgress(prev => ({ ...prev, technician: e.target.value }))} className="flex-1 px-3 py-2 border rounded-md">
                <option value="">Seleccionar técnico</option>
                {mechanics.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
              <Button type="button" size="sm" onClick={addProgress}>Agregar</Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {editingOrder ? 'Actualizar' : 'Crear'} Reparación
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
