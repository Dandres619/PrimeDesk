import React, { useState } from 'react';
import { Bike, Plus, Edit, History, Trash2, Search, Eye } from 'lucide-react';
import { PiMotorcycle } from 'react-icons/pi';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Input } from '../../ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { Dialog } from '../../ui/dialog';
import { MotosStyles } from '../styles/MotosStyles';
import { ViewMotoDialog } from './ViewMotoDialog';
import { format } from 'date-fns';

interface MotosSectionProps {
  motos: any[];
  isLoadingData?: boolean;
  handleCreateMoto: () => void;
  handleEditMoto: (moto: any) => void;
  fetchMotoHistory: (id: number) => void;
  handleDeleteMoto: (moto: any) => void;
  selectedMotoForHistory: number | null;
  setSelectedMotoForHistory: (id: number | null) => void;
  motoHistory: any[];
  isFetchingHistory: boolean;
  getMotoName: (id: number) => string;
  getEstadoBadge: (estado: string) => React.ReactNode;
}

export function MotosSection({
  motos,
  isLoadingData,
  handleCreateMoto,
  handleEditMoto,
  handleDeleteMoto,
  selectedMotoForHistory,
  setSelectedMotoForHistory,
  motoHistory,
  isFetchingHistory,
  getMotoName,
  getEstadoBadge
}: MotosSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingMoto, setViewingMoto] = useState<any>(null);

  if (isLoadingData) {
    return (
      <div className="motos-root">
        <MotosStyles />
        <div className="mp-loading">
          <div className="mp-loading-ring" />
          <p className="mp-loading-text">Cargando motocicletas...</p>
        </div>
      </div>
    );
  }

  const filteredMotos = motos.filter(moto =>
    moto.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moto.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moto.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="motos-root">
      <MotosStyles />

      <div className="motos-content-animate space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center transition-transform hover:scale-105">
              <PiMotorcycle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Mis Motocicletas</h1>
              <p className="text-sm text-muted-foreground">Administra tus vehículos registrados</p>
            </div>
          </div>
          <Button
            onClick={handleCreateMoto}
            className="motos-btn-primary whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Motocicleta
          </Button>
        </div>

        {/* Search */}
        <div className="flex justify-start">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mis motos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Lista de Motocicletas ({filteredMotos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Kilometraje</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMotos.length > 0 ? (
                    filteredMotos.map((moto) => (
                      <TableRow key={moto.id}>
                        <TableCell>
                          {moto.placa}
                        </TableCell>
                        <TableCell>{moto.marca}</TableCell>
                        <TableCell>{moto.modelo}</TableCell>
                        <TableCell>{moto.ano}</TableCell>
                        <TableCell>{(moto.kilometraje || 0).toLocaleString()} km</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setViewingMoto(moto)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
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
                                  onClick={() => handleEditMoto(moto)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Editar datos</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteMoto(moto)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Eliminar moto</p></TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2 py-4">
                          <Bike className="w-8 h-8 opacity-20" />
                          <p>{searchTerm ? 'No se encontraron motos con ese criterio' : 'No tienes motos registradas'}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {selectedMotoForHistory && (
              <Card className="mt-8 border-blue-100 dark:border-blue-900/30 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30">
                  <CardTitle className="flex items-center justify-between text-sm font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Historial de Servicios - {getMotoName(selectedMotoForHistory)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMotoForHistory(null)}
                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    >
                      ✕
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Diagnóstico / Observaciones</TableHead>
                          <TableHead>Mecánico</TableHead>
                          <TableHead className="text-right">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isFetchingHistory ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-12">
                              <div className="mp-loading-ring mx-auto" />
                            </TableCell>
                          </TableRow>
                        ) : motoHistory.length > 0 ? (
                          motoHistory.map((servicio: any) => (
                            <TableRow key={servicio.ID_Reparacion}>
                              <TableCell className="font-medium">{format(new Date(servicio.Fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
                              <TableCell className="max-w-xs truncate">{servicio.Observaciones || 'Sin observaciones'}</TableCell>
                              <TableCell>{servicio.Mecanico || 'Pendiente'}</TableCell>
                              <TableCell className="text-right">{getEstadoBadge(servicio.Estado)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No hay servicios registrados para esta moto
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!viewingMoto} onOpenChange={() => setViewingMoto(null)}>
        <ViewMotoDialog viewingMoto={viewingMoto} />
      </Dialog>
    </div>
  );
}
