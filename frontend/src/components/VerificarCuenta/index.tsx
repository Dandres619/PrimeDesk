import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Bike } from 'lucide-react';
import { useVerify } from './hooks/useVerify';
import { LoadingView } from './components/LoadingView';
import { SuccessView } from './components/SuccessView';
import { ErrorView } from './components/ErrorView';
import { VerificarCuentaStyles } from './styles/VerificarCuentaStyles';

export function VerificarCuenta() {
    const { status, message } = useVerify();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <VerificarCuentaStyles />
            <div className="w-full max-w-md animate-blur-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-xl shadow-indigo-200">
                        <Bike className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 italic tracking-tight">Rafa Motos</h1>
                    <p className="text-gray-500 font-medium">Verificación de Cuenta</p>
                </div>

                <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-xl">
                    <CardHeader className="text-center pb-2">
                        {status === 'loading' && <LoadingView />}
                        {status === 'success' && <SuccessView />}
                        {status === 'error' && <ErrorView />}
                        
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            {status === 'loading' ? 'Verificando...' : status === 'success' ? '¡Verificado!' : 'Algo salió mal'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <p className="text-gray-600 leading-relaxed font-medium">
                            {message}
                        </p>

                        <div className="pt-4">
                            <Button
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                onClick={() => window.location.href = '/'}
                            >
                                {status === 'success' ? 'Ir a Iniciar Sesión' : 'Volver al Inicio'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
