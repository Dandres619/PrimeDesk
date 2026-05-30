import { Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';

interface RolesTableProps {
  roles: any[];
  paginatedRoles: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  toggleRoleStatus: (role: any) => void;
  setViewingRole: (role: any) => void;
  setIsViewDialogOpen: (open: boolean) => void;
  setEditingRole: (role: any) => void;
  setIsRoleDialogOpen: (open: boolean) => void;
  setConfirmDialog: (dialog: any) => void;
  handleDeleteRole: (id: number) => Promise<boolean>;
}

export function RolesTable({
  roles,
  paginatedRoles,
  currentPage,
  setCurrentPage,
  totalPages,
  toggleRoleStatus,
  setViewingRole,
  setIsViewDialogOpen,
  setEditingRole,
  setIsRoleDialogOpen,
  setConfirmDialog,
  handleDeleteRole
}: RolesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Lista de Roles ({roles.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rol</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRoles.length > 0 ? (
              paginatedRoles.map(r => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p>{r.name}</p>
                  </TableCell>
                  <TableCell>
                    {r.description && r.description.length > 45 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="cursor-help max-w-[300px] truncate">
                            {r.description.substring(0, 45).trim()}...
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px] break-words">
                          <p>{r.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <p>{r.description || 'Sin descripción'}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={r.status === 'Activo'} onCheckedChange={() => toggleRoleStatus(r)} />
                      <span className="text-sm">{r.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setViewingRole(r); setIsViewDialogOpen(true); }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
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
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditingRole(r); setIsRoleDialogOpen(true); }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            disabled={r.status === 'Inactivo'}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar rol</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDialog({
                              open: true,
                              title: 'Eliminar Rol',
                              description: '¿Está seguro de que desea eliminar este rol? Esta acción no se puede deshacer.',
                              confirmText: 'Eliminar',
                              variant: 'delete',
                              onConfirm: async () => {
                                const success = await handleDeleteRole(r.id);
                                if (success) {
                                  setConfirmDialog((prev: any) => ({ ...prev, open: false }));
                                }
                              }
                            })}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            disabled={r.status === 'Inactivo'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Eliminar rol</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No se encontraron roles.
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
