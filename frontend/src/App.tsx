import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Dashboard } from '@/components/Dashboard';
import { Roles } from '@/components/Roles';
import { Usuarios } from '@/components/Usuarios';
import { Clientes } from '@/components/Clientes';
import { Motos } from '@/components/Motos';
import { Agendamientos } from '@/components/Agendamientos';
import { Proveedores } from '@/components/Proveedores';
import { Compras } from '@/components/Compras';
import { Ventas } from '@/components/Ventas';
import { Servicios } from '@/components/Servicios';
import { Horarios } from '@/components/Horarios';
import { CategoriasProductos } from '@/components/CategoriasProductos';
import { Productos } from '@/components/Productos';
import { PedidosServicios } from '@/components/PedidosServicios';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Login } from '@/components/Login';
import LandingPage from '@/components/LandingPage';
import { ClientPanel } from '@/components/ClientPanel';
import { MiPerfil } from '@/components/MiPerfil';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { Empleados } from '@/components/Empleados';
import { Verify } from '@/components/Verify';
import {
    LayoutDashboard,
    Shield,
    Users,
    User,
    UserCheck,
    UserCircle,
    Bike,
    Calendar,
    Clock,
    Truck,
    ShoppingCart,
    DollarSign,
    Wrench,
    Package,
    Tag,
    LogOut,
    Menu,
    Moon,
    Sun,
    ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import ResetPassword from '@/components/ResetPassword';

const EmpleadosIcon = UserCheck;

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'gestionar_dashboard' },
    { id: 'mi-perfil', label: 'Mi Perfil', icon: UserCircle, permission: 'ver_perfil' },
    { id: 'roles', label: 'Roles', icon: Shield, permission: 'gestionar_roles' },
    { id: 'usuarios', label: 'Usuarios', icon: User, permission: 'gestionar_usuarios' },
    { id: 'empleados', label: 'Empleados', icon: EmpleadosIcon, permission: 'gestionar_empleados' },
    { id: 'clientes', label: 'Clientes', icon: Users, permission: 'gestionar_clientes' },
    { id: 'motos', label: 'Motos', icon: Bike, permission: 'gestionar_motos' },
    { id: 'servicios', label: 'Servicios', icon: Wrench, permission: 'gestionar_servicios' },
    { id: 'reparaciones', label: 'Reparaciones', icon: ClipboardList, permission: 'gestionar_reparaciones' },
    { id: 'horarios', label: 'Horarios', icon: Clock, permission: 'gestionar_horarios' },
    { id: 'agendamientos', label: 'Agendamientos', icon: Calendar, permission: 'gestionar_agendamientos' },
    { id: 'categorias-productos', label: 'Categorías', icon: Tag, permission: 'gestionar_categorias' },
    { id: 'productos', label: 'Productos', icon: Package, permission: 'gestionar_productos' },
    { id: 'proveedores', label: 'Proveedores', icon: Truck, permission: 'gestionar_proveedores' },
    { id: 'compras', label: 'Compras', icon: ShoppingCart, permission: 'gestionar_compras' },
    { id: 'ventas', label: 'Ventas', icon: DollarSign, permission: 'gestionar_ventas' },
];

function AppContent() {
    const { theme, toggleTheme } = useTheme();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLanding, setShowLanding] = useState(true);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [currentUser, setCurrentUser] = useState<{ id?: number; id_cliente?: number; username: string; name: string; last_name: string; type: string; permisos: string[] } | null>(null);

    const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setIsAuthenticated(true);
            setShowLanding(false);

            fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(profileData => {
                    const type = profileData.id_rol === 1 ? 'admin' : (profileData.id_rol === 2 ? 'empleado' : 'cliente');
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

                    // Set first available section if dashboard is not allowed
                    if (type !== 'cliente' && permisos.length > 0 && !permisos.includes('gestionar_dashboard')) {
                        const firstItem = menuItems.find(item => permisos.includes(item.permission));
                        if (firstItem) setActiveSection(firstItem.id);
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

    // Si la ruta es /reset-password, renderizamos el componente de restablecimiento
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    if (path && path.startsWith('/reset-password')) {
        return (
            <>
                <ResetPassword />
                <Toaster position="bottom-right" richColors expand={true} closeButton theme={theme as any} />
            </>
        );
    }

    if (path && path.startsWith('/verify')) {
        return (
            <>
                <Verify />
                <Toaster position="bottom-right" richColors expand={true} closeButton theme={theme as any} />
            </>
        );
    }

    const renderContent = () => {
        const activeItem = menuItems.find(item => item.id === activeSection);
        if (activeItem && currentUser?.permisos && !currentUser.permisos.includes(activeItem.permission)) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                    <Shield className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
                    <p className="text-muted-foreground">No tienes los permisos necesarios para ver este módulo.</p>
                </div>
            );
        }

        switch (activeSection) {
            case 'dashboard': return <Dashboard />;
            case 'mi-perfil': return <MiPerfil />;
            case 'roles': return <Roles />;
            case 'usuarios': return <Usuarios />;
            case 'empleados': return <Empleados />;
            case 'clientes': return <Clientes />;
            case 'motos': return <Motos />;
            case 'servicios': return <Servicios />;
            case 'reparaciones': return <PedidosServicios />;
            case 'horarios': return <Horarios />;
            case 'agendamientos': return <Agendamientos />;
            case 'categorias-productos': return <CategoriasProductos />;
            case 'productos': return <Productos />;
            case 'proveedores': return <Proveedores />;
            case 'compras': return <Compras />;
            case 'ventas': return <Ventas />;
            default: return <Dashboard />;
        }
    };

    const handleLogin = (userData: any) => {
        setCurrentUser(userData);
        setIsAuthenticated(true);
        setShowLanding(false);

        // Auto-redirect to first available section if no dashboard permission
        if (userData.type !== 'cliente' && userData.permisos && userData.permisos.length > 0) {
            if (!userData.permisos.includes('gestionar_dashboard')) {
                const firstItem = menuItems.find(item => userData.permisos.includes(item.permission));
                if (firstItem) setActiveSection(firstItem.id);
            }
        }
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setActiveSection('dashboard');
        setShowLanding(true);
        toast.success('Sesión cerrada exitosamente', { duration: 4000 });
        setShowLogoutConfirm(false);
    };

    const handleLandingLoginClick = () => {
        setAuthMode('login');
        setShowLanding(false);
    };
    const handleLandingRegisterClick = () => {
        setAuthMode('register');
        setShowLanding(false);
    };

    if (!isAuthenticated && showLanding) {
        return (
            <>
                <LandingPage onLoginClick={handleLandingLoginClick} onRegisterClick={handleLandingRegisterClick} />
                <Toaster position="bottom-right" richColors expand={true} closeButton theme={theme as any} />
            </>
        );
    }

    if (!isAuthenticated && !showLanding) {
        return (
            <>
                <Login onLogin={handleLogin} initialMode={authMode} />
                <Button variant="ghost" onClick={() => setShowLanding(true)} className="fixed top-4 left-4 z-50 bg-background/50 hover:bg-background/80 backdrop-blur-sm">
                    ← Volver
                </Button>
                <Toaster position="bottom-right" richColors expand={true} closeButton theme={theme as any} />
            </>
        );
    }

    if (isAuthenticated && currentUser?.type === 'cliente') {
        return (
            <>
                <ClientPanel
                    currentUser={currentUser}
                    onLogout={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setIsAuthenticated(false);
                        setCurrentUser(null);
                        setActiveSection('dashboard');
                        setShowLanding(true);
                    }}
                />
                <Toaster position="bottom-right" richColors expand={true} closeButton theme={theme as any} />
            </>
        );
    }

    // Si está autenticado como admin, mostrar el panel administrativo
    return (
        <SidebarProvider>
            <div className="min-h-screen w-full md:flex">
                <Sidebar className="border-r border-border">
                    <SidebarHeader className="border-b border-border p-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Bike className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg">Rafa Motos</h2>
                                <p className="text-sm text-muted-foreground">Panel Administrativo</p>
                            </div>
                        </div>
                        {currentUser && (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 space-y-1">
                                <p className="text-base font-bold text-blue-900 dark:text-blue-200">Bienvenido</p>
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">{currentUser.name} {currentUser.last_name}</p>
                                <p className="text-sm text-blue-600 dark:text-blue-500 capitalize">{currentUser.type}</p>
                            </div>
                        )}
                    </SidebarHeader>

                    <SidebarContent className="p-4 overflow-y-auto sidebar-scroll">
                        <SidebarMenu>
                            {menuItems
                                .filter(item => currentUser?.permisos?.includes(item.permission))
                                .map((item) => (
                                    <SidebarMenuItem key={item.id}>
                                        <SidebarMenuButton
                                            onClick={() => setActiveSection(item.id)}
                                            tooltip={item.label}
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
                                    onClick={handleLogout}
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
                                <SidebarTrigger>
                                    <Button variant="ghost" size="sm">
                                        <Menu className="w-5 h-5" />
                                    </Button>
                                </SidebarTrigger>
                                <h1 className="text-xl font-semibold capitalize">
                                    {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                                </h1>
                            </div>
                            {currentUser && (
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
                            )}
                        </div>
                    </header>

                    <div className="flex-1 p-6 bg-muted/30">
                        {renderContent()}
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
            <Toaster position="bottom-right" richColors expand={true} closeButton theme={theme as any} />
        </SidebarProvider>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}