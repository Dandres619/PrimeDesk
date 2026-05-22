import { Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';

interface CategoriasTableProps {
  categoriesCount: number;
  paginatedCategories: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onToggleStatus: (category: any) => void;
  onView: (category: any) => void;
  onEdit: (category: any) => void;
  onDelete: (category: any) => void;
}

export function CategoriasTable({
  categoriesCount,
  paginatedCategories,
  currentPage,
  setCurrentPage,
  totalPages,
  onToggleStatus,
  onView,
  onEdit,
  onDelete
}: CategoriasTableProps) {
  
  const actions = [
    { 
      label: 'Ver detalles', 
      icon: Eye, 
      onClick: (c: any) => onView(c), 
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
    },
    { 
      label: 'Editar categoría', 
      icon: Edit, 
      onClick: (c: any) => onEdit(c), 
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
    },
    { 
      label: 'Eliminar categoría', 
      icon: Trash2, 
      onClick: (c: any) => onDelete(c), 
      color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20' 
    }
  ];

  return (
    <Card data-slot="card">
      <CardHeader>
        <CardTitle data-slot="card-title" className="flex items-center gap-2">
          Lista de Categorías ({categoriesCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No se encontraron categorías.
                </TableCell>
              </TableRow>
            ) : (
              paginatedCategories.map(c => (
                <TableRow key={c.id}>
                  <TableCell><p>{c.name}</p></TableCell>
                  <TableCell>
                    {c.description && c.description.length > 45 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="cursor-help max-w-[250px] truncate text-left">
                            {c.description.substring(0, 45).trim()}...
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px] break-words">
                          <p>{c.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <p className="text-left">{c.description || 'Sin descripción detallada'}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={c.status === 'Activo'}
                        onCheckedChange={() => onToggleStatus(c)}
                      />
                      <span className="text-sm">{c.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {actions.map((a, i) => {
                        const isInactive = c.status !== 'Activo';
                        const isDisabled = isInactive && (a.label === 'Editar categoría' || a.label === 'Eliminar categoría');

                        return (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => a.onClick(c)}
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
  );
}
