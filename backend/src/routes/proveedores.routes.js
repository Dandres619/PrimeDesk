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
    body('nombre_empresa').notEmpty().withMessage('Nombre empresa requerido.'),
    body('persona_contacto').notEmpty().withMessage('Persona de contacto requerida.'),
    body('telefono').isLength({ min: 7, max: 10 }).withMessage('Teléfono inválido.'),
    body('email').isEmail().withMessage('Email inválido.'),
    body('direccion').notEmpty().withMessage('Dirección requerida.'),
    handleValidation,
];

router.get('/', verifyToken, ctrl.getAll);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/', verifyToken, requirePermiso('gestionar_proveedores'), validations, ctrl.create);
router.put('/:id', verifyToken, requirePermiso('gestionar_proveedores'), validations, ctrl.update);
router.delete('/:id', verifyToken, requirePermiso('gestionar_proveedores'), ctrl.remove);

module.exports = router;
