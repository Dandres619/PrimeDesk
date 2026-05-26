import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useReparacionQueries(
  token: string | null,
  editingOrder: any,
  isOpen: boolean,
  setFormData: any,
  setIsEditMode: any,
  setPopovers: any,
  setSearch: any,
  setServicesSearch: any,
  setSubmitAttempted: any,
  setTouchedRepuesto: any,
  onOrderUpdated?: () => void
) {
  const [horarios, setHorarios] = useState<any[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [novedades, setNovedades] = useState<any[]>([]);
  const [localOrder, setLocalOrder] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);

  const fetchProveedores = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/proveedores`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setProveedores(data.filter((p: any) => p.estado !== false && p.estado !== 'Inactivo' && p.Estado !== false && p.Estado !== 'Inactivo'));
    } catch { /* ignore */ }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/productos`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setProducts(data);
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    if (!editingOrder) {
      const fetchAgendas = async () => {
        try {
          const headers = { 'Authorization': `Bearer ${token}` };
          const [resHor, resAge, resNov] = await Promise.all([
            fetch(`${API_URL}/horarios`, { headers }),
            fetch(`${API_URL}/agendamientos`, { headers }),
            fetch(`${API_URL}/novedades`, { headers })
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
          if (resNov.ok) {
            setNovedades(await resNov.json());
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchAgendas();
    }
  }, [editingOrder, token]);

  useEffect(() => {
    setPopovers({ client: false, motorcycle: false, startTime: false, mechanic: false, product: false, proveedor: false });
    setSearch({ client: '', motorcycle: '', mechanic: '', product: '', proveedor: '' });
    setServicesSearch('');
    setSubmitAttempted(false);
    setTouchedRepuesto({ cantidad: false, precio_unitario: false, id_proveedor: false });

    if (!isOpen) {
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
          startTime: '',
          endTime: '',
          mechanicId: '',
          date: format(new Date(), 'yyyy-MM-dd')
        });
        fetchProducts();
        fetchProveedores();
      } else {
        setIsEditMode(false);
        setLocalOrder(null);
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
      }
    }
  }, [isOpen, editingOrder, fetchProducts, fetchProveedores, setIsEditMode, setLocalOrder, setFormData, setPopovers, setSearch, setServicesSearch, setSubmitAttempted, setTouchedRepuesto]);

  const reloadLocalOrder = async () => {
    if (!localOrder) return;
    try {
      const res = await fetch(`${API_URL}/reparaciones/${localOrder.id || localOrder.ID_Reparacion}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLocalOrder({ ...localOrder, ...data });
      onOrderUpdated?.();
      return { ...localOrder, ...data };
    } catch {
      return null;
    }
  };

  return {
    horarios,
    existingAppointments,
    novedades,
    localOrder, setLocalOrder,
    products,
    proveedores,
    reloadLocalOrder
  };
}
