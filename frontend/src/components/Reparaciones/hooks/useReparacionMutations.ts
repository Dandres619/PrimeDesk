import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useReparacionMutations({
  token, localOrder, reloadLocalOrder, onOpenChange, setLoadingAction, finalizeRepairDialog, setFinalizeRepairDialog,
  finalizeServiceDialog, setFinalizeServiceDialog, setActiveTab, newRepuesto, setNewRepuesto, setIsSubmittingRepuesto,
  facturaFile, setFacturaFile, setTouchedRepuesto, scrollContainerRef, products, setFormData, errors, editingOrder, setSubmitAttempted, onSave, formData
}: any) {

  const handleUpdateEstado = async (nuevoEstado: string, manoObra?: number, observacionesVenta?: string) => {
    if (!localOrder || localOrder.Estado === nuevoEstado) return;
    setLoadingAction(`estado-${nuevoEstado}`);
    try {
      const bodyPayload: any = { estado: nuevoEstado };
      if (nuevoEstado === 'Reparación finalizada') {
        bodyPayload.mano_obra = manoObra || 0;
        bodyPayload.observaciones_venta = observacionesVenta || '';
      }

      const res = await fetch(`${API_URL}/reparaciones/${localOrder.id || localOrder.ID_Reparacion}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bodyPayload)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Error al actualizar estado');

      if (nuevoEstado === 'Reparación finalizada') {
        toast.success('¡La reparación ha sido finalizada con éxito y la venta registrada!');
        onOpenChange(false);
      } else {
        toast.success(`Estado actualizado a "${nuevoEstado}"`);
      }

      await reloadLocalOrder();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFinalizeRepairConfirm = async () => {
    if (!localOrder) return;
    const manoObraNum = parseFloat(finalizeRepairDialog.manoObra);
    if (isNaN(manoObraNum) || manoObraNum < 0) {
      setFinalizeRepairDialog((prev: any) => ({ ...prev, error: 'Ingrese un valor válido mayor o igual a 0.' }));
      return;
    }
    if (manoObraNum > 1000000) {
      setFinalizeRepairDialog((prev: any) => ({ ...prev, error: 'Máximo $1.000.000.' }));
      return;
    }

    await handleUpdateEstado('Reparación finalizada', manoObraNum, finalizeRepairDialog.observaciones);
    setFinalizeRepairDialog((prev: any) => ({ ...prev, open: false }));
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
    if (!localOrder || !newRepuesto.id_producto || !newRepuesto.cantidad || !newRepuesto.precio_unitario || !newRepuesto.id_proveedor) {
      return toast.error('Complete los campos obligatorios del repuesto.');
    }
    setIsSubmittingRepuesto(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('id_producto', newRepuesto.id_producto);
      formDataObj.append('cantidad', newRepuesto.cantidad.toString());
      formDataObj.append('precio_unitario', newRepuesto.precio_unitario.toString());
      formDataObj.append('observaciones', newRepuesto.observaciones);
      formDataObj.append('id_proveedor', newRepuesto.id_proveedor.toString());
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

      toast.success('Repuesto agregado a la reparación.');
      setNewRepuesto({ id_producto: '', cantidad: '1', precio_unitario: '', observaciones: '', id_proveedor: '' });
      setTouchedRepuesto({ cantidad: false, precio_unitario: false, id_proveedor: false });
      setFacturaFile(null);
      await reloadLocalOrder();
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmittingRepuesto(false);
    }
  };

  const handleDeleteRepuesto = async (idReparacionCompra: number) => {
    if (!localOrder) return;
    setLoadingAction(`delete-compra-${idReparacionCompra}`);
    try {
      const res = await fetch(`${API_URL}/reparaciones/${localOrder.id || localOrder.ID_Reparacion}/compras/${idReparacionCompra}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al eliminar repuesto');
      }
      toast.success('Repuesto eliminado de la reparación.');
      await reloadLocalOrder();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleProductSelect = (idStr: string) => {
    const prod = products.find((p: any) => p.ID_Producto.toString() === idStr);
    if (prod) {
      setNewRepuesto({ ...newRepuesto, id_producto: idStr, precio_unitario: prod.Precio || '' });
    } else {
      setNewRepuesto({ ...newRepuesto, id_producto: idStr });
    }
  };

  const handleServiceChange = (serviceId: number, checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      selectedServices: checked
        ? [...prev.selectedServices, serviceId]
        : prev.selectedServices.filter((s: any) => s !== serviceId)
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

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const handleManoObraKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    const isDigit = (!e.shiftKey && e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105);
    if (!isDigit) {
      e.preventDefault();
      return;
    }
    const currentValue = e.currentTarget.value || '';
    const selectionStart = e.currentTarget.selectionStart;
    const selectionEnd = e.currentTarget.selectionEnd;
    const isTextSelected = selectionStart !== null && selectionEnd !== null && (selectionEnd - selectionStart > 0);

    if (currentValue.length >= 7 && !isTextSelected) {
      e.preventDefault();
    }
  };

  return {
    handleUpdateEstado,
    handleFinalizeRepairConfirm,
    handleFinalizeService,
    handleAddRepuesto,
    handleDeleteRepuesto,
    handleProductSelect,
    handleServiceChange,
    handleSubmit,
    handleNumberKeyDown,
    handleManoObraKeyDown
  };
}
