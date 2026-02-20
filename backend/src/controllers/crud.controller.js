/**
 * Factoría de controladores CRUD genéricos.
 * @param {object} service - Servicio con métodos getAll, getById, create, update, remove
 */
const makeCrudController = (service) => ({
    getAll: async (req, res) => {
        try {
            const data = await service.getAll();
            res.json(data);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
        }
    },

    getById: async (req, res) => {
        try {
            const data = await service.getById(parseInt(req.params.id));
            res.json(data);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
        }
    },

    create: async (req, res) => {
        try {
            const data = await service.create(req.body);
            res.status(201).json(data);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
        }
    },

    update: async (req, res) => {
        try {
            const data = await service.update(parseInt(req.params.id), req.body);
            res.json(data);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
        }
    },

    remove: async (req, res) => {
        try {
            const data = await service.remove(parseInt(req.params.id));
            res.json(data);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
        }
    },
});

module.exports = { makeCrudController };
