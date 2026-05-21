import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { MiPerfil } from '../MiPerfil/index';
import { useTheme } from '../../providers/ThemeProvider';
import { useClientData } from './hooks/useClientData';
import { ClientSidebar } from './components/ClientSidebar';
import { MotosSection } from './components/MotosSection';
import { AppointmentsSection } from './components/AppointmentsSection';
import { MotoDialog } from './components/MotoDialog';
import { ClientPanelStyles } from './styles/ClientPanelStyles';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { UserCircle, Sun, Moon } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React from 'react';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

interface ClientPanelProps {
  currentUser: { id?: number; id_cliente?: number; username: string; name: string; last_name: string };
  onLogout: () => void;
}

export function ClientPanel({ currentUser, onLogout }: ClientPanelProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const {
    isLoadingData,
    motos,
    agendamientos,
    mechanics,
    horarios,
    availableServices,
    novedades,
    reparaciones,
    fetchClientData
  } = useClientData();

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData, location.pathname]);

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

  const handleCreateMoto = () => {
    setEditingMoto(null);
    setMotoFormData({
      marca: '', modelo: '', ano: new Date().getFullYear(), placa: '', color: '', cilindraje: '', kilometraje: '' as any
    });
    setShowMotoModal(true);
  };

  const handleEditMoto = (moto: any) => {
    setEditingMoto(moto);
    // Asegurarse de que los nombres de campos coincidan (ano vs anio, etc si es necesario)
    setMotoFormData({
      ...moto,
      ano: moto.ano || moto.anio || new Date().getFullYear(),
      cilindraje: moto.cilindraje || moto.motor || ''
    });
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

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al guardar motocicleta');
      }

      toast.success(`Motocicleta ${editingMoto ? 'actualizada' : 'registrada'} exitosamente`);
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
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al eliminar motocicleta');
      }
      toast.success('Motocicleta eliminada');
      setShowDeleteMotoConfirm(false);
      fetchClientData(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeletingMoto(false);
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, string> = {
      completado: 'bg-green-100 text-green-800 border-green-200',
      en_proceso: 'bg-blue-100 text-blue-800 border-blue-200',
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return <Badge className={variants[estado.toLowerCase()] || 'bg-slate-100'}>{estado}</Badge>;
  };

  const clientMenuItems = [
    { id: 'perfil', label: 'Mi Perfil' },
    { id: 'motos', label: 'Mis Motocicletas' },
    { id: 'agendar', label: 'Agendar Servicio' },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <ClientPanelStyles />
        <ClientSidebar
          setShowLogoutConfirm={setShowLogoutConfirm}
          theme={theme}
          currentUser={currentUser}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="border-b border-border p-4 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <h1 className="text-xl font-semibold capitalize">
                  {clientMenuItems.find(item => `/cliente/${item.id}` === location.pathname)?.label || 'Panel Cliente'}
                </h1>
              </div>
              {currentUser && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <UserCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
              )}
            </div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto sidebar-scroll">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-slide-in">
              <Routes>
                <Route path="perfil" element={<MiPerfil />} />
                <Route path="motos" element={
                  <MotosSection
                    motos={motos}
                    isLoadingData={isLoadingData}
                    handleCreateMoto={handleCreateMoto}
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
                } />
                <Route path="agendar" element={
                  <AppointmentsSection
                    currentDate={currentDate}
                    isLoadingData={isLoadingData}
                    setCurrentDate={setCurrentDate}
                    motos={motos}
                    mechanics={mechanics}
                    availableServices={availableServices}
                    horarios={horarios}
                    novedades={novedades}
                    reparaciones={reparaciones}
                    agendamientos={agendamientos}
                    fetchClientData={fetchClientData}
                    currentUser={currentUser}
                  />
                } />
                <Route path="*" element={<Navigate to="perfil" replace />} />
              </Routes>
            </div>
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
