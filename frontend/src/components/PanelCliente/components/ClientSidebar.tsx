import { CircleUserRound, CalendarCheck, LogOut } from 'lucide-react';
import { PiMotorcycle } from 'react-icons/pi';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../../ui/sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

const clientMenuItems = [
    { id: 'perfil', label: 'Mi Perfil', icon: CircleUserRound },
    { id: 'motos', label: 'Mis Motos', icon: PiMotorcycle },
    { id: 'agendar', label: 'Agendar Servicio', icon: CalendarCheck },
];

interface ClientSidebarProps {
    setShowLogoutConfirm: (show: boolean) => void;
    theme: string;
    currentUser: any;
}

export function ClientSidebar({ setShowLogoutConfirm, theme }: ClientSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const prefix = '/cliente';

    return (
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
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Panel Cliente</p>
                </div>
            </SidebarHeader>

            <SidebarContent className="p-4 overflow-y-auto sidebar-scroll">
                <SidebarMenu>
                    {clientMenuItems.map((item) => (
                        <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton
                                onClick={() => navigate(`${prefix}/${item.id}`)}
                                tooltip={item.label}
                                className={`w-full justify-start gap-3 p-3 rounded-lg transition-colors ${location.pathname === `${prefix}/${item.id}`
                                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                    : 'hover:bg-muted/50'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${location.pathname === `${prefix}/${item.id}` ? 'text-blue-700 dark:text-blue-400' : 'text-muted-foreground'}`} />
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
                                setShowLogoutConfirm(true);
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
    );
}
