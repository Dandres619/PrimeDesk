import { CircleUserRound, CalendarCheck, LogOut, Sun, Moon } from 'lucide-react';
import { PiMotorcycle } from 'react-icons/pi';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../../ui/sidebar';

const clientMenuItems = [
  { id: 'perfil', label: 'Mi Perfil', icon: CircleUserRound },
  { id: 'motos', label: 'Mis Motos', icon: PiMotorcycle },
  { id: 'agendar', label: 'Agendar Servicio', icon: CalendarCheck },
];

interface ClientSidebarProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
  setShowLogoutConfirm: (show: boolean) => void;
  theme: string;
  toggleTheme: () => void;
  currentUser: any;
}

export function ClientSidebar({ activeSection, setActiveSection, setShowLogoutConfirm, theme, toggleTheme }: ClientSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <PiMotorcycle className="text-white text-xl" />
          </div>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-slate-900 dark:text-white leading-tight">PrimeDesk</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Cliente</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {clientMenuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => setActiveSection(item.id)}
                tooltip={item.label}
                className={`w-full transition-all duration-200 ${activeSection === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 p-2 space-y-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleTheme}
              tooltip={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="group-data-[collapsible=icon]:hidden">Cambiar Tema</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setShowLogoutConfirm(true)}
              tooltip="Cerrar Sesión"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5" />
              <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
