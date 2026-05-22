const { Router } = require('express');
const { body } = require('express-validator');
const reparacionesController = require('../controllers/reparaciones.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');

const router = Router();

router.get('/', verifyToken, reparacionesController.getAll);
router.get('/:id', verifyToken, reparacionesController.getById);
router.post('/', verifyToken, requirePermiso('gestionar_reparaciones'),
    [
        body('id_motocicleta').isInt({ min: 1 }).withMessage('ID motocicleta inválido.'),
        body('id_agendamiento').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).withMessage('ID agendamiento inválido.'),
        handleValidation,
    ],
    reparacionesController.create
);
router.put('/:id', verifyToken, requirePermiso('gestionar_reparaciones'),
    [body('estado').notEmpty().withMessage('Estado requerido.'), handleValidation],
    reparacionesController.update
);
router.delete('/:id', verifyToken, requirePermiso('gestionar_reparaciones'), reparacionesController.remove);

// Servicios de la reparación
router.post('/:id/servicios', verifyToken, requirePermiso('gestionar_reparaciones'),
    [body('id_servicio').isInt({ min: 1 }).withMessage('ID servicio inválido.'), handleValidation],
    reparacionesController.addServicio
);

router.patch('/:id/estado', verifyToken, requirePermiso('gestionar_reparaciones'),
    [body('estado').notEmpty().withMessage('Estado requerido.'), handleValidation],
    reparacionesController.updateEstado
);

router.patch('/:id/servicios/:id_servicio/estado', verifyToken, requirePermiso('gestionar_reparaciones'),
    [body('estado').notEmpty().withMessage('Estado requerido.'), handleValidation],
    reparacionesController.updateServicioEstado
);

router.post('/:id/compras', verifyToken, requirePermiso('gestionar_reparaciones'),
    upload.single('facturaFile'),
    [
        body('id_producto').notEmpty().withMessage('Producto requerido.'),
        body('cantidad').notEmpty().withMessage('Cantidad requerida.'),
        body('precio_unitario').notEmpty().withMessage('Precio requerido.'),
        handleValidation
    ],
    reparacionesController.addCompra
);

router.delete('/:id/compras/:id_reparacion_compra', verifyToken, requirePermiso('gestionar_reparaciones'),
    reparacionesController.removeCompra
);

module.exports = router;
