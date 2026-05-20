import { Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';

interface ProductosTableProps {
  productsCount: number;
  paginatedProducts: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onToggleStatus: (product: any) => void;
  onView: (product: any) => void;
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
}

export function ProductosTable({
  productsCount,
  paginatedProducts,
  currentPage,
  setCurrentPage,
  totalPages,
  onToggleStatus,
  onView,
  onEdit,
  onDelete
}: ProductosTableProps) {

  const actions = [
    {
      label: 'Ver detalles',
      icon: Eye,
      onClick: (p: any) => onView(p),
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    {
      label: 'Editar producto',
      icon: Edit,
      onClick: (p: any) => onEdit(p),
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    {
      label: 'Eliminar producto',
      icon: Trash2,
      onClick: (p: any) => onDelete(p),
      color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
    }
  ];

  return (
    <Card data-slot="card">
      <CardHeader>
        <CardTitle data-slot="card-title" className="flex items-center gap-2">
          Lista de Productos ({productsCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No se encontraron productos.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map(p => (
                <TableRow key={p.id}>
                  <TableCell><p>{p.name}</p></TableCell>
                  <TableCell><p>{p.brand}</p></TableCell>
                  <TableCell><p>{p.categoryName}</p></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={p.status === 'Activo'}
                        onCheckedChange={() => onToggleStatus(p)}
                      />
                      <span className="text-sm">{p.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {actions.map((a, i) => {
                        const isInactive = p.status !== 'Activo';
                        const isDisabled = isInactive && (a.label === 'Editar producto' || a.label === 'Eliminar producto');

                        return (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => a.onClick(p)}
                                className={a.color}
                                disabled={isDisabled}
                              >
                                <a.icon className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{a.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <PaginationItem key={p}>
                  <PaginationLink
                    onClick={() => setCurrentPage(p)}
                    isActive={currentPage === p}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
