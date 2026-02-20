const { Router } = require('express');
const { body } = require('express-validator');
const reparacionesController = require('../controllers/reparaciones.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const router = Router();

router.get('/', verifyToken, reparacionesController.getAll);
router.get('/:id', verifyToken, reparacionesController.getById);
router.post('/', verifyToken, requirePermiso('gestionar_reparaciones'),
    [
        body('id_motocicleta').isInt({ min: 1 }).withMessage('ID motocicleta inválido.'),
        body('id_agendamiento').isInt({ min: 1 }).withMessage('ID agendamiento inválido.'),
        handleValidation,
    ],
    reparacionesController.create
);
router.put('/:id', verifyToken, requirePermiso('gestionar_reparaciones'),
    [body('estado').notEmpty().withMessage('Estado requerido.'), handleValidation],
    reparacionesController.update
);
router.delete('/:id', verifyToken, requirePermiso('gestionar_reparaciones'), reparacionesController.remove);

// Avances de la reparación
router.post('/:id/avances', verifyToken, requirePermiso('gestionar_reparaciones'),
    [
        body('id_empleado').isInt({ min: 1 }).withMessage('ID empleado inválido.'),
        body('descripcion').notEmpty().withMessage('Descripción requerida.'),
        handleValidation,
    ],
    reparacionesController.addAvance
);

// Servicios de la reparación
router.post('/:id/servicios', verifyToken, requirePermiso('gestionar_reparaciones'),
    [body('id_servicio').isInt({ min: 1 }).withMessage('ID servicio inválido.'), handleValidation],
    reparacionesController.addServicio
);

module.exports = router;
