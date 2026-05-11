import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useRoles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const token = localStorage.getItem('token');

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener los roles');
      const data = await response.json();

      const rolesWithPermissions = await Promise.all(data.map(async (role: any) => {
        const permRes = await fetch(`${API_URL}/roles/${role.ID_Rol}/permisos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const perms = permRes.ok ? await permRes.json() : [];
        return {
          ...role,
          id: role.ID_Rol,
          name: role.Nombre,
          description: role.Descripcion,
          status: (role.Estado === true || role.Estado === 1) ? 'Activo' : 'Inactivo',
          permissions: perms
        };
      }));

      setRoles(rolesWithPermissions);
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [token]);

  const fetchAllPermissions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/permisos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener los permisos');
      const data = await response.json();
      setAllPermissions(data.map((p: any) => ({
        id: p.ID_Permiso,
        name: p.Nombre,
        description: p.Descripcion,
        status: 'Activo'
      })));
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [token]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchRoles(), fetchAllPermissions()]);
      setIsLoading(false);
    };
    init();
  }, [fetchRoles, fetchAllPermissions]);

  const handleSaveRole = async (formData: any, editingRole: any) => {
    setIsProcessing(true);
    try {
      if (!formData.permissions || formData.permissions.length === 0) {
        throw new Error('Debe seleccionar, por lo menos, un permiso.');
      }

      const roleData = {
        nombre: formData.name,
        descripcion: formData.description,
        estado: formData.status === 'Activo'
      };

      let roleId = editingRole?.id;
      let response;

      if (editingRole) {
        response = await fetch(`${API_URL}/roles/${roleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(roleData)
        });
      } else {
        response = await fetch(`${API_URL}/roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(roleData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el rol');
      }

      const savedRole = await response.json();
      const finalRoleId = roleId || savedRole.ID_Rol || savedRole.id;

      const currentPermsRes = await fetch(`${API_URL}/roles/${finalRoleId}/permisos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const currentPerms = currentPermsRes.ok ? await currentPermsRes.json() : [];

      const newPermIds = formData.permissions;
      const currentPermIds = currentPerms.map((p: any) => p.ID_Permiso);

      const toAdd = newPermIds.filter((id: number) => !currentPermIds.includes(id));
      const toRemove = currentPermIds.filter((id: number) => !newPermIds.includes(id));

      await Promise.all([
        ...toAdd.map((idPerm: number) => fetch(`${API_URL}/roles/${finalRoleId}/permisos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id_permiso: idPerm })
        })),
        ...toRemove.map((idPerm: number) => fetch(`${API_URL}/roles/${finalRoleId}/permisos/${idPerm}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }))
      ]);

      toast.success(editingRole ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
      fetchRoles();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRole = async (id: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar el rol');
      }
      toast.success('Rol eliminado exitosamente');
      fetchRoles();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleRoleStatus = async (role: any) => {
    try {
      const newStatus = role.status === 'Activo' ? false : true;
      const response = await fetch(`${API_URL}/roles/${role.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: role.name,
          descripcion: role.description,
          estado: newStatus
        })
      });
      if (!response.ok) throw new Error('No se puede inactivar este rol dado que hay uno o más usuarios que tienen este rol activo.');
      toast.success('Estado actualizado');
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    roles,
    allPermissions,
    isLoading,
    isProcessing,
    isDeleting,
    handleSaveRole,
    handleDeleteRole,
    toggleRoleStatus,
    fetchRoles
  };
}
