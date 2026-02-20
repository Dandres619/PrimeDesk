const { getPool, sql } = require('../config/db');

const getAll = async () => {
    const pool = await getPool();
    const r = await pool.request().query(`
    SELECT rep.*,
      m.Placa, m.Marca AS MarcaMoto, m.Modelo,
      a.Dia AS DiaAgendamiento
    FROM Reparaciones rep
    INNER JOIN Motocicletas m ON rep.ID_Motocicleta = m.ID_Motocicleta
    INNER JOIN Agendamientos a ON rep.ID_Agendamiento = a.ID_Agendamiento
    ORDER BY rep.Fecha DESC
  `);
    return r.recordset;
};

const getById = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id).query(`
    SELECT rep.*,
      m.Placa, m.Marca AS MarcaMoto, m.Modelo,
      a.Dia AS DiaAgendamiento
    FROM Reparaciones rep
    INNER JOIN Motocicletas m ON rep.ID_Motocicleta = m.ID_Motocicleta
    INNER JOIN Agendamientos a ON rep.ID_Agendamiento = a.ID_Agendamiento
    WHERE rep.ID_Reparacion = @id
  `);
    if (!r.recordset.length) throw { status: 404, message: 'Reparación no encontrada.' };

    const servicios = await pool.request().input('id', sql.Int, id).query(`
    SELECT s.ID_Servicio, s.Nombre FROM Reparaciones_Servicios rs
    INNER JOIN Servicios s ON rs.ID_Servicio = s.ID_Servicio
    WHERE rs.ID_Reparacion = @id
  `);

    const avances = await pool.request().input('id', sql.Int, id).query(`
    SELECT ra.*, e.Nombre AS NombreEmpleado, e.Apellido AS ApellidoEmpleado
    FROM Reparaciones_Avances ra
    INNER JOIN Empleados e ON ra.ID_Empleado = e.ID_Empleado
    WHERE ra.ID_Reparacion = @id
    ORDER BY ra.Fecha DESC
  `);

    return { ...r.recordset[0], servicios: servicios.recordset, avances: avances.recordset };
};

const create = async ({ id_motocicleta, id_agendamiento, observaciones, tipo_servicio, estado, servicios }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id_motocicleta', sql.Int, id_motocicleta)
        .input('id_agendamiento', sql.Int, id_agendamiento)
        .input('observaciones', sql.Text, observaciones || null)
        .input('tipo_servicio', sql.VarChar(50), tipo_servicio || 'Directo')
        .input('estado', sql.VarChar(30), estado || 'Activo')
        .query(`
      INSERT INTO Reparaciones (ID_Motocicleta, ID_Agendamiento, Fecha, Observaciones, TipoServicio, Estado)
      OUTPUT INSERTED.*
      VALUES (@id_motocicleta, @id_agendamiento, GETDATE(), @observaciones, @tipo_servicio, @estado)
    `);

    const reparacion = r.recordset[0];

    if (servicios && servicios.length > 0) {
        for (const id_servicio of servicios) {
            await pool.request()
                .input('id_reparacion', sql.Int, reparacion.ID_Reparacion)
                .input('id_servicio', sql.Int, id_servicio)
                .query('INSERT INTO Reparaciones_Servicios (ID_Reparacion, ID_Servicio) VALUES (@id_reparacion, @id_servicio)');
        }
    }

    return reparacion;
};

const update = async (id, { observaciones, tipo_servicio, estado }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id', sql.Int, id)
        .input('observaciones', sql.Text, observaciones || null)
        .input('tipo_servicio', sql.VarChar(50), tipo_servicio)
        .input('estado', sql.VarChar(30), estado)
        .query(`
      UPDATE Reparaciones SET Observaciones=@observaciones, TipoServicio=@tipo_servicio, Estado=@estado
      OUTPUT INSERTED.*
      WHERE ID_Reparacion=@id
    `);
    if (!r.recordset.length) throw { status: 404, message: 'Reparación no encontrada.' };
    return r.recordset[0];
};

const addAvance = async (id_reparacion, id_empleado, descripcion) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id_reparacion', sql.Int, id_reparacion)
        .input('id_empleado', sql.Int, id_empleado)
        .input('descripcion', sql.Text, descripcion)
        .query(`
      INSERT INTO Reparaciones_Avances (ID_Reparacion, ID_Empleado, Descripcion, Fecha)
      OUTPUT INSERTED.*
      VALUES (@id_reparacion, @id_empleado, @descripcion, GETDATE())
    `);
    return r.recordset[0];
};

const addServicio = async (id_reparacion, id_servicio) => {
    const pool = await getPool();
    const exists = await pool.request()
        .input('id_reparacion', sql.Int, id_reparacion)
        .input('id_servicio', sql.Int, id_servicio)
        .query('SELECT 1 FROM Reparaciones_Servicios WHERE ID_Reparacion=@id_reparacion AND ID_Servicio=@id_servicio');
    if (exists.recordset.length) throw { status: 409, message: 'El servicio ya está en esta reparación.' };
    await pool.request()
        .input('id_reparacion', sql.Int, id_reparacion)
        .input('id_servicio', sql.Int, id_servicio)
        .query('INSERT INTO Reparaciones_Servicios (ID_Reparacion, ID_Servicio) VALUES (@id_reparacion, @id_servicio)');
    return { message: 'Servicio agregado a la reparación.' };
};

const remove = async (id) => {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Reparaciones_Servicios WHERE ID_Reparacion=@id');
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Reparaciones_Avances WHERE ID_Reparacion=@id');
    const r = await pool.request().input('id', sql.Int, id)
        .query('DELETE FROM Reparaciones OUTPUT DELETED.ID_Reparacion WHERE ID_Reparacion=@id');
    if (!r.recordset.length) throw { status: 404, message: 'Reparación no encontrada.' };
    return { message: 'Reparación eliminada.' };
};

module.exports = { getAll, getById, create, update, addAvance, addServicio, remove };
