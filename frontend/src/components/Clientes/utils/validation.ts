import { parse, isValid, format } from 'date-fns';

export const validateEmail = (email: string) => {
  if (!email) return 'El correo es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Correo electrónico inválido';
  return '';
};

export const validatePassword = (pass: string, isEditing: boolean) => {
  if (!pass && isEditing) return '';
  if (!pass && !isEditing) return 'La contraseña es obligatoria';
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!passwordRegex.test(pass)) return 'Contraseña insegura';
  return '';
};

export const validateField = (name: string, value: string, currentData: any, isEditing: boolean) => {
  let error = '';

  switch (name) {
    case 'correo':
      error = validateEmail(value);
      break;
    case 'contrasena':
      error = validatePassword(value, isEditing);
      break;
    case 'confirmarContrasena':
      if ((!isEditing || currentData.contrasena) && value !== currentData.contrasena) {
        error = 'Las contraseñas no coinciden';
      }
      break;
    case 'nombre':
      if (!value) error = 'El nombre es obligatorio';
      break;
    case 'apellido':
      if (!value) error = 'El apellido es obligatorio';
      break;
    case 'documento':
      if (!value) error = 'El documento es obligatorio';
      else if (!/^\d{7,10}$/.test(value)) error = 'Debe tener entre 7 y 10 dígitos';
      break;
    case 'telefono':
      if (!value) error = 'El teléfono es obligatorio';
      else if (!/^\d{7,10}$/.test(value)) error = 'Debe tener entre 7 y 10 dígitos';
      break;
    case 'fecha_nacimiento':
      if (value) {
        let dateObj: Date | null = null;
        let yearVal = 0;

        if (value === 'INVALID') {
          error = 'Fecha inválida';
        } else if (value.includes('/')) {
          const parts = value.split('/');
          if (parts.length === 3 && parts[2]) yearVal = parseInt(parts[2]);
          if (parts.length < 3 || !parts[2] || parts[2].length < 4) {
            error = 'Debe poner una fecha válida';
          } else {
            const d = parse(value, 'dd/MM/yyyy', new Date());
            if (isValid(d)) dateObj = d;
            else error = 'Debe poner una fecha válida';
          }
        } else {
          dateObj = new Date(value + 'T00:00:00');
          yearVal = parseInt(value.split('-')[0]);
        }

        if (!error) {
          const today = new Date();
          const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
          
          if (yearVal > 0 && yearVal < 1950) {
            error = 'Debe ser al menos 1950';
          } else if (dateObj) {
            if (dateObj > today) error = 'No se puede fechas futuras';
            else if (dateObj > minAgeDate) error = 'Debe ser mayor de edad';
            else if (dateObj.getFullYear() < 1950) error = 'Debe ser al menos 1950';
          }
        }
      }
      break;
    case 'barrio':
      if (!value) error = 'El barrio es obligatorio';
      break;
    case 'direccion':
      if (!value) error = 'La dirección es obligatoria';
      break;
  }
  return error;
};

export const normalizeDate = (d: string) => {
  if (!d) return d;
  if (d.includes('/')) {
    const parsed = parse(d, 'dd/MM/yyyy', new Date());
    return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : d;
  }
  return d;
};
