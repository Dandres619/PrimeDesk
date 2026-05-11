import { Button } from '../../ui/button';
import { ArrowLeft } from 'lucide-react';

export function ResetError() {
    return (
        <div className="text-center py-8">
            <div className="p-4 bg-amber-50 rounded-xl mb-4 border border-amber-100">
                <p className="text-amber-700 text-sm italic">
                    El enlace de recuperación es inválido o no contiene un código válido. Por favor solicita uno nuevo.
                </p>
            </div>
            <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full h-12"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
            </Button>
        </div>
    );
}
