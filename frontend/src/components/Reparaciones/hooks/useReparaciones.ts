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

  const [reparaciones, setReparaciones] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [motorcycles, setMotorcycles] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
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
        orderNumber: `R-${r.ID_Reparacion.toString().padStart(3, '0')}`,
        date: r.Fecha,
        motorcycleId: r.ID_Motocicleta,
        motorcycleBrand: r.Marca,
        motorcycleModel: r.Modelo,
        motorcyclePlate: r.Placa,
        motorcycleYear: r.Anio,
        clientId: dataMot.find((m: any) => m.ID_Motocicleta === r.ID_Motocicleta)?.ID_Cliente,
        observations: r.Observaciones,
        associatedSaleId: null,
        anulada: r.Estado === 'Anulada',
        estadoBase: r.Estado,
        selectedServices: [],
        progress: []
      })));

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadDetails = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/reparaciones/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar detalles');
      return await res.json();
    } catch (err: any) {
      toast.error(err.message);
      return null;
    }
  };

  const handleOpenEdit = async (order: any) => {
    const details = await loadDetails(order.id);
    if (!details) return;

    setEditingReparacion({
      ...order,
      selectedServices: details.servicios.map((s: any) => s.ID_Servicio),
      progress: details.avances.map((a: any) => ({
        id: a.ID_ReparacionAvance,
        description: a.Descripcion,
        technician: `${a.NombreEmpleado} ${a.ApellidoEmpleado}`,
        technicianId: a.ID_Empleado
      }))
    });
    setIsDialogOpen(true);
  };

  const handleOpenView = async (order: any) => {
    const details = await loadDetails(order.id);
    if (!details) return;

    const clientInfo = clients.find(c => c.ID_Cliente === order.clientId) || {};

    setViewingReparacion({
      ...order,
      clientName: clientInfo.Nombre + ' ' + (clientInfo.Apellido || ''),
      clientPhone: clientInfo.Telefono,
      clientDocument: clientInfo.Documento,
      selectedServices: details.servicios.map((s: any) => s.Nombre),
      progress: details.avances.map((a: any) => ({
        id: a.ID_ReparacionAvance,
        description: a.Descripcion,
        technician: `${a.NombreEmpleado} ${a.ApellidoEmpleado}`,
        date: a.Fecha
      }))
    });
  };

  const handleSave = async (data: any) => {
    const isEditing = !!editingReparacion;
    try {
      if (!isEditing) {
        const res = await fetch(`${API_URL}/reparaciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            id_motocicleta: parseInt(data.motorcycleId),
            id_agendamiento: null,
            observaciones: data.observations,
            estado: 'Pendiente de Venta',
            servicios: data.selectedServices
          })
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.message || 'Error al crear reparación');
        const newRepId = resData.ID_Reparacion;

        if (data.progress && data.progress.length > 0) {
          for (const p of data.progress) {
            await fetch(`${API_URL}/reparaciones/${newRepId}/avances`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ id_empleado: p.technicianId, descripcion: p.description })
            });
          }
        }
      } else {
        if (data.observations !== editingReparacion.observations) {
          await fetch(`${API_URL}/reparaciones/${editingReparacion.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              observaciones: data.observations,
              tipo_servicio: 'Directo',
              estado: 'En proceso'
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

        const oldAvancesIds = editingReparacion.progress.map((p: any) => p.id);
        for (const p of data.progress) {
          if (!oldAvancesIds.includes(p.id) && typeof p.id === 'string' && p.id.startsWith('new_')) {
            await fetch(`${API_URL}/reparaciones/${editingReparacion.id}/avances`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ id_empleado: p.technicianId, descripcion: p.description })
            });
          }
        }
      }

      toast.success(`Reparación ${isEditing ? 'actualizada' : 'creada'} exitosamente`);
      setIsDialogOpen(false);
      setEditingReparacion(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const anularReparacion = async (orderId: number) => {
    try {
      const res = await fetch(`${API_URL}/reparaciones/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: 'Anulada', tipo_servicio: 'Directo' })
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al anular reparación');
      }
      toast.success('Reparación anulada exitosamente');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const richReparaciones = reparaciones.map(o => {
    const cli = clients.find(c => c.ID_Cliente === o.clientId);
    return {
      ...o,
      clientName: cli ? `${cli.Nombre} ${cli.Apellido || ''}` : 'Desconocido',
      clientPhone: cli ? cli.Telefono : '',
      clientDocument: cli ? cli.Documento : ''
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
    reparaciones: filteredReparaciones,
    clients,
    motorcycles,
    mechanics,
    availableServices,
    handleOpenEdit,
    handleOpenView,
    handleSave,
    anularReparacion,
    loadDetails
  };
}
