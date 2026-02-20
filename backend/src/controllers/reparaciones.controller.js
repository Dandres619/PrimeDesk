const reparacionesService = require('../services/reparaciones.service');
const { makeCrudController } = require('./crud.controller');

const base = makeCrudController(reparacionesService);

const addAvance = async (req, res) => {
    try {
        const { id_empleado, descripcion } = req.body;
        const data = await reparacionesService.addAvance(parseInt(req.params.id), id_empleado, descripcion);
        res.status(201).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const addServicio = async (req, res) => {
    try {
        const data = await reparacionesService.addServicio(parseInt(req.params.id), req.body.id_servicio);
        res.status(201).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

module.exports = { ...base, addAvance, addServicio };
