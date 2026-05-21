import React, { useState, useEffect, useRef } from 'react';
import { Camera, ArrowRight, ArrowLeft, Loader2, Mail, Users, Eye, EyeOff, Check, X, Lock, Smartphone, MapPin, CheckCircle2, Plus } from 'lucide-react';
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
  const [step1Submitted, setStep1Submitted] = useState(false);
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    id_rol: 3, // Clients always have role 3
    nombre: '',
    apellido: '',
    tipo_documento: 'CC',
    documento: '',
    telefono: '',
    direccion: '',
    barrio: '',
    fecha_nacimiento: '',
    foto: '',
    fotoFile: null as File | null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    if (fotoPreview) {
      setImgLoading(true);
    }
  }, [fotoPreview, open]);

  const getPhotoUrl = (photo: string | null) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return `${BASE_URL}${photo}`;
  };

  useEffect(() => {
    if (!open) return;

    if (client) {
      setFormData({
        correo: client.Correo || '',
        contrasena: '',
        id_rol: 3,
        nombre: client.Nombre || '',
        apellido: client.Apellido || '',
        tipo_documento: client.TipoDocumento || 'CC',
        documento: client.Documento || '',
        telefono: client.Telefono || '',
        direccion: client.Direccion || '',
        barrio: client.Barrio || '',
        fecha_nacimiento: client.FechaNacimiento ? client.FechaNacimiento.split('T')[0] : '',
        foto: client.Foto || '',
        confirmarContrasena: '',
        fotoFile: null
      });
      setFotoPreview(getPhotoUrl(client.Foto));
      setFormErrors({});
      setTouchedFields({});
      setActiveStep(2);
      setStep1Submitted(false);
    } else {
      setFormData({
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        id_rol: 3,
        nombre: '',
        apellido: '',
        tipo_documento: 'CC',
        documento: '',
        telefono: '',
        direccion: '',
        barrio: '',
        fecha_nacimiento: '',
        foto: '',
        fotoFile: null
      });
      setFotoPreview(null);
      setFormErrors({});
      setTouchedFields({});
      setActiveStep(1);
      setStep1Submitted(false);
    }
  }, [client, open]);

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

  const handleTouch = (name: string) => {
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({ ...prev, [name]: true }));
    }
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

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      setStep1Submitted(true);
      toast.error('Por favor, corrija las credenciales antes de continuar');
      return;
    }

    // Success -> Step 2
    setActiveStep(2);
    setTouchedFields({}); // RESET FOR STEP 2
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStep === 1 && !client) return; // Prevent Step 1 accidental submit

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
      toast.error('Hay errores en el formulario. Por favor corríjalos.');
      return;
    }

    const success = await onSave(formData, client);
    if (success) {
      onOpenChange(false);
      setActiveStep(1);
    }
  };

  const hasChanges = () => {
    if (!client) return true;
    return (
      formData.nombre !== (client.Nombre || '') ||
      formData.apellido !== (client.Apellido || '') ||
      formData.tipo_documento !== (client.TipoDocumento || 'CC') ||
      formData.documento !== (client.Documento || '') ||
      formData.telefono !== (client.Telefono || '') ||
      formData.direccion !== (client.Direccion || '') ||
      formData.barrio !== (client.Barrio || '') ||
      formData.fecha_nacimiento !== (client.FechaNacimiento ? client.FechaNacimiento.split('T')[0] : '') ||
      formData.fotoFile !== null ||
      (formData.contrasena !== '' && formData.contrasena === formData.confirmarContrasena)
    );
  };

  const passReqs = [
    { label: '8+ caracteres', met: formData.contrasena.length >= 8 },
    { label: 'Una mayúscula', met: /[A-Z]/.test(formData.contrasena) },
    { label: 'Un número', met: /\d/.test(formData.contrasena) },
    { label: 'Caract. especial', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.contrasena) }
  ];

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl animate-modal p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl rounded-2xl">
        {/* Header Section */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-20 -mt-20 rounded-full" />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0 transition-transform hover:scale-105">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {client ? 'Editar Información' : 'Registro de Cliente'}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {client ? 'Actualiza los datos del cliente' : 'Crea una nueva cuenta de cliente'}
                </p>
              </div>
            </div>

            {/* Stepper */}
            {!client && (
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${activeStep === 1 ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-green-100 dark:bg-green-900/30 text-green-600'}`}>
                    {activeStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${activeStep === 1 ? 'text-blue-600' : 'text-slate-400'}`}>Acceso</span>
                </div>

                <div className={`flex-1 h-px transition-colors duration-500 ${activeStep > 1 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800'}`} />

                <div className="flex items-center gap-2 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${activeStep === 2 ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    2
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${activeStep === 2 ? 'text-blue-600' : 'text-slate-400'}`}>Personal</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-140px)]" noValidate>
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
            {/* Step 1: Credenciales */}
            {!client && activeStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center gap-2 px-1">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-blue-500" /> Correo Electrónico
                      </Label>
                      {touchedFields.correo && formErrors.correo && <span className="text-[9px] font-bold text-red-500 uppercase ml-auto">{formErrors.correo}</span>}
                    </div>
                    <Input
                      type="email"
                      value={formData.correo}
                      onChange={(e) => handleChange('correo', e.target.value)}
                      onFocus={() => handleTouch('correo')}
                      placeholder="correo@ejemplo.com"
                      className={`h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all ${touchedFields.correo && formErrors.correo ? 'border-red-500 ring-1 ring-red-500/10' : ''}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-blue-500" /> Contraseña
                      </Label>
                      {touchedFields.contrasena && formErrors.contrasena && <span className="text-[9px] font-bold text-red-500 uppercase ml-auto">{formErrors.contrasena}</span>}
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.contrasena}
                        onChange={(e) => handleChange('contrasena', e.target.value)}
                        onFocus={() => handleTouch('contrasena')}
                        className={`h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl pr-11 transition-all ${touchedFields.contrasena && formErrors.contrasena ? 'border-red-500' : ''}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Confirmar
                    </div>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmarContrasena}
                        onChange={(e) => handleChange('confirmarContrasena', e.target.value)}
                        onFocus={() => handleTouch('confirmarContrasena')}
                        className={`h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl pr-11 transition-all ${step1Submitted && formErrors.confirmarContrasena ? 'border-red-500' : ''}`}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {step1Submitted && formErrors.confirmarContrasena && <p className="text-[9px] font-bold text-red-500 uppercase mt-1 px-1">{formErrors.confirmarContrasena}</p>}
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Requisitos de Seguridad</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {passReqs.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 transition-all duration-300">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${req.met ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                          {req.met ? <Check className="w-2.5 h-2.5 text-white" /> : <X className="w-2.5 h-2.5 text-slate-400" />}
                        </div>
                        <span className={`text-[11px] font-semibold transition-colors ${req.met ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Datos Personales */}
            {(activeStep === 2 || client) && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Datos Personales</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo Documento *</Label>
                      <Select disabled={!!client} value={formData.tipo_documento} onValueChange={(v) => handleChange('tipo_documento', v)}>
                        <SelectTrigger className="w-full !h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CC">Cédula</SelectItem>
                          <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                          <SelectItem value="PP">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Número de Documento *</Label>
                        {touchedFields.documento && formErrors.documento && <span className="text-[9px] font-bold text-red-500 uppercase">{formErrors.documento}</span>}
                      </div>
                      <Input
                        disabled={!!client}
                        value={formData.documento}
                        onChange={(e) => handleChange('documento', e.target.value)}
                        onFocus={() => handleTouch('documento')}
                        className={`h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 ${touchedFields.documento && formErrors.documento ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombres *</Label>
                        {touchedFields.nombre && formErrors.nombre && <span className="text-[9px] font-bold text-red-500 uppercase">{formErrors.nombre}</span>}
                      </div>
                      <Input
                        value={formData.nombre}
                        onChange={(e) => handleChange('nombre', e.target.value)}
                        onFocus={() => handleTouch('nombre')}
                        className={`h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 ${touchedFields.nombre && formErrors.nombre ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Apellidos *</Label>
                        {touchedFields.apellido && formErrors.apellido && <span className="text-[9px] font-bold text-red-500 uppercase">{formErrors.apellido}</span>}
                      </div>
                      <Input
                        value={formData.apellido}
                        onChange={(e) => handleChange('apellido', e.target.value)}
                        onFocus={() => handleTouch('apellido')}
                        className={`h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 ${touchedFields.apellido && formErrors.apellido ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Fecha de Nacimiento</Label>
                        {touchedFields.fecha_nacimiento && formErrors.fecha_nacimiento && <span className="text-[9px] font-bold text-red-500 uppercase">{formErrors.fecha_nacimiento}</span>}
                      </div>
                      <DatePickerInput
                        value={formData.fecha_nacimiento}
                        onChange={(v) => handleChange('fecha_nacimiento', v)}
                        onFocus={() => handleTouch('fecha_nacimiento')}
                        error={!!(touchedFields.fecha_nacimiento && formErrors.fecha_nacimiento)}
                        minDate={new Date(1950, 0, 1)}
                        maxDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Contacto</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Teléfono *</Label>
                        {touchedFields.telefono && formErrors.telefono && <span className="text-[9px] font-bold text-red-500 uppercase">{formErrors.telefono}</span>}
                      </div>
                      <div className="relative group">
                        <Smartphone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          value={formData.telefono}
                          onChange={(e) => handleChange('telefono', e.target.value)}
                          onFocus={() => handleTouch('telefono')}
                          className={`pl-10 h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 ${touchedFields.telefono && formErrors.telefono ? 'border-red-500' : ''}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Dirección *</Label>
                        {touchedFields.direccion && formErrors.direccion && <span className="text-[9px] font-bold text-red-500 uppercase">{formErrors.direccion}</span>}
                      </div>
                      <div className="relative group">
                        <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          value={formData.direccion}
                          onChange={(e) => handleChange('direccion', e.target.value)}
                          onFocus={() => handleTouch('direccion')}
                          className={`pl-10 h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 ${touchedFields.direccion && formErrors.direccion ? 'border-red-500' : ''}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Barrio *</Label>
                        {touchedFields.barrio && formErrors.barrio && <span className="text-[9px] font-bold text-red-500 uppercase">{formErrors.barrio}</span>}
                      </div>
                      <Input
                        value={formData.barrio}
                        onChange={(e) => handleChange('barrio', e.target.value)}
                        onFocus={() => handleTouch('barrio')}
                        className={`h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 ${touchedFields.barrio && formErrors.barrio ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative group shrink-0">
                      <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-700 group-hover:border-blue-500 transition-all shadow-xl relative">
                        {fotoPreview ? (
                          <>
                            {imgLoading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 z-10">
                                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                              </div>
                            )}
                            <img
                              src={fotoPreview}
                              alt="Preview"
                              onLoad={() => setImgLoading(false)}
                              onError={() => setImgLoading(false)}
                              className={`w-full h-full object-cover transition-opacity duration-200 ${imgLoading ? "opacity-0" : "opacity-100"}`}
                            />
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Camera className="w-10 h-10 text-slate-200" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Sin foto</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-slate-900 hover:scale-110 active:scale-95 transition-transform"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>

                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <h5 className="text-lg font-black text-slate-900 dark:text-white truncate max-w-[280px]">
                        {formData.nombre} {formData.apellido}
                      </h5>
                      <span className="inline-block px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider rounded-full">
                        Cliente
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!client && activeStep === 2 && (
                <Button type="button" variant="ghost" onClick={() => setActiveStep(1)} className="h-11 px-6 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl flex-1 sm:flex-none">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={handleCancel} className="h-11 px-6 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl flex-1 sm:flex-none">
                {client ? 'Cerrar' : 'Cancelar'}
              </Button>
            </div>

            {activeStep === 1 && !client ? (
              <Button type="button" onClick={nextStep} className="h-11 px-10 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 group">
                Siguiente paso <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSaving || (!!client && !hasChanges())} className="h-12 px-12 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                {isSaving ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : (client ? 'Actualizar Datos' : 'Guardar Cliente')}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
