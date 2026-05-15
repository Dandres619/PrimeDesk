import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, Clock, Loader2 } from 'lucide-react';
import { useHorarios, DAYS_OF_WEEK } from './hooks/useHorarios';
import { ScheduleDialog } from './components/ScheduleDialog';

export function Horarios() {
  const {
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    setIsDialogOpen,
    editingSchedule,
    setEditingSchedule,
    viewingSchedule,
    setViewingSchedule,
    currentPage,
    setCurrentPage,
    isLoading,
    schedules,
    employees,
    handleSave,
    handleToggleEstado,
    handleDelete,
    getEnabledDays
  } = useHorarios();

  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    title: '', 
    description: '', 
    confirmText: '', 
    variant: 'delete' as any, 
    onConfirm: () => { } 
  });

  const totalPages = Math.ceil(schedules.length / 10);
  const paginatedSchedules = schedules.slice((currentPage - 1) * 10, currentPage * 10);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Horarios</h2>
          <p className="text-muted-foreground">Gestiona los horarios de trabajo de los mecánicos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingSchedule(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSchedule(null)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 rounded-lg shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Horario
            </Button>
          </DialogTrigger>
          <ScheduleDialog schedule={editingSchedule} employees={employees} daysOfWeek={DAYS_OF_WEEK} onSave={handleSave} />
        </Dialog>
      </div>

      <div className="flex justify-start">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar horarios..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            Horarios de Trabajo ({schedules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mecánico</TableHead>
                <TableHead>Días Laborales</TableHead>
                <TableHead>Horarios</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No se encontraron horarios.
                  </TableCell>
                </TableRow>
              ) : paginatedSchedules.map(s => {
                const enabledDays = getEnabledDays(s);
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium">{s.mechanicName}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{enabledDays.length} días laborales</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {enabledDays.slice(0, 2).map(day => {
                          const ds = s.daySchedules[day];
                          return (
                            <p key={day} className="text-sm">
                              <span className="font-medium">{day}:</span> {ds.startTime} - {ds.endTime}
                            </p>
                          );
                        })}
                        {enabledDays.length > 2 && <p className="text-sm text-muted-foreground">+{enabledDays.length - 2} más</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={s.status === 'Activo'}
                          onCheckedChange={() => handleToggleEstado(s)}
                        />
                        <span className="text-sm">{s.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setViewingSchedule(s)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingSchedule(s); setIsDialogOpen(true); }} className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDialog({
                          open: true, 
                          title: 'Eliminar Horario', 
                          description: `¿Está seguro de que desea eliminar el horario de ${s.mechanicName}? Esta acción no se puede deshacer.`, 
                          confirmText: 'Eliminar', 
                          variant: 'delete', 
                          onConfirm: () => handleDelete(s)
                        })} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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

                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map(p => (
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
                    className={currentPage === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={!!viewingSchedule} onOpenChange={() => setViewingSchedule(null)}>
        <DialogContent className="max-w-2xl rounded-2xl overflow-hidden border-none p-0 bg-slate-50 dark:bg-slate-950">
          <DialogHeader className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              Detalles del Horario
            </DialogTitle>
          </DialogHeader>
          {viewingSchedule && (
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Mecánico</Label>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">{viewingSchedule.mechanicName}</p>
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Estado</Label>
                  <div className="mt-1">
                    <Badge className={viewingSchedule.status === 'Activo' ? 'bg-emerald-100 text-emerald-800 border-none' : 'bg-rose-100 text-rose-800 border-none'}>
                      {viewingSchedule.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-2">Configuración Semanal</Label>
                <div className="grid grid-cols-1 gap-3">
                  {DAYS_OF_WEEK.map(day => {
                    const ds = viewingSchedule.daySchedules[day];
                    if (!ds?.enabled) return null;
                    const start = new Date(`2024-01-01T${ds.startTime}:00`);
                    const end = new Date(`2024-01-01T${ds.endTime}:00`);
                    const hours = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
                    return (
                      <div key={day} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4">
                          <Badge className="bg-blue-100 text-blue-800 border-none px-3 py-1 font-bold">{day}</Badge>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">{ds.startTime} - {ds.endTime}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{hours} horas de jornada</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))} 
        title={confirmDialog.title} 
        description={confirmDialog.description} 
        confirmText={confirmDialog.confirmText} 
        variant={confirmDialog.variant} 
        onConfirm={confirmDialog.onConfirm} 
      />
    </div>
  );
}
