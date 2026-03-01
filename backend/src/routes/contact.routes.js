const { Router } = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contact.controller');
const { handleValidation } = require('../middlewares/validate.middleware');

const router = Router();

router.post(
    '/',
    [
        body('nombre').notEmpty().withMessage('Nombre requerido.'),
        body('correo').isEmail().withMessage('Correo inválido.'),
        body('asunto').notEmpty().withMessage('Asunto requerido.'),
        body('mensaje').notEmpty().withMessage('Mensaje requerido.'),
        handleValidation,
    ],
    contactController.contact
);

module.exports = router;
