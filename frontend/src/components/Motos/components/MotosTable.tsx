import { Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';

interface MotosTableProps {
  paginatedMotos: any[];
  totalFilteredMotos: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  toggleStatus: (moto: any) => void;
  setViewingMoto: (moto: any) => void;
  setEditingMoto: (moto: any) => void;
  setIsDialogOpen: (open: boolean) => void;
  setConfirmDialog: (dialog: any) => void;
  deleteMoto: (moto: any) => void;
}

export function MotosTable({
  paginatedMotos,
  totalFilteredMotos,
  currentPage,
  setCurrentPage,
  totalPages,
  toggleStatus,
  setViewingMoto,
  setEditingMoto,
  setIsDialogOpen,
  setConfirmDialog,
  deleteMoto
}: MotosTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Lista de Motocicletas ({totalFilteredMotos})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMotos.length > 0 ? paginatedMotos.map(m => (
              <TableRow key={m.ID_Motocicleta}>
                <TableCell><p>{m.Placa}</p></TableCell>
                <TableCell><p>{m.Marca}</p></TableCell>
                <TableCell><p>{m.Modelo}</p></TableCell>
                <TableCell><p>{m.Anio}</p></TableCell>
                <TableCell><p>{m.NombreCliente} {m.ApellidoCliente}</p></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={m.Estado} onCheckedChange={() => toggleStatus(m)} />
                    <span>{m.Estado ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => setViewingMoto(m)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
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
                          onClick={() => { setEditingMoto(m); setIsDialogOpen(true); }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          disabled={!m.Estado}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Editar motocicleta</p></TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: 'Eliminar Motocicleta',
                            description: `¿Está seguro de que desea eliminar la motocicleta ${m.Placa}? Esta acción no se puede deshacer.`,
                            confirmText: 'Eliminar',
                            variant: 'delete',
                            onConfirm: () => deleteMoto(m)
                          })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          disabled={!m.Estado}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Eliminar motocicleta</p></TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No se encontraron motocicletas.
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
