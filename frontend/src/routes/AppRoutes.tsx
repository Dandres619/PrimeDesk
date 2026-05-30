import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/providers/ThemeProvider';
import { AdminLayout } from '@/layouts/AdminLayout';
import { menuItems, getPrefix } from '@/config/menu';
import { PiMotorcycle } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

// Components
import { Dashboard } from '@/components/Dashboard';
import { Roles } from '@/components/Roles';
import { Usuarios } from '@/components/Usuarios';
import { Clientes } from '@/components/Clientes';
import { Motos } from '@/components/Motos';
import { Agendamientos } from '@/components/Agendamientos/index';
import { Proveedores } from '@/components/Proveedores/index';
import { Compras } from '@/components/Compras/index';
import { Ventas } from '@/components/Ventas/index';
import { Servicios } from '@/components/Servicios/index';
import { Horarios } from '@/components/Horarios/index';
import { Categorias } from '@/components/Categorias/index';
import { Productos } from '@/components/Productos/index';
import { Reparaciones } from '@/components/Reparaciones';
import { MiHorario } from '@/components/MiHorario/index';
import { Login } from '@/components/Login';
import LandingPage from '@/components/LandingPage';
import { ClientPanel } from '@/components/PanelCliente';
import { MiPerfil } from '@/components/MiPerfil';
import { Empleados } from '@/components/Empleados';
import { VerificarCuenta } from '@/components/VerificarCuenta';
import ResetPassword from '@/components/ResetPassword';

export const AppRoutes: React.FC = () => {
    const { 
        isAuthenticated, currentUser, isLoggingIn, isLoggingOut, 
        transitionPhase, logoutPhase, handleLogin, confirmLogout 
    } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [viewTransition, setViewTransition] = useState(false);

    const cleanUrlHash = () => {
        if (typeof window !== 'undefined' && window.location.hash) {
            window.history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    };

    const handleLandingLoginClick = () => {
        cleanUrlHash();
        setViewTransition(true);
        setTimeout(() => {
            navigate('/login');
            setTimeout(() => setViewTransition(false), 50);
        }, 250);
    };

    const handleLandingRegisterClick = () => {
        cleanUrlHash();
        setViewTransition(true);
        setTimeout(() => {
            navigate('/registro');
            setTimeout(() => setViewTransition(false), 50);
        }, 250);
    };

    const handleBackToLanding = () => {
        setViewTransition(true);
        setTimeout(() => {
            navigate('/inicio');
            setTimeout(() => setViewTransition(false), 50);
        }, 250);
    };

    const mainContent = () => {
        if (!isAuthenticated) {
            return (
                <div className="min-h-screen bg-[#0f172a]">
                    <div className={`transition-opacity duration-200 ease-linear ${viewTransition ? 'opacity-0' : 'opacity-100'}`}>
                        <Routes>
                            <Route path="/inicio" element={<LandingPage onLoginClick={handleLandingLoginClick} onRegisterClick={handleLandingRegisterClick} />} />
                            <Route path="/login" element={
                                <>
                                    <Login onLogin={handleLogin} initialMode="login" />
                                    <Button
                                        variant="ghost"
                                        onClick={handleBackToLanding}
                                        className="fixed top-6 left-6 z-[60] bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2 transition-all"
                                    >
                                        <span className="text-lg">←</span> Volver a Inicio
                                    </Button>
                                </>
                            } />
                            <Route path="/registro" element={
                                <>
                                    <Login onLogin={handleLogin} initialMode="register" />
                                    <Button
                                        variant="ghost"
                                        onClick={handleBackToLanding}
                                        className="fixed top-6 left-6 z-[60] bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2 transition-all"
                                    >
                                        <span className="text-lg">←</span> Volver a Inicio
                                    </Button>
                                </>
                            } />
                            <Route path="*" element={<Navigate to="/inicio" replace />} />
                        </Routes>
                    </div>
                </div>
            );
        }

        if (isAuthenticated && !currentUser) {
            return (
                <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'}`}>
                    <div className="flex flex-col items-center gap-4">
                        <PiMotorcycle className={`w-16 h-16 animate-pulse ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} />
                        <p className={`font-medium tracking-widest uppercase text-xs opacity-50 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Cargando perfil...
                        </p>
                    </div>
                </div>
            );
        }

        if (isAuthenticated && currentUser?.type === 'cliente') {
            return (
                <Routes>
                    <Route path="/cliente/*" element={
                        <ClientPanel
                            currentUser={currentUser}
                            onLogout={confirmLogout}
                        />
                    } />
                    <Route path="*" element={<Navigate to="/cliente/perfil" replace />} />
                </Routes>
            );
        }

        return (
            <AdminLayout>
                <Routes>
                    {menuItems.map(item => (
                        <Route
                            key={item.id}
                            path={`${getPrefix(currentUser?.type)}/${item.id}`}
                            element={
                                item.id === 'dashboard' ? <Dashboard /> :
                                item.id === 'mi-perfil' ? <MiPerfil /> :
                                item.id === 'roles' ? <Roles /> :
                                item.id === 'usuarios' ? <Usuarios /> :
                                item.id === 'empleados' ? <Empleados /> :
                                item.id === 'clientes' ? <Clientes /> :
                                item.id === 'motos' ? <Motos /> :
                                item.id === 'servicios' ? <Servicios /> :
                                item.id === 'reparaciones' ? <Reparaciones /> :
                                item.id === 'horarios' ? <Horarios /> :
                                item.id === 'mi-horario' ? <MiHorario /> :
                                item.id === 'agendamientos' ? <Agendamientos /> :
                                item.id === 'categorias-productos' ? <Categorias /> :
                                item.id === 'productos' ? <Productos /> :
                                item.id === 'proveedores' ? <Proveedores /> :
                                item.id === 'compras' ? <Compras /> :
                                item.id === 'ventas' ? <Ventas /> : <Dashboard />
                            }
                        />
                    ))}
                    <Route path="*" element={
                        <Navigate to={`${getPrefix(currentUser?.type)}${currentUser?.type === 'administrador' || currentUser?.permisos?.includes('gestionar_dashboard') ? '/dashboard' : '/agendamientos'}`} replace />
                    } />
                </Routes>
            </AdminLayout>
        );
    };

    return (
        <>
            <Routes>
                <Route path="/reset-password/*" element={<ResetPassword />} />
                <Route path="/verify/*" element={<VerificarCuenta />} />
                <Route path="/*" element={
                    <>
                        {mainContent()}

                        {/* Transition Overlay for Login/Logout - PERSISTENT AT TOP LEVEL */}
                        {(isLoggingOut || isLoggingIn) && (
                            <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-700 ease-in-out pointer-events-none ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'
                                } ${(logoutPhase === 'fading-in' || transitionPhase === 'fading-in') ? 'opacity-100 backdrop-blur-xl' : (logoutPhase === 'fading-out' || transitionPhase === 'fading-out') ? 'opacity-0 backdrop-blur-0' : 'opacity-0'
                                }`}>
                                <div className={`flex flex-col items-center gap-4 transition-all duration-500 ${(logoutPhase === 'fading-in' || transitionPhase === 'fading-in') ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                                    <PiMotorcycle className={`w-16 h-16 animate-pulse ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} />
                                    <p className={`font-medium tracking-widest uppercase text-xs opacity-50 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                        {isLoggingIn ? 'Preparando todo...' : 'Cerrando Sesión...'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                } />
            </Routes>
            <Toaster position="bottom-right" richColors expand={true} closeButton theme={theme as any} toastOptions={{ className: 'pointer-events-auto', style: { zIndex: 99999 } }} />
        </>
    );
};
