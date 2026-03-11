const { getPool } = require('../config/db');

const getAll = async (id_cliente = null) => {
  const sql = await getPool();
  const rows = await sql`
        SELECT rep.id_reparacion AS "ID_Reparacion", rep.id_motocicleta AS "ID_Motocicleta", 
               rep.id_agendamiento AS "ID_Agendamiento", rep.fecha AS "Fecha", 
               rep.observaciones AS "Observaciones", rep.tiposervicio AS "TipoServicio", 
               rep.estado AS "Estado",
               m.placa AS "Placa", m.marca AS "MarcaMoto", m.modelo AS "Modelo",
               a.dia AS "DiaAgendamiento"
        FROM reparaciones rep
        INNER JOIN motocicletas m ON rep.id_motocicleta = m.id_motocicleta
        LEFT JOIN agendamientos a ON rep.id_agendamiento = a.id_agendamiento
        ${id_cliente ? sql`WHERE m.id_cliente = ${id_cliente}` : sql``}
        ORDER BY rep.fecha DESC
    `;
  return rows;
};

const getById = async (id) => {
  const sql = await getPool();
  const appointments = await sql`
        SELECT rep.id_reparacion AS "ID_Reparacion", rep.id_motocicleta AS "ID_Motocicleta", 
               rep.id_agendamiento AS "ID_Agendamiento", rep.fecha AS "Fecha", 
               rep.observaciones AS "Observaciones", rep.tiposervicio AS "TipoServicio", 
               rep.estado AS "Estado",
               m.placa AS "Placa", m.marca AS "MarcaMoto", m.modelo AS "Modelo",
               a.dia AS "DiaAgendamiento"
        FROM reparaciones rep
        INNER JOIN motocicletas m ON rep.id_motocicleta = m.id_motocicleta
        LEFT JOIN agendamientos a ON rep.id_agendamiento = a.id_agendamiento
        WHERE rep.id_reparacion = ${id}
    `;
  if (appointments.length === 0) throw { status: 404, message: 'Reparación no encontrada.' };

  const services = await sql`
        SELECT s.id_servicio AS "ID_Servicio", s.nombre AS "Nombre" 
        FROM reparaciones_servicios rs
        INNER JOIN servicios s ON rs.id_servicio = s.id_servicio
        WHERE rs.id_reparacion = ${id}
    `;

  const progress = await sql`
        SELECT ra.id_avance AS "ID_ReparacionAvance", ra.id_reparacion AS "ID_Reparacion", 
               ra.id_empleado AS "ID_Empleado", ra.descripcion AS "Descripcion", ra.fecha AS "Fecha",
               e.nombre AS "NombreEmpleado", e.apellido AS "ApellidoEmpleado"
        FROM reparaciones_avances ra
        INNER JOIN empleados e ON ra.id_empleado = e.id_empleado
        WHERE ra.id_reparacion = ${id}
        ORDER BY ra.fecha DESC
    `;

  return { ...appointments[0], servicios: services, avances: progress };
};

const create = async ({ id_motocicleta, id_agendamiento, observaciones, tipo_servicio, estado, servicios }) => {
  const sql = await getPool();

  try {
    const result = await sql.begin(async (tx) => {
      const [reparacion] = await tx`
                INSERT INTO reparaciones (id_motocicleta, id_agendamiento, fecha, observaciones, tiposervicio, estado)
                VALUES (${id_motocicleta}, ${id_agendamiento || null}, NOW(), ${observaciones || null}, ${tipo_servicio || 'Directo'}, ${estado || 'En proceso'})
                RETURNING id_reparacion AS "ID_Reparacion", id_motocicleta AS "ID_Motocicleta", id_agendamiento AS "ID_Agendamiento"
            `;

      if (servicios && servicios.length > 0) {
        const serviceInserts = servicios.map(id_servicio => ({
          id_reparacion: reparacion.ID_Reparacion,
          id_servicio: id_servicio
        }));

        await tx`
                    INSERT INTO reparaciones_servicios ${sql(serviceInserts, 'id_reparacion', 'id_servicio')}
                `;
      }

      return reparacion;
    });

    return result;
  } catch (err) {
    console.error('Error al crear reparación:', err);
    throw err;
  }
};

const update = async (id, { observaciones, tipo_servicio, estado }) => {
  const sql = await getPool();
  const [row] = await sql`
        UPDATE reparaciones 
        SET observaciones = ${observaciones || null}, tiposervicio = ${tipo_servicio}, estado = ${estado}
        WHERE id_reparacion = ${id}
        RETURNING id_reparacion AS "ID_Reparacion"
    `;
  if (!row) throw { status: 404, message: 'Reparación no encontrada.' };
  return row;
};

const addAvance = async (id_reparacion, id_empleado, descripcion) => {
  const sql = await getPool();
  const [row] = await sql`
        INSERT INTO reparaciones_avances (id_reparacion, id_empleado, descripcion, fecha)
        VALUES (${id_reparacion}, ${id_empleado}, ${descripcion}, NOW())
        RETURNING id_avance AS "ID_ReparacionAvance"
    `;
  return row;
};

const addServicio = async (id_reparacion, id_servicio) => {
  const sql = await getPool();
  const exists = await sql`
        SELECT 1 FROM reparaciones_servicios 
        WHERE id_reparacion = ${id_reparacion} AND id_servicio = ${id_servicio}
    `;
  if (exists.length > 0) throw { status: 409, message: 'El servicio ya está en esta reparación.' };

  await sql`
        INSERT INTO reparaciones_servicios (id_reparacion, id_servicio) 
        VALUES (${id_reparacion}, ${id_servicio})
    `;
  return { message: 'Servicio agregado a la reparación.' };
};

const remove = async (id) => {
  const sql = await getPool();
  try {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM reparaciones_servicios WHERE id_reparacion = ${id}`;
      await tx`DELETE FROM reparaciones_avances WHERE id_reparacion = ${id}`;
      const [deleted] = await tx`
                DELETE FROM reparaciones 
                WHERE id_reparacion = ${id}
                RETURNING id_reparacion AS "ID_Reparacion"
            `;
      if (!deleted) throw { status: 404, message: 'Reparación no encontrada.' };
    });
    return { message: 'Reparación eliminada.' };
  } catch (err) {
    throw err;
  }
};

module.exports = { getAll, getById, create, update, addAvance, addServicio, remove };
