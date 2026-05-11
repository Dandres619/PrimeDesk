import React from 'react';
import { Camera, Mail, UserCircle, Shield } from 'lucide-react';

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
    return (
        <div className="mp-sidebar">
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
