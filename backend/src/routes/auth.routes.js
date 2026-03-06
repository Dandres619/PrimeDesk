const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const router = Router();

// POST /api/auth/login
router.post(
    '/login',
    [
        body('correo').isEmail().withMessage('Correo inválido.'),
        body('contrasena').notEmpty().withMessage('Contraseña requerida.'),
        handleValidation,
    ],
    authController.login
);

// POST /api/auth/register
router.post(
    '/register',
    [
        body('correo').isEmail().withMessage('Correo inválido.'),
        body('contrasena')
            .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
            .withMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.'),
        body('id_rol').isInt({ min: 1 }).withMessage('ID de rol inválido.'),
        // Validaciones condicionales o generales para clientes
        body('nombre').optional().notEmpty().withMessage('Nombre requerido.'),
        body('apellido').optional().notEmpty().withMessage('Apellido requerido.'),
        body('documento').optional().notEmpty().withMessage('Documento requerido.'),
        handleValidation,
    ],
    authController.register
);

// GET /api/auth/me (protegida)
router.get('/me', verifyToken, authController.getMe);

// POST /api/auth/forgot-password
router.post(
    '/forgot-password',
    [
        body('correo').isEmail().withMessage('Correo inválido.'),
        handleValidation,
    ],
    authController.forgotPassword
);

// POST /api/auth/reset-password
router.post(
    '/reset-password',
    [
        body('token').notEmpty().withMessage('Token requerido.'),
        body('nueva_contrasena')
            .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
            .withMessage('La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.'),
        handleValidation,
    ],
    authController.resetPassword
);

// POST /api/auth/verify
router.post(
    '/verify',
    [
        body('token').notEmpty().withMessage('Token requerido.'),
        handleValidation,
    ],
    authController.verify
);

// PUT /api/auth/profile (protegida)
router.put(
    '/profile',
    verifyToken,
    [
        body('nombre').notEmpty().withMessage('Nombre requerido.'),
        body('apellido').notEmpty().withMessage('Apellido requerido.'),
        body('tipo_documento').notEmpty().withMessage('Tipo de documento requerido.'),
        body('documento').notEmpty().withMessage('Documento requerido.'),
        body('telefono').notEmpty().withMessage('Teléfono requerido.'),
        handleValidation,
    ],
    authController.updateProfile
);

// POST /api/auth/change-password (protegida)
router.post(
    '/change-password',
    verifyToken,
    [
        body('contrasena_actual').notEmpty().withMessage('Contraseña actual requerida.'),
        body('nueva_contrasena')
            .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
            .withMessage('La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.'),
        handleValidation,
    ],
    authController.changePassword
);

module.exports = router;
