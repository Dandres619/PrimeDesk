const novedadesService = require('../services/novedades.service');

const getAll = async (req, res, next) => {
  try {
    const data = await novedadesService.getAll();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { id_empleado, dia, hora_inicio, hora_fin, tipo, descripcion } = req.body;
    
    if (!id_empleado || !dia || !tipo) {
      return res.status(400).json({ message: 'El id_empleado, dia y tipo son requeridos.' });
    }

    const data = await novedadesService.create({
      id_empleado: parseInt(id_empleado),
      dia,
      hora_inicio,
      hora_fin,
      tipo,
      descripcion
    });

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const getByEmpleado = async (req, res, next) => {
  try {
    const data = await novedadesService.getByEmpleado(parseInt(req.params.id_empleado));
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, getByEmpleado };
