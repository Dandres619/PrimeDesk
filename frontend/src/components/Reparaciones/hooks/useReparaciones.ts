import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useReparaciones() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReparacion, setEditingReparacion] = useState<any>(null);
  const [viewingReparacion, setViewingReparacion] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [reparaciones, setReparaciones] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [motorcycles, setMotorcycles] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [resRep, resCli, resMot, resEmp, resSer] = await Promise.all([
        fetch(`${API_URL}/reparaciones`, { headers }),
        fetch(`${API_URL}/clientes`, { headers }),
        fetch(`${API_URL}/motocicletas`, { headers }),
        fetch(`${API_URL}/empleados`, { headers }),
        fetch(`${API_URL}/servicios`, { headers })
      ]);

      if (!resRep.ok) throw new Error('Error al cargar datos de reparaciones');

      const dataRep = await resRep.json();
      const dataCli = await resCli.json();
      const dataMot = await resMot.json();
      const dataEmp = await resEmp.json();
      const dataSer = await resSer.json();

      setClients(dataCli);
      setMotorcycles(dataMot);
      setMechanics(dataEmp.filter((e: any) => (e.EstadoUsuario === true || e.EstadoUsuario === 'Activo') && (Number(e.ID_Rol) === 2 || Number(e.id_rol) === 2)));
      setAvailableServices(dataSer.filter((s: any) => s.Estado === true || s.Estado === 'Activo'));

    setReparaciones(dataRep.map((r: any) => ({
      id: r.ID_Reparacion,
      orderNumber: r.ID_Reparacion.toString(),
      motorcycleId: r.ID_Motocicleta,
      motorcycleBrand: r.Marca,
      motorcycleModel: r.Modelo,
      motorcyclePlate: r.Placa,
      motorcycleYear: r.Anio,
      clientId: dataMot.find((m: any) => m.ID_Motocicleta === r.ID_Motocicleta)?.ID_Cliente,
      observations: r.Observaciones,
      associatedSaleId: r.AssociatedSaleId || null,
      anulada: r.Estado === 'Anulada',
      estadoBase: r.Estado,
      mecanico: r.Mecanico || 'No asignado',
      mecanicoDocumento: r.MecanicoDocumento || '',
      mecanicoTelefono: r.MecanicoTelefono || '',
      diaAgendamiento: r.DiaAgendamiento || '',
      horaInicio: r.HoraInicio || '',
      notaEstado: r.NotaEstado || '',
      servicios: r.servicios || [],
      compras: r.compras || [],
      selectedServices: []
    })));

  } catch (error: any) {
    toast.error(error.message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [token]);

useEffect(() => {
  fetchData();
}, [fetchData]);

const handleOpenEdit = (order: any) => {
  setEditingReparacion({
    ...order,
    servicios: order.servicios || [],
    compras: order.compras || [],
    selectedServices: (order.servicios || []).map((s: any) => s.ID_Servicio || s.id_servicio)
  });
  setIsDialogOpen(true);
};

const handleOpenView = (order: any) => {
  const clientInfo = clients.find(c => c.ID_Cliente === order.clientId) || {};

  setViewingReparacion({
    ...order,
    clientName: clientInfo.Nombre + ' ' + (clientInfo.Apellido || ''),
    clientPhone: clientInfo.Telefono,
    clientDocument: clientInfo.Documento,
    selectedServices: (order.servicios || []).map((s: any) => s.NombreServicio || s.Nombre || '')
  });
};

  const handleSave = async (data: any) => {
    const isEditing = !!editingReparacion;
    setIsSaving(true);
    try {
      if (!isEditing) {
        const res = await fetch(`${API_URL}/agendamientos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            id_motocicleta: parseInt(data.motorcycleId),
            id_empleado: parseInt(data.mechanicId),
            dia: data.date,
            horainicio: data.startTime,
            horafin: data.endTime,
            notas: data.observations,
            servicios: data.selectedServices
          })
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.message || 'Error al crear reparación');
      } else {
        if (data.observations !== editingReparacion.observations) {
          await fetch(`${API_URL}/reparaciones/${editingReparacion.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              observaciones: data.observations,
              estado: editingReparacion.Estado || editingReparacion.estadoBase || 'Esperando motocicleta'
            })
          });
        }

        const oldServices = editingReparacion.selectedServices;
        for (const s of data.selectedServices) {
          if (!oldServices.includes(s)) {
            await fetch(`${API_URL}/reparaciones/${editingReparacion.id}/servicios`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ id_servicio: s })
            });
          }
        }
      }

      toast.success(`Reparación ${isEditing ? 'actualizada' : 'creada'} exitosamente`);
      setIsDialogOpen(false);
      setEditingReparacion(null);
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const anularReparacion = async (orderId: number) => {
    try {
      const res = await fetch(`${API_URL}/reparaciones/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: 'Anulada' })
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al anular reparación');
      }
      toast.success('Reparación anulada exitosamente');
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const richReparaciones = reparaciones.map(o => {
    const cli = clients.find(c => c.ID_Cliente === o.clientId);

    // Cross reference services with their prices to get hand of work totals
    const mappedServs = (o.servicios || []).map((s: any) => {
      const sid = s.ID_Servicio || s.id_servicio || s.IdServicio;
      const match = availableServices.find((as: any) => {
        const asid = as.ID_Servicio || as.id_servicio || as.IdServicio;
        return Number(asid) === Number(sid);
      });
      const price = match ? (match.Precio || match.precio || match.PrecioServicio || 0) : 0;
      return {
        ...s,
        Precio: parseFloat(price) || 0
      };
    });

    const totalServices = mappedServs.reduce((acc: number, cur: any) => {
      const price = parseFloat(cur.Precio || 0);
      return acc + (isNaN(price) ? 0 : price);
    }, 0);

    const totalPurchases = (o.compras || []).reduce((acc: number, cur: any) => {
      const sub = cur.Subtotal || cur.subtotal || cur.SubTotal || 0;
      const parsed = parseFloat(sub);
      return acc + (isNaN(parsed) ? 0 : parsed);
    }, 0);

    const totalCost = totalServices + totalPurchases;

    return {
      ...o,
      clientName: cli ? `${cli.Nombre} ${cli.Apellido || ''}` : 'Desconocido',
      clientPhone: cli ? cli.Telefono : '',
      clientDocument: cli ? cli.Documento : '',
      totalCost
    };
  });

  const filteredReparaciones = richReparaciones.filter(o =>
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.motorcycleBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.motorcyclePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    setIsDialogOpen,
    editingReparacion,
    setEditingReparacion,
    viewingReparacion,
    setViewingReparacion,
    currentPage,
    setCurrentPage,
    isLoading,
    isSaving,
    reparaciones: filteredReparaciones,
    clients,
    motorcycles,
    mechanics,
    availableServices,
    handleOpenEdit,
    handleOpenView,
    handleSave,
    anularReparacion,
    refreshData: fetchData
  };
}
