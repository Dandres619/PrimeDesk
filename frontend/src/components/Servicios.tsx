import React, { useState, useEffect } from 'react';
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
import { Plus, Search, Edit, Trash2, Eye, Wrench, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function Servicios() {
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [viewingService, setViewingService] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', confirmText: '', variant: 'delete' as any, onConfirm: () => { } });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/servicios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar servicios');
      const data = await response.json();
      setServices(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      const url = editingService ? `${API_URL}/servicios/${editingService.ID_Servicio}` : `${API_URL}/servicios`;
      const method = editingService ? 'PUT' : 'POST';

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
        throw new Error(err.message || 'Error al guardar servicio');
      }

      toast.success(`Servicio ${editingService ? 'actualizado' : 'creado'} exitosamente`);
      setIsDialogOpen(false);
      setEditingService(null);
      fetchServices(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteService = async (service: any) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/servicios/${service.ID_Servicio}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al eliminar servicio');
      }

      toast.success('Servicio eliminado');
      fetchServices(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };

  const toggleStatus = async (service: any) => {
    try {
      const response = await fetch(`${API_URL}/servicios/${service.ID_Servicio}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: service.Nombre,
          descripcion: service.Descripcion,
          duracion: service.Duracion || service.duracion || 30,
          estado: !service.Estado
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al cambiar estado');
      }

      toast.success('Estado actualizado');
      fetchServices(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredServices = services.filter(s =>
    s.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.Descripcion && s.Descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => a.Nombre.localeCompare(b.Nombre));

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats removed

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Servicios</h1>
          <p className="text-muted-foreground">Catálogo de servicios para motocicletas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingService(null)} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <ServiceDialog service={editingService} onSave={handleSave} isSaving={isSaving} />
        </Dialog>
      </div>

      <div className="flex justify-start">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar servicios..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10" />
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
                Lista de Servicios ({filteredServices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedServices.length > 0 ? (
                    paginatedServices.map(s => (
                      <TableRow key={s.ID_Servicio}>
                        <TableCell>
                          <p>{s.Nombre}</p>
                        </TableCell>
                        <TableCell>
                          <p className="line-clamp-2">{s.Descripcion || 'Sin descripción detallada.'}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{s.Duracion || s.duracion || 0} min</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch checked={s.Estado} onCheckedChange={() => toggleStatus(s)} />
                            <span>{s.Estado ? 'Activo' : 'Inactivo'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" onClick={() => setViewingService(s)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
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
                                  onClick={() => { setEditingService(s); setIsDialogOpen(true); }}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  disabled={!s.Estado}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar servicio</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setConfirmDialog({
                                    open: true,
                                    title: 'Eliminar Servicio',
                                    description: `¿Está seguro de que desea eliminar el servicio ${s.Nombre}? Esta acción no se puede deshacer.`,
                                    confirmText: 'Eliminar',
                                    variant: 'delete',
                                    onConfirm: () => deleteService(s)
                                  })}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={!s.Estado}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Eliminar servicio</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No se encontraron servicios.
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

      <Dialog open={!!viewingService} onOpenChange={() => setViewingService(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalles del Servicio</DialogTitle>
          </DialogHeader>
          {viewingService && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Wrench className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 uppercase tracking-tight">{viewingService.Nombre}</h3>
                  <Badge className={viewingService.Estado ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}>{viewingService.Estado ? 'Activo' : 'Inactivo'}</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-semibold">ID Servicio</Label>
                    <p className="font-medium">#{viewingService.ID_Servicio}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-semibold">Duración Estimada</Label>
                    <div className="flex items-center gap-1.5 font-medium">
                      <p>{viewingService.Duracion || viewingService.duracion || 0} minutos</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-semibold">Descripción</Label>
                  <p className="mt-1 p-4 bg-muted/50 text-foreground rounded-lg border border-border italic">
                    {viewingService.Descripcion || 'Sin descripción detallada.'}
                  </p>
                </div>
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
        autoClose={false}
        loadingText="Eliminando..."
      />
    </div>
  );
}

function ServiceDialog({ service, onSave, isSaving }: any) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion: 30,
    estado: true
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'nombre':
        if (!value) error = 'El nombre es obligatorio';
        break;
      case 'descripcion':
        // Optional field
        break;
      case 'duracion':
        if (value === '') error = 'La duración es obligatoria';
        else if (isNaN(value)) error = 'Solo números';
        else if (value < 5) error = 'Mínimo 5 min';
        else if (value > 1440) error = 'Máximo 1440 min (24h)';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  useEffect(() => {
    if (service) {
      setFormData({
        nombre: service.Nombre || '',
        descripcion: service.Descripcion || '',
        duracion: service.Duracion || 30,
        estado: service.Estado ?? true
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        duracion: 30,
        estado: true
      });
      setErrors({});
      setTouched({});
    }
  }, [service]);

  const blockInvalidChar = (e: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
  };

  const handleInputChange = (name: string, value: any) => {
    let finalValue = value;
    if (name === 'duracion') {
      if (value === '') {
        finalValue = '';
      } else {
        const strValue = value.toString().replace(/\D/g, '');
        const clipped = strValue.slice(0, 4);
        let num = parseInt(clipped);

        if (num > 1440) num = 1440;
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

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{service ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-2 md:col-span-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="nombre">Nombre del Servicio *</Label>
              {touched.nombre && errors.nombre && <span className="text-red-500 text-[10px] font-medium">{errors.nombre}</span>}
            </div>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              onFocus={() => handleFocus('nombre')}
              placeholder="Ej: Mantenimiento Preventivo"
              className={touched.nombre && errors.nombre ? 'border-red-500' : ''}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="duracion">Duración (minutos) *</Label>
              {touched.duracion && errors.duracion && <span className="text-red-500 text-[10px] font-medium">{errors.duracion}</span>}
            </div>
            <div className="relative">
              <Input
                id="duracion"
                type="number"
                value={formData.duracion}
                onChange={(e) => handleInputChange('duracion', e.target.value)}
                onFocus={() => handleFocus('duracion')}
                onKeyDown={blockInvalidChar}
                className={cn(
                  "no-arrows [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-12",
                  touched.duracion && errors.duracion ? 'border-red-500' : ''
                )}
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">min</span>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="descripcion">Descripción</Label>
              {touched.descripcion && errors.descripcion && <span className="text-red-500 text-[10px] font-medium">{errors.descripcion}</span>}
            </div>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              onFocus={() => handleFocus('descripcion')}
              placeholder="Describa detalladamente el servicio..."
              rows={4}
              className={touched.descripcion && errors.descripcion ? 'border-red-500' : ''}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 px-8">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {service ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>{service ? 'Actualizar' : 'Crear'} Servicio</>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
