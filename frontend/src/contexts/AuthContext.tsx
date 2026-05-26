import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrefix, menuItems } from '@/config/menu';

export interface User {
    id?: number;
    id_cliente?: number;
    username: string;
    name: string;
    last_name: string;
    type: string;
    permisos: string[];
}

interface AuthContextType {
    isAuthenticated: boolean;
    currentUser: User | null;
    isLoggingIn: boolean;
    isLoggingOut: boolean;
    transitionPhase: 'idle' | 'fading-in' | 'fading-out';
    logoutPhase: 'idle' | 'fading-in' | 'fading-out';
    handleLogin: (userData: any) => void;
    handleLogout: () => void;
    confirmLogout: () => void;
    showLogoutConfirm: boolean;
    setShowLogoutConfirm: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [transitionPhase, setTransitionPhase] = useState<'idle' | 'fading-in' | 'fading-out'>('idle');
    const [logoutPhase, setLogoutPhase] = useState<'idle' | 'fading-in' | 'fading-out'>('idle');

    const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setIsAuthenticated(true);

            fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(profileData => {
                    const type = profileData.NombreRol?.toLowerCase() || (profileData.id_rol === 1 ? 'administrador' : (profileData.id_rol === 3 ? 'cliente' : 'mecánico'));
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
    }, [API_URL, navigate]);

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

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            currentUser,
            isLoggingIn,
            isLoggingOut,
            transitionPhase,
            logoutPhase,
            handleLogin,
            handleLogout,
            confirmLogout,
            showLogoutConfirm,
            setShowLogoutConfirm
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
