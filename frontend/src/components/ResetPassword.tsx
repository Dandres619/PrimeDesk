import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Bike, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export default function ResetPassword() {
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('token');
        setToken(t);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return toast.error('Token faltante en la URL');
        if (password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres');
        if (password !== confirm) return toast.error('Las contraseñas no coinciden');

        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, nueva_contrasena: password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error al restablecer la contraseña');

            setIsSuccess(true);
            toast.success('Contraseña restablecida con éxito');
            setTimeout(() => { window.location.href = '/'; }, 3000);
        } catch (err: any) {
            toast.error(err.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-xl text-center p-8">
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
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 py-6"
                    >
                        Ir al Inicio ahora
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
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
                            <div className="text-center py-8">
                                <div className="p-4 bg-amber-50 rounded-xl mb-4 border border-amber-100">
                                    <p className="text-amber-700 text-sm">El enlace de recuperación es inválido o no contiene un código válido. Por favor solicita uno nuevo.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = '/'}
                                    className="w-full"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Volver al Inicio
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold text-sm">Nueva Contraseña</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Mínimo 6 caracteres"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 pr-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold text-sm">Confirmar Nueva Contraseña</Label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <Input
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Repite tu contraseña"
                                            value={confirm}
                                            onChange={(e) => setConfirm(e.target.value)}
                                            className="pl-10 pr-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold h-12 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Procesando...
                                        </span>
                                    ) : 'Restablecer Contraseña'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => window.location.href = '/'}
                                    className="w-full text-gray-500 hover:text-gray-800"
                                >
                                    Cancelar
                                </Button>
                            </form>
                        )}
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
