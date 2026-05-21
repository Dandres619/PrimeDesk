import { useState, useCallback } from 'react';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';


export function useClientData() {
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [motos, setMotos] = useState<any[]>([]);
  const [agendamientos, setAgendamientos] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [novedades, setNovedades] = useState<any[]>([]);
  const [reparaciones, setReparaciones] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  const fetchClientData = useCallback(async (showLoading = true) => {
    if (!token) return;
    if (showLoading) setIsLoadingData(true);
    try {
      const meRes = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!meRes.ok) throw new Error('Error al cargar perfil');
      const userData = await meRes.json();

      if (userData.ID_Cliente) {
        const [resMotos, resAg, resEmp, resSrv, resHor, resNov, resRep] = await Promise.all([
          fetch(`${API_URL}/motocicletas?id_cliente=${userData.ID_Cliente}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/agendamientos?id_cliente=${userData.ID_Cliente}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/empleados`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/servicios`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/horarios`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/novedades`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/reparaciones?id_cliente=${userData.ID_Cliente}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (resMotos.ok) {
          const motosData = await resMotos.json();
          setMotos(motosData.map((m: any) => ({
            id: m.ID_Motocicleta,
            marca: m.Marca,
            modelo: m.Modelo,
            ano: m.Anio,
            placa: m.Placa,
            color: m.Color,
            cilindraje: m.Motor,
            kilometraje: m.Kilometraje
          })));
        }

        if (resAg.ok) {
          const agData = await resAg.json();
          setAgendamientos(agData.map((a: any) => ({
            id: a.ID_Agendamiento,
            motoId: a.ID_Motocicleta,
            mechanicId: a.ID_Empleado,
            motoBrand: a.MarcaMoto,
            motoModel: a.Modelo,
            motoPlate: a.Placa,
            fecha: a.Dia.split('T')[0],
            date: a.Dia.split('T')[0], // for compatibility with AptFormDialog date checks
            startTime: a.HoraInicio,
            endTime: a.HoraFin,
            mechanicName: `${a.NombreEmpleado} ${a.ApellidoEmpleado}`,
            serviceTypes: a.Servicios || [],
            notes: a.Notas || '',
            status: a.Estado || 'Confirmado'
          })));
        }

        if (resEmp.ok) {
          const empData = await resEmp.json();
          const onlyMechanics = empData.filter((e: any) =>
            (Number(e.ID_Rol) === 2 || Number(e.id_rol) === 2 || e.NombreRol === 'Mecánico') &&
            e.EstadoUsuario !== false && e.EstadoUsuario !== 'Inactivo'
          );
          setMechanics(onlyMechanics.map((e: any) => ({
            ID_Empleado: e.ID_Empleado,
            Nombre: e.Nombre,
            Apellido: e.Apellido,
            Documento: e.Documento,
            Telefono: e.Telefono
          })));
        }

        if (resSrv.ok) {
          const srvData = await resSrv.json();
          setAvailableServices(srvData.map((s: any) => ({
            ID_Servicio: s.ID_Servicio,
            Nombre: s.Nombre,
            Descripcion: s.Descripcion,
            Precio: s.Precio || s.precio,
            Duracion: s.Duracion || s.duracion
          })));
        }

        if (resHor.ok) {
          setHorarios(await resHor.json());
        }

        if (resNov && resNov.ok) {
          setNovedades(await resNov.json());
        }

        if (resRep && resRep.ok) {
          const repsData = await resRep.json();
          setReparaciones(repsData.map((r: any) => ({
            ...r,
            estadoBase: r.Estado || r.estado || 'Esperando motocicleta',
            clientName: r.NombreCliente,
            motorcyclePlate: r.Placa,
            motorcycleBrand: r.Marca,
            motorcycleModel: r.Modelo,
            motorcycleYear: r.Anio,
            observations: r.Observaciones,
            mecanico: r.Mecanico || 'No asignado',
            mecanicoDocumento: r.MecanicoDocumento || '',
            mecanicoTelefono: r.MecanicoTelefono || '',
            diaAgendamiento: r.DiaAgendamiento || '',
            horaInicio: r.HoraInicio || '',
            notaEstado: r.NotaEstado || '',
            servicios: r.servicios || [],
            compras: r.compras || []
          })));
        }
      }
    } catch (err) {
      console.error('Error loading client data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [token]);

  return {
    isLoadingData,
    motos,
    agendamientos,
    mechanics,
    horarios,
    availableServices,
    novedades,
    reparaciones,
    fetchClientData,
    setMotos,
    setAgendamientos,
    setReparaciones
  };
}
