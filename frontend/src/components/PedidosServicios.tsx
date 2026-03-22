import React, { useState, useEffect } from 'react';
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
import { Plus, Search, Eye, Edit2, XCircle, FileText, Wrench, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

// @ts-ignore
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';

export function PedidosServicios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServiceOrder, setEditingServiceOrder] = useState<any>(null);
  const [viewingServiceOrder, setViewingServiceOrder] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'cancel' as any, onConfirm: () => { } });
  const [pdfPreview, setPdfPreview] = useState({ open: false, data: null as any, type: 'service-order' as const });

  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [motorcycles, setMotorcycles] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [resRep, resCli, resMot, resEmp, resSer] = await Promise.all([
        fetch(`${API_URL}/reparaciones`, { headers }),
        fetch(`${API_URL}/clientes`, { headers }),
        fetch(`${API_URL}/motocicletas`, { headers }),
        fetch(`${API_URL}/empleados`, { headers }),
        fetch(`${API_URL}/servicios`, { headers })
      ]);

      if (!resRep.ok) throw new Error('Error al cargar datos de reparaciones');

      const dataRep = await resRep.json();
      const dataCli = await resCli.json();
      const dataMot = await resMot.json();
      const dataEmp = await resEmp.json();
      const dataSer = await resSer.json();

      setClients(dataCli);
      setMotorcycles(dataMot);
      // Mecánicos = rol 2 (Empleado) o EstadoUsuario Activo
      setMechanics(dataEmp.filter((e: any) => (e.EstadoUsuario === true || e.EstadoUsuario === 'Activo') && (Number(e.ID_Rol) === 2 || Number(e.id_rol) === 2)));
      setAvailableServices(dataSer.filter((s: any) => s.Estado === true || s.Estado === 'Activo'));

      setServiceOrders(dataRep.map((r: any) => ({
        id: r.ID_Reparacion,
        orderNumber: `R-${r.ID_Reparacion.toString().padStart(3, '0')}`,
        date: r.Fecha,
        motorcycleId: r.ID_Motocicleta,
        motorcycleBrand: r.Marca,
        motorcycleModel: r.Modelo,
        motorcyclePlate: r.Placa,
        motorcycleYear: r.Anio,
        clientId: dataMot.find((m: any) => m.ID_Motocicleta === r.ID_Motocicleta)?.ID_Cliente,
        clientName: '', // Se llenará con la info del cliente
        clientPhone: '',
        clientDocument: '',
        observations: r.Observaciones,
        associatedSaleId: null, // Si tiene venta asociada en el futuro
        anulada: r.Estado === 'Anulada',
        estadoBase: r.Estado,
        // Los servicios y avances no vienen en getAll por defecto en esta versión simplificada
        // Pero el backend de getById sí los trae. Solo marcaremos selectedServices vacío aquí y lo rellenamos al abrir.
        selectedServices: [] as string[],
        progress: [] as any[]
      })));

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDetails = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/reparaciones/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar detalles');
      return await res.json();
    } catch (err: any) {
      toast.error(err.message);
      return null;
    }
  };

  const handleOpenEdit = async (order: any) => {
    const details = await loadDetails(order.id);
    if (!details) return;

    setEditingServiceOrder({
      ...order,
      selectedServices: details.servicios.map((s: any) => s.ID_Servicio),
      progress: details.avances.map((a: any) => ({
        id: a.ID_ReparacionAvance,
        description: a.Descripcion,
        technician: `${a.NombreEmpleado} ${a.ApellidoEmpleado}`,
        technicianId: a.ID_Empleado
      }))
    });
    setIsDialogOpen(true);
  };

  const handleOpenView = async (order: any) => {
    const details = await loadDetails(order.id);
    if (!details) return;

    const clientInfo = clients.find(c => c.ID_Cliente === order.clientId) || {};

    setViewingServiceOrder({
      ...order,
      clientName: clientInfo.Nombre + ' ' + (clientInfo.Apellido || ''),
      clientPhone: clientInfo.Telefono,
      clientDocument: clientInfo.Documento,
      selectedServices: details.servicios.map((s: any) => s.Nombre),
      progress: details.avances.map((a: any) => ({
        id: a.ID_ReparacionAvance,
        description: a.Descripcion,
        technician: `${a.NombreEmpleado} ${a.ApellidoEmpleado}`,
        date: a.Fecha
      }))
    });
  };

  const handleSave = async (data: any) => {
    const isEditing = !!editingServiceOrder;
    try {
      if (!isEditing) {
        // Create
        const res = await fetch(`${API_URL}/reparaciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            id_motocicleta: parseInt(data.motorcycleId),
            id_agendamiento: null,
            observaciones: data.observations,
            estado: 'Pendiente de Venta',
            servicios: data.selectedServices
          })
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.message || 'Error al crear reparación');
        const newRep = resData;

        // Si hay avances para agregar (suele ser despues de creado, pero si la UI permite agregarlos en creación, aquí lo simulamos)
        if (data.progress && data.progress.length > 0) {
          for (const p of data.progress) {
            await fetch(`${API_URL}/reparaciones/${newRep.ID_Reparacion}/avances`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ id_empleado: p.technicianId, descripcion: p.description })
            });
          }
        }
      } else {
        // Editar (Actualizar observaciones)
        if (data.observations !== editingServiceOrder.observations) {
          await fetch(`${API_URL}/reparaciones/${editingServiceOrder.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              observaciones: data.observations,
              tipo_servicio: 'Directo',
              estado: 'En proceso'
            })
          });
        }

        // Manejar nuevos servicios (simplified)
        // (La UI actual no desmarca servicios, solo agrega en este flujo simple)
        const oldServices = editingServiceOrder.selectedServices;
        for (const s of data.selectedServices) {
          if (!oldServices.includes(s)) {
            await fetch(`${API_URL}/reparaciones/${editingServiceOrder.id}/servicios`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ id_servicio: s })
            });
          }
        }

        // Manejar nuevos avances
        const oldAvancesIds = editingServiceOrder.progress.map((p: any) => p.id);
        for (const p of data.progress) {
          // If it doesnt have a real backend id (generated by Date.now() earlier) it's new
          if (!oldAvancesIds.includes(p.id) && typeof p.id === 'string' && p.id.startsWith('new_')) {
            await fetch(`${API_URL}/reparaciones/${editingServiceOrder.id}/avances`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ id_empleado: p.technicianId, descripcion: p.description })
            });
          }
        }
      }

      toast.success(`Reparación ${isEditing ? 'actualizada' : 'creada'} exitosamente`);
      setIsDialogOpen(false);
      setEditingServiceOrder(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const anularOrder = async (orderId: number) => {
    try {
      const res = await fetch(`${API_URL}/reparaciones/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: 'Anulada', tipo_servicio: 'Directo' })
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al anular reparación');
      }
      toast.success('Reparación anulada exitosamente');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Enhance serviceOrders with client info for filtering
  const richServiceOrders = serviceOrders.map(o => {
    const cli = clients.find(c => c.ID_Cliente === o.clientId);
    return {
      ...o,
      clientName: cli ? `${cli.Nombre} ${cli.Apellido || ''}` : 'Desconocido',
      clientPhone: cli ? cli.Telefono : '',
      clientDocument: cli ? cli.Documento : ''
    };
  });

  const filteredServiceOrders = richServiceOrders.filter(o =>
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.motorcycleBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.motorcyclePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredServiceOrders.length / 5);
  const paginatedServiceOrders = filteredServiceOrders.slice((currentPage - 1) * 5, currentPage * 5);

  const stats = [
    { icon: Wrench, color: 'text-blue-600', value: richServiceOrders.filter(o => !o.anulada).length, label: 'Total Activos' },
    { icon: CheckCircle, color: 'text-green-600', value: richServiceOrders.filter(o => !o.anulada && o.associatedSaleId).length, label: 'Con Venta' },
    { icon: Clock, color: 'text-orange-600', value: richServiceOrders.filter(o => !o.anulada && !o.associatedSaleId).length, label: 'Pendientes de Venta' }
  ];

  const actions = (o: any) => [
    { icon: Eye, onClick: () => handleOpenView(o), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    {
      icon: FileText, onClick: async () => {
        // Prepare detailed data for PDF
        const details = await loadDetails(o.id);
        if (!details) return;
        const pdfData = {
          ...o,
          date: details.Fecha,
          motorcycleBrand: details.Marca,
          motorcycleYear: details.Anio,
          description: 'Reparación de motocicleta',
          observations: details.Observaciones,
          progress: details.avances.map((a: any) => ({ description: a.Descripcion, technician: `${a.NombreEmpleado} ${a.ApellidoEmpleado}` }))
        };
        setPdfPreview({ open: true, data: pdfData, type: 'service-order' })
      }, color: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20'
    },
    ...(o.anulada ? [] : [
      { icon: Edit2, onClick: () => handleOpenEdit(o), color: 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20' },
      { icon: XCircle, onClick: () => { if (o.associatedSaleId) { toast.error('No se puede anular una reparación con venta asociada'); return; } setConfirmDialog({ open: true, title: 'Anular Reparación', description: '¿Está seguro de que desea anular esta reparación?', confirmText: 'Anular', variant: 'cancel', onConfirm: () => anularOrder(o.id) }); }, color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20' }
    ])
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

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
            Lista de Reparaciones ({filteredServiceOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reparación</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Motocicleta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServiceOrders.map(o => (
                <TableRow key={o.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{o.orderNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{o.clientName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{o.motorcycleBrand} {o.motorcycleModel}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{format(new Date(o.date), 'PPP', { locale: es })}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p><Badge variant="destructive" className="bg-red-100 text-red-800 border-none">{o.estadoBase}</Badge></p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {actions(o).map((a, i) => (
                        <Button key={i} size="sm" variant="ghost" onClick={a.onClick} className={a.color} title={a.icon.name}>
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
                  { title: 'Información de la Reparación', fields: [['Número de la Reparación', viewingServiceOrder.orderNumber], ['Fecha de Recepción', format(new Date(viewingServiceOrder.date), 'PPP', { locale: es })], ['Estado', viewingServiceOrder.anulada ? <Badge key="status" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Anulada</Badge> : viewingServiceOrder.associatedSaleId ? <Badge key="status" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Facturado</Badge> : <Badge key="status" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Pendiente de Venta</Badge>]] },
                  { title: 'Cliente y Motocicleta', fields: [['Cliente', <div key="client"><p className="font-medium text-foreground">{viewingServiceOrder.clientName}</p><p className="text-sm text-muted-foreground">{viewingServiceOrder.clientPhone}</p></div>], ['Motocicleta', <div key="moto"><p className="font-medium text-foreground">{viewingServiceOrder.motorcycleBrand} {viewingServiceOrder.motorcycleModel}</p><p className="text-sm text-muted-foreground">Placa: {viewingServiceOrder.motorcyclePlate}</p></div>]] }
                ].map((section, i) => (
                  <div key={i}>
                    <h4 className="font-semibold mb-3">{section.title}</h4>
                    <div className="space-y-2">
                      {section.fields.map(([label, value], j) => (
                        <div key={j}>
                          <Label>{label as string}</Label>
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
                        <p className="text-sm text-muted-foreground">Mecánico: {p.technician}</p>
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
      <PDFPreviewDialog open={pdfPreview.open} onOpenChange={(open) => setPdfPreview(prev => ({ ...prev, open }))} data={pdfPreview.data} type={pdfPreview.type} onGenerate={() => { }} />
    </div>
  );
}

function ServiceOrderDialog({ clients, motorcycles, mechanics, editingOrder, onSave, availableServices }: any) {
  const [formData, setFormData] = useState({
    clientId: '',
    motorcycleId: '',
    selectedServices: [] as number[],
    observations: '',
    progress: [] as any[]
  });
  const [newProgress, setNewProgress] = useState({ description: '', technicianId: '' });

  React.useEffect(() => {
    if (editingOrder) {
      setFormData({
        clientId: editingOrder.clientId?.toString() || '',
        motorcycleId: editingOrder.motorcycleId?.toString() || '',
        selectedServices: editingOrder.selectedServices || [],
        observations: editingOrder.observations || '',
        progress: editingOrder.progress || []
      });
    } else {
      setFormData({ clientId: '', motorcycleId: '', selectedServices: [], observations: '', progress: [] });
    }
  }, [editingOrder]);

  const handleServiceChange = (serviceId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: checked
        ? [...prev.selectedServices, serviceId]
        : prev.selectedServices.filter(s => s !== serviceId)
    }));
  };

  const addProgress = () => {
    if (!newProgress.description || !newProgress.technicianId) {
      toast.error('Por favor complete la descripción y el mecánico');
      return;
    }
    const mech = mechanics.find((m: any) => m.ID_Empleado.toString() === newProgress.technicianId)
    setFormData(prev => ({
      ...prev,
      progress: [...prev.progress, { id: `new_${Date.now()}`, description: newProgress.description, technicianId: parseInt(newProgress.technicianId), technician: `${mech.Nombre} ${mech.Apellido}` }]
    }));
    setNewProgress({ description: '', technicianId: '' });
    toast.success('Avance agregado exitosamente');
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{editingOrder ? 'Editar Reparación' : 'Nueva Reparación'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (!formData.motorcycleId || formData.selectedServices.length === 0) {
          toast.error('Por favor complete todos los campos obligatorios y seleccione al menos un servicio');
          return;
        }
        onSave(formData);
      }} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientId">Cliente *</Label>
            <select id="clientId" value={formData.clientId} onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value, motorcycleId: '' }))} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" disabled={!!editingOrder}>
              <option value="" className="bg-background text-foreground">Seleccionar cliente</option>
              {clients.map((opt: any) => <option key={opt.ID_Cliente} value={opt.ID_Cliente} className="bg-background text-foreground">{`${opt.Nombre} ${opt.Apellido || ''}`}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="motoId">Motocicleta *</Label>
            <select id="motoId" value={formData.motorcycleId} onChange={(e) => setFormData(prev => ({ ...prev, motorcycleId: e.target.value }))} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" disabled={!!editingOrder || !formData.clientId}>
              <option value="" className="bg-background text-foreground">Seleccionar motocicleta</option>
              {motorcycles.filter((m: any) => m.ID_Cliente === parseInt(formData.clientId)).map((opt: any) => <option key={opt.ID_Motocicleta} value={opt.ID_Motocicleta} className="bg-background text-foreground">{`${opt.Marca} ${opt.Modelo} - ${opt.Placa}`}</option>)}
            </select>
          </div>
        </div>

        <div>
          <Label>Servicios Solicitados *</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto outline outline-1 outline-gray-200 dark:outline-gray-800 p-3 rounded-lg">
            {availableServices.map((s: any) => (
              <div key={s.ID_Servicio} className="flex items-center space-x-2">
                <Checkbox id={`service-${s.ID_Servicio}`} checked={formData.selectedServices.includes(s.ID_Servicio)} onCheckedChange={(checked) => handleServiceChange(s.ID_Servicio, checked as boolean)} disabled={!!editingOrder && editingOrder.selectedServices?.includes(s.ID_Servicio)} />
                <Label htmlFor={`service-${s.ID_Servicio}`} className="text-sm cursor-pointer">{s.Nombre}</Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="observations">Observaciones</Label>
          <Textarea id="observations" value={formData.observations} onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))} placeholder="Observaciones del cliente sobre el servicio..." rows={3} />
        </div>

        {/* Avances section */}
        <div>
          <Label>Avances del Trabajo</Label>
          <div className="space-y-3 mt-2">
            {formData.progress.map((p: any) => (
              <div key={p.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{p.description}</p>
                  <p className="text-sm text-muted-foreground">Mecánico: {p.technician}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 items-end bg-gray-50 dark:bg-gray-900/40 p-3 rounded-lg border">
            <div className="flex-1 w-full">
              <Label className="text-xs mb-1">Descripción del Avance</Label>
              <Input value={newProgress.description} onChange={(e) => setNewProgress(prev => ({ ...prev, description: e.target.value }))} placeholder="Descripción del avance..." />
            </div>
            <div className="flex-1 w-full flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs mb-1">Mecánico</Label>
                <select value={newProgress.technicianId} onChange={(e) => setNewProgress(prev => ({ ...prev, technicianId: e.target.value }))} className="w-full px-3 h-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="" className="bg-background text-foreground">Seleccionar mecánico</option>
                  {mechanics.map((m: any) => <option key={m.ID_Empleado} value={m.ID_Empleado} className="bg-background text-foreground">{`${m.Nombre} ${m.Apellido}`}</option>)}
                </select>
              </div>
              <Button type="button" size="default" onClick={addProgress} className="h-10">Agregar</Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {editingOrder ? 'Actualizar' : 'Crear'} Reparación
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
