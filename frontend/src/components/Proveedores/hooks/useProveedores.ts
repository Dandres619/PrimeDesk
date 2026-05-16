import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useProveedores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const fetchSuppliers = useCallback(async () => {
    if (suppliers.length === 0) {
      setIsLoading(true);
    }
    try {
      const res = await fetch(`${API_URL}/proveedores`, { headers });
      if (!res.ok) throw new Error('Error al cargar proveedores');
      const data = await res.json();
      setSuppliers(data.map((s: any) => ({
        id: s.ID_Proveedor,
        name: s.NombreEmpresa,
        taxId: s.Documento,
        contact: s.PersonaContacto,
        specialty: s.Especialidad,
        phone: s.Telefono,
        email: s.Email,
        address: s.Direccion,
        city: s.Ciudad,
        country: s.Pais,
        website: s.SitioWeb,
        notes: s.Notas,
        status: s.Estado ? 'Activo' : 'Inactivo',
        personType: s.TipoPersona || 'Natural'
      })).sort((a: any, b: any) => a.name.localeCompare(b.name)));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, suppliers.length]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleSave = async (data: any, editingSupplier: any) => {
    try {
      const method = editingSupplier ? 'PUT' : 'POST';
      const url = editingSupplier ? `${API_URL}/proveedores/${editingSupplier.id}` : `${API_URL}/proveedores`;

      const payload = {
        nombre_empresa: data.name,
        documento: data.taxId,
        persona_contacto: data.contact,
        especialidad: data.specialty || null,
        telefono: data.phone,
        email: data.email,
        direccion: data.address,
        ciudad: data.city,
        pais: data.country,
        sitio_web: data.website || null,
        notas: data.notes || null,
        estado: editingSupplier ? editingSupplier.status === 'Activo' : true,
        tipo_persona: data.personType
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al guardar el proveedor');
      }

      toast.success(`Proveedor ${editingSupplier ? 'actualizado' : 'registrado'} exitosamente`);
      fetchSuppliers();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const handleDelete = async (supplier: any) => {
    if (supplier.status === 'Activo') {
      toast.error('No se puede eliminar un proveedor activo. Primero debe inactivarlo.');
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/proveedores/${supplier.id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al eliminar proveedor');
      }
      toast.success('Proveedor eliminado');
      fetchSuppliers();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const toggleStatus = async (supplier: any) => {
    try {
      const res = await fetch(`${API_URL}/proveedores/${supplier.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          nombre_empresa: supplier.name,
          documento: supplier.taxId,
          persona_contacto: supplier.contact,
          especialidad: supplier.specialty,
          telefono: supplier.phone,
          email: supplier.email,
          direccion: supplier.address,
          ciudad: supplier.city,
          pais: supplier.country,
          sitio_web: supplier.website,
          notas: supplier.notes,
          estado: supplier.status !== 'Activo',
          tipo_persona: supplier.personType
        })
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al actualizar estado');
      }
      toast.success('Estado actualizado');
      fetchSuppliers();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    suppliers: filteredSuppliers,
    handleSave,
    handleDelete,
    toggleStatus,
    refreshData: fetchSuppliers
  };
}
