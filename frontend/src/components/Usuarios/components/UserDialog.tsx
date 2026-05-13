import React, { useState, useEffect } from 'react';
import { Mail, Lock as LockIcon, Edit, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface UserDialogProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  editingUser: any;
  onSave: (formData: any, editingUser: any) => Promise<boolean>;
  isSaving: boolean;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  resetForm: () => void;
}

export function UserDialog({
  showModal,
  setShowModal,
  editingUser,
  onSave,
  isSaving,
  formData,
  setFormData,
  resetForm
}: UserDialogProps) {
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return 'El correo es obligatorio';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Correo electrónico inválido';
    return '';
  };

  const validatePassword = (pass: string) => {
    if (!pass && editingUser) return '';
    if (!pass && !editingUser) return 'La contraseña es obligatoria';
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(pass)) return 'Contraseña insegura';
    return '';
  };

  useEffect(() => {
    if (touchedFields.email) setEmailError(validateEmail(formData.email));
  }, [formData.email, touchedFields.email]);

  useEffect(() => {
    if (touchedFields.password) setPasswordError(validatePassword(formData.password));
  }, [formData.password, touchedFields.password]);

  useEffect(() => {
    if (touchedFields.confirmPassword) {
      if (formData.confirmPassword !== formData.password) setConfirmPasswordError('Las contraseñas no coinciden');
      else setConfirmPasswordError('');
    }
  }, [formData.confirmPassword, formData.password, touchedFields.confirmPassword]);

  const hasChanges = () => {
    if (!editingUser) return true;
    return formData.email !== editingUser.Correo || formData.password.length > 0;
  };

  const isSubmitDisabled = () => {
    if (isSaving) return true;
    if (emailError) return true;
    if (formData.password && passwordError) return true;
    if (confirmPasswordError) return true;
    if (editingUser && !hasChanges()) return true;
    if (!editingUser && (!formData.email || !formData.password || !formData.confirmPassword)) return true;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave(formData, editingUser);
    if (success) {
      setShowModal(false);
      resetForm();
      setTouchedFields({});
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={(open) => { if (!open) { resetForm(); setTouchedFields({}); } setShowModal(open); }}>
      <DialogContent className="max-w-lg animate-modal p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl">
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0 transition-transform hover:scale-105">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-500 mt-1">
                {editingUser ? `Modificando acceso para ${editingUser.Correo}` : 'Crea un nuevo acceso al sistema'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-7" noValidate>
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Información de Acceso</h4>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Correo electrónico</Label>
                {touchedFields.email && emailError && (
                  <span className="flex items-center gap-1 text-red-500 text-[11px] font-medium bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                    {emailError}
                  </span>
                )}
              </div>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev: any) => ({ ...prev, email: e.target.value }));
                    if (!touchedFields.email) setTouchedFields(prev => ({ ...prev, email: true }));
                  }}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                  placeholder="ejemplo@correo.com"
                  required
                  className={`pl-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all ${touchedFields.email && emailError ? 'border-red-500 focus:ring-red-500/10 bg-red-50/30' : ''}`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <LockIcon className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Seguridad de la Cuenta</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password-dialog" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  </Label>
                  {touchedFields.password && passwordError && (
                    <span className="text-red-500 text-[10px] font-bold uppercase tracking-tight">{passwordError}</span>
                  )}
                </div>
                <div className="relative group">
                  <Input
                    id="password-dialog"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData((prev: any) => ({ ...prev, password: e.target.value }));
                      if (!touchedFields.password) setTouchedFields(prev => ({ ...prev, password: true }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, password: true }))}
                    placeholder="•••••••••"
                    className={`h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all pr-11 ${touchedFields.password && passwordError ? 'border-red-500 focus:ring-red-500/10' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="confirmPassword-dialog" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirmar</Label>
                  {touchedFields.confirmPassword && confirmPasswordError && (
                    <span className="text-red-500 text-[10px] font-bold uppercase tracking-tight">No coincide</span>
                  )}
                </div>
                <div className="relative group">
                  <Input
                    id="confirmPassword-dialog"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData((prev: any) => ({ ...prev, confirmPassword: e.target.value }));
                      if (!touchedFields.confirmPassword) setTouchedFields(prev => ({ ...prev, confirmPassword: true }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, confirmPassword: true }))}
                    placeholder="••••••••"
                    className={`h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all pr-11 ${touchedFields.confirmPassword && confirmPasswordError ? 'border-red-500 focus:ring-red-500/10' : ''}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {!editingUser && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Requisitos de seguridad:</span>
                  Mínimo 8 caracteres, incluir una mayúscula, un número y un carácter especial.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 mt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setShowModal(false); resetForm(); }}
                className="h-11 px-6 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl flex-1 sm:flex-none"
              >
                {editingUser ? 'Cerrar' : 'Cancelar'}
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitDisabled()}
              className="h-12 px-12 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : (editingUser ? 'Actualizar Usuario' : 'Crear Usuario')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
