const { getPool } = require('../config/db');

const getAll = async (id_cliente = null) => {
  const sql = await getPool();

  const rows = await sql`
    SELECT a.id_agendamiento AS "ID_Agendamiento", a.id_reparacion AS "ID_Reparacion",
           r.id_motocicleta AS "ID_Motocicleta", 
           a.id_empleado AS "ID_Empleado", a.dia AS "Dia", a.horainicio AS "HoraInicio", 
           a.horafin AS "HoraFin", a.notas AS "Notas", a.estado AS "Estado",
           m.placa AS "Placa", m.marca AS "MarcaMoto", m.modelo AS "Modelo",
           e.nombre AS "NombreEmpleado", e.apellido AS "ApellidoEmpleado",
           (SELECT COALESCE(json_agg(json_build_object('Nombre', s.nombre, 'Duracion', s.duracion, 'Precio', s.precio)), '[]'::json) 
            FROM agendamientos_servicios ags 
            JOIN servicios s ON ags.id_servicio = s.id_servicio 
            WHERE ags.id_agendamiento = a.id_agendamiento) AS "Servicios"
    FROM agendamientos a
    LEFT JOIN reparaciones r ON a.id_reparacion = r.id_reparacion
    LEFT JOIN motocicletas m ON r.id_motocicleta = m.id_motocicleta
    INNER JOIN empleados e ON a.id_empleado = e.id_empleado
    ${id_cliente ? sql`WHERE m.id_cliente = ${id_cliente}` : sql``}
    ORDER BY a.dia DESC, a.horainicio
  `;

  return rows;
};

const getById = async (id) => {
  const sql = await getPool();

  const appointments = await sql`
    SELECT a.id_agendamiento AS "ID_Agendamiento", a.id_reparacion AS "ID_Reparacion",
           r.id_motocicleta AS "ID_Motocicleta", 
           a.id_empleado AS "ID_Empleado", a.dia AS "Dia", a.horainicio AS "HoraInicio", 
           a.horafin AS "HoraFin", a.notas AS "Notas", a.estado AS "Estado",
           m.placa AS "Placa", m.marca AS "MarcaMoto", m.modelo AS "Modelo",
           e.nombre AS "NombreEmpleado", e.apellido AS "ApellidoEmpleado"
    FROM agendamientos a
    LEFT JOIN reparaciones r ON a.id_reparacion = r.id_reparacion
    LEFT JOIN motocicletas m ON r.id_motocicleta = m.id_motocicleta
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
      // 1. Crear automáticamente una reparación vinculada al agendamiento
      const [reparacion] = await tx`
        INSERT INTO reparaciones (id_motocicleta, id_agendamiento, observaciones, estado)
        VALUES (${id_motocicleta}, NULL, ${notas || null}, 'Esperando motocicleta')
        RETURNING id_reparacion AS "ID_Reparacion"
      `;

      // 2. Crear el agendamiento
      const [agendamiento] = await tx`
        INSERT INTO agendamientos (id_reparacion, id_empleado, dia, horainicio, horafin, notas, estado)
        VALUES (${reparacion.ID_Reparacion}, ${id_empleado}, ${dia}, ${horainicio}, ${horafin}, ${notas || null}, 'Esperando motocicleta')
        RETURNING id_agendamiento AS "ID_Agendamiento", id_reparacion AS "ID_Reparacion",
                  id_empleado AS "ID_Empleado", dia AS "Dia", horainicio AS "HoraInicio", 
                  horafin AS "HoraFin", notas AS "Notas", estado AS "Estado"
      `;

      // 3. Vincular el agendamiento de vuelta en la reparación
      await tx`
        UPDATE reparaciones 
        SET id_agendamiento = ${agendamiento.ID_Agendamiento}
        WHERE id_reparacion = ${reparacion.ID_Reparacion}
      `;

      // 4. Agregar servicios al agendamiento
      if (servicios && servicios.length > 0) {
        const serviceInserts = servicios.map(id_servicio => ({
          id_agendamiento: agendamiento.ID_Agendamiento,
          id_servicio: id_servicio
        }));
        await tx`
          INSERT INTO agendamientos_servicios ${tx(serviceInserts, 'id_agendamiento', 'id_servicio')}
        `;
      }

      // 5. Vincular los mismos servicios a la reparación
      if (servicios && servicios.length > 0) {
        const repServiceInserts = servicios.map(id_servicio => ({
          id_reparacion: reparacion.ID_Reparacion,
          id_servicio: id_servicio
        }));
        await tx`
          INSERT INTO reparaciones_servicios ${tx(repServiceInserts, 'id_reparacion', 'id_servicio')}
        `;
      }

      return { ...agendamiento, ID_Reparacion: reparacion.ID_Reparacion, ID_Motocicleta: id_motocicleta };
    });

    return result;
  } catch (err) {
    console.error('Error al crear agendamiento:', err);
    throw err;
  }
};

const update = async (id, { id_motocicleta, id_empleado, dia, horainicio, horafin, notas }) => {
  const sql = await getPool();

  try {
    const result = await sql.begin(async (tx) => {
      // 1. Actualizar el agendamiento
      const [agend] = await tx`
        UPDATE agendamientos 
        SET id_empleado = ${id_empleado},
            dia = ${dia}, horainicio = ${horainicio}, horafin = ${horafin}, notas = ${notas || null}
        WHERE id_agendamiento = ${id}
        RETURNING id_agendamiento AS "ID_Agendamiento", id_reparacion AS "ID_Reparacion",
                  id_empleado AS "ID_Empleado", dia AS "Dia", horainicio AS "HoraInicio", 
                  horafin AS "HoraFin", notas AS "Notas"
      `;

      if (!agend) throw { status: 404, message: 'Agendamiento no encontrado.' };

      // 2. Actualizar la moto en la reparación vinculada
      if (agend.ID_Reparacion && id_motocicleta) {
        await tx`
          UPDATE reparaciones
          SET id_motocicleta = ${id_motocicleta}
          WHERE id_reparacion = ${agend.ID_Reparacion}
        `;
      }

      return { ...agend, ID_Motocicleta: id_motocicleta };
    });

    return result;
  } catch (err) {
    console.error('Error al actualizar agendamiento:', err);
    throw err;
  }
};

const remove = async (id, isClient = false) => {
  const sql = await getPool();

  try {
    // 0. Verificar que el agendamiento exista y validar la hora de anticipación (mínimo 1 hora)
    const [apt] = await sql`
      SELECT TO_CHAR(dia, 'YYYY-MM-DD') AS "DiaStr", horainicio AS "HoraInicio", estado AS "Estado"
      FROM agendamientos
      WHERE id_agendamiento = ${id}
    `;

    if (!apt) {
      throw { status: 404, message: 'Agendamiento no encontrado.' };
    }

    if (isClient) {
      const currentEstado = (apt.Estado || '').toLowerCase();
      if (!['esperando motocicleta', 'confirmado'].includes(currentEstado)) {
        throw { 
          status: 400, 
          message: 'No se puede cancelar un agendamiento que ya inició, finalizó o fue anulado.' 
        };
      }

      const aptDateTime = new Date(`${apt.DiaStr}T${apt.HoraInicio}`);
      const now = new Date();
      const diffHours = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours < 1) {
        throw { status: 400, message: 'Solo se puede anular con al menos una hora de anticipación.' };
      }
    }

    const [deleted] = await sql.begin(async (tx) => {
      // 1. Marcar la reparación vinculada como 'Anulado'
      await tx`
        UPDATE reparaciones 
        SET estado = 'Anulado'
        WHERE id_agendamiento = ${id}
      `;

      // 2. Marcar el agendamiento como 'Anulado'
      return await tx`
        UPDATE agendamientos 
        SET estado = 'Anulado'
        WHERE id_agendamiento = ${id}
        RETURNING id_agendamiento AS "ID_Agendamiento"
      `;
    });
      
    if (!deleted) throw { status: 404, message: 'Agendamiento no encontrado.' };

    return { message: 'Agendamiento y reparación vinculada anulados exitosamente.' };
  } catch (err) {
    console.error('Error al anular agendamiento:', err);
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
