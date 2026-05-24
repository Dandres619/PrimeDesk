import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useVentas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const resVentas = await fetch(`${API_URL}/ventas`, { headers });

      if (resVentas.ok) {
        const dataVentas = await resVentas.json();
        const mappedSales = dataVentas.map((v: any) => ({
          ...v,
          id: v.ID_Venta,
          invoiceNumber: v.ID_Venta.toString(),
          date: v.Fecha,
          clientName: `${v.NombreCliente} ${v.ApellidoCliente}`.trim(),
          clientPhone: v.TelefonoCliente,
          clientDocument: v.DocumentoCliente,
          clientEmail: v.EmailCliente,
          clientAddress: v.DireccionCliente,
          motorcycleBrand: v.MarcaMoto,
          motorcycleModel: v.ModeloMoto,
          motorcyclePlate: v.Placa,
          serviceOrderNumber: v.ID_Reparacion ? v.ID_Reparacion.toString() : 'N/A',
          serviceTypes: v.TiposServicio || [],
          parts: v.Repuestos || [],
          servicios: v.servicios || [],
          purchaseInvoices: v.FacturasCompras || [],
          serviceCost: parseFloat(v.CostoServicios || 0),
          total: parseFloat(v.Total),
          anulada: v.Estado === false,
          motorcycle: v.Placa ? `${v.Placa} (${v.MarcaMoto} ${v.ModeloMoto})` : 'Sin moto',
          notes: v.Observaciones || v.observaciones || ''
        }));
        
        // Sort sales by date descending (most recent first)
        mappedSales.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setSales(mappedSales);
      }
    } catch (e) {
      toast.error('Error cargando datos del servidor');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getSaleDetails = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/ventas/${id}`, { headers });
      if (!res.ok) throw new Error('Error al cargar detalles de la venta');
      const data = await res.json();
      return {
        ...data,
        date: data.Fecha,
        invoiceNumber: data.ID_Venta.toString(),
        clientName: `${data.NombreCliente} ${data.ApellidoCliente}`.trim(),
        clientPhone: data.TelefonoCliente,
        clientDocument: data.DocumentoCliente,
        clientEmail: data.EmailCliente,
        clientAddress: data.DireccionCliente,
        motorcycleBrand: data.MarcaMoto,
        motorcycleModel: data.ModeloMoto,
        motorcyclePlate: data.Placa,
        serviceOrderNumber: data.ID_Reparacion ? data.ID_Reparacion.toString() : 'N/A',
        serviceTypes: data.TiposServicio || [],
        parts: data.Repuestos || [],
        purchaseInvoices: data.FacturasCompras || [],
        serviceCost: parseFloat(data.CostoServicios || 0),
        total: parseFloat(data.Total),
        notes: data.Observaciones || data.observaciones || ''
      };
    } catch (e) {
      toast.error('Error al cargar detalles');
      return null;
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.motorcyclePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    isLoading,
    sales: filteredSales,
    getSaleDetails
  };
}
