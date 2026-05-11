import { useState, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface LoginViewProps {
  loginData: any;
  setLoginData: (data: any) => void;
  isLoading: boolean;
  handleLogin: (e: FormEvent) => void;
  setIsLogin: (isLogin: boolean) => void;
  setShowForgotPasswordModal: (show: boolean) => void;
}

export function LoginView({
  loginData,
  setLoginData,
  isLoading,
  handleLogin,
  setIsLogin,
  setShowForgotPasswordModal
}: LoginViewProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
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
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
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
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
  );
}
