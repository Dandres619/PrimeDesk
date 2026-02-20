const motocicletasService = require('../services/motocicletas.service');
const { makeCrudController } = require('./crud.controller');

const base = makeCrudController(motocicletasService);

// Sobreescribir getAll para soportar filtro por cliente
const getAll = async (req, res) => {
    try {
        const id_cliente = req.query.id_cliente ? parseInt(req.query.id_cliente) : null;
        const data = await motocicletasService.getAll(id_cliente);
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

module.exports = { ...base, getAll };
