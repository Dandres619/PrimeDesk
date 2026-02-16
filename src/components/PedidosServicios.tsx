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
import { 
  Plus, 
  Search, 
  Eye, 
  Edit2,
  XCircle,
  FileText,
  Wrench,
  Clock,
  CheckCircle,
  Calendar,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export function PedidosServicios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServiceOrder, setEditingServiceOrder] = useState<any>(null);
  const [viewingServiceOrder, setViewingServiceOrder] = useState<any>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: 'delete' | 'cancel' | 'default';
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'default',
    onConfirm: () => {}
  });
  
  const [pdfPreview, setPdfPreview] = useState<{
    open: boolean;
    data: any;
    type: 'service-order';
  }>({
    open: false,
    data: null,
    type: 'service-order'
  });

  const [serviceOrders, setServiceOrders] = useState([
    { 
      id: 1,
      orderNumber: 'OS-001',
      date: '2024-01-15',
      clientId: 1,
      clientName: 'Juan Carlos Pérez',
      clientPhone: '+57 300 123 4567',
      clientDocument: '12345678',
      motorcycleId: 1,
      motorcycleBrand: 'Honda',
      motorcycleModel: 'CB600F',
      motorcyclePlate: 'ABC123',
      motorcycleYear: '2020',
      selectedServices: ['Mantenimiento Preventivo', 'Cambio de Aceite'],
      observations: 'Cliente reporta ruido en el motor al acelerar',
      progress: [
        {
          id: 1,
          description: 'Recepción de la motocicleta - Inspección inicial',
          technician: 'Carlos Méndez'
        },
        {
          id: 2,
          description: 'Cambio de aceite y filtro completado',
          technician: 'Carlos Méndez'
        }
      ],
      associatedSaleId: null, // Para vincular con ventas
      anulado: false
    },
    { 
      id: 2,
      orderNumber: 'OS-002',
      date: '2024-01-20',
      clientId: 2,
      clientName: 'María García López',
      clientPhone: '+57 301 234 5678',
      clientDocument: '87654321',
      motorcycleId: 2,
      motorcycleBrand: 'Yamaha',
      motorcycleModel: 'R6',
      motorcyclePlate: 'XYZ789',
      motorcycleYear: '2019',
      selectedServices: ['Reparación de Frenos'],
      observations: 'Frenos desgastados por uso intensivo en pista',
      progress: [
        {
          id: 1,
          description: 'Recepción - Diagnóstico sistema de frenos',
          technician: 'Luis Torres'
        },
        {
          id: 2,
          description: 'Desmontaje y evaluación de componentes',
          technician: 'Luis Torres'
        },
        {
          id: 3,
          description: 'Instalación de nuevas pastillas y discos',
          technician: 'Luis Torres'
        },
        {
          id: 4,
          description: 'Pruebas finales - Trabajo completado',
          technician: 'Luis Torres'
        }
      ],
      associatedSaleId: 2,
      anulado: false
    }
  ]);

  const clients = [
    { id: 1, name: 'Juan Carlos Pérez', phone: '+57 300 123 4567', document: '12345678', email: 'juan.perez@email.com', address: 'Calle 123 #45-67, Chapinero' },
    { id: 2, name: 'María García López', phone: '+57 301 234 5678', document: '87654321', email: 'maria.garcia@email.com', address: 'Carrera 67 #89-12, El Poblado' },
    { id: 3, name: 'Carlos Eduardo López', phone: '+57 302 345 6789', document: '11223344', email: 'carlos.lopez@email.com', address: 'Avenida 45 #12-34, Granada' }
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

  // Servicios disponibles (estos deberían venir del módulo de Servicios en una implementación real)
  const availableServices = [
    { id: 1, name: 'Mantenimiento Preventivo', status: 'Activo' },
    { id: 2, name: 'Reparación de Motor', status: 'Activo' },
    { id: 3, name: 'Reparación de Frenos', status: 'Activo' },
    { id: 4, name: 'Cambio de Transmisión', status: 'Activo' },
    { id: 5, name: 'Diagnóstico General', status: 'Activo' },
    { id: 6, name: 'Personalización', status: 'Activo' },
    { id: 7, name: 'Cambio de Aceite', status: 'Activo' },
    { id: 8, name: 'Afinación', status: 'Activo' }
  ];

  const filteredServiceOrders = serviceOrders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.motorcycleBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.motorcycleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.motorcyclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.selectedServices.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginación
  const totalPages = Math.ceil(filteredServiceOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServiceOrders = filteredServiceOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveServiceOrder = (orderData: any) => {
    const client = clients.find(c => c.id === parseInt(orderData.clientId));
    const motorcycle = motorcycles.find(m => m.id === parseInt(orderData.motorcycleId));
    
    const completeData = {
      ...orderData,
      clientName: client?.name || '',
      clientPhone: client?.phone || '',
      clientDocument: client?.document || '',
      motorcycleBrand: motorcycle?.brand || '',
      motorcycleModel: motorcycle?.model || '',
      motorcyclePlate: motorcycle?.plate || '',
      motorcycleYear: motorcycle?.year || '',
      progress: orderData.progress || [],
      associatedSaleId: null
    };

    if (editingServiceOrder) {
      setServiceOrders(serviceOrders.map(order => 
        order.id === editingServiceOrder.id 
          ? { ...completeData, id: editingServiceOrder.id, anulado: order.anulado }
          : order
      ));
      toast.success('Pedido de servicio actualizado exitosamente');
    } else {
      const newOrder = { 
        id: Date.now(), 
        ...completeData,
        orderNumber: `OS-${(serviceOrders.length + 1).toString().padStart(3, '0')}`,
        anulado: false
      };
      setServiceOrders([...serviceOrders, newOrder]);
      toast.success('Pedido de servicio creado exitosamente');
    }
    
    setIsDialogOpen(false);
    setEditingServiceOrder(null);
  };

  const showCancelConfirm = (orderId: number) => {
    const order = serviceOrders.find(o => o.id === orderId);
    
    if (order?.associatedSaleId) {
      toast.error('No se puede anular un pedido que ya tiene una venta asociada');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Anular Pedido de Servicio',
      description: '¿Está seguro de que desea anular este pedido de servicio? Esta acción no se puede deshacer.',
      confirmText: 'Anular',
      variant: 'cancel',
      onConfirm: () => cancelServiceOrder(orderId)
    });
  };

  const cancelServiceOrder = (orderId: number) => {
    setServiceOrders(serviceOrders.map(order => 
      order.id === orderId 
        ? { ...order, anulado: true }
        : order
    ));
    toast.success('Pedido de servicio anulado exitosamente');
  };

  const handleGeneratePDF = () => {
    toast.success('PDF generado exitosamente');
  };

  const handleEdit = (order: any) => {
    setEditingServiceOrder(order);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pedidos de servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingServiceOrder(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Pedido de Servicio
            </Button>
          </DialogTrigger>
          <ServiceOrderDialog 
            clients={clients}
            motorcycles={motorcycles}
            mechanics={mechanics}
            availableServices={availableServices}
            editingOrder={editingServiceOrder}
            onSave={handleSaveServiceOrder}
          />
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Wrench className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{serviceOrders.filter(o => !o.anulado).length}</p>
              <p className="text-muted-foreground">Total Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{serviceOrders.filter(o => !o.anulado && o.associatedSaleId).length}</p>
              <p className="text-muted-foreground">Con Venta</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="w-8 h-8 text-orange-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{serviceOrders.filter(o => !o.anulado && !o.associatedSaleId).length}</p>
              <p className="text-muted-foreground">Pendientes Venta</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            Listado de Pedidos de Servicio ({filteredServiceOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Motocicleta</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServiceOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.date), 'PPP', { locale: es })}
                      </p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {order.anulado && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300">
                            Anulado
                          </Badge>
                        )}
                        {!order.anulado && order.associatedSaleId && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300">
                            Facturado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{order.clientName}</p>
                      <p className="text-sm text-muted-foreground">{order.clientPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{order.motorcycleBrand} {order.motorcycleModel}</p>
                      <p className="text-sm text-muted-foreground">
                        Placa: {order.motorcyclePlate}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {order.selectedServices.map((service: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setViewingServiceOrder(order)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setPdfPreview({ open: true, data: order, type: 'service-order' })}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {!order.anulado && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEdit(order)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => showCancelConfirm(order.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Paginación */}
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                )}
                
                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => totalPages > 1 ? setCurrentPage(page) : undefined}
                      isActive={currentPage === page}
                      className={totalPages > 1 ? "cursor-pointer" : "cursor-default"}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Service Order Details Dialog */}
      <Dialog open={!!viewingServiceOrder} onOpenChange={() => setViewingServiceOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido de Servicio</DialogTitle>
          </DialogHeader>
          {viewingServiceOrder && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Información del Pedido</h4>
                  <div className="space-y-2">
                    <div>
                      <Label>Número de Pedido</Label>
                      <p className="font-medium text-foreground">{viewingServiceOrder.orderNumber}</p>
                    </div>
                    <div>
                      <Label>Fecha de Recepción</Label>
                      <p className="text-foreground">{format(new Date(viewingServiceOrder.date), 'PPP', { locale: es })}</p>
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <div className="flex gap-2 flex-wrap mt-1">
                        {viewingServiceOrder.anulado ? (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300">
                            Anulado
                          </Badge>
                        ) : viewingServiceOrder.associatedSaleId ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300">
                            Facturado
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300">
                            Pendiente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Cliente y Motocicleta</h4>
                  <div className="space-y-2">
                    <div>
                      <Label>Cliente</Label>
                      <p className="font-medium text-foreground">{viewingServiceOrder.clientName}</p>
                      <p className="text-sm text-muted-foreground">{viewingServiceOrder.clientPhone}</p>
                    </div>
                    <div>
                      <Label>Motocicleta</Label>
                      <p className="font-medium text-foreground">{viewingServiceOrder.motorcycleBrand} {viewingServiceOrder.motorcycleModel}</p>
                      <p className="text-sm text-muted-foreground">Placa: {viewingServiceOrder.motorcyclePlate}</p>
                      <p className="text-sm text-muted-foreground">Año: {viewingServiceOrder.motorcycleYear}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <Label>Servicios Solicitados</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {viewingServiceOrder.selectedServices.map((service: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Observations */}
              {viewingServiceOrder.observations && (
                <div>
                  <Label>Observaciones</Label>
                  <p className="mt-1 p-3 bg-muted/50 text-foreground rounded">{viewingServiceOrder.observations}</p>
                </div>
              )}

              {/* Progress */}
              <div>
                <h4 className="font-semibold mb-3">Avances del Trabajo</h4>
                <div className="space-y-3">
                  {viewingServiceOrder.progress.map((progress: any) => (
                    <div key={progress.id} className="flex gap-4 p-3 border rounded-lg">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-2">{progress.description}</p>
                        <p className="text-sm text-muted-foreground">Técnico: {progress.technician}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={pdfPreview.open}
        onOpenChange={(open) => setPdfPreview(prev => ({ ...prev, open }))}
        data={pdfPreview.data}
        type={pdfPreview.type}
        onGenerate={handleGeneratePDF}
      />
    </div>
  );
}

function ServiceOrderDialog({ clients, motorcycles, mechanics, editingOrder, onSave, availableServices }: any) {
  const [formData, setFormData] = useState({
    clientId: editingOrder?.clientId || '',
    motorcycleId: editingOrder?.motorcycleId || '',
    selectedServices: editingOrder?.selectedServices || [],
    observations: editingOrder?.observations || '',
    date: editingOrder?.date || new Date().toISOString().split('T')[0],
    progress: editingOrder?.progress || []
  });

  const [newProgress, setNewProgress] = useState({
    description: '',
    technician: ''
  });

  React.useEffect(() => {
    if (editingOrder) {
      setFormData({
        clientId: editingOrder.clientId || '',
        motorcycleId: editingOrder.motorcycleId || '',
        selectedServices: editingOrder.selectedServices || [],
        observations: editingOrder.observations || '',
        date: editingOrder.date || new Date().toISOString().split('T')[0],
        progress: editingOrder.progress || []
      });
    }
  }, [editingOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.motorcycleId || formData.selectedServices.length === 0) {
      toast.error('Por favor complete todos los campos obligatorios y seleccione al menos un servicio');
      return;
    }

    onSave(formData);
  };

  const handleServiceChange = (serviceName: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        selectedServices: [...prev.selectedServices, serviceName]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedServices: prev.selectedServices.filter((s: string) => s !== serviceName)
      }));
    }
  };

  const addProgress = () => {
    if (!newProgress.description || !newProgress.technician) {
      toast.error('Por favor complete la descripción y el técnico');
      return;
    }

    const progressEntry = {
      id: Date.now(),
      description: newProgress.description,
      technician: newProgress.technician
    };

    setFormData(prev => ({
      ...prev,
      progress: [...prev.progress, progressEntry]
    }));

    setNewProgress({ description: '', technician: '' });
    toast.success('Avance agregado exitosamente');
  };

  const removeProgress = (progressId: number) => {
    setFormData(prev => ({
      ...prev,
      progress: prev.progress.filter((p: any) => p.id !== progressId)
    }));
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {editingOrder ? 'Editar Pedido de Servicio' : 'Nuevo Pedido de Servicio'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientId">Cliente *</Label>
            <select
              id="clientId"
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((client: any) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="motorcycleId">Motocicleta *</Label>
            <select
              id="motorcycleId"
              value={formData.motorcycleId}
              onChange={(e) => setFormData(prev => ({ ...prev, motorcycleId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar motocicleta</option>
              {motorcycles
                .filter((m: any) => !formData.clientId || m.clientId === parseInt(formData.clientId))
                .map((moto: any) => (
                  <option key={moto.id} value={moto.id}>
                    {moto.brand} {moto.model} - {moto.plate}
                  </option>
                ))
              }
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Fecha de Recepción *
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="mt-1 [&::-webkit-calendar-picker-indicator]:dark:invert"
            required
          />
        </div>

        <div>
          <Label>Servicios a Realizar *</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border rounded p-3 bg-muted/10">
            {availableServices
              .filter((service: any) => service.status === 'Activo')
              .map((service: any) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={formData.selectedServices.includes(service.name)}
                    onCheckedChange={(checked) => handleServiceChange(service.name, checked as boolean)}
                  />
                  <Label htmlFor={`service-${service.id}`} className="text-sm cursor-pointer">
                    {service.name}
                  </Label>
                </div>
              ))}
          </div>
          {formData.selectedServices.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {formData.selectedServices.map((serviceName: string) => (
                <Badge key={serviceName} variant="secondary" className="text-xs">
                  {serviceName}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="observations">Observaciones</Label>
          <Textarea
            id="observations"
            value={formData.observations}
            onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
            placeholder="Observaciones adicionales del cliente o del técnico..."
            className="min-h-[80px]"
          />
        </div>

        {/* Progress Section */}
        <div>
          <h4 className="font-medium mb-3">Avances del Trabajo</h4>
          
          {/* Existing Progress */}
          {formData.progress.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.progress.map((progress: any) => (
                <div key={progress.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{progress.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Técnico: {progress.technician}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeProgress(progress.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Progress */}
          <div className="border rounded p-4 bg-muted/10">
            <h5 className="font-medium mb-3">Agregar Nuevo Avance</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <Label>Descripción del Avance</Label>
                <Input
                  value={newProgress.description}
                  onChange={(e) => setNewProgress(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ej: Desmontaje de motor completado"
                />
              </div>
              <div>
                <Label>Técnico Responsable</Label>
                <select
                  value={newProgress.technician}
                  onChange={(e) => setNewProgress(prev => ({ ...prev, technician: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar técnico</option>
                  {mechanics.map((mechanic: any) => (
                    <option key={mechanic.id} value={mechanic.name}>
                      {mechanic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button
              type="button"
              onClick={addProgress}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Avance
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {editingOrder ? 'Actualizar' : 'Crear'} Pedido
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}