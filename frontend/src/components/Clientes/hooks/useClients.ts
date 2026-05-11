import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const token = localStorage.getItem('token');

  const fetchClients = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/clientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar clientes');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      toast.error('No se pudieron cargar los clientes');
    } finally {
      if (!silent) {
        setTimeout(() => setIsLoading(false), 500);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSave = async (data: any, editingClient: any) => {
    setIsSaving(true);
    try {
      const url = editingClient
        ? `${API_URL}/clientes/${editingClient.ID_Cliente}`
        : `${API_URL}/clientes`;
      const method = editingClient ? 'PUT' : 'POST';

      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'fotoFile') {
          if (data[key]) formDataToSend.append('fotoFile', data[key]);
        } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formDataToSend.append(key, String(data[key]));
        }
      });

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        const err = new Error(errorData.message || 'Error al guardar') as any;
        err.errors = errorData.errors;
        throw err;
      }

      toast.success(`Cliente ${editingClient ? 'actualizado' : 'registrado'} exitosamente`);
      fetchClients(true);
      return true;
    } catch (error: any) {
      let errorMsg = error.message || 'Error de conexión';
      if (errorMsg === 'Error de validación.' && error.errors) {
        errorMsg = `Error de validación: ${error.errors.map((e: any) => `${e.campo}: ${e.mensaje}`).join(', ')}`;
      }
      toast.error(errorMsg);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEstado = async (userId: number) => {
    if (!userId) {
      toast.error('Este cliente no tiene un usuario vinculado');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/usuarios/${userId}/estado`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al cambiar el estado');
      }
      toast.success('Estado actualizado correctamente');
      fetchClients(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteClient = async (client: any) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/clientes/${client.ID_Cliente}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar');
      }
      toast.success('Cliente eliminado exitosamente');
      fetchClients(true);
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    clients,
    isLoading,
    isSaving,
    isDeleting,
    handleSave,
    handleToggleEstado,
    deleteClient,
    fetchClients
  };
}
