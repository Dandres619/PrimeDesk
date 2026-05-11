import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useMotos() {
  const [motos, setMotos] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const token = localStorage.getItem('token');

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [motosRes, clientsRes] = await Promise.all([
        fetch(`${API_URL}/motocicletas`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/clientes`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!motosRes.ok || !clientsRes.ok) throw new Error('Error al cargar datos');

      const motosData = await motosRes.json();
      const clientsData = await clientsRes.json();

      setMotos(motosData);
      setClients(clientsData);
    } catch (error: any) {
      toast.error(error.message || 'Error de conexión');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (formData: any, editingMoto: any) => {
    setIsSaving(true);
    try {
      const url = editingMoto ? `${API_URL}/motocicletas/${editingMoto.ID_Motocicleta}` : `${API_URL}/motocicletas`;
      const method = editingMoto ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al guardar motocicleta');
      }

      toast.success(`Motocicleta ${editingMoto ? 'actualizada' : 'registrada'} exitosamente`);
      fetchData(true);
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleDelete = async (moto: any) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/motocicletas/${moto.ID_Motocicleta}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al eliminar motocicleta');
      }

      toast.success('Motocicleta eliminada');
      fetchData(true);
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = async (moto: any) => {
    try {
      const response = await fetch(`${API_URL}/motocicletas/${moto.ID_Motocicleta}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_cliente: moto.ID_Cliente,
          marca: moto.Marca,
          modelo: moto.Modelo,
          anio: moto.Anio,
          placa: moto.Placa,
          color: moto.Color,
          motor: moto.Motor,
          kilometraje: moto.Kilometraje,
          estado: !moto.Estado
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al cambiar estado');
      }

      toast.success('Estado actualizado');
      fetchData(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    motos,
    clients,
    isLoading,
    isSaving,
    isDeleting,
    handleSave,
    handleDelete,
    toggleStatus,
    refreshData: () => fetchData(true)
  };
}
