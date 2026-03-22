import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { MiPerfil } from './MiPerfil';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { ConfirmDialog } from './ConfirmDialog';
import { useTheme } from './ThemeProvider';
import {
  User,
  Bike,
  Calendar as CalendarIcon,
  LogOut,
  Menu,
  Plus,
  Edit,
  Trash2,
  History,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Clock,
  Ban,
  Loader2
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, isBefore, startOfDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';


interface Moto {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  color: string;
  cilindraje: string;
  kilometraje: number;
}



interface Agendamiento {
  id: number;
  motoId: number;
  mechanicId: number;
  motoBrand: string;
  motoModel: string;
  motoPlate: string;
  fecha: string;
  startTime: string;
  mechanicName: string;
  serviceTypes: string[];
  notes: string;
}

interface Employee {
  id: number;
  nombre: string;
  apellido: string;
}

interface Service {
  id: number;
  nombre: string;
  descripcion: string;
}

const clientMenuItems = [
  { id: 'perfil', label: 'Mi Perfil', icon: User },
  { id: 'motos', label: 'Mis Motos', icon: Bike },
  { id: 'agendar', label: 'Agendar Servicio', icon: CalendarIcon },
];

interface ClientPanelProps {
  currentUser: { id?: number; id_cliente?: number; username: string; name: string; last_name: string };
  onLogout: () => void;
}

export function ClientPanel({ currentUser, onLogout }: ClientPanelProps) {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('perfil');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

  const [isLoadingData, setIsLoadingData] = React.useState(false);

  const fetchClientData = React.useCallback(async (showLoading = true) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (showLoading) setIsLoadingData(true);
    try {
      // 1. Obtener perfil para tener ID_Cliente
      const meRes = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!meRes.ok) throw new Error('Error al cargar perfil');
      const userData = await meRes.json();

      if (userData.ID_Cliente) {
        // Peticiones en paralelo
        const [resMotos, resAg, resEmp, resSrv, resHor] = await Promise.all([
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
            startTime: a.HoraInicio,
            mechanicName: `${a.NombreEmpleado} ${a.ApellidoEmpleado}`,
            serviceTypes: a.Servicios || [],
            notes: a.Notas || ''
          })));
        }

        if (resEmp.ok) {
          const empData = await resEmp.ok ? await resEmp.json() : [];
          const onlyMechanics = empData.filter((e: any) => 
            (Number(e.ID_Rol) === 2 || Number(e.id_rol) === 2 || e.NombreRol === 'Mecánico') && 
            e.EstadoUsuario !== false && e.EstadoUsuario !== 'Inactivo'
          );
          setMechanics(onlyMechanics.map((e: any) => ({
            id: e.ID_Empleado,
            nombre: e.Nombre,
            apellido: e.Apellido
          })));
        }

        if (resSrv.ok) {
          const srvData = await resSrv.json();
          setAvailableServices(srvData.map((s: any) => ({
            id: s.ID_Servicio,
            nombre: s.Nombre,
            descripcion: s.Descripcion
          })));
        }

        if (resHor.ok) {
          setHorarios(await resHor.json());
        }
      }
    } catch (err) {
      console.error('Error loading client data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [API_URL]);

  React.useEffect(() => {
    fetchClientData();
  }, [fetchClientData, activeSection]);

  React.useEffect(() => {
    if (activeSection === 'motos' || activeSection === 'agendar') {
      fetchClientData();
    }
  }, [activeSection, fetchClientData]);

  // Estado de las motos
  const [motos, setMotos] = useState<Moto[]>([]);
  const [mechanics, setMechanics] = useState<Employee[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  const [showMotoModal, setShowMotoModal] = useState(false);
  const [editingMoto, setEditingMoto] = useState<Moto | null>(null);
  const [isSubmittingMoto, setIsSubmittingMoto] = useState(false);
  const [isDeletingMoto, setIsDeletingMoto] = useState(false);
  const [motoFormData, setMotoFormData] = useState({
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    placa: '',
    color: '',
    cilindraje: '',
    kilometraje: '' as any
  });

  // Estado del historial de servicios
  const [motoHistory, setMotoHistory] = useState<any[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  // Estado de agendamientos
  const [agendamientos, setAgendamientos] = useState<Agendamiento[]>([]);
  const [showAgendarModal, setShowAgendarModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Agendamiento | null>(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);
  const [agendarFormData, setAgendarFormData] = useState({
    motoId: 0,
    fecha: '',
    startTime: '',
    mecanicoId: 0,
    serviceIds: [] as number[],
    descripcion: ''
  });

  const [selectedMotoForHistory, setSelectedMotoForHistory] = useState<number | null>(null);
  const [showDeleteMotoConfirm, setShowDeleteMotoConfirm] = useState(false);
  const [selectedMoto, setSelectedMoto] = useState<Moto | null>(null);
  const [isCancellingApt, setIsCancellingApt] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [aptToCancel, setAptToCancel] = useState<Agendamiento | null>(null);
  const [isSubmittingApt, setIsSubmittingApt] = useState(false);

  const resetMotoForm = () => {
    setMotoFormData({
      marca: '',
      modelo: '',
      ano: new Date().getFullYear(),
      placa: '',
      color: '',
      cilindraje: '',
      kilometraje: ''
    });
    setEditingMoto(null);
  };

  const fetchMotoHistory = async (motoId: number) => {
    setIsFetchingHistory(true);
    setSelectedMotoForHistory(motoId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/reparaciones?id_motocicleta=${motoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar historial');
      const data = await res.json();
      setMotoHistory(data);
    } catch (err) {
      toast.error('No se pudo cargar el historial de servicios');
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleSubmitMoto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motoFormData.marca || !motoFormData.modelo || !motoFormData.placa) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    setIsSubmittingMoto(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !currentUser?.id_cliente) {
        toast.error('Sesión inválida');
        return;
      }

      const url = editingMoto
        ? `${API_URL}/motocicletas/${editingMoto.id}`
        : `${API_URL}/motocicletas`;

      const method = editingMoto ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_cliente: currentUser.id_cliente,
          marca: motoFormData.marca,
          modelo: motoFormData.modelo,
          anio: parseInt(motoFormData.ano.toString()),
          placa: motoFormData.placa,
          color: motoFormData.color,
          motor: motoFormData.cilindraje || '0',
          kilometraje: parseInt(motoFormData.kilometraje?.toString() || '0'),
          estado: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar la motocicleta');
      }

      if (editingMoto) {
        setMotos(motos.map(moto =>
          moto.id === editingMoto.id
            ? { ...moto, ...motoFormData, kilometraje: parseInt(motoFormData.kilometraje?.toString() || '0') }
            : moto
        ));
        toast.success('Moto actualizada exitosamente');
      } else {
        const newMoto: Moto = {
          id: data.ID_Motocicleta,
          ...motoFormData,
          kilometraje: parseInt(motoFormData.kilometraje?.toString() || '0')
        };
        setMotos([...motos, newMoto]);
        toast.success('Moto agregada exitosamente');
      }

      setShowMotoModal(false);
      resetMotoForm();
    } catch (error: any) {
      toast.error(error.message || 'Error al conectar con el servidor');
    } finally {
      setIsSubmittingMoto(false);
    }
  };

  const handleEditMoto = (moto: Moto) => {
    setEditingMoto(moto);
    setMotoFormData({ ...moto });
    setShowMotoModal(true);
  };

  const handleDeleteMoto = (moto: Moto) => {
    setSelectedMoto(moto);
    setShowDeleteMotoConfirm(true);
  };

  const confirmDeleteMoto = async () => {
    if (!selectedMoto) return;

    setIsDeletingMoto(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/motocicletas/${selectedMoto.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar la motocicleta');
      }

      setMotos(motos.filter(m => m.id !== selectedMoto.id));
      toast.success('Moto eliminada exitosamente');
      setShowDeleteMotoConfirm(false);
      setSelectedMoto(null);
    } catch (error: any) {
      toast.error(error.message || 'Error de conexión');
    } finally {
      setIsDeletingMoto(false);
    }
  };

  const handleSubmitAgendamiento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agendarFormData.motoId || !agendarFormData.fecha || !agendarFormData.startTime || !agendarFormData.mecanicoId || agendarFormData.serviceIds.length === 0) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    if (!agendarFormData.motoId || !agendarFormData.mecanicoId || !agendarFormData.startTime) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    setIsSubmittingApt(true);
    try {
      const token = localStorage.getItem('token');

      // Calcular hora fin (+1 hora)
      const [hours, minutes] = agendarFormData.startTime.split(':');
      const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
      const endTime = `${endHour}:${minutes}`;

      const response = await fetch(`${API_URL}/agendamientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_motocicleta: agendarFormData.motoId,
          id_empleado: agendarFormData.mecanicoId,
          dia: agendarFormData.fecha,
          horainicio: agendarFormData.startTime,
          horafin: endTime,
          notas: agendarFormData.descripcion,
          servicios: agendarFormData.serviceIds
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al guardar agendamiento');
      }

      const savedAgData = await response.json();
      const selectedMoto = motos.find(m => m.id === agendarFormData.motoId);
      const selectedMechanic = mechanics.find(m => m.id === agendarFormData.mecanicoId);
      const selectedServiceNames = availableServices
        .filter(s => agendarFormData.serviceIds.includes(s.id))
        .map(s => s.nombre);

      const newAgendamiento: Agendamiento = {
        id: savedAgData.ID_Agendamiento,
        motoId: agendarFormData.motoId,
        mechanicId: agendarFormData.mecanicoId,
        motoBrand: selectedMoto?.marca || '',
        motoModel: selectedMoto?.modelo || '',
        motoPlate: selectedMoto?.placa || '',
        fecha: agendarFormData.fecha,
        startTime: agendarFormData.startTime,
        mechanicName: selectedMechanic ? `${selectedMechanic.nombre} ${selectedMechanic.apellido}` : '',
        serviceTypes: selectedServiceNames,
        notes: agendarFormData.descripcion
      };

      setAgendamientos([...agendamientos, newAgendamiento]);
      toast.success('Servicio agendado exitosamente.');
      setShowAgendarModal(false);
      setAgendarFormData({
        motoId: 0,
        fecha: '',
        startTime: '',
        mecanicoId: 0,
        serviceIds: [],
        descripcion: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Error de conexión');
    } finally {
      setIsSubmittingApt(false);
    }
  };

  const handleCancelAgendamiento = async (apt: Agendamiento) => {
    // 1 hour check
    const aptDateTime = new Date(apt.fecha + 'T' + apt.startTime);
    const now = new Date();
    const diffHours = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      toast.error('Solo se puede cancelar con al menos una hora de anticipación.');
      return;
    }

    setIsCancellingApt(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/agendamientos/${apt.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cancelar');
      setAgendamientos(prev => prev.filter(a => a.id !== apt.id));
      setAppointmentDetailsOpen(false);
      setShowCancelConfirm(false);
      toast.success('Agendamiento cancelado exitosamente.');
    } catch (err: any) {
      toast.error(err.message || 'Error al conectar con el servidor');
    } finally {
      setIsCancellingApt(false);
    }
  };

  const getMotoName = (motoId: number) => {
    const moto = motos.find(m => m.id === motoId);
    return moto ? `${moto.marca} ${moto.modelo} - ${moto.placa}` : 'Moto no encontrada';
  };

  const getServiciosMoto = () => {
    // La información ya está filtrada por fetchMotoHistory(motoId)
    return motoHistory;
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      completado: 'bg-green-100 text-green-800 border-green-200',
      en_proceso: 'bg-blue-100 text-blue-800 border-blue-200',
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmado: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelado: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge className={variants[estado as keyof typeof variants] || variants.pendiente}>
        {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const getAvailableSlots = (mecanicoId: number, fecha: string) => {
    if (!mecanicoId || !fecha) return [];

    // Check past date
    const selectedDateStr = fecha;
    const selectedDate = parseISO(selectedDateStr);
    if (isBefore(selectedDate, startOfDay(new Date()))) return [];

    const daysMap: Record<number, string> = {
      1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo'
    };
    const dayName = daysMap[selectedDate.getDay()];

    const mechanicSched = horarios.filter((h: any) =>
      h.ID_Empleado === mecanicoId && h.Dia === dayName && h.Estado
    );

    if (mechanicSched.length === 0) return [];

    const slots: string[] = [];
    mechanicSched.forEach((sched: any) => {
      const startStr = sched.HoraEntrada || sched.Hora_entrada;
      const endStr = sched.HoraSalida || sched.Hora_salida;

      if (typeof startStr !== 'string' || typeof endStr !== 'string') return;

      let current = parseInt(startStr.split(':')[0]);
      const end = parseInt(endStr.split(':')[0]);

      while (current < end) {
        const slotTime = `${current.toString().padStart(2, '0')}:00`;
        const slotEndTime = `${(current + 1).toString().padStart(2, '0')}:00`;

        // Check past hour if date is today
        const isTodaySelected = isToday(selectedDate);
        if (isTodaySelected) {
          const now = new Date();
          const currentHour = now.getHours();
          if (current < currentHour) {
            current++;
            continue;
          }
          // If same hour, also skip (optional, but safer to block current hour if it's already started)
          if (current === currentHour && now.getMinutes() > 0) {
            current++;
            continue;
          }
        }

        const isOccupied = agendamientos.some((a: any) =>
          a.mechanicId === mecanicoId &&
          a.fecha === selectedDateStr &&
          ((slotTime >= a.startTime && slotTime < a.endTime) ||
            (slotEndTime > a.startTime && slotEndTime <= a.endTime) ||
            (a.startTime >= slotTime && a.startTime < slotEndTime))
        );

        if (!isOccupied) {
          slots.push(slotTime);
        }
        current++;
      }
    });

    return slots;
  };

  const renderContent = () => {
    if (isLoadingData) {
      return (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      );
    }

    switch (activeSection) {
      case 'perfil':
        return <MiPerfil />;

      // Nuevo case 'motos' completo en vista tabla
      case 'motos':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bike className="w-5 h-5 text-blue-600" />
                  Listado de Motocicletas
                </div>
                <Button
                  onClick={() => setShowMotoModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 h-9"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Moto
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Kilometraje</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {motos.map((moto) => (
                    <TableRow key={moto.id}>
                      <TableCell>{moto.marca}</TableCell>
                      <TableCell>{moto.modelo}</TableCell>
                      <TableCell>{moto.placa}</TableCell>
                      <TableCell>{moto.ano}</TableCell>
                      <TableCell>{moto.kilometraje.toLocaleString()} km</TableCell>

                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditMoto(moto)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => fetchMotoHistory(moto.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                            disabled={isFetchingHistory}
                          >
                            <History className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMoto(moto)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {selectedMotoForHistory && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Historial de Servicios - {getMotoName(selectedMotoForHistory)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMotoForHistory(null)}
                      >
                        Cerrar
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Diagnóstico</TableHead>
                            <TableHead>Mecánico</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getServiciosMoto().map((servicio: any) => (
                            <TableRow key={servicio.id}>
                              <TableCell>{format(new Date(servicio.Fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
                              <TableCell>{servicio.Observaciones || 'Sin observaciones'}</TableCell>
                              <TableCell>{servicio.Mecanico || 'Pendiente'}</TableCell>
                              <TableCell>{getEstadoBadge(servicio.Estado)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {getServiciosMoto().length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay servicios registrados para esta moto
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        );

      case 'agendar':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const dateFormat = "d";
        const rows: Date[][] = [];
        let days: Date[] = [];
        let day = startDate;

        while (day <= endDate) {
          for (let i = 0; i < 7; i++) {
            days.push(day);
            day = addDays(day, 1);
          }
          rows.push(days);
          days = [];
        }

        const getAppointmentsForDate = (date: Date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          return agendamientos.filter(apt => apt.fecha === dateStr);
        };

        const handleDateClick = (date: Date) => {
          // Validar que no sea antes del día actual
          if (isBefore(startOfDay(date), startOfDay(new Date()))) {
            toast.error('No se pueden agendar servicios en fechas pasadas');
            return;
          }

          // Validar que no sea fin de semana
          const dayOfWeek = date.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            toast.error('No se pueden agendar servicios los fines de semana');
            return;
          }

          const dateStr = format(date, 'yyyy-MM-dd');
          setSelectedDate(date);
          setAgendarFormData({
            motoId: 0,
            fecha: dateStr,
            startTime: '',
            mecanicoId: 0,
            serviceIds: [],
            descripcion: ''
          });
          setShowAgendarModal(true);
        };

        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Calendario de Servicios
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                      disabled={isSameMonth(currentDate, new Date())}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="min-w-[200px] text-center font-semibold capitalize">
                      {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                      disabled={isSameMonth(currentDate, addMonths(new Date(), 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div key={day} className="text-center p-2 font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}

                  {rows.map((week, weekIdx) => (
                    week.map((day, dayIdx) => {
                      const dayAppointments = getAppointmentsForDate(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isTodayDate = isToday(day);
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      const hasAppointment = dayAppointments.length > 0;
                      const isClickable = isCurrentMonth && !isWeekend && !hasAppointment;

                      return (
                        <div
                          key={`${weekIdx}-${dayIdx}`}
                          onClick={() => isClickable && handleDateClick(day)}
                          className={`
                            min-h-[100px] p-2 border rounded-lg transition-all relative group
                            ${!isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-card'}
                            ${isWeekend ? 'bg-muted/50 dark:bg-muted/20 border-border/50 cursor-not-allowed' : ''}
                            ${hasAppointment && !isWeekend ? 'cursor-default' : ''}
                            ${isClickable ? 'cursor-pointer hover:bg-accent/50' : ''}
                            ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                            ${isTodayDate ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700' : ''}
                          `}
                        >
                          {/* Icono de bloqueado para fines de semana */}
                          {isWeekend && isCurrentMonth && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-muted/80 dark:bg-muted/40 rounded-lg">
                              <Ban className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}

                          <div className={`text-sm mb-1 ${isTodayDate ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
                            {format(day, dateFormat)}
                          </div>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map((apt) => (
                              <div
                                key={apt.id}
                                className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 text-white px-2 py-1.5 rounded-lg cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-150 font-medium"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppointment(apt);
                                  setAppointmentDetailsOpen(true);
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span className="truncate">{apt.startTime}</span>
                                </div>
                                <div className="truncate opacity-90">
                                  {apt.motoBrand} {apt.motoModel}
                                </div>
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold pl-2">
                                +{dayAppointments.length - 2} más
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const confirmLogout = () => {
    toast.success('Sesión cerrada exitosamente');
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="border-b border-border p-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Rafa Motos</h2>
                <p className="text-sm text-muted-foreground">Panel Cliente</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Bienvenido</p>
              <p className="text-xs text-blue-700 dark:text-blue-400">{currentUser.name} {currentUser.last_name}</p>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4 overflow-y-auto sidebar-scroll">
            <SidebarMenu>
              {clientMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full justify-start gap-3 p-3 rounded-lg transition-colors ${activeSection === item.id
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-muted/50'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-blue-700 dark:text-blue-400' : 'text-muted-foreground'}`} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full justify-start gap-3 p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b border-border p-4 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SidebarTrigger>
                <h1 className="text-xl font-semibold capitalize">
                  {clientMenuItems.find(item => item.id === activeSection)?.label || 'Mi Perfil'}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{currentUser.name} {currentUser.last_name}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                  <Sun className={`w-4 h-4 transition-colors ${theme === 'light' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Moon className={`w-4 h-4 transition-colors ${theme === 'dark' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 bg-muted/30">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modales */}
      <Dialog open={showMotoModal} onOpenChange={setShowMotoModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMoto ? 'Editar Moto' : 'Agregar Nueva Moto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitMoto} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  value={motoFormData.marca}
                  onChange={(e) => setMotoFormData(prev => ({ ...prev, marca: e.target.value }))}
                  placeholder="Ej: Yamaha, Honda, Suzuki"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  value={motoFormData.modelo}
                  onChange={(e) => setMotoFormData(prev => ({ ...prev, modelo: e.target.value }))}
                  placeholder="Ej: FZ25, CB160F"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano">Año</Label>
                <Input
                  id="ano"
                  type="number"
                  value={motoFormData.ano}
                  onChange={(e) => setMotoFormData(prev => ({ ...prev, ano: parseInt(e.target.value) }))}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  value={motoFormData.placa}
                  onChange={(e) => setMotoFormData(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                  placeholder="ABC123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={motoFormData.color}
                  onChange={(e) => setMotoFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Ej: Azul, Rojo, Negro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cilindraje">Cilindraje</Label>
                <Input
                  id="cilindraje"
                  value={motoFormData.cilindraje}
                  onChange={(e) => setMotoFormData(prev => ({ ...prev, cilindraje: e.target.value }))}
                  placeholder="Ej: 250cc, 160cc"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kilometraje">Kilometraje</Label>
                <Input
                  id="kilometraje"
                  type="number"
                  value={motoFormData.kilometraje}
                  onChange={(e) => setMotoFormData(prev => ({ ...prev, kilometraje: e.target.value }))}
                  placeholder="Ingrese el kilometraje"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowMotoModal(false);
                  resetMotoForm();
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSubmittingMoto}>
                {isSubmittingMoto ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Grabando...
                  </>
                ) : (editingMoto ? 'Actualizar Moto' : 'Agregar Moto')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAgendarModal} onOpenChange={setShowAgendarModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Nuevo Servicio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAgendamiento} className="space-y-4">
            {/* Fecha seleccionada en el calendario */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-muted-foreground">Fecha seleccionada:</span>
                <span className="font-medium text-blue-700 dark:text-blue-400">
                  {agendarFormData.fecha ? format(new Date(agendarFormData.fecha + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: es }) : 'No seleccionada'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motoSelect">Selecciona tu Moto *</Label>
              <Select
                value={agendarFormData.motoId.toString()}
                onValueChange={(value) => setAgendarFormData(prev => ({ ...prev, motoId: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una de tus motos" />
                </SelectTrigger>
                <SelectContent>
                  {motos.map((moto) => (
                    <SelectItem key={moto.id} value={moto.id.toString()}>
                      {moto.marca} {moto.modelo} - {moto.placa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mecanico">Mecánico Preferido *</Label>
              <Select
                value={agendarFormData.mecanicoId.toString()}
                onValueChange={(value) => setAgendarFormData(prev => ({ ...prev, mecanicoId: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un mecánico" />
                </SelectTrigger>
                <SelectContent>
                  {mechanics.map((mechanic) => (
                    <SelectItem key={mechanic.id} value={mechanic.id.toString()}>
                      {mechanic.nombre} {mechanic.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Hora deseada (Aproximada) *
              </Label>
              <Select
                value={agendarFormData.startTime}
                onValueChange={(value) => setAgendarFormData(prev => ({ ...prev, startTime: value }))}
                disabled={!agendarFormData.mecanicoId || !agendarFormData.fecha}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!agendarFormData.mecanicoId ? "Selecciona mecánico primero" : "Selecciona la hora de inicio"} />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSlots(agendarFormData.mecanicoId, agendarFormData.fecha).map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                  {agendarFormData.mecanicoId && agendarFormData.fecha && getAvailableSlots(agendarFormData.mecanicoId, agendarFormData.fecha).length === 0 && (
                    <div className="p-2 text-xs text-red-500">No hay horarios disponibles</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Servicios a realizar *</Label>
              <div className="grid grid-cols-2 gap-3">
                {availableServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      checked={agendarFormData.serviceIds.includes(service.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAgendarFormData(prev => ({
                            ...prev,
                            serviceIds: [...prev.serviceIds, service.id]
                          }));
                        } else {
                          setAgendarFormData(prev => ({
                            ...prev,
                            serviceIds: prev.serviceIds.filter(id => id !== service.id)
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`service-${service.id}`} className="text-sm cursor-pointer">
                      {service.nombre}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción del Servicio</Label>
              <Textarea
                id="descripcion"
                value={agendarFormData.descripcion}
                onChange={(e) => setAgendarFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Describe el problema o servicio que necesitas..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAgendarModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmittingApt || !agendarFormData.startTime}
              >
                {isSubmittingApt ? 'Agendando...' : 'Agendar Servicio'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de detalles de agendamiento */}
      <Dialog open={appointmentDetailsOpen} onOpenChange={setAppointmentDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Detalles del Agendamiento
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4 py-2">
              {/* Fecha */}
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-2 rounded-lg mt-1">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {format(new Date(selectedAppointment.fecha + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              </div>

              {/* Horario */}
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-2 rounded-lg mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Horario</p>
                  <p className="font-medium">{selectedAppointment.startTime}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">La hora es un aproximado y puede ser reasignada.</p>
                </div>
              </div>

              {/* Mecánico */}
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 p-2 rounded-lg mt-1">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Mecánico asignado</p>
                  <p className="font-medium">{selectedAppointment.mechanicName}</p>
                </div>
              </div>

              {/* Motocicleta */}
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-2 rounded-lg mt-1">
                  <Bike className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Motocicleta</p>
                  <p className="font-medium">
                    {selectedAppointment.motoBrand} {selectedAppointment.motoModel}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Placa: {selectedAppointment.motoPlate}
                  </p>
                </div>
              </div>

              {/* Servicios */}
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 p-2 rounded-lg mt-1">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Servicios a realizar</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAppointment.serviceTypes.map((service: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notas */}
              {selectedAppointment.notes && (
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 p-2 rounded-lg mt-1">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Notas adicionales</p>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-border">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setAppointmentDetailsOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    if (selectedAppointment) {
                      setAptToCancel(selectedAppointment);
                      setShowCancelConfirm(true);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancelar Agendamiento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Cerrar Sesión"
        description="¿Estás seguro de que deseas cerrar tu sesión?"
        confirmText="Cerrar Sesión"
        onConfirm={confirmLogout}
        variant="default"
      />

      <ConfirmDialog
        open={showDeleteMotoConfirm}
        onOpenChange={setShowDeleteMotoConfirm}
        title="Eliminar Moto"
        description={`¿Estás seguro de que deseas eliminar la moto "${selectedMoto?.marca} ${selectedMoto?.modelo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={confirmDeleteMoto}
        variant="delete"
        loading={isDeletingMoto}
      />

      {/* Cancel Appointment Dialog */}
      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Cancelar Agendamiento"
        description="¿Estás seguro de que deseas cancelar este agendamiento?"
        confirmText="Confirmar Cancelación"
        onConfirm={() => aptToCancel && handleCancelAgendamiento(aptToCancel)}
        variant="cancel"
        loading={isCancellingApt}
      />
    </SidebarProvider>
  );
}