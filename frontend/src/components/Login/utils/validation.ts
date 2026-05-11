import { isValid } from 'date-fns';

export const validateField = (name: string, value: string, currentData: any, activeStep: number) => {
  const todayDate = new Date();
  const globalMinAgeDate = new Date(todayDate.getFullYear() - 18, todayDate.getMonth(), todayDate.getDate());
  let error = '';

  if (activeStep === 1) {
    switch (name) {
      case 'nombre':
        if (!value) error = 'No puede estar vacío';
        break;
      case 'apellido':
        if (!value) error = 'No puede estar vacío';
        break;
      case 'documento':
        if (!value) error = 'No puede estar vacío';
        else if (!/^\d{7,10}$/.test(value)) error = 'Entre 7 y 10 números';
        break;
      case 'fecha_nacimiento':
        if (!value) {
          error = ''; // Es opcional
        } else if (value.length > 0 && value.length < 10) {
          error = 'Formato incompleto (DD/MM/YYYY)';
        } else {
          const isStandard = value.includes('-');
          let selectedDate: Date;
          
          if (isStandard) {
            selectedDate = new Date(value + 'T00:00:00');
          } else {
            const [d, m, y] = value.split('/').map(Number);
            selectedDate = new Date(y, m - 1, d);
          }

          if (!isValid(selectedDate)) {
            error = 'Fecha inválida';
          } else if (selectedDate > todayDate) {
            error = 'Fecha futura';
          } else if (selectedDate.getFullYear() < 1950) {
            error = 'Mínimo año 1950';
          } else if (selectedDate > globalMinAgeDate) {
            error = 'Debes ser mayor de 18 años';
          }
        }
        break;
    }
  } else if (activeStep === 2) {
    switch (name) {
      case 'email':
        if (!value) error = 'No puede estar vacío';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Correo inválido';
        break;
      case 'telefono':
        if (!value) error = 'No puede estar vacío';
        else if (!/^\d{7,10}$/.test(value)) error = 'Entre 7 y 10 números';
        break;
      case 'barrio':
        if (!value) error = 'No puede estar vacío';
        break;
      case 'direccion':
        if (!value) error = 'No puede estar vacío';
        else {
          const addressRegex = /^(calle|carrera|cra|diagonal|diag|transversal|tv|avenida|av|circular|circ|vía|via|manzana|mz|lote)\s+[a-zA-Z0-9\s#-]+$/i;
          if (!addressRegex.test(value)) {
            error = 'Dirección inválida (Ej: Calle 10 #20-30)';
          }
        }
        break;
    }
  } else if (activeStep === 3) {
    switch (name) {
      case 'contrasena':
        if (!value) error = 'No puede estar vacío';
        else {
          const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
          if (!passwordRegex.test(value)) error = 'Contraseña insegura';
        }
        break;
      case 'confirmarContrasena':
        if (!value) error = 'No puede estar vacío';
        else if (value !== currentData.contrasena) error = 'No coinciden';
        break;
    }
  }

  return error;
};
