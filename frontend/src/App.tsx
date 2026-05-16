import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
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
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Login } from '@/components/Login';
import LandingPage from '@/components/LandingPage';
import { ClientPanel } from '@/components/PanelCliente';
import { MiPerfil } from '@/components/MiPerfil';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';
import { Empleados } from '@/components/Empleados';
import { VerificarCuenta } from '@/components/VerificarCuenta';
import {
    LayoutDashboard,
    ShieldCheck,
    UsersRound,
    UserCog,
    Contact,
    UserCircle,
    CalendarClock,
    AlarmClock,
    Truck,
    ShoppingBag,
    CircleDollarSign,
    PackageSearch,
    Tags,
    LogOut,
    Moon,
    Sun,
    ClipboardPen
} from 'lucide-react';
import { PiMotorcycle, PiWrench } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Toaster } from '@/components/ui/sonner';
import ResetPassword from '@/components/ResetPassword';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'gestionar_dashboard' },
    { id: 'mi-perfil', label: 'Mi Perfil', icon: UserCircle, permission: 'ver_perfil' },
    { id: 'roles', label: 'Roles', icon: ShieldCheck, permission: 'gestionar_roles' },
    { id: 'usuarios', label: 'Usuarios', icon: UserCog, permission: 'gestionar_usuarios' },
    { id: 'empleados', label: 'Empleados', icon: Contact, permission: 'gestionar_empleados' },
    { id: 'clientes', label: 'Clientes', icon: UsersRound, permission: 'gestionar_clientes' },
    { id: 'motos', label: 'Motos', icon: PiMotorcycle, permission: 'gestionar_motos' },
    { id: 'servicios', label: 'Servicios', icon: PiWrench, permission: 'gestionar_servicios' },
    { id: 'reparaciones', label: 'Reparaciones', icon: ClipboardPen, permission: 'gestionar_reparaciones' },
    { id: 'horarios', label: 'Horarios', icon: AlarmClock, permission: 'gestionar_horarios' },
    { id: 'agendamientos', label: 'Agendamientos', icon: CalendarClock, permission: 'gestionar_agendamientos' },
    { id: 'categorias-productos', label: 'Categorías', icon: Tags, permission: 'gestionar_categorias' },
    { id: 'productos', label: 'Productos', icon: PackageSearch, permission: 'gestionar_productos' },
    { id: 'proveedores', label: 'Proveedores', icon: Truck, permission: 'gestionar_proveedores' },
    { id: 'compras', label: 'Compras', icon: ShoppingBag, permission: 'gestionar_compras' },
    { id: 'ventas', label: 'Ventas', icon: CircleDollarSign, permission: 'gestionar_ventas' },
];

function AppContent() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [currentUser, setCurrentUser] = useState<{ id?: number; id_cliente?: number; username: string; name: string; last_name: string; type: string; permisos: string[] } | null>(null);
    const [viewTransition, setViewTransition] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [transitionPhase, setTransitionPhase] = useState<'idle' | 'fading-in' | 'fading-out'>('idle');
    const [logoutPhase, setLogoutPhase] = useState<'idle' | 'fading-in' | 'fading-out'>('idle');

    const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

    const getPrefix = (type?: string) => {
        const t = type?.toLowerCase();
        if (t === 'administrador' || t === 'admin') return '/admin';
        if (t === 'mecánico' || t === 'mecanico' || t === 'empleado' || t === 'mec') return '/mecanico';
        if (t === 'cliente' || t === 'cli') return '/cliente';
        return '';
    };

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setIsAuthenticated(true);

            fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(profileData => {
                    const type = profileData.id_rol === 1 ? 'administrador' : (profileData.id_rol === 2 ? 'mecánico' : 'cliente');
                    const permisos = profileData.permisos || [];

                    setCurrentUser({
                        id: profileData.id_usuario,
                        id_cliente: profileData.ID_Cliente,
                        username: profileData.correo,
                        name: profileData.NombreCliente || profileData.NombreEmpleado || profileData.correo,
                        last_name: profileData.ApellidoCliente || profileData.ApellidoEmpleado || '',
                        type,
                        permisos
                    });

                    if (type !== 'cliente') {
                        const prefix = getPrefix(type);
                        const isAtRoot = window.location.pathname === '/' || window.location.pathname === prefix || window.location.pathname === prefix + '/';

                        if (isAtRoot) {
                            if (permisos.includes('gestionar_dashboard')) {
                                navigate(`${prefix}/dashboard`);
                            } else {
                                const firstItem = menuItems.find(item => permisos.includes(item.permission));
                                if (firstItem) navigate(`${prefix}/${firstItem.id}`);
                            }
                        }
                    } else if (type === 'cliente') {
                        if (window.location.pathname === '/' || window.location.pathname === '/cliente') {
                            navigate('/cliente/perfil');
                        }
                    }
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                    setCurrentUser(null);
                });
        }
    }, [API_URL]);

    // Los chequeos manuales de 'path' han sido eliminados para usar Routes en el return principal

    // renderContent ha sido reemplazado por Routes directamente en el JSX


    const handleLogin = (userData: any) => {
        setIsLoggingIn(true);
        setTransitionPhase('fading-in');

        setTimeout(() => {
            setCurrentUser(userData);
            setIsAuthenticated(true);

            // Redirección basada en rol con prefijos
            const prefix = getPrefix(userData.type);
            if (userData.type === 'administrador') {
                navigate(`${prefix}/dashboard`);
            } else if (userData.type === 'cliente') {
                navigate('/cliente/perfil');
            } else if (userData.type === 'mecánico') {
                navigate(`${prefix}/agendamientos`);
            } else {
                // Fallback para otros roles
                if (userData.permisos?.includes('gestionar_dashboard')) {
                    navigate(`${prefix}/dashboard`);
                } else {
                    const firstItem = menuItems.find(item => userData.permisos?.includes(item.permission));
                    navigate(firstItem ? `${prefix}/${firstItem.id}` : `${prefix}/dashboard`);
                }
            }

            setTransitionPhase('fading-out');

            setTimeout(() => {
                setIsLoggingIn(false);
                setTransitionPhase('idle');
            }, 800);
        }, 800);
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setIsLoggingOut(true);
        setLogoutPhase('fading-in');
        setShowLogoutConfirm(false);

        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setCurrentUser(null);
            navigate('/inicio');

            setLogoutPhase('fading-out');

            setTimeout(() => {
                setIsLoggingOut(false);
                setLogoutPhase('idle');
            }, 800);
        }, 800);
    };

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
            setTimeout(() => {
                setViewTransition(false);
            }, 50);
        }, 250);
    };
    const handleLandingRegisterClick = () => {
        cleanUrlHash();
        setViewTransition(true);
        setTimeout(() => {
            navigate('/registro');
            setTimeout(() => {
                setViewTransition(false);
            }, 50);
        }, 250);
    };

    const handleBackToLanding = () => {
        setViewTransition(true);
        setTimeout(() => {
            navigate('/inicio');
            setTimeout(() => {
                setViewTransition(false);
            }, 50);
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
            <SidebarProvider>
                <div className="min-h-screen w-full md:flex">
                    <Sidebar className="border-r border-border">
                        <SidebarHeader className="border-b border-border p-6 flex flex-col items-center justify-center">
                            <div className="flex flex-col items-center gap-1 text-center py-2">
                                <div className="relative h-14 w-40 flex items-center justify-center">
                                    <img
                                        src="/favicon/rafamotos-logo.png"
                                        alt="Rafa Motos"
                                        className={`h-16 w-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain transition-all duration-300 ${theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                    />
                                    <img
                                        src="/favicon/rafamotos-logo-light.png"
                                        alt="Rafa Motos"
                                        className={`h-16 w-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain transition-all duration-300 ${theme === 'light' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                    />
                                </div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Panel Administrativo</p>
                            </div>
                        </SidebarHeader>

                        <SidebarContent className="p-4 overflow-y-auto sidebar-scroll">
                            <SidebarMenu>
                                {menuItems
                                    .filter(item => currentUser?.permisos?.includes(item.permission))
                                    .map((item) => (
                                        <SidebarMenuItem key={item.id}>
                                            <SidebarMenuButton
                                                onClick={() => navigate(`${getPrefix(currentUser?.type)}/${item.id}`)}
                                                tooltip={item.label}
                                                className={`w-full justify-start gap-3 p-3 rounded-lg transition-colors ${location.pathname === `${getPrefix(currentUser?.type)}/${item.id}` || (location.pathname === getPrefix(currentUser?.type) && item.id === 'dashboard')
                                                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                    : 'hover:bg-muted/50'
                                                    }`}
                                            >
                                                <item.icon className={`w-5 h-5 ${location.pathname === `${getPrefix(currentUser?.type)}/${item.id}` || (location.pathname === getPrefix(currentUser?.type) && item.id === 'dashboard') ? 'text-blue-700 dark:text-blue-400' : 'text-muted-foreground'}`} />
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
                                        onClick={(e) => {
                                            (e.currentTarget as HTMLButtonElement).blur();
                                            handleLogout();
                                        }}
                                        tooltip="Cerrar sesión"
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
                                    <SidebarTrigger className="-ml-1" />
                                    <h1 className="text-xl font-semibold capitalize">
                                        {menuItems.find(item => `${getPrefix(currentUser?.type)}/${item.id}` === location.pathname)?.label || 'Dashboard'}
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

                        <div className="flex-1 p-6 bg-muted/30 animate-fade-slide-in">
                            <Routes>
                                {menuItems.map(item => (
                                    <Route
                                        key={item.id}
                                        path={`${getPrefix(currentUser?.type)}/${item.id}`}
                                        element={item.id === 'dashboard' ? <Dashboard /> :
                                            item.id === 'mi-perfil' ? <MiPerfil /> :
                                                item.id === 'roles' ? <Roles /> :
                                                    item.id === 'usuarios' ? <Usuarios /> :
                                                        item.id === 'empleados' ? <Empleados /> :
                                                            item.id === 'clientes' ? <Clientes /> :
                                                                item.id === 'motos' ? <Motos /> :
                                                                    item.id === 'servicios' ? <Servicios /> :
                                                                        item.id === 'reparaciones' ? <Reparaciones /> :
                                                                            item.id === 'horarios' ? <Horarios /> :
                                                                                item.id === 'agendamientos' ? <Agendamientos /> :
                                                                                    item.id === 'categorias-productos' ? <Categorias /> :
                                                                                        item.id === 'productos' ? <Productos /> :
                                                                                            item.id === 'proveedores' ? <Proveedores /> :
                                                                                                item.id === 'compras' ? <Compras /> :
                                                                                                    item.id === 'ventas' ? <Ventas /> : <Dashboard />} />
                                ))}
                                <Route path="*" element={
                                    <Navigate to={`${getPrefix(currentUser?.type)}${currentUser?.type === 'administrador' || currentUser?.permisos?.includes('gestionar_dashboard') ? '/dashboard' : '/agendamientos'}`} replace />
                                } />
                            </Routes>
                        </div>
                    </main>
                </div>

                <ConfirmDialog
                    open={showLogoutConfirm}
                    onOpenChange={setShowLogoutConfirm}
                    title="Cerrar Sesión"
                    description="¿Estás seguro de que deseas cerrar tu sesión? Perderás cualquier trabajo no guardado."
                    confirmText="Cerrar Sesión"
                    onConfirm={confirmLogout}
                    variant="default"
                />
            </SidebarProvider>
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

                        <Toaster position="bottom-right" richColors expand={true} closeButton theme={theme as any} toastOptions={{ className: 'pointer-events-auto', style: { zIndex: 99999 } }} />

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
        </>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}