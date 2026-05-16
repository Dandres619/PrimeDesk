import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useVentas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sales, setSales] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [motorcycles, setMotorcycles] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resVentas, resClientes, resMotos, resCompras, resServicios, resReparaciones] = await Promise.all([
        fetch(`${API_URL}/ventas`, { headers }),
        fetch(`${API_URL}/clientes`, { headers }),
        fetch(`${API_URL}/motocicletas`, { headers }),
        fetch(`${API_URL}/compras`, { headers }),
        fetch(`${API_URL}/servicios`, { headers }),
        fetch(`${API_URL}/reparaciones`, { headers })
      ]);

      if (resVentas.ok) {
        const dataVentas = await resVentas.json();
        setSales(dataVentas.map((v: any) => ({
          ...v,
          id: v.ID_Venta,
          invoiceNumber: `VEN-${v.ID_Venta.toString().padStart(3, '0')}`,
          date: v.Fecha,
          clientName: `${v.NombreCliente} ${v.ApellidoCliente}`.trim(),
          serviceOrderNumber: v.ID_Reparacion ? `R-${v.ID_Reparacion.toString().padStart(3, '0')}` : '',
          total: parseFloat(v.Total),
          anulada: v.Estado === false
        })));
      }

      if (resClientes.ok) {
        const data = await resClientes.json();
        setClients(data.map((c: any) => ({
          id: c.ID_Cliente,
          name: `${c.Nombre} ${c.Apellido}`.trim(),
          phone: c.Telefono,
          document: c.Documento,
          email: c.Correo,
          address: c.Direccion
        })));
      }

      if (resMotos.ok) {
        const data = await resMotos.json();
        setMotorcycles(data.map((m: any) => ({
          id: m.ID_Motocicleta,
          brand: m.Marca,
          model: m.Modelo,
          plate: m.Placa,
          year: m.Anio,
          clientId: m.ID_Cliente
        })));
      }

      if (resCompras.ok) {
        const data = await resCompras.json();
        setPurchases(data.filter((c: any) => c.Estado === 'Pendiente de venta').map((c: any) => ({
          id: c.ID_Compra,
          invoiceNumber: `COMP-${c.ID_Compra.toString().padStart(3, '0')}`,
          total: parseFloat(c.Total),
          items: c.items || []
        })));
      }

      if (resServicios.ok) {
        const data = await resServicios.json();
        setServiceTypes(data.map((s: any) => ({ id: s.ID_Servicio.toString(), name: s.Nombre })));
      }

      if (resReparaciones.ok) {
        const data = await resReparaciones.json();
        setServiceOrders(data.map((r: any) => ({
          id: r.ID_Reparacion,
          orderNumber: r.id ? `R-${r.id.toString().padStart(3, '0')}` : r.ID_Reparacion,
          clientId: r.ID_Cliente,
          clientName: r.NombreCliente,
          motorcycleId: r.ID_Motocicleta,
          motorcycleBrand: r.Marca,
          motorcycleModel: r.Modelo,
          motorcyclePlate: r.Placa,
          description: r.Observaciones,
          status: r.Estado,
          associatedSaleId: r.AssociatedSaleId,
          services: r.servicios || []
        })));
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

  const saveSale = async (formData: any) => {
    const selectedPurchases = purchases.filter(p => formData.selectedPurchases.includes(p.id));
    const partsTotal = selectedPurchases.reduce((sum, p) => sum + p.total, 0);
    const total = partsTotal + parseFloat(formData.serviceCost || '0');

    const payload = {
      id_reparacion: formData.serviceOrderId ? parseInt(formData.serviceOrderId) : null,
      id_motocicleta: parseInt(formData.motorcycleId),
      fecha: formData.date,
      total: total,
      observaciones: formData.notes,
      servicios: formData.selectedServices.map((idServ: string) => ({
        id_servicio: parseInt(idServ),
        costo: parseFloat(formData.serviceCost || '0') / formData.selectedServices.length
      })),
      compras: selectedPurchases.map(p => ({
        id_compra: p.id,
        subtotal: p.total
      }))
    };

    try {
      const res = await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al registrar la venta');
      toast.success('Venta registrada exitosamente');
      fetchData();
      return true;
    } catch (e) {
      toast.error('Ocurrió un error al guardar la venta');
      return false;
    }
  };

  const cancelSale = async (sale: any) => {
    try {
      const res = await fetch(`${API_URL}/ventas/${sale.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ total: sale.total, observaciones: sale.notes, estado: false })
      });
      if (!res.ok) throw new Error('Error al anular la venta');
      toast.success('Venta anulada exitosamente');
      fetchData();
      return true;
    } catch (e) {
      toast.error('Error al anular la venta');
      return false;
    }
  };

  const getSaleDetails = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/ventas/${id}`, { headers });
      if (!res.ok) throw new Error('Error al cargar detalles de la venta');
      const data = await res.json();
      return {
        ...data,
        invoiceNumber: `VEN-${data.ID_Venta.toString().padStart(3, '0')}`,
        clientName: `${data.NombreCliente} ${data.ApellidoCliente}`.trim(),
        clientPhone: data.TelefonoCliente,
        clientDocument: data.DocumentoCliente,
        clientEmail: data.EmailCliente,
        clientAddress: data.DireccionCliente,
        motorcycleBrand: data.MarcaMoto,
        motorcycleModel: data.ModeloMoto,
        motorcyclePlate: data.Placa,
        serviceOrderNumber: data.ID_Reparacion ? `R-${data.ID_Reparacion.toString().padStart(3, '0')}` : 'N/A',
        serviceTypes: data.TiposServicio || [],
        parts: data.Repuestos || [],
        purchaseInvoices: data.FacturasCompras || [],
        serviceCost: parseFloat(data.CostoServicios || 0),
        total: parseFloat(data.Total)
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
    clients,
    motorcycles,
    purchases,
    serviceTypes,
    serviceOrders,
    saveSale,
    cancelSale,
    getSaleDetails
  };
}
