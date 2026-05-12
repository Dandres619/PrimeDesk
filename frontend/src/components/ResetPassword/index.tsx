import { Bike } from 'lucide-react';
import { useResetPassword } from './hooks/useResetPassword';
import { ResetForm } from './components/ResetForm';
import { ResetSuccess } from './components/ResetSuccess';
import { ResetError } from './components/ResetError';
import { ResetPasswordStyles } from './styles/ResetPasswordStyles';

import heroBg from '@/assets/landing/hero-bg.jpg';

export default function ResetPassword() {
    const { token, loading, isSuccess, resetPassword } = useResetPassword();

    // Remove the early return for isSuccess

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans bg-[#0f172a]">
            {/* Cinematic Background (Same as Login/Landing) */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-indigo-950/90 to-slate-950/95 z-10" />
                <img
                    src={heroBg}
                    alt="Motorcycle workshop"
                    className="w-full h-full object-cover scale-105 animate-soft-zoom opacity-50 mix-blend-overlay"
                />
            </div>

            <ResetPasswordStyles />

            <div className="w-full max-w-lg relative z-20 animate-fade-in-up">
                {/* Header Section (Branding) */}
                <div className="text-center mb-10">
                    <div className="login-hero-logo mx-auto">
                        <div className="login-logo-icon">
                            <Bike className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="login-hero-title">Rafa Motos</h1>
                    <p className="login-hero-subtitle">Seguridad de Cuenta</p>
                </div>

                {/* Form Card (White Panel Style) */}
                <div className="login-form-card">
                    {!isSuccess && (
                        <div className="login-form-header">
                            <h2 className="lv-title">Nueva Contraseña</h2>
                            <p className="lv-subtitle">Crea una credencial de acceso segura para volver al sistema.</p>
                        </div>
                    )}

                    <div className="login-form-body">
                        {isSuccess ? (
                            <ResetSuccess />
                        ) : !token ? (
                            <ResetError />
                        ) : (
                            <ResetForm onSubmit={resetPassword} loading={loading} />
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                /* REPLICATING LOGIN STYLES EXACTLY */
                .login-hero-logo {
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
                    color: white;
                    font-weight: 600;
                    opacity: 0.9;
                }

                /* Panel Style */
                .login-form-card {
                    background: rgba(255, 255, 255, 0.96);
                    backdrop-filter: blur(40px);
                    border-radius: 24px;
                    padding: 2.5rem;
                    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                }

                .login-form-header {
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .lv-title {
                    font-size: 1.75rem;
                    font-weight: 800;
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

                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes soft-zoom {
                    from { transform: scale(1.05); }
                    to { transform: scale(1.15); }
                }
                .animate-soft-zoom {
                    animation: soft-zoom 20s infinite alternate ease-in-out;
                }
            `}</style>
        </div>
    );
}
