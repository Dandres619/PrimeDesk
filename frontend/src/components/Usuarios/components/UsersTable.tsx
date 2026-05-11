import { Eye, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';

interface UsersTableProps {
  usersCount: number;
  paginatedUsers: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  handleToggleEstado: (id: number) => void;
  setViewingUser: (user: any) => void;
  setIsViewDialogOpen: (open: boolean) => void;
  handleEdit: (user: any) => void;
}

export function UsersTable({
  usersCount,
  paginatedUsers,
  currentPage,
  setCurrentPage,
  totalPages,
  handleToggleEstado,
  setViewingUser,
  setIsViewDialogOpen,
  handleEdit
}: UsersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Usuarios ({usersCount})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Correo Electrónico</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map(u => (
                <TableRow key={u.ID_Usuario}>
                  <TableCell>
                    <p>{u.Correo}</p>
                  </TableCell>
                  <TableCell>
                    <p>{u.Nombre || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <p>{u.Apellido || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <p>{u.NombreRol}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={u.Estado === true || u.Estado === 1}
                        onCheckedChange={() => handleToggleEstado(u.ID_Usuario)}
                      />
                      <span className="text-sm">{(u.Estado === true || u.Estado === 1) ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => { setViewingUser(u); setIsViewDialogOpen(true); }} className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver detalles</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(u)}
                            className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            disabled={!(u.Estado === true || u.Estado === 1)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar usuario</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron usuarios.
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
                  <PaginationLink onClick={() => setCurrentPage(p)} isActive={currentPage === p} className="cursor-pointer">
                    {p}
                  </PaginationLink>
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
