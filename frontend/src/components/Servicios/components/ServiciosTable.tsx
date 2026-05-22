import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface ServiciosTableProps {
  services: any[];
  paginatedServices: any[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  onView: (service: any) => void;
  onEdit: (service: any) => void;
  onDelete: (service: any) => void;
  onToggleStatus: (service: any) => void;
}

export function ServiciosTable({
  services,
  paginatedServices,
  currentPage,
  totalPages,
  setCurrentPage,
  onView,
  onEdit,
  onDelete,
  onToggleStatus
}: ServiciosTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Lista de Servicios ({services.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Servicio</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.length > 0 ? (
              paginatedServices.map(s => (
                <TableRow key={s.ID_Servicio}>
                  <TableCell>
                    <p className="text-left">{s.Nombre}</p>
                  </TableCell>
                  <TableCell>
                    {s.Descripcion && s.Descripcion.length > 45 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="cursor-help max-w-[250px] truncate text-left">
                            {s.Descripcion.substring(0, 45).trim()}...
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px] break-words">
                          <p>{s.Descripcion}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <p className="text-left">{s.Descripcion || 'Sin descripción detallada.'}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-left">
                    <div>
                      <p>{s.Duracion || s.duracion || 0} min</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <p>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(s.Precio || s.precio || 0)}
                    </p>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center gap-2">
                      <Switch checked={s.Estado} onCheckedChange={() => onToggleStatus(s)} />
                      <span>{s.Estado ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => onView(s)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Ver detalles</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(s)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            disabled={!s.Estado}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Editar servicio</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(s)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={!s.Estado}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Eliminar servicio</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
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
  );
}
