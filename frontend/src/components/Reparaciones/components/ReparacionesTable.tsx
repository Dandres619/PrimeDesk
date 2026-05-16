import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Eye, Edit2, XCircle, FileText, ClipboardList } from 'lucide-react';

interface ReparacionesTableProps {
  reparacionesCount: number;
  paginatedReparaciones: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onView: (order: any) => void;
  onEdit: (order: any) => void;
  onAnular: (id: number) => void;
  onDownload: (order: any) => void;
}

export function ReparacionesTable({
  reparacionesCount,
  paginatedReparaciones,
  currentPage,
  setCurrentPage,
  totalPages,
  onView,
  onEdit,
  onAnular,
  onDownload
}: ReparacionesTableProps) {

  const getStatusBadge = (status: string) => {
    return <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{status}</span>;
  };

  return (
    <Card data-slot="card">
      <CardHeader>
        <CardTitle data-slot="card-title" className="text-left flex items-center gap-2">
          Lista de Reparaciones ({reparacionesCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Cliente</TableHead>
              <TableHead className="text-left">Motocicleta</TableHead>
              <TableHead className="text-left">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReparaciones.length > 0 ? paginatedReparaciones.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="text-left font-medium">
                  {o.clientName}
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-200">{o.motorcyclePlate}</span>
                    <span className="text-xs text-muted-foreground">{o.motorcycleBrand} {o.motorcycleModel}</span>
                  </div>
                </TableCell>
                <TableCell className="text-left">
                  {getStatusBadge(o.estadoBase)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => onView(o)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Ver detalles</p></TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => onDownload(o)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Descargar PDF</p></TooltipContent>
                    </Tooltip>

                    {!(o.anulada || o.estadoBase === 'Reparación finalizada' || o.associatedSaleId) && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => onEdit(o)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Editar orden</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => onAnular(o.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Anular orden</p></TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground text-left">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ClipboardList className="w-8 h-8 opacity-20" />
                    <p>No se encontraron reparaciones registradas.</p>
                  </div>
                </TableCell>
              </TableRow>
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
