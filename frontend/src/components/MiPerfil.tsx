import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { User, Lock, Mail, Briefcase, Loader2, Camera, Globe, Image as ImageIcon, Calendar } from 'lucide-react';
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

    // @ts-ignore
    const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
    const BASE_URL = API_URL.replace('/api', '');
    const token = localStorage.getItem('token');

    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

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
            setFormData({
                nombre: (isClient ? data.NombreCliente : data.NombreEmpleado) || '',
                apellido: (isClient ? data.ApellidoCliente : data.ApellidoEmpleado) || '',
                tipo_documento: (isClient ? data.TipoDocumento : data.TipoDocEmpleado) || 'CC',
                documento: (isClient ? data.Documento : data.DocEmpleado) || '',
                telefono: (isClient ? data.Telefono : data.TelEmpleado) || '',
                direccion: (isClient ? data.Direccion : data.DirEmpleado) || '',
                barrio: (isClient ? data.Barrio : data.BarrioEmpleado) || '',
                foto: (isClient ? data.FotoCliente : data.FotoEmpleado) || '',
                fecha_nacimiento: (isClient ? data.FechaNacimiento : data.NacEmpleado) ? (isClient ? data.FechaNacimiento : data.NacEmpleado).split('T')[0] : ''
            });
            setFotoPreview(getPhotoUrl(isClient ? data.FotoCliente : data.FotoEmpleado));
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                throw new Error(errorData.message || 'Error al actualizar perfil');
            }

            toast.success('Perfil actualizado exitosamente');
            setFotoFile(null);
            fetchProfile();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.nueva_contrasena !== passwordData.confirmar_contrasena) {
            toast.error('Las contraseñas nuevas no coinciden');
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(passwordData.nueva_contrasena)) {
            toast.error('La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial');
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
                                <form onSubmit={handleProfileSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nombre">Nombres</Label>
                                            <Input id="nombre" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="apellido">Apellidos</Label>
                                            <Input id="apellido" value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tipo_doc">Tipo Documento</Label>
                                            <Select value={formData.tipo_documento} onValueChange={v => setFormData({ ...formData, tipo_documento: v })}>
                                                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
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
                                            <Input id="documento" value={formData.documento} onChange={e => setFormData({ ...formData, documento: e.target.value })} required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="telefono">Teléfono</Label>
                                            <Input id="telefono" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="barrio">Barrio</Label>
                                            <Input id="barrio" value={formData.barrio} onChange={e => setFormData({ ...formData, barrio: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="direccion">Dirección</Label>
                                        <Input id="direccion" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} />
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
                                                <Input type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Globe className="w-3 h-3" />
                                                    Desde URL externa
                                                </Label>
                                                <Input
                                                    placeholder="https://..."
                                                    value={formData.foto}
                                                    onChange={e => {
                                                        setFormData({ ...formData, foto: e.target.value });
                                                        if (!fotoFile) setFotoPreview(e.target.value);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <Label htmlFor="nacimiento" className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            Fecha de Nacimiento
                                        </Label>
                                        <Input
                                            id="nacimiento"
                                            type="date"
                                            value={formData.fecha_nacimiento}
                                            onChange={e => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                                        />
                                    </div>

                                    <Button type="submit" disabled={isProcessing} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
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
                                        <Input id="current-pass" type="password" value={passwordData.contrasena_actual} onChange={e => setPasswordData({ ...passwordData, contrasena_actual: e.target.value })} required placeholder="********" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-pass">Nueva Contraseña *</Label>
                                        <Input id="new-pass" type="password" value={passwordData.nueva_contrasena} onChange={e => setPasswordData({ ...passwordData, nueva_contrasena: e.target.value })} required placeholder="********" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-pass">Confirmar Nueva Contraseña *</Label>
                                        <Input id="confirm-pass" type="password" value={passwordData.confirmar_contrasena} onChange={e => setPasswordData({ ...passwordData, confirmar_contrasena: e.target.value })} required placeholder="********" />
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
