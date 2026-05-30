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
    ClipboardPen
} from 'lucide-react';
import { PiMotorcycle, PiWrench } from 'react-icons/pi';

export const menuItems: any[] = [
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
    { id: 'mi-horario', label: 'Mi Horario', icon: AlarmClock, permission: 'ver_horario' },
    { id: 'agendamientos', label: 'Agendamientos', icon: CalendarClock, permission: 'gestionar_agendamientos' },
    { id: 'categorias-productos', label: 'Categorías', icon: Tags, permission: 'gestionar_categorias' },
    { id: 'productos', label: 'Productos', icon: PackageSearch, permission: 'gestionar_productos' },
    { id: 'proveedores', label: 'Proveedores', icon: Truck, permission: 'gestionar_proveedores' },
    { id: 'compras', label: 'Compras', icon: ShoppingBag, permission: 'gestionar_compras' },
    { id: 'ventas', label: 'Ventas', icon: CircleDollarSign, permission: 'gestionar_ventas' },
];

export const getPrefix = (type?: string) => {
    if (!type) return '';
    const t = type.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    if (t === 'administrador' || t === 'admin') return '/admin';
    if (t === 'cliente' || t === 'cli') return '/cliente';
    return `/${t}`;
};
