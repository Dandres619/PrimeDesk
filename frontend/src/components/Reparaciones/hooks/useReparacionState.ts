import { useState } from 'react';
import { format } from 'date-fns';

export function useReparacionState() {
  const [formData, setFormData] = useState({
    clientId: '',
    motorcycleId: '',
    selectedServices: [] as number[],
    observations: '',
    startTime: '',
    endTime: '',
    mechanicId: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const [popovers, setPopovers] = useState({
    client: false,
    motorcycle: false,
    startTime: false,
    mechanic: false,
    product: false,
    proveedor: false
  });

  const [search, setSearch] = useState({
    client: '',
    motorcycle: '',
    mechanic: '',
    product: '',
    proveedor: ''
  });

  const [servicesSearch, setServicesSearch] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [activeTab, setActiveTab] = useState<'servicios' | 'repuestos'>('servicios');
  const [isEditMode, setIsEditMode] = useState(false);

  // States for new Repuesto
  const [newRepuesto, setNewRepuesto] = useState({ id_producto: '', cantidad: '1', precio_unitario: '', observaciones: '', id_proveedor: '' });
  const [facturaFile, setFacturaFile] = useState<File | null>(null);
  const [isSubmittingRepuesto, setIsSubmittingRepuesto] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [touchedRepuesto, setTouchedRepuesto] = useState({ cantidad: false, precio_unitario: false, id_proveedor: false });

  // Modals state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: 'start' as 'start' | 'finish', title: '', description: '' });
  const [finalizeServiceDialog, setFinalizeServiceDialog] = useState({ open: false, serviceId: null as number | null, obs: '', serviceName: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; purchaseId: number | null }>({ open: false, purchaseId: null });
  const [finalizeRepairDialog, setFinalizeRepairDialog] = useState({ open: false, manoObra: '', observaciones: '', error: '' });

  const [selectedSection, setSelectedSection] = useState<'mañana' | 'tarde' | 'noche'>(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) return 'mañana';
    if (currentHour >= 12 && currentHour < 18) return 'tarde';
    return 'noche';
  });

  return {
    formData, setFormData,
    popovers, setPopovers,
    search, setSearch,
    servicesSearch, setServicesSearch,
    submitAttempted, setSubmitAttempted,
    activeTab, setActiveTab,
    isEditMode, setIsEditMode,
    newRepuesto, setNewRepuesto,
    facturaFile, setFacturaFile,
    isSubmittingRepuesto, setIsSubmittingRepuesto,
    loadingAction, setLoadingAction,
    touchedRepuesto, setTouchedRepuesto,
    confirmDialog, setConfirmDialog,
    finalizeServiceDialog, setFinalizeServiceDialog,
    deleteConfirm, setDeleteConfirm,
    finalizeRepairDialog, setFinalizeRepairDialog,
    selectedSection, setSelectedSection
  };
}
