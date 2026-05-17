import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { ClipboardPen, Check, User, Bike, AlertCircle, FileImage, Plus, Loader2, Info, Wrench, Search, ChevronsUpDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { format, parseISO } from 'date-fns';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

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
  onOrderUpdated?: () => void; // New prop to notify parent of changes
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
}: ReparacionDialogProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    motorcycleId: '',
    selectedServices: [] as number[],
    observations: '',
    nota_estado: '',
    startTime: '',
    mechanicId: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const [popovers, setPopovers] = useState({
    client: false,
    motorcycle: false,
    startTime: false,
    mechanic: false
  });

  const [search, setSearch] = useState({
    client: '',
    motorcycle: '',
    mechanic: ''
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const token = localStorage.getItem('token');
  const [horarios, setHorarios] = useState<any[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!editingOrder) {
      const fetchAgendas = async () => {
        try {
          const headers = { 'Authorization': `Bearer ${token}` };
          const [resHor, resAge] = await Promise.all([
            fetch(`${API_URL}/horarios`, { headers }),
            fetch(`${API_URL}/agendamientos`, { headers })
          ]);
          if (resHor.ok) {
            const dataHor = await resHor.json();
            setHorarios(dataHor);
          }
          if (resAge.ok) {
            const dataAge = await resAge.json();
            setExistingAppointments(dataAge.map((a: any) => ({
              id: a.ID_Agendamiento,
              date: a.Fecha || a.Dia,
              startTime: a.HoraInicio || a.Hora_inicio || a.horainicio || '',
              endTime: a.HoraFin || a.Hora_fin || a.horafin || '',
              clientId: a.ID_Cliente,
              motorcycleId: a.ID_Motocicleta,
              mechanicId: a.ID_Empleado
            })));
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchAgendas();
    }
  }, [editingOrder]);

  const filteredClients = clients.filter((c: any) =>
    `${c.Nombre} ${c.Apellido}`.toLowerCase().includes(search.client.toLowerCase()) ||
    c.Documento.toString().includes(search.client)
  );

  const clientMotorcycles = motorcycles.filter((m: any) =>
    (!formData.clientId || m.ID_Cliente === parseInt(formData.clientId)) &&
    (m.Placa.toLowerCase().includes(search.motorcycle.toLowerCase()) ||
      m.Marca.toLowerCase().includes(search.motorcycle.toLowerCase()) ||
      m.Modelo.toLowerCase().includes(search.motorcycle.toLowerCase()))
  );

  const selectedClient = clients.find((c: any) => c.ID_Cliente === parseInt(formData.clientId));
  const selectedMoto = motorcycles.find((m: any) => m.ID_Motocicleta === parseInt(formData.motorcycleId));

  const [selectedSection, setSelectedSection] = useState<'mañana' | 'tarde' | 'noche'>(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) return 'mañana';
    if (currentHour >= 12 && currentHour < 18) return 'tarde';
    return 'noche';
  });

  useEffect(() => {
    if (formData.startTime) {
      const hour = parseInt(formData.startTime.split(':')[0]);
      if (hour >= 6 && hour < 12) {
        setSelectedSection('mañana');
      } else if (hour >= 12 && hour < 18) {
        setSelectedSection('tarde');
      } else if (hour >= 18 && hour < 24) {
        setSelectedSection('noche');
      }
    }
  }, [formData.startTime]);

  const potentialStartTimes = useMemo(() => {
    const times: string[] = [];
    const startHour = 6;
    const endHour = 24;
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += 10) {
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return times;
  }, []);

  const durationData = useMemo(() => {
    if (formData.selectedServices.length === 0) return { minutes: 0, text: '0 min', endTime: formData.startTime };

    const servicesMinutes = formData.selectedServices.reduce((acc: number, id: number) => {
      const service = availableServices.find((s: any) => s.ID_Servicio === id || s.id_servicio === id);
      return acc + (service?.Duracion || service?.duracion || 0);
    }, 0);

    const hours = Math.floor(servicesMinutes / 60);
    const mins = servicesMinutes % 60;

    let text = '';
    if (hours > 0) text += `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    if (mins > 0) text += `${hours > 0 ? ' y ' : ''}${mins} min`;
    if (text === '') text = '0 min';

    let endTime = '';
    if (formData.startTime) {
      const [h, m] = formData.startTime.split(':').map(Number);
      const totalStartMins = h * 60 + m;
      const totalEndMins = totalStartMins + servicesMinutes;
      const endH = Math.floor(totalEndMins / 60) % 24;
      const endM = totalEndMins % 60;
      endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    }

    return { minutes: servicesMinutes, text, endTime };
  }, [formData.selectedServices, formData.startTime, availableServices]);

  useEffect(() => {
    if (durationData.endTime && durationData.endTime !== (formData as any).endTime) {
      setFormData(prev => ({ ...prev, endTime: durationData.endTime }));
    }
  }, [durationData.endTime]);

  const daysMap: Record<number, string> = {
    1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo'
  };

  const availableMechanicsForTime = useMemo(() => {
    if (!formData.date || !formData.startTime) return [];

    const selectedDate = parseISO(formData.date);
    const dayName = daysMap[selectedDate.getDay()];

    const addMinutesToTime = (timeStr: string, mins: number) => {
      if (!timeStr) return '';
      const [h, m] = timeStr.split(':').map(Number);
      const totalMins = h * 60 + m + mins;
      const endH = Math.floor(totalMins / 60) % 24;
      const endM = totalMins % 60;
      return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    };

    return mechanics.filter((mech: any) => {
      const hasSchedule = horarios.some((h: any) => {
        const entrada = (h.HoraEntrada || h.Hora_entrada || '00:00').slice(0, 5);
        const salida = (h.HoraSalida || h.Hora_salida || '23:59').slice(0, 5);
        return (
          h.ID_Empleado === mech.ID_Empleado &&
          h.Dia === dayName &&
          h.Estado &&
          formData.startTime >= entrada &&
          formData.startTime < salida
        );
      });

      if (!hasSchedule) return false;

      const isBusy = existingAppointments.some((a: any) => {
        if (a.mechanicId !== mech.ID_Empleado || a.date !== formData.date) return false;

        const existStart = (a.startTime || '').slice(0, 5);
        const existEndBase = (a.endTime || '').slice(0, 5);
        const existBlockedUntil = addMinutesToTime(existEndBase, 20);

        const newStart = formData.startTime;
        const newBlockedUntil = addMinutesToTime(formData.startTime, durationData.minutes + 20);

        return newStart < existBlockedUntil && existStart < newBlockedUntil;
      });

      return !isBusy;
    });
  }, [formData.date, formData.startTime, mechanics, horarios, existingAppointments, durationData.minutes]);

  const selectedMechanic = mechanics.find((m: any) => m.ID_Empleado === parseInt(formData.mechanicId));

  const selectedMechanicSchedule = useMemo(() => {
    if (!formData.mechanicId || !formData.date) return null;
    const selectedDate = parseISO(formData.date);
    const dayName = daysMap[selectedDate.getDay()];
    const schedule = horarios.find((h: any) =>
      h.ID_Empleado === parseInt(formData.mechanicId) &&
      h.Dia === dayName &&
      h.Estado
    );
    if (!schedule) return null;
    return {
      entrada: (schedule.HoraEntrada || schedule.Hora_entrada || '00:00').slice(0, 5),
      salida: (schedule.HoraSalida || schedule.Hora_salida || '23:59').slice(0, 5)
    };
  }, [formData.mechanicId, formData.date, horarios]);

  const selectedTimeDisplay = useMemo(() => {
    if (!formData.startTime) return 'Seleccionar hora de inicio...';
    const [h, m] = formData.startTime.split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m), 0);
    return format(d, 'hh:mm a');
  }, [formData.startTime]);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!formData.clientId) errs.clientId = 'El cliente responsable es obligatorio.';
    if (!formData.motorcycleId) errs.motorcycleId = 'El vehículo es obligatorio.';
    if (!formData.startTime) errs.startTime = 'La hora de inicio es obligatoria.';

    if (!formData.mechanicId) {
      errs.mechanicId = 'El mecánico disponible es obligatorio.';
    } else if (selectedMechanicSchedule && durationData.endTime) {
      if (durationData.endTime > selectedMechanicSchedule.salida) {
        errs.scheduleExceeded = 'La duración estimada excede la jornada del mecánico.';
      }
    }

    if (formData.selectedServices.length === 0) {
      errs.services = 'Debe seleccionar al menos un servicio requerido.';
    }
    return errs;
  }, [formData, selectedMechanicSchedule, durationData.endTime]);

  const [activeTab, setActiveTab] = useState<'servicios' | 'repuestos'>('servicios');
  const [localOrder, setLocalOrder] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // States for new Repuesto
  const [newRepuesto, setNewRepuesto] = useState({ id_producto: '', cantidad: 1, precio_unitario: '', observaciones: '' });
  const [facturaFile, setFacturaFile] = useState<File | null>(null);
  const [isSubmittingRepuesto, setIsSubmittingRepuesto] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Modals state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: 'start' as 'start' | 'finish', title: '', description: '' });
  const [finalizeServiceDialog, setFinalizeServiceDialog] = useState({ open: false, serviceId: null as number | null, obs: '', serviceName: '' });

  useEffect(() => {
    setPopovers({ client: false, motorcycle: false, startTime: false, mechanic: false });
    setSearch({ client: '', motorcycle: '', mechanic: '' });
    setSubmitAttempted(false);

    if (!isOpen) {
      // Delay resetting to prevent visual layout jumps/resizes during the exit animation!
      const timer = setTimeout(() => {
        setIsEditMode(false);
        setLocalOrder(null);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      if (editingOrder) {
        setIsEditMode(true);
        setLocalOrder(editingOrder);
        setFormData({
          clientId: editingOrder.ID_Cliente?.toString() || '',
          motorcycleId: editingOrder.ID_Motocicleta?.toString() || '',
          selectedServices: editingOrder.servicios?.map((s: any) => s.ID_Servicio) || [],
          observations: editingOrder.Observaciones || '',
          nota_estado: editingOrder.NotaEstado || '',
          startTime: '',
          mechanicId: '',
          date: format(new Date(), 'yyyy-MM-dd')
        });
        fetchProducts();
      } else {
        setIsEditMode(false);
        setLocalOrder(null);
        setFormData({
          clientId: '',
          motorcycleId: '',
          selectedServices: [],
          observations: '',
          nota_estado: '',
          startTime: '',
          mechanicId: '',
          date: format(new Date(), 'yyyy-MM-dd')
        });
      }
    }
  }, [isOpen, editingOrder]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/productos`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setProducts(data);
    } catch (e) { }
  };

  const reloadLocalOrder = async () => {
    if (!localOrder) return;
    try {
      const res = await fetch(`${API_URL}/reparaciones/${localOrder.id || localOrder.ID_Reparacion}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLocalOrder({ ...localOrder, ...data });
      return { ...localOrder, ...data };
    } catch (e) {
      return null;
    }
  };

  const handleUpdateEstado = async (nuevoEstado: string) => {
    if (!localOrder || localOrder.Estado === nuevoEstado) return;
    setLoadingAction(`estado-${nuevoEstado}`);
    try {
      const res = await fetch(`${API_URL}/reparaciones/${localOrder.id || localOrder.ID_Reparacion}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      toast.success(`Estado actualizado a: ${nuevoEstado}`);
      await reloadLocalOrder();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFinalizeService = async () => {
    if (!localOrder || !finalizeServiceDialog.serviceId) return;
    const sId = finalizeServiceDialog.serviceId;
    setLoadingAction(`servicio-${sId}`);
    try {
      const res = await fetch(`${API_URL}/reparaciones/${localOrder.id || localOrder.ID_Reparacion}/servicios/${sId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: 'Finalizado', observaciones: finalizeServiceDialog.obs })
      });
      if (!res.ok) throw new Error('Error al finalizar servicio');
      toast.success('Servicio finalizado');

      const newOrderData = await reloadLocalOrder();
      setFinalizeServiceDialog({ open: false, serviceId: null, obs: '', serviceName: '' });

      // Check if all services are now finalized using the fresh data
      if (newOrderData?.servicios?.every((s: any) => s.Estado === 'Finalizado')) {
        toast.info('Todos los servicios finalizados. Puede proceder a registrar repuestos si es necesario.');
        setActiveTab('repuestos');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAddRepuesto = async () => {
    if (!localOrder || !newRepuesto.id_producto || !newRepuesto.cantidad || !newRepuesto.precio_unitario) {
      return toast.error('Complete los campos obligatorios del repuesto.');
    }
    setIsSubmittingRepuesto(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('id_producto', newRepuesto.id_producto);
      formDataObj.append('cantidad', newRepuesto.cantidad.toString());
      formDataObj.append('precio_unitario', newRepuesto.precio_unitario.toString());
      formDataObj.append('observaciones', newRepuesto.observaciones);
      if (facturaFile) {
        formDataObj.append('facturaFile', facturaFile);
      }

      const res = await fetch(`${API_URL}/reparaciones/${localOrder.id || localOrder.ID_Reparacion}/compras`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataObj
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al registrar repuesto');
      }

      toast.success('Repuesto/Insumo agregado a la reparación.');
      setNewRepuesto({ id_producto: '', cantidad: 1, precio_unitario: '', observaciones: '' });
      setFacturaFile(null);
      await reloadLocalOrder();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmittingRepuesto(false);
    }
  };

  const handleProductSelect = (idStr: string) => {
    const prod = products.find(p => p.ID_Producto.toString() === idStr);
    if (prod) {
      // Assuming a suggested price is needed, we could use a field from product if available. Just leave blank for user to input
      setNewRepuesto({ ...newRepuesto, id_producto: idStr, precio_unitario: prod.Precio || '' });
    } else {
      setNewRepuesto({ ...newRepuesto, id_producto: idStr });
    }
  };

  const handleServiceChange = (serviceId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: checked
        ? [...prev.selectedServices, serviceId]
        : prev.selectedServices.filter(s => s !== serviceId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingOrder) {
      setSubmitAttempted(true);
      const currentErrors = { ...errors };

      if (currentErrors.scheduleExceeded) {
        toast.error('La duración de los servicios excede la jornada laboral del mecánico.');
        return;
      }

      if (Object.keys(currentErrors).length > 0) {
        toast.error('Por favor, complete todos los campos obligatorios del registro.');
        return;
      }
    }

    onSave(formData);
  };

  return (
    <DialogContent
      className={cn(
        "p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal",
        isEditMode
          ? "sm:max-w-none w-[98vw] max-w-[1300px] h-[90vh] bg-white dark:bg-slate-950 transition-all duration-500"
          : "max-w-lg w-[95vw] max-h-[85vh] bg-white dark:bg-slate-950"
      )}
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[inherit] overflow-hidden w-full">

        {/* LAYOUT PARA NUEVA REPARACIÓN (ESTÁNDAR PRIME DESK) */}
        {!isEditMode ? (
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

            <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left">
              <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-left flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                    Registro Rápido Presencial (Solo Hoy)
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
                    <Bike className="w-4 h-4 text-blue-500" /> Vehículo (Placa) *
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
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" /> Hora de Inicio *
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
                        {potentialStartTimes
                          .filter(slot => {
                            const hour = parseInt(slot.split(':')[0]);
                            if (selectedSection === 'mañana') return hour >= 6 && hour < 12;
                            if (selectedSection === 'tarde') return hour >= 12 && hour < 18;
                            return hour >= 18 && hour < 24;
                          })
                          .map(slot => {
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
                          })}
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
                                  formData.mechanicId === m.ID_Empleado.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
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
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" /> Servicios Requeridos
                </Label>
                <div
                  className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border max-h-48 overflow-y-auto custom-scrollbar transition-all",
                    submitAttempted && errors.services ? "border-red-500 bg-red-50/5" : "border-slate-100 dark:border-slate-800"
                  )}
                >
                  {availableServices.map((s: any) => {
                    const isSelected = formData.selectedServices.includes(s.ID_Servicio || s.id_servicio);
                    return (
                      <label
                        key={s.ID_Servicio || s.id_servicio}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
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
                        <div className="flex flex-col min-w-0 flex-1 text-left">
                          <span className={cn("font-bold text-sm truncate", isSelected ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-300")}>
                            {s.Nombre}
                          </span>
                          <span className={cn("text-[10px] font-semibold mt-0.5", isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500")}>
                            {s.Duracion || s.duracion} min
                          </span>
                        </div>
                      </label>
                    );
                  })}
                  {availableServices.length === 0 && <p className="text-xs text-slate-500 col-span-2">No hay servicios disponibles.</p>}
                </div>
                {submitAttempted && errors.services && (
                  <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.services}
                  </p>
                )}
              </div>

              {/* REAL-TIME ESTIMATIONS & ALERTS */}
              {(formData.selectedServices.length > 0 || formData.startTime) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Duración Estimada</p>
                    <p className="text-lg font-black text-slate-700 dark:text-slate-300 mt-1">{durationData.text}</p>
                  </div>
                  <div className="text-left border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/80 pt-3 sm:pt-0 sm:pl-6">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hora Estimada de finalización</p>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">
                      {formData.startTime && durationData.endTime
                        ? format(parseISO(`${formData.date}T${durationData.endTime}`), 'hh:mm a')
                        : 'Defina la hora de inicio...'}
                    </p>
                  </div>
                </div>
              )}

              {selectedMechanicSchedule && durationData.endTime > selectedMechanicSchedule.salida && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-left">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    ⚠️ Atención: El turno del mecánico finaliza a las {format(parseISO(`${formData.date}T${selectedMechanicSchedule.salida}`), 'hh:mm a')}. La duración estimada de los servicios excede su jornada laboral (finalizaría a las {format(parseISO(`${formData.date}T${durationData.endTime}`), 'hh:mm a')}).
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Observaciones</Label>
                <Textarea
                  value={formData.observations}
                  onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Describa detalladamente el problema..."
                  className="min-h-[100px] rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-sm p-4 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-none"
                />
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
                    nota_estado: '',
                    startTime: '',
                    mechanicId: '',
                    date: format(new Date(), 'yyyy-MM-dd')
                  });
                  setPopovers({ client: false, motorcycle: false, startTime: false, mechanic: false });
                  setSearch({ client: '', motorcycle: '', mechanic: '' });
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
        ) : (

          /* LAYOUT PARA EDITAR REPARACIÓN (COMMAND CENTER) */
          <>
            {/* TOP BAR - Información de Alto Nivel */}
            <div className="shrink-0 px-10 py-6 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(37,99,235,0.4)]">
                  <Wrench className="w-7 h-7 text-blue-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-black text-white tracking-tight leading-none uppercase">
                    Reparación #{localOrder?.id || localOrder?.ID_Reparacion || editingOrder?.id}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                      Motocicleta: {localOrder?.motorcyclePlate || localOrder?.Placa} • Cliente: {localOrder?.clientName || localOrder?.cliente_nombre || localOrder?.NombreCliente}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right mr-6 border-r border-slate-800 pr-8">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inversión Repuestos</p>
                  <p className="text-2xl font-black text-blue-500 tracking-tighter">
                    ${localOrder?.compras?.reduce((acc: number, cur: any) => acc + Number(cur.Subtotal || 0), 0).toLocaleString() || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* SIDEBAR IZQUIERDO */}
              <div className="w-[380px] shrink-0 bg-slate-950 p-8 border-r border-slate-900 overflow-y-auto custom-scrollbar flex flex-col gap-10">
                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estado de la Reparación</Label>
                  <div className="relative space-y-4">
                    {['Esperando motocicleta', 'En reparación', 'Reparación finalizada'].map((estado, idx) => {
                      const currentEstado = localOrder?.Estado || localOrder?.estadoBase || 'Esperando motocicleta';
                      const isActive = currentEstado === estado;
                      const isPast = ['Esperando motocicleta', 'En reparación', 'Reparación finalizada'].indexOf(currentEstado) > idx;
                      return (
                        <div key={estado} className="flex items-start gap-4 group text-left">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10",
                              isActive ? "bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" : isPast ? "bg-slate-800 border-blue-500" : "border-slate-800 bg-slate-900"
                            )}>
                              {loadingAction === `estado-${estado}` ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : (isActive || isPast) && <Check className={cn("w-4 h-4", isActive ? "text-white" : "text-blue-500")} />}
                            </div>
                            {idx < 2 && <div className={cn("w-1 h-14 -mt-2 -mb-2", isPast ? "bg-blue-900/50" : "bg-slate-900")} />}
                          </div>
                          <div className="text-left pt-1.5">
                            <p className={cn("text-sm font-black uppercase tracking-widest transition-colors", isActive ? "text-blue-400" : isPast ? "text-slate-400" : "text-slate-600 group-hover:text-slate-500")}>
                              {estado}
                            </p>
                            {isActive && <span className="text-[10px] font-bold text-slate-500 block mt-1">ESTADO ACTUAL</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Datos Técnicos</Label>
                  <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Motocicleta</p>
                      <p className="text-xs font-bold text-slate-400 truncate max-w-[150px]">{localOrder?.motorcycleBrand || localOrder?.Marca} {localOrder?.motorcycleModel || localOrder?.Modelo || '---'} • {localOrder?.motorcyclePlate || localOrder?.Placa || '---'}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Cliente</p>
                      <p className="text-xs font-bold text-slate-400 truncate max-w-[150px]">{localOrder?.clientName || localOrder?.NombreCliente || localOrder?.cliente_nombre || '---'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase text-slate-600">Observaciones Globales</Label>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl min-h-[100px] text-xs text-slate-400">
                      {localOrder?.Observaciones || localOrder?.observations || 'Sin observaciones...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* MAIN WORKSPACE */}
              <div className="flex-1 flex flex-col bg-slate-900/20 overflow-hidden">
                <div className="shrink-0 flex px-10 gap-10 border-b border-slate-800 bg-slate-950/40">
                  {['servicios', 'repuestos'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab as any)}
                      className={cn(
                        "h-16 border-b-2 text-[11px] font-black uppercase tracking-[0.25em] transition-all relative",
                        activeTab === tab ? "border-blue-600 text-blue-500" : "border-transparent text-slate-600 hover:text-slate-400"
                      )}
                    >
                      {tab === 'servicios' ? 'Servicios' : 'Compras de Repuestos'}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar text-left relative">
                  {activeTab === 'servicios' ? (() => {
                    const currentEstado = localOrder?.Estado || localOrder?.estadoBase || 'Esperando motocicleta';

                    if (currentEstado === 'Esperando motocicleta') {
                      return (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 h-full">
                          <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
                            <Bike className="w-10 h-10 text-blue-500" />
                          </div>
                          <div className="max-w-sm space-y-2">
                            <h3 className="text-xl font-black text-white tracking-tight">Esperando ingreso</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                              Cuando la motocicleta ingrese al taller, presione el botón <strong className="text-slate-300">"Iniciar reparación"</strong> para comenzar.
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => setConfirmDialog({ open: true, type: 'start', title: 'Iniciar reparación', description: '¿Está seguro de iniciar la reparación? Esta acción no se puede deshacer y cambiará el estado a En reparación.' })}
                            className="h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                          >
                            Iniciar reparación
                          </Button>
                        </div>
                      );
                    }

                    return (
                      <div className="max-w-4xl mx-auto space-y-4">
                        {localOrder?.servicios?.map((s: any) => (
                          <div key={s.ID_Servicio} className="bg-slate-950 border border-slate-800 rounded-[1.2rem] overflow-hidden group hover:border-blue-500/40 transition-all text-left">
                            <div className="p-6 flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border border-slate-800", s.Estado === 'Finalizado' ? "bg-green-600/20 text-green-500" : "bg-slate-900 text-slate-600")}>
                                  <Check className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                  <h4 className="text-base font-black text-white tracking-tight uppercase">{s.NombreServicio || s.Nombre}</h4>
                                  <p className="text-[9px] font-black text-slate-500 uppercase mt-1">{s.Estado || 'PENDIENTE'}</p>
                                </div>
                              </div>
                              {s.Estado !== 'Finalizado' && currentEstado === 'En reparación' && (
                                <Button
                                  type="button"
                                  onClick={() => setFinalizeServiceDialog({ open: true, serviceId: s.ID_Servicio, obs: '', serviceName: s.NombreServicio || s.Nombre })}
                                  disabled={loadingAction === `servicio-${s.ID_Servicio}`}
                                  size="sm"
                                  variant="outline"
                                  className="rounded-lg h-10 border-slate-800 font-black text-[10px] uppercase text-blue-400 hover:text-blue-300 hover:bg-slate-900"
                                >
                                  {loadingAction === `servicio-${s.ID_Servicio}` ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalizar servicio'}
                                </Button>
                              )}
                            </div>
                            {s.Observaciones && s.Estado === 'Finalizado' && (
                              <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/30">
                                <p className="text-xs font-medium text-slate-400"><span className="font-bold text-slate-500 mr-2">OBSERVACIÓN:</span>{s.Observaciones}</p>
                              </div>
                            )}
                          </div>
                        ))}

                        {currentEstado === 'En reparación' && (
                          <div className="mt-10 p-6 rounded-2xl border border-blue-500/10 bg-blue-500/5 text-center flex items-center justify-center gap-4">
                            <Info className="w-5 h-5 text-blue-500 shrink-0" />
                            <p className="text-xs font-bold text-blue-400/80 leading-relaxed text-left">
                              Cuando todos los servicios estén finalizados y las compras de repuestos estén registradas, <br />podrá pasar a "Reparación finalizada" desde la sección de Compras.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })() : (() => {
                    return (
                      <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-10">
                        {/* Lista de Repuestos Actuales */}
                        <div className="xl:col-span-2 space-y-6">
                          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                            Repuestos Utilizados <Badge className="bg-slate-800 text-slate-400 border-none">{localOrder?.compras?.length || 0}</Badge>
                          </h3>
                          <div className="space-y-4">
                            {localOrder?.compras?.length > 0 ? localOrder.compras.map((compra: any) => (
                              <div key={compra.ID_Reparacion_Compra} className="bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 flex flex-col sm:flex-row gap-6">
                                <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                                  <Wrench className="w-8 h-8 text-slate-600" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="text-base font-black text-white">{compra.NombreProducto || 'Producto ID ' + compra.ID_Producto}</h4>
                                      <p className="text-xs text-slate-500">{compra.Cantidad} unid. x ${parseFloat(compra.PrecioUnitario).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-black text-blue-400">${parseFloat(compra.Subtotal).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  {compra.Observaciones && <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/50 mt-2">{compra.Observaciones}</p>}
                                </div>
                                {compra.Factura && (
                                  <div className="shrink-0 flex items-center justify-center">
                                    <a href={compra.Factura} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors group">
                                      <FileImage className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )) : (
                              <div className="text-center p-12 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                                <p className="text-sm font-bold text-slate-500">No hay repuestos registrados aún.</p>
                              </div>
                            )}
                            {/* Botón de Finalizar Reparación Completa */}
                            {(localOrder?.Estado || localOrder?.estadoBase) === 'En reparación' && localOrder?.servicios?.every((s: any) => s.Estado === 'Finalizado') && (
                              <div className="pt-10 border-t border-slate-800 flex justify-end">
                                <Button
                                  type="button"
                                  onClick={() => setConfirmDialog({ open: true, type: 'finish', title: 'Finalizar Reparación', description: '¿Está seguro de finalizar la reparación? Verifique que ya haya subido todas las fotos de recibos y facturas necesarias.' })}
                                  className="h-14 px-12 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                  Finalizar reparación
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Formulario Nueva Compra */}
                        {localOrder?.Estado !== 'Reparación finalizada' && (
                          <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 space-y-6 h-fit sticky top-0">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                              <Plus className="w-4 h-4 text-blue-500" /> Agregar repuesto
                            </h3>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase">Producto/Repuesto</Label>
                                <select
                                  value={newRepuesto.id_producto}
                                  onChange={(e) => handleProductSelect(e.target.value)}
                                  className="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                >
                                  <option value="">Seleccione...</option>
                                  {products.map(p => (
                                    <option key={p.ID_Producto} value={p.ID_Producto}>{p.Nombre}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black text-slate-500 uppercase">Cantidad</Label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={newRepuesto.cantidad}
                                    onChange={(e) => setNewRepuesto({ ...newRepuesto, cantidad: parseInt(e.target.value) || 0 })}
                                    className="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-white outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black text-slate-500 uppercase">Precio Un.</Label>
                                  <input
                                    type="number"
                                    value={newRepuesto.precio_unitario}
                                    onChange={(e) => setNewRepuesto({ ...newRepuesto, precio_unitario: e.target.value })}
                                    className="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-white outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase">Observaciones (opcional)</Label>
                                <Textarea
                                  value={newRepuesto.observaciones}
                                  onChange={(e) => setNewRepuesto({ ...newRepuesto, observaciones: e.target.value })}
                                  placeholder="Razón de uso..."
                                  className="bg-slate-900 border-slate-800 rounded-xl text-xs resize-none h-16 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase">Foto Factura/Recibo (Opcional)</Label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setFacturaFile(e.target.files ? e.target.files[0] : null)}
                                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-800 file:text-blue-400 hover:file:bg-slate-700"
                                />
                              </div>
                              <div className="pt-4 border-t border-slate-800">
                                <div className="flex justify-between items-center mb-4">
                                  <span className="text-[10px] font-black text-slate-500 uppercase">Subtotal</span>
                                  <span className="text-lg font-black text-blue-500">${((newRepuesto.cantidad || 0) * (parseFloat(newRepuesto.precio_unitario) || 0)).toLocaleString()}</span>
                                </div>
                                <Button
                                  type="button"
                                  onClick={handleAddRepuesto}
                                  disabled={isSubmittingRepuesto || !newRepuesto.id_producto || !newRepuesto.cantidad || !newRepuesto.precio_unitario}
                                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl disabled:opacity-50"
                                >
                                  {isSubmittingRepuesto ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar repuesto'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
      </form>

      {/* Confirmation Dialog para transiciones de estado principales */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.type === 'start' ? 'Iniciar' : 'Finalizar'}
        variant={confirmDialog.type === 'finish' ? 'default' : 'default'} // Assuming default is blue, but finish can also be default or constructive if available
        onConfirm={() => {
          if (confirmDialog.type === 'start') handleUpdateEstado('En reparación');
          else if (confirmDialog.type === 'finish') handleUpdateEstado('Reparación finalizada');
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }}
      />

      {/* Dialog para finalizar un servicio con observación opcional */}
      <Dialog open={finalizeServiceDialog.open} onOpenChange={(open) => setFinalizeServiceDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-left">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Finalizar Servicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{finalizeServiceDialog.serviceName}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Observación (Opcional)</Label>
              <Textarea
                value={finalizeServiceDialog.obs}
                onChange={(e) => setFinalizeServiceDialog(prev => ({ ...prev, obs: e.target.value }))}
                placeholder="Agregue alguna nota sobre el trabajo realizado si es necesario..."
                className="h-24 bg-transparent border-slate-200 dark:border-slate-800 rounded-xl resize-none"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="ghost" onClick={() => setFinalizeServiceDialog(prev => ({ ...prev, open: false }))} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleFinalizeService} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={loadingAction !== null}>
              {loadingAction ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Guardar y Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContent>
  );
}
