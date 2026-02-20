const { Router } = require('express');
const { body } = require('express-validator');
const { makeCrudController } = require('../controllers/crud.controller');
const serviciosService = require('../services/servicios.service');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const ctrl = makeCrudController(serviciosService);
const router = Router();

router.get('/', verifyToken, ctrl.getAll);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/', verifyToken, requirePermiso('gestionar_servicios'),
    [body('nombre').notEmpty().withMessage('Nombre requerido.'), handleValidation],
    ctrl.create
);
router.put('/:id', verifyToken, requirePermiso('gestionar_servicios'),
    [body('nombre').notEmpty().withMessage('Nombre requerido.'), handleValidation],
    ctrl.update
);
router.delete('/:id', verifyToken, requirePermiso('gestionar_servicios'), ctrl.remove);

module.exports = router;
