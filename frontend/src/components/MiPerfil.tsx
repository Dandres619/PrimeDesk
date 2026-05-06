import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { User, Lock, Mail, Briefcase, Loader2, Camera, Image as ImageIcon, Calendar as CalendarIcon, Eye, EyeOff } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CustomDatePicker } from './ui/CustomDatePicker';
import { toast } from 'sonner';

export function MiPerfil() {
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isProcessingPassword, setIsProcessingPassword] = useState(false);

    // States for Profile Update
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        tipo_documento: 'CC',
        documento: '',
        telefono: '',
        direccion: '',
        barrio: '',
        foto: '',
        fecha_nacimiento: ''
    });

    // States for Password Update
    const [passwordData, setPasswordData] = useState({
        contrasena_actual: '',
        nueva_contrasena: '',
        confirmar_contrasena: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
    const [dateInput, setDateInput] = useState('');
    const [initialFormData, setInitialFormData] = useState<any>(null);

    const handleBlur = (field: string) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
    };

    const hasProfileChanges = () => {
        if (!initialFormData) return false;
        if (fotoFile) return true;
        // Compare each field
        return Object.keys(formData).some(key => {
            const currentVal = (formData as any)[key] || '';
            const initialVal = (initialFormData as any)[key] || '';
            return currentVal !== initialVal;
        });
    };

    const todayDate = new Date();
    const globalMinAgeDate = new Date(todayDate.getFullYear() - 18, todayDate.getMonth(), todayDate.getDate());

    useEffect(() => {
        if (formData.fecha_nacimiento) {
            const date = new Date(formData.fecha_nacimiento + 'T00:00:00');
            const formatted = format(date, 'dd/MM/yyyy');
            if (dateInput !== formatted && (dateInput.replace(/\//g, '').length === 8 || dateInput === '')) {
                setDateInput(formatted);
            }
        } else {
            setDateInput('');
        }
    }, [formData.fecha_nacimiento]);

    // @ts-ignore
    const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
    const BASE_URL = API_URL.replace('/api', '');
    const token = localStorage.getItem('token');

    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getPhotoUrl = (photo: string | null) => {
        if (!photo) return null;
        if (photo.startsWith('http')) return photo;
        return `${BASE_URL}${photo}`;
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar perfil');
            const data = await response.json();
            setProfileData(data);

            const isClient = data.id_rol === 3;
            const photoPath = (isClient ? data.FotoCliente : data.FotoEmpleado) || '';
            const isExternal = photoPath.startsWith('http');

            const newFormData = {
                nombre: (isClient ? data.NombreCliente : data.NombreEmpleado) || '',
                apellido: (isClient ? data.ApellidoCliente : data.ApellidoEmpleado) || '',
                tipo_documento: (isClient ? data.TipoDocumento : data.TipoDocEmpleado) || 'CC',
                documento: (isClient ? data.Documento : data.DocEmpleado) || '',
                telefono: (isClient ? data.Telefono : data.TelEmpleado) || '',
                direccion: (isClient ? data.Direccion : data.DirEmpleado) || '',
                barrio: (isClient ? data.Barrio : data.BarrioEmpleado) || '',
                foto: isExternal ? photoPath : '', // Solo poner en el input si es URL real
                fecha_nacimiento: (isClient ? data.FechaNacimiento : data.NacEmpleado) ? (isClient ? data.FechaNacimiento : data.NacEmpleado).split('T')[0] : ''
            };
            setFormData(newFormData);
            setInitialFormData(newFormData);
            setFotoPreview(getPhotoUrl(photoPath));
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Real-time validation for profile
    useEffect(() => {
        if (!profileData) return;
        const errs: Record<string, string> = {};

        if (!formData.nombre) errs.nombre = 'No puede estar vacío';
        if (!formData.apellido) errs.apellido = 'No puede estar vacío';

        if (!formData.telefono) errs.telefono = 'No puede estar vacío';
        else if (!/^\d{7,10}$/.test(formData.telefono)) errs.telefono = 'Entre 7 y 10 números';

        if (!formData.barrio) errs.barrio = 'No puede estar vacío';

        if (!formData.direccion) errs.direccion = 'No puede estar vacío';
        else {
            const addressRegex = /^(calle|carrera|cra|diagonal|diag|transversal|tv|avenida|av|circular|circ|vía|via|manzana|mz|lote)\s+[a-zA-Z0-9\s#-]+$/i;
            if (!addressRegex.test(formData.direccion)) errs.direccion = 'Dirección inválida (Ej: Calle 10 #20-30)';
        }

        if (!formData.fecha_nacimiento) errs.fecha_nacimiento = 'No puede estar vacío';
        else {
            const selectedDate = new Date(formData.fecha_nacimiento + 'T00:00:00');
            if (selectedDate > todayDate) errs.fecha_nacimiento = 'Fecha en el futuro';
            else if (selectedDate > globalMinAgeDate) errs.fecha_nacimiento = 'Debe ser mayor de 18 años';
        }

        setFormErrors(errs);
    }, [formData, profileData]);

    // Real-time validation for password
    useEffect(() => {
        const errs: Record<string, string> = {};

        if (passwordData.nueva_contrasena) {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
            if (!passwordRegex.test(passwordData.nueva_contrasena)) errs.nueva_contrasena = 'Contraseña insegura';
        }

        if (passwordData.confirmar_contrasena) {
            if (passwordData.nueva_contrasena !== passwordData.confirmar_contrasena) errs.confirmar_contrasena = 'No coinciden';
        }
        setPasswordErrors(errs);
    }, [passwordData]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        const allFields: Record<string, boolean> = { ...touchedFields };
        ['nombre', 'apellido', 'telefono', 'barrio', 'direccion', 'fecha_nacimiento'].forEach(f => allFields[f] = true);
        setTouchedFields(allFields);

        if (Object.keys(formErrors).length > 0) {
            toast.error('Por favor corrija los errores en el formulario');
            return;
        }

        setIsProcessing(true);
        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formDataToSend.append(key, value as string);
                }
            });

            if (fotoFile) {
                formDataToSend.append('fotoFile', fotoFile);
            }

            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) {
                const errorData = await response.json();
                const err = new Error(errorData.message || 'Error al actualizar perfil') as any;
                err.errors = errorData.errors;
                throw err;
            }

            toast.success('Perfil actualizado exitosamente');
            setFotoFile(null);
            fetchProfile();
        } catch (error: any) {
            let errorMsg = error.message;
            if (errorMsg === 'Error de validación.' && error.errors) {
                errorMsg = `Error de validación: ${error.errors.map((e: any) => `${e.campo}: ${e.mensaje}`).join(', ')}`;
            }
            toast.error(errorMsg);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFotoFile(file);
            // Limpiar URL si se selecciona archivo
            setFormData(prev => ({ ...prev, foto: '' }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark password fields as touched
        const allFields: Record<string, boolean> = { ...touchedFields };
        ['nueva_contrasena', 'confirmar_contrasena'].forEach(f => allFields[f] = true);
        setTouchedFields(allFields);

        if (Object.keys(passwordErrors).length > 0) {
            toast.error('La nueva contraseña no cumple con los requisitos');
            return;
        }
        if (passwordData.nueva_contrasena && passwordData.contrasena_actual && passwordData.nueva_contrasena === passwordData.contrasena_actual) {
            toast.error('La nueva contraseña no puede ser igual a la actual');
            return;
        }

        setIsProcessingPassword(true);
        try {
            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contrasena_actual: passwordData.contrasena_actual,
                    nueva_contrasena: passwordData.nueva_contrasena
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cambiar contraseña');
            }

            toast.success('Contraseña actualizada exitosamente');
            setPasswordData({ contrasena_actual: '', nueva_contrasena: '', confirmar_contrasena: '' });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessingPassword(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                    <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
                    <p className="text-muted-foreground">Administra tu información personal y configuración de cuenta.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-24">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto w-24 h-24 mb-4 relative">
                                {fotoPreview ? (
                                    <img src={fotoPreview} alt="Foto de perfil" className="w-full h-full rounded-full object-cover border-4 border-blue-600/20" />
                                ) : (
                                    <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                        {formData.nombre?.charAt(0) || profileData?.Correo?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <CardTitle>{formData.nombre} {formData.apellido}</CardTitle>
                            <CardDescription className="flex items-center justify-center gap-2 mt-2">
                                <Badge variant="secondary" className="capitalize">{profileData?.NombreRol}</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="truncate">{profileData?.Correo}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                                <span>Rol: {profileData?.NombreRol}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className={`w-2 h-2 rounded-full ${profileData?.estado ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span>Estado: {profileData?.estado ? 'Activo' : 'Inactivo'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Datos Personales</CardTitle>
                                <CardDescription>Actualiza tu información básica de contacto.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="nombre">Nombre *</Label>
                                                {touchedFields.nombre && formErrors.nombre && <span className="text-red-500 text-xs font-medium">{formErrors.nombre}</span>}
                                            </div>
                                            <Input
                                                id="nombre"
                                                value={formData.nombre}
                                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                                onFocus={() => handleBlur('nombre')}
                                                onBlur={() => handleBlur('nombre')}
                                                className={touchedFields.nombre && formErrors.nombre ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="apellido">Apellido *</Label>
                                                {touchedFields.apellido && formErrors.apellido && <span className="text-red-500 text-xs font-medium">{formErrors.apellido}</span>}
                                            </div>
                                            <Input
                                                id="apellido"
                                                value={formData.apellido}
                                                onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                                                onFocus={() => handleBlur('apellido')}
                                                onBlur={() => handleBlur('apellido')}
                                                className={touchedFields.apellido && formErrors.apellido ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tipo_doc">Tipo Documento</Label>
                                            <Select
                                                value={formData.tipo_documento}
                                                onValueChange={v => setFormData({ ...formData, tipo_documento: v })}
                                                disabled
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                                    <SelectItem value="NIT">NIT</SelectItem>
                                                    <SelectItem value="PAS">Pasaporte</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="documento">Número Documento</Label>
                                            <Input
                                                id="documento"
                                                value={formData.documento}
                                                onChange={e => setFormData({ ...formData, documento: e.target.value })}
                                                required
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="telefono">Teléfono *</Label>
                                                {touchedFields.telefono && formErrors.telefono && <span className="text-red-500 text-xs font-medium">{formErrors.telefono}</span>}
                                            </div>
                                            <Input
                                                id="telefono"
                                                value={formData.telefono}
                                                onChange={e => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '') })}
                                                onFocus={() => handleBlur('telefono')}
                                                onBlur={() => handleBlur('telefono')}
                                                className={touchedFields.telefono && formErrors.telefono ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="barrio">Barrio *</Label>
                                                {touchedFields.barrio && formErrors.barrio && <span className="text-red-500 text-xs font-medium">{formErrors.barrio}</span>}
                                            </div>
                                            <Input
                                                id="barrio"
                                                value={formData.barrio}
                                                onChange={e => setFormData({ ...formData, barrio: e.target.value })}
                                                onFocus={() => handleBlur('barrio')}
                                                onBlur={() => handleBlur('barrio')}
                                                className={touchedFields.barrio && formErrors.barrio ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="direccion">Dirección *</Label>
                                            {touchedFields.direccion && formErrors.direccion && <span className="text-red-500 text-xs font-medium">{formErrors.direccion}</span>}
                                        </div>
                                        <Input
                                            id="direccion"
                                            value={formData.direccion}
                                            onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                            onFocus={() => handleBlur('direccion')}
                                            onBlur={() => handleBlur('direccion')}
                                            className={touchedFields.direccion && formErrors.direccion ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            required
                                            placeholder="Ej: Calle 10 #20-30"
                                        />
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="nacimiento" className="flex items-center gap-2 text-sm">
                                                Fecha de Nacimiento *
                                            </Label>
                                            {touchedFields.fecha_nacimiento && formErrors.fecha_nacimiento && <span className="text-red-500 text-xs font-medium">{formErrors.fecha_nacimiento}</span>}
                                        </div>
                                        <Popover open={isCalendarOpen} onOpenChange={(open) => { setIsCalendarOpen(open); if (open) handleBlur('fecha_nacimiento'); if (!open) handleBlur('fecha_nacimiento'); }}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    onFocus={() => handleBlur('fecha_nacimiento')}
                                                    className={`w-full justify-start text-left font-normal h-10 ${!formData.fecha_nacimiento && "text-muted-foreground"} ${touchedFields.fecha_nacimiento && formErrors.fecha_nacimiento ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.fecha_nacimiento ? (
                                                        format(new Date(formData.fecha_nacimiento + 'T00:00:00'), "PPP", { locale: es })
                                                    ) : (
                                                        <span>Seleccionar fecha</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CustomDatePicker
                                                    value={formData.fecha_nacimiento}
                                                    onChange={(v) => {
                                                        setFormData(prev => ({ ...prev, fecha_nacimiento: v }));
                                                        handleBlur('fecha_nacimiento');
                                                    }}
                                                    minAgeDate={globalMinAgeDate}
                                                    onClose={() => setIsCalendarOpen(false)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-4 border-t pt-4 mt-6">
                                        <h3 className="text-sm font-medium flex items-center gap-2">
                                            <Camera className="w-4 h-4 text-blue-600" />
                                            Foto de Perfil
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <ImageIcon className="w-3 h-3" />
                                                    Desde archivo local
                                                </Label>
                                                <Input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isProcessing || !hasProfileChanges()}
                                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                                Guardando...
                                            </>
                                        ) : 'Guardar Cambios'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="w-5 h-5" />
                                    Seguridad
                                </CardTitle>
                                <CardDescription>Modifica la contraseña de acceso a tu cuenta.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md" noValidate>
                                    <div className="space-y-2">
                                        <Label htmlFor="current-pass">Contraseña Actual *</Label>
                                        <div className="relative">
                                            <Input
                                                id="current-pass"
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={passwordData.contrasena_actual}
                                                onChange={e => setPasswordData({ ...passwordData, contrasena_actual: e.target.value })}
                                                required
                                                placeholder="********"
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <p className='text-xs text-muted-foreground'>La contraseña debe tener al menos 8 caracteres, una mayuscula, un número y un carácter especial.</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="new-pass">Nueva Contraseña *</Label>
                                            {touchedFields.nueva_contrasena && passwordErrors.nueva_contrasena && <span className="text-red-500 text-xs font-medium">{passwordErrors.nueva_contrasena}</span>}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="new-pass"
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordData.nueva_contrasena}
                                                onChange={e => setPasswordData({ ...passwordData, nueva_contrasena: e.target.value })}
                                                onFocus={() => handleBlur('nueva_contrasena')}
                                                onBlur={() => handleBlur('nueva_contrasena')}
                                                required
                                                placeholder="********"
                                                className={`pr-10 ${touchedFields.nueva_contrasena && passwordErrors.nueva_contrasena ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="confirm-pass">Confirmar Nueva Contraseña *</Label>
                                            {touchedFields.confirmar_contrasena && passwordErrors.confirmar_contrasena && <span className="text-red-500 text-xs font-medium">{passwordErrors.confirmar_contrasena}</span>}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="confirm-pass"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordData.confirmar_contrasena}
                                                onChange={e => setPasswordData({ ...passwordData, confirmar_contrasena: e.target.value })}
                                                onFocus={() => handleBlur('confirmar_contrasena')}
                                                onBlur={() => handleBlur('confirmar_contrasena')}
                                                required
                                                placeholder="********"
                                                className={`pr-10 ${touchedFields.confirmar_contrasena && passwordErrors.confirmar_contrasena ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button type="submit" variant="secondary" disabled={isProcessingPassword} className="w-full sm:w-auto mt-2">
                                        {isProcessingPassword ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                                Actualizando...
                                            </>
                                        ) : 'Actualizar Contraseña'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
