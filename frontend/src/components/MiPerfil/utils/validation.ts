import { parse, isValid, format } from 'date-fns';

export const validateAddress = (address: string) => {
    const addressRegex = /^(calle|carrera|cra|diagonal|diag|transversal|tv|avenida|av|circular|circ|vía|via|manzana|mz|lote)\s+[a-zA-Z0-9\s#-]+$/i;
    return addressRegex.test(address);
};

export const validatePhone = (phone: string) => {
    return /^\d{7,10}$/.test(phone);
};

export const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return passwordRegex.test(password);
};

export const normalizeDate = (d: string) => {
    if (!d) return d;
    if (d.includes('/')) {
        const parsed = parse(d, 'dd/MM/yyyy', new Date());
        return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : d;
    }
    return d;
};

export const getPasswordStrength = (pwd: string) => {
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
