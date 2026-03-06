const usuariosService = require('../services/usuarios.service');
const { makeCrudController } = require('./crud.controller');

const base = makeCrudController(usuariosService);

const update = async (req, res) => {
    try {
        const targetId = parseInt(req.params.id);
        const { estado } = req.body;

        // Evitar que el administrador se desactive a sí mismo
        if (targetId === req.user.id_usuario && (estado === false || estado === 'Inactivo')) {
            return res.status(400).json({ message: 'No puedes inactivar tu propia cuenta.' });
        }

        const data = await usuariosService.update(targetId, req.body);
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const toggleEstado = async (req, res) => {
    try {
        const targetId = parseInt(req.params.id);

        // Evitar que el administrador se desactive a sí mismo
        if (targetId === req.user.id_usuario) {
            return res.status(400).json({ message: 'No puedes inactivar tu propia cuenta.' });
        }

        const data = await usuariosService.toggleEstado(targetId);
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

module.exports = { ...base, update, toggleEstado };
