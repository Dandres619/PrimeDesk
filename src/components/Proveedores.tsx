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
import { PDFPreviewDialog } from './PDFPreviewDialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Truck,
  Users,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

export function Proveedores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [viewingSupplier, setViewingSupplier] = useState<any>(null);
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
  const [pdfPreview, setPdfPreview] = useState<{
    open: boolean;
    data: any;
    type: 'supplier' | 'general';
  }>({
    open: false,
    data: null,
    type: 'supplier'
  });

  const [suppliers, setSuppliers] = useState([
    { 
      id: 1, 
      name: 'Repuestos Honda Colombia',
      contact: 'Luis Martínez',
      phone: '+57 300 111 2222',
      email: 'luis@hondacol.com',
      address: 'Calle 100 #15-20, Bogotá',
      city: 'Bogotá',
      country: 'Colombia',
      taxId: '900123456-1',
      website: 'www.hondacol.com',
      specialty: 'Repuestos Honda',
      status: 'Activo',
      notes: 'Proveedor principal de repuestos Honda originales'
    },
    { 
      id: 2, 
      name: 'Yamaha Parts & Service',
      contact: 'Ana Rodríguez',
      phone: '+57 301 333 4444',
      email: 'ana@yamahaparts.com',
      address: 'Av. El Dorado #45-67, Bogotá',
      city: 'Bogotá',
      country: 'Colombia',
      taxId: '900654321-2',
      website: 'www.yamahaparts.com',
      specialty: 'Repuestos Yamaha',
      status: 'Activo',
      notes: 'Especialistas en motos deportivas Yamaha'
    },
    { 
      id: 3, 
      name: 'Suzuki Genuine Parts',
      contact: 'Carlos Mendoza',
      phone: '+57 302 555 6666',
      email: 'carlos@suzukiparts.com',
      address: 'Carrera 7 #85-12, Bogotá',
      city: 'Bogotá',
      country: 'Colombia',
      taxId: '900789123-3',
      website: 'www.suzukiparts.com',
      specialty: 'Repuestos Suzuki',
      status: 'Activo',
      notes: 'Distribuidor autorizado Suzuki'
    },
    { 
      id: 4, 
      name: 'Kawasaki Original Parts',
      contact: 'María García',
      phone: '+57 303 777 8888',
      email: 'maria@kawasakiparts.com',
      address: 'Calle 72 #10-34, Bogotá',
      city: 'Bogotá',
      country: 'Colombia',
      taxId: '900456789-4',
      website: 'www.kawasakiparts.com',
      specialty: 'Repuestos Kawasaki',
      status: 'Inactivo',
      notes: 'Temporalmente suspendido por reorganización'
    }
  ]);

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveSupplier = (supplierData: any) => {
    if (editingSupplier) {
      setSuppliers(suppliers.map(supplier => 
        supplier.id === editingSupplier.id 
          ? { ...supplier, ...supplierData } 
          : supplier
      ));
    } else {
      const newSupplier = { 
        id: Date.now(), 
        ...supplierData,
        status: 'Activo'
      };
      setSuppliers([...suppliers, newSupplier]);
    }
    setIsDialogOpen(false);
    setEditingSupplier(null);
  };

  const showStatusConfirm = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    const newStatus = supplier?.status === 'Activo' ? 'Inactivo' : 'Activo';
    
    setConfirmDialog({
      open: true,
      title: `${newStatus === 'Activo' ? 'Activar' : 'Desactivar'} Proveedor`,
      description: `¿Está seguro de que desea ${newStatus === 'Activo' ? 'activar' : 'desactivar'} este proveedor?`,
      confirmText: newStatus === 'Activo' ? 'Activar' : 'Desactivar',
      variant: 'default',
      onConfirm: () => toggleSupplierStatus(supplierId)
    });
  };

  const toggleSupplierStatus = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    const newStatus = supplier?.status === 'Activo' ? 'Inactivo' : 'Activo';
    
    setSuppliers(suppliers.map(supplier => 
      supplier.id === supplierId 
        ? { 
            ...supplier, 
            status: newStatus
          }
        : supplier
    ));
    
    toast.success(`Proveedor ${newStatus === 'Activo' ? 'activado' : 'desactivado'} exitosamente`);
  };

  const showDeleteConfirm = (supplierId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Eliminar Proveedor',
      description: '¿Está seguro de que desea eliminar este proveedor? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'delete',
      onConfirm: () => deleteSupplier(supplierId)
    });
  };

  const deleteSupplier = (supplierId: number) => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== supplierId));
    toast.success('Proveedor eliminado exitosamente');
  };

  const showPDFPreview = () => {
    setPdfPreview({
      open: true,
      data: { title: 'Reporte de Proveedores', suppliers },
      type: 'general'
    });
  };

  const generatePDF = () => {
    toast.success('PDF generado exitosamente');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
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
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingSupplier(null)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <SupplierDialog 
              supplier={editingSupplier} 
              onSave={handleSaveSupplier}
            />
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Truck className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{suppliers.length}</p>
              <p className="text-muted-foreground">Total Proveedores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{suppliers.filter(s => s.status === 'Activo').length}</p>
              <p className="text-muted-foreground">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Phone className="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{suppliers.filter(s => s.phone).length}</p>
              <p className="text-muted-foreground">Con Teléfono</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Mail className="w-8 h-8 text-orange-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{suppliers.filter(s => s.email).length}</p>
              <p className="text-muted-foreground">Con Email</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Listado de Proveedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">
                        NIT: {supplier.taxId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{supplier.contact}</p>
                      <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                      <p className="text-sm text-muted-foreground">{supplier.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{supplier.specialty}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {supplier.city}
                      </p>
                      <p className="text-muted-foreground">{supplier.country}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={supplier.status === 'Activo'}
                        onCheckedChange={() => toggleSupplierStatus(supplier.id)}
                      />
                      <span className="text-sm">
                        {supplier.status === 'Activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setViewingSupplier(supplier)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setEditingSupplier(supplier);
                          setIsDialogOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => showDeleteConfirm(supplier.id)}
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

      {/* Supplier Details Dialog */}
      <Dialog open={!!viewingSupplier} onOpenChange={() => setViewingSupplier(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Proveedor</DialogTitle>
          </DialogHeader>
          {viewingSupplier && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Información General</h4>
                  <div className="space-y-2">
                    <div>
                      <Label>Nombre de la Empresa</Label>
                      <p className="font-medium">{viewingSupplier.name}</p>
                    </div>
                    <div>
                      <Label>NIT/RUT</Label>
                      <p>{viewingSupplier.taxId}</p>
                    </div>
                    <div>
                      <Label>Especialidad</Label>
                      <Badge variant="outline">{viewingSupplier.specialty}</Badge>
                    </div>
                    <div>
                      <Label>Sitio Web</Label>
                      <p>{viewingSupplier.website}</p>
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <Badge className={getStatusColor(viewingSupplier.status)}>
                        {viewingSupplier.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Información de Contacto</h4>
                  <div className="space-y-2">
                    <div>
                      <Label>Persona de Contacto</Label>
                      <p className="font-medium">{viewingSupplier.contact}</p>
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <p>{viewingSupplier.phone}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p>{viewingSupplier.email}</p>
                    </div>
                    <div>
                      <Label>Dirección</Label>
                      <p>{viewingSupplier.address}</p>
                    </div>
                    <div>
                      <Label>Ciudad</Label>
                      <p>{viewingSupplier.city}, {viewingSupplier.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {viewingSupplier.notes && (
                <div>
                  <Label>Notas</Label>
                  <p className="text-sm mt-1">{viewingSupplier.notes}</p>
                </div>
              )}
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
        onGenerate={generatePDF}
      />
    </div>
  );
}

function SupplierDialog({ supplier, onSave }: any) {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contact: supplier?.contact || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    city: supplier?.city || '',
    country: supplier?.country || 'Colombia',
    taxId: supplier?.taxId || '',
    website: supplier?.website || '',
    specialty: supplier?.specialty || '',
    notes: supplier?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre de la Empresa</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Repuestos ABC Ltda."
              required
            />
          </div>
          <div>
            <Label htmlFor="taxId">NIT/RUT</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
              placeholder="900123456-1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact">Persona de Contacto</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
              placeholder="Juan Pérez"
              required
            />
          </div>
          <div>
            <Label htmlFor="specialty">Especialidad</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
              placeholder="Repuestos Honda"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+57 300 123 4567"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contacto@empresa.com"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Calle 123 #45-67"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Bogotá"
              required
            />
          </div>
          <div>
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              placeholder="Colombia"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="website">Sitio Web</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="www.empresa.com"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Información adicional sobre el proveedor..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {supplier ? 'Actualizar' : 'Registrar'} Proveedor
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}