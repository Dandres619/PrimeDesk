const { Router } = require('express');
const { body } = require('express-validator');
const rolesController = require('../controllers/roles.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const router = Router();

router.get('/', verifyToken, rolesController.getAll);
router.get('/:id', verifyToken, rolesController.getById);
router.post('/', verifyToken, requirePermiso('gestionar_roles'),
    [body('nombre').notEmpty().withMessage('Nombre requerido.'), handleValidation],
    rolesController.create
);
router.put('/:id', verifyToken, requirePermiso('gestionar_roles'),
    [body('nombre').notEmpty().withMessage('Nombre requerido.'), handleValidation],
    rolesController.update
);
router.delete('/:id', verifyToken, requirePermiso('gestionar_roles'), rolesController.remove);

// Gestión de permisos del rol
router.get('/:id/permisos', verifyToken, rolesController.getPermisos);
router.post('/:id/permisos', verifyToken, requirePermiso('gestionar_roles'),
    [body('id_permiso').isInt({ min: 1 }).withMessage('ID de permiso inválido.'), handleValidation],
    rolesController.asignarPermiso
);
router.delete('/:id/permisos/:id_permiso', verifyToken, requirePermiso('gestionar_roles'), rolesController.quitarPermiso);

module.exports = router;
