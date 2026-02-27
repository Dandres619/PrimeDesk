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
import LandingPage from '@/components/landingPage';
import { ClientPanel } from '@/components/ClientPanel';
import { MiPerfil } from '@/components/MiPerfil';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { Empleados } from '@/components/Empleados';
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

const EmpleadosIcon = UserCheck;

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mi-perfil', label: 'Mi Perfil', icon: UserCircle },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'usuarios', label: 'Usuarios', icon: User },
    { id: 'empleados', label: 'Empleados', icon: EmpleadosIcon },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'motos', label: 'Motos', icon: Bike },
    { id: 'servicios', label: 'Servicios', icon: Wrench },
    { id: 'reparaciones', label: 'Reparaciones', icon: ClipboardList },
    { id: 'horarios', label: 'Horarios', icon: Clock },
    { id: 'agendamientos', label: 'Agendamientos', icon: Calendar },
    { id: 'categorias-productos', label: 'Categorías', icon: Tag },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    { id: 'compras', label: 'Compras', icon: ShoppingCart },
    { id: 'ventas', label: 'Ventas', icon: DollarSign },
];

function AppContent() {
    const { theme, toggleTheme } = useTheme();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLanding, setShowLanding] = useState(true);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [currentUser, setCurrentUser] = useState<{ id?: number; id_cliente?: number; username: string; name: string; type: string } | null>(null);

    const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setIsAuthenticated(true);
            setShowLanding(false);

            fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(profileData => {
                    setCurrentUser({
                        id: profileData.id_usuario,
                        id_cliente: profileData.ID_Cliente,
                        username: profileData.correo,
                        name: profileData.NombreCliente || profileData.NombreEmpleado || profileData.correo,
                        type: profileData.id_rol === 1 ? 'admin' : (profileData.id_rol === 2 ? 'empleado' : 'cliente')
                    });
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                    setCurrentUser(null);
                });
        }
    }, [API_URL]);

    const renderContent = () => {
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
        toast.success('Sesión cerrada exitosamente');
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
                <Toaster position="top-right" />
            </>
        );
    }

    if (!isAuthenticated && !showLanding) {
        return (
            <>
                <Login onLogin={handleLogin} initialMode={authMode} />
                <Button variant="ghost" onClick={() => setShowLanding(true)} className="fixed top-4 left-4">
                    ← Volver al inicio
                </Button>
                <Toaster position="top-right" />
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
                <Toaster position="top-right" />
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
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Administrador</p>
                                <p className="text-sm text-blue-600 dark:text-blue-500">Sistema</p>
                            </div>
                        )}
                    </SidebarHeader>

                    <SidebarContent className="p-4">
                        <SidebarMenu>
                            {menuItems.map((item) => (
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
                                    onClick={handleLogout}
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

            <Toaster position="top-right" />
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