import { Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';

interface ProveedoresTableProps {
  suppliersCount: number;
  paginatedSuppliers: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onToggleStatus: (supplier: any) => void;
  onView: (supplier: any) => void;
  onEdit: (supplier: any) => void;
  onDelete: (supplier: any) => void;
}

export function ProveedoresTable({
  suppliersCount,
  paginatedSuppliers,
  currentPage,
  setCurrentPage,
  totalPages,
  onToggleStatus,
  onView,
  onEdit,
  onDelete
}: ProveedoresTableProps) {
  
  const actions = [
    { label: 'Ver detalles', icon: Eye, onClick: (s: any) => onView(s), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { label: 'Editar proveedor', icon: Edit, onClick: (s: any) => onEdit(s), color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { label: 'Eliminar proveedor', icon: Trash2, onClick: (s: any) => onDelete(s), color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20' }
  ];

  return (
    <Card data-slot="card">
      <CardHeader>
        <CardTitle data-slot="card-title" className="flex items-center gap-2">
          Lista de Proveedores ({suppliersCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proveedor</TableHead>
              <TableHead>NIT</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No se encontraron proveedores.
                </TableCell>
              </TableRow>
            ) : (
              paginatedSuppliers.map(s => (
                <TableRow key={s.id}>
                  <TableCell><p className="font-medium">{s.name}</p></TableCell>
                  <TableCell><p>{s.taxId || "N/A"}</p></TableCell>
                  <TableCell><p>{s.contact}</p></TableCell>
                  <TableCell><p>{s.phone}</p></TableCell>
                  <TableCell><p>{s.specialty || "N/A"}</p></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={s.status === 'Activo'} onCheckedChange={() => onToggleStatus(s)} />
                      <span className="text-sm">{s.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {actions.map((a, i) => {
                        const isInactive = s.status !== 'Activo';
                        const isDisabled = isInactive && (a.label === 'Editar proveedor' || a.label === 'Eliminar proveedor');
                        return (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="ghost" onClick={() => a.onClick(s)} className={a.color} disabled={isDisabled}>
                                <a.icon className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{a.label}</p></TooltipContent>
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
