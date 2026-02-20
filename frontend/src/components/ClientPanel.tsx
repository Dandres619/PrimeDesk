import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './/ui/sidebar';
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
  Save,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Clock,
  Ban
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface ClientData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  documentType: string;
  document: string;
  direccion: string;
  barrio: string;
  fechaNacimiento: string;
}

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

interface ServicioHistorial {
  id: number;
  motoId: number;
  fecha: string;
  tipoServicio: string;
  descripcion: string;
  mecanico: string;
  costo: number;
  estado: 'completado' | 'en_proceso' | 'cancelado';
}

interface Agendamiento {
  id: number;
  motoId: number;
  motoBrand: string;
  motoModel: string;
  motoPlate: string;
  fecha: string;
  startTime: string;
  mechanicName: string;
  serviceTypes: string[];
  notes: string;
}

const clientMenuItems = [
  { id: 'perfil', label: 'Mi Perfil', icon: User },
  { id: 'motos', label: 'Mis Motos', icon: Bike },
  { id: 'agendar', label: 'Agendamientos', icon: CalendarIcon },
];

interface ClientPanelProps {
  currentUser: { username: string; name: string };
  onLogout: () => void;
}

export function ClientPanel({ currentUser, onLogout }: ClientPanelProps) {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('perfil');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Estado del perfil
  const [clientData, setClientData] = useState<ClientData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    documentType: '',
    document: '',
    direccion: '',
    barrio: '',
    fechaNacimiento: ''
  });
  const [clientId, setClientId] = useState<number | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Cargar datos del perfil al montar
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) return;

        const response = await fetch('http://localhost:3000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (!response.ok) throw new Error('Error al cargar perfil');

        const data = await response.json();

        // Mapear datos del backend al estado
        setClientData({
          nombre: data.NombreCliente || '',
          apellido: data.ApellidoCliente || '',
          email: data.Correo || '',
          telefono: data.Telefono || '',
          documentType: data.TipoDocumento || '',
          document: data.Documento || '',
          direccion: data.Direccion || '',
          barrio: data.Barrio || '',
          fechaNacimiento: data.FechaNacimiento ? data.FechaNacimiento.split('T')[0] : ''
        });
        setClientId(data.ID_Cliente);

      } catch (error) {
        console.error(error);
        toast.error('No se pudo cargar la información del perfil');
      }
    };

    fetchProfile();
  }, [currentUser]);

  // Estado de las motos
  const [motos, setMotos] = useState<Moto[]>([]);
  const [showMotoModal, setShowMotoModal] = useState(false);
  const [editingMoto, setEditingMoto] = useState<Moto | null>(null);
  const [motoFormData, setMotoFormData] = useState({
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    placa: '',
    color: '',
    cilindraje: '',
    kilometraje: 0
  });



  // Cargar motos cuando tengamos el clientId
  React.useEffect(() => {
    if (!clientId) return;
    const fetchMotos = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/motocicletas?id_cliente=${clientId}`, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Mapear respuesta del backend al formato del frontend
          const mappedMotos = data.map((m: any) => ({
            id: m.ID_Motocicleta,
            marca: m.Marca,
            modelo: m.Modelo,
            ano: m.Anio,
            placa: m.Placa,
            color: m.Color,
            cilindraje: m.Motor + 'cc', // Asumiendo que 'Motor' es cilindraje
            kilometraje: m.Kilometraje
          }));
          setMotos(mappedMotos);
        }
      } catch (error) {
        console.error('Error al cargar motos:', error);
      }
    };
    fetchMotos();
  }, [clientId]);

  // Estado del historial de servicios
  const [servicios, setServicios] = useState<ServicioHistorial[]>([
    {
      id: 1,
      motoId: 1,
      fecha: '2024-01-15',
      tipoServicio: 'Mantenimiento',
      descripcion: 'Cambio de aceite y filtros',
      mecanico: 'Carlos Mécanico',
      costo: 85000,
      estado: 'completado'
    },
    {
      id: 2,
      motoId: 2,
      fecha: '2024-01-10',
      tipoServicio: 'Reparación',
      descripcion: 'Ajuste de frenos delanteros',
      mecanico: 'Carlos Mécanico',
      costo: 120000,
      estado: 'completado'
    }
  ]);

  // Estado de agendamientos
  const [agendamientos, setAgendamientos] = useState<Agendamiento[]>([]);
  const [showAgendarModal, setShowAgendarModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Agendamiento | null>(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);

  const [availableMechanics, setAvailableMechanics] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  const [agendarFormData, setAgendarFormData] = useState({
    motoId: 0,
    fecha: '',
    startTime: '',
    mecanico: '', // ID del mecánico
    serviceTypes: [] as string[], // IDs de servicios
    descripcion: ''
  });

  const [selectedMoto, setSelectedMoto] = useState<Moto | null>(null);
  const [showDeleteMotoConfirm, setShowDeleteMotoConfirm] = useState(false);
  const [selectedMotoForHistory, setSelectedMotoForHistory] = useState<number | null>(null);

  // Cargar datos iniciales (Mecánicos, Servicios y Agendamientos del cliente)
  React.useEffect(() => {
    const fetchData = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) return;

      try {
        // Cargar mecánicos
        const mechanicsRes = await fetch('http://localhost:3000/api/empleados', {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        });
        if (mechanicsRes.ok) setAvailableMechanics(await mechanicsRes.json());

        // Cargar servicios
        const servicesRes = await fetch('http://localhost:3000/api/servicios', {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        });
        if (servicesRes.ok) setAvailableServices(await servicesRes.json());

      } catch (error) {
        console.error('Error cargando catálogos:', error);
      }
    };
    fetchData();
  }, [currentUser]);

  // Cargar agendamientos del cliente
  React.useEffect(() => {
    if (!clientId) return;
    const fetchAppointments = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/agendamientos?id_cliente=${clientId}`, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Mapear
          const mapped = data.map((a: any) => ({
            id: a.ID_Agendamiento,
            motoId: a.ID_Motocicleta,
            motoBrand: a.MarcaMoto,
            motoModel: a.Modelo,
            motoPlate: a.Placa,
            fecha: a.Dia.split('T')[0],
            startTime: a.HoraInicio,
            mechanicName: `${a.NombreEmpleado} ${a.ApellidoEmpleado}`,
            serviceTypes: [], // No vienen en el listado simple, habría que hacer join o fetching detalle
            notes: a.Notas
          }));
          setAgendamientos(mapped);
        }
      } catch (error) {
        console.error('Error cargando agendamientos:', error);
      }
    };
    fetchAppointments();
  }, [clientId]);

  const handleUpdateProfile = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken || !clientId) return;

      // Actualizar datos del cliente (Necesitamos un endpoint para esto, usaremos el CRUD de clientes por ahora o crearemos uno especifico)
      // El endpoint ideal sería PUT /api/clientes/:id
      // Pero el servicio de clientes espera { id_usuario, nombre... }

      // NOTA: Asumimos que existe PUT /api/clientes/:id. Si no, habría que crearlo o usar uno de usuarios.
      // Dado que estamos en 'ClientPanel', intentaremos actualizar la tabla Clientes.

      const response = await fetch(`http://localhost:3000/api/clientes/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
        body: JSON.stringify({
          nombre: clientData.nombre,
          apellido: clientData.apellido,
          telefono: clientData.telefono,
          direccion: clientData.direccion,
          barrio: clientData.barrio,
          fecha_nacimiento: clientData.fechaNacimiento,
          // Enviamos los campos inmutables también por si el backend los requiere, aunque no deban cambiar
          tipo_documento: clientData.documentType,
          documento: clientData.document
        })
      });

      if (!response.ok) throw new Error('Error al actualizar perfil');

      toast.success('Perfil actualizado exitosamente');
      setIsEditingProfile(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar cambios');
    }
  };

  const resetMotoForm = () => {
    setMotoFormData({
      marca: '',
      modelo: '',
      ano: new Date().getFullYear(),
      placa: '',
      color: '',
      cilindraje: '',
      kilometraje: 0
    });
    setEditingMoto(null);
  };

  const handleSubmitMoto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motoFormData.marca || !motoFormData.modelo || !motoFormData.placa) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    const storedToken = localStorage.getItem('token');
    if (!storedToken || !clientId) return;

    try {
      if (editingMoto) {
        // Actualizar moto
        const response = await fetch(`http://localhost:3000/api/motocicletas/${editingMoto.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`
          },
          body: JSON.stringify({
            marca: motoFormData.marca,
            modelo: motoFormData.modelo,
            anio: motoFormData.ano, // Backend espera 'anio' o 'Anyo'? Revisar mapeo. Backend usually expects 'anio' or snake_case.
            // Revisando 'motocicletas.service.js' create: @marca, @modelo, @anio...
            // Espera 'anio'.
            placa: motoFormData.placa,
            color: motoFormData.color,
            motor: motoFormData.cilindraje, // Backend espera 'motor'
            kilometraje: motoFormData.kilometraje,
            id_cliente: clientId
          })
        });

        if (!response.ok) throw new Error('Error al actualizar moto');

        // Actualizar estado local
        setMotos(motos.map(moto =>
          moto.id === editingMoto.id
            ? { ...moto, ...motoFormData }
            : moto
        ));
        toast.success('Moto actualizada exitosamente');
      } else {
        // Crear nueva moto
        const response = await fetch('http://localhost:3000/api/motocicletas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`
          },
          body: JSON.stringify({
            marca: motoFormData.marca,
            modelo: motoFormData.modelo,
            anio: motoFormData.ano,
            placa: motoFormData.placa,
            color: motoFormData.color,
            motor: motoFormData.cilindraje,
            kilometraje: motoFormData.kilometraje,
            id_cliente: clientId
          })
        });

        if (!response.ok) throw new Error('Error al crear moto');

        const newMotoData = await response.json();

        // El backend devuelve el objeto creado?
        // motocicletas.controller.js create devuelve 'id: result.id, ...data'

        const newMoto: Moto = {
          id: newMotoData.id || Date.now(),
          ...motoFormData
        };
        setMotos([...motos, newMoto]);
        toast.success('Moto agregada exitosamente');
      }

      setShowMotoModal(false);
      resetMotoForm();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la moto');
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

  const confirmDeleteMoto = () => {
    if (selectedMoto) {
      setMotos(motos.filter(m => m.id !== selectedMoto.id));
      toast.success('Moto eliminada exitosamente');
    }
    setShowDeleteMotoConfirm(false);
    setSelectedMoto(null);
  };

  const handleSubmitAgendamiento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agendarFormData.motoId || !agendarFormData.fecha || !agendarFormData.startTime || !agendarFormData.mecanico || agendarFormData.serviceTypes.length === 0) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    const storedToken = localStorage.getItem('token');

    // Calcular hora fin (1 hora por defecto)
    const [hours, minutes] = agendarFormData.startTime.split(':').map(Number);
    const endWindow = new Date();
    endWindow.setHours(hours + 1, minutes);
    const endTime = `${endWindow.getHours().toString().padStart(2, '0')}:${endWindow.getMinutes().toString().padStart(2, '0')}`;

    try {
      const response = await fetch('http://localhost:3000/api/agendamientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
        body: JSON.stringify({
          id_motocicleta: agendarFormData.motoId,
          id_empleado: parseInt(agendarFormData.mecanico),
          dia: agendarFormData.fecha,
          hora_inicio: agendarFormData.startTime,
          hora_fin: endTime,
          notas: agendarFormData.descripcion,
          servicios: agendarFormData.serviceTypes.map(Number)
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al agendar');
      }

      const newAptData = await response.json();

      // Actualizar lista localmente (o recargar)
      // Para simplificar, recargamos la página o la lista, pero aqui agregaremos manualmente
      // Necesitamos nombres de moto y mecanico para la vista
      const selectedMoto = motos.find(m => m.id === agendarFormData.motoId);
      const selectedMechanic = availableMechanics.find(m => m.ID_Empleado === parseInt(agendarFormData.mecanico));

      const newAgendamiento: Agendamiento = {
        id: newAptData.ID_Agendamiento,
        motoId: agendarFormData.motoId,
        motoBrand: selectedMoto?.marca || '',
        motoModel: selectedMoto?.modelo || '',
        motoPlate: selectedMoto?.placa || '',
        fecha: agendarFormData.fecha,
        startTime: agendarFormData.startTime,
        mechanicName: selectedMechanic ? `${selectedMechanic.Nombre} ${selectedMechanic.Apellido}` : '',
        serviceTypes: [], // Pendiente mostrar nombres
        notes: agendarFormData.descripcion
      };

      setAgendamientos([...agendamientos, newAgendamiento]);
      toast.success('Servicio agendado exitosamente.');
      setShowAgendarModal(false);
      setAgendarFormData({
        motoId: 0,
        fecha: '',
        startTime: '',
        mecanico: '',
        serviceTypes: [],
        descripcion: ''
      });

    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const getMotoName = (motoId: number) => {
    const moto = motos.find(m => m.id === motoId);
    return moto ? `${moto.marca} ${moto.modelo} - ${moto.placa}` : 'Moto no encontrada';
  };

  const getServiciosMoto = (motoId: number) => {
    return servicios.filter(s => s.motoId === motoId);
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

  const renderContent = () => {
    switch (activeSection) {
      case 'perfil':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">Mi Perfil</h1>
                  <p className="text-muted-foreground">Gestiona tu información personal</p>
                </div>
              </div>
              <Button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                variant={isEditingProfile ? "outline" : "default"}
                className={!isEditingProfile ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {isEditingProfile ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </>
                )}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={clientData.nombre}
                      onChange={(e) => setClientData(prev => ({ ...prev, nombre: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="Ej: Juan Carlos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      value={clientData.apellido}
                      onChange={(e) => setClientData(prev => ({ ...prev, apellido: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="Ej: Pérez García"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Tipo de Documento</Label>
                    <Input
                      id="documentType"
                      value={clientData.documentType}
                      disabled={true}
                      className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document">Número de Documento</Label>
                    <Input
                      id="document"
                      value={clientData.document}
                      disabled={true}
                      className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientData.email}
                      onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="ejemplo@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      value={clientData.telefono}
                      onChange={(e) => setClientData(prev => ({ ...prev, telefono: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input
                      id="direccion"
                      value={clientData.direccion}
                      onChange={(e) => setClientData(prev => ({ ...prev, direccion: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="Calle 123 #45-67"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barrio">Barrio *</Label>
                    <Input
                      id="barrio"
                      value={clientData.barrio}
                      onChange={(e) => setClientData(prev => ({ ...prev, barrio: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="Ej: Chapinero"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={clientData.fechaNacimiento}
                      onChange={(e) => setClientData(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
                      disabled={!isEditingProfile}
                      className="[&::-webkit-calendar-picker-indicator]:dark:invert"
                    />
                  </div>
                </div>
                {isEditingProfile && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleUpdateProfile}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      // Nuevo case 'motos' completo en vista tabla
      case 'motos':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bike className="w-5 h-5 text-blue-600" />
                  Listado de Motocicletas
                </CardTitle>
                <Button onClick={() => {
                  resetMotoForm();
                  setShowMotoModal(true);
                }} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Moto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Moto</TableHead>
                    <TableHead>Datos</TableHead>
                    <TableHead>Kilometraje</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {motos.map((moto) => (
                    <TableRow key={moto.id}>
                      <TableCell>
                        <p className="font-medium">{moto.marca} {moto.modelo}</p>
                        <p className="text-sm text-muted-foreground">Placa: {moto.placa}</p>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm space-y-1">
                          <p>Año: {moto.ano}</p>
                          <p>Color: {moto.color}</p>
                          <p>Cilindraje: {moto.cilindraje}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <p className="font-medium">{moto.kilometraje.toLocaleString()} km</p>
                      </TableCell>

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
                            onClick={() => setSelectedMotoForHistory(moto.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
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
                            <TableHead>Servicio</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Mecánico</TableHead>
                            <TableHead>Costo</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getServiciosMoto(selectedMotoForHistory).map((servicio) => (
                            <TableRow key={servicio.id}>
                              <TableCell>{servicio.fecha}</TableCell>
                              <TableCell>{servicio.tipoServicio}</TableCell>
                              <TableCell>{servicio.descripcion}</TableCell>
                              <TableCell>{servicio.mecanico}</TableCell>
                              <TableCell>${servicio.costo.toLocaleString()}</TableCell>
                              <TableCell>{getEstadoBadge(servicio.estado)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {getServiciosMoto(selectedMotoForHistory).length === 0 && (
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
          // Validar que no sea fin de semana
          const dayOfWeek = date.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            toast.error('No se pueden agendar servicios los fines de semana');
            return;
          }

          // Validar que no haya ya un agendamiento en ese día
          const dateStr = format(date, 'yyyy-MM-dd');
          const hasAppointment = agendamientos.some(apt => apt.fecha === dateStr);
          if (hasAppointment) {
            toast.error('Ya existe un agendamiento para este día. Solo se permite un agendamiento por día.');
            return;
          }

          setSelectedDate(date);
          setAgendarFormData({
            motoId: 0,
            fecha: dateStr,
            startTime: '',
            mecanico: '',
            serviceTypes: [],
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
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="min-w-[200px] text-center">
                      {format(currentDate, 'MMMM yyyy', { locale: es }).charAt(0).toUpperCase() +
                        format(currentDate, 'MMMM yyyy', { locale: es }).slice(1)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
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
              <p className="text-xs text-blue-700 dark:text-blue-400">{currentUser.name}</p>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
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
                  <span>{currentUser.name}</span>
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
                  onChange={(e) => setMotoFormData(prev => ({ ...prev, kilometraje: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
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
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                {editingMoto ? 'Actualizar Moto' : 'Agregar Moto'}
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
                value={agendarFormData.mecanico}
                onValueChange={(value) => setAgendarFormData(prev => ({ ...prev, mecanico: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un mecánico" />
                </SelectTrigger>
                <SelectContent>
                  {availableMechanics.map((mechanic) => (
                    <SelectItem key={mechanic.ID_Empleado} value={mechanic.ID_Empleado.toString()}>
                      {mechanic.Nombre} {mechanic.Apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Hora de Inicio (Aproximada) *
              </Label>
              <Select
                value={agendarFormData.startTime}
                onValueChange={(value) => setAgendarFormData(prev => ({ ...prev, startTime: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la hora de inicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">08:00 AM</SelectItem>
                  <SelectItem value="09:00">09:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="14:00">02:00 PM</SelectItem>
                  <SelectItem value="15:00">03:00 PM</SelectItem>
                  <SelectItem value="16:00">04:00 PM</SelectItem>
                  <SelectItem value="17:00">05:00 PM</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground italic">
                * La hora es un aproximado y puede ser reasignado si es necesario
              </p>
            </div>

            <div className="space-y-2">
              <Label>Servicios a realizar *</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid grid-cols-2 gap-3">
                  {availableServices.map((service) => (
                    <div key={service.ID_Servicio} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`service-${service.ID_Servicio}`}
                        checked={agendarFormData.serviceTypes.includes(service.ID_Servicio.toString())}
                        onChange={(e) => {
                          const serviceId = service.ID_Servicio.toString();
                          if (e.target.checked) {
                            setAgendarFormData(prev => ({
                              ...prev,
                              serviceTypes: [...prev.serviceTypes, serviceId]
                            }));
                          } else {
                            setAgendarFormData(prev => ({
                              ...prev,
                              serviceTypes: prev.serviceTypes.filter(s => s !== serviceId)
                            }));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`service-${service.ID_Servicio}`} className="text-sm cursor-pointer">
                        {service.Nombre}
                      </label>
                    </div>
                  ))}
                </div>
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
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Agendar Servicio
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
                  <p className="text-xs text-muted-foreground mt-0.5">La hora es un aproximado y puede ser reasignado.</p>
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
      />
    </SidebarProvider>
  );
}