const { Router } = require('express');
const { body } = require('express-validator');
const usuariosController = require('../controllers/usuarios.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const router = Router();

router.get('/', verifyToken, requirePermiso('gestionar_usuarios'), usuariosController.getAll);
router.get('/:id', verifyToken, requirePermiso('gestionar_usuarios'), usuariosController.getById);
router.post('/', verifyToken, requirePermiso('gestionar_usuarios'),
    [
        body('correo').isEmail().withMessage('Correo inválido.'),
        body('contrasena').isLength({ min: 6 }).withMessage('Contraseña mínima 6 caracteres.'),
        body('id_rol').isInt({ min: 1 }).withMessage('ID rol inválido.'),
        handleValidation,
    ],
    usuariosController.create
);
router.put('/:id', verifyToken, requirePermiso('gestionar_usuarios'),
    [
        body('correo').isEmail().withMessage('Correo inválido.'),
        body('id_rol').isInt({ min: 1 }).withMessage('ID rol inválido.'),
        handleValidation,
    ],
    usuariosController.update
);
router.patch('/:id/estado', verifyToken, requirePermiso('gestionar_usuarios'), usuariosController.toggleEstado);

module.exports = router;
