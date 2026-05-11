import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { MiPerfil } from '../MiPerfil/index';
import { useTheme } from '../ThemeProvider';
import { useClientData } from './hooks/useClientData';
import { ClientSidebar } from './components/ClientSidebar';
import { MotosSection } from './components/MotosSection';
import { AppointmentsSection } from './components/AppointmentsSection';
import { MotoDialog } from './components/MotoDialog';
import { AppointmentDialog } from './components/AppointmentDialog';
import { ClientPanelStyles } from './styles/ClientPanelStyles';
import { toast } from 'sonner';
import { parseISO, isBefore, startOfDay, isToday } from 'date-fns';
import { Badge } from '../ui/badge';
import { Loader2 } from 'lucide-react';
import React from 'react';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

interface ClientPanelProps {
  currentUser: { id?: number; id_cliente?: number; username: string; name: string; last_name: string };
  onLogout: () => void;
}

export function ClientPanel({ currentUser, onLogout }: ClientPanelProps) {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('perfil');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const {
    isLoadingData,
    motos,
    agendamientos,
    mechanics,
    horarios,
    availableServices,
    fetchClientData
  } = useClientData();

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData, activeSection]);

  const [showMotoModal, setShowMotoModal] = useState(false);
  const [editingMoto, setEditingMoto] = useState<any>(null);
  const [isSubmittingMoto, setIsSubmittingMoto] = useState(false);
  const [motoFormData, setMotoFormData] = useState({
    marca: '', modelo: '', ano: new Date().getFullYear(), placa: '', color: '', cilindraje: '', kilometraje: '' as any
  });
  const [motoHistory, setMotoHistory] = useState<any[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [selectedMotoForHistory, setSelectedMotoForHistory] = useState<number | null>(null);
  const [showDeleteMotoConfirm, setShowDeleteMotoConfirm] = useState(false);
  const [selectedMoto, setSelectedMoto] = useState<any>(null);
  const [isDeletingMoto, setIsDeletingMoto] = useState(false);

  const handleEditMoto = (moto: any) => {
    setEditingMoto(moto);
    setMotoFormData({ ...moto });
    setShowMotoModal(true);
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
      setMotoHistory(await res.json());
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
      const url = editingMoto ? `${API_URL}/motocicletas/${editingMoto.id}` : `${API_URL}/motocicletas`;
      const method = editingMoto ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
      if (!response.ok) throw new Error('Error al guardar la motocicleta');
      toast.success(editingMoto ? 'Moto actualizada' : 'Moto agregada');
      setShowMotoModal(false);
      setEditingMoto(null);
      fetchClientData(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingMoto(false);
    }
  };

  const handleDeleteMoto = (moto: any) => {
    setSelectedMoto(moto);
    setShowDeleteMotoConfirm(true);
  };

  const confirmDeleteMoto = async () => {
    setIsDeletingMoto(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/motocicletas/${selectedMoto.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al eliminar');
      toast.success('Moto eliminada');
      setShowDeleteMotoConfirm(false);
      fetchClientData(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeletingMoto(false);
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAgendarModal, setShowAgendarModal] = useState(false);
  const [agendarFormData, setAgendarFormData] = useState({
    motoId: 0, fecha: '', startTime: '', mecanicoId: 0, serviceIds: [] as number[], descripcion: ''
  });
  const [isSubmittingApt, setIsSubmittingApt] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);

  useEffect(() => {
    if (appointmentDetailsOpen && selectedAppointment) {
      console.log('Detalle de cita:', selectedAppointment.id);
    }
  }, [appointmentDetailsOpen, selectedAppointment]);

  const getAppointmentsForDate = (date: any) => {
    const dateStr = date.toISOString().split('T')[0];
    return agendamientos.filter((apt: any) => apt.fecha === dateStr);
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(startOfDay(date), startOfDay(new Date()))) {
      toast.error('No se pueden agendar servicios en fechas pasadas');
      return;
    }
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast.error('No se pueden agendar servicios los fines de semana');
      return;
    }
    setAgendarFormData({
      motoId: 0, fecha: date.toISOString().split('T')[0], startTime: '', mecanicoId: 0, serviceIds: [], descripcion: ''
    });
    setShowAgendarModal(true);
  };

  const getAvailableSlots = (mecanicoId: number, fecha: string) => {
    if (!mecanicoId || !fecha) return [];
    const selectedDate = parseISO(fecha);
    const daysMap: Record<number, string> = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };
    const dayName = daysMap[selectedDate.getDay()];
    const mechanicSched = horarios.filter((h: any) => h.ID_Empleado === mecanicoId && h.Dia === dayName && h.Estado);
    if (mechanicSched.length === 0) return [];
    const slots: string[] = [];
    mechanicSched.forEach((sched: any) => {
      const startStr = sched.HoraEntrada || sched.Hora_entrada;
      const endStr = sched.HoraSalida || sched.Hora_salida;
      let current = parseInt(startStr.split(':')[0]);
      const end = parseInt(endStr.split(':')[0]);
      while (current < end) {
        const slotTime = `${current.toString().padStart(2, '0')}:00`;
        if (isToday(selectedDate)) {
          const now = new Date();
          if (current < now.getHours() || (current === now.getHours() && now.getMinutes() > 0)) {
            current++; continue;
          }
        }
        const isOccupied = agendamientos.some((a: any) => a.mechanicId === mecanicoId && a.fecha === fecha && slotTime >= a.startTime && slotTime < a.endTime);
        if (!isOccupied) slots.push(slotTime);
        current++;
      }
    });
    return slots;
  };

  const handleSubmitAgendamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingApt(true);
    try {
      const token = localStorage.getItem('token');
      const [hours, minutes] = agendarFormData.startTime.split(':');
      const endTime = `${(parseInt(hours) + 1).toString().padStart(2, '0')}:${minutes}`;
      const response = await fetch(`${API_URL}/agendamientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
      if (!response.ok) throw new Error('Error al agendar');
      toast.success('Servicio agendado');
      setShowAgendarModal(false);
      fetchClientData(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingApt(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, string> = {
      completado: 'bg-green-100 text-green-800 border-green-200',
      en_proceso: 'bg-blue-100 text-blue-800 border-blue-200',
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return <Badge className={variants[estado.toLowerCase()] || 'bg-slate-100'}>{estado}</Badge>;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <ClientPanelStyles />
        <ClientSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          setShowLogoutConfirm={setShowLogoutConfirm}
          theme={theme}
          toggleTheme={toggleTheme}
          currentUser={currentUser}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="border-b border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-xl font-semibold capitalize text-slate-800 dark:text-slate-100">
                {activeSection === 'perfil' ? 'Mi Perfil' : activeSection === 'motos' ? 'Mis Motocicletas' : 'Agendar Cita'}
              </h1>
            </div>
          </header>

          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {isLoadingData ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
              {activeSection === 'perfil' && <MiPerfil />}
              {activeSection === 'motos' && (
                <MotosSection
                  motos={motos}
                  setShowMotoModal={setShowMotoModal}
                  handleEditMoto={handleEditMoto}
                  fetchMotoHistory={fetchMotoHistory}
                  handleDeleteMoto={handleDeleteMoto}
                  selectedMotoForHistory={selectedMotoForHistory}
                  setSelectedMotoForHistory={setSelectedMotoForHistory}
                  motoHistory={motoHistory}
                  isFetchingHistory={isFetchingHistory}
                  getMotoName={(id: number) => motos.find((m: any) => m.id === id)?.placa || ''}
                  getEstadoBadge={getEstadoBadge}
                />
              )}
              {activeSection === 'agendar' && (
                <AppointmentsSection
                  currentDate={currentDate}
                  setCurrentDate={setCurrentDate}
                  getAppointmentsForDate={getAppointmentsForDate}
                  handleDateClick={handleDateClick}
                  setSelectedAppointment={setSelectedAppointment}
                  setAppointmentDetailsOpen={setAppointmentDetailsOpen}
                />
              )}
            </div>
          )}
        </div>
      </main>

        <MotoDialog
          open={showMotoModal}
          onOpenChange={setShowMotoModal}
          editingMoto={editingMoto}
          formData={motoFormData}
          setFormData={setMotoFormData}
          isSubmitting={isSubmittingMoto}
          onSubmit={handleSubmitMoto}
        />

        <AppointmentDialog
          open={showAgendarModal}
          onOpenChange={setShowAgendarModal}
          formData={agendarFormData}
          setFormData={setAgendarFormData}
          motos={motos}
          mechanics={mechanics}
          availableServices={availableServices}
          getAvailableSlots={getAvailableSlots}
          isSubmitting={isSubmittingApt}
          onSubmit={handleSubmitAgendamiento}
        />

        <ConfirmDialog
          open={showDeleteMotoConfirm}
          onOpenChange={setShowDeleteMotoConfirm}
          title="Eliminar Motocicleta"
          description="¿Estás seguro de que deseas eliminar esta moto? Esta acción no se puede deshacer."
          onConfirm={confirmDeleteMoto}
          confirmText="Eliminar"
          loading={isDeletingMoto}
        />

        <ConfirmDialog
          open={showLogoutConfirm}
          onOpenChange={setShowLogoutConfirm}
          title="Cerrar Sesión"
          description="¿Estás seguro de que deseas salir del sistema?"
          onConfirm={onLogout}
          confirmText="Salir"
          variant="delete"
        />
      </div>
    </SidebarProvider>
  );
}
