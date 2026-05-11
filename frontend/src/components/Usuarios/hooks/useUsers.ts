import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useUsers() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const token = localStorage.getItem('token');

  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener los usuarios');
      const data = await response.json();
      setUsuarios(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [token]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchUsuarios();
      setIsLoading(false);
    };
    init();
  }, [fetchUsuarios]);

  const handleToggleEstado = async (id: number) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.id_usuario === id) {
      toast.error('No puedes inactivar tu propia cuenta.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al cambiar el estado');
      }
      toast.success('Estado actualizado');
      fetchUsuarios();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUser = async (formData: any, editingUser: any) => {
    setIsSaving(true);
    try {
      let response;
      if (editingUser) {
        response = await fetch(`${API_URL}/usuarios/${editingUser.ID_Usuario}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            correo: formData.email,
            contrasena: formData.password || undefined
          })
        });
      } else {
        response = await fetch(`${API_URL}/usuarios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            correo: formData.email,
            contrasena: formData.password,
            id_rol: parseInt(formData.id_rol)
          })
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al guardar el usuario');
      }

      toast.success(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
      fetchUsuarios();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    usuarios,
    isLoading,
    isSaving,
    handleToggleEstado,
    handleSaveUser,
    fetchUsuarios
  };
}
