const { Router } = require('express');
const { body } = require('express-validator');
const agendamientosController = require('../controllers/agendamientos.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const router = Router();

const validations = [
    body('id_motocicleta').isInt({ min: 1 }).withMessage('ID motocicleta inválido.'),
    body('id_empleado').isInt({ min: 1 }).withMessage('ID empleado inválido.'),
    body('dia').isDate().withMessage('Fecha inválida.'),
    body('hora_inicio').notEmpty().withMessage('Hora de inicio requerida.'),
    body('hora_fin').notEmpty().withMessage('Hora de fin requerida.'),
    handleValidation,
];

router.get('/', verifyToken, agendamientosController.getAll);
router.get('/:id', verifyToken, agendamientosController.getById);
router.post('/', verifyToken, requirePermiso('gestionar_agendamientos'), validations, agendamientosController.create);
router.put('/:id', verifyToken, requirePermiso('gestionar_agendamientos'), validations, agendamientosController.update);
router.delete('/:id', verifyToken, requirePermiso('gestionar_agendamientos'), agendamientosController.remove);

// Servicios del agendamiento
router.post('/:id/servicios', verifyToken, requirePermiso('gestionar_agendamientos'),
    [body('id_servicio').isInt({ min: 1 }).withMessage('ID servicio inválido.'), handleValidation],
    agendamientosController.addServicio
);
router.delete('/:id/servicios/:id_servicio', verifyToken, requirePermiso('gestionar_agendamientos'), agendamientosController.removeServicio);

module.exports = router;
