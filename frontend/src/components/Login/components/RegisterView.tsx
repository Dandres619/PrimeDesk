import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Phone, Home, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { DatePickerInput } from '../../ui/DatePickerInput';

interface RegisterViewProps {
  registerData: any;
  setRegisterData: (data: any) => void;
  registerErrors: any;
  touchedFields: any;
  activeStep: number;
  isLoading: boolean;
  handleNextStep: () => void;
  prevStep: () => void;
  setIsLogin: (isLogin: boolean) => void;
}

export function RegisterView({
  registerData,
  setRegisterData,
  registerErrors,
  touchedFields,
  activeStep,
  isLoading,
  handleNextStep,
  prevStep,
  setIsLogin
}: RegisterViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  return (
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${activeStep >= step ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-12 h-0.5 mx-1 ${activeStep > step ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <form className="space-y-4 pt-4" onKeyDown={(e) => e.key === 'Enter' && handleNextStep()} noValidate>
        {activeStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700">Nombre *</Label>
                  {touchedFields.nombre && registerErrors.nombre && <span className="text-red-500 text-xs">{registerErrors.nombre}</span>}
                </div>
                <Input
                  placeholder="Juan"
                  value={registerData.nombre}
                  onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                  className={`border-gray-200 ${touchedFields.nombre && registerErrors.nombre ? 'border-red-500' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700">Apellido *</Label>
                  {touchedFields.apellido && registerErrors.apellido && <span className="text-red-500 text-xs">{registerErrors.apellido}</span>}
                </div>
                <Input
                  placeholder="Pérez"
                  value={registerData.apellido}
                  onChange={(e) => setRegisterData({ ...registerData, apellido: e.target.value })}
                  className={`border-gray-200 ${touchedFields.apellido && registerErrors.apellido ? 'border-red-500' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700">Tipo de Documento *</Label>
                </div>
                <Select value={registerData.tipo_documento} onValueChange={(v) => setRegisterData({ ...registerData, tipo_documento: v })}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PP">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700">Número de Documento *</Label>
                  {touchedFields.documento && registerErrors.documento && <span className="text-red-500 text-xs">{registerErrors.documento}</span>}
                </div>
                <Input
                  placeholder="12345678"
                  value={registerData.documento}
                  onChange={(e) => setRegisterData({ ...registerData, documento: e.target.value.replace(/\D/g, '') })}
                  className={`border-gray-200 ${touchedFields.documento && registerErrors.documento ? 'border-red-500' : ''}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-gray-700">Fecha de Nacimiento *</Label>
                {touchedFields.fecha_nacimiento && registerErrors.fecha_nacimiento && <span className="text-red-500 text-xs">{registerErrors.fecha_nacimiento}</span>}
              </div>
              <DatePickerInput
                value={registerData.fecha_nacimiento}
                onChange={(v) => setRegisterData({ ...registerData, fecha_nacimiento: v })}
                maxDate={new Date()}
                placeholder="Seleccionar fecha"
                className="h-12"
                error={!!(touchedFields.fecha_nacimiento && registerErrors.fecha_nacimiento)}
              />
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700">Correo electrónico *</Label>
                  {touchedFields.email && registerErrors.email && <span className="text-red-500 text-xs">{registerErrors.email}</span>}
                </div>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className={`pl-10 border-gray-200 ${touchedFields.email && registerErrors.email ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700">Teléfono *</Label>
                  {touchedFields.telefono && registerErrors.telefono && <span className="text-red-500 text-xs">{registerErrors.telefono}</span>}
                </div>
                <div className="relative group">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    placeholder="3001234567"
                    value={registerData.telefono}
                    onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value.replace(/\D/g, '') })}
                    className={`pl-10 border-gray-200 ${touchedFields.telefono && registerErrors.telefono ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700">Barrio *</Label>
                  {touchedFields.barrio && registerErrors.barrio && <span className="text-red-500 text-xs">{registerErrors.barrio}</span>}
                </div>
                <div className="relative group">
                  <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    placeholder="Poblado"
                    value={registerData.barrio}
                    onChange={(e) => setRegisterData({ ...registerData, barrio: e.target.value })}
                    className={`pl-10 border-gray-200 ${touchedFields.barrio && registerErrors.barrio ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700">Dirección *</Label>
                  {touchedFields.direccion && registerErrors.direccion && <span className="text-red-500 text-xs">{registerErrors.direccion}</span>}
                </div>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    placeholder="Calle 10 #20-30"
                    value={registerData.direccion}
                    onChange={(e) => setRegisterData({ ...registerData, direccion: e.target.value })}
                    className={`pl-10 border-gray-200 ${touchedFields.direccion && registerErrors.direccion ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-gray-700">Contraseña *</Label>
                {touchedFields.contrasena && registerErrors.contrasena && <span className="text-red-500 text-xs">{registerErrors.contrasena}</span>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={registerData.contrasena}
                  onChange={(e) => setRegisterData({ ...registerData, contrasena: e.target.value })}
                  className={`pl-10 pr-10 border-gray-200 ${touchedFields.contrasena && registerErrors.contrasena ? 'border-red-500' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-gray-700">Confirmar Contraseña *</Label>
                {touchedFields.confirmarContrasena && registerErrors.confirmarContrasena && <span className="text-red-500 text-xs">{registerErrors.confirmarContrasena}</span>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={registerData.confirmarContrasena}
                  onChange={(e) => setRegisterData({ ...registerData, confirmarContrasena: e.target.value })}
                  className={`pl-10 pr-10 border-gray-200 ${touchedFields.confirmarContrasena && registerErrors.confirmarContrasena ? 'border-red-500' : ''}`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-6">
          {activeStep > 1 && (
            <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12 border-gray-200 text-gray-700 hover:bg-gray-50">
              Atrás
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNextStep}
            disabled={isLoading}
            className={`flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 transition-all ${activeStep === 1 ? 'w-full' : ''}`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {activeStep === 3 ? 'Finalizar Registro' : 'Siguiente Paso'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
