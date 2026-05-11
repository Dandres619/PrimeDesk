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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div className="login-view-root">
      {/* Header */}
      <div className="lv-header">
        <h3 className="lv-title">Iniciar Sesión</h3>
        <p className="lv-subtitle">
          ¿No tienes una cuenta?{' '}
          <button
            onClick={() => setIsLogin(false)}
            className="lv-link"
          >
            Regístrate aquí
          </button>
        </p>
      </div>

      <form onSubmit={handleLogin} className="lv-form">
        {/* Email Field */}
        <div className="lv-field-group">
          <Label htmlFor="email" className="lv-label">Correo electrónico</Label>
          <div className={`lv-input-wrapper ${focusedField === 'email' ? 'lv-input-focused' : ''}`}>
            <Mail className="lv-input-icon" />
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="lv-input focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="lv-field-group">
          <div className="lv-label-row">
            <Label htmlFor="password" className="lv-label">Contraseña</Label>
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              className="lv-forgot-link"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className={`lv-input-wrapper ${focusedField === 'password' ? 'lv-input-focused' : ''}`}>
            <Lock className="lv-input-icon" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className="lv-input lv-input-password focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="lv-toggle-password"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="lv-submit-btn"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            <>
              Iniciar Sesión
              <ArrowRight className="w-4 h-4 ml-2 lv-btn-arrow" />
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="lv-divider">
          <div className="lv-divider-line" />
          <span className="lv-divider-text">Próximamente inicio con Gmail</span>
          <div className="lv-divider-line" />
        </div>

        {/* Create Account */}
        <Button
          type="button"
          variant="outline"
          className="lv-create-btn"
          onClick={() => setIsLogin(false)}
        >
          Crear nueva cuenta
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      <style>{`
        .login-view-root {
          width: 100%;
        }

        .lv-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .lv-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1e1b4b;
          letter-spacing: -0.03em;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #4338ca, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lv-subtitle {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .lv-link {
          color: #4f46e5;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          transition: color 0.2s ease;
        }

        .lv-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 2px;
          background: #4f46e5;
          transition: width 0.3s ease;
        }

        .lv-link:hover::after {
          width: 100%;
        }

        .lv-link:hover {
          color: #4338ca;
        }

        .lv-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .lv-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .lv-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .lv-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .lv-forgot-link {
          font-size: 0.75rem;
          color: #6366f1;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .lv-forgot-link:hover {
          color: #4338ca;
        }

        .lv-input-wrapper {
          position: relative;
          border-radius: 12px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .lv-input-wrapper::before {
          display: none; /* Eliminar el brillo que causaba expansion */
        }

        .lv-input-focused {
          border-color: #4f46e5 !important;
          background: white !important;
          box-shadow: none !important;
          outline: none !important;
        }

        .lv-input-focused .lv-input {
          box-shadow: none !important;
          outline: none !important;
        }

        .lv-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
          z-index: 1;
          transition: color 0.3s ease;
          pointer-events: none;
        }

        .lv-input-focused .lv-input-icon {
          color: #6366f1;
        }

        .lv-input {
          position: relative;
          z-index: 1;
          padding-left: 42px !important;
          padding-right: 12px !important;
          height: 48px !important;
          border: none !important;
          background: transparent !important;
          font-size: 0.9rem;
          box-shadow: none !important;
          outline: none !important;
        }

        .lv-input:focus {
          box-shadow: none !important;
          outline: none !important;
        }

        .lv-input-password {
          padding-right: 48px !important;
        }

        .lv-toggle-password {
          position: absolute;
          right: 12px !important;
          left: auto !important;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          color: #9ca3af;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .lv-toggle-password:hover {
          color: #6366f1;
          background: rgba(99, 102, 241, 0.08);
        }

        .lv-submit-btn {
          width: 100%;
          height: 48px !important;
          background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
          color: white !important;
          border: none !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 0.9rem !important;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3) !important;
          position: relative;
          overflow: hidden;
        }

        .lv-submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #4338ca, #6d28d9);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .lv-submit-btn:hover::before {
          opacity: 1;
        }

        .lv-submit-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4) !important;
        }

        .lv-submit-btn:active {
          transform: translateY(0) !important;
        }

        .lv-submit-btn:disabled {
          opacity: 0.7 !important;
          transform: none !important;
        }

        .lv-btn-arrow {
          transition: transform 0.3s ease;
        }

        .lv-submit-btn:hover .lv-btn-arrow {
          transform: translateX(4px);
        }

        .lv-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .lv-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
        }

        .lv-divider-text {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9ca3af;
          white-space: nowrap;
        }

        .lv-create-btn {
          width: 100%;
          height: 48px !important;
          border: 2px solid #e2e8f0 !important;
          border-radius: 12px !important;
          color: #374151 !important;
          font-weight: 600 !important;
          background: transparent !important;
          transition: all 0.3s ease !important;
        }

        .lv-create-btn:hover {
          border-color: #c7d2fe !important;
          background: rgba(99, 102, 241, 0.04) !important;
          color: #4f46e5 !important;
        }
      `}</style>
    </div>
  );
}
