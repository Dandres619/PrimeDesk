import { CheckCircle2 } from 'lucide-react';
import { Button } from '../../ui/button';

export function ResetSuccess() {
    return (
        <div className="text-center py-4 animate-fade-in-up">
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-100">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
            </div>
            
            <h2 className="lv-title">¡Todo listo!</h2>
            <p className="lv-subtitle mb-10 px-4 leading-relaxed">
                Tu contraseña ha sido actualizada correctamente. Ahora puedes volver a acceder al sistema con tus nuevas credenciales.
            </p>

            <Button
                onClick={() => window.location.href = '/'}
                className="lv-submit-btn"
            >
                Ir al Inicio de Sesión
                <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
        </div>
    );
}
