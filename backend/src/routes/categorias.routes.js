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
router.post('/', verifyToken, requirePermiso('gestionar_categorias'),
    [body('nombre').notEmpty().withMessage('Nombre requerido.').isLength({ max: 50 }).withMessage('El nombre no puede superar los 50 caracteres.'), handleValidation],
    ctrl.create
);
router.put('/:id', verifyToken, requirePermiso('gestionar_categorias'),
    [body('nombre').notEmpty().withMessage('Nombre requerido.').isLength({ max: 50 }).withMessage('El nombre no puede superar los 50 caracteres.'), handleValidation],
    ctrl.update
);
router.delete('/:id', verifyToken, requirePermiso('gestionar_categorias'), ctrl.remove);

module.exports = router;
