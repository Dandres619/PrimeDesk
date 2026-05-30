import { useRef } from 'react';
import { DialogContent } from '../../ui/dialog';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

// Subcomponents
import { NewRepairForm } from './NewRepairForm';
import { EditRepairCommandCenter } from './EditRepairCommandCenter';
import { ServiceFinalizeDialog } from './ServiceFinalizeDialog';
import { RepairFinalizeDialog } from './RepairFinalizeDialog';

// Hooks
import { useReparacionState } from '../hooks/useReparacionState';
import { useReparacionQueries } from '../hooks/useReparacionQueries';
import { useReparacionDerived } from '../hooks/useReparacionDerived';
import { useReparacionMutations } from '../hooks/useReparacionMutations';

interface ReparacionDialogProps {
  isOpen: boolean;
  clients: any[];
  motorcycles: any[];
  mechanics: any[];
  availableServices: any[];
  editingOrder: any;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  onOrderUpdated?: () => void;
}

export function ReparacionDialog({
  isOpen,
  clients,
  motorcycles,
  mechanics,
  availableServices,
  editingOrder,
  isSaving = false,
  onOpenChange,
  onSave,
  onOrderUpdated,
}: ReparacionDialogProps) {
  const token = localStorage.getItem('token');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Base State
  const state = useReparacionState();

  // 2. Data Queries
  const queries = useReparacionQueries(
    token,
    editingOrder,
    isOpen,
    state.setFormData,
    state.setIsEditMode,
    state.setPopovers,
    state.setSearch,
    state.setServicesSearch,
    state.setSubmitAttempted,
    state.setTouchedRepuesto,
    onOrderUpdated
  );

  // 3. Derived State & Calculations
  const derived = useReparacionDerived({
    formData: state.formData,
    setFormData: state.setFormData,
    search: state.search,
    servicesSearch: state.servicesSearch,
    clients,
    motorcycles,
    mechanics,
    availableServices,
    selectedSection: state.selectedSection,
    setSelectedSection: state.setSelectedSection,
    horarios: queries.horarios,
    existingAppointments: queries.existingAppointments,
    novedades: queries.novedades,
    products: queries.products,
    proveedores: queries.proveedores,
    localOrder: queries.localOrder,
    newRepuesto: state.newRepuesto
  });

  // 4. Mutations & Handlers
  const mutations = useReparacionMutations({
    token,
    localOrder: queries.localOrder,
    reloadLocalOrder: queries.reloadLocalOrder,
    onOpenChange,
    setLoadingAction: state.setLoadingAction,
    finalizeRepairDialog: state.finalizeRepairDialog,
    setFinalizeRepairDialog: state.setFinalizeRepairDialog,
    finalizeServiceDialog: state.finalizeServiceDialog,
    setFinalizeServiceDialog: state.setFinalizeServiceDialog,
    setActiveTab: state.setActiveTab,
    newRepuesto: state.newRepuesto,
    setNewRepuesto: state.setNewRepuesto,
    setIsSubmittingRepuesto: state.setIsSubmittingRepuesto,
    facturaFile: state.facturaFile,
    setFacturaFile: state.setFacturaFile,
    setTouchedRepuesto: state.setTouchedRepuesto,
    scrollContainerRef,
    products: queries.products,
    setFormData: state.setFormData,
    errors: derived.errors,
    editingOrder,
    setSubmitAttempted: state.setSubmitAttempted,
    onSave,
    formData: state.formData
  });

  return (
    <DialogContent
      className={cn(
        "p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal",
        state.isEditMode
          ? "sm:max-w-none w-[98vw] max-w-[1300px] h-[90vh] bg-white dark:bg-slate-950 transition-all duration-500"
          : "max-w-lg w-[95vw] max-h-[85vh] bg-white dark:bg-slate-950"
      )}
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <form onSubmit={mutations.handleSubmit} className="flex flex-col h-full max-h-[inherit] overflow-hidden w-full">
        {!state.isEditMode ? (
          <NewRepairForm
            formData={state.formData}
            setFormData={state.setFormData}
            popovers={state.popovers}
            setPopovers={state.setPopovers}
            search={state.search}
            setSearch={state.setSearch}
            servicesSearch={state.servicesSearch}
            setServicesSearch={state.setServicesSearch}
            submitAttempted={state.submitAttempted}
            errors={derived.errors}
            clients={clients}
            filteredClients={derived.filteredClients}
            selectedClient={derived.selectedClient}
            motorcycles={motorcycles}
            clientMotorcycles={derived.clientMotorcycles}
            selectedMoto={derived.selectedMoto}
            selectedSection={state.selectedSection}
            setSelectedSection={state.setSelectedSection}
            activeSlots={derived.activeSlots}
            availableMechanicsForTime={derived.availableMechanicsForTime}
            selectedMechanic={derived.selectedMechanic}
            selectedMechanicSchedule={derived.selectedMechanicSchedule}
            durationData={derived.durationData}
            totalPrice={derived.totalPrice}
            filteredServices={derived.filteredServices}
            handleServiceChange={mutations.handleServiceChange}
            onOpenChange={onOpenChange}
            isSaving={isSaving}
            selectedTimeDisplay={derived.selectedTimeDisplay}
            hasSectionPassed={derived.hasSectionPassed}
            availableServices={availableServices}
          />
        ) : (
          <EditRepairCommandCenter
            localOrder={queries.localOrder}
            activeTab={state.activeTab}
            setActiveTab={state.setActiveTab}
            loadingAction={state.loadingAction}
            availableServices={availableServices}
            products={queries.products}
            filteredProducts={derived.filteredProducts}
            proveedores={queries.proveedores}
            filteredProveedores={derived.filteredProveedores}
            newRepuesto={state.newRepuesto}
            setNewRepuesto={state.setNewRepuesto}
            touchedRepuesto={state.touchedRepuesto}
            setTouchedRepuesto={state.setTouchedRepuesto}
            repuestoErrors={derived.repuestoErrors}
            facturaFile={state.facturaFile}
            setFacturaFile={state.setFacturaFile}
            isSubmittingRepuesto={state.isSubmittingRepuesto}
            search={state.search}
            setSearch={state.setSearch}
            popovers={state.popovers}
            setPopovers={state.setPopovers}
            formattedFecha={derived.formattedFecha}
            formattedHora={derived.formattedHora}
            allServicesFinalized={derived.allServicesFinalized}
            isRepuestosLocked={derived.isRepuestosLocked}
            setFinalizeServiceDialog={state.setFinalizeServiceDialog}
            setDeleteConfirm={state.setDeleteConfirm}
            setFinalizeRepairDialog={state.setFinalizeRepairDialog}
            handleAddRepuesto={mutations.handleAddRepuesto}
            handleProductSelect={mutations.handleProductSelect}
            handleNumberKeyDown={mutations.handleNumberKeyDown}
            scrollContainerRef={scrollContainerRef}
            handleUpdateEstado={mutations.handleUpdateEstado}
            setConfirmDialog={state.setConfirmDialog}
          />
        )}
      </form>

      <ConfirmDialog
        open={state.confirmDialog.open}
        onOpenChange={(open) => state.setConfirmDialog((prev: any) => ({ ...prev, open }))}
        title={state.confirmDialog.title}
        description={state.confirmDialog.description}
        confirmText={state.confirmDialog.type === 'start' ? 'Iniciar' : 'Finalizar'}
        loadingText={state.confirmDialog.type === 'start' ? 'Iniciando...' : 'Finalizando...'}
        variant={state.confirmDialog.type === 'finish' ? 'default' : 'default'}
        onConfirm={async () => {
          if (state.confirmDialog.type === 'start') {
            await mutations.handleUpdateEstado('En reparación');
          } else if (state.confirmDialog.type === 'finish') {
            await mutations.handleUpdateEstado('Reparación finalizada');
          }
        }}
      />

      <ConfirmDialog
        open={state.deleteConfirm.open}
        onOpenChange={(open) => state.setDeleteConfirm((prev: any) => ({ ...prev, open }))}
        title="¿Eliminar repuesto?"
        description="¿Está seguro de eliminar este repuesto de la lista?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        loadingText="Eliminando..."
        variant="delete"
        onConfirm={async () => {
          if (state.deleteConfirm.purchaseId !== null) {
            await mutations.handleDeleteRepuesto(state.deleteConfirm.purchaseId);
          }
        }}
      />

      <ServiceFinalizeDialog
        open={state.finalizeServiceDialog.open}
        onOpenChange={(open) => state.setFinalizeServiceDialog((prev: any) => ({ ...prev, open }))}
        serviceName={state.finalizeServiceDialog.serviceName}
        obs={state.finalizeServiceDialog.obs}
        onObsChange={(val) => state.setFinalizeServiceDialog((prev: any) => ({ ...prev, obs: val }))}
        onConfirm={mutations.handleFinalizeService}
        loading={state.loadingAction !== null}
      />

      <RepairFinalizeDialog
        open={state.finalizeRepairDialog.open}
        onOpenChange={(open) => state.setFinalizeRepairDialog((prev: any) => ({ ...prev, open }))}
        manoObra={state.finalizeRepairDialog.manoObra}
        onManoObraChange={(val) => state.setFinalizeRepairDialog((prev: any) => ({ ...prev, manoObra: val }))}
        observaciones={state.finalizeRepairDialog.observaciones}
        onObservacionesChange={(val) => state.setFinalizeRepairDialog((prev: any) => ({ ...prev, observaciones: val }))}
        error={state.finalizeRepairDialog.error}
        onErrorChange={(val) => state.setFinalizeRepairDialog((prev: any) => ({ ...prev, error: val }))}
        loading={state.loadingAction !== null}
        onConfirm={mutations.handleFinalizeRepairConfirm}
        handleManoObraKeyDown={mutations.handleManoObraKeyDown}
      />
    </DialogContent>
  );
}
