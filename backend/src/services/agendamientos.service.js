const { getPool, sql } = require('../config/db');

const getAll = async (id_cliente = null) => {
  const pool = await getPool();
  let query = `
    SELECT a.*,
      m.Placa, m.Marca AS MarcaMoto, m.Modelo,
      e.Nombre AS NombreEmpleado, e.Apellido AS ApellidoEmpleado
    FROM Agendamientos a
    INNER JOIN Motocicletas m ON a.ID_Motocicleta = m.ID_Motocicleta
    INNER JOIN Empleados e ON a.ID_Empleado = e.ID_Empleado
  `;

  if (id_cliente) {
    query += ' WHERE m.ID_Cliente = @id_cliente';
  }

  query += ' ORDER BY a.Dia DESC, a.HoraInicio';

  const request = pool.request();
  if (id_cliente) {
    request.input('id_cliente', sql.Int, id_cliente);
  }

  const r = await request.query(query);
  return r.recordset;
};

const getById = async (id) => {
  const pool = await getPool();
  const r = await pool.request().input('id', sql.Int, id).query(`
    SELECT a.*,
      m.Placa, m.Marca AS MarcaMoto, m.Modelo,
      e.Nombre AS NombreEmpleado, e.Apellido AS ApellidoEmpleado
    FROM Agendamientos a
    INNER JOIN Motocicletas m ON a.ID_Motocicleta = m.ID_Motocicleta
    INNER JOIN Empleados e ON a.ID_Empleado = e.ID_Empleado
    WHERE a.ID_Agendamiento = @id
  `);
  if (!r.recordset.length) throw { status: 404, message: 'Agendamiento no encontrado.' };

  const servicios = await pool.request().input('id', sql.Int, id).query(`
    SELECT s.ID_Servicio, s.Nombre, s.Descripcion
    FROM Agendamientos_Servicios ag_s
    INNER JOIN Servicios s ON ag_s.ID_Servicio = s.ID_Servicio
    WHERE ag_s.ID_Agendamiento = @id
  `);

  return { ...r.recordset[0], servicios: servicios.recordset };
};

const create = async ({ id_motocicleta, id_empleado, dia, hora_inicio, hora_fin, notas, servicios }) => {
  const pool = await getPool();
  const r = await pool.request()
    .input('id_motocicleta', sql.Int, id_motocicleta)
    .input('id_empleado', sql.Int, id_empleado)
    .input('dia', sql.Date, dia)
    .input('hora_inicio', sql.VarChar(8), hora_inicio)
    .input('hora_fin', sql.VarChar(8), hora_fin)
    .input('notas', sql.Text, notas || null)
    .query(`
      INSERT INTO Agendamientos (ID_Motocicleta, ID_Empleado, Dia, HoraInicio, HoraFin, Notas)
      OUTPUT INSERTED.*
      VALUES (@id_motocicleta, @id_empleado, @dia, @hora_inicio, @hora_fin, @notas)
    `);

  const agendamiento = r.recordset[0];

  // Insertar servicios si se proporcionan
  if (servicios && servicios.length > 0) {
    for (const id_servicio of servicios) {
      await pool.request()
        .input('id_agendamiento', sql.Int, agendamiento.ID_Agendamiento)
        .input('id_servicio', sql.Int, id_servicio)
        .query('INSERT INTO Agendamientos_Servicios (ID_Agendamiento, ID_Servicio) VALUES (@id_agendamiento, @id_servicio)');
    }
  }

  return agendamiento;
};

const update = async (id, { id_motocicleta, id_empleado, dia, hora_inicio, hora_fin, notas }) => {
  const pool = await getPool();
  const r = await pool.request()
    .input('id', sql.Int, id)
    .input('id_motocicleta', sql.Int, id_motocicleta)
    .input('id_empleado', sql.Int, id_empleado)
    .input('dia', sql.Date, dia)
    .input('hora_inicio', sql.VarChar(8), hora_inicio)
    .input('hora_fin', sql.VarChar(8), hora_fin)
    .input('notas', sql.Text, notas || null)
    .query(`
      UPDATE Agendamientos SET ID_Motocicleta=@id_motocicleta, ID_Empleado=@id_empleado,
        Dia=@dia, HoraInicio=@hora_inicio, HoraFin=@hora_fin, Notas=@notas
      OUTPUT INSERTED.*
      WHERE ID_Agendamiento=@id
    `);
  if (!r.recordset.length) throw { status: 404, message: 'Agendamiento no encontrado.' };
  return r.recordset[0];
};

const remove = async (id) => {
  const pool = await getPool();
  // Eliminar servicios asociados primero
  await pool.request().input('id', sql.Int, id)
    .query('DELETE FROM Agendamientos_Servicios WHERE ID_Agendamiento=@id');
  const r = await pool.request().input('id', sql.Int, id)
    .query('DELETE FROM Agendamientos OUTPUT DELETED.ID_Agendamiento WHERE ID_Agendamiento=@id');
  if (!r.recordset.length) throw { status: 404, message: 'Agendamiento no encontrado.' };
  return { message: 'Agendamiento eliminado.' };
};

const addServicio = async (id_agendamiento, id_servicio) => {
  const pool = await getPool();
  const exists = await pool.request()
    .input('id_agendamiento', sql.Int, id_agendamiento)
    .input('id_servicio', sql.Int, id_servicio)
    .query('SELECT 1 FROM Agendamientos_Servicios WHERE ID_Agendamiento=@id_agendamiento AND ID_Servicio=@id_servicio');
  if (exists.recordset.length) throw { status: 409, message: 'El servicio ya está agregado a este agendamiento.' };
  await pool.request()
    .input('id_agendamiento', sql.Int, id_agendamiento)
    .input('id_servicio', sql.Int, id_servicio)
    .query('INSERT INTO Agendamientos_Servicios (ID_Agendamiento, ID_Servicio) VALUES (@id_agendamiento, @id_servicio)');
  return { message: 'Servicio agregado al agendamiento.' };
};

const removeServicio = async (id_agendamiento, id_servicio) => {
  const pool = await getPool();
  const r = await pool.request()
    .input('id_agendamiento', sql.Int, id_agendamiento)
    .input('id_servicio', sql.Int, id_servicio)
    .query('DELETE FROM Agendamientos_Servicios OUTPUT DELETED.ID_AgendamientoServicio WHERE ID_Agendamiento=@id_agendamiento AND ID_Servicio=@id_servicio');
  if (!r.recordset.length) throw { status: 404, message: 'Asignación no encontrada.' };
  return { message: 'Servicio removido del agendamiento.' };
};

module.exports = { getAll, getById, create, update, remove, addServicio, removeServicio };
