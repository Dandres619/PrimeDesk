const { Router } = require('express');
const { body } = require('express-validator');
const horariosController = require('../controllers/horarios.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const router = Router();

// GET todos los horarios
router.get('/', verifyToken, horariosController.getAll);

// GET horarios de un empleado
router.get('/empleado/:id_empleado', verifyToken, horariosController.getByEmpleado);

// POST crear/reemplazar horarios de un empleado
router.post('/', verifyToken, requirePermiso('gestionar_empleados'),
  [
    body('id_empleado').isInt({ min: 1 }).withMessage('ID empleado inválido.'),
    body('dias').isArray({ min: 1 }).withMessage('Debe proporcionar al menos un día.'),
    body('dias.*.dia').notEmpty().withMessage('El nombre del día es requerido.'),
    body('dias.*.hora_entrada').matches(/^\d{2}:\d{2}$/).withMessage('Hora de entrada inválida.'),
    body('dias.*.hora_salida').matches(/^\d{2}:\d{2}$/).withMessage('Hora de salida inválida.'),
    handleValidation
  ],
  horariosController.upsertHorarios
);

// PATCH toggle estado de todos los horarios de un empleado
router.patch('/empleado/:id_empleado/estado', verifyToken, requirePermiso('gestionar_empleados'),
  [body('estado').isBoolean().withMessage('Estado inválido.'), handleValidation],
  horariosController.toggleEstado
);

// DELETE eliminar todos los horarios de un empleado
router.delete('/empleado/:id_empleado', verifyToken, requirePermiso('gestionar_empleados'), horariosController.remove);

module.exports = router;
