import { FormEvent } from 'react';
import { Mail, Loader2, ArrowRight, KeyRound } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  onSubmit: (e: FormEvent) => void;
}

export function ForgotPasswordModal({
  open,
  onOpenChange,
  email,
  setEmail,
  isLoading,
  onSubmit
}: ForgotPasswordModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md fp-dialog">
        <DialogHeader>
          <div className="fp-icon-wrapper">
            <KeyRound className="w-6 h-6 text-indigo-600" />
          </div>
          <DialogTitle className="fp-title">¿Olvidaste tu contraseña?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="fp-description">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="fp-label">Correo electrónico</Label>
              <div className="fp-input-wrapper">
                <Mail className="fp-input-icon" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="fp-input"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="fp-cancel-btn">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="fp-submit-btn"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Enviar instrucciones <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </div>
          </form>
        </div>

        <style>{`
          .fp-dialog {
            border-radius: 20px !important;
            border: 1px solid rgba(99, 102, 241, 0.1) !important;
            box-shadow: 0 32px 64px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05) inset !important;
          }

          .fp-icon-wrapper {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(124, 58, 237, 0.1));
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.5rem;
          }

          .fp-title {
            font-size: 1.25rem !important;
            font-weight: 800 !important;
            color: #ffffff !important;
            letter-spacing: -0.02em !important;
          }

          .fp-description {
            font-size: 0.85rem;
            color: #94a3b8;
            line-height: 1.5;
          }

          .fp-label {
            font-size: 0.75rem !important;
            font-weight: 600 !important;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #cbd5e1 !important;
          }

          .fp-input-wrapper {
            position: relative;
            border-radius: 12px;
            background: #0f172a;
            border: 2px solid #334155;
            transition: all 0.3s ease;
            overflow: hidden;
          }

          .fp-input-wrapper:focus-within {
            border-color: #4f46e5;
            background: #0f172a;
            box-shadow: 0 0 0 1px #4f46e5;
          }

          .fp-input-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            color: #9ca3af;
            z-index: 1;
            pointer-events: none;
            transition: color 0.3s ease;
          }

          .fp-input-wrapper:focus-within .fp-input-icon {
            color: #6366f1;
          }

          .fp-input {
            padding-left: 42px !important;
            padding-right: 12px !important;
            height: 44px !important;
            border: none !important;
            background: transparent !important;
            color: #ffffff !important;
            box-shadow: none !important;
            outline: none !important;
          }

          .fp-input:focus {
            box-shadow: none !important;
            outline: none !important;
          }

          .fp-cancel-btn {
            flex: 1;
            color: #6b7280 !important;
            font-weight: 500 !important;
            border-radius: 12px !important;
          }

          .fp-submit-btn {
            flex: 1;
            background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
            color: white !important;
            border: none !important;
            border-radius: 12px !important;
            font-weight: 600 !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25) !important;
          }

          .fp-submit-btn:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35) !important;
          }

          .fp-submit-btn:disabled {
            opacity: 0.7 !important;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
