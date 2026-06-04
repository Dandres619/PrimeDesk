import { useState } from 'react';
import { ProfileStyles } from './styles/ProfileStyles';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileForm } from './components/ProfileForm';
import { PasswordForm } from './components/PasswordForm';
import { useProfile } from './hooks/useProfile';
import { usePassword } from './hooks/usePassword';

export function MiPerfil() {
    const [activeSection, setActiveSection] = useState<'perfil' | 'seguridad'>('perfil');

    const {
        profileData,
        isLoading,
        isProcessing,
        isUploadingPhoto,
        formData,
        setFormData,
        formErrors,
        touchedFields: profileTouched,
        handleBlur: handleProfileBlur,
        hasProfileChanges,
        handleProfileSubmit,
        handleFileChange,
        fotoPreview,
        fileInputRef
    } = useProfile();

    const {
        passwordData,
        setPasswordData,
        isProcessingPassword,
        passwordErrors,
        touchedFields: passwordTouched,
        handleBlur: handlePasswordBlur,
        handlePasswordSubmit,
        showCurrentPassword,
        setShowCurrentPassword,
        showNewPassword,
        setShowNewPassword,
        showConfirmPassword,
        setShowConfirmPassword
    } = usePassword();

    return (
        <>
            <ProfileStyles />

            <div className="mp-root">
                <div className="mp-page">
                    {isLoading ? (
                        <div className="mp-loading">
                            <div className="mp-loading-ring" />
                            <p className="mp-loading-text">Cargando Perfil...</p>
                        </div>
                    ) : (
                        <div className="mp-content-animate">
                            {isUploadingPhoto && (
                                <div className="mp-loading-overlay">
                                    <div className="mp-loading">
                                        <div className="mp-loading-ring" />
                                        <p className="mp-loading-text">Actualizando foto...</p>
                                    </div>
                                </div>
                            )}
                            <div className="mp-grid">
                                <ProfileHeader
                                    formData={formData}
                                    profileData={profileData}
                                    fotoPreview={fotoPreview}
                                    fileInputRef={fileInputRef}
                                    handleFileChange={handleFileChange}
                                    activeSection={activeSection}
                                    setActiveSection={setActiveSection}
                                />

                                <div className="mp-main">
                                    {activeSection === 'perfil' && (
                                        <ProfileForm
                                            formData={formData}
                                            setFormData={setFormData}
                                            formErrors={formErrors}
                                            touchedFields={profileTouched}
                                            handleBlur={handleProfileBlur}
                                            handleProfileSubmit={handleProfileSubmit}
                                            isProcessing={isProcessing}
                                            hasProfileChanges={hasProfileChanges}
                                        />
                                    )}

                                    {activeSection === 'seguridad' && (
                                        <PasswordForm
                                            passwordData={passwordData}
                                            setPasswordData={setPasswordData}
                                            passwordErrors={passwordErrors}
                                            touchedFields={passwordTouched}
                                            handleBlur={handlePasswordBlur}
                                            handlePasswordSubmit={handlePasswordSubmit}
                                            isProcessingPassword={isProcessingPassword}
                                            showCurrentPassword={showCurrentPassword}
                                            setShowCurrentPassword={setShowCurrentPassword}
                                            showNewPassword={showNewPassword}
                                            setShowNewPassword={setShowNewPassword}
                                            showConfirmPassword={showConfirmPassword}
                                            setShowConfirmPassword={setShowConfirmPassword}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
