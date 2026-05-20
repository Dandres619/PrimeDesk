import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useProductos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_URL}/productos`, { headers }),
        fetch(`${API_URL}/categorias`, { headers })
      ]);

      if (!prodRes.ok) throw new Error('Error al cargar productos');
      if (!catRes.ok) throw new Error('Error al cargar categorías');

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setCategories(catData.map((c: any) => ({ id: c.ID_Categoria, name: c.Nombre })));
      const mappedProducts = prodData.map((p: any) => ({
        id: p.ID_Producto,
        name: p.Nombre,
        description: p.Descripcion,
        brand: p.Marca,
        categoryId: p.ID_Categoria,
        categoryName: p.NombreCategoria,
        status: p.Estado ? 'Activo' : 'Inactivo'
      }));

      mappedProducts.sort((a: any, b: any) => 
        (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' })
      );

      setProducts(mappedProducts);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (data: any, editingProduct: any) => {
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `${API_URL}/productos/${editingProduct.id}` : `${API_URL}/productos`;

      const payload = {
        id_categoria: parseInt(data.categoryId),
        nombre: data.name,
        marca: data.brand,
        descripcion: data.description,
        estado: editingProduct ? (data.status === 'Activo' ? 1 : 0) : 1
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al guardar el producto');
      }

      toast.success(`Producto ${editingProduct ? 'actualizado' : 'creado'} exitosamente`);
      fetchData();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const handleDelete = async (product: any) => {
    if (product.status === 'Activo') {
      toast.error('No se puede eliminar un producto activo. Primero debe inactivarlo.');
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/productos/${product.id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al eliminar producto');
      }
      toast.success('Producto eliminado');
      fetchData();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const toggleStatus = async (product: any) => {
    try {
      const res = await fetch(`${API_URL}/productos/${product.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          id_categoria: product.categoryId,
          nombre: product.name,
          marca: product.brand,
          descripcion: product.description,
          estado: product.status !== 'Activo'
        })
      });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Error al actualizar estado');
      }
      toast.success('Estado actualizado');
      fetchData();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const brands = ['Auteco', 'Yamaha', 'Honda', 'Suzuki', 'Kawasaki', 'Bajaj', 'TVS', 'KTM', 'Genérica', 'Otros'];

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    products: filteredProducts,
    categories,
    brands,
    handleSave,
    handleDelete,
    toggleStatus,
    refreshData: fetchData
  };
}
