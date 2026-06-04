import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { CalendarClock, Loader2, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Label } from '../../ui/label';

// Hooks
import { useAptFormState } from '../hooks/useAptFormState';
import { useAptFormDerived } from '../hooks/useAptFormDerived';
import { useAptFormMutations } from '../hooks/useAptFormMutations';

// Components
import { AptClientMotoFields } from './AptClientMotoFields';
import { AptTimeMechanicFields } from './AptTimeMechanicFields';
import { AptServicesFields } from './AptServicesFields';

export function AptFormDialog({ apt, date, clients, motorcycles, mechanics, services, horarios, novedades = [], existingAppointments, onSave, onOpenChange }: any) {
  const {
    form, setForm, isSaving, setIsSaving, selectedSection, setSelectedSection,
    showErrors, setShowErrors, popovers, setPopovers, servicesSearch, setServicesSearch,
    search, setSearch
  } = useAptFormState(apt, date);

  const {
    filteredServices, durationData, totalPrice, availableMechanicsForTime,
    clientMotorcycles, filteredClients, selectedClient, selectedMoto, selectedMechanic,
    selectedMechanicSchedule, selectedTimeDisplay, hasSectionPassed, activeSlots
  } = useAptFormDerived({
    form, setForm, search, servicesSearch, services, mechanics, horarios, existingAppointments,
    apt, novedades, clients, motorcycles, selectedSection
  });

  const { handleSubmit, toggleService, handleCancel, format12h } = useAptFormMutations({
    form, setForm, setShowErrors, setIsSaving, onSave, selectedMechanicSchedule,
    selectedMechanic, durationData, apt, date, setSearch, onOpenChange
  });

  return (
    <DialogContent
      className={cn(
        "p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal",
        "max-w-2xl w-[95vw] bg-white dark:bg-slate-950"
      )}
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
            <CalendarClock className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {apt ? 'Editar Agendamiento' : 'Nuevo Agendamiento'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Agenda de servicio técnico</p>
          </div>
        </div>

        {selectedMechanicSchedule && durationData.endTime > selectedMechanicSchedule.salida && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/40 px-8 py-3 text-left flex items-center gap-2.5 shrink-0 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              El mecánico {selectedMechanic?.Nombre} {selectedMechanic?.Apellido} termina su turno a las {format12h(selectedMechanicSchedule.salida)} y este agendamiento finaliza a las {format12h(durationData.endTime)}. Elija otro mecánico o reduzca los servicios.
            </span>
          </div>
        )}

        <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-blue-500" /> Fecha
            </Label>
            <div className="w-full h-11 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white flex items-center shadow-sm">
              <span className="font-semibold capitalize">{form.date ? format(parseISO(form.date), 'EEEE, d MMMM yyyy', { locale: es }) : 'No seleccionada'}</span>
            </div>
          </div>

          <AptClientMotoFields
            form={form} setForm={setForm} popovers={popovers} setPopovers={setPopovers}
            showErrors={showErrors} search={search} setSearch={setSearch}
            filteredClients={filteredClients} selectedClient={selectedClient}
            clientMotorcycles={clientMotorcycles} selectedMoto={selectedMoto}
          />

          <AptTimeMechanicFields
            form={form} setForm={setForm} popovers={popovers} setPopovers={setPopovers}
            showErrors={showErrors} search={search} setSearch={setSearch}
            selectedSection={selectedSection} setSelectedSection={setSelectedSection}
            activeSlots={activeSlots} hasSectionPassed={hasSectionPassed}
            selectedTimeDisplay={selectedTimeDisplay} availableMechanicsForTime={availableMechanicsForTime}
            selectedMechanic={selectedMechanic}
          />

          <AptServicesFields
            form={form} setForm={setForm} showErrors={showErrors}
            servicesSearch={servicesSearch} setServicesSearch={setServicesSearch}
            apt={apt} services={services} filteredServices={filteredServices}
            toggleService={toggleService} durationData={durationData}
            totalPrice={totalPrice} format12h={format12h}
            selectedMechanicSchedule={selectedMechanicSchedule}
            selectedMechanic={selectedMechanic}
          />
        </div>

        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="h-12 px-10 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {apt ? 'Actualizar Agendamiento' : 'Crear Agendamiento'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
