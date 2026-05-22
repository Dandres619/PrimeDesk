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

const updateEstado = async (req, res) => {
    try {
        const data = await reparacionesService.updateEstado(parseInt(req.params.id), req.body.estado, req.body.nota_estado);
        res.status(200).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const updateServicioEstado = async (req, res) => {
    try {
        const data = await reparacionesService.updateServicioEstado(parseInt(req.params.id), parseInt(req.params.id_servicio), req.body.estado, req.body.observaciones);
        res.status(200).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const addCompra = async (req, res) => {
    try {
        // req.body can contain stringified data or plain text fields due to multipart form data
        const data = {
            id_producto: parseInt(req.body.id_producto),
            cantidad: parseInt(req.body.cantidad),
            precio_unitario: parseFloat(req.body.precio_unitario),
            observaciones: req.body.observaciones,
            id_proveedor: req.body.id_proveedor ? parseInt(req.body.id_proveedor) : null
        };
        const result = await reparacionesService.addCompra(parseInt(req.params.id), data, req.file);
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const removeCompra = async (req, res) => {
    try {
        const result = await reparacionesService.removeCompra(parseInt(req.params.id), parseInt(req.params.id_reparacion_compra));
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

module.exports = { ...base, addServicio, updateEstado, updateServicioEstado, addCompra, removeCompra };
