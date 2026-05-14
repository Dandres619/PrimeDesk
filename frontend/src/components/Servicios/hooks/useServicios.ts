import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useServicios() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const token = localStorage.getItem('token');

  const fetchServices = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/servicios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar servicios');
      const data = await response.json();
      setServices(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSave = async (formData: any, editingService: any) => {
    setIsSaving(true);
    try {
      const url = editingService ? `${API_URL}/servicios/${editingService.ID_Servicio}` : `${API_URL}/servicios`;
      const method = editingService ? 'PUT' : 'POST';

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
        throw new Error(err.message || 'Error al guardar servicio');
      }

      toast.success(`Servicio ${editingService ? 'actualizado' : 'creado'} exitosamente`);
      fetchServices(true);
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteService = async (serviceId: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/servicios/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al eliminar servicio');
      }

      toast.success('Servicio eliminado');
      fetchServices(true);
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = async (service: any) => {
    try {
      const response = await fetch(`${API_URL}/servicios/${service.ID_Servicio}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: service.Nombre,
          descripcion: service.Descripcion,
          duracion: service.Duracion || service.duracion || 30,
          estado: !service.Estado
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al cambiar estado');
      }

      toast.success('Estado actualizado');
      fetchServices(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    services,
    isLoading,
    isSaving,
    isDeleting,
    fetchServices,
    handleSave,
    deleteService,
    toggleStatus
  };
}
