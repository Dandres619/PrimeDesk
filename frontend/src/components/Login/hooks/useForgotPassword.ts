import { useState, FormEvent } from 'react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Por favor ingrese su correo electrónico');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: forgotEmail })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al solicitar el restablecimiento');
      toast.success('Si el correo está registrado, recibirás instrucciones en breve.', { duration: 6000 });
      setShowForgotPasswordModal(false);
      setForgotEmail('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    forgotEmail,
    setForgotEmail,
    showForgotPasswordModal,
    setShowForgotPasswordModal,
    isLoading,
    handleForgotPassword
  };
}
