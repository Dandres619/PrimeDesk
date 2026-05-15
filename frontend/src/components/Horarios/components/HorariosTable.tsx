import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Eye, Edit2, Trash2, CalendarDays } from 'lucide-react';
import { Switch } from '../../ui/switch';

interface HorariosTableProps {
  schedules: any[];
  onView: (schedule: any) => void;
  onEdit: (schedule: any) => void;
  onDelete: (schedule: any) => void;
  onToggleEstado: (schedule: any) => void;
  getEnabledDays: (schedule: any) => string[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function HorariosTable({
  schedules,
  onView,
  onEdit,
  onDelete,
  onToggleEstado,
  getEnabledDays,
  currentPage,
  onPageChange
}: HorariosTableProps) {
  const itemsPerPage = 10;
  const totalPages = Math.ceil(schedules.length / itemsPerPage) || 1;
  const paginatedData = schedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-left flex items-center gap-2">
          Horarios de Trabajo ({schedules.length})
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
            {paginatedData.length > 0 ? paginatedData.map((s) => {
              const enabledDays = getEnabledDays(s);
              return (
                <TableRow key={s.id}>
                  <TableCell className="text-left font-medium text-blue-600 dark:text-blue-400">
                    {s.mechanicName}
                  </TableCell>
                  <TableCell className="text-left font-medium">
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
                      {s.status === 'Activo' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">{s.status}</Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300">{s.status}</Badge>
                      )}
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
                          <Button size="sm" variant="ghost" onClick={() => onEdit(s)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Editar horario</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => onDelete(s)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
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

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      onClick={() => onPageChange(p)}
                      isActive={currentPage === p}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
