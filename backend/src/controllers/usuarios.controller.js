const usuariosService = require('../services/usuarios.service');
const { makeCrudController } = require('./crud.controller');

const base = makeCrudController(usuariosService);

const toggleEstado = async (req, res) => {
    try {
        const data = await usuariosService.toggleEstado(parseInt(req.params.id));
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

module.exports = { ...base, toggleEstado };
