const { Router } = require('express');
const { body } = require('express-validator');
const { makeCrudController } = require('../controllers/crud.controller');
const comprasService = require('../services/compras.service');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const ctrl = makeCrudController(comprasService);
const router = Router();

router.get('/', verifyToken, ctrl.getAll);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/', verifyToken, requirePermiso('gestionar_compras'),
    [
        body('id_proveedor').isInt({ min: 1 }).withMessage('ID proveedor inválido.'),
        body('id_motocicleta').isInt({ min: 1 }).withMessage('ID motocicleta inválido.'),
        body('total').isDecimal().withMessage('Total inválido.'),
        handleValidation,
    ],
    ctrl.create
);
router.put('/:id', verifyToken, requirePermiso('gestionar_compras'),
    [body('total').isDecimal().withMessage('Total inválido.'), handleValidation],
    ctrl.update
);

module.exports = router;
