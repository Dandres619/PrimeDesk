import React from 'react';
import { Save, Phone, Home, MapPin, Calendar, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { DatePickerInput } from '../../ui/DatePickerInput';

interface ProfileFormProps {
    formData: any;
    setFormData: (data: any) => void;
    formErrors: Record<string, string>;
    touchedFields: Record<string, boolean>;
    handleBlur: (field: string) => void;
    handleProfileSubmit: (e: React.FormEvent) => void;
    isProcessing: boolean;
    hasProfileChanges: () => boolean;
}

const FieldError = ({ field, errors, touched }: { field: string; errors: Record<string, string>; touched: Record<string, boolean> }) =>
    touched[field] && errors[field] ? (
        <p className="mp-field-error">
            <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} />
            {errors[field]}
        </p>
    ) : null;

export function ProfileForm({
    formData,
    setFormData,
    formErrors,
    touchedFields,
    handleBlur,
    handleProfileSubmit,
    isProcessing,
    hasProfileChanges
}: ProfileFormProps) {
    const todayDate = new Date();
    const globalMinAgeDate = new Date(todayDate.getFullYear() - 18, todayDate.getMonth(), todayDate.getDate());

    return (
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
                            <FieldError field="nombre" errors={formErrors} touched={touchedFields} />
                            <div className={`mp-input-wrap ${touchedFields.nombre && formErrors.nombre ? 'mp-input-err' : ''}`}>
                                <input
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '') })}
                                    onFocus={() => handleBlur('nombre')}
                                    onBlur={() => handleBlur('nombre')}
                                    placeholder="Tu nombre"
                                />
                            </div>
                        </div>
                        <div className="mp-field">
                            <label className="mp-label">Apellido <span className="mp-required">*</span></label>
                            <FieldError field="apellido" errors={formErrors} touched={touchedFields} />
                            <div className={`mp-input-wrap ${touchedFields.apellido && formErrors.apellido ? 'mp-input-err' : ''}`}>
                                <input
                                    value={formData.apellido}
                                    onChange={e => setFormData({ ...formData, apellido: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '') })}
                                    onFocus={() => handleBlur('apellido')}
                                    onBlur={() => handleBlur('apellido')}
                                    placeholder="Tu apellido"
                                />
                            </div>
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
                            <FieldError field="telefono" errors={formErrors} touched={touchedFields} />
                            <div className={`mp-input-wrap ${touchedFields.telefono && formErrors.telefono ? 'mp-input-err' : ''}`}>
                                <input
                                    value={formData.telefono}
                                    onChange={e => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '') })}
                                    onFocus={() => handleBlur('telefono')}
                                    onBlur={() => handleBlur('telefono')}
                                    placeholder="3001234567"
                                />
                            </div>
                        </div>
                        <div className="mp-field">
                            <label className="mp-label">
                                <Home style={{ width: 11, height: 11, display: 'inline', marginRight: 4 }} />
                                Barrio <span className="mp-required">*</span>
                            </label>
                            <FieldError field="barrio" errors={formErrors} touched={touchedFields} />
                            <div className={`mp-input-wrap ${touchedFields.barrio && formErrors.barrio ? 'mp-input-err' : ''}`}>
                                <input
                                    value={formData.barrio}
                                    onChange={e => setFormData({ ...formData, barrio: e.target.value })}
                                    onFocus={() => handleBlur('barrio')}
                                    onBlur={() => handleBlur('barrio')}
                                    placeholder="Tu barrio"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mp-form-full">
                        <div className="mp-field">
                            <label className="mp-label">
                                <MapPin style={{ width: 11, height: 11, display: 'inline', marginRight: 4 }} />
                                Dirección <span className="mp-required">*</span>
                            </label>
                            <FieldError field="direccion" errors={formErrors} touched={touchedFields} />
                            <div className={`mp-input-wrap ${touchedFields.direccion && formErrors.direccion ? 'mp-input-err' : ''}`}>
                                <input
                                    value={formData.direccion}
                                    onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                    onFocus={() => handleBlur('direccion')}
                                    onBlur={() => handleBlur('direccion')}
                                    placeholder="Ej: Calle 10 #20-30"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mp-form-full">
                        <div className="mp-field">
                            <label className="mp-label">
                                <Calendar style={{ width: 11, height: 11, display: 'inline', marginRight: 4 }} />
                                Fecha de Nacimiento (Opcional)
                            </label>
                            <FieldError field="fecha_nacimiento" errors={formErrors} touched={touchedFields} />
                            <DatePickerInput
                                value={formData.fecha_nacimiento}
                                onChange={(v) => {
                                    setFormData((prev: any) => ({ ...prev, fecha_nacimiento: v }));
                                }}
                                onFocus={() => handleBlur('fecha_nacimiento')}
                                onBlur={() => handleBlur('fecha_nacimiento')}
                                minDate={new Date(1950, 0, 1)}
                                maxDate={globalMinAgeDate}
                                placeholder="Seleccionar fecha (DD/MM/AAAA)"
                                error={!!(touchedFields.fecha_nacimiento && formErrors.fecha_nacimiento)}
                            />
                        </div>
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
    );
}
