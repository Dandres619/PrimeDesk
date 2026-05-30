import { Bike } from 'lucide-react';
import { useResetPassword } from './hooks/useResetPassword';
import { ResetForm } from './components/ResetForm';
import { ResetSuccess } from './components/ResetSuccess';
import { ResetError } from './components/ResetError';
import { ResetPasswordStyles } from './styles/ResetPasswordStyles';

import heroBg from '@/assets/landing/hero-bg.jpg';

export default function ResetPassword() {
    const { token, loading, isSuccess, isTokenValid, isCheckingToken, resetPassword } = useResetPassword();

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
                <div className="text-center mb-10 flex flex-col items-center justify-center">
                    <div className="mb-4">
                        <img
                            src="/favicon/rafamotos-logo.png"
                            alt="Rafa Motos Logo"
                            className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    <h1 className="verify-hero-title">Rafa Motos</h1>
                    <p className="verify-hero-subtitle">Seguridad de Cuenta</p>
                </div>

                {/* Form Card (White Panel Style) */}
                <div className="login-form-card">
                    {!isSuccess && isTokenValid && token && !isCheckingToken && (
                        <div className="login-form-header">
                            <h2 className="lv-title">Nueva Contraseña</h2>
                            <p className="lv-subtitle">Crea una credencial de acceso segura para volver al sistema.</p>
                        </div>
                    )}

                    <div className="login-form-body">
                        {isCheckingToken ? (
                            <div className="text-center py-6">
                                <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-slate-500 mt-2">Verificando enlace...</p>
                            </div>
                        ) : isSuccess ? (
                            <ResetSuccess />
                        ) : (!token || !isTokenValid) ? (
                            <ResetError />
                        ) : (
                            <ResetForm onSubmit={resetPassword} loading={loading} />
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .verify-hero-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -0.02em;
                    margin-top: 0.5rem;
                    margin-bottom: 0.25rem;
                }
                .verify-hero-subtitle {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: rgba(199, 210, 254, 0.8);
                    font-weight: 500;
                }

                /* Panel Style - Glassmorphism Dark Mode */
                .login-form-card {
                    background: rgba(15, 23, 42, 0.75);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border-radius: 24px;
                    padding: 2.5rem;
                    box-shadow: 
                        0 30px 60px rgba(0, 0, 0, 0.6),
                        0 0 0 1px rgba(255, 255, 255, 0.08) inset,
                        0 -4px 24px rgba(99, 102, 241, 0.15) inset;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .login-form-header {
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .lv-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #a5b4fc, #c084fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .lv-subtitle {
                    color: #94a3b8;
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
