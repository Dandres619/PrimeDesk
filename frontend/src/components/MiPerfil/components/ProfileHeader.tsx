import React, { useState, useEffect } from 'react';
import { Camera, Mail, UserCircle, Shield, Loader2 } from 'lucide-react';

interface ProfileHeaderProps {
    formData: any;
    profileData: any;
    fotoPreview: string | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    activeSection: 'perfil' | 'seguridad';
    setActiveSection: (section: 'perfil' | 'seguridad') => void;
}

export function ProfileHeader({
    formData,
    profileData,
    fotoPreview,
    fileInputRef,
    handleFileChange,
    activeSection,
    setActiveSection
}: ProfileHeaderProps) {
    const [imgLoading, setImgLoading] = useState(true);

    useEffect(() => {
        if (fotoPreview) {
            setImgLoading(true);
        }
    }, [fotoPreview]);

    const isClient = profileData?.id_rol === 3;
    const savedNombre = isClient ? profileData?.NombreCliente : profileData?.NombreEmpleado;
    const savedApellido = isClient ? profileData?.ApellidoCliente : profileData?.ApellidoEmpleado;

    return (
        <div className="mp-sidebar">
            <div className="mp-card mp-profile-card">
                <div className="mp-profile-banner" />
                <div className="mp-profile-avatar-wrap">
                    <div className="mp-avatar-outer">
                        <div className="mp-avatar">
                            {fotoPreview ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {imgLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full z-10">
                                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                        </div>
                                    )}
                                    <img
                                        src={fotoPreview}
                                        alt="Foto de perfil"
                                        onLoad={() => setImgLoading(false)}
                                        onError={() => setImgLoading(false)}
                                        className={`w-full h-full object-cover transition-opacity duration-200 ${imgLoading ? "opacity-0" : "opacity-100"}`}
                                    />
                                </div>
                            ) : (
                                <span className="mp-avatar-initial">
                                    {savedNombre?.charAt(0) || profileData?.Correo?.charAt(0).toUpperCase()}
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
                        {savedNombre || ''} {savedApellido || ''}
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
    );
}
