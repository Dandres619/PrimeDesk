import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useCategorias() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const fetchCategories = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/categorias`, { headers });
      if (!res.ok) throw new Error('Error al cargar categorías');
      const data = await res.json();
      setCategories(data.map((c: any) => ({
        id: c.ID_Categoria,
        name: c.Nombre,
        description: c.Descripcion,
        status: c.Estado ? 'Activo' : 'Inactivo',
      })));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSave = async (data: any, editingCategory: any) => {
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `${API_URL}/categorias/${editingCategory.id}` : `${API_URL}/categorias`;

      const payload = {
        nombre: data.name,
        descripcion: data.description,
        estado: editingCategory ? (editingCategory.status === 'Activo') : true
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Error al guardar la categoría');

      toast.success(`Categoría ${editingCategory ? 'actualizada' : 'creada'} exitosamente`);
      fetchCategories(true);
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const handleDelete = async (category: any) => {
    try {
      const res = await fetch(`${API_URL}/categorias/${category.id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al eliminar categoría');
      }
      toast.success('Categoría eliminada');
      fetchCategories(true);
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const toggleStatus = async (category: any) => {
    try {
      const newStatus = category.status !== 'Activo';
      const res = await fetch(`${API_URL}/categorias/${category.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          nombre: category.name,
          descripcion: category.description,
          estado: newStatus
        })
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al actualizar estado');
      }
      toast.success('Estado actualizado');
      fetchCategories(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    categories: filtered,
    handleSave,
    handleDelete,
    toggleStatus,
    fetchCategories
  };
}
