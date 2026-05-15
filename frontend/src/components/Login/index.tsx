import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, CheckCircle, User, Sparkles } from 'lucide-react';
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
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleModeSwitch = (login: boolean) => {
    setTransitioning(true);
    setTimeout(() => {
      navigate(login ? '/login' : '/registro');
      setTimeout(() => {
        setTransitioning(false);
      }, 50);
    }, 300);
  };

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
    setTouchedFields,
  } = useRegister(() => handleModeSwitch(true));

  const {
    forgotEmail,
    setForgotEmail,
    showForgotPasswordModal,
    setShowForgotPasswordModal,
    isLoading: isLoadingForgot,
    handleForgotPassword
  } = useForgotPassword();

  return (
    <div className="login-page-wrapper" ref={containerRef}>
      {/* Animated Background Image */}
      <div className="login-bg-layer">
        <img
          src="/login-bg.png"
          alt=""
          className="login-bg-image"
          loading="eager"
        />
        <div className="login-bg-overlay" />
      </div>

      {/* Floating Particles */}
      <div className="login-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="login-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className={`login-container ${mounted ? 'login-mounted' : ''}`}>
        <div className="login-layout">
          {/* Left Panel - Hero + Branding */}
          <div className="login-hero-panel">
            <div className="login-hero-content">
              {/* Logo */}
              <div className="login-hero-logo">
                <div className="login-logo-icon">
                  <Bike className="w-8 h-8 text-white" />
                </div>
                <div className="login-logo-badge">
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>

              <h1 className="login-hero-title">
                Rafa Motos
              </h1>
              <p className="login-hero-subtitle">
                Sistema de Gestión Profesional
              </p>

              <div className="login-hero-divider" />

              <div className={`login-hero-text-wrapper ${transitioning ? 'login-hero-exit' : 'login-hero-enter'}`}>
                <h2 className="login-hero-heading">
                  {isLogin ? 'Bienvenido de nuevo' : 'Únete a nosotros'}
                </h2>
                <p className="login-hero-description">
                  {isLogin
                    ? 'Accede a tu panel de control y gestiona tus motocicletas con la mejor experiencia.'
                    : 'Crea tu cuenta y disfruta de todos los beneficios que tenemos para ti y tu moto.'}
                </p>
              </div>

              {/* Feature List */}
              <div className="login-features">
                {[
                  'El mejor servicio de la ciudad',
                  'Agendamientos instantáneos',
                  'Soporte 24/7'
                ].map((text, i) => (
                  <div
                    key={i}
                    className="login-feature-item"
                    style={{ animationDelay: `${0.6 + i * 0.15}s` }}
                  >
                    <div className="login-feature-icon">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="login-testimonial">
                <p className="login-testimonial-text">
                  "La mejor experiencia de mantenimiento que he tenido en Medellín. Totalmente recomendados."
                </p>
                <div className="login-testimonial-author">
                  <div className="login-testimonial-avatar">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="login-testimonial-name">Darío Luna</p>
                    <p className="login-testimonial-role">Cliente desde 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="login-form-panel">
            <div className={`login-form-inner ${transitioning ? 'login-form-exit' : 'login-form-enter'}`}>
              {isLogin ? (
                <LoginView
                  loginData={loginData}
                  setLoginData={setLoginData}
                  isLoading={isLoadingLogin}
                  handleLogin={handleLogin}
                  setIsLogin={(v: boolean) => handleModeSwitch(v)}
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
                  setIsLogin={(v: boolean) => handleModeSwitch(v)}
                  setTouchedFields={setTouchedFields}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        open={showForgotPasswordModal}
        onOpenChange={setShowForgotPasswordModal}
        email={forgotEmail}
        setEmail={setForgotEmail}
        isLoading={isLoadingForgot}
        onSubmit={handleForgotPassword}
      />

      <style>{`
        /* ===== LOGIN PAGE STYLES ===== */

        .login-page-wrapper {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow: hidden;
        }

        /* --- Background --- */
        .login-bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
        }

        .login-bg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.3) saturate(1.2);
          transform: scale(1.05);
          animation: loginBgZoom 30s ease-in-out infinite alternate;
        }

        @keyframes loginBgZoom {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }

        .login-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(79, 70, 229, 0.45) 0%,
            rgba(67, 56, 202, 0.35) 30%,
            rgba(109, 40, 217, 0.4) 60%,
            rgba(88, 28, 135, 0.5) 100%
          );
        }

        /* --- Particles --- */
        .login-particles {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }

        .login-particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          animation: loginFloat linear infinite;
        }

        @keyframes loginFloat {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% { opacity: 1; }
          50% {
            transform: translateY(-120px) translateX(30px) scale(1.3);
            opacity: 0.6;
          }
          90% { opacity: 0.1; }
        }

        /* --- Container --- */
        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1200px;
          opacity: 0;
          transform: translateY(30px) scale(0.97);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-container.login-mounted {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .login-layout {
          display: flex;
          border-radius: 24px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            0 32px 64px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset,
            0 -4px 24px rgba(99, 102, 241, 0.15) inset;
          min-height: 680px;
        }

        /* --- Hero Panel --- */
        .login-hero-panel {
          width: 42%;
          background: linear-gradient(
            160deg,
            rgba(79, 70, 229, 0.9) 0%,
            rgba(67, 56, 202, 0.85) 40%,
            rgba(109, 40, 217, 0.9) 100%
          );
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .login-hero-panel::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle at 30% 20%,
            rgba(255, 255, 255, 0.08) 0%,
            transparent 50%
          );
          animation: loginHeroShimmer 12s ease-in-out infinite alternate;
        }

        @keyframes loginHeroShimmer {
          0% { transform: translate(0, 0); }
          100% { transform: translate(5%, 5%); }
        }

        .login-hero-content {
          position: relative;
          z-index: 2;
        }

        .login-hero-logo {
          position: relative;
          display: inline-flex;
          margin-bottom: 1.5rem;
        }

        .login-logo-icon {
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .login-logo-icon:hover {
          transform: rotate(-5deg) scale(1.05);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .login-logo-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          animation: loginPulse 2s ease-in-out infinite;
        }

        @keyframes loginPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .login-hero-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }

        .login-hero-subtitle {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(199, 210, 254, 0.8);
          font-weight: 500;
        }

        .login-hero-divider {
          width: 48px;
          height: 3px;
          background: linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.1));
          border-radius: 3px;
          margin: 1.5rem 0;
        }

        .login-hero-heading {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          line-height: 1.2;
          margin-bottom: 0.75rem;
        }

        .login-hero-description {
          font-size: 0.9rem;
          color: rgba(199, 210, 254, 0.9);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        /* Features */
        .login-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .login-feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
          font-size: 0.85rem;
          font-weight: 500;
          opacity: 0;
          transform: translateX(-10px);
          animation: loginFeatureIn 0.5s ease forwards;
        }

        @keyframes loginFeatureIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .login-feature-icon {
          width: 24px;
          height: 24px;
          min-width: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Testimonial */
        .login-testimonial {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          transition: transform 0.3s ease;
        }

        .login-testimonial:hover {
          transform: translateY(-2px);
        }

        .login-testimonial-text {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.85);
          font-style: italic;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }

        .login-testimonial-author {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .login-testimonial-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .login-testimonial-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
        }

        .login-testimonial-role {
          font-size: 0.7rem;
          color: rgba(199, 210, 254, 0.7);
        }

        /* --- Form Panel --- */
        .login-form-panel {
          flex: 1;
          background: rgba(255, 255, 255, 0.95);
          padding: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          max-height: 90vh;
        }

        .login-form-inner {
          width: 100%;
          max-width: 480px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-form-enter {
          opacity: 1;
          transform: translateY(0);
        }

        .login-form-exit {
          opacity: 0;
          transform: translateY(10px);
        }

        .login-hero-text-wrapper {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-hero-enter {
          opacity: 1;
          transform: translateX(0);
        }

        .login-hero-exit {
          opacity: 0;
          transform: translateX(-15px);
        }

        /* --- Responsive --- */
        @media (max-width: 1024px) {
          .login-layout {
            flex-direction: column;
            min-height: auto;
          }

          .login-hero-panel {
            width: 100%;
            padding: 2rem;
          }

          .login-hero-heading {
            font-size: 1.5rem;
          }

          .login-testimonial {
            display: none;
          }

          .login-form-panel {
            max-height: none;
            padding: 2rem;
          }
        }

        @media (max-width: 640px) {
          .login-page-wrapper {
            padding: 0.5rem;
          }

          .login-layout {
            border-radius: 16px;
          }

          .login-hero-panel {
            padding: 1.5rem;
          }

          .login-hero-description,
          .login-features {
            display: none;
          }

          .login-form-panel {
            padding: 1.5rem;
          }

          .login-form-inner {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
