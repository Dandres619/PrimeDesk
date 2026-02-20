const { validationResult } = require('express-validator');

/**
 * Middleware que captura errores de express-validator y responde 422.
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Error de validación.',
            errors: errors.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
        });
    }
    next();
};

module.exports = { handleValidation };
