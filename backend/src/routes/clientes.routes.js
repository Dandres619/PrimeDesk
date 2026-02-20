const { Router } = require('express');
const { body } = require('express-validator');
const { makeCrudController } = require('../controllers/crud.controller');
const clientesService = require('../services/clientes.service');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const ctrl = makeCrudController(clientesService);
const router = Router();

const validations = [
    body('id_usuario').isInt({ min: 1 }).withMessage('ID usuario inválido.'),
    body('nombre').notEmpty().withMessage('Nombre requerido.'),
    body('apellido').notEmpty().withMessage('Apellido requerido.'),
    body('tipo_documento').notEmpty().withMessage('Tipo de documento requerido.'),
    body('documento').notEmpty().withMessage('Documento requerido.'),
    body('telefono').isLength({ min: 7, max: 10 }).withMessage('Teléfono inválido.'),
    body('fecha_nacimiento').isDate().withMessage('Fecha de nacimiento inválida.'),
    handleValidation,
];

router.get('/', verifyToken, ctrl.getAll);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/', verifyToken, requirePermiso('gestionar_clientes'), validations, ctrl.create);
router.put('/:id', verifyToken, requirePermiso('gestionar_clientes'), validations, ctrl.update);
router.delete('/:id', verifyToken, requirePermiso('gestionar_clientes'), ctrl.remove);

module.exports = router;
