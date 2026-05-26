import { Label } from '../../ui/label';
import { Clock, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Button } from '../../ui/button';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function AptTimeMechanicFields({
  form, setForm, popovers, setPopovers, showErrors, search, setSearch,
  selectedSection, setSelectedSection, activeSlots, hasSectionPassed, selectedTimeDisplay,
  availableMechanicsForTime, selectedMechanic
}: any) {
  return (
    <>
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Clock className="w-4 h-4 text-blue-500" />
            Hora de Inicio *
            <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 italic ml-1">
              (Solo aparecen horarios disponibles según la disponibilidad de los mecánicos)
            </span>
          </div>
          {showErrors && !form.startTime && <span className="text-[10px] text-red-500 font-bold">Seleccione una hora</span>}
        </Label>

        <Popover open={popovers.startTime} onOpenChange={(open: boolean) => setPopovers({ ...popovers, startTime: open })}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between font-bold h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl transition-all",
                !form.startTime && "text-slate-500 font-medium",
                showErrors && !form.startTime && "border-red-500 ring-1 ring-red-500/20 bg-red-50/10"
              )}
            >
              <span className="truncate">
                {selectedTimeDisplay}
              </span>
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
              onWheel={(e: any) => e.stopPropagation()}
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
                activeSlots.map((slot: any) => {
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
                        form.startTime === slot && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                      )}
                      onClick={() => {
                        setForm({ ...form, startTime: slot, mechanicId: '' });
                        setPopovers({ ...popovers, startTime: false });
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", form.startTime === slot ? "opacity-100" : "opacity-0")} />
                      <span className="uppercase">{formattedSlot}</span>
                    </div>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> Mecánico Disponible *</div>
            {showErrors && !form.mechanicId && <span className="text-[10px] text-red-500 font-bold">Requerido</span>}
          </Label>
          {!form.startTime ? (
            <Button
              variant="outline"
              disabled
              className="w-full justify-between font-medium h-11 px-4 text-left bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-70"
            >
              <span className="truncate">Primero seleccione la hora de inicio...</span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-30 ml-2" />
            </Button>
          ) : availableMechanicsForTime.length > 0 ? (
            <Popover open={popovers.mechanic} onOpenChange={(open: boolean) => setPopovers({ ...popovers, mechanic: open })}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                    !form.mechanicId && "text-slate-500",
                    showErrors && !form.mechanicId && "border-red-500 ring-1 ring-red-500/20 bg-red-50/10"
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
                onCloseAutoFocus={(e: any) => e.preventDefault()}
              >
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                      placeholder="Buscar mecánico..."
                      value={search.mechanic}
                      onChange={(e: any) => setSearch({ ...search, mechanic: e.target.value })}
                    />
                  </div>
                </div>
                <div
                  className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar"
                  onWheel={(e: any) => e.stopPropagation()}
                >
                  {availableMechanicsForTime.map((m: any) => (
                    <div
                      key={m.ID_Empleado}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                        "hover:bg-slate-50 dark:hover:bg-slate-900",
                        form.mechanicId === m.ID_Empleado.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                      )}
                      onClick={() => {
                        setForm({ ...form, mechanicId: m.ID_Empleado.toString() });
                        setPopovers({ ...popovers, mechanic: false });
                        setSearch({ ...search, mechanic: '' });
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", form.mechanicId === m.ID_Empleado.toString() ? "opacity-100" : "opacity-0")} />
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
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
              <p className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                No hay ningún mecánico disponible a las {form.startTime} en esta fecha.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
