import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UserCircle, LogOut, Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';
import { menuItems, getPrefix } from '@/config/menu';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme, toggleTheme } = useTheme();
    const { currentUser, handleLogout, showLogoutConfirm, setShowLogoutConfirm, confirmLogout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
                        {children}
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
