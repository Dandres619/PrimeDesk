import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchEmployees = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/empleados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar empleados');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      toast.error('No se pudieron cargar los empleados');
    } finally {
      if (!silent) {
        setTimeout(() => setIsLoading(false), 500);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSave = async (data: any, editingEmployee: any) => {
    setIsSaving(true);
    try {
      const url = editingEmployee
        ? `${API_URL}/empleados/${editingEmployee.ID_Empleado}`
        : `${API_URL}/empleados`;
      const method = editingEmployee ? 'PUT' : 'POST';

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

      toast.success(`Empleado ${editingEmployee ? 'actualizado' : 'registrado'} exitosamente`);
      fetchEmployees(true);
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
    if (currentUser.id_usuario === userId) {
      toast.error('No puedes inactivar tu propia cuenta.');
      return;
    }
    if (!userId) {
      toast.error('Este empleado no tiene un usuario vinculado');
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
      fetchEmployees(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEmployee = async (employee: any) => {
    if (currentUser.id_usuario === employee.ID_Usuario) {
      toast.error('No puedes eliminar tu propia cuenta.');
      return false;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/empleados/${employee.ID_Empleado}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar');
      }
      toast.success('Empleado eliminado exitosamente');
      fetchEmployees(true);
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    employees,
    isLoading,
    isSaving,
    isDeleting,
    handleSave,
    handleToggleEstado,
    deleteEmployee,
    fetchEmployees
  };
}
