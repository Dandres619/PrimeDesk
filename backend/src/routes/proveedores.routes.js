const { Router } = require('express');
const { body } = require('express-validator');
const { makeCrudController } = require('../controllers/crud.controller');
const proveedoresService = require('../services/proveedores.service');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const ctrl = makeCrudController(proveedoresService);
const router = Router();

const validations = [
    body('nombre_empresa').notEmpty().withMessage('Nombre empresa requerido.').isLength({ max: 60 }).withMessage('El nombre de empresa no puede superar los 60 caracteres.'),
    body('persona_contacto').notEmpty().withMessage('Persona de contacto requerida.').isLength({ max: 50 }).withMessage('El contacto no puede superar los 50 caracteres.'),
    body('telefono').isLength({ min: 7, max: 10 }).withMessage('El teléfono debe tener entre 7 y 10 dígitos.'),
    body('email').custom((val, { req }) => {
        const isNatural = req.body.tipo_persona === 'Natural';
        if (isNatural) {
            if (!val || val.trim() === '') {
                return true;
            }
        } else {
            if (!val || val.trim() === '') {
                throw new Error('El email es obligatorio para personas jurídicas.');
            }
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
            throw new Error('Email inválido (ej: usuario@ejemplo.com).');
        }
        if (val.length > 50) {
            throw new Error('El email no puede superar los 50 caracteres.');
        }
        return true;
    }),
    body('direccion').notEmpty().withMessage('Dirección requerida.').isLength({ max: 80 }).withMessage('La dirección no puede superar los 80 caracteres.'),
    body('tipo_persona').isIn(['Natural', 'Jurídica']).withMessage('Tipo de persona inválido.'),
    body('documento').notEmpty().withMessage('Documento o NIT requerido.').isLength({ max: 15 }).withMessage('Documento/NIT inválido.'),
    body('sitio_web').custom((val, { req }) => {
        if (req.body.tipo_persona === 'Jurídica' && !val) {
            throw new Error('El sitio web es obligatorio para personas jurídicas.');
        }
        return true;
    }),
    body('notas').optional({ nullable: true, checkFalsy: true }).isLength({ max: 80 }).withMessage('Las notas no pueden superar los 80 caracteres.'),
    handleValidation,
];

router.get('/', verifyToken, ctrl.getAll);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/', verifyToken, requirePermiso('gestionar_proveedores'), validations, ctrl.create);
router.put('/:id', verifyToken, requirePermiso('gestionar_proveedores'), validations, ctrl.update);
router.delete('/:id', verifyToken, requirePermiso('gestionar_proveedores'), ctrl.remove);

module.exports = router;
