import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { User, Lock, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export function MiPerfil() {
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // States for Profile Update
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        tipo_documento: 'CC',
        documento: '',
        telefono: '',
        direccion: '',
        barrio: ''
    });

    // States for Password Update
    const [passwordData, setPasswordData] = useState({
        contrasena_actual: '',
        nueva_contrasena: '',
        confirmar_contrasena: ''
    });

    // @ts-ignore
    const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('token');

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
                barrio: (isClient ? data.Barrio : data.BarrioEmpleado) || ''
            });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar perfil');
            }

            toast.success('Perfil actualizado exitosamente');
            fetchProfile();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.nueva_contrasena !== passwordData.confirmar_contrasena) {
            toast.error('Las contraseñas nuevas no coinciden');
            return;
        }

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
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4 text-white text-3xl font-bold">
                            {formData.nombre?.charAt(0) || profileData?.Correo?.charAt(0).toUpperCase()}
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
                                        <Select disabled value={formData.tipo_documento} onValueChange={v => setFormData({ ...formData, tipo_documento: v })}>
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
                                        <Input id="documento" disabled value={formData.documento} onChange={e => setFormData({ ...formData, documento: e.target.value })} required />
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

                                <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">Guardar Cambios</Button>
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
                            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="current-pass">Contraseña Actual *</Label>
                                    <Input id="current-pass" type="password" value={passwordData.contrasena_actual} onChange={e => setPasswordData({ ...passwordData, contrasena_actual: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-pass">Nueva Contraseña *</Label>
                                    <Input id="new-pass" type="password" value={passwordData.nueva_contrasena} onChange={e => setPasswordData({ ...passwordData, nueva_contrasena: e.target.value })} required minLength={6} placeholder="Mínimo 6 caracteres" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-pass">Confirmar Nueva Contraseña *</Label>
                                    <Input id="confirm-pass" type="password" value={passwordData.confirmar_contrasena} onChange={e => setPasswordData({ ...passwordData, confirmar_contrasena: e.target.value })} required minLength={6} />
                                </div>
                                <Button type="submit" variant="secondary" className="w-full sm:w-auto mt-2">Actualizar Contraseña</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
