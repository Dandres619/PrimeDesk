import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Bike } from 'lucide-react';
import { useResetPassword } from './hooks/useResetPassword';
import { ResetForm } from './components/ResetForm';
import { ResetSuccess } from './components/ResetSuccess';
import { ResetError } from './components/ResetError';
import { ResetPasswordStyles } from './styles/ResetPasswordStyles';

export default function ResetPassword() {
    const { token, loading, isSuccess, resetPassword } = useResetPassword();

    if (isSuccess) {
        return <ResetSuccess />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <ResetPasswordStyles />
            <div className="w-full max-w-md relative animate-blur-in">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-xl shadow-indigo-200">
                        <Bike className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Rafa Motos</h1>
                    <p className="text-gray-500 font-medium">Seguridad de Cuenta</p>
                </div>

                <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-xl relative z-10">
                    <CardHeader className="space-y-1 text-center pb-4">
                        <CardTitle className="text-2xl font-bold text-gray-800">Nueva Contraseña</CardTitle>
                        <p className="text-gray-500 text-sm">Crea una credencial de acceso segura para volver al sistema.</p>
                    </CardHeader>
                    <CardContent>
                        {!token ? (
                            <ResetError />
                        ) : (
                            <ResetForm onSubmit={resetPassword} loading={loading} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
