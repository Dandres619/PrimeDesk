import React from 'react';
import { CalendarCheck, Loader2, Save, Clock, User as UserIcon, Bike, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  motos: any[];
  mechanics: any[];
  availableServices: any[];
  getAvailableSlots: (mecanicoId: number, fecha: string) => string[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AppointmentDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  motos,
  mechanics,
  availableServices,
  getAvailableSlots,
  isSubmitting,
  onSubmit
}: AppointmentDialogProps) {

  const availableSlots = getAvailableSlots(formData.mecanicoId, formData.fecha);

  const toggleService = (serviceId: number) => {
    setFormData((prev: any) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id: number) => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl animate-modal p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl">
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
              <CalendarCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Agendar Nuevo Servicio
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-500 mt-1">
                Fecha seleccionada: <span className="font-bold text-blue-600">{formData.fecha}</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="px-8 py-7 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Bike className="w-4 h-4 text-blue-600" />
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Selecciona tu Moto</Label>
              </div>
              <Select value={formData.motoId.toString()} onValueChange={(v) => setFormData({ ...formData, motoId: parseInt(v) })}>
                <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl">
                  <SelectValue placeholder="Elige una moto" />
                </SelectTrigger>
                <SelectContent>
                  {motos.map(m => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.marca} {m.modelo} ({m.placa})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <UserIcon className="w-4 h-4 text-blue-600" />
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Mecánico de Preferencia</Label>
              </div>
              <Select value={formData.mecanicoId.toString()} onValueChange={(v) => setFormData({ ...formData, mecanicoId: parseInt(v), startTime: '' })}>
                <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl">
                  <SelectValue placeholder="Elige un mecánico" />
                </SelectTrigger>
                <SelectContent>
                  {mechanics.map(m => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.nombre} {m.apellido}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.mecanicoId > 0 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Horarios Disponibles</Label>
              </div>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map(slot => (
                    <Button
                      key={slot}
                      type="button"
                      variant={formData.startTime === slot ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, startTime: slot })}
                      className={`h-10 text-xs font-bold rounded-lg transition-all ${formData.startTime === slot ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-none' : 'hover:border-blue-300 hover:bg-blue-50/50'}`}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-center">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">No hay turnos disponibles para este mecánico el día de hoy.</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Settings className="w-4 h-4 text-blue-600" />
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Servicios Requeridos</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableServices.map(srv => (
                <Badge
                  key={srv.id}
                  onClick={() => toggleService(srv.id)}
                  className={`px-4 py-2 cursor-pointer transition-all border-2 ${formData.serviceIds.includes(srv.id) ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 dark:shadow-none' : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-800 hover:border-blue-200'}`}
                >
                  {srv.nombre}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-xs font-bold uppercase tracking-widest text-slate-400">Notas Adicionales</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="¿Algún detalle que debamos saber?"
              className="min-h-[100px] bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl resize-none"
            />
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 h-11 font-bold text-slate-500">Cancelar</Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.startTime || formData.serviceIds.length === 0}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Confirmar Cita
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
