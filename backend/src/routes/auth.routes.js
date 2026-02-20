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
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres.'),
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

// POST /api/auth/change-password (protegida)
router.post(
    '/change-password',
    verifyToken,
    [
        body('contrasena_actual').notEmpty().withMessage('Contraseña actual requerida.'),
        body('nueva_contrasena')
            .isLength({ min: 6 })
            .withMessage('La nueva contraseña debe tener al menos 6 caracteres.'),
        handleValidation,
    ],
    authController.changePassword
);

module.exports = router;
