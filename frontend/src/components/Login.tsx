import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Bike, Eye, EyeOff, Mail, Lock, CreditCard, MapPin, Calendar, Home } from 'lucide-react';
import { toast } from 'sonner';

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

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    documentType: 'CC',
    documentNumber: '',
    neighborhood: '',
    address: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '' // Added phone field
  });

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  // Reset password state
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // @ts-ignore
  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error('Por favor complete todos los campos');
      return;
    }

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

      // Guardar token y datos
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));

      toast.success('¡Bienvenido al sistema!');

      // Intentar obtener el perfil completo para tener el nombre real si es cliente
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
            type: profileData.id_rol === 1 ? 'admin' : (profileData.id_rol === 2 ? 'empleado' : 'cliente')
          });
          return;
        }
      } catch (e) {
        console.error('Error fetching profile', e);
      }

      onLogin({
        id: data.usuario.id_usuario,
        id_cliente: null,
        username: data.usuario.correo,
        name: data.usuario.correo,
        type: data.usuario.id_rol === 1 ? 'admin' : (data.usuario.id_rol === 2 ? 'empleado' : 'cliente')
      });

    } catch (error: any) {
      toast.error(error.message || 'Error de conexión con el servidor');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.firstName || !registerData.lastName || !registerData.documentNumber ||
      !registerData.email || !registerData.password || !registerData.confirmPassword) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: registerData.email,
          contrasena: registerData.password,
          id_rol: 3, // Siempre cliente por defecto en el registro público
          nombre: registerData.firstName,
          apellido: registerData.lastName,
          tipo_documento: registerData.documentType,
          documento: registerData.documentNumber,
          telefono: registerData.phone || '0000000',
          barrio: registerData.neighborhood,
          direccion: registerData.address,
          fecha_nacimiento: registerData.birthDate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      toast.success('Registro exitoso. Ya puedes iniciar sesión');
      setIsLogin(true);
      setRegisterData({
        firstName: '',
        lastName: '',
        documentType: 'CC',
        documentNumber: '',
        neighborhood: '',
        address: '',
        birthDate: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Error de conexión');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast.error('Por favor ingrese su correo electrónico');
      return;
    }

    // Simular validación de correo y pasar al formulario de nueva contraseña
    toast.success('Correo validado. Ingrese su nueva contraseña');
    setShowForgotPasswordModal(false);
    setShowResetPassword(true);
    setForgotEmail('');
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

    if (resetPasswordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Simular cambio de contraseña exitoso
    toast.success('Contraseña cambiada correctamente');
    setShowResetPassword(false);
    setResetPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
  };

  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <Bike className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rafa Motos</h1>
            <p className="text-gray-600">Restablecer contraseña</p>
          </div>

          {/* Formulario de nueva contraseña */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-2xl">Nueva Contraseña</CardTitle>
              <p className="text-gray-600">
                Ingrese su nueva contraseña
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showResetNewPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={resetPasswordData.newPassword}
                      onChange={(e) => setResetPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="pl-10 pr-10"
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
                  <Label htmlFor="confirm-new-password">Confirmar nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-new-password"
                      type={showResetConfirmPassword ? "text" : "password"}
                      placeholder="Confirme su nueva contraseña"
                      value={resetPasswordData.confirmPassword}
                      onChange={(e) => setResetPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 pr-10"
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
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Cambiar Contraseña
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rafa Motos</h1>
          <p className="text-gray-600">Sistema de Gestión</p>
        </div>

        {/* Formulario de Login o Registro */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </CardTitle>
            <p className="text-gray-600">
              {isLogin ? 'Accede a tu cuenta para continuar' : 'Completa los datos para registrarte'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLogin ? (
              // Formulario de Login
              <>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Ingrese su correo"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingrese su contraseña"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Iniciar Sesión
                  </Button>
                </form>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">O</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsLogin(false)}
                  >
                    Crear nueva cuenta
                  </Button>
                </div>

              </>
            ) : (
              // Formulario de Registro
              <>
                <form onSubmit={handleRegister} className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Ingrese su nombre"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Ingrese su apellido"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="documentType">Tipo de documento</Label>
                      <select
                        id="documentType"
                        value={registerData.documentType}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, documentType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="PP">Pasaporte</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="documentNumber">Número de documento</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="documentNumber"
                          type="text"
                          placeholder="Número"
                          value={registerData.documentNumber}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, documentNumber: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Barrio</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="neighborhood"
                          type="text"
                          placeholder="Ingrese su barrio"
                          value={registerData.neighborhood}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, neighborhood: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Ingrese su teléfono"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        type="text"
                        placeholder="Ingrese su dirección"
                        value={registerData.address}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, address: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="birthDate"
                        type="date"
                        value={registerData.birthDate}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-password"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm-password">Confirmar contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-confirm-password"
                        type={showRegisterConfirmPassword ? "text" : "password"}
                        placeholder="Confirme su contraseña"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showRegisterConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Crear Cuenta
                  </Button>
                </form>

                <div className="space-y-4 mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">O</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsLogin(true)}
                  >
                    Ya tengo una cuenta
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Modal de Recuperar Contraseña */}
        <Dialog open={showForgotPasswordModal} onOpenChange={setShowForgotPasswordModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Recuperar contraseña</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-gray-600">
                Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
              </p>

              <div className="space-y-2">
                <Label htmlFor="forgot-email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Validar correo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}