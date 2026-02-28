const { Router } = require('express');
const { body } = require('express-validator');
const productosController = require('../controllers/productos.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermiso } = require('../middlewares/role.middleware');
const { handleValidation } = require('../middlewares/validate.middleware');

const router = Router();

const validations = [
    body('id_categoria').isInt({ min: 1 }).withMessage('ID categoría inválido.'),
    body('nombre').notEmpty().withMessage('Nombre requerido.'),
    body('marca').notEmpty().withMessage('Marca requerida.'),
    handleValidation,
];

router.get('/', verifyToken, productosController.getAll);
router.get('/:id', verifyToken, productosController.getById);
router.post('/', verifyToken, requirePermiso('gestionar_productos'), validations, productosController.create);
router.put('/:id', verifyToken, requirePermiso('gestionar_productos'), validations, productosController.update);
router.patch('/:id/stock', verifyToken, requirePermiso('gestionar_productos'),
    [body('cantidad').isInt({ min: 0 }).withMessage('Cantidad inválida.'), handleValidation],
    productosController.updateStock
);
router.delete('/:id', verifyToken, requirePermiso('gestionar_productos'), productosController.remove);

module.exports = router;
