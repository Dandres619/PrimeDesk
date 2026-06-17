import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { validateAddress, validatePhone, normalizeDate } from '../utils/validation';
import { parse, isValid } from 'date-fns';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
const BASE_URL = API_URL.replace('/api', '');

export function useProfile() {
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
    const [initialFormData, setInitialFormData] = useState<any>(null);
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const token = localStorage.getItem('token');

    const getPhotoUrl = (photo: string | null) => {
        if (!photo) return null;
        if (photo.startsWith('http')) return photo;
        return `${BASE_URL}${photo}`;
    };

    const fetchProfile = async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
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
                foto: isExternal ? photoPath : '',
                fecha_nacimiento: (isClient ? data.FechaNacimiento : data.NacEmpleado) ? (isClient ? data.FechaNacimiento : data.NacEmpleado).split('T')[0] : ''
            };
            setFormData(newFormData);
            setInitialFormData(newFormData);
            setFotoPreview(getPhotoUrl(photoPath));
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleBlur = (field: string) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
    };

    const hasProfileChanges = () => {
        if (!initialFormData) return false;
        return Object.keys(formData).some(key => {
            if (key === 'foto') return false;
            const currentVal = (formData as any)[key] || '';
            const initialVal = (initialFormData as any)[key] || '';
            return currentVal !== initialVal;
        });
    };

    useEffect(() => {
        if (!profileData) return;
        const errs: Record<string, string> = {};
        const todayDate = new Date();
        const globalMinAgeDate = new Date(todayDate.getFullYear() - 18, todayDate.getMonth(), todayDate.getDate());

        if (!formData.nombre) {
            errs.nombre = 'No puede estar vacío';
        } else if (formData.nombre.length < 2) {
            errs.nombre = 'Mínimo 2 caracteres';
        } else if (formData.nombre.length > 50) {
            errs.nombre = 'Máximo 50 caracteres';
        }

        if (!formData.apellido) {
            errs.apellido = 'No puede estar vacío';
        } else if (formData.apellido.length < 2) {
            errs.apellido = 'Mínimo 2 caracteres';
        } else if (formData.apellido.length > 50) {
            errs.apellido = 'Máximo 50 caracteres';
        }

        if (!formData.telefono) errs.telefono = 'No puede estar vacío';
        else if (!validatePhone(formData.telefono)) errs.telefono = 'Entre 7 y 10 números';

        if (!formData.barrio) {
            errs.barrio = 'No puede estar vacío';
        } else if (formData.barrio.length < 5) {
            errs.barrio = 'Mínimo 5 caracteres';
        } else if (formData.barrio.length > 100) {
            errs.barrio = 'Máximo 100 caracteres';
        }

        if (!formData.direccion) {
            errs.direccion = 'No puede estar vacío';
        } else if (formData.direccion.length < 5) {
            errs.direccion = 'Mínimo 5 caracteres';
        } else if (formData.direccion.length > 100) {
            errs.direccion = 'Máximo 100 caracteres';
        } else if (!validateAddress(formData.direccion)) {
            errs.direccion = 'Dirección inválida (Ej: Calle 10 #20-30)';
        }

        if (formData.fecha_nacimiento) {
            let dateObj: Date | null = null;
            let yearVal = 0;
            const value = formData.fecha_nacimiento;

            if (value === 'INVALID') {
                errs.fecha_nacimiento = 'Fecha inválida';
            } else if (value.includes('/')) {
                const parts = value.split('/');
                if (parts.length === 3 && parts[2]) {
                    yearVal = parseInt(parts[2]);
                }
                if (parts.length < 3 || !parts[2] || parts[2].length < 4) {
                    if (yearVal > 0 && yearVal < 1950) errs.fecha_nacimiento = 'El año mínimo es 1950';
                    else errs.fecha_nacimiento = 'Fecha incompleta';
                } else {
                    const d = parse(value, 'dd/MM/yyyy', new Date());
                    if (isValid(d)) dateObj = d;
                    else errs.fecha_nacimiento = 'Fecha inválida';
                }
            } else {
                dateObj = new Date(value + 'T00:00:00');
                yearVal = parseInt(value.split('-')[0]);
            }

            if (!errs.fecha_nacimiento) {
                if (yearVal > 0 && yearVal < 1950) errs.fecha_nacimiento = 'El año mínimo es 1950';
                else if (dateObj) {
                    if (dateObj > todayDate) errs.fecha_nacimiento = 'La fecha no puede ser en el futuro';
                    else if (dateObj > globalMinAgeDate) errs.fecha_nacimiento = 'Debe ser mayor de 18 años';
                }
            }
        }

        setFormErrors(errs);
    }, [formData, profileData]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const allFields: Record<string, boolean> = { ...touchedFields };
        ['nombre', 'apellido', 'telefono', 'barrio', 'direccion', 'fecha_nacimiento'].forEach(f => allFields[f] = true);
        setTouchedFields(allFields);

        if (Object.keys(formErrors).length > 0) {
            toast.error('Error al guardar: Por favor corrija los errores en el formulario');
            return;
        }

        setIsProcessing(true);
        try {
            const formDataToSend = new FormData();

            const personalInfo = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                tipo_documento: formData.tipo_documento,
                documento: formData.documento,
                telefono: formData.telefono,
                barrio: formData.barrio,
                direccion: formData.direccion,
                fecha_nacimiento: normalizeDate(formData.fecha_nacimiento)
            };

            Object.entries(personalInfo).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formDataToSend.append(key, value as string);
                }
            });

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
            fetchProfile(false);
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

    const uploadPhoto = async (file: File) => {
        setIsUploadingPhoto(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('fotoFile', file);

            const personalInfo = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                tipo_documento: formData.tipo_documento,
                documento: formData.documento,
                telefono: formData.telefono,
                barrio: formData.barrio,
                direccion: formData.direccion,
                fecha_nacimiento: normalizeDate(formData.fecha_nacimiento)
            };

            Object.entries(personalInfo).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formDataToSend.append(key, value as string);
                }
            });

            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al subir la foto de perfil');
            }

            toast.success('Foto de perfil actualizada correctamente');
            fetchProfile(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Solo se permiten imágenes (JPG, PNG, WEBP, etc).');
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            await uploadPhoto(file);
        }
    };

    return {
        profileData,
        isLoading,
        isProcessing,
        isUploadingPhoto,
        formData,
        setFormData,
        formErrors,
        touchedFields,
        handleBlur,
        hasProfileChanges,
        handleProfileSubmit,
        handleFileChange,
        fotoPreview,
        fileInputRef
    };
}
