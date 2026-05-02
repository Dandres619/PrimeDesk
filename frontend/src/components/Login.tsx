import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bike,
  Eye,
  EyeOff,
  Mail,
  Lock,
  CreditCard,
  MapPin,
  Calendar as CalendarIcon,
  Home,
  User,
  Phone,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

function CustomDatePicker({ value, onChange, minAgeDate, onClose }: { value: string, onChange: (v: string) => void, minAgeDate: Date, onClose: () => void }) {
  const [view, setView] = useState<'days' | 'months' | 'years'>('years');
  const initialDate = value ? new Date(value + 'T00:00:00') : minAgeDate;
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [yearPage, setYearPage] = useState(
    initialDate.getFullYear() - (initialDate.getFullYear() % 12)
  );

  useEffect(() => {
    if (!value) setView('years');
    else setView('days');
  }, [value]);

  const handleYearSelect = (y: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(y);
    setCurrentDate(newDate);
    setView('months');
  };

  const handleMonthSelect = (m: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(m);
    setCurrentDate(newDate);
    setView('days');
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  if (view === 'years') {
    const years = Array.from({ length: 12 }, (_, i) => yearPage + i);
    return (
      <div className="p-3 w-[320px]">
        <div className="flex justify-between items-center mb-4">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYearPage(y => y - 12)} disabled={yearPage <= 1950}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="font-bold text-sm">{yearPage} - {yearPage + 11}</div>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYearPage(y => y + 12)} disabled={yearPage + 12 > minAgeDate.getFullYear()}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map(y => {
            const disabled = y > minAgeDate.getFullYear() || y < 1950;
            return (
              <Button type="button" key={y} variant={y === currentDate.getFullYear() ? 'default' : 'ghost'} className="text-sm h-9" disabled={disabled} onClick={() => handleYearSelect(y)}>{y}</Button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'months') {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return (
      <div className="p-3 w-[320px]">
        <div className="flex justify-between items-center mb-4">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={currentDate.getFullYear() <= 1950} onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setFullYear(newDate.getFullYear() - 1);
            setCurrentDate(newDate);
          }}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="font-bold text-sm cursor-pointer hover:bg-slate-100 px-2 py-1 rounded" onClick={() => {
            setYearPage(currentDate.getFullYear() - (currentDate.getFullYear() % 12));
            setView('years');
          }}>{currentDate.getFullYear()}</div>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={currentDate.getFullYear() >= minAgeDate.getFullYear()} onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setFullYear(newDate.getFullYear() + 1);
            setCurrentDate(newDate);
          }}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((m, i) => {
            const disabled = (currentDate.getFullYear() === minAgeDate.getFullYear() && i > minAgeDate.getMonth()) || currentDate.getFullYear() < 1950;
            return (
              <Button type="button" key={i} variant={i === currentDate.getMonth() ? 'default' : 'ghost'} disabled={disabled} className="text-sm h-9" onClick={() => handleMonthSelect(i)}>{m}</Button>
            );
          })}
        </div>
      </div>
    );
  }

  const isNextMonthDisabled = currentDate.getFullYear() === minAgeDate.getFullYear() && currentDate.getMonth() >= minAgeDate.getMonth();

  const isPrevMonthDisabled = currentDate.getFullYear() < 1950 || (currentDate.getFullYear() === 1950 && currentDate.getMonth() === 0);

  return (
    <div className="w-auto min-w-[320px]">
      <div className="flex justify-between items-center p-3 pb-0">
        <Button type="button" variant="outline" size="icon" className="h-7 w-7" disabled={isPrevMonthDisabled} onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <div className="font-bold text-sm cursor-pointer hover:bg-slate-100 px-3 py-1.5 rounded flex items-center capitalize" onClick={() => setView('months')}>
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </div>
        <Button type="button" variant="outline" size="icon" className="h-7 w-7" disabled={isNextMonthDisabled} onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <Calendar
        mode="single"
        selected={value ? new Date(value + 'T00:00:00') : undefined}
        onSelect={(d) => {
          if (d) {
            onChange(format(d, 'yyyy-MM-dd'));
            onClose();
          }
        }}
        month={currentDate}
        onMonthChange={setCurrentDate}
        disabled={(d) => d > minAgeDate || d < new Date(1950, 0, 1)}
        locale={es}
        className="p-3"
        classNames={{
          month_caption: "hidden",
          nav: "hidden",
          table: "w-full border-collapse mt-2",
          weekdays: "flex justify-between mb-2",
          weekday: "text-slate-500 rounded-md w-10 font-medium text-sm text-center uppercase",
          week: "flex w-full mt-1 justify-between",
          day: "h-10 w-10 p-0 font-medium text-center text-base relative aria-selected:bg-indigo-600 aria-selected:text-white rounded-lg hover:bg-slate-100 cursor-pointer flex items-center justify-center transition-colors",
          today: "bg-slate-100 text-slate-900 font-bold",
          outside: "text-slate-300 opacity-50",
        }}
      />
    </div>
  );
}

interface LoginProps {
  onLogin: (userData: any) => void;
  initialMode?: 'login' | 'register';
}

export function Login({ onLogin, initialMode = 'login' }: LoginProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Helper variables for validation
  const todayDate = new Date();
  const globalMinAgeDate = new Date(todayDate.getFullYear() - 18, todayDate.getMonth(), todayDate.getDate());



  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
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

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  // Reset password state
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Real-time validation
  useEffect(() => {
    setRegisterErrors(prev => {
      const errs = { ...prev };

      if (activeStep === 1) {
        if (!registerData.nombre) errs.nombre = 'No puede estar vacío';
        else delete errs.nombre;

        if (!registerData.apellido) errs.apellido = 'No puede estar vacío';
        else delete errs.apellido;

        if (!registerData.documento) errs.documento = 'No puede estar vacío';
        else if (!/^\d{7,10}$/.test(registerData.documento)) errs.documento = 'Entre 7 y 10 números';
        else delete errs.documento;

        if (!registerData.fecha_nacimiento) errs.fecha_nacimiento = 'No puede estar vacío';
        else {
          const selectedDate = new Date(registerData.fecha_nacimiento + 'T00:00:00');
          if (selectedDate > todayDate) {
            errs.fecha_nacimiento = 'La fecha no puede ser en el futuro';
          } else if (selectedDate > globalMinAgeDate) {
            errs.fecha_nacimiento = 'Debe ser mayor de 18 años';
          } else {
            delete errs.fecha_nacimiento;
          }
        }
      } else if (activeStep === 2) {
        if (!registerData.email) errs.email = 'No puede estar vacío';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) errs.email = 'Correo inválido';
        else if (errs.email !== 'Correo ya registrado') delete errs.email;

        if (!registerData.telefono) errs.telefono = 'No puede estar vacío';
        else if (!/^\d{7,10}$/.test(registerData.telefono)) errs.telefono = 'Entre 7 y 10 números';
        else delete errs.telefono;

        if (!registerData.barrio) errs.barrio = 'No puede estar vacío';
        else delete errs.barrio;

        if (!registerData.direccion) errs.direccion = 'No puede estar vacío';
        else {
          const addressRegex = /^(calle|carrera|cra|diagonal|diag|transversal|tv|avenida|av|circular|circ|vía|via|manzana|mz|lote)\s+[a-zA-Z0-9\s#-]+$/i;
          if (!addressRegex.test(registerData.direccion)) {
            errs.direccion = 'Dirección inválida (Ej: Calle 10 #20-30)';
          } else {
            delete errs.direccion;
          }
        }
      } else if (activeStep === 3) {
        if (!registerData.contrasena) errs.contrasena = 'No puede estar vacío';
        else {
          const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
          if (!passwordRegex.test(registerData.contrasena)) errs.contrasena = 'Contraseña insegura';
          else delete errs.contrasena;
        }

        if (!registerData.confirmarContrasena) errs.confirmarContrasena = 'No puede estar vacío';
        else {
          if (registerData.contrasena !== registerData.confirmarContrasena) errs.confirmarContrasena = 'No coinciden';
          else delete errs.confirmarContrasena;
        }
      }

      if (JSON.stringify(errs) !== JSON.stringify(prev)) {
        return errs;
      }
      return prev;
    });
  }, [registerData, activeStep, todayDate, globalMinAgeDate]);

  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

  const handleLogin = async (e: React.FormEvent) => {
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

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: registerData.email,
          contrasena: registerData.contrasena,
          id_rol: 3, // Default: Cliente
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
      setIsLogin(true);
      setRegisterData({
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
      setActiveStep(1);
    } catch (error: any) {
      toast.error(error.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setActiveStep(prev => prev + 1);
  };

  const prevStep = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleNextStep = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e && e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    if (e && e.type === 'click') e.preventDefault();

    if (activeStep === 1) {
      const errs: Record<string, string> = {};
      if (!registerData.nombre) errs.nombre = 'No puede estar vacío';
      if (!registerData.apellido) errs.apellido = 'No puede estar vacío';
      if (!registerData.documento) errs.documento = 'No puede estar vacío';
      else if (!/^\d{7,10}$/.test(registerData.documento)) errs.documento = 'Entre 7 y 10 números';

      if (!registerData.fecha_nacimiento) {
        errs.fecha_nacimiento = 'No puede estar vacío';
      } else {
        const selectedDate = new Date(registerData.fecha_nacimiento + 'T00:00:00');
        const today = new Date();
        const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

        if (selectedDate > today) {
          errs.fecha_nacimiento = 'La fecha no puede ser en el futuro';
        } else if (selectedDate > minAgeDate) {
          errs.fecha_nacimiento = 'Debe ser mayor de 18 años';
        }
      }

      if (Object.keys(errs).length > 0) {
        setRegisterErrors(errs);
        return;
      }
      setRegisterErrors({});
      nextStep();
    } else if (activeStep === 2) {
      const errs: Record<string, string> = {};
      if (!registerData.email) errs.email = 'No puede estar vacío';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) errs.email = 'Correo inválido';
      if (!registerData.barrio) errs.barrio = 'No puede estar vacío';
      if (!registerData.direccion) errs.direccion = 'No puede estar vacío';
      else {
        const addressRegex = /^(calle|carrera|cra|diagonal|diag|transversal|tv|avenida|av|circular|circ|vía|via|manzana|mz|lote)\s+[a-zA-Z0-9\s#-]+$/i;
        if (!addressRegex.test(registerData.direccion)) errs.direccion = 'Dirección inválida (Ej: Calle 10 #20-30)';
      }
      if (!registerData.telefono) errs.telefono = 'No puede estar vacío';
      else if (!/^\d{7,10}$/.test(registerData.telefono)) errs.telefono = 'Entre 7 y 10 números';

      if (Object.keys(errs).length > 0) {
        setRegisterErrors(errs);
        return;
      }

      // Verificar si el correo ya existe
      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/auth/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo: registerData.email.toLowerCase().trim() })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        if (data.exists) {
          setRegisterErrors({ email: 'Correo ya registrado' });
          toast.error('Este correo electrónico ya está registrado.');
          setIsLoading(false);
          return;
        }

        setRegisterErrors({});
        nextStep();
      } catch (error: any) {
        console.error('Error al verificar correo:', error);
        toast.error(`Error de conexión: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else if (activeStep === 3) {
      const errs: Record<string, string> = {};
      if (!registerData.contrasena) errs.contrasena = 'No puede estar vacío';
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (registerData.contrasena && !passwordRegex.test(registerData.contrasena)) {
        errs.contrasena = 'Contraseña insegura';
        toast.error('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial');
      }
      if (!registerData.confirmarContrasena) errs.confirmarContrasena = 'No puede estar vacío';
      if (registerData.contrasena !== registerData.confirmarContrasena) errs.confirmarContrasena = 'No coinciden';

      if (Object.keys(errs).length > 0) {
        setRegisterErrors(errs);
        return;
      }
      setRegisterErrors({});
      handleRegister();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
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

      if (!response.ok) {
        throw new Error(data.message || 'Error al solicitar el restablecimiento');
      }

      toast.success('Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña en breve.', {
        duration: 6000
      });
      setShowForgotPasswordModal(false);
      setForgotEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetPasswordData.newPassword || !resetPasswordData.confirmPassword) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(resetPasswordData.newPassword)) {
      toast.error('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial');
      return;
    }

    toast.success('Contraseña cambiada correctamente');
    setShowResetPassword(false);
    setResetPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
  };

  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
              <Bike className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Rafa Motos</h1>
            <p className="text-gray-500">Restablecer contraseña</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-2xl text-gray-800">Nueva Contraseña</CardTitle>
              <p className="text-gray-500">Ingrese su nueva contraseña</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-gray-700">Nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showResetNewPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={resetPasswordData.newPassword}
                      onChange={(e) => setResetPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="pl-10 pr-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showResetNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password" className="text-gray-700">Confirmar nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-new-password"
                      type={showResetConfirmPassword ? "text" : "password"}
                      placeholder="Confirme su nueva contraseña"
                      value={resetPasswordData.confirmPassword}
                      onChange={(e) => setResetPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 pr-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showResetConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200"
                  >
                    Cambiar Contraseña
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetPasswordData({
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                  >
                    Volver al inicio de sesión
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 lg:hidden">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-3 shadow-lg shadow-indigo-200">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Rafa Motos</h1>
          <p className="text-gray-500 text-sm">Sistema de Gestión Profesional</p>
        </div>

        <Card className="overflow-hidden shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row min-h-[650px]">

            {/* Left Panel - Hero Section */}
            <div className="lg:w-2/5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-300 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-xl mb-8">
                  <Bike className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {isLogin ? 'Bienvenido de nuevo' : 'Únete a nosotros'}
                </h2>

                <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                  {isLogin
                    ? 'Accede a tu panel de control y gestiona tus motocicletas con la mejor experiencia.'
                    : 'Crea tu cuenta y disfruta de todos los beneficios que tenemos para ti y tu moto.'}
                </p>

                {/* Feature List */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span>El mejor servicio de la ciudad</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span>Agendamientos para tu moto instantáneos</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span>Soporte 24/7</span>
                  </div>
                </div>
              </div>

              {/* Testimonial */}
              <div className="relative z-10 mt-8 lg:mt-0">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <p className="text-white/90 text-sm italic">
                    "La mejor experiencia de mantenimiento que he tenido en Medellín. Totalmente recomendados."
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Darío Luna</p>
                      <p className="text-indigo-200 text-xs">Cliente desde 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Form Section */}
            <div className="lg:w-3/5 p-8 lg:p-12">
              {isLogin ? (
                /* Login Form */
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Iniciar Sesión</h3>
                    <p className="text-gray-500">
                      ¿No tienes una cuenta?{' '}
                      <button
                        onClick={() => setIsLogin(false)}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                      >
                        Regístrate aquí
                      </button>
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Correo electrónico</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="sofiaplus@gmail.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPasswordModal(true)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10 pr-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 h-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-12 shadow-lg shadow-indigo-200"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        <>
                          Iniciar Sesión
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Proximamente inicio con Gmail</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 h-12"
                      onClick={() => setIsLogin(false)}
                    >
                      Crear nueva cuenta
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </div>
              ) : (
                /* Register Form - Multi-step */
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Crear una cuenta</h3>
                    <p className="text-gray-500">
                      ¿Ya tienes una cuenta?{' '}
                      <button
                        onClick={() => setIsLogin(true)}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                      >
                        Inicia sesión
                      </button>
                    </p>
                  </div>

                  {/* Steps Indicator */}
                  <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                          ${activeStep >= step
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : 'bg-gray-100 text-gray-400'}
                        `}>
                          {step}
                        </div>
                        {step < 3 && (
                          <div className={`
                            w-12 h-0.5 mx-1
                            ${activeStep > step ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-200'}
                          `} />
                        )}
                      </div>
                    ))}
                  </div>

                  <form className="space-y-4 pt-4" onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}>
                    {/* Step 1: Personal Information */}
                    {activeStep === 1 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="reg-nombre" className="text-gray-700">Nombre *</Label>
                              {registerErrors.nombre && <span className="text-red-500 text-xs">{registerErrors.nombre}</span>}
                            </div>
                            <Input
                              id="reg-nombre"
                              placeholder="Juan"
                              value={registerData.nombre}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, nombre: e.target.value }))}
                              className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 ${registerErrors.nombre ? 'border-red-500' : ''}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="reg-apellido" className="text-gray-700">Apellido *</Label>
                              {registerErrors.apellido && <span className="text-red-500 text-xs">{registerErrors.apellido}</span>}
                            </div>
                            <Input
                              id="reg-apellido"
                              placeholder="Pérez"
                              value={registerData.apellido}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, apellido: e.target.value }))}
                              className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 ${registerErrors.apellido ? 'border-red-500' : ''}`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="reg-doc-type" className="text-gray-700">Tipo Documento</Label>
                            <select
                              id="reg-doc-type"
                              value={registerData.tipo_documento}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, tipo_documento: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white"
                            >
                              <option value="CC">Cédula de Ciudadanía</option>
                              <option value="CE">Cédula de Extranjería</option>
                              <option value="TI">Tarjeta de Identidad</option>
                              <option value="PP">Pasaporte</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="reg-doc" className="text-gray-700">Número de documento *</Label>
                              {registerErrors.documento && <span className="text-red-500 text-xs">{registerErrors.documento}</span>}
                            </div>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                id="reg-doc"
                                placeholder="123456789"
                                value={registerData.documento}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, documento: e.target.value }))}
                                className={`pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 ${registerErrors.documento ? 'border-red-500' : ''}`}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="reg-nac" className="text-gray-700">Fecha de Nacimiento *</Label>
                            {registerErrors.fecha_nacimiento && <span className="text-red-500 text-xs">{registerErrors.fecha_nacimiento}</span>}
                          </div>
                          <div className="relative flex items-center">
                            <Input
                              id="reg-nac"
                              type="date"
                              max={format(globalMinAgeDate, 'yyyy-MM-dd')}
                              value={registerData.fecha_nacimiento}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, fecha_nacimiento: e.target.value }))}
                              className={`pl-3 pr-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 text-gray-500 [&::-webkit-calendar-picker-indicator]:hidden w-full ${registerErrors.fecha_nacimiento ? 'border-red-500' : ''}`}
                            />
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                              <PopoverTrigger asChild>
                                <button type="button" onClick={() => setIsCalendarOpen(true)} className="absolute right-3 p-1 text-gray-400 hover:text-indigo-600 transition-colors">
                                  <CalendarIcon className="h-5 w-5" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-xl overflow-hidden bg-white" align="end">
                                <CustomDatePicker
                                  value={registerData.fecha_nacimiento}
                                  onChange={(v) => setRegisterData(prev => ({ ...prev, fecha_nacimiento: v }))}
                                  minAgeDate={globalMinAgeDate}
                                  onClose={() => setIsCalendarOpen(false)}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Contact & Location */}
                    {activeStep === 2 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="reg-email" className="text-gray-700">Correo electrónico *</Label>
                            {registerErrors.email && <span className="text-red-500 text-xs">{registerErrors.email}</span>}
                          </div>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              id="reg-email"
                              type="email"
                              placeholder="nombre@ejemplo.com"
                              value={registerData.email}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                              className={`pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 ${registerErrors.email ? 'border-red-500' : ''}`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="reg-barrio" className="text-gray-700">Barrio *</Label>
                              {registerErrors.barrio && <span className="text-red-500 text-xs">{registerErrors.barrio}</span>}
                            </div>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                id="reg-barrio"
                                placeholder="El Poblado"
                                value={registerData.barrio}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, barrio: e.target.value }))}
                                className={`pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 ${registerErrors.barrio ? 'border-red-500' : ''}`}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="reg-tel" className="text-gray-700">Teléfono *</Label>
                              {registerErrors.telefono && <span className="text-red-500 text-xs">{registerErrors.telefono}</span>}
                            </div>
                            <div className="relative">
                              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                id="reg-tel"
                                type="tel"
                                placeholder="+57 300 123 4567"
                                value={registerData.telefono}
                                onChange={(e) => {
                                  const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                                  if (e.target.value !== onlyNums && e.target.value.length > 0) {
                                    // Let real-time validation handle format, but we aggressively strip non-numbers
                                  }
                                  setRegisterData(prev => ({ ...prev, telefono: onlyNums }));
                                }}
                                className={`pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 ${registerErrors.telefono ? 'border-red-500' : ''}`}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="reg-dir" className="text-gray-700">Dirección *</Label>
                            {registerErrors.direccion && <span className="text-red-500 text-xs">{registerErrors.direccion}</span>}
                          </div>
                          <div className="relative">
                            <Home className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              id="reg-dir"
                              placeholder="Calle 10 # 43-20"
                              value={registerData.direccion}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, direccion: e.target.value }))}
                              className={`pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 ${registerErrors.direccion ? 'border-red-500' : ''}`}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Password */}
                    {activeStep === 3 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="reg-password" className="text-gray-700">Contraseña *</Label>
                            {registerErrors.contrasena && <span className="text-red-500 text-xs max-w-[60%] text-right leading-tight">{registerErrors.contrasena}</span>}
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              id="reg-password"
                              type={showRegisterPassword ? "text" : "password"}
                              placeholder="********"
                              value={registerData.contrasena}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, contrasena: e.target.value }))}
                              className={`pl-10 pr-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 ${registerErrors.contrasena ? 'border-red-500' : ''}`}
                              minLength={8}
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                              {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1.5 ml-1">
                            Debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="reg-confirm-password" className="text-gray-700">Confirmar contraseña *</Label>
                            {registerErrors.confirmarContrasena && <span className="text-red-500 text-xs">{registerErrors.confirmarContrasena}</span>}
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              id="reg-confirm-password"
                              type={showRegisterConfirmPassword ? "text" : "password"}
                              placeholder="Repite tu contraseña"
                              value={registerData.confirmarContrasena}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, confirmarContrasena: e.target.value }))}
                              className={`pl-10 pr-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 ${registerErrors.confirmarContrasena ? 'border-red-500' : ''}`}
                              minLength={8}
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                              {showRegisterConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-indigo-900 mb-1">¿Por qué registrarte?</p>
                              <p className="text-sm text-indigo-700">
                                Accede a historial de servicios, recordatorios de mantenimiento y promociones exclusivas.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8">
                      {activeStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 h-12"
                        >
                          Anterior
                        </Button>
                      )}

                      {activeStep < 3 ? (
                        <Button
                          type="button"
                          onClick={(e) => handleNextStep(e)}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-12 shadow-lg shadow-indigo-200"
                        >
                          {isLoading && activeStep === 2 ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            <>
                              Continuar
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={(e) => handleNextStep(e)}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-12 shadow-lg shadow-indigo-200"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Registrando...
                            </>
                          ) : (
                            <>
                              Completar Registro
                              <CheckCircle className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordModal} onOpenChange={setShowForgotPasswordModal}>
        <DialogContent className="max-w-md bg-white border-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Recuperar acceso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-6 pt-2">
            <p className="text-gray-500 text-sm leading-relaxed">
              Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
            </p>

            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-gray-700">Correo electrónico</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="registrado@ejemplo.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar instrucciones'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}