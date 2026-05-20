import { Eye, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ComprasTableProps {
  purchasesCount: number;
  paginatedPurchases: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onView: (id: number) => void;
  onPDF: (purchase: any) => void;
  onCancel: (purchase: any) => void;
}

export function ComprasTable({
  purchasesCount,
  paginatedPurchases,
  currentPage,
  setCurrentPage,
  totalPages,
  onView,
  onPDF
}: ComprasTableProps) {

  return (
    <Card data-slot="card">
      <CardHeader>
        <CardTitle data-slot="card-title" className="flex items-center gap-2">
          Lista de Compras ({purchasesCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proveedor</TableHead>
              <TableHead>Motocicleta</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No se encontraron compras.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPurchases.map(p => (
                <TableRow key={p.ID_Compra}>
                  <TableCell><p>{p.NombreEmpresa}</p></TableCell>
                  <TableCell><p>{p.Placa}</p></TableCell>
                  <TableCell><p>{format(new Date(p.FechaCompra), 'PPP', { locale: es })}</p></TableCell>
                  <TableCell><p>${parseFloat(p.Total).toLocaleString()}</p></TableCell>
                  <TableCell>{p.Estado}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => onView(p.ID_Compra)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Ver detalles</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => onPDF(p)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Generar PDF</p></TooltipContent>
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
