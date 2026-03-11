const horariosService = require('../services/horarios.service');

const getAll = async (req, res) => {
  try {
    const data = await horariosService.getAll();
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
  }
};

const getByEmpleado = async (req, res) => {
  try {
    const data = await horariosService.getByEmpleado(parseInt(req.params.id_empleado));
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
  }
};

const upsertHorarios = async (req, res) => {
  try {
    const { id_empleado, dias } = req.body;
    const data = await horariosService.upsertHorarios(parseInt(id_empleado), dias);
    res.status(200).json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
  }
};

const toggleEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const data = await horariosService.toggleEstado(parseInt(req.params.id_empleado), estado);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
  }
};

const remove = async (req, res) => {
  try {
    const data = await horariosService.remove(parseInt(req.params.id_empleado));
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
  }
};

module.exports = { getAll, getByEmpleado, upsertHorarios, toggleEstado, remove };
