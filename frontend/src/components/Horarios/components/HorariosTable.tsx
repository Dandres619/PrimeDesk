import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Eye, Edit, Trash2, CalendarDays } from 'lucide-react';
import { Switch } from '../../ui/switch';

interface HorariosTableProps {
  schedulesCount: number;
  paginatedSchedules: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onView: (schedule: any) => void;
  onEdit: (schedule: any) => void;
  onDelete: (schedule: any) => void;
  onToggleEstado: (schedule: any) => void;
  getEnabledDays: (schedule: any) => string[];
}

export function HorariosTable({
  schedulesCount,
  paginatedSchedules,
  currentPage,
  setCurrentPage,
  totalPages,
  onView,
  onEdit,
  onDelete,
  onToggleEstado,
  getEnabledDays
}: HorariosTableProps) {
  
  return (
    <Card data-slot="card">
      <CardHeader>
        <CardTitle data-slot="card-title" className="text-left flex items-center gap-2">
          Horarios de Trabajo ({schedulesCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Mecánico</TableHead>
              <TableHead className="text-left">Días Laborales</TableHead>
              <TableHead className="text-left">Horarios</TableHead>
              <TableHead className="text-left">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSchedules.length > 0 ? paginatedSchedules.map((s) => {
              const enabledDays = getEnabledDays(s);
              return (
                <TableRow key={s.id}>
                  <TableCell className="text-left">
                    {s.mechanicName}
                  </TableCell>
                  <TableCell className="text-left">
                    {enabledDays.length} días laborales
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex flex-col space-y-1">
                      {enabledDays.slice(0, 2).map(day => {
                        const ds = s.daySchedules[day];
                        return (
                          <span key={day} className="text-xs text-muted-foreground">
                            <span className="font-medium text-slate-900 dark:text-slate-200">{day}:</span> {ds.startTime} - {ds.endTime}
                          </span>
                        );
                      })}
                      {enabledDays.length > 2 && <span className="text-xs text-muted-foreground">+{enabledDays.length - 2} más</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={s.status === 'Activo'}
                        onCheckedChange={() => onToggleEstado(s)}
                      />
                      <span className="text-sm">{s.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => onView(s)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
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
                            onClick={() => onEdit(s)}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            disabled={s.status !== 'Activo'}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Editar horario</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(s)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            disabled={s.status !== 'Activo'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Eliminar horario</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground text-left">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CalendarDays className="w-8 h-8 opacity-20" />
                    <p>No se encontraron horarios registrados.</p>
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
