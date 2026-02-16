import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Switch } from './ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Tag,
  CheckCircle,
  XCircle,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

export function CategoriasProductos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
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

  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Repuestos de Motor',
      description: 'Componentes y repuestos para el sistema del motor',
      status: 'Activo',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Sistema de Frenos',
      description: 'Pastillas, discos, líquidos y componentes de frenos',
      status: 'Activo',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-20'
    },
    {
      id: 3,
      name: 'Transmisión',
      description: 'Cadenas, piñones, embragues y componentes de transmisión',
      status: 'Activo',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    },
    {
      id: 4,
      name: 'Sistema Eléctrico',
      description: 'Baterías, cables, luces y componentes eléctricos',
      status: 'Activo',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-25'
    },
    {
      id: 5,
      name: 'Carrocería',
      description: 'Espejos, guardabarros, tanques y partes de carrocería',
      status: 'Inactivo',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-22'
    },
    {
      id: 6,
      name: 'Aceites y Lubricantes',
      description: 'Aceites de motor, lubricantes y fluidos especializados',
      status: 'Activo',
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16'
    }
  ]);

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveCategory = (categoryData: any) => {
    if (editingCategory) {
      setCategories(categories.map(category => 
        category.id === editingCategory.id 
          ? { 
              ...category, 
              ...categoryData, 
              updatedAt: new Date().toISOString().split('T')[0]
            } 
          : category
      ));
      toast.success('Categoría actualizada exitosamente');
    } else {
      const newCategory = { 
        id: Date.now(), 
        ...categoryData,
        status: 'Activo',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setCategories([...categories, newCategory]);
      toast.success('Categoría creada exitosamente');
    }
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const toggleCategoryStatus = (categoryId: number) => {
    setCategories(categories.map(category => 
      category.id === categoryId 
        ? { 
            ...category, 
            status: category.status === 'Activo' ? 'Inactivo' : 'Activo',
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : category
    ));
    toast.success('Estado de la categoría actualizado');
  };

  const showDeleteConfirm = (categoryId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Eliminar Categoría',
      description: '¿Está seguro de que desea eliminar esta categoría? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'delete',
      onConfirm: () => deleteCategory(categoryId)
    });
  };

  const deleteCategory = (categoryId: number) => {
    setCategories(categories.filter(category => category.id !== categoryId));
    toast.success('Categoría eliminada exitosamente');
  };

  const getStatusColor = (status: string) => {
    return status === 'Activo' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCategory(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <CategoryDialog 
            category={editingCategory} 
            onSave={handleSaveCategory}
          />
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Tag className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-muted-foreground">Total Categorías</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{categories.filter(c => c.status === 'Activo').length}</p>
              <p className="text-muted-foreground">Activas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="w-8 h-8 text-red-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{categories.filter(c => c.status === 'Inactivo').length}</p>
              <p className="text-muted-foreground">Inactivas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            Categorías de Productos ({filteredCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.status === 'Activo'}
                        onCheckedChange={() => toggleCategoryStatus(category.id)}
                      />
                      <span className="text-sm">
                        {category.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setViewingCategory(category)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setEditingCategory(category);
                          setIsDialogOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => showDeleteConfirm(category.id)}
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

      {/* Category Details Dialog */}
      <Dialog open={!!viewingCategory} onOpenChange={() => setViewingCategory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Categoría</DialogTitle>
          </DialogHeader>
          {viewingCategory && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de la Categoría</Label>
                  <p className="font-medium">{viewingCategory.name}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge className={getStatusColor(viewingCategory.status)}>
                    {viewingCategory.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>Descripción</Label>
                <p className="mt-1 p-3 bg-muted/50 text-foreground rounded">{viewingCategory.description}</p>
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
    </div>
  );
}

function CategoryDialog({ category, onSave }: any) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    onSave(formData);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{category ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre de la Categoría *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Repuestos de Motor"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Descripción *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción detallada de la categoría..."
            rows={4}
            required
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {category ? 'Actualizar' : 'Crear'} Categoría
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}