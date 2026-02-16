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
  Package,
  CheckCircle,
  XCircle,
  DollarSign,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

export function Productos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
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

  // Categorías disponibles (normalmente vendría del módulo de categorías)
  const categories = [
    { id: 1, name: 'Repuestos de Motor', status: 'Activo' },
    { id: 2, name: 'Sistema de Frenos', status: 'Activo' },
    { id: 3, name: 'Transmisión', status: 'Activo' },
    { id: 4, name: 'Sistema Eléctrico', status: 'Activo' },
    { id: 5, name: 'Carrocería', status: 'Inactivo' },
    { id: 6, name: 'Aceites y Lubricantes', status: 'Activo' }
  ];

  // Marcas disponibles
  const brands = [
    'Auteco',
    'Yamaha',
    'Honda',
    'Suzuki',
    'Kawasaki',
    'Bajaj',
    'TVS',
    'KTM',
    'Genérica',
    'Otra'
  ];

  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Pastillas de Freno Delanteras',
      description: 'Pastillas de freno para motocicletas deportivas, alta resistencia',
      brand: 'Yamaha',
      categoryId: 2,
      categoryName: 'Sistema de Frenos',
      quantity: 3,
      unitPrice: 35000,
      status: 'Activo',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Aceite de Motor 10W-40',
      description: 'Aceite sintético para motores de 4 tiempos',
      brand: 'Honda',
      categoryId: 6,
      categoryName: 'Aceites y Lubricantes',
      quantity: 2,
      unitPrice: 45000,
      status: 'Activo',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-20'
    },
    {
      id: 3,
      name: 'Cadena de Transmisión 520',
      description: 'Cadena reforzada para motocicletas de alta cilindrada',
      brand: 'Kawasaki',
      categoryId: 3,
      categoryName: 'Transmisión',
      quantity: 1,
      unitPrice: 85000,
      status: 'Activo',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    },
    {
      id: 4,
      name: 'Batería 12V 7AH',
      description: 'Batería libre de mantenimiento para motocicletas',
      brand: 'Auteco',
      categoryId: 4,
      categoryName: 'Sistema Eléctrico',
      quantity: 2,
      unitPrice: 120000,
      status: 'Activo',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-25'
    },
    {
      id: 5,
      name: 'Filtro de Aire K&N',
      description: 'Filtro de aire de alto rendimiento reutilizable',
      brand: 'KTM',
      categoryId: 1,
      categoryName: 'Repuestos de Motor',
      quantity: 0,
      unitPrice: 75000,
      status: 'Inactivo',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-22'
    },
    {
      id: 6,
      name: 'Piñón de Ataque 15T',
      description: 'Piñón de ataque endurecido para transmisión',
      brand: 'Suzuki',
      categoryId: 3,
      categoryName: 'Transmisión',
      quantity: 4,
      unitPrice: 25000,
      status: 'Activo',
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16'
    }
  ]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveProduct = (productData: any) => {
    const category = categories.find(c => c.id === parseInt(productData.categoryId));
    
    if (editingProduct) {
      setProducts(products.map(product => 
        product.id === editingProduct.id 
          ? { 
              ...product, 
              ...productData,
              categoryId: parseInt(productData.categoryId),
              categoryName: category?.name || '',
              quantity: parseInt(productData.quantity),
              unitPrice: parseInt(productData.unitPrice),
              updatedAt: new Date().toISOString().split('T')[0]
            } 
          : product
      ));
      toast.success('Producto actualizado exitosamente');
    } else {
      const newProduct = { 
        id: Date.now(), 
        ...productData,
        categoryId: parseInt(productData.categoryId),
        categoryName: category?.name || '',
        quantity: parseInt(productData.quantity),
        unitPrice: parseInt(productData.unitPrice),
        status: 'Activo',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setProducts([...products, newProduct]);
      toast.success('Producto creado exitosamente');
    }
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const toggleProductStatus = (productId: number) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            status: product.status === 'Activo' ? 'Inactivo' : 'Activo',
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : product
    ));
    toast.success('Estado del producto actualizado');
  };

  const showDeleteConfirm = (productId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Eliminar Producto',
      description: '¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'delete',
      onConfirm: () => deleteProduct(productId)
    });
  };

  const deleteProduct = (productId: number) => {
    setProducts(products.filter(product => product.id !== productId));
    toast.success('Producto eliminado exitosamente');
  };

  const getStatusColor = (status: string) => {
    return status === 'Activo' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  const getCategoryColor = (categoryName: string) => {
    const colorMap: { [key: string]: string } = {
      'Repuestos de Motor': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Sistema de Frenos': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'Transmisión': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Sistema Eléctrico': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Carrocería': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Aceites y Lubricantes': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    };
    return colorMap[categoryName] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getQuantityColor = (quantity: number) => {
    if (quantity === 0) return 'text-red-600 dark:text-red-400';
    if (quantity <= 2) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <ProductDialog 
            product={editingProduct} 
            categories={categories.filter(c => c.status === 'Activo')}
            brands={brands}
            onSave={handleSaveProduct}
          />
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-muted-foreground">Total Productos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{products.filter(p => p.status === 'Activo').length}</p>
              <p className="text-muted-foreground">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="w-8 h-8 text-red-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{products.filter(p => p.status === 'Inactivo').length}</p>
              <p className="text-muted-foreground">Inactivos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                ${Math.round(products.filter(p => p.status === 'Activo').reduce((sum, p) => sum + p.unitPrice, 0) / products.filter(p => p.status === 'Activo').length || 0).toLocaleString()}
              </p>
              <p className="text-muted-foreground">Precio Promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Productos ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <p className="font-medium">{product.name}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{product.brand}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(product.categoryName)}>
                      {product.categoryName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className={`font-medium ${getQuantityColor(product.quantity)}`}>
                        {product.quantity} unidades
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">${product.unitPrice.toLocaleString()}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.status === 'Activo'}
                        onCheckedChange={() => toggleProductStatus(product.id)}
                      />
                      <span className="text-sm">
                        {product.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setViewingProduct(product)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsDialogOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => showDeleteConfirm(product.id)}
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

      {/* Product Details Dialog */}
      <Dialog open={!!viewingProduct} onOpenChange={() => setViewingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Producto</DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del Producto</Label>
                  <p className="font-medium">{viewingProduct.name}</p>
                </div>
                <div>
                  <Label>Marca</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <p className="font-medium">{viewingProduct.brand}</p>
                  </div>
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Badge className={getCategoryColor(viewingProduct.categoryName)}>
                    {viewingProduct.categoryName}
                  </Badge>
                </div>
                <div>
                  <Label>Cantidad Disponible</Label>
                  <p className={`font-medium ${getQuantityColor(viewingProduct.quantity)}`}>
                    {viewingProduct.quantity} unidades
                  </p>
                </div>
                <div>
                  <Label>Precio Unitario</Label>
                  <p className="font-medium">${viewingProduct.unitPrice.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge className={getStatusColor(viewingProduct.status)}>
                    {viewingProduct.status}
                  </Badge>
                </div>
                <div>
                  <Label>Valor Total</Label>
                  <p className="font-medium">${(viewingProduct.quantity * viewingProduct.unitPrice).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <Label>Descripción</Label>
                <p className="mt-1 p-3 bg-muted/50 text-foreground rounded">{viewingProduct.description}</p>
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

function ProductDialog({ product, categories, brands, onSave }: any) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    categoryId: product?.categoryId?.toString() || '',
    quantity: product?.quantity?.toString() || '',
    unitPrice: product?.unitPrice?.toString() || '',
    brand: product?.brand || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.categoryId || 
        !formData.quantity || !formData.unitPrice || !formData.brand) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    if (parseInt(formData.quantity) < 0) {
      toast.error('La cantidad no puede ser negativa');
      return;
    }

    if (parseInt(formData.unitPrice) <= 0) {
      toast.error('El precio unitario debe ser mayor a 0');
      return;
    }

    onSave(formData);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{product ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre del Producto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Pastillas de Freno Delanteras"
              required
            />
          </div>
          <div>
            <Label htmlFor="brand">Marca *</Label>
            <select
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
              required
            >
              <option value="">Seleccionar marca</option>
              {brands.map((brand: string) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoryId">Categoría *</Label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="quantity">Cantidad *</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="50"
              min="0"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Descripción *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción detallada del producto..."
            rows={3}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="unitPrice">Precio Unitario *</Label>
          <Input
            id="unitPrice"
            type="number"
            value={formData.unitPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
            placeholder="35000"
            min="1"
            required
          />
        </div>

        {formData.quantity && formData.unitPrice && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <Package className="w-4 h-4 inline mr-1" />
              Valor Total: ${(parseInt(formData.quantity || '0') * parseInt(formData.unitPrice || '0')).toLocaleString()}
            </p>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {product ? 'Actualizar' : 'Crear'} Producto
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}