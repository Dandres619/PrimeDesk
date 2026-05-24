import { Eye, FileText, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { formatLocalDate } from '../../../lib/utils';

interface VentasTableProps {
  salesCount: number;
  paginatedSales: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onView: (id: number) => void;
  onPDF: (id: number) => void;
}

export function VentasTable({
  salesCount,
  paginatedSales,
  currentPage,
  setCurrentPage,
  totalPages,
  onView,
  onPDF
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
              <TableHead>Cliente</TableHead>
              <TableHead>Motocicleta</TableHead>
              <TableHead>Total Facturado</TableHead>
              <TableHead>Fecha de finalización</TableHead>
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
                  <TableCell>{sale.clientName}</TableCell>
                  <TableCell>{sale.motorcycle}</TableCell>
                  <TableCell>
                    {(() => {
                      const isFromRepair = !!(sale.ID_Reparacion || (sale.serviceOrderNumber && sale.serviceOrderNumber !== 'N/A'));
                      const partsTotal = sale.parts ? sale.parts.reduce((sum: number, p: any) => sum + (p.quantity * parseFloat(p.unitCost || 0)), 0) : 0;
                      const serviceCost = parseFloat(sale.serviceCost || 0);
                      const totalDb = parseFloat(sale.total || 0);

                      let grandTotal = totalDb;
                      if (isFromRepair) {
                        const manoObra = Math.max(0, totalDb - partsTotal);
                        grandTotal = partsTotal + manoObra + serviceCost;
                      } else {
                        grandTotal = totalDb;
                      }
                      return `$${grandTotal.toLocaleString()}`;
                    })()}
                  </TableCell>
                  <TableCell>{formatLocalDate(sale.date, 'dd/MM/yyyy HH:mm')}</TableCell>
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
