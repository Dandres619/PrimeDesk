import { Button } from '../ui/button';
import { Bike, CheckCircle } from 'lucide-react';
import { useVerify } from './hooks/useVerify';
import { LoadingView } from './components/LoadingView';
import { SuccessView } from './components/SuccessView';
import { ErrorView } from './components/ErrorView';
import { VerificarCuentaStyles } from './styles/VerificarCuentaStyles';

import heroBg from '@/assets/landing/hero-bg.jpg';

export function VerificarCuenta() {
    const { status, message } = useVerify();

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans bg-[#0f172a]">
            {/* Cinematic Background (Same as Login) */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-indigo-950/90 to-slate-950/95 z-10" />
                <img
                    src={heroBg}
                    alt="Motorcycle workshop"
                    className="w-full h-full object-cover scale-105 animate-soft-zoom opacity-50 mix-blend-overlay"
                />
            </div>

            <VerificarCuentaStyles />

            <div className="w-full max-w-lg relative z-20 animate-fade-in-up">
                {/* Header Section (Branding) */}
                <div className="text-center mb-10">
                    <div className="login-hero-logo mx-auto">
                        <div className="login-logo-icon">
                            <Bike className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="login-hero-title">Rafa Motos</h1>
                    <p className="login-hero-subtitle">Verificación de Cuenta</p>
                </div>

                {/* Form Card (White Panel Style) */}
                <div className="login-form-card">
                    <div className="login-form-header">
                        <div className="mb-6 flex justify-center">
                            {status === 'loading' && <LoadingView />}
                            {status === 'success' && <SuccessView />}
                            {status === 'error' && <ErrorView />}
                        </div>

                        <h2 className="lv-title">
                            {status === 'loading' ? 'Verificando...' : status === 'success' ? '¡Verificado!' : 'Algo salió mal'}
                        </h2>
                    </div>

                    <div className="login-form-body text-center">
                        <p className="lv-subtitle mb-8 px-4">
                            {message}
                        </p>

                        <Button
                            onClick={() => window.location.href = '/'}
                            className="lv-submit-btn mt-4"
                        >
                            {status === 'success' ? 'Ir al Login' : 'Volver al Inicio'}
                            <CheckCircle className="w-4 h-4 lv-btn-arrow" />
                        </Button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes soft-zoom {
                    from { transform: scale(1); }
                    to { transform: scale(1.1); }
                }
                .animate-soft-zoom {
                    animation: soft-zoom 20s infinite alternate ease-in-out;
                }
            `}</style>
        </div>
    );
}
