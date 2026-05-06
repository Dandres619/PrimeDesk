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
import { Plus, Search, Edit, Trash2, Eye, Bike, Loader2, ChevronsUpDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';

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

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
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
      if (!silent) setIsLoading(false);
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
      fetchData(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(true);
      // Wait a bit to show animation
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const deleteMoto = async (moto: any) => {
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
      fetchData(true);
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
      fetchData(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredMotos = motos.filter(m =>
    m.Placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.Marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.Modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${m.NombreCliente} ${m.ApellidoCliente}`.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.Marca.localeCompare(b.Marca));

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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="ghost" onClick={() => setViewingMoto(m)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver detalles</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setEditingMoto(m); setIsDialogOpen(true); }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                disabled={!m.Estado}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar motocicleta</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirmDialog({
                                  open: true,
                                  title: 'Eliminar Motocicleta',
                                  description: `¿Está seguro de que desea eliminar la motocicleta ${m.Placa}? Esta acción no se puede deshacer.`,
                                  confirmText: 'Eliminar',
                                  variant: 'delete',
                                  onConfirm: () => deleteMoto(m)
                                })}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={!m.Estado}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Eliminar motocicleta</p>
                            </TooltipContent>
                          </Tooltip>
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
  const [formData, setFormData] = useState({
    id_cliente: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    placa: '',
    color: '',
    motor: '',
    kilometraje: 1000,
    estado: true
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClientPopoverOpen, setIsClientPopoverOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const currentYear = new Date().getFullYear();

  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'marca':
        if (!value) error = 'La marca es obligatoria';
        break;
      case 'modelo':
        if (!value) error = 'El modelo es obligatorio';
        break;
      case 'anio':
        if (!value) error = 'El año es obligatorio';
        else if (value < 1900) error = 'Año no válido';
        else if (value > currentYear + 1) error = 'El año no puede ser futuro';
        break;
      case 'placa':
        if (!value) error = 'La placa es obligatoria';
        else if (!/^[a-zA-Z0-9]+$/.test(value)) error = 'Solo letras y números';
        else if (value.length > 6) error = 'Máximo 6 caracteres';
        break;
      case 'color':
        if (!value) error = 'El color es obligatorio';
        break;
      case 'motor':
        if (value === '') error = 'El cilindraje es obligatorio';
        else if (isNaN(value)) error = 'Solo números';
        else if (value < 50) error = 'Mínimo 50cc';
        else if (value > 2500) error = 'Máximo 2500cc';
        break;
      case 'kilometraje':
        if (value === '') error = 'El kilometraje es obligatorio';
        else if (isNaN(value)) error = 'Solo números';
        else if (value <= 0) error = 'El kilometraje no puede ser 0 o menor';
        break;
      case 'id_cliente':
        if (!value) error = 'Debe seleccionar un propietario';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  useEffect(() => {
    if (moto) {
      setFormData({
        id_cliente: moto.ID_Cliente || '',
        marca: moto.Marca || '',
        modelo: moto.Modelo || '',
        anio: moto.Anio || currentYear,
        placa: moto.Placa || '',
        color: moto.Color || '',
        motor: moto.Motor || '',
        kilometraje: moto.Kilometraje || 1000,
        estado: moto.Estado ?? true
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData({
        id_cliente: '',
        marca: '',
        modelo: '',
        anio: currentYear,
        placa: '',
        color: '',
        motor: '',
        kilometraje: 1000,
        estado: true
      });
      setErrors({});
      setTouched({});
    }
  }, [moto, currentYear]);

  const blockInvalidChar = (e: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
  };

  const handleInputChange = (name: string, value: any) => {
    let finalValue = value;

    if (name === 'placa') {
      finalValue = value.toUpperCase().replace(/[^A-DF-Z0-9]/g, '').slice(0, 6);
    }

    if (name === 'anio' || name === 'motor' || name === 'kilometraje') {
      if (value === '') {
        finalValue = '';
      } else {
        const strValue = value.toString().replace(/\D/g, '');
        let num = parseInt(strValue);

        if (name === 'anio') {
          finalValue = strValue.slice(0, 4);
          num = parseInt(finalValue);
          if (num > currentYear + 1) {
            num = currentYear + 1;
            finalValue = num;
          }
        } else if (name === 'motor') {
          const clipped = strValue.slice(0, 4);
          num = parseInt(clipped);
          if (num > 2500) num = 2500;
          finalValue = num;
        } else if (name === 'kilometraje') {
          finalValue = strValue.slice(0, 7);
          num = parseInt(finalValue);
        }

        finalValue = isNaN(num) ? '' : num;
      }
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (touched[name]) {
      validateField(name, finalValue);
    }
  };

  const handleFocus = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, (formData as any)[name]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, (formData as any)[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (hasErrors) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    onSave(formData);
  };

  const filteredClients = clients.filter((c: any) =>
    `${c.Nombre} ${c.Apellido}`.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.Documento.toString().includes(clientSearch)
  );

  const selectedClient = clients.find((c: any) => c.ID_Cliente === formData.id_cliente);

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{moto ? 'Editar Motocicleta' : 'Nueva Motocicleta'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Marca */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="marca">Marca *</Label>
              {touched.marca && errors.marca && <span className="text-red-500 text-[10px] font-medium">{errors.marca}</span>}
            </div>
            <Input
              id="marca"
              value={formData.marca}
              onChange={(e) => handleInputChange('marca', e.target.value)}
              onFocus={() => handleFocus('marca')}
              placeholder="Ej: Honda"
              className={touched.marca && errors.marca ? 'border-red-500' : ''}
            />
          </div>

          {/* Modelo */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="modelo">Modelo *</Label>
              {touched.modelo && errors.modelo && <span className="text-red-500 text-[10px] font-medium">{errors.modelo}</span>}
            </div>
            <Input
              id="modelo"
              value={formData.modelo}
              onChange={(e) => handleInputChange('modelo', e.target.value)}
              onFocus={() => handleFocus('modelo')}
              placeholder="Ej: Hornet CB600"
              className={touched.modelo && errors.modelo ? 'border-red-500' : ''}
            />
          </div>

          {/* Año */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="anio">Año *</Label>
              {touched.anio && errors.anio && <span className="text-red-500 text-[10px] font-medium">{errors.anio}</span>}
            </div>
            <Input
              id="anio"
              type="number"
              value={formData.anio}
              onChange={(e) => handleInputChange('anio', e.target.value)}
              onFocus={() => handleFocus('anio')}
              onKeyDown={blockInvalidChar}
              className={cn(
                "no-arrows [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                touched.anio && errors.anio ? 'border-red-500' : ''
              )}
            />
          </div>

          {/* Placa */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="placa">Placa *</Label>
              {touched.placa && errors.placa && <span className="text-red-500 text-[10px] font-medium">{errors.placa}</span>}
            </div>
            <Input
              id="placa"
              value={formData.placa}
              onChange={(e) => handleInputChange('placa', e.target.value)}
              onFocus={() => handleFocus('placa')}
              placeholder="ABC123"
              className={touched.placa && errors.placa ? 'border-red-500' : ''}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="color">Color *</Label>
              {touched.color && errors.color && <span className="text-red-500 text-[10px] font-medium">{errors.color}</span>}
            </div>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              onFocus={() => handleFocus('color')}
              placeholder="Ej: Rojo"
              className={touched.color && errors.color ? 'border-red-500' : ''}
            />
          </div>

          {/* Cilindraje */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="motor">Cilindraje (cc) *</Label>
              {touched.motor && errors.motor && <span className="text-red-500 text-[10px] font-medium">{errors.motor}</span>}
            </div>
            <Input
              id="motor"
              type="number"
              value={formData.motor}
              onChange={(e) => handleInputChange('motor', e.target.value)}
              onFocus={() => handleFocus('motor')}
              onKeyDown={blockInvalidChar}
              placeholder="Ej: 600"
              className={cn(
                "no-arrows [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                touched.motor && errors.motor ? 'border-red-500' : ''
              )}
            />
          </div>

          {/* Kilometraje */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="kilometraje">Kilometraje *</Label>
              {touched.kilometraje && errors.kilometraje && <span className="text-red-500 text-[10px] font-medium">{errors.kilometraje}</span>}
            </div>
            <Input
              id="kilometraje"
              type="number"
              value={formData.kilometraje}
              onChange={(e) => handleInputChange('kilometraje', e.target.value)}
              onFocus={() => handleFocus('kilometraje')}
              onKeyDown={blockInvalidChar}
              className={cn(
                "no-arrows [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                touched.kilometraje && errors.kilometraje ? 'border-red-500' : ''
              )}
            />
          </div>

          {/* Propietario (Searchable) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Propietario *</Label>
              {touched.id_cliente && errors.id_cliente && <span className="text-red-500 text-[10px] font-medium">{errors.id_cliente}</span>}
            </div>
            <Popover open={isClientPopoverOpen} onOpenChange={setIsClientPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isClientPopoverOpen}
                  className={cn(
                    "w-full justify-between font-normal",
                    !formData.id_cliente && "text-muted-foreground",
                    touched.id_cliente && errors.id_cliente && "border-red-500"
                  )}
                  onClick={() => handleFocus('id_cliente')}
                >
                  {selectedClient
                    ? `${selectedClient.Nombre} ${selectedClient.Apellido} - ${selectedClient.Documento}`
                    : "Seleccionar cliente..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <div className="p-2 border-b">
                  <div className="flex items-center px-3 py-2 bg-muted/50 rounded-md">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Buscar por nombre o cédula..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1">
                  {filteredClients.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No se encontraron clientes.</p>
                  ) : (
                    filteredClients.map((client: any) => (
                      <div
                        key={client.ID_Cliente}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                          formData.id_cliente === client.ID_Cliente && "bg-blue-50 text-blue-700 font-medium"
                        )}
                        onClick={() => {
                          handleInputChange('id_cliente', client.ID_Cliente);
                          setIsClientPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.id_cliente === client.ID_Cliente ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{client.Nombre} {client.Apellido}</span>
                          <span className="text-[10px] text-muted-foreground">CC: {client.Documento}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 px-8">
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
