import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Bike, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function Verify() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verificando tu cuenta...');

    const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Token de verificación no encontrado.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message || '¡Correo verificado con éxito!');
                    toast.success('Cuenta verificada correctamente');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Error al verificar el correo.');
                    toast.error(data.message || 'Error de verificación');
                }
            } catch (error) {
                console.error('Error verifying email:', error);
                setStatus('error');
                setMessage('Error de conexión con el servidor.');
                toast.error('Error de conexión');
            }
        };

        verifyEmail();
    }, [API_URL]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
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
                        {status === 'loading' && (
                            <div className="flex justify-center mb-4">
                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-green-50 rounded-full border border-green-100">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-red-50 rounded-full border border-red-100">
                                    <XCircle className="w-12 h-12 text-red-500" />
                                </div>
                            </div>
                        )}
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            {status === 'loading' ? 'Verificando...' : status === 'success' ? '¡Verificado!' : 'Algo salió mal'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <p className="text-gray-600 leading-relaxed">
                            {message}
                        </p>

                        <div className="pt-4">
                            <Button
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                onClick={() => window.location.href = '/'}
                            >
                                {status === 'success' ? 'Ir al Iniciar Sesión' : 'Volver al Inicio'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <style>{`
                @keyframes blurIn {
                    from { filter: blur(10px); opacity: 0; }
                    to { filter: blur(0); opacity: 1; }
                }
                .animate-blur-in { animation: blurIn 0.5s ease-out; }
            `}</style>
        </div>
    );
}
