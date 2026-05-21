import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Phone, Home, MapPin, ArrowRight, User, FileText, Shield, CheckCircle, CheckCircle2 } from 'lucide-react';
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
  setTouchedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const stepInfo = [
  { label: 'Personal', icon: User, description: 'Información básica' },
  { label: 'Contacto', icon: Phone, description: 'Datos de contacto' },
  { label: 'Seguridad', icon: Shield, description: 'Crea tu contraseña' },
];

export function RegisterView({
  registerData,
  setRegisterData,
  registerErrors,
  touchedFields,
  activeStep,
  isLoading,
  handleNextStep,
  prevStep,
  setIsLogin,
  setTouchedFields
}: RegisterViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const today = new Date();
  const minDate = new Date(1950, 0, 1);
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  const renderFieldError = (field: string) => {
    if (touchedFields[field] && registerErrors[field]) {
      return <span className="rv-error-text">{registerErrors[field]}</span>;
    }
    return null;
  };

  const getFieldClass = (field: string) => {
    const hasError = touchedFields[field] && registerErrors[field];
    const isFocused = focusedField === field;
    return `rv-input-wrapper ${isFocused ? 'rv-input-focused' : ''} ${hasError ? 'rv-input-error' : ''}`;
  };

  return (
    <div className="rv-root">
      {/* Header */}
      <div className="rv-header">
        <h3 className="rv-title">Crear una cuenta</h3>
        <p className="rv-subtitle">
          ¿Ya tienes una cuenta?{' '}
          <button onClick={() => setIsLogin(true)} className="rv-link">
            Inicia sesión
          </button>
        </p>
      </div>

      {/* Step Indicator - Modern */}
      <div className="rv-steps">
        {stepInfo.map((step, index) => {
          const stepNum = index + 1;
          const isActive = activeStep === stepNum;
          const isCompleted = activeStep > stepNum;

          return (
            <div key={stepNum} className="rv-step-container">
              <div className={`rv-step ${isActive ? 'rv-step-active' : ''} ${isCompleted ? 'rv-step-completed' : ''}`}>
                <div className="rv-step-circle">
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <div className="rv-step-info">
                  <span className="rv-step-label">{step.label}</span>
                  <span className="rv-step-desc">{step.description}</span>
                </div>
              </div>
              {stepNum < 3 && (
                <div className={`rv-step-connector ${isCompleted ? 'rv-step-connector-active' : ''}`}>
                  <div className="rv-step-connector-fill" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form className="rv-form" onKeyDown={(e) => e.key === 'Enter' && handleNextStep()} noValidate>
        {/* Step 1: Personal Information */}
        {activeStep === 1 && (
          <div className="rv-step-content rv-animate-in">
            <div className="rv-grid-2">
              <div className="rv-field">
                <div className="rv-field-header">
                  <Label className="rv-label">Nombre *</Label>
                  {renderFieldError('nombre')}
                </div>
                <div className={getFieldClass('nombre')}>
                  <User className="rv-input-icon-inner" />
                  <Input
                    placeholder="Juan"
                    value={registerData.nombre}
                    onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '') })}
                    onFocus={() => {
                      setFocusedField('nombre');
                      setTouchedFields(prev => ({ ...prev, nombre: true }));
                    }}
                    onBlur={() => setFocusedField(null)}
                    className="rv-input focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              <div className="rv-field">
                <div className="rv-field-header">
                  <Label className="rv-label">Apellido *</Label>
                  {renderFieldError('apellido')}
                </div>
                <div className={getFieldClass('apellido')}>
                  <User className="rv-input-icon-inner" />
                  <Input
                    placeholder="Pérez"
                    value={registerData.apellido}
                    onChange={(e) => setRegisterData({ ...registerData, apellido: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '') })}
                    onFocus={() => {
                      setFocusedField('apellido');
                      setTouchedFields(prev => ({ ...prev, apellido: true }));
                    }}
                    onBlur={() => setFocusedField(null)}
                    className="rv-input focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </div>

            <div className="rv-grid-2">
              <div className="rv-field">
                <div className="rv-field-header">
                  <Label className="rv-label">Tipo de Documento *</Label>
                </div>
                <Select value={registerData.tipo_documento} onValueChange={(v) => setRegisterData({ ...registerData, tipo_documento: v })}>
                  <SelectTrigger className="rv-select-trigger">
                    <FileText className="rv-select-icon" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PP">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rv-field">
                <div className="rv-field-header">
                  <Label className="rv-label">Número de Documento *</Label>
                  {renderFieldError('documento')}
                </div>
                <div className={getFieldClass('documento')}>
                  <FileText className="rv-input-icon-inner" />
                  <Input
                    placeholder="12345678"
                    value={registerData.documento}
                    onChange={(e) => setRegisterData({ ...registerData, documento: e.target.value.replace(/\D/g, '') })}
                    onFocus={() => {
                      setFocusedField('documento');
                      setTouchedFields(prev => ({ ...prev, documento: true }));
                    }}
                    onBlur={() => setFocusedField(null)}
                    className="rv-input focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </div>

            <div className="rv-field">
              <div className="rv-field-header">
                <Label className="rv-label">Fecha de Nacimiento (Opcional)</Label>
                {renderFieldError('fecha_nacimiento')}
              </div>
              <DatePickerInput
                value={registerData.fecha_nacimiento}
                onChange={(v) => setRegisterData({ ...registerData, fecha_nacimiento: v })}
                minDate={minDate}
                maxDate={maxDate}
                placeholder="Seleccionar fecha"
                className="h-12 rv-date-input"
                error={!!(touchedFields.fecha_nacimiento && registerErrors.fecha_nacimiento)}
                onFocus={() => {
                  setFocusedField('fecha_nacimiento');
                  setTouchedFields(prev => ({ ...prev, fecha_nacimiento: true }));
                }}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact & Location */}
        {activeStep === 2 && (
          <div className="rv-step-content rv-animate-in">
            <div className="rv-grid-2">
              <div className="rv-field">
                <div className="rv-field-header">
                  <Label className="rv-label">Correo electrónico *</Label>
                  {renderFieldError('email')}
                </div>
                <div className={getFieldClass('email')}>
                  <Mail className="rv-input-icon-inner" />
                  <Input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    onFocus={() => {
                      setFocusedField('email');
                      setTouchedFields(prev => ({ ...prev, email: true }));
                    }}
                    onBlur={() => setFocusedField(null)}
                    className="rv-input focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              <div className="rv-field">
                <div className="rv-field-header">
                  <Label className="rv-label">Teléfono *</Label>
                  {renderFieldError('telefono')}
                </div>
                <div className={getFieldClass('telefono')}>
                  <Phone className="rv-input-icon-inner" />
                  <Input
                    placeholder="3001234567"
                    value={registerData.telefono}
                    onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value.replace(/\D/g, '') })}
                    onFocus={() => {
                      setFocusedField('telefono');
                      setTouchedFields(prev => ({ ...prev, telefono: true }));
                    }}
                    onBlur={() => setFocusedField(null)}
                    className="rv-input focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </div>

            <div className="rv-grid-2">
              <div className="rv-field">
                <div className="rv-field-header">
                  <Label className="rv-label">Barrio *</Label>
                  {renderFieldError('barrio')}
                </div>
                <div className={getFieldClass('barrio')}>
                  <Home className="rv-input-icon-inner" />
                  <Input
                    placeholder="Poblado"
                    value={registerData.barrio}
                    onChange={(e) => setRegisterData({ ...registerData, barrio: e.target.value })}
                    onFocus={() => {
                      setFocusedField('barrio');
                      setTouchedFields(prev => ({ ...prev, barrio: true }));
                    }}
                    onBlur={() => setFocusedField(null)}
                    className="rv-input focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              <div className="rv-field">
                <div className="rv-field-header">
                  <Label className="rv-label">Dirección *</Label>
                  {renderFieldError('direccion')}
                </div>
                <div className={getFieldClass('direccion')}>
                  <MapPin className="rv-input-icon-inner" />
                  <Input
                    placeholder="Calle 10 #20-30"
                    value={registerData.direccion}
                    onChange={(e) => setRegisterData({ ...registerData, direccion: e.target.value })}
                    onFocus={() => {
                      setFocusedField('direccion');
                      setTouchedFields(prev => ({ ...prev, direccion: true }));
                    }}
                    onBlur={() => setFocusedField(null)}
                    className="rv-input focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Password */}
        {activeStep === 3 && (
          <div className="rv-step-content rv-animate-in">
            <div className="rv-field">
              <div className="rv-field-header">
                <Label className="rv-label">Contraseña *</Label>
                {renderFieldError('contrasena')}
              </div>
              <div className={getFieldClass('contrasena')}>
                <Lock className="rv-input-icon-inner" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={registerData.contrasena}
                  onChange={(e) => setRegisterData({ ...registerData, contrasena: e.target.value })}
                  onFocus={() => {
                    setFocusedField('contrasena');
                    setTouchedFields(prev => ({ ...prev, contrasena: true }));
                  }}
                  onBlur={() => setFocusedField(null)}
                  className="rv-input rv-input-password focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="rv-toggle-pw">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="rv-tips">
                <p className="rv-tips-title">Requisitos de contraseña</p>
                <ul className="rv-tips-list">
                  {[
                    { label: 'Mínimo 8 caracteres', met: registerData.contrasena.length >= 8 },
                    { label: 'Al menos una mayúscula', met: /[A-Z]/.test(registerData.contrasena) },
                    { label: 'Al menos un número', met: /\d/.test(registerData.contrasena) },
                    { label: 'Al menos un carácter especial', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(registerData.contrasena) },
                  ].map((tip, i) => (
                    <li key={i} className={`rv-tip-item ${tip.met ? 'met' : ''}`}>
                      <span className={`rv-tip-check ${tip.met ? 'met' : ''}`}>
                        {tip.met && <CheckCircle2 style={{ width: 8, height: 8 }} />}
                      </span>
                      {tip.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rv-field">
              <div className="rv-field-header">
                <Label className="rv-label">Confirmar Contraseña *</Label>
                {renderFieldError('confirmarContrasena')}
              </div>
              <div className={getFieldClass('confirmarContrasena')}>
                <Lock className="rv-input-icon-inner" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={registerData.confirmarContrasena}
                  onChange={(e) => setRegisterData({ ...registerData, confirmarContrasena: e.target.value })}
                  onFocus={() => {
                    setFocusedField('confirmarContrasena');
                    setTouchedFields(prev => ({ ...prev, confirmarContrasena: true }));
                  }}
                  onBlur={() => setFocusedField(null)}
                  className="rv-input rv-input-password focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="rv-toggle-pw">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="rv-actions">
          {activeStep > 1 && (
            <Button type="button" variant="outline" onClick={prevStep} className="rv-back-btn">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Atrás
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNextStep}
            disabled={isLoading}
            className={`rv-next-btn ${activeStep === 1 ? 'rv-next-full' : ''}`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {activeStep === 3 ? 'Finalizar Registro' : 'Siguiente Paso'}
                {activeStep === 3 ? (
                  <CheckCircle className="w-4 h-4 ml-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 ml-2 rv-btn-arrow" />
                )}
              </>
            )}
          </Button>
        </div>
      </form>

      <style>{`
        .rv-root {
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
        }

        .rv-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .rv-title {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #4338ca, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .rv-subtitle {
          color: #6b7280 !important;
          font-size: 0.875rem !important;
        }

        .rv-link {
          color: #4f46e5;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          transition: color 0.2s ease;
        }

        .rv-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 2px;
          background: #4f46e5;
          transition: width 0.3s ease;
        }

        .rv-link:hover::after {
          width: 100%;
        }

        /* --- Step Indicator --- */
        .rv-steps {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          margin-bottom: 1.5rem;
          gap: 0;
        }

        .rv-step-container {
          display: flex;
          align-items: center;
        }

        .rv-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          background: transparent;
        }

        .rv-step-active {
          background: rgba(99, 102, 241, 0.08);
        }

        .rv-step-circle {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e2e8f0;
          color: #94a3b8;
          transition: all 0.3s ease;
        }

        .rv-step-active .rv-step-circle {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .rv-step-completed .rv-step-circle {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .rv-step-info {
          display: flex;
          flex-direction: column;
        }

        .rv-step-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: color 0.3s ease;
        }

        .rv-step-active .rv-step-label {
          color: #4f46e5;
        }

        .rv-step-completed .rv-step-label {
          color: #059669;
        }

        .rv-step-desc {
          font-size: 0.65rem;
          color: #cbd5e1;
          display: none;
        }

        .rv-step-active .rv-step-desc {
          color: #818cf8;
          display: block;
        }

        .rv-step-connector {
          width: 32px;
          height: 2px;
          background: #e2e8f0;
          margin: 0 0.25rem;
          border-radius: 2px;
          overflow: hidden;
        }

        .rv-step-connector-fill {
          width: 0%;
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          transition: width 0.5s ease;
        }

        .rv-step-connector-active .rv-step-connector-fill {
          width: 100%;
        }

        /* --- Form --- */
        .rv-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rv-step-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rv-animate-in {
          animation: rvSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes rvSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .rv-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        @media (max-width: 560px) {
          .rv-grid-2 {
            grid-template-columns: 1fr;
          }

          .rv-step-info {
            display: none;
          }

          .rv-step {
            padding: 0.5rem;
          }
        }

        .rv-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .rv-field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .rv-label {
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          color: #374151 !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .rv-error-text {
          font-size: 0.7rem;
          color: #ef4444;
          font-weight: 500;
          animation: rvShake 0.3s ease;
        }

        @keyframes rvShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        /* Input Wrapper */
        .rv-input-wrapper {
          position: relative;
          border-radius: 12px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rv-input-focused {
          border-color: #4f46e5 !important;
          background: #f8fafc !important;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.05) !important;
          outline: none !important;
        }

        .rv-input-focused .rv-input {
          box-shadow: none !important;
          outline: none !important;
        }

        .rv-input::selection {
          background: #c7d2fe !important;
          color: #1e1b4b !important;
        }

        .rv-input-error {
          border-color: #fca5a5 !important;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.08) !important;
        }

        .rv-input-icon-inner {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 15px;
          height: 15px;
          color: #9ca3af;
          z-index: 20 !important;
          transition: color 0.3s ease;
          pointer-events: none;
        }

        .rv-input-focused .rv-input-icon-inner {
          color: #6366f1;
        }

        .rv-input-error .rv-input-icon-inner {
          color: #ef4444;
        }

        .rv-input {
          padding-left: 38px !important;
          padding-right: 12px !important;
          height: 44px !important;
          border: none !important;
          background: transparent !important;
          font-size: 0.85rem !important;
          color: #1f2937 !important;
          box-shadow: none !important;
          outline: none !important;
        }

        /* --- Autofill Fixes --- */
        .rv-input:-webkit-autofill,
        .rv-input:-webkit-autofill:hover,
        .rv-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #1f2937 !important;
          -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
          transition: background-color 5000s ease-in-out 0s !important;
          background-color: transparent !important;
        }

        .rv-input:focus {
          box-shadow: none !important;
          outline: none !important;
        }

        .rv-input-password {
          padding-right: 44px !important;
        }

        .rv-toggle-pw {
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
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .rv-toggle-pw:hover {
          color: #6366f1;
          background: rgba(99, 102, 241, 0.08);
        }

        .rv-password-hint {
          font-size: 0.65rem;
          color: #94a3b8;
          margin-top: 0.25rem;
          padding-left: 0.25rem;
          line-height: 1.4;
        }

        /* --- Password tips --- */
        .rv-tips {
          margin-top: 0.75rem;
          padding: 0 0.25rem;
        }

        .rv-tips-title {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .rv-tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px 12px;
        }

        .rv-tip-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.725rem;
          color: #64748b;
          transition: color 0.2s ease;
        }

        .rv-tip-item.met {
          color: #10b981;
        }

        .rv-tip-check {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1.5px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .rv-tip-check.met {
          background: #10b981;
          border-color: #10b981;
          color: #fff;
        }

        /* Select */
        .rv-select-trigger {
          height: 44px !important;
          border-radius: 12px !important;
          border: 2px solid #e2e8f0 !important;
          background: #f8fafc !important;
          color: #1f2937 !important;
          padding-left: 38px !important;
          transition: all 0.3s ease !important;
        }

        .rv-select-trigger:focus,
        .rv-select-trigger[data-state="open"] {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
        }

        .rv-select-icon {
          position: absolute;
          left: 12px;
          width: 15px;
          height: 15px;
          color: #9ca3af;
          pointer-events: none;
        }

        /* Date Input */
        .rv-date-input {
          border-radius: 12px !important;
          border: 2px solid #e2e8f0 !important;
          background: #f8fafc !important;
          color: #1f2937 !important;
          transition: all 0.3s ease !important;
        }

        .rv-date-input:focus-within {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
        }

        /* Buttons */
        .rv-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .rv-back-btn {
          flex: 1;
          height: 48px !important;
          border: 2px solid #e2e8f0 !important;
          border-radius: 12px !important;
          color: #374151 !important;
          font-weight: 600 !important;
          background: #ffffff !important;
          transition: all 0.3s ease !important;
        }

        .rv-back-btn:hover {
          border-color: #c7d2fe !important;
          background: rgba(99, 102, 241, 0.04) !important;
          color: #4f46e5 !important;
        }

        .rv-next-btn {
          flex: 1;
          height: 48px !important;
          background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
          color: white !important;
          border: none !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3) !important;
        }

        .rv-next-full {
          width: 100%;
        }

        .rv-next-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4) !important;
        }

        .rv-next-btn:active {
          transform: translateY(0) !important;
        }

        .rv-next-btn:disabled {
          opacity: 0.7 !important;
          transform: none !important;
        }

        .rv-btn-arrow {
          transition: transform 0.3s ease;
        }

        .rv-next-btn:hover .rv-btn-arrow {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}