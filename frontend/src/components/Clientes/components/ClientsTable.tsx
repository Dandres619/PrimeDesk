import { Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';

interface ClientsTableProps {
  clientsCount: number;
  paginatedClients: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  handleToggleEstado: (userId: number) => void;
  setViewingClient: (client: any) => void;
  setIsViewDialogOpen: (open: boolean) => void;
  setEditingClient: (client: any) => void;
  setIsDialogOpen: (open: boolean) => void;
  setConfirmDialog: (dialog: any) => void;
  deleteClient: (client: any) => Promise<boolean>;
}

export function ClientsTable({
  clientsCount,
  paginatedClients,
  currentPage,
  setCurrentPage,
  totalPages,
  handleToggleEstado,
  setViewingClient,
  setIsViewDialogOpen,
  setEditingClient,
  setIsDialogOpen,
  setConfirmDialog,
  deleteClient
}: ClientsTableProps) {

  const actions = [
    { 
      label: 'Ver detalles', 
      icon: Eye, 
      onClick: (c: any) => { setViewingClient(c); setIsViewDialogOpen(true); }, 
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
    },
    { 
      label: 'Editar cliente', 
      icon: Edit, 
      onClick: (c: any) => { setEditingClient(c); setIsDialogOpen(true); }, 
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
    },
    { 
      label: 'Eliminar cliente', 
      icon: Trash2, 
      onClick: (c: any) => setConfirmDialog({ 
        open: true, 
        title: 'Eliminar Cliente', 
        description: '¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.', 
        confirmText: 'Eliminar', 
        variant: 'delete', 
        onConfirm: () => deleteClient(c) 
      }), 
      color: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20' 
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Lista de Clientes ({clientsCount})
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
              <TableHead>Motos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map(c => (
                <TableRow key={c.ID_Cliente}>
                  <TableCell><p>{c.Nombre}</p></TableCell>
                  <TableCell><p>{c.Apellido}</p></TableCell>
                  <TableCell><p>{c.Correo}</p></TableCell>
                  <TableCell><p>{c.Telefono}</p></TableCell>
                  <TableCell><p>{c.Documento}</p></TableCell>
                  <TableCell><p>{c.MotosCount} moto(s)</p></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={c.ID_Usuario === null || c.EstadoUsuario === true || c.EstadoUsuario === 1}
                        onCheckedChange={() => handleToggleEstado(c.ID_Usuario)}
                      />
                      <span className="text-sm">{(c.ID_Usuario === null || c.EstadoUsuario === true || c.EstadoUsuario === 1) ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {actions.map((a, i) => {
                        const isInactive = !(c.ID_Usuario === null || c.EstadoUsuario === true || c.EstadoUsuario === 1);
                        const isDisabled = isInactive && (a.label === 'Editar cliente' || a.label === 'Eliminar cliente');

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
