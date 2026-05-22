import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useCompras() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnuling, setIsAnuling] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  const fetchPurchases = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/compras`, { headers });
      if (!response.ok) throw new Error('Error al cargar compras');
      const data = await response.json();
      setPurchases(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const cancelPurchase = async (id: number) => {
    setIsAnuling(true);
    try {
      const resp = await fetch(`${API_URL}/compras/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message || 'Error al anular la compra');
      }
      toast.success('Compra anulada exitosamente');
      fetchPurchases(true);
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsAnuling(false);
    }
  };

  const getPurchaseDetails = async (id: number) => {
    try {
      const resp = await fetch(`${API_URL}/compras/${id}`, { headers });
      if (!resp.ok) throw new Error('Error al cargar detalles de la compra');
      return await resp.json();
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const filteredPurchases = purchases.filter((p: any) =>
    (p.ID_Compra?.toString() || '').includes(searchTerm.toLowerCase()) ||
    (p.NombreEmpresa || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    isAnuling,
    purchases: filteredPurchases,
    cancelPurchase,
    getPurchaseDetails,
    refreshData: fetchPurchases
  };
}
