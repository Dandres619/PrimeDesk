import React from 'react';
import { DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../../ui/tooltip';
import { Input } from '../../ui/input';
import { format, parseISO } from 'date-fns';
import { ClipboardPen, AlertCircle, User, Bike, ChevronsUpDown, Search, Check, Clock, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewRepairFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  popovers: any;
  setPopovers: React.Dispatch<React.SetStateAction<any>>;
  search: any;
  setSearch: React.Dispatch<React.SetStateAction<any>>;
  servicesSearch: string;
  setServicesSearch: (val: string) => void;
  submitAttempted: boolean;
  errors: Record<string, string>;
  clients: any[];
  filteredClients: any[];
  selectedClient: any;
  motorcycles: any[];
  clientMotorcycles: any[];
  selectedMoto: any;
  selectedSection: 'mañana' | 'tarde' | 'noche';
  setSelectedSection: (sec: 'mañana' | 'tarde' | 'noche') => void;
  activeSlots: string[];
  availableMechanicsForTime: any[];
  selectedMechanic: any;
  selectedMechanicSchedule: any;
  durationData: any;
  totalPrice: number;
  filteredServices: any[];
  availableServices: any[];
  handleServiceChange: (serviceId: number, checked: boolean) => void;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  selectedTimeDisplay: string;
  hasSectionPassed: boolean;
}

export function NewRepairForm({
  formData,
  setFormData,
  popovers,
  setPopovers,
  search,
  setSearch,
  servicesSearch,
  setServicesSearch,
  submitAttempted,
  errors,
  filteredClients,
  selectedClient,
  clientMotorcycles,
  selectedMoto,
  selectedSection,
  setSelectedSection,
  activeSlots,
  availableMechanicsForTime,
  selectedMechanic,
  selectedMechanicSchedule,
  durationData,
  totalPrice,
  filteredServices,
  availableServices,
  handleServiceChange,
  onOpenChange,
  isSaving,
  selectedTimeDisplay,
  hasSectionPassed,
}: NewRepairFormProps) {
  return (
    <>
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
          <ClipboardPen className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Registro de Reparación
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Nueva orden presencial</p>
        </div>
      </div>

      {selectedMechanicSchedule && durationData.endTime > selectedMechanicSchedule.salida && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/40 px-8 py-3 text-left flex items-center gap-2.5 shrink-0 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
            El turno del mecánico finaliza a las {format(parseISO(`${formData.date}T${selectedMechanicSchedule.salida}`), 'hh:mm a')}. La duración estimada de los servicios excede su jornada laboral (finalizaría a las {format(parseISO(`${formData.date}T${durationData.endTime}`), 'hh:mm a')}).
          </span>
        </div>
      )}

      <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
        <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-left flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
              Registro Presencial
            </p>
            <p className="text-[11px] font-medium text-blue-600/95 dark:text-blue-400/80 leading-relaxed">
              Esta reparación se creará únicamente para el día de hoy si el cliente acude sin agendamiento previo y hay mecánicos con disponibilidad. Si requiere programar para otra fecha, diríjase al módulo de <strong>Agendamientos</strong>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" /> Cliente Responsable *
            </Label>
            <Popover open={popovers.client} onOpenChange={(open) => setPopovers({ ...popovers, client: open })}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  type="button"
                  className={cn(
                    "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl transition-all",
                    !formData.clientId && "text-slate-500",
                    submitAttempted && errors.clientId && "border-red-500 dark:border-red-500 focus:ring-red-500/20 bg-red-50/10"
                  )}
                >
                  <span className="truncate">
                    {selectedClient ? `${selectedClient.Nombre} ${selectedClient.Apellido}` : "Seleccionar cliente..."}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
                align="start"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                      placeholder="Buscar cliente..."
                      value={search.client}
                      onChange={(e) => setSearch({ ...search, client: e.target.value })}
                    />
                  </div>
                </div>
                <div
                  className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {filteredClients.length === 0 ? (
                    <div className="py-6 px-2 text-center">
                      <p className="text-sm text-slate-500">No se encontraron clientes.</p>
                    </div>
                  ) : (
                    filteredClients.map((c: any) => (
                      <div
                        key={c.ID_Cliente}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                          "hover:bg-slate-50 dark:hover:bg-slate-900",
                          formData.clientId === c.ID_Cliente.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                        )}
                        onClick={() => {
                          setFormData({ ...formData, clientId: c.ID_Cliente.toString(), motorcycleId: '' });
                          setPopovers({ ...popovers, client: false });
                          setSearch({ ...search, client: '' });
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", formData.clientId === c.ID_Cliente.toString() ? "opacity-100" : "opacity-0")} />
                        <div className="flex flex-col text-left">
                          <span>{c.Nombre} {c.Apellido}</span>
                          <span className="text-[10px] opacity-60">CC: {c.Documento}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {submitAttempted && errors.clientId && (
              <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.clientId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Bike className="w-4 h-4 text-blue-500" /> Motocicleta (Placa) *
            </Label>
            <Popover open={popovers.motorcycle} onOpenChange={(open) => setPopovers({ ...popovers, motorcycle: open })}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  type="button"
                  className={cn(
                    "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl transition-all",
                    !formData.motorcycleId && "text-slate-500",
                    submitAttempted && errors.motorcycleId && "border-red-500 dark:border-red-500 focus:ring-red-500/20 bg-red-50/10"
                  )}
                  disabled={!formData.clientId}
                >
                  <span className="truncate">
                    {selectedMoto ? `${selectedMoto.Placa} — ${selectedMoto.Marca} ${selectedMoto.Modelo}` : "Seleccionar motocicleta..."}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
                align="start"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                      placeholder="Buscar placa o modelo..."
                      value={search.motorcycle}
                      onChange={(e) => setSearch({ ...search, motorcycle: e.target.value })}
                    />
                  </div>
                </div>
                <div
                  className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {clientMotorcycles.length === 0 ? (
                    <div className="py-6 px-2 text-center">
                      <p className="text-sm text-slate-500">No se encontraron motocicletas.</p>
                    </div>
                  ) : (
                    clientMotorcycles.map((m: any) => (
                      <div
                        key={m.ID_Motocicleta}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                          "hover:bg-slate-50 dark:hover:bg-slate-900",
                          formData.motorcycleId === m.ID_Motocicleta.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                        )}
                        onClick={() => {
                          setFormData({ ...formData, motorcycleId: m.ID_Motocicleta.toString() });
                          setPopovers({ ...popovers, motorcycle: false });
                          setSearch({ ...search, motorcycle: '' });
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", formData.motorcycleId === m.ID_Motocicleta.toString() ? "opacity-100" : "opacity-0")} />
                        <div className="flex flex-col text-left">
                          <span>{m.Placa}</span>
                          <span className="text-[10px] opacity-60">{m.Marca} {m.Modelo}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {submitAttempted && errors.motorcycleId && (
              <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.motorcycleId}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
          <div className="space-y-2 text-left">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Clock className="w-4 h-4 text-blue-500" />
                Hora de Inicio *
                <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 italic ml-1">
                  (Solo aparecen horarios disponibles según la disponibilidad de los mecánicos para hoy)
                </span>
              </div>
            </Label>
            <Popover open={popovers.startTime} onOpenChange={(open) => setPopovers({ ...popovers, startTime: open })}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  type="button"
                  className={cn(
                    "w-full justify-between font-bold h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl transition-all",
                    !formData.startTime && "text-slate-500 font-medium",
                    submitAttempted && errors.startTime && "border-red-500 dark:border-red-500 focus:ring-red-500/20 bg-red-50/10"
                  )}
                >
                  <span className="truncate">{selectedTimeDisplay}</span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto flex flex-col"
                align="start"
              >
                <div className="flex border-b border-slate-100 dark:border-slate-800 p-1 gap-1 bg-slate-50 dark:bg-slate-900 shrink-0">
                  {(['mañana', 'tarde', 'noche'] as const).map((section) => (
                    <button
                      key={section}
                      type="button"
                      className={cn(
                        "flex-1 py-1.5 px-3 text-xs font-black rounded-lg transition-all capitalize",
                        selectedSection === section
                          ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800/50"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      )}
                      onClick={() => setSelectedSection(section)}
                    >
                      {section}
                    </button>
                  ))}
                </div>
                <div
                  className="max-h-[200px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar flex-1"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {activeSlots.length === 0 ? (
                    <div className="py-6 px-4 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                        {hasSectionPassed ? (
                          `La jornada de la ${selectedSection === 'mañana' ? 'mañana' : selectedSection === 'tarde' ? 'tarde' : 'noche'} ya transcurrió para el día de hoy.`
                        ) : (
                          "No hay mecánicos disponibles para este horario."
                        )}
                      </p>
                    </div>
                  ) : (
                    activeSlots.map(slot => {
                      const [h, m] = slot.split(':');
                      const slotDate = new Date();
                      slotDate.setHours(parseInt(h), parseInt(m), 0);
                      const formattedSlot = format(slotDate, 'hh:mm a');

                      return (
                        <div
                          key={slot}
                          id={`time-slot-${slot}`}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                            "hover:bg-slate-50 dark:hover:bg-slate-900",
                            formData.startTime === slot && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                          )}
                          onClick={() => {
                            setFormData({ ...formData, startTime: slot, mechanicId: '' });
                            setPopovers({ ...popovers, startTime: false });
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", formData.startTime === slot ? "opacity-100" : "opacity-0")} />
                          <span className="uppercase">{formattedSlot}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {submitAttempted && errors.startTime && (
              <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.startTime}
              </p>
            )}
          </div>

          <div className="space-y-2 text-left">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" /> Mecánico Disponible *
            </Label>
            {!formData.startTime ? (
              <Button
                variant="outline"
                disabled
                type="button"
                className="w-full justify-between font-medium h-11 px-4 text-left bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-70"
              >
                <span className="truncate">Primero seleccione la hora de inicio...</span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-30 ml-2" />
              </Button>
            ) : availableMechanicsForTime.length > 0 ? (
              <Popover open={popovers.mechanic} onOpenChange={(open) => setPopovers({ ...popovers, mechanic: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    type="button"
                    className={cn(
                      "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl transition-all",
                      !formData.mechanicId && "text-slate-500",
                      submitAttempted && errors.mechanicId && "border-red-500 dark:border-red-500 focus:ring-red-500/20 bg-red-50/10"
                    )}
                  >
                    <span className="truncate">
                      {selectedMechanic ? `${selectedMechanic.Nombre} ${selectedMechanic.Apellido}` : "Seleccionar mecánico disponible..."}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
                  align="start"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input
                        className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                        placeholder="Buscar mecánico..."
                        value={search.mechanic}
                        onChange={(e) => setSearch({ ...search, mechanic: e.target.value })}
                      />
                    </div>
                  </div>
                  <div
                    className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {availableMechanicsForTime
                      .filter((m: any) => `${m.Nombre} ${m.Apellido}`.toLowerCase().includes(search.mechanic.toLowerCase()))
                      .map((m: any) => (
                        <div
                          key={m.ID_Empleado}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                            "hover:bg-slate-50 dark:hover:bg-slate-900",
                            formData.mechanicId === m.ID_Empleado.toString() && "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold"
                          )}
                          onClick={() => {
                            setFormData({ ...formData, mechanicId: m.ID_Empleado.toString() });
                            setPopovers({ ...popovers, mechanic: false });
                            setSearch({ ...search, mechanic: '' });
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", formData.mechanicId === m.ID_Empleado.toString() ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col text-left">
                            <span className="font-bold">{m.Nombre} {m.Apellido}</span>
                            <span className="text-[10px] opacity-60 font-black uppercase">CC: {m.Documento || 'S/N'}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                <p className="text-xs font-bold text-red-600 dark:text-red-400">
                  No hay mecánicos de turno disponibles en este horario.
                </p>
              </div>
            )}
            {submitAttempted && errors.mechanicId && (
              <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1 text-left">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.mechanicId}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" /> Servicios Requeridos
            </Label>
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar servicio..."
                value={servicesSearch}
                onChange={(e) => setServicesSearch(e.target.value)}
                className="pl-8 h-8 text-xs rounded-xl"
              />
            </div>
          </div>
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border max-h-48 overflow-y-auto custom-scrollbar transition-all",
              submitAttempted && errors.services ? "border-red-500 bg-red-50/5" : "border-slate-100 dark:border-slate-800"
            )}
          >
            <TooltipProvider>
              {filteredServices.map((s: any) => {
                const isSelected = formData.selectedServices.includes(s.ID_Servicio || s.id_servicio);
                return (
                  <Tooltip key={s.ID_Servicio || s.id_servicio}>
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
                          onChange={() => handleServiceChange(s.ID_Servicio || s.id_servicio, !isSelected)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <div className="flex items-center justify-between gap-3 min-w-0 flex-1">
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={cn("font-bold text-sm truncate", isSelected ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-300")}>
                              {s.Nombre}
                            </span>
                            <span className={cn("text-[10px] font-semibold mt-0.5", isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500")}>
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
                      <p>{s.Nombre}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
            {filteredServices.length === 0 && (
              <p className="text-xs text-slate-500 col-span-2 text-center py-4">
                {availableServices.length === 0 ? "No hay servicios disponibles." : "No se encontraron servicios."}
              </p>
            )}
          </div>
          {submitAttempted && errors.services && (
            <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.services}
            </p>
          )}
        </div>

        {/* REAL-TIME ESTIMATIONS & ALERTS */}
        {(formData.selectedServices.length > 0 || formData.startTime) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Duración Estimada</p>
              <p className="text-lg font-black text-slate-700 dark:text-slate-300 mt-1">
                {formData.selectedServices.length > 0 ? durationData.text : '0 min'}
              </p>
            </div>
            <div className="text-left border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/80 pt-3 sm:pt-0 sm:pl-4">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hora estimada de Finalización</p>
              <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">
                {formData.startTime && durationData.endTime
                  ? format(parseISO(`${formData.date}T${durationData.endTime}`), 'hh:mm a')
                  : 'Defina hora de inicio...'}
              </p>
            </div>
            <div className="text-left border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/80 pt-3 sm:pt-0 sm:pl-4">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Precio Total</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ${totalPrice.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Observaciones</Label>
          <Textarea
            value={formData.observations}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, observations: e.target.value }))}
            placeholder="Describa detalladamente el problema..."
            className={`min-h-[100px] rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border text-sm p-4 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-none ${(formData.observations || '').length > 80 ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-800'}`}
          />
          {(formData.observations || '').length > 80 && (
            <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Máximo 80 caracteres
            </p>
          )}
        </div>
      </div>

      <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setFormData({
              clientId: '',
              motorcycleId: '',
              selectedServices: [],
              observations: '',
              startTime: '',
              endTime: '',
              mechanicId: '',
              date: format(new Date(), 'yyyy-MM-dd')
            });
            setPopovers({ client: false, motorcycle: false, startTime: false, mechanic: false, product: false, proveedor: false });
            setSearch({ client: '', motorcycle: '', mechanic: '', product: '', proveedor: '' });
            onOpenChange(false);
          }}
          className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="h-12 px-12 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2 inline-block" /> : null}
          Crear Reparación
        </Button>
      </div>
    </>
  );
}
