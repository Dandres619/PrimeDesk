import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useVerify() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verificando tu cuenta...');
    const hasCalled = useRef(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Token de verificación no encontrado.');
            return;
        }

        if (hasCalled.current) return;
        hasCalled.current = true;

        const verifyEmail = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message || '¡Correo verificado con éxito!');
                    toast.success('Cuenta verificada correctamente');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Error al verificar el correo.');
                    toast.error(data.message || 'Error de verificación');
                }
            } catch (error) {
                console.error('Error verifying email:', error);
                setStatus('error');
                setMessage('Error de conexión con el servidor.');
                toast.error('Error de conexión');
            }
        };

        verifyEmail();
    }, []);

    return { status, message };
}
