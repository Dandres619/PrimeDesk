const agendamientosService = require('../services/agendamientos.service');
const { makeCrudController } = require('./crud.controller');

const base = makeCrudController(agendamientosService);

const getAll = async (req, res) => {
    try {
        const id_cliente = req.query.id_cliente ? parseInt(req.query.id_cliente) : null;
        const data = await agendamientosService.getAll(id_cliente);
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const addServicio = async (req, res) => {
    try {
        const data = await agendamientosService.addServicio(parseInt(req.params.id), req.body.id_servicio);
        res.status(201).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const removeServicio = async (req, res) => {
    try {
        const data = await agendamientosService.removeServicio(parseInt(req.params.id), parseInt(req.params.id_servicio));
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

module.exports = { ...base, getAll, addServicio, removeServicio };
