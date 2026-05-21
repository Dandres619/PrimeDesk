import { useState, FormEvent } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useLogin(onLogin: (userData: any) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    const email = loginData.email.trim();
    const password = loginData.password;

    // Email Validations (Matching Registration Rules)
    if (!email) {
      toast.error('El correo electrónico no puede estar vacío');
      return;
    }
    if (email.length < 5) {
      toast.error('El correo electrónico debe tener al menos 5 caracteres');
      return;
    }
    if (email.length > 254) {
      toast.error('El correo electrónico no puede superar los 254 caracteres');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('El correo electrónico ingresado no es válido');
      return;
    }

    // Password Validations (Matching Registration Rules)
    if (!password) {
      toast.error('La contraseña no puede estar vacía');
      return;
    }
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password.length > 128) {
      toast.error('La contraseña no puede superar los 128 caracteres');
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
            last_name: profileData.ApellidoCliente || profileData.ApellidoEmpleado || '',
            type: profileData.NombreRol?.toLowerCase() || (profileData.id_rol === 1 ? 'admin' : (profileData.id_rol === 3 ? 'cliente' : 'empleado')),
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
        name: data.usuario.nombre || data.usuario.correo,
        last_name: data.usuario.apellido || '',
        type: data.usuario.nombre_rol?.toLowerCase() || (data.usuario.id_rol === 1 ? 'admin' : (data.usuario.id_rol === 3 ? 'cliente' : 'empleado')),
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
