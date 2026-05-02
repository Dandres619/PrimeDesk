import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Switch } from './ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, Bike, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

const statusColors: any = {
  true: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  false: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

export function Motos() {
  const [motos, setMotos] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMoto, setEditingMoto] = useState<any>(null);
  const [viewingMoto, setViewingMoto] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => { } });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [motosRes, clientsRes] = await Promise.all([
        fetch(`${API_URL}/motocicletas`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/clientes`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!motosRes.ok || !clientsRes.ok) throw new Error('Error al cargar datos');

      const motosData = await motosRes.json();
      const clientsData = await clientsRes.json();

      setMotos(motosData);
      setClients(clientsData);
    } catch (error: any) {
      toast.error(error.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      const url = editingMoto ? `${API_URL}/motocicletas/${editingMoto.ID_Motocicleta}` : `${API_URL}/motocicletas`;
      const method = editingMoto ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al guardar motocicleta');
      }

      toast.success(`Motocicleta ${editingMoto ? 'actualizada' : 'registrada'} exitosamente`);
      setIsDialogOpen(false);
      setEditingMoto(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(true);
      // Wait a bit to show animation
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const deleteMoto = async (moto: any) => {
    if (moto.Estado) {
      toast.error('No se puede eliminar una motocicleta activa. Primero debe inactivarla.');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/motocicletas/${moto.ID_Motocicleta}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al eliminar motocicleta');
      }

      toast.success('Motocicleta eliminada');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };

  const toggleStatus = async (moto: any) => {
    try {
      const response = await fetch(`${API_URL}/motocicletas/${moto.ID_Motocicleta}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_cliente: moto.ID_Cliente,
          marca: moto.Marca,
          modelo: moto.Modelo,
          anio: moto.Anio,
          placa: moto.Placa,
          color: moto.Color,
          motor: moto.Motor,
          kilometraje: moto.Kilometraje,
          estado: !moto.Estado
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al cambiar estado');
      }

      toast.success('Estado actualizado');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredMotos = motos.filter(m =>
    m.Placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.Marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.Modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${m.NombreCliente} ${m.ApellidoCliente}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredMotos.length / itemsPerPage));
  const paginatedMotos = filteredMotos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats removed

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Motocicletas</h1>
          <p className="text-muted-foreground">Gestión de vehículos de clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMoto(null)} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Moto
            </Button>
          </DialogTrigger>
          <MotoDialog moto={editingMoto} clients={clients} onSave={handleSave} isSaving={isSaving} />
        </Dialog>
      </div>

      <div className="flex justify-start">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar motocicletas..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      ) : (
        <>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Lista de Motocicletas ({filteredMotos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Propietario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMotos.length > 0 ? paginatedMotos.map(m => (
                    <TableRow key={m.ID_Motocicleta}>
                      <TableCell>
                        <p>{m.Placa}</p>
                      </TableCell>
                      <TableCell>
                        <p>{m.Marca}</p>
                      </TableCell>
                      <TableCell>
                        <p>{m.Modelo}</p>
                      </TableCell>
                      <TableCell>
                        <p>{m.Anio}</p>
                      </TableCell>
                      <TableCell>
                        <p>{m.NombreCliente} {m.ApellidoCliente}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={m.Estado} onCheckedChange={() => toggleStatus(m)} />
                          <span>{m.Estado ? 'Activo' : 'Inactivo'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setViewingMoto(m)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingMoto(m); setIsDialogOpen(true); }} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmDialog({
                            open: true,
                            title: 'Eliminar Motocicleta',
                            description: `¿Está seguro de que desea eliminar la motocicleta ${m.Placa}? Esta acción no se puede deshacer.`,
                            confirmText: 'Eliminar',
                            variant: 'delete',
                            onConfirm: () => deleteMoto(m)
                          })} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No se encontraron motocicletas.
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
                        <PaginationLink onClick={() => setCurrentPage(p)} isActive={currentPage === p} className="cursor-pointer">{p}</PaginationLink>
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
        </>
      )}

      <Dialog open={!!viewingMoto} onOpenChange={() => setViewingMoto(null)}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Detalles de la Motocicleta</DialogTitle>
          </DialogHeader>
          {viewingMoto && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Bike className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 uppercase tracking-tight">{viewingMoto.Placa}</h3>
                  <p className="text-blue-700 dark:text-blue-400 font-medium">{viewingMoto.Marca} {viewingMoto.Modelo}</p>
                  <Badge className={statusColors[viewingMoto.Estado]}>{viewingMoto.Estado ? 'Activo' : 'Inactivo'}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <DetailItem label="Marca" value={viewingMoto.Marca} />
                <DetailItem label="Modelo" value={viewingMoto.Modelo} />
                <DetailItem label="Año" value={viewingMoto.Anio} />
                <DetailItem label="Color" value={viewingMoto.Color} />
                <DetailItem label="Cilindraje (cc)" value={viewingMoto.Motor} />
                <DetailItem label="Kilometraje" value={`${viewingMoto.Kilometraje.toLocaleString()} km`} />
                <DetailItem label="Propietario" value={`${viewingMoto.NombreCliente} ${viewingMoto.ApellidoCliente}`} />
                <DetailItem label="ID Motocicleta" value={viewingMoto.ID_Motocicleta} />
              </div>
            </div>
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
      />
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: any }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground uppercase font-semibold">{label}</Label>
      <p className="font-medium text-foreground">{value || '-'}</p>
    </div>
  );
}

function MotoDialog({ moto, clients, onSave, isSaving }: any) {
  const [formData, setFormData] = useState<{
    id_cliente: number | '',
    marca: string,
    modelo: string,
    anio: number,
    placa: string,
    color: string,
    motor: number | '',
    kilometraje: number,
    estado: boolean
  }>({
    id_cliente: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    placa: '',
    color: '',
    motor: '',
    kilometraje: 0,
    estado: true
  });

  useEffect(() => {
    if (moto) {
      setFormData({
        id_cliente: moto.ID_Cliente || '',
        marca: moto.Marca || '',
        modelo: moto.Modelo || '',
        anio: moto.Anio || new Date().getFullYear(),
        placa: moto.Placa || '',
        color: moto.Color || '',
        motor: moto.Motor || '',
        kilometraje: moto.Kilometraje || 0,
        estado: moto.Estado ?? true
      });
    } else {
      setFormData({
        id_cliente: '',
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        placa: '',
        color: '',
        motor: '',
        kilometraje: 0,
        estado: true
      });
    }
  }, [moto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones manuales
    if (!formData.marca || !formData.modelo || !formData.placa || !formData.id_cliente || !formData.color || !formData.motor) {
      toast.error('Por favor, rellene todos los campos obligatorios (*)');
      return;
    }

    if (formData.anio < 1900 || formData.anio > new Date().getFullYear() + 1) {
      toast.error('Por favor, ingrese un año válido');
      return;
    }

    onSave(formData);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{moto ? 'Editar Motocicleta' : 'Nueva Motocicleta'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="marca">Marca *</Label>
            <Input id="marca" value={formData.marca} onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))} placeholder="Ej: Honda" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo *</Label>
            <Input id="modelo" value={formData.modelo} onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))} placeholder="Ej: Hornet CB600" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anio">Año *</Label>
            <Input id="anio" type="number" value={formData.anio} onChange={(e) => setFormData(prev => ({ ...prev, anio: parseInt(e.target.value) || 0 }))} min={1900} max={new Date().getFullYear() + 1} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placa">Placa *</Label>
            <Input id="placa" value={formData.placa} onChange={(e) => setFormData(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))} placeholder="ABC123" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color *</Label>
            <Input id="color" value={formData.color} onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))} placeholder="Ej: Rojo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motor">Cilindraje (cc) *</Label>
            <Input id="motor" type="number" value={formData.motor} onChange={(e) => setFormData(prev => ({ ...prev, motor: e.target.value === '' ? '' : parseInt(e.target.value) || 0 }))} placeholder="Ej: 600" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kilometraje">Kilometraje *</Label>
            <Input id="kilometraje" type="number" value={formData.kilometraje} onChange={(e) => setFormData(prev => ({ ...prev, kilometraje: parseInt(e.target.value) || 0 }))} min={0} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="id_cliente">Propietario *</Label>
            <select
              id="id_cliente"
              value={formData.id_cliente}
              onChange={(e) => setFormData(prev => ({ ...prev, id_cliente: e.target.value === '' ? '' : parseInt(e.target.value) || '' }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((c: any) => (
                <option key={c.ID_Cliente} value={c.ID_Cliente}>{c.Nombre} {c.Apellido} - {c.Documento}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {moto ? 'Actualizando...' : 'Registrando...'}
              </>
            ) : (
              <>{moto ? 'Actualizar' : 'Registrar'} Motocicleta</>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
