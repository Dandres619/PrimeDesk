const { Router } = require('express');
const { body } = require('express-validator');
const { makeCrudController } = require('../controllers/crud.controller');
const ventasService = require('../services/ventas.service');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const ctrl = makeCrudController(ventasService);
const router = Router();

router.get('/', verifyToken, ctrl.getAll);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/', verifyToken, requirePermiso('gestionar_ventas'),
    [
        body('id_reparacion').isInt({ min: 1 }).withMessage('ID reparación inválido.'),
        body('id_empleado').isInt({ min: 1 }).withMessage('ID empleado inválido.'),
        body('id_motocicleta').isInt({ min: 1 }).withMessage('ID motocicleta inválido.'),
        body('total').isDecimal().withMessage('Total inválido.'),
        handleValidation,
    ],
    ctrl.create
);
router.put('/:id', verifyToken, requirePermiso('gestionar_ventas'),
    [body('total').isDecimal().withMessage('Total inválido.'), handleValidation],
    ctrl.update
);

module.exports = router;
