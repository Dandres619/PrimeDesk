import React from 'react';
import { Bike, Plus, Edit, History, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { format } from 'date-fns';

interface MotosSectionProps {
  motos: any[];
  setShowMotoModal: (show: boolean) => void;
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
  setShowMotoModal,
  handleEditMoto,
  fetchMotoHistory,
  handleDeleteMoto,
  selectedMotoForHistory,
  setSelectedMotoForHistory,
  motoHistory,
  isFetchingHistory,
  getMotoName,
  getEstadoBadge
}: MotosSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike className="w-5 h-5 text-blue-600" />
            Listado de Motocicletas
          </div>
          <Button
            onClick={() => setShowMotoModal(true)}
            className="bg-blue-600 hover:bg-blue-700 h-9"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Moto
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Kilometraje</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {motos.length > 0 ? (
              motos.map((moto) => (
                <TableRow key={moto.id}>
                  <TableCell>{moto.marca}</TableCell>
                  <TableCell>{moto.modelo}</TableCell>
                  <TableCell>{moto.placa}</TableCell>
                  <TableCell>{moto.ano}</TableCell>
                  <TableCell>{(moto.kilometraje || 0).toLocaleString()} km</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditMoto(moto)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => fetchMotoHistory(moto.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                        disabled={isFetchingHistory}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMoto(moto)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No tienes motos registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {selectedMotoForHistory && (
          <Card className="mt-6 border-blue-100 dark:border-blue-900/30 shadow-md">
            <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10">
              <CardTitle className="flex items-center justify-between text-sm font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Historial de Servicios - {getMotoName(selectedMotoForHistory)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMotoForHistory(null)}
                  className="h-7 text-[10px]"
                >
                  Cerrar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Diagnóstico</TableHead>
                      <TableHead>Mecánico</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isFetchingHistory ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                        </TableCell>
                      </TableRow>
                    ) : motoHistory.length > 0 ? (
                      motoHistory.map((servicio: any) => (
                        <TableRow key={servicio.ID_Reparacion}>
                          <TableCell>{format(new Date(servicio.Fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
                          <TableCell>{servicio.Observaciones || 'Sin observaciones'}</TableCell>
                          <TableCell>{servicio.Mecanico || 'Pendiente'}</TableCell>
                          <TableCell>{getEstadoBadge(servicio.Estado)}</TableCell>
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
  );
}
