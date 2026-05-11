import { useState, FormEvent } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useLogin(onLogin: (userData: any) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: loginData.email,
          contrasena: loginData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));

      toast.success('¡Bienvenido al sistema!');

      try {
        const profileRes = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          onLogin({
            id: profileData.id_usuario,
            id_cliente: profileData.ID_Cliente,
            username: profileData.correo,
            name: profileData.NombreCliente || profileData.NombreEmpleado || profileData.correo,
            type: profileData.id_rol === 1 ? 'admin' : (profileData.id_rol === 2 ? 'empleado' : 'cliente'),
            permisos: profileData.permisos || []
          });
          return;
        }
      } catch (e) {
        console.error('Error fetching profile', e);
      }

      onLogin({
        id_cliente: data.usuario.id_cliente || null,
        username: data.usuario.correo,
        name: data.usuario.correo,
        type: data.usuario.id_rol === 1 ? 'admin' : (data.usuario.id_rol === 2 ? 'empleado' : 'cliente'),
        permisos: data.usuario.permisos || []
      });

    } catch (error: any) {
      toast.error(error.message || 'Error de conexión con el servidor');
      setLoginData({ ...loginData, password: '' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loginData,
    setLoginData,
    isLoading,
    handleLogin
  };
}
