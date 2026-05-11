import { useState } from 'react';
import { Bike, CheckCircle, User } from 'lucide-react';
import { Card } from '../ui/card';
import { useLogin } from './hooks/useLogin';
import { useRegister } from './hooks/useRegister';
import { useForgotPassword } from './hooks/useForgotPassword';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';

interface LoginProps {
  onLogin: (userData: any) => void;
  initialMode?: 'login' | 'register';
}

export function Login({ onLogin, initialMode = 'login' }: LoginProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');

  const {
    loginData,
    setLoginData,
    isLoading: isLoadingLogin,
    handleLogin
  } = useLogin(onLogin);

  const {
    registerData,
    setRegisterData,
    registerErrors,
    touchedFields,
    activeStep,
    isLoading: isLoadingRegister,
    handleNextStep,
    prevStep,
  } = useRegister(() => setIsLogin(true));

  const {
    forgotEmail,
    setForgotEmail,
    showForgotPasswordModal,
    setShowForgotPasswordModal,
    isLoading: isLoadingForgot,
    handleForgotPassword
  } = useForgotPassword();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Header (Mobile) */}
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
            <div className="lg:w-2/5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden text-white">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-300 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-xl mb-8">
                  <Bike className="w-8 h-8" />
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  {isLogin ? 'Bienvenido de nuevo' : 'Únete a nosotros'}
                </h2>
                <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                  {isLogin
                    ? 'Accede a tu panel de control y gestiona tus motocicletas con la mejor experiencia.'
                    : 'Crea tu cuenta y disfruta de todos los beneficios que tenemos para ti y tu moto.'}
                </p>

                <div className="space-y-4">
                  {[
                    'El mejor servicio de la ciudad',
                    'Agendamientos instantáneos',
                    'Soporte 24/7'
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-8 lg:mt-0">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <p className="text-white/90 text-sm italic">
                    "La mejor experiencia de mantenimiento que he tenido en Medellín. Totalmente recomendados."
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Darío Luna</p>
                      <p className="text-indigo-200 text-xs">Cliente desde 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Form Section */}
            <div className="lg:w-3/5 p-8 lg:p-12">
              {isLogin ? (
                <LoginView 
                  loginData={loginData}
                  setLoginData={setLoginData}
                  isLoading={isLoadingLogin}
                  handleLogin={handleLogin}
                  setIsLogin={setIsLogin}
                  setShowForgotPasswordModal={setShowForgotPasswordModal}
                />
              ) : (
                <RegisterView 
                  registerData={registerData}
                  setRegisterData={setRegisterData}
                  registerErrors={registerErrors}
                  touchedFields={touchedFields}
                  activeStep={activeStep}
                  isLoading={isLoadingRegister}
                  handleNextStep={handleNextStep}
                  prevStep={prevStep}
                  setIsLogin={setIsLogin}
                />
              )}
            </div>
          </div>
        </Card>
      </div>

      <ForgotPasswordModal 
        open={showForgotPasswordModal}
        onOpenChange={setShowForgotPasswordModal}
        email={forgotEmail}
        setEmail={setForgotEmail}
        isLoading={isLoadingForgot}
        onSubmit={handleForgotPassword}
      />
    </div>
  );
}
