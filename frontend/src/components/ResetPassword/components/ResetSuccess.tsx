import { Card, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { CheckCircle2 } from 'lucide-react';

export function ResetSuccess() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-xl text-center p-8 animate-blur-in">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-bold text-gray-800 mb-4">¡Todo listo!</CardTitle>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Tu contraseña ha sido actualizada correctamente. Serás redirigido al inicio de sesión en unos segundos.
                </p>
                <Button
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 py-6 h-auto"
                >
                    Ir al Inicio ahora
                </Button>
            </Card>
        </div>
    );
}
