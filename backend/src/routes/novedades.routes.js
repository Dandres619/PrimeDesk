const { Router } = require('express');
const { body } = require('express-validator');
const novedadesController = require('../controllers/novedades.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const router = Router();

// GET all novelties
router.get('/', verifyToken, novedadesController.getAll);

// GET novelties of a specific mechanic
router.get('/empleado/:id_empleado', verifyToken, novedadesController.getByEmpleado);

// POST register a new novelty
router.post('/', verifyToken, requirePermiso('gestionar_empleados'),
  [
    body('id_empleado').isInt({ min: 1 }).withMessage('ID de empleado inválido.'),
    body('dia').notEmpty().withMessage('El día es requerido.'),
    body('tipo').isIn(['Ausencia parcial', 'Ausencia total']).withMessage('Tipo de novedad inválido.'),
    handleValidation
  ],
  novedadesController.create
);

module.exports = router;
