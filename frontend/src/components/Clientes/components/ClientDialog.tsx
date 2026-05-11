import React, { useState, useEffect, useRef } from 'react';
import { Camera, ArrowRight, Loader2, Mail, Users, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { DatePickerInput } from '../../ui/DatePickerInput';
import { validateField } from '../utils/validation';
import { toast } from 'sonner';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
const BASE_URL = API_URL.replace('/api', '');

interface ClientDialogProps {
  client: any;
  onSave: (data: any, editingClient: any) => Promise<boolean>;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ClientDialog({ client, onSave, isSaving, onOpenChange, open }: ClientDialogProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    crear_usuario: true,
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    barrio: '',
    fecha_nacimiento: '',
    foto: '',
    documento: '',
    tipo_documento: 'CC',
    fotoFile: null as File | null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const getPhotoUrl = (photo: string | null) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return `${BASE_URL}${photo}`;
  };

  useEffect(() => {
    if (!open) return;

    if (client) {
      setFormData({
        crear_usuario: false,
        correo: client.Correo || '',
        contrasena: '',
        confirmarContrasena: '',
        nombre: client.Nombre || '',
        apellido: client.Apellido || '',
        telefono: client.Telefono || '',
        direccion: client.Direccion || '',
        barrio: client.Barrio || '',
        fecha_nacimiento: client.FechaNacimiento ? client.FechaNacimiento.split('T')[0] : '',
        foto: client.Foto || '',
        documento: client.Documento || '',
        tipo_documento: client.TipoDocumento || 'CC',
        fotoFile: null
      });
      setFotoPreview(getPhotoUrl(client.Foto));
      setFormErrors({});
      setTouchedFields({});
      setActiveStep(2);
    } else {
      setFormData({
        crear_usuario: true,
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: '',
        barrio: '',
        fecha_nacimiento: '',
        foto: '',
        documento: '',
        tipo_documento: 'CC',
        fotoFile: null
      });
      setFotoPreview(null);
      setFormErrors({});
      setTouchedFields({});
      setActiveStep(1);
    }
  }, [client, open]);

  const hasChanges = () => {
    if (!client) return true;
    return (
      formData.nombre !== (client.Nombre || '') ||
      formData.apellido !== (client.Apellido || '') ||
      formData.telefono !== (client.Telefono || '') ||
      formData.direccion !== (client.Direccion || '') ||
      formData.barrio !== (client.Barrio || '') ||
      formData.fecha_nacimiento !== (client.FechaNacimiento ? client.FechaNacimiento.split('T')[0] : '') ||
      formData.fotoFile !== null ||
      (formData.contrasena !== '' && formData.contrasena === formData.confirmarContrasena)
    );
  };

  const handleChange = (name: string, value: any) => {
    if (name === 'documento' || name === 'telefono') {
      value = value.replace(/\D/g, '');
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      const error = validateField(name, value, newData, !!client);
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        if (error) newErrors[name] = error;
        else delete newErrors[name];
        return newErrors;
      });
      return newData;
    });
  };

  const markAsTouched = (name: string) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, (formData as any)[name], formData, !!client);
    setFormErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      if (error) newErrors[name] = error;
      else delete newErrors[name];
      return newErrors;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData(prev => ({ ...prev, fotoFile: file, foto: '' }));
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    if (activeStep === 1) {
      const emailErr = validateField('correo', formData.correo, formData, !!client);
      const passErr = validateField('contrasena', formData.contrasena, formData, !!client);
      const confirmErr = validateField('confirmarContrasena', formData.confirmarContrasena, formData, !!client);

      const errors = {
        ...(emailErr && { correo: emailErr }),
        ...(passErr && { contrasena: passErr }),
        ...(confirmErr && { confirmarContrasena: confirmErr })
      };

      if (Object.keys(errors).length > 0) {
        setFormErrors(prev => ({ ...prev, ...errors }));
        setTouchedFields(prev => ({ ...prev, correo: true, contrasena: true, confirmarContrasena: true }));
        return;
      }
      setActiveStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldsToValidate = ['nombre', 'apellido', 'documento', 'telefono', 'direccion', 'barrio', 'fecha_nacimiento'];
    const errors: Record<string, string> = {};

    fieldsToValidate.forEach(field => {
      const err = validateField(field, (formData as any)[field], formData, !!client);
      if (err) errors[field] = err;
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(prev => ({ ...prev, ...errors }));
      setTouchedFields(prev => {
        const touched = { ...prev };
        fieldsToValidate.forEach(f => touched[f] = true);
        return touched;
      });
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    const success = await onSave(formData, client);
    if (success) {
      onOpenChange(false);
      setActiveStep(1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto animate-modal p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl">
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0 transition-transform hover:scale-105">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    {client ? 'Editar Cliente' : 'Registro de Cliente'}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500 mt-1">
                  Completa la información del perfil del cliente
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start">
              {[1, 2].map((step) => (
                <div
                  key={step}
                  onClick={() => { if (!client && step === 1) setActiveStep(1); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeStep === step ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Paso {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7" noValidate>
          {activeStep === 1 ? (
            <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Credenciales de Acceso</h4>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Correo Electrónico *</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        type="email"
                        value={formData.correo}
                        onChange={(e) => handleChange('correo', e.target.value)}
                        onBlur={() => markAsTouched('correo')}
                        placeholder="ejemplo@correo.com"
                        className={`pl-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all ${touchedFields.correo && formErrors.correo ? 'border-red-500 bg-red-50/30' : ''}`}
                      />
                    </div>
                    {touchedFields.correo && formErrors.correo && <p className="text-[11px] text-red-500 font-medium ml-1">{formErrors.correo}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{client ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={formData.contrasena}
                          onChange={(e) => handleChange('contrasena', e.target.value)}
                          onBlur={() => markAsTouched('contrasena')}
                          className={`h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl pr-11 ${touchedFields.contrasena && formErrors.contrasena ? 'border-red-500' : ''}`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {touchedFields.contrasena && formErrors.contrasena && <p className="text-[11px] text-red-500 font-medium">{formErrors.contrasena}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirmar Contraseña *</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmarContrasena}
                          onChange={(e) => handleChange('confirmarContrasena', e.target.value)}
                          onBlur={() => markAsTouched('confirmarContrasena')}
                          className={`h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl pr-11 ${touchedFields.confirmarContrasena && formErrors.confirmarContrasena ? 'border-red-500' : ''}`}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {touchedFields.confirmarContrasena && formErrors.confirmarContrasena && <p className="text-[11px] text-red-500 font-medium">{formErrors.confirmarContrasena}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-11 px-8 text-slate-500 font-bold">Cancelar</Button>
                <Button type="button" onClick={nextStep} className="h-11 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:translate-x-1">
                  Siguiente <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
              {/* Photo & Basic Info */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-4 group">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 transition-all group-hover:border-blue-400">
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-10 h-10 text-slate-300" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-slate-900 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Foto de perfil</span>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Nombres *</Label>
                    <Input value={formData.nombre} onChange={(e) => handleChange('nombre', e.target.value)} onBlur={() => markAsTouched('nombre')} className={`h-11 ${touchedFields.nombre && formErrors.nombre ? 'border-red-500' : ''}`} />
                    {touchedFields.nombre && formErrors.nombre && <p className="text-[10px] text-red-500">{formErrors.nombre}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Apellidos *</Label>
                    <Input value={formData.apellido} onChange={(e) => handleChange('apellido', e.target.value)} onBlur={() => markAsTouched('apellido')} className={`h-11 ${touchedFields.apellido && formErrors.apellido ? 'border-red-500' : ''}`} />
                    {touchedFields.apellido && formErrors.apellido && <p className="text-[10px] text-red-500">{formErrors.apellido}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Tipo Documento</Label>
                    <Select value={formData.tipo_documento} onValueChange={(v) => handleChange('tipo_documento', v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                        <SelectItem value="PP">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Documento *</Label>
                    <Input value={formData.documento} onChange={(e) => handleChange('documento', e.target.value)} onBlur={() => markAsTouched('documento')} className={`h-11 ${touchedFields.documento && formErrors.documento ? 'border-red-500' : ''}`} />
                    {touchedFields.documento && formErrors.documento && <p className="text-[10px] text-red-500">{formErrors.documento}</p>}
                  </div>
                </div>
              </div>

              {/* More Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Teléfono *</Label>
                  <Input value={formData.telefono} onChange={(e) => handleChange('telefono', e.target.value)} onBlur={() => markAsTouched('telefono')} className={`h-11 ${touchedFields.telefono && formErrors.telefono ? 'border-red-500' : ''}`} />
                  {touchedFields.telefono && formErrors.telefono && <p className="text-[10px] text-red-500">{formErrors.telefono}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Dirección *</Label>
                  <Input value={formData.direccion} onChange={(e) => handleChange('direccion', e.target.value)} onBlur={() => markAsTouched('direccion')} className={`h-11 ${touchedFields.direccion && formErrors.direccion ? 'border-red-500' : ''}`} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Barrio *</Label>
                  <Input value={formData.barrio} onChange={(e) => handleChange('barrio', e.target.value)} onBlur={() => markAsTouched('barrio')} className={`h-11 ${touchedFields.barrio && formErrors.barrio ? 'border-red-500' : ''}`} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Fecha Nacimiento (Opcional)</Label>
                  <DatePickerInput 
                    value={formData.fecha_nacimiento} 
                    onChange={(v) => handleChange('fecha_nacimiento', v)} 
                    maxDate={new Date()} 
                    error={!!formErrors.fecha_nacimiento}
                  />
                  {formErrors.fecha_nacimiento && <p className="text-[10px] text-red-500">{formErrors.fecha_nacimiento}</p>}
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setActiveStep(1)} className="h-11 text-slate-500 font-bold">Atrás</Button>
                <Button type="submit" disabled={isSaving || !hasChanges()} className="h-11 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all">
                  {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Guardar Cliente'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
