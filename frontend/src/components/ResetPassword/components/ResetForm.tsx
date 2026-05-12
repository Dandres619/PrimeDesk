import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Lock, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ResetFormProps {
    onSubmit: (password: string, confirm: string) => Promise<boolean>;
    loading: boolean;
}

export function ResetForm({ onSubmit, loading }: ResetFormProps) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const requirements = [
        { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
        { label: 'Una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
        { label: 'Un número', test: (p: string) => /[0-9]/.test(p) }
    ];

    const passwordsMatch = confirm.length > 0 && password === confirm;
    const allRequirementsMet = requirements.every(r => r.test(password));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!allRequirementsMet) {
            toast.error('La contraseña no cumple con los requisitos de seguridad');
            return;
        }

        if (password !== confirm) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        onSubmit(password, confirm);
    };

    return (
        <form onSubmit={handleSubmit} className="lv-form" noValidate>
            <div className="lv-field-group">
                <Label className="lv-label">Nueva Contraseña</Label>
                <div className={`lv-input-wrapper ${focusedField === 'password' ? 'lv-input-focused' : ''}`}>
                    <Lock className="lv-input-icon" />
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="lv-input lv-input-password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="lv-toggle-password"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>

                {/* Password Requirements UI */}
                <div className="pt-2 grid grid-cols-1 gap-1.5 px-2">
                    {requirements.map((req, i) => {
                        const isMet = req.test(password);
                        return (
                            <div key={i} className="flex items-center gap-2 text-[10px] transition-all duration-300">
                                {isMet ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                    <div className="h-3 w-3 rounded-full border border-gray-300" />
                                )}
                                <span className={isMet ? "text-green-600 font-bold" : "text-gray-500"}>
                                    {req.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="lv-field-group">
                <div className="lv-label-row">
                    <Label className="lv-label">Confirmar Nueva Contraseña</Label>
                </div>
                <div className={`lv-input-wrapper ${focusedField === 'confirm' ? 'lv-input-focused' : ''} ${confirm.length > 0 ? (passwordsMatch ? 'border-green-500/50' : 'border-red-500/50') : ''}`}>
                    <ShieldCheck className={`lv-input-icon ${confirm.length > 0 ? (passwordsMatch ? 'text-green-600' : 'text-red-500') : ''}`} />
                    <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repite tu contraseña"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        onFocus={() => setFocusedField('confirm')}
                        onBlur={() => setFocusedField(null)}
                        className="lv-input lv-input-password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="lv-toggle-password"
                    >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                className="lv-submit-btn"
                disabled={loading}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Procesando...
                    </span>
                ) : (
                    <>
                        Restablecer Contraseña
                        <ShieldCheck className="w-4 h-4 lv-btn-arrow" />
                    </>
                )}
            </Button>

            <Button
                type="button"
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="lv-create-btn"
                style={{ border: 'none', height: 'auto', marginTop: '0.5rem' }}
            >
                Cancelar
            </Button>

            <style>{`
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
                    color: #374151 !important;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .lv-label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .lv-input-wrapper {
                    position: relative;
                    border-radius: 12px;
                    background: #f8fafc;
                    border: 2px solid #e2e8f0;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    height: 48px;
                }

                .lv-input-focused {
                    border-color: #4f46e5 !important;
                    background: #f8fafc !important;
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.05) !important;
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
                }

                .lv-input-focused .lv-input-icon {
                    color: #6366f1;
                }

                .lv-input {
                    width: 100%;
                    padding-left: 42px !important;
                    padding-right: 12px !important;
                    height: 100% !important;
                    border: none !important;
                    background: transparent !important;
                    font-size: 0.9rem !important;
                    color: #1f2937 !important;
                    box-shadow: none !important;
                    outline: none !important;
                }

                .lv-input::selection {
                    background: #c7d2fe !important;
                    color: #1e1b4b !important;
                }

                .lv-input-password {
                    padding-right: 48px !important;
                }

                .lv-toggle-password {
                    position: absolute;
                    right: 12px;
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
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
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
                }

                .lv-btn-arrow {
                    transition: transform 0.3s ease;
                }

                .lv-submit-btn:hover .lv-btn-arrow {
                    transform: translateX(4px);
                }

                .lv-create-btn {
                    width: 100%;
                    color: #6366f1 !important;
                    font-weight: 600 !important;
                    font-size: 0.85rem !important;
                    background: transparent !important;
                    transition: all 0.3s ease !important;
                    cursor: pointer;
                }

                .lv-create-btn:hover {
                    color: #4338ca !important;
                    text-decoration: underline;
                }
            `}</style>
        </form>
    );
}
