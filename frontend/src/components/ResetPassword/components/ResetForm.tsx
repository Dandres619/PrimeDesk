import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface ResetFormProps {
    onSubmit: (password: string, confirm: string) => Promise<boolean>;
    loading: boolean;
}

export function ResetForm({ onSubmit, loading }: ResetFormProps) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(password, confirm);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm">Nueva Contraseña</Label>
                <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
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
    );
}
