import { Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';

interface EmployeesTableProps {
  employeesCount: number;
  paginatedEmployees: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  handleToggleEstado: (userId: number) => void;
  setViewingEmployee: (employee: any) => void;
  setIsViewDialogOpen: (open: boolean) => void;
  setEditingEmployee: (employee: any) => void;
  setIsDialogOpen: (open: boolean) => void;
  setConfirmDialog: (dialog: any) => void;
  deleteEmployee: (employee: any) => Promise<boolean>;
}

export function EmployeesTable({
  employeesCount,
  paginatedEmployees,
  currentPage,
  setCurrentPage,
  totalPages,
  handleToggleEstado,
  setViewingEmployee,
  setIsViewDialogOpen,
  setEditingEmployee,
  setIsDialogOpen,
  setConfirmDialog,
  deleteEmployee
}: EmployeesTableProps) {
  
  const actions = [
    { 
      label: 'Ver detalles', 
      icon: Eye, 
      onClick: (e: any) => { setViewingEmployee(e); setIsViewDialogOpen(true); }, 
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
    },
    { 
      label: 'Editar empleado', 
      icon: Edit, 
      onClick: (e: any) => { setEditingEmployee(e); setIsDialogOpen(true); }, 
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
    },
    { 
      label: 'Eliminar empleado', 
      icon: Trash2, 
      onClick: (e: any) => setConfirmDialog({ 
        open: true, 
        title: 'Eliminar Empleado', 
        description: '¿Está seguro de que desea eliminar este empleado? Esta acción no se puede deshacer.', 
        confirmText: 'Eliminar', 
        variant: 'delete', 
        onConfirm: () => deleteEmployee(e) 
      }), 
      color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20' 
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Lista de Empleados ({employeesCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Telefono</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No se encontraron empleados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map(e => (
                <TableRow key={e.ID_Empleado}>
                  <TableCell><p>{e.Nombre}</p></TableCell>
                  <TableCell><p>{e.Apellido}</p></TableCell>
                  <TableCell><p>{e.Correo}</p></TableCell>
                  <TableCell><p>{e.Telefono}</p></TableCell>
                  <TableCell><p>{e.Documento}</p></TableCell>
                  <TableCell><p>{e.NombreRol}</p></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={e.EstadoUsuario === true || e.EstadoUsuario === 1}
                        onCheckedChange={() => handleToggleEstado(e.ID_Usuario)}
                      />
                      <span className="text-sm">{(e.EstadoUsuario === true || e.EstadoUsuario === 1) ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {actions.map((a, i) => {
                        const isInactive = !(e.EstadoUsuario === true || e.EstadoUsuario === 1);
                        const isDisabled = isInactive && (a.label === 'Editar empleado' || a.label === 'Eliminar empleado');

                        return (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => a.onClick(e)}
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
