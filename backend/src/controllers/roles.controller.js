const rolesService = require('../services/roles.service');
const { makeCrudController } = require('./crud.controller');

const base = makeCrudController(rolesService);

const getPermisos = async (req, res) => {
    try {
        const data = await rolesService.getPermisosByRol(parseInt(req.params.id));
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const asignarPermiso = async (req, res) => {
    try {
        const { id_permiso } = req.body;
        const data = await rolesService.asignarPermiso(parseInt(req.params.id), id_permiso);
        res.status(201).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const quitarPermiso = async (req, res) => {
    try {
        const data = await rolesService.quitarPermiso(parseInt(req.params.id), parseInt(req.params.id_permiso));
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

module.exports = { ...base, getPermisos, asignarPermiso, quitarPermiso };
