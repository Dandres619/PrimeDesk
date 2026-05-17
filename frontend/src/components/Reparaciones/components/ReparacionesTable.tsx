import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Eye, Edit, XCircle, FileText, ClipboardList } from 'lucide-react';

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
    return <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{status || 'Esperando motocicleta'}</span>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Registro directo (Hoy)';
    try {
      const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const [year, month, day] = cleanDate.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hourNum = parseInt(hours, 10);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
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
              <TableHead className="text-left">Vehículo</TableHead>
              <TableHead className="text-left">Mecánico</TableHead>
              <TableHead className="text-left">Fecha</TableHead>
              <TableHead className="text-left">Total</TableHead>
              <TableHead className="text-left">Estado</TableHead>
              <TableHead className="text-left">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReparaciones.length > 0 ? paginatedReparaciones.map((o) => (
              <TableRow key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                <TableCell className="text-left font-medium text-slate-800 dark:text-slate-200">
                  {o.clientName}
                </TableCell>
                <TableCell className="text-left font-medium text-slate-800 dark:text-slate-200">
                  {o.motorcyclePlate}
                </TableCell>
                <TableCell className="text-left font-medium text-slate-700 dark:text-slate-300">
                  {o.mecanico}
                </TableCell>
                <TableCell className="text-left font-medium text-slate-700 dark:text-slate-300">
                  {formatDate(o.diaAgendamiento)}{o.horaInicio ? ` ${formatTime(o.horaInicio)}` : ''}
                </TableCell>
                <TableCell className="text-left font-medium text-slate-900 dark:text-slate-100">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(o.totalCost || 0)}
                </TableCell>
                <TableCell className="text-left">
                  {getStatusBadge(o.estadoBase)}
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex justify-left gap-1">
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
                              <Edit className="w-4 h-4" />
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
                <TableCell colSpan={7} className="h-40 text-center text-muted-foreground text-left">
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
