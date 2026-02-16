import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Bike,
  Calendar,
  Wrench,
  History
} from 'lucide-react';
import { toast } from 'sonner';

export function Motos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMoto, setEditingMoto] = useState<any>(null);
  const [viewingMoto, setViewingMoto] = useState<any>(null);
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

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const [motos, setMotos] = useState([
    { 
      id: 1, 
      brand: 'Honda', 
      model: 'CB600F Hornet',
      year: 2023,
      plate: 'ABC123',
      color: 'Rojo',
      engine: '600cc',
      clientId: 1,
      clientName: 'Juan Carlos Pérez',
      status: 'Activo',
      lastService: '2024-01-15',
      nextService: '2024-04-15',
      mileage: 15000
    },
    { 
      id: 2, 
      brand: 'Yamaha', 
      model: 'R6',
      year: 2022,
      plate: 'XYZ789',
      color: 'Azul',
      engine: '600cc',
      clientId: 2,
      clientName: 'María García López',
      status: 'Inactivo',
      lastService: '2024-02-20',
      nextService: '2024-05-20',
      mileage: 8500
    },
    { 
      id: 3, 
      brand: 'Suzuki', 
      model: 'GSX-R750',
      year: 2021,
      plate: 'DEF456',
      color: 'Negro',
      engine: '750cc',
      clientId: 1,
      clientName: 'Juan Carlos Pérez',
      status: 'Activo',
      lastService: '2024-03-10',
      nextService: '2024-06-10',
      mileage: 22000
    }
  ]);

  const [serviceHistory, setServiceHistory] = useState([
    {
      id: 1,
      motoId: 1,
      date: '2024-01-15',
      type: 'Mantenimiento Preventivo',
      description: 'Cambio de aceite y filtros, revisión general',
      cost: 150000,
      mechanic: 'Miguel Torres',
      status: 'Completado'
    },
    {
      id: 2,
      motoId: 2,
      date: '2024-02-20',
      type: 'Reparación Motor',
      description: 'Reparación de sistema de enfriamiento',
      cost: 350000,
      mechanic: 'Roberto Silva',
      status: 'En Progreso'
    },
    {
      id: 3,
      motoId: 3,
      date: '2024-03-10',
      type: 'Cambio de Llantas',
      description: 'Instalación de llantas nuevas delanteras y traseras',
      cost: 400000,
      mechanic: 'Carlos Mendez',
      status: 'Completado'
    }
  ]);

  const clients = [
    { id: 1, name: 'Juan Carlos Pérez' },
    { id: 2, name: 'María García López' },
    { id: 3, name: 'Carlos Eduardo López' }
  ];

  const filteredMotos = motos.filter(moto => 
    moto.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moto.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moto.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moto.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredMotos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMotos = filteredMotos.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveMoto = (motoData: any) => {
    const clientName = clients.find(c => c.id === parseInt(motoData.clientId))?.name || '';
    
    if (editingMoto) {
      setMotos(motos.map(moto => 
        moto.id === editingMoto.id 
          ? { ...moto, ...motoData, clientName } 
          : moto
      ));
    } else {
      const newMoto = { 
        id: Date.now(), 
        ...motoData,
        clientName,
        status: 'Activo',
        lastService: null,
        nextService: null,
        mileage: parseInt(motoData.mileage) || 0
      };
      setMotos([...motos, newMoto]);
    }
    setIsDialogOpen(false);
    setEditingMoto(null);
  };

  const toggleMotoStatus = (motoId: number) => {
    setMotos(motos.map(moto => 
      moto.id === motoId 
        ? { 
            ...moto, 
            status: moto.status === 'Activo' ? 'Inactivo' : 
                     moto.status === 'Inactivo' ? 'Activo' : 
                     'Activo'
          }
        : moto
    ));
  };

  const showDeleteConfirm = (motoId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Eliminar Motocicleta',
      description: '¿Está seguro de que desea eliminar esta motocicleta? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'delete',
      onConfirm: () => deleteMoto(motoId)
    });
  };

  const deleteMoto = (motoId: number) => {
    setMotos(motos.filter(moto => moto.id !== motoId));
    toast.success('Motocicleta eliminada exitosamente');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'En Servicio': return 'bg-blue-100 text-blue-800';
      case 'Inactivo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar motocicletas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMoto(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Moto
            </Button>
          </DialogTrigger>
          <MotoDialog 
            moto={editingMoto} 
            clients={clients}
            onSave={handleSaveMoto}
          />
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Bike className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{motos.length}</p>
              <p className="text-muted-foreground">Total Motos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Bike className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{motos.filter(m => m.status === 'Activo').length}</p>
              <p className="text-muted-foreground">Activas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Wrench className="w-8 h-8 text-orange-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{motos.filter(m => m.status === 'En Servicio').length}</p>
              <p className="text-muted-foreground">En Servicio</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{serviceHistory.filter(s => s.status === 'Completado').length}</p>
              <p className="text-muted-foreground">Servicios Completados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Motos Table */}
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
              {paginatedMotos.map((moto) => (
                <TableRow key={moto.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{moto.plate}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{moto.brand} {moto.model}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{moto.clientName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={moto.status === 'Activo'}
                        onCheckedChange={() => toggleMotoStatus(moto.id)}
                      />
                      <span className="text-sm">
                        {moto.status === 'Activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setViewingMoto(moto)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setEditingMoto(moto);
                          setIsDialogOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => showDeleteConfirm(moto.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

      {/* Moto Details Dialog */}
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
                  <div>
                    <Label>Marca y Modelo</Label>
                    <p className="font-medium">{viewingMoto.brand} {viewingMoto.model}</p>
                  </div>
                  <div>
                    <Label>Año</Label>
                    <p>{viewingMoto.year}</p>
                  </div>
                  <div>
                    <Label>Placa</Label>
                    <p>{viewingMoto.plate}</p>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <p>{viewingMoto.color}</p>
                  </div>
                  <div>
                    <Label>Motor</Label>
                    <p>{viewingMoto.engine}</p>
                  </div>
                  <div>
                    <Label>Kilometraje</Label>
                    <p>{viewingMoto.mileage.toLocaleString()} km</p>
                  </div>
                  <div>
                    <Label>Propietario</Label>
                    <p>{viewingMoto.clientName}</p>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Badge className={getStatusColor(viewingMoto.status)}>
                      {viewingMoto.status}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Historial de Servicios
                  </h4>
                  <div className="space-y-3">
                    {serviceHistory
                      .filter(service => service.motoId === viewingMoto.id)
                      .map((service) => (
                        <div key={service.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{service.type}</p>
                              <p className="text-sm text-muted-foreground">{service.date}</p>
                            </div>
                            <Badge className={service.status === 'Completado' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {service.status}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{service.description}</p>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Técnico: {service.mechanic}</span>
                            <span>Costo: ${service.cost.toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
    </div>
  );
}

function MotoDialog({ moto, clients, onSave }: any) {
  const [formData, setFormData] = useState({
    brand: moto?.brand || '',
    model: moto?.model || '',
    year: moto?.year || new Date().getFullYear(),
    plate: moto?.plate || '',
    color: moto?.color || '',
    engine: moto?.engine || '',
    clientId: moto?.clientId || '',
    mileage: moto?.mileage || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{moto ? 'Editar Motocicleta' : 'Nueva Motocicleta'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand">Marca</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="Honda, Yamaha, etc."
              required
            />
          </div>
          <div>
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              placeholder="CB600F, R6, etc."
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="year">Año</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              min="1980"
              max={new Date().getFullYear() + 1}
              required
            />
          </div>
          <div>
            <Label htmlFor="plate">Placa</Label>
            <Input
              id="plate"
              value={formData.plate}
              onChange={(e) => setFormData(prev => ({ ...prev, plate: e.target.value }))}
              placeholder="ABC123"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              placeholder="Rojo, Azul, etc."
              required
            />
          </div>
          <div>
            <Label htmlFor="engine">Motor</Label>
            <Input
              id="engine"
              value={formData.engine}
              onChange={(e) => setFormData(prev => ({ ...prev, engine: e.target.value }))}
              placeholder="600cc, 750cc, etc."
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="clientId">Propietario</Label>
          <select
            id="clientId"
            value={formData.clientId}
            onChange={(e) => setFormData(prev => ({ ...prev, clientId: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
          <Label htmlFor="mileage">Kilometraje</Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
            placeholder="15000"
            min="0"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {moto ? 'Actualizar' : 'Registrar'} Motocicleta
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}