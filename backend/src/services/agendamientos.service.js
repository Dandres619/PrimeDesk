const { getPool } = require('../config/db');

const getAll = async (id_cliente = null) => {
  const sql = await getPool();

  const rows = await sql`
    SELECT a.id_agendamiento AS "ID_Agendamiento", a.id_motocicleta AS "ID_Motocicleta", 
           a.id_empleado AS "ID_Empleado", a.dia AS "Dia", a.horainicio AS "HoraInicio", 
           a.horafin AS "HoraFin", a.notas AS "Notas",
           m.placa AS "Placa", m.marca AS "MarcaMoto", m.modelo AS "Modelo",
           e.nombre AS "NombreEmpleado", e.apellido AS "ApellidoEmpleado",
           (SELECT COALESCE(json_agg(s.nombre), '[]'::json) 
            FROM agendamientos_servicios ags 
            JOIN servicios s ON ags.id_servicio = s.id_servicio 
            WHERE ags.id_agendamiento = a.id_agendamiento) AS "Servicios"
    FROM agendamientos a
    INNER JOIN motocicletas m ON a.id_motocicleta = m.id_motocicleta
    INNER JOIN empleados e ON a.id_empleado = e.id_empleado
    ${id_cliente ? sql`WHERE m.id_cliente = ${id_cliente}` : sql``}
    ORDER BY a.dia DESC, a.horainicio
  `;

  return rows;
};

const getById = async (id) => {
  const sql = await getPool();

  const appointments = await sql`
    SELECT a.id_agendamiento AS "ID_Agendamiento", a.id_motocicleta AS "ID_Motocicleta", 
           a.id_empleado AS "ID_Empleado", a.dia AS "Dia", a.horainicio AS "HoraInicio", 
           a.horafin AS "HoraFin", a.notas AS "Notas",
           m.placa AS "Placa", m.marca AS "MarcaMoto", m.modelo AS "Modelo",
           e.nombre AS "NombreEmpleado", e.apellido AS "ApellidoEmpleado"
    FROM agendamientos a
    INNER JOIN motocicletas m ON a.id_motocicleta = m.id_motocicleta
    INNER JOIN empleados e ON a.id_empleado = e.id_empleado
    WHERE a.id_agendamiento = ${id}
  `;

  if (appointments.length === 0) throw { status: 404, message: 'Agendamiento no encontrado.' };

  const services = await sql`
    SELECT s.id_servicio AS "ID_Servicio", s.nombre AS "Nombre", s.descripcion AS "Descripcion"
    FROM agendamientos_servicios ag_s
    INNER JOIN servicios s ON ag_s.id_servicio = s.id_servicio
    WHERE ag_s.id_agendamiento = ${id}
  `;

  return { ...appointments[0], servicios: services };
};

const create = async ({ id_motocicleta, id_empleado, dia, horainicio, horafin, notas, servicios }) => {
  const sql = await getPool();

  try {
    const result = await sql.begin(async (tx) => {
      // 1. Crear el agendamiento
      const [agendamiento] = await tx`
        INSERT INTO agendamientos (id_motocicleta, id_empleado, dia, horainicio, horafin, notas)
        VALUES (${id_motocicleta}, ${id_empleado}, ${dia}, ${horainicio}, ${horafin}, ${notas || null})
        RETURNING id_agendamiento AS "ID_Agendamiento", id_motocicleta AS "ID_Motocicleta", 
                  id_empleado AS "ID_Empleado", dia AS "Dia", horainicio AS "HoraInicio", 
                  horafin AS "HoraFin", notas AS "Notas"
      `;

      // 2. Agregar servicios al agendamiento
      if (servicios && servicios.length > 0) {
        const serviceInserts = servicios.map(id_servicio => ({
          id_agendamiento: agendamiento.ID_Agendamiento,
          id_servicio: id_servicio
        }));
        await tx`
          INSERT INTO agendamientos_servicios ${sql(serviceInserts, 'id_agendamiento', 'id_servicio')}
        `;
      }

      // 3. Crear automáticamente una reparación vinculada al agendamiento
      const [reparacion] = await tx`
        INSERT INTO reparaciones (id_motocicleta, id_agendamiento, fecha, observaciones, tiposervicio, estado)
        VALUES (${id_motocicleta}, ${agendamiento.ID_Agendamiento}, NOW(), ${notas || null}, 'Agendado', 'En proceso')
        RETURNING id_reparacion AS "ID_Reparacion"
      `;

      // 4. Vincular los mismos servicios a la reparación
      if (servicios && servicios.length > 0) {
        const repServiceInserts = servicios.map(id_servicio => ({
          id_reparacion: reparacion.ID_Reparacion,
          id_servicio: id_servicio
        }));
        await tx`
          INSERT INTO reparaciones_servicios ${sql(repServiceInserts, 'id_reparacion', 'id_servicio')}
        `;
      }

      return { ...agendamiento, ID_Reparacion: reparacion.ID_Reparacion };
    });

    return result;
  } catch (err) {
    console.error('Error al crear agendamiento:', err);
    throw err;
  }
};

const update = async (id, { id_motocicleta, id_empleado, dia, horainicio, horafin, notas }) => {
  const sql = await getPool();

  const [row] = await sql`
    UPDATE agendamientos 
    SET id_motocicleta = ${id_motocicleta}, id_empleado = ${id_empleado},
        dia = ${dia}, horainicio = ${horainicio}, horafin = ${horafin}, notas = ${notas || null}
    WHERE id_agendamiento = ${id}
    RETURNING id_agendamiento AS "ID_Agendamiento", id_motocicleta AS "ID_Motocicleta", 
              id_empleado AS "ID_Empleado", dia AS "Dia", horainicio AS "HoraInicio", 
              horafin AS "HoraFin", notas AS "Notas"
  `;

  if (!row) throw { status: 404, message: 'Agendamiento no encontrado.' };
  return row;
};

const remove = async (id) => {
  const sql = await getPool();

  try {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM agendamientos_servicios WHERE id_agendamiento = ${id}`;
      const [deleted] = await tx`
        DELETE FROM agendamientos 
        WHERE id_agendamiento = ${id}
        RETURNING id_agendamiento AS "ID_Agendamiento"
      `;
      if (!deleted) throw { status: 404, message: 'Agendamiento no encontrado.' };
    });

    return { message: 'Agendamiento eliminado.' };
  } catch (err) {
    throw err;
  }
};

const addServicio = async (id_agendamiento, id_servicio) => {
  const sql = await getPool();

  const exists = await sql`
    SELECT 1 FROM agendamientos_servicios 
    WHERE id_agendamiento = ${id_agendamiento} AND id_servicio = ${id_servicio}
  `;

  if (exists.length > 0) throw { status: 409, message: 'El servicio ya está agregado a este agendamiento.' };

  await sql`
    INSERT INTO agendamientos_servicios (id_agendamiento, id_servicio) 
    VALUES (${id_agendamiento}, ${id_servicio})
  `;

  return { message: 'Servicio agregado al agendamiento.' };
};

const removeServicio = async (id_agendamiento, id_servicio) => {
  const sql = await getPool();

  const [deleted] = await sql`
    DELETE FROM agendamientos_servicios 
    WHERE id_agendamiento = ${id_agendamiento} AND id_servicio = ${id_servicio}
    RETURNING id_agendamientoservicio AS "ID_AgendamientoServicio"
  `;

  if (!deleted) throw { status: 404, message: 'Asignación no encontrada.' };
  return { message: 'Servicio removido del agendamiento.' };
};

module.exports = { getAll, getById, create, update, remove, addServicio, removeServicio };
