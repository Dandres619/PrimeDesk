const { Router } = require('express');
const { body } = require('express-validator');
const { makeCrudController } = require('../controllers/crud.controller');
const categoriasService = require('../services/categorias.service');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

// Adaptar el servicio para que todos los métodos sean compatibles con makeCrudController
const service = {
    getAll: categoriasService.getAllCategorias,
    getById: categoriasService.getCategoriaById,
    create: categoriasService.createCategoria,
    update: categoriasService.updateCategoria,
    remove: categoriasService.deleteCategoria,
};

const ctrl = makeCrudController(service);
const router = Router();

router.get('/', verifyToken, ctrl.getAll);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/', verifyToken, requirePermiso('gestionar_inventario'),
    [body('nombre').notEmpty().withMessage('Nombre requerido.'), handleValidation],
    ctrl.create
);
router.put('/:id', verifyToken, requirePermiso('gestionar_inventario'),
    [body('nombre').notEmpty().withMessage('Nombre requerido.'), handleValidation],
    ctrl.update
);
router.delete('/:id', verifyToken, requirePermiso('gestionar_inventario'), ctrl.remove);

module.exports = router;
