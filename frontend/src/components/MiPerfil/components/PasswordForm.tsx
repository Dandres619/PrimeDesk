import React from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getPasswordStrength } from '../utils/validation';

interface PasswordFormProps {
    passwordData: any;
    setPasswordData: (data: any) => void;
    passwordErrors: Record<string, string>;
    touchedFields: Record<string, boolean>;
    handleBlur: (field: string) => void;
    handlePasswordSubmit: (e: React.FormEvent) => void;
    isProcessingPassword: boolean;
    showCurrentPassword: boolean;
    setShowCurrentPassword: (show: boolean) => void;
    showNewPassword: boolean;
    setShowNewPassword: (show: boolean) => void;
    showConfirmPassword: boolean;
    setShowConfirmPassword: (show: boolean) => void;
}

const FieldError = ({ field, errors, touched }: { field: string; errors: Record<string, string>; touched: Record<string, boolean> }) =>
    touched[field] && errors[field] ? (
        <p className="mp-field-error">
            <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} />
            {errors[field]}
        </p>
    ) : null;

export function PasswordForm({
    passwordData,
    setPasswordData,
    passwordErrors,
    touchedFields,
    handleBlur,
    handlePasswordSubmit,
    isProcessingPassword,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword
}: PasswordFormProps) {
    const pwdStrength = getPasswordStrength(passwordData.nueva_contrasena);

    return (
        <div className="mp-card">
            <div className="mp-card-header">
                <h3 className="mp-card-title">Seguridad</h3>
                <p className="mp-card-desc">Protege tu cuenta con una contraseña segura</p>
            </div>
            <div className="mp-card-body">
                <form onSubmit={handlePasswordSubmit} noValidate style={{ maxWidth: 480 }}>
                    <p className="mp-section-label">Cambiar contraseña</p>

                    <div className="mp-form-full">
                        <div className="mp-field">
                            <label className="mp-label">Contraseña actual <span className="mp-required">*</span></label>
                            <div className={`mp-input-wrap mp-pw-wrap ${touchedFields.contrasena_actual && passwordErrors.contrasena_actual ? 'mp-input-err' : ''}`}>
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordData.contrasena_actual}
                                    onChange={e => setPasswordData({ ...passwordData, contrasena_actual: e.target.value })}
                                    onFocus={() => handleBlur('contrasena_actual')}
                                    onBlur={() => handleBlur('contrasena_actual')}
                                    placeholder="Ingresa tu contraseña actual"
                                />
                                <button type="button" className="mp-pw-toggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                    {showCurrentPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                                </button>
                            </div>
                            <FieldError field="contrasena_actual" errors={passwordErrors} touched={touchedFields} />
                        </div>
                    </div>

                    <div className="mp-divider" />

                    <div className="mp-form-full">
                        <div className="mp-field">
                            <label className="mp-label">Nueva contraseña <span className="mp-required">*</span></label>
                            <div className={`mp-input-wrap mp-pw-wrap ${touchedFields.nueva_contrasena && passwordErrors.nueva_contrasena ? 'mp-input-err' : ''}`}>
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={passwordData.nueva_contrasena}
                                    onChange={e => setPasswordData({ ...passwordData, nueva_contrasena: e.target.value })}
                                    onFocus={() => handleBlur('nueva_contrasena')}
                                    onBlur={() => handleBlur('nueva_contrasena')}
                                    placeholder="Nueva contraseña"
                                />
                                <button type="button" className="mp-pw-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                                    {showNewPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                                </button>
                            </div>
                            {passwordData.nueva_contrasena && (
                                <div className="mp-pwd-strength">
                                    <div className="mp-pwd-bars">
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className="mp-pwd-bar"
                                                style={{ background: i <= pwdStrength.level ? pwdStrength.color : undefined }}
                                            />
                                        ))}
                                    </div>
                                    <span className="mp-pwd-label" style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
                                </div>
                            )}
                            <FieldError field="nueva_contrasena" errors={passwordErrors} touched={touchedFields} />
                        </div>
                    </div>

                    <div className="mp-form-full">
                        <div className="mp-field">
                            <label className="mp-label">Confirmar nueva contraseña <span className="mp-required">*</span></label>
                            <div className={`mp-input-wrap mp-pw-wrap ${touchedFields.confirmar_contrasena && passwordErrors.confirmar_contrasena ? 'mp-input-err' : ''}`}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={passwordData.confirmar_contrasena}
                                    onChange={e => setPasswordData({ ...passwordData, confirmar_contrasena: e.target.value })}
                                    onFocus={() => handleBlur('confirmar_contrasena')}
                                    onBlur={() => handleBlur('confirmar_contrasena')}
                                    placeholder="Confirma tu nueva contraseña"
                                />
                                <button type="button" className="mp-pw-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                                </button>
                            </div>
                            <FieldError field="confirmar_contrasena" errors={passwordErrors} touched={touchedFields} />
                        </div>
                    </div>

                    <div className="mp-tips">
                        <p className="mp-tips-title">Requisitos de contraseña</p>
                        <ul className="mp-tips-list">
                            {[
                                { label: 'Mínimo 8 caracteres', met: passwordData.nueva_contrasena.length >= 8 },
                                { label: 'Al menos una mayúscula', met: /[A-Z]/.test(passwordData.nueva_contrasena) },
                                { label: 'Al menos un número', met: /\d/.test(passwordData.nueva_contrasena) },
                                { label: 'Al menos un carácter especial', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.nueva_contrasena) },
                            ].map((tip, i) => (
                                <li key={i} className="mp-tip-item">
                                    <span className={`mp-tip-check ${tip.met ? 'met' : ''}`}>
                                        {tip.met && <CheckCircle2 style={{ width: 10, height: 10 }} />}
                                    </span>
                                    {tip.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mp-submit-row" style={{ marginTop: 28 }}>
                        <button
                            type="submit"
                            disabled={isProcessingPassword || passwordData.nueva_contrasena.length === 0}
                            className="mp-btn-secondary"
                        >
                            {isProcessingPassword ? (
                                <>
                                    <div className="mp-loading-ring" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#2563eb' }} />
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <Lock style={{ width: 15, height: 15 }} />
                                    Actualizar contraseña
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
