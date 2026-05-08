import React, { useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Lock, Mail, Camera, Image as ImageIcon, Eye, EyeOff, Save, Shield, Phone, MapPin, Home, Calendar, UserCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { DatePickerInput } from './ui/DatePickerInput';
import { toast } from 'sonner';

export function MiPerfil() {
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isProcessingPassword, setIsProcessingPassword] = useState(false);

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

    const [passwordData, setPasswordData] = useState({
        contrasena_actual: '',
        nueva_contrasena: '',
        confirmar_contrasena: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
    const [dateInput, setDateInput] = useState('');
    const [initialFormData, setInitialFormData] = useState<any>(null);
    const [activeSection, setActiveSection] = useState<'perfil' | 'seguridad'>('perfil');

    const handleBlur = (field: string) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
    };

    const hasProfileChanges = () => {
        if (!initialFormData) return false;
        if (fotoFile) return true;
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
                foto: isExternal ? photoPath : '',
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

        if (!formData.fecha_nacimiento) errs.fecha_nacimiento = 'Por favor complete la fecha';
        else {
            const selectedDate = new Date(formData.fecha_nacimiento + 'T00:00:00');
            if (isNaN(selectedDate.getTime())) errs.fecha_nacimiento = 'Fecha inválida';
            else if (selectedDate > todayDate) errs.fecha_nacimiento = 'Fecha en el futuro';
            else if (selectedDate > globalMinAgeDate) errs.fecha_nacimiento = 'Debe ser mayor de 18 años';
            else if (selectedDate.getFullYear() < 1950) errs.fecha_nacimiento = 'El año mínimo es 1950';
        }

        setFormErrors(errs);
    }, [formData, profileData]);

    useEffect(() => {
        const errs: Record<string, string> = {};

        if (touchedFields.contrasena_actual && !passwordData.contrasena_actual) {
            errs.contrasena_actual = 'Ingresa la contraseña actual.';
        }

        if (passwordData.nueva_contrasena) {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
            if (!passwordRegex.test(passwordData.nueva_contrasena)) errs.nueva_contrasena = 'Contraseña insegura';
        }

        if (passwordData.confirmar_contrasena) {
            if (passwordData.nueva_contrasena !== passwordData.confirmar_contrasena) errs.confirmar_contrasena = 'Las contraseñas no coinciden';
        }
        setPasswordErrors(errs);
    }, [passwordData, touchedFields]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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

        const allFields: Record<string, boolean> = { ...touchedFields };
        ['contrasena_actual', 'nueva_contrasena', 'confirmar_contrasena'].forEach(f => allFields[f] = true);
        setTouchedFields(allFields);

        if (!passwordData.contrasena_actual) {
            toast.error('Ingresa la contraseña actual.');
            return;
        }

        if (Object.keys(passwordErrors).length > 0) {
            toast.error('La nueva contraseña no cumple con los requisitos.');
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
            setTouchedFields(prev => {
                const next = { ...prev };
                ['contrasena_actual', 'nueva_contrasena', 'confirmar_contrasena'].forEach(f => delete next[f]);
                return next;
            });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessingPassword(false);
        }
    };

    // ── Password strength helper ──────────────────────────────────────────────
    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return { level: 0, label: '', color: '' };
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++;
        const map = [
            { level: 0, label: '', color: '' },
            { level: 1, label: 'Débil', color: '#ef4444' },
            { level: 2, label: 'Regular', color: '#f97316' },
            { level: 3, label: 'Buena', color: '#eab308' },
            { level: 4, label: 'Fuerte', color: '#22c55e' },
        ];
        return map[score];
    };

    const pwdStrength = getPasswordStrength(passwordData.nueva_contrasena);

    // ── Field component helpers ───────────────────────────────────────────────
    const FieldError = ({ field, errors, touched }: { field: string; errors: Record<string, string>; touched: Record<string, boolean> }) =>
        touched[field] && errors[field] ? (
            <p className="mp-field-error">
                <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} />
                {errors[field]}
            </p>
        ) : null;

    return (
        <>
            <style>{`
                .mp-root {
                    min-height: 100vh;
                    background: transparent;
                    font-family: inherit;
                    color: #0f172a;
                }

                .mp-root * { box-sizing: border-box; }

                /* ── Page layout ── */
                .mp-page {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 48px 24px 80px;
                }

                /* ── Header ── */
                .mp-header {
                    margin-bottom: 48px;
                }
                .mp-header-eyebrow {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #64748b;
                    margin-bottom: 8px;
                }
                .mp-header-title {
                    font-family: inherit;
                    font-size: clamp(32px, 5vw, 48px);
                    font-weight: 600;
                    line-height: 1.1;
                    color: #0f172a;
                    margin: 0 0 8px;
                }
                .mp-header-title em {
                    font-style: italic;
                    color: #2563eb;
                }
                .mp-header-sub {
                    font-size: 15px;
                    color: #475569;
                    font-weight: 400;
                }

                /* ── Loading ── */
                .mp-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    gap: 16px;
                }
                .mp-loading-ring {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #cbd5e1;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: mp-spin 0.8s linear infinite;
                }
                @keyframes mp-spin { to { transform: rotate(360deg); } }
                .mp-loading-text {
                    font-size: 14px;
                    color: #64748b;
                    font-weight: 500;
                }

                /* ── Grid ── */
                .mp-grid {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 28px;
                    align-items: start;
                }
                @media (max-width: 900px) {
                    .mp-grid { grid-template-columns: 1fr; }
                }

                /* ── Sidebar ── */
                .mp-sidebar {
                    position: sticky;
                    top: 28px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* ── Card ── */
                .mp-card {
                    background: #ffffff;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
                    transition: box-shadow 0.2s ease;
                }
                .mp-card:hover {
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 8px 28px rgba(0,0,0,0.06);
                }

                /* ── Profile card ── */
                .mp-profile-card {
                    padding: 0;
                }
                .mp-profile-banner {
                    height: 88px;
                    background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #2563eb 100%);
                    position: relative;
                }
                .mp-profile-avatar-wrap {
                    display: flex;
                    justify-content: center;
                    margin-top: -44px;
                    margin-bottom: 16px;
                    position: relative;
                    z-index: 1;
                }
                .mp-avatar-outer {
                    position: relative;
                    display: inline-flex;
                }
                .mp-avatar {
                    width: 88px;
                    height: 88px;
                    border-radius: 50%;
                    border: 4px solid #fff;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }
                .mp-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .mp-avatar-initial {
                    font-family: inherit;
                    font-weight: 600;
                    font-size: 32px;
                    color: #fff;
                }
                .mp-avatar-cam-btn {
                    position: absolute;
                    bottom: 2px;
                    right: 2px;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: #2563eb;
                    border: 2px solid #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }
                .mp-avatar-cam-btn:hover { background: #1d4ed8; }
                .mp-profile-info {
                    text-align: center;
                    padding: 0 20px 24px;
                }
                .mp-profile-name {
                    font-family: inherit;
                    font-size: 22px;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0 0 8px;
                }
                .mp-badges {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-bottom: 20px;
                }
                .mp-badge-role {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    background: #eff6ff;
                    color: #2563eb;
                    padding: 4px 10px;
                    border-radius: 20px;
                    border: 1px solid #bfdbfe;
                }
                .mp-badge-status {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    font-weight: 500;
                    padding: 4px 10px;
                    border-radius: 20px;
                }
                .mp-badge-status.active {
                    background: #f0fdf4;
                    color: #16a34a;
                    border: 1px solid #bbf7d0;
                }
                .mp-badge-status.inactive {
                    background: #fef2f2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                }
                .mp-badge-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: currentColor;
                }
                .mp-contact-list {
                    list-style: none;
                    padding: 16px 0 0;
                    margin: 0;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    text-align: left;
                }
                .mp-contact-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    color: #475569;
                }
                .mp-contact-icon {
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .mp-contact-text {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                /* ── Nav tabs ── */
                .mp-nav {
                    display: flex;
                    background: #fff;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    padding: 5px;
                    gap: 4px;
                }
                .mp-nav-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    padding: 10px 14px;
                    border: none;
                    border-radius: 10px;
                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: transparent;
                    color: #64748b;
                }
                .mp-nav-btn.active {
                    background: #0f172a;
                    color: #fff;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
                .mp-nav-btn:not(.active):hover {
                    background: #f1f5f9;
                    color: #334155;
                }

                /* ── Main content ── */
                .mp-main {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                /* ── Card header ── */
                .mp-card-header {
                    padding: 24px 28px 20px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .mp-card-title {
                    font-family: inherit;
                    font-size: 22px;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0 0 4px;
                }
                .mp-card-desc {
                    font-size: 13px;
                    color: #64748b;
                    margin: 0;
                }
                .mp-card-body {
                    padding: 28px;
                }

                /* ── Form grid ── */
                .mp-form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                @media (max-width: 600px) {
                    .mp-form-row { grid-template-columns: 1fr; }
                }
                .mp-form-full {
                    margin-bottom: 20px;
                }

                /* ── Field ── */
                .mp-field { display: flex; flex-direction: column; gap: 6px; }
                .mp-label {
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    color: #475569;
                }
                .mp-required { color: #2563eb; }

                /* Override shadcn Input */
                .mp-input-wrap input,
                .mp-input-wrap .mp-input {
                    height: 44px;
                    border-radius: 10px;
                    border: 1.5px solid #cbd5e1;
                    background: #ffffff;
                    font-family: inherit;
                    font-size: 14px;
                    color: #0f172a;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    padding: 0 14px;
                    width: 100%;
                    outline: none;
                }
                .mp-input-wrap input:focus,
                .mp-input-wrap .mp-input:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
                    background: #fff;
                }
                .mp-input-wrap input:disabled {
                    background: #f1f5f9;
                    color: #94a3b8;
                    cursor: not-allowed;
                }
                .mp-input-err input {
                    border-color: #ef4444 !important;
                    box-shadow: 0 0 0 3px rgba(239,68,68,0.08) !important;
                }

                /* Password field */
                .mp-pw-wrap {
                    position: relative;
                }
                .mp-pw-wrap input {
                    padding-right: 44px !important;
                }
                .mp-pw-toggle {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    padding: 4px;
                    border-radius: 4px;
                    transition: color 0.15s;
                }
                .mp-pw-toggle:hover { color: #334155; }

                .mp-field-error {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: #ef4444;
                    margin: 0;
                    font-weight: 500;
                }

                /* ── Disabled field style ── */
                .mp-disabled-field {
                    height: 44px;
                    border-radius: 10px;
                    border: 1.5px solid #e2e8f0;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    padding: 0 14px;
                    font-size: 14px;
                    color: #94a3b8;
                }

                /* ── Select override ── */
                .mp-select-trigger {
                    height: 44px !important;
                    border-radius: 10px !important;
                    border: 1.5px solid #e2e8f0 !important;
                    background: #f1f5f9 !important;
                    font-family: inherit !important;
                    font-size: 14px !important;
                    color: #94a3b8 !important;
                }

                /* ── Date button ── */
                .mp-date-btn {
                    height: 44px;
                    width: 100%;
                    border-radius: 10px;
                    border: 1.5px solid #cbd5e1;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 14px;
                    font-family: inherit;
                    font-size: 14px;
                    color: #0f172a;
                    cursor: pointer;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    text-align: left;
                }
                .mp-date-btn:hover, .mp-date-btn:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
                    background: #fff;
                    outline: none;
                }
                .mp-date-btn.placeholder { color: #94a3b8; }
                .mp-date-err { border-color: #ef4444 !important; }

                /* ── Photo section ── */
                .mp-photo-section {
                    background: #f8fafc;
                    border: 1.5px dashed #cbd5e1;
                    border-radius: 14px;
                    padding: 20px;
                    margin-top: 4px;
                }
                .mp-photo-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #475569;
                    margin-bottom: 12px;
                    font-weight: 500;
                }
                .mp-file-input {
                    font-family: inherit;
                    font-size: 13px;
                    color: #475569;
                    width: 100%;
                }
                .mp-file-input::file-selector-button {
                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 600;
                    color: #2563eb;
                    background: #fff;
                    border: 1.5px solid #bfdbfe;
                    border-radius: 8px;
                    padding: 6px 14px;
                    cursor: pointer;
                    margin-right: 12px;
                    transition: background 0.15s;
                }
                .mp-file-input::file-selector-button:hover {
                    background: #eff6ff;
                }

                /* ── Divider ── */
                .mp-divider {
                    height: 1px;
                    background: #e2e8f0;
                    margin: 24px 0;
                }

                /* ── Section label ── */
                .mp-section-label {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #94a3b8;
                    margin-bottom: 16px;
                }

                /* ── Submit button ── */
                .mp-submit-row {
                    display: flex;
                    justify-content: flex-end;
                    padding-top: 8px;
                }
                .mp-btn-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 11px 24px;
                    border-radius: 10px;
                    border: none;
                    background: #0f172a;
                    color: #fff;
                    font-family: inherit;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
                    letter-spacing: 0.01em;
                }
                .mp-btn-primary:hover:not(:disabled) {
                    background: #1e293b;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.18);
                    transform: translateY(-1px);
                }
                .mp-btn-primary:active:not(:disabled) { transform: translateY(0); }
                .mp-btn-primary:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                    transform: none;
                }
                .mp-btn-secondary {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 11px 24px;
                    border-radius: 10px;
                    border: 1.5px solid #2563eb;
                    background: transparent;
                    color: #2563eb;
                    font-family: inherit;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.1s;
                }
                .mp-btn-secondary:hover:not(:disabled) {
                    background: #eff6ff;
                    transform: translateY(-1px);
                }
                .mp-btn-secondary:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }

                /* ── Password strength ── */
                .mp-pwd-strength {
                    margin-top: 8px;
                }
                .mp-pwd-bars {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 4px;
                }
                .mp-pwd-bar {
                    height: 3px;
                    flex: 1;
                    border-radius: 4px;
                    background: #cbd5e1;
                    transition: background 0.3s;
                }
                .mp-pwd-label {
                    font-size: 11px;
                    font-weight: 600;
                }

                /* ── Security tips ── */
                .mp-tips {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid #e2e8f0;
                    margin-top: 4px;
                }
                .mp-tips-title {
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                    color: #64748b;
                    margin-bottom: 10px;
                }
                .mp-tips-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .mp-tip-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #475569;
                }
                .mp-tip-check {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    border: 1.5px solid #cbd5e1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.2s;
                }
                .mp-tip-check.met {
                    background: #22c55e;
                    border-color: #22c55e;
                    color: #fff;
                }
            `}</style>

            <div className="mp-root">
                <div className="mp-page">
                    {/* Header */}
                    <div className="mp-header">
                        <p className="mp-header-eyebrow">Configuración de cuenta</p>
                        <h1 className="mp-header-title">Mi perfil</h1>
                        <p className="mp-header-sub">Gestiona tu información personal y configuración de seguridad</p>
                    </div>

                    {isLoading ? (
                        <div className="mp-loading">
                            <div className="mp-loading-ring" />
                            <p className="mp-loading-text">Cargando información...</p>
                        </div>
                    ) : (
                        <div className="mp-grid">
                            {/* ── Sidebar ── */}
                            <div className="mp-sidebar">
                                {/* Profile card */}
                                <div className="mp-card mp-profile-card">
                                    <div className="mp-profile-banner" />
                                    <div className="mp-profile-avatar-wrap">
                                        <div className="mp-avatar-outer">
                                            <div className="mp-avatar">
                                                {fotoPreview ? (
                                                    <img src={fotoPreview} alt="Foto de perfil" />
                                                ) : (
                                                    <span className="mp-avatar-initial">
                                                        {formData.nombre?.charAt(0) || profileData?.Correo?.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                className="mp-avatar-cam-btn"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Camera style={{ width: 12, height: 12, color: '#fff' }} />
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mp-profile-info">
                                        <h2 className="mp-profile-name">
                                            {formData.nombre} {formData.apellido}
                                        </h2>
                                        <div className="mp-badges">
                                            <span className="mp-badge-role">{profileData?.NombreRol}</span>
                                            <span className={`mp-badge-status ${profileData?.estado ? 'active' : 'inactive'}`}>
                                                <span className="mp-badge-dot" />
                                                {profileData?.estado ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>

                                        <ul className="mp-contact-list">
                                            <li className="mp-contact-item">
                                                <span className="mp-contact-icon">
                                                    <Mail style={{ width: 14, height: 14 }} />
                                                </span>
                                                <span className="mp-contact-text">{profileData?.Correo}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Nav tabs */}
                                <div className="mp-nav">
                                    <button
                                        className={`mp-nav-btn ${activeSection === 'perfil' ? 'active' : ''}`}
                                        onClick={() => setActiveSection('perfil')}
                                    >
                                        <UserCircle style={{ width: 15, height: 15 }} />
                                        Información
                                    </button>
                                    <button
                                        className={`mp-nav-btn ${activeSection === 'seguridad' ? 'active' : ''}`}
                                        onClick={() => setActiveSection('seguridad')}
                                    >
                                        <Shield style={{ width: 15, height: 15 }} />
                                        Seguridad
                                    </button>
                                </div>
                            </div>

                            {/* ── Main content ── */}
                            <div className="mp-main">
                                {/* ── Información personal ── */}
                                {activeSection === 'perfil' && (
                                    <div className="mp-card">
                                        <div className="mp-card-header">
                                            <h3 className="mp-card-title">Información Personal</h3>
                                            <p className="mp-card-desc">Actualiza tus datos básicos y de contacto</p>
                                        </div>
                                        <div className="mp-card-body">
                                            <form onSubmit={handleProfileSubmit} noValidate>
                                                <p className="mp-section-label">Datos personales</p>

                                                <div className="mp-form-row">
                                                    <div className="mp-field">
                                                        <label className="mp-label">Nombre <span className="mp-required">*</span></label>
                                                        <div className={`mp-input-wrap ${touchedFields.nombre && formErrors.nombre ? 'mp-input-err' : ''}`}>
                                                            <input
                                                                value={formData.nombre}
                                                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                                                onFocus={() => handleBlur('nombre')}
                                                                onBlur={() => handleBlur('nombre')}
                                                                placeholder="Tu nombre"
                                                            />
                                                        </div>
                                                        <FieldError field="nombre" errors={formErrors} touched={touchedFields} />
                                                    </div>
                                                    <div className="mp-field">
                                                        <label className="mp-label">Apellido <span className="mp-required">*</span></label>
                                                        <div className={`mp-input-wrap ${touchedFields.apellido && formErrors.apellido ? 'mp-input-err' : ''}`}>
                                                            <input
                                                                value={formData.apellido}
                                                                onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                                                                onFocus={() => handleBlur('apellido')}
                                                                onBlur={() => handleBlur('apellido')}
                                                                placeholder="Tu apellido"
                                                            />
                                                        </div>
                                                        <FieldError field="apellido" errors={formErrors} touched={touchedFields} />
                                                    </div>
                                                </div>

                                                <div className="mp-form-row">
                                                    <div className="mp-field">
                                                        <label className="mp-label">Tipo Documento</label>
                                                        <Select
                                                            value={formData.tipo_documento}
                                                            onValueChange={v => setFormData({ ...formData, tipo_documento: v })}
                                                            disabled
                                                        >
                                                            <SelectTrigger className="mp-select-trigger">
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
                                                    <div className="mp-field">
                                                        <label className="mp-label">Número Documento</label>
                                                        <div className="mp-disabled-field">{formData.documento || '—'}</div>
                                                    </div>
                                                </div>

                                                <div className="mp-divider" />
                                                <p className="mp-section-label">Contacto y ubicación</p>

                                                <div className="mp-form-row">
                                                    <div className="mp-field">
                                                        <label className="mp-label">
                                                            <Phone style={{ width: 11, height: 11, display: 'inline', marginRight: 4 }} />
                                                            Teléfono <span className="mp-required">*</span>
                                                        </label>
                                                        <div className={`mp-input-wrap ${touchedFields.telefono && formErrors.telefono ? 'mp-input-err' : ''}`}>
                                                            <input
                                                                value={formData.telefono}
                                                                onChange={e => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '') })}
                                                                onFocus={() => handleBlur('telefono')}
                                                                onBlur={() => handleBlur('telefono')}
                                                                placeholder="3001234567"
                                                            />
                                                        </div>
                                                        <FieldError field="telefono" errors={formErrors} touched={touchedFields} />
                                                    </div>
                                                    <div className="mp-field">
                                                        <label className="mp-label">
                                                            <Home style={{ width: 11, height: 11, display: 'inline', marginRight: 4 }} />
                                                            Barrio <span className="mp-required">*</span>
                                                        </label>
                                                        <div className={`mp-input-wrap ${touchedFields.barrio && formErrors.barrio ? 'mp-input-err' : ''}`}>
                                                            <input
                                                                value={formData.barrio}
                                                                onChange={e => setFormData({ ...formData, barrio: e.target.value })}
                                                                onFocus={() => handleBlur('barrio')}
                                                                onBlur={() => handleBlur('barrio')}
                                                                placeholder="Tu barrio"
                                                            />
                                                        </div>
                                                        <FieldError field="barrio" errors={formErrors} touched={touchedFields} />
                                                    </div>
                                                </div>

                                                <div className="mp-form-full">
                                                    <div className="mp-field">
                                                        <label className="mp-label">
                                                            <MapPin style={{ width: 11, height: 11, display: 'inline', marginRight: 4 }} />
                                                            Dirección <span className="mp-required">*</span>
                                                        </label>
                                                        <div className={`mp-input-wrap ${touchedFields.direccion && formErrors.direccion ? 'mp-input-err' : ''}`}>
                                                            <input
                                                                value={formData.direccion}
                                                                onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                                                onFocus={() => handleBlur('direccion')}
                                                                onBlur={() => handleBlur('direccion')}
                                                                placeholder="Ej: Calle 10 #20-30"
                                                            />
                                                        </div>
                                                        <FieldError field="direccion" errors={formErrors} touched={touchedFields} />
                                                    </div>
                                                </div>

                                                <div className="mp-form-full">
                                                    <div className="mp-field">
                                                        <label className="mp-label">
                                                            <Calendar style={{ width: 11, height: 11, display: 'inline', marginRight: 4 }} />
                                                            Fecha de Nacimiento <span className="mp-required">*</span>
                                                        </label>
                                                        <DatePickerInput
                                                            value={formData.fecha_nacimiento}
                                                            onChange={(v) => {
                                                                setFormData(prev => ({ ...prev, fecha_nacimiento: v }));
                                                            }}
                                                            onBlur={() => handleBlur('fecha_nacimiento')}
                                                            minAgeDate={globalMinAgeDate}
                                                            placeholder="Seleccionar fecha (DD/MM/AAAA)"
                                                            error={!!(touchedFields.fecha_nacimiento && formErrors.fecha_nacimiento)}
                                                        />
                                                        <FieldError field="fecha_nacimiento" errors={formErrors} touched={touchedFields} />
                                                    </div>
                                                </div>

                                                <div className="mp-divider" />
                                                <p className="mp-section-label">Foto de perfil</p>

                                                <div className="mp-photo-section">
                                                    <div className="mp-photo-label">
                                                        <ImageIcon style={{ width: 16, height: 16, color: '#2563eb' }} />
                                                        Sube una imagen desde tu dispositivo
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="mp-file-input"
                                                    />
                                                </div>

                                                <div className="mp-submit-row" style={{ marginTop: 28 }}>
                                                    <button
                                                        type="submit"
                                                        disabled={isProcessing || !hasProfileChanges()}
                                                        className="mp-btn-primary"
                                                    >
                                                        {isProcessing ? (
                                                            <>
                                                                <div className="mp-loading-ring" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                                                Guardando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save style={{ width: 15, height: 15 }} />
                                                                Guardar cambios
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {/* ── Seguridad ── */}
                                {activeSection === 'seguridad' && (
                                    <div className="mp-card">
                                        <div className="mp-card-header">
                                            <h3 className="mp-card-title">Seguridad</h3>
                                            <p className="mp-card-desc">Protege tu cuenta con una contraseña segura</p>
                                        </div>
                                        <div className="mp-card-body">
                                            <form onSubmit={handlePasswordSubmit} noValidate style={{ maxWidth: 480 }}>
                                                <p className="mp-section-label">Cambiar contraseña</p>

                                                <div className="mp-form-full">
                                                    <div className="mp-field">
                                                        <label className="mp-label">Contraseña actual <span className="mp-required">*</span></label>
                                                        <div className={`mp-input-wrap mp-pw-wrap ${touchedFields.contrasena_actual && passwordErrors.contrasena_actual ? 'mp-input-err' : ''}`}>
                                                            <input
                                                                type={showCurrentPassword ? 'text' : 'password'}
                                                                value={passwordData.contrasena_actual}
                                                                onChange={e => setPasswordData({ ...passwordData, contrasena_actual: e.target.value })}
                                                                onFocus={() => handleBlur('contrasena_actual')}
                                                                onBlur={() => handleBlur('contrasena_actual')}
                                                                placeholder="Ingresa tu contraseña actual"
                                                            />
                                                            <button type="button" className="mp-pw-toggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                                                {showCurrentPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                                                            </button>
                                                        </div>
                                                        <FieldError field="contrasena_actual" errors={passwordErrors} touched={touchedFields} />
                                                    </div>
                                                </div>

                                                <div className="mp-divider" />

                                                <div className="mp-form-full">
                                                    <div className="mp-field">
                                                        <label className="mp-label">Nueva contraseña <span className="mp-required">*</span></label>
                                                        <div className={`mp-input-wrap mp-pw-wrap ${touchedFields.nueva_contrasena && passwordErrors.nueva_contrasena ? 'mp-input-err' : ''}`}>
                                                            <input
                                                                type={showNewPassword ? 'text' : 'password'}
                                                                value={passwordData.nueva_contrasena}
                                                                onChange={e => setPasswordData({ ...passwordData, nueva_contrasena: e.target.value })}
                                                                onFocus={() => handleBlur('nueva_contrasena')}
                                                                onBlur={() => handleBlur('nueva_contrasena')}
                                                                placeholder="Nueva contraseña"
                                                            />
                                                            <button type="button" className="mp-pw-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                                                                {showNewPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                                                            </button>
                                                        </div>
                                                        {passwordData.nueva_contrasena && (
                                                            <div className="mp-pwd-strength">
                                                                <div className="mp-pwd-bars">
                                                                    {[1, 2, 3, 4].map(i => (
                                                                        <div
                                                                            key={i}
                                                                            className="mp-pwd-bar"
                                                                            style={{ background: i <= pwdStrength.level ? pwdStrength.color : undefined }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="mp-pwd-label" style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
                                                            </div>
                                                        )}
                                                        <FieldError field="nueva_contrasena" errors={passwordErrors} touched={touchedFields} />
                                                    </div>
                                                </div>

                                                <div className="mp-form-full">
                                                    <div className="mp-field">
                                                        <label className="mp-label">Confirmar nueva contraseña <span className="mp-required">*</span></label>
                                                        <div className={`mp-input-wrap mp-pw-wrap ${touchedFields.confirmar_contrasena && passwordErrors.confirmar_contrasena ? 'mp-input-err' : ''}`}>
                                                            <input
                                                                type={showConfirmPassword ? 'text' : 'password'}
                                                                value={passwordData.confirmar_contrasena}
                                                                onChange={e => setPasswordData({ ...passwordData, confirmar_contrasena: e.target.value })}
                                                                onFocus={() => handleBlur('confirmar_contrasena')}
                                                                onBlur={() => handleBlur('confirmar_contrasena')}
                                                                placeholder="Confirma tu nueva contraseña"
                                                            />
                                                            <button type="button" className="mp-pw-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                                {showConfirmPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                                                            </button>
                                                        </div>
                                                        <FieldError field="confirmar_contrasena" errors={passwordErrors} touched={touchedFields} />
                                                    </div>
                                                </div>

                                                {/* Security tips */}
                                                <div className="mp-tips">
                                                    <p className="mp-tips-title">Requisitos de contraseña</p>
                                                    <ul className="mp-tips-list">
                                                        {[
                                                            { label: 'Mínimo 8 caracteres', met: passwordData.nueva_contrasena.length >= 8 },
                                                            { label: 'Al menos una mayúscula', met: /[A-Z]/.test(passwordData.nueva_contrasena) },
                                                            { label: 'Al menos un número', met: /\d/.test(passwordData.nueva_contrasena) },
                                                            { label: 'Al menos un carácter especial', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.nueva_contrasena) },
                                                        ].map((tip, i) => (
                                                            <li key={i} className="mp-tip-item">
                                                                <span className={`mp-tip-check ${tip.met ? 'met' : ''}`}>
                                                                    {tip.met && <CheckCircle2 style={{ width: 10, height: 10 }} />}
                                                                </span>
                                                                {tip.label}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="mp-submit-row" style={{ marginTop: 28 }}>
                                                    <button
                                                        type="submit"
                                                        disabled={isProcessingPassword || passwordData.nueva_contrasena.length === 0}
                                                        className="mp-btn-secondary"
                                                    >
                                                        {isProcessingPassword ? (
                                                            <>
                                                                <div className="mp-loading-ring" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#2563eb' }} />
                                                                Actualizando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock style={{ width: 15, height: 15 }} />
                                                                Actualizar contraseña
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}