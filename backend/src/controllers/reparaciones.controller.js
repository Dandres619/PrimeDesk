const reparacionesService = require('../services/reparaciones.service');
const { makeCrudController } = require('./crud.controller');

const base = makeCrudController(reparacionesService);

const addServicio = async (req, res) => {
    try {
        const data = await reparacionesService.addServicio(parseInt(req.params.id), req.body.id_servicio);
        res.status(201).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

module.exports = { ...base, addServicio };
