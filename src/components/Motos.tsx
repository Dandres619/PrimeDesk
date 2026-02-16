import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, Bike, Calendar, Wrench, History } from 'lucide-react';
import { toast } from 'sonner';

const initialMotos = [
  { id: 1, brand: 'Honda', model: 'CB600F Hornet', year: 2023, plate: 'ABC123', color: 'Rojo', engine: '600cc', clientId: 1, clientName: 'Juan Carlos Pérez', status: 'Activo', lastService: '2024-01-15', nextService: '2024-04-15', mileage: 15000 },
  { id: 2, brand: 'Yamaha', model: 'R6', year: 2022, plate: 'XYZ789', color: 'Azul', engine: '600cc', clientId: 2, clientName: 'María García López', status: 'Inactivo', lastService: '2024-02-20', nextService: '2024-05-20', mileage: 8500 },
  { id: 3, brand: 'Suzuki', model: 'GSX-R750', year: 2021, plate: 'DEF456', color: 'Negro', engine: '750cc', clientId: 1, clientName: 'Juan Carlos Pérez', status: 'Activo', lastService: '2024-03-10', nextService: '2024-06-10', mileage: 22000 }
];

const serviceHistory = [
  { id: 1, motoId: 1, date: '2024-01-15', type: 'Mantenimiento Preventivo', description: 'Cambio de aceite y filtros, revisión general', cost: 150000, mechanic: 'Miguel Torres', status: 'Completado' },
  { id: 2, motoId: 2, date: '2024-02-20', type: 'Reparación Motor', description: 'Reparación de sistema de enfriamiento', cost: 350000, mechanic: 'Roberto Silva', status: 'En Progreso' },
  { id: 3, motoId: 3, date: '2024-03-10', type: 'Cambio de Llantas', description: 'Instalación de llantas nuevas delanteras y traseras', cost: 400000, mechanic: 'Carlos Mendez', status: 'Completado' }
];

const clients = [
  { id: 1, name: 'Juan Carlos Pérez' },
  { id: 2, name: 'María García López' },
  { id: 3, name: 'Carlos Eduardo López' }
];

const statusColors: any = {
  'Activo': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'En Servicio': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Inactivo': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

export function Motos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMoto, setEditingMoto] = useState<any>(null);
  const [viewingMoto, setViewingMoto] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => {} });
  const [motos, setMotos] = useState(initialMotos);

  const filteredMotos = motos.filter(m => m.brand.toLowerCase().includes(searchTerm.toLowerCase()) || m.model.toLowerCase().includes(searchTerm.toLowerCase()) || m.plate.toLowerCase().includes(searchTerm.toLowerCase()) || m.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredMotos.length / 2);
  const paginatedMotos = filteredMotos.slice((currentPage - 1) * 2, currentPage * 2);

  const handleSave = (data: any) => {
    const clientName = clients.find(c => c.id === parseInt(data.clientId))?.name || '';
    editingMoto ? setMotos(motos.map(m => m.id === editingMoto.id ? { ...m, ...data, clientName } : m)) : setMotos([...motos, { id: Date.now(), ...data, clientName, status: 'Activo', lastService: null, nextService: null, mileage: parseInt(data.mileage) || 0 }]);
    setIsDialogOpen(false);
    setEditingMoto(null);
  };

  const stats = [
    { icon: Bike, color: 'text-blue-600', value: motos.length, label: 'Total Motos' },
    { icon: Bike, color: 'text-green-600', value: motos.filter(m => m.status === 'Activo').length, label: 'Activas' },
    { icon: Wrench, color: 'text-orange-600', value: motos.filter(m => m.status === 'En Servicio').length, label: 'En Servicio' },
    { icon: Calendar, color: 'text-purple-600', value: serviceHistory.filter(s => s.status === 'Completado').length, label: 'Servicios Completados' }
  ];

  const actions = [
    { icon: Eye, onClick: (m: any) => setViewingMoto(m), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' },
    { icon: Edit, onClick: (m: any) => { setEditingMoto(m); setIsDialogOpen(true); }, color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' },
    { icon: Trash2, onClick: (m: any) => setConfirmDialog({ open: true, title: 'Eliminar Motocicleta', description: '¿Está seguro de que desea eliminar esta motocicleta? Esta acción no se puede deshacer.', confirmText: 'Eliminar', variant: 'delete', onConfirm: () => { setMotos(motos.filter(mo => mo.id !== m.id)); toast.success('Motocicleta eliminada exitosamente'); } }), color: 'text-red-600 hover:text-red-700 hover:bg-red-50' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar motocicletas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMoto(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Moto
            </Button>
          </DialogTrigger>
          <MotoDialog moto={editingMoto} clients={clients} onSave={handleSave} />
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
            <Bike className="w-5 h-5 text-blue-600" />
            Listado de Motocicletas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMotos.map(m => (
                <TableRow key={m.id}>
                  <TableCell>
                    <p className="font-medium">{m.plate}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{m.brand} {m.model}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{m.clientName}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={m.status === 'Activo'} onCheckedChange={() => setMotos(motos.map(mo => mo.id === m.id ? { ...mo, status: mo.status === 'Activo' ? 'Inactivo' : 'Activo' } : mo))} />
                      <span className="text-sm">{m.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {actions.map((a, i) => (
                        <Button key={i} size="sm" variant="ghost" onClick={() => a.onClick(m)} className={a.color}>
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

      <Dialog open={!!viewingMoto} onOpenChange={() => setViewingMoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Motocicleta</DialogTitle>
          </DialogHeader>
          {viewingMoto && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="history">Historial de Servicios</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Marca y Modelo', `${viewingMoto.brand} ${viewingMoto.model}`],
                    ['Año', viewingMoto.year],
                    ['Placa', viewingMoto.plate],
                    ['Color', viewingMoto.color],
                    ['Motor', viewingMoto.engine],
                    ['Kilometraje', `${viewingMoto.mileage.toLocaleString()} km`],
                    ['Propietario', viewingMoto.clientName],
                    ['Estado', <Badge key="status" className={statusColors[viewingMoto.status]}>{viewingMoto.status}</Badge>]
                  ].map(([label, value], i) => (
                    <div key={i}>
                      <Label>{label}</Label>
                      {typeof value === 'string' || typeof value === 'number' ? <p className="font-medium">{value}</p> : value}
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Historial de Servicios
                  </h4>
                  <div className="space-y-3">
                    {serviceHistory.filter(s => s.motoId === viewingMoto.id).map(s => (
                      <div key={s.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{s.type}</p>
                            <p className="text-sm text-muted-foreground">{s.date}</p>
                          </div>
                          <Badge className={s.status === 'Completado' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}>{s.status}</Badge>
                        </div>
                        <p className="text-sm mb-2">{s.description}</p>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Técnico: {s.mechanic}</span>
                          <span>Costo: ${s.cost.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))} title={confirmDialog.title} description={confirmDialog.description} confirmText={confirmDialog.confirmText} variant={confirmDialog.variant} onConfirm={confirmDialog.onConfirm} />
    </div>
  );
}

function MotoDialog({ moto, clients, onSave }: any) {
  const [formData, setFormData] = useState({ brand: moto?.brand || '', model: moto?.model || '', year: moto?.year || new Date().getFullYear(), plate: moto?.plate || '', color: moto?.color || '', engine: moto?.engine || '', clientId: moto?.clientId || '', mileage: moto?.mileage || 0 });

  const fields = [
    { id: 'brand', label: 'Marca', placeholder: 'Honda, Yamaha, etc.', required: true },
    { id: 'model', label: 'Modelo', placeholder: 'CB600F, R6, etc.', required: true },
    { id: 'year', label: 'Año', type: 'number', min: 1980, max: new Date().getFullYear() + 1, required: true },
    { id: 'plate', label: 'Placa', placeholder: 'ABC123', required: true },
    { id: 'color', label: 'Color', placeholder: 'Rojo, Azul, etc.', required: true },
    { id: 'engine', label: 'Motor', placeholder: '600cc, 750cc, etc.', required: true },
    { id: 'mileage', label: 'Kilometraje', type: 'number', placeholder: '15000', min: 0, full: true }
  ];

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{moto ? 'Editar Motocicleta' : 'Nueva Motocicleta'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {fields.filter(f => !f.full).map(f => (
            <div key={f.id}>
              <Label htmlFor={f.id}>{f.label}</Label>
              <Input id={f.id} type={f.type || 'text'} value={formData[f.id as keyof typeof formData]} onChange={(e) => setFormData(prev => ({ ...prev, [f.id]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))} placeholder={f.placeholder} min={f.min} max={f.max} required={f.required} />
            </div>
          ))}
        </div>
        <div>
          <Label htmlFor="clientId">Propietario</Label>
          <select id="clientId" value={formData.clientId} onChange={(e) => setFormData(prev => ({ ...prev, clientId: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
            <option value="">Seleccionar cliente</option>
            {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {fields.filter(f => f.full).map(f => (
          <div key={f.id}>
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input id={f.id} type={f.type || 'text'} value={formData[f.id as keyof typeof formData]} onChange={(e) => setFormData(prev => ({ ...prev, [f.id]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))} placeholder={f.placeholder} min={f.min} />
          </div>
        ))}
        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {moto ? 'Actualizar' : 'Registrar'} Motocicleta
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
