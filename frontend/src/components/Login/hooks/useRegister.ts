import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { validateField } from '../utils/validation';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export function useRegister(onSuccess: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [registerData, setRegisterData] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: 'CC',
    documento: '',
    barrio: '',
    direccion: '',
    fecha_nacimiento: '',
    email: '',
    contrasena: '',
    confirmarContrasena: '',
    telefono: ''
  });
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const fields = Object.keys(registerData);
    fields.forEach(field => {
      const error = validateField(field, (registerData as any)[field], registerData, activeStep);
      if (error) newErrors[field] = error;
    });
    setRegisterErrors(newErrors);
  }, [registerData, activeStep]);

  const handleNextStep = async () => {
    const currentFields = activeStep === 1 
      ? ['nombre', 'apellido', 'documento', 'fecha_nacimiento']
      : activeStep === 2
      ? ['email', 'telefono', 'barrio', 'direccion']
      : ['contrasena', 'confirmarContrasena'];

    const newTouched = { ...touchedFields };
    currentFields.forEach(f => newTouched[f] = true);
    setTouchedFields(newTouched);

    const stepErrors: Record<string, string> = {};
    currentFields.forEach(f => {
      const err = validateField(f, (registerData as any)[f], registerData, activeStep);
      if (err) stepErrors[f] = err;
    });

    if (Object.keys(stepErrors).length > 0) {
      return;
    }

    if (activeStep === 2) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/auth/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo: registerData.email.toLowerCase().trim() })
        });
        if (!response.ok) throw new Error('Error al verificar correo');
        const data = await response.json();
        if (data.exists) {
          setRegisterErrors(prev => ({ ...prev, email: 'Correo ya registrado' }));
          toast.error('Este correo electrónico ya está registrado.');
          return;
        }
      } catch (error: any) {
        toast.error(error.message);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (activeStep === 3) {
      handleRegister();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: registerData.email,
          contrasena: registerData.contrasena,
          id_rol: 3,
          nombre: registerData.nombre,
          apellido: registerData.apellido,
          tipo_documento: registerData.tipo_documento,
          documento: registerData.documento,
          telefono: registerData.telefono || '',
          barrio: registerData.barrio,
          direccion: registerData.direccion,
          fecha_nacimiento: registerData.fecha_nacimiento
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }

      toast.success('Cuenta creada exitosamente. Por favor verifica tu correo.');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerData,
    setRegisterData,
    registerErrors,
    touchedFields,
    activeStep,
    setActiveStep,
    isLoading,
    handleNextStep,
    prevStep: () => setActiveStep(prev => prev - 1),
    setTouchedFields
  };
}
