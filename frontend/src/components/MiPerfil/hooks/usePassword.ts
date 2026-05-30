import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { validatePassword } from '../utils/validation';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function usePassword() {
    const [passwordData, setPasswordData] = useState({
        contrasena_actual: '',
        nueva_contrasena: '',
        confirmar_contrasena: ''
    });
    const [isProcessingPassword, setIsProcessingPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const token = localStorage.getItem('token');

    const handleBlur = (field: string) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
    };

    useEffect(() => {
        const errs: Record<string, string> = {};

        if (touchedFields.contrasena_actual && !passwordData.contrasena_actual) {
            errs.contrasena_actual = 'Ingresa la contraseña actual.';
        } else if (passwordData.contrasena_actual && passwordData.contrasena_actual.length > 60) {
            errs.contrasena_actual = 'Máximo 60 caracteres';
        }

        if (passwordData.nueva_contrasena) {
            if (passwordData.nueva_contrasena.length > 60) {
                errs.nueva_contrasena = 'Máximo 60 caracteres';
            } else if (!validatePassword(passwordData.nueva_contrasena)) {
                errs.nueva_contrasena = 'Contraseña insegura';
            }
        }

        if (passwordData.confirmar_contrasena) {
            if (passwordData.nueva_contrasena !== passwordData.confirmar_contrasena) {
                errs.confirmar_contrasena = 'Las contraseñas no coinciden';
            }
        }
        setPasswordErrors(errs);
    }, [passwordData, touchedFields]);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Verificar límite de tiempo (5 minutos) para seguridad
        const lastChange = localStorage.getItem('last_password_change');
        const now = Date.now();
        const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutos

        if (lastChange) {
            const timePassed = now - parseInt(lastChange);
            if (timePassed < COOLDOWN_TIME) {
                const remainingMs = COOLDOWN_TIME - timePassed;
                const remainingMins = Math.ceil(remainingMs / 60000);
                toast.warning(`Seguridad: Por favor espera ${remainingMins} minuto${remainingMins > 1 ? 's' : ''} antes de volver a cambiar tu contraseña.`);
                return;
            }
        }

        const allFields: Record<string, boolean> = { ...touchedFields };
        ['contrasena_actual', 'nueva_contrasena', 'confirmar_contrasena'].forEach(f => allFields[f] = true);
        setTouchedFields(allFields);

        if (!passwordData.contrasena_actual) {
            toast.error('Ingresa la contraseña actual.');
            return;
        }

        if (Object.keys(passwordErrors).length > 0) {
            toast.error('La nueva contraseña no cumple con los requisitos.');
            return;
        }

        setIsProcessingPassword(true);
        try {
            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contrasena_actual: passwordData.contrasena_actual,
                    nueva_contrasena: passwordData.nueva_contrasena
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cambiar contraseña');
            }

            // Registrar el tiempo del cambio exitoso
            localStorage.setItem('last_password_change', Date.now().toString());

            toast.success('Contraseña actualizada exitosamente');
            setPasswordData({ contrasena_actual: '', nueva_contrasena: '', confirmar_contrasena: '' });
            setTouchedFields({});
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessingPassword(false);
        }
    };

    return {
        passwordData,
        setPasswordData,
        isProcessingPassword,
        passwordErrors,
        touchedFields,
        handleBlur,
        handlePasswordSubmit,
        showCurrentPassword,
        setShowCurrentPassword,
        showNewPassword,
        setShowNewPassword,
        showConfirmPassword,
        setShowConfirmPassword
    };
}
