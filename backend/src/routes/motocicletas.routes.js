const { Router } = require('express');
const { body } = require('express-validator');
const motocicletasController = require('../controllers/motocicletas.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const router = Router();

const validations = [
    body('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido.'),
    body('marca').notEmpty().withMessage('Marca requerida.'),
    body('modelo').notEmpty().withMessage('Modelo requerido.'),
    body('anio').isInt({ min: 1900, max: 2100 }).withMessage('Año inválido.'),
    body('placa').notEmpty().withMessage('Placa requerida.'),
    body('color').notEmpty().withMessage('Color requerido.'),
    body('motor').isInt({ min: 1 }).withMessage('Cilindraje de motor inválido.'),
    handleValidation,
];

// ?id_cliente=X para filtrar por cliente
router.get('/', verifyToken, motocicletasController.getAll);
router.get('/:id', verifyToken, motocicletasController.getById);
router.post('/', verifyToken, requirePermiso('gestionar_clientes'), validations, motocicletasController.create);
router.put('/:id', verifyToken, requirePermiso('gestionar_clientes'), validations, motocicletasController.update);
router.delete('/:id', verifyToken, requirePermiso('gestionar_clientes'), motocicletasController.remove);

module.exports = router;
