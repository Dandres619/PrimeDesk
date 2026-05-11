import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useResetPassword() {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('token');
        setToken(t);
    }, []);

    const resetPassword = async (password: string, confirm: string) => {
        if (!token) {
            toast.error('Token faltante en la URL');
            return false;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
            toast.error('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial');
            return false;
        }

        if (password !== confirm) {
            toast.error('Las contraseñas no coinciden');
            return false;
        }

        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, nueva_contrasena: password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error al restablecer la contraseña');

            setIsSuccess(true);
            toast.success('Contraseña restablecida con éxito');
            setTimeout(() => { window.location.href = '/'; }, 3000);
            return true;
        } catch (err: any) {
            toast.error(err.message || 'Error de conexión');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        token,
        loading,
        isSuccess,
        resetPassword
    };
}
