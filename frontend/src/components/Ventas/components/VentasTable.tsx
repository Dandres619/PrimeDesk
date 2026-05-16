import { Eye, FileText, XCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VentasTableProps {
  salesCount: number;
  paginatedSales: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onView: (id: number) => void;
  onPDF: (id: number) => void;
  onCancel: (sale: any) => void;
}

export function VentasTable({
  salesCount,
  paginatedSales,
  currentPage,
  setCurrentPage,
  totalPages,
  onView,
  onPDF,
  onCancel
}: VentasTableProps) {
  
  return (
    <Card data-slot="card">
      <CardHeader>
        <CardTitle data-slot="card-title" className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Listado de Ventas ({salesCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Venta</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Reparación</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No se encontraron ventas.
                </TableCell>
              </TableRow>
            ) : (
              paginatedSales.map(sale => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{sale.invoiceNumber}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{format(new Date(sale.date), 'PPP', { locale: es })}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold">{sale.clientName}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold opacity-70">{sale.serviceOrderNumber || 'Sin asociar'}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-black text-slate-900 dark:text-white">{sale.total.toLocaleString()}</p>
                  </TableCell>
                  <TableCell>
                    {sale.anulada ? (
                      <Badge variant="destructive" className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-none font-bold">Anulada</Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none font-bold">Activa</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => onView(sale.id)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Ver detalles</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => onPDF(sale.id)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Descargar PDF</p></TooltipContent>
                      </Tooltip>

                      {!sale.anulada && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => onCancel(sale)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Anular venta</p></TooltipContent>
                        </Tooltip>
                      )}
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
