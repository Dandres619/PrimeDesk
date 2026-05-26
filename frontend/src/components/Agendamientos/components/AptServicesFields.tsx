import { Label } from '../../ui/label';
import { Wrench, Search, MessageSquare } from 'lucide-react';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../../ui/tooltip';
import { Textarea } from '../../ui/textarea';
import { cn } from '@/lib/utils';

export function AptServicesFields({
  form, setForm, showErrors, servicesSearch, setServicesSearch, apt, services,
  filteredServices, toggleService, durationData, totalPrice, format12h
}: any) {
  return (
    <>
      {!apt && (
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-500" /> Servicios a realizar *
              {showErrors && form.serviceIds.length === 0 && <span className="text-[10px] text-red-500 font-bold">(Seleccione al menos uno)</span>}
            </Label>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {form.serviceIds.length > 0 && (
                <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800 shrink-0">
                  Duración: {durationData.text}
                </Badge>
              )}
              <div className="relative w-full sm:w-44">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar servicio..."
                  value={servicesSearch}
                  onChange={(e: any) => setServicesSearch(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>
          <TooltipProvider>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
              {filteredServices.map((s: any) => {
                const isSelected = form.serviceIds.includes(s.ID_Servicio);
                return (
                  <Tooltip key={s.ID_Servicio}>
                    <TooltipTrigger asChild>
                      <label
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer min-w-0",
                          isSelected
                            ? "bg-indigo-50 border-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-500 shadow-sm"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(s.ID_Servicio)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <div className="flex items-center justify-between gap-3 min-w-0 flex-1">
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={cn("font-bold text-sm truncate", isSelected ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-300")}>
                              {s.Nombre || s.nombre}
                            </span>
                            <span className={cn("text-[10px] font-semibold", isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500")}>
                              {s.Duracion || s.duracion} min
                            </span>
                          </div>
                          <span className={cn("text-xs font-black shrink-0", isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400")}>
                            ${Number(s.Precio || s.precio || 0).toLocaleString('es-CO')}
                          </span>
                        </div>
                      </label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{s.Nombre || s.nombre}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {filteredServices.length === 0 && (
                <p className="text-xs text-slate-500 col-span-2 text-center py-4">
                  {services.length === 0 ? "No hay servicios disponibles." : "No se encontraron servicios."}
                </p>
              )}
            </div>
          </TooltipProvider>

          {(form.serviceIds.length > 0 || form.startTime) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 mt-4">
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Duración Estimada</p>
                <p className="text-lg font-black text-slate-700 dark:text-slate-300 mt-1">
                  {form.serviceIds.length > 0 ? durationData.text : '0 min'}
                </p>
              </div>
              <div className="text-left border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/80 pt-3 sm:pt-0 sm:pl-4">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hora estimada de Finalización</p>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">
                  {form.startTime && durationData.endTime
                    ? format12h(durationData.endTime)
                    : 'Defina hora de inicio...'}
                </p>
              </div>
              <div className="text-left border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/80 pt-3 sm:pt-0 sm:pl-4">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Precio de los servicios</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ${totalPrice.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" /> Observaciones <span className="font-normal text-xs text-slate-400">(opcional)</span>
          </div>
          {form.notes.length > 80 && (
            <span className="text-[10px] text-red-500 font-bold animate-fadeIn">
              Máximo 80 caracteres
            </span>
          )}
        </Label>
        <Textarea
          value={form.notes}
          onChange={(e: any) => setForm({ ...form, notes: e.target.value })}
          placeholder="Detalles sobre el motivo del agendamiento..."
          className={cn(
            "min-h-[80px] rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-sm p-3 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none",
            form.notes.length > 80 && "border-red-500 ring-1 ring-red-500/20 bg-red-50/10"
          )}
        />
      </div>

      {!apt && (
        <div className="flex items-center gap-3 p-4 bg-blue-50/80 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 text-left">
            Al crear este agendamiento, el sistema abrirá automáticamente una <strong className="font-bold text-blue-900 dark:text-blue-100">Reparación</strong> en su módulo correspondiente.
          </p>
        </div>
      )}
    </>
  );
}
