const productosService = require('../services/productos.service');
const { makeCrudController } = require('./crud.controller');

const base = makeCrudController(productosService);

const updateStock = async (req, res) => {
    try {
        const { cantidad } = req.body;
        const data = await productosService.updateStock(parseInt(req.params.id), cantidad);
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

module.exports = { ...base, updateStock };
