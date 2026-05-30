const { getPool } = require('../config/db');

/**
 * Obtiene todos los horarios, agrupados por empleado.
 * Devuelve un array de objetos { id_empleado, nombre, apellido, dias: [...] }
 */
const getAll = async () => {
  const sql = await getPool();
  const rows = await sql`
    SELECT 
      h.id_horario      AS "ID_Horario",
      h.id_empleado     AS "ID_Empleado",
      e.nombre          AS "Nombre",
      e.apellido        AS "Apellido",
      h.dia             AS "Dia",
      h.hora_entrada    AS "HoraEntrada",
      h.hora_salida     AS "HoraSalida",
      h.estado          AS "Estado",
      h.created_at      AS "CreadoEn",
      h.updated_at      AS "ActualizadoEn"
    FROM horarios h
    INNER JOIN empleados e ON h.id_empleado = e.id_empleado
    INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
    ORDER BY e.nombre ASC, h.dia ASC
  `;
  return rows;
};

/**
 * Obtiene los horarios de un empleado específico.
 */
const getByEmpleado = async (id_empleado) => {
  const sql = await getPool();
  const rows = await sql`
    SELECT 
      h.id_horario      AS "ID_Horario",
      h.id_empleado     AS "ID_Empleado",
      e.nombre          AS "Nombre",
      e.apellido        AS "Apellido",
      h.dia             AS "Dia",
      h.hora_entrada    AS "HoraEntrada",
      h.hora_salida     AS "HoraSalida",
      h.estado          AS "Estado"
    FROM horarios h
    INNER JOIN empleados e ON h.id_empleado = e.id_empleado
    WHERE h.id_empleado = ${id_empleado}
    ORDER BY h.dia ASC
  `;
  return rows;
};

/**
 * Crea o reemplaza los horarios de un empleado.
 * diasHorarios: Array de { dia, hora_entrada, hora_salida }
 */
const upsertHorarios = async (id_empleado, diasHorarios) => {
  const hasWeekend = diasHorarios.some(d => {
    const normalize = d.dia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalize === 'sabado' || normalize === 'domingo';
  });
  if (hasWeekend) {
    const error = new Error('No se pueden registrar horarios para fines de semana (Sábados y Domingos).');
    error.status = 400;
    throw error;
  }

  const sql = await getPool();

  const result = await sql.begin(async (tx) => {
    // Si existen filas previas para este empleado, las eliminamos y re-creamos
    await tx`DELETE FROM horarios WHERE id_empleado = ${id_empleado}`;

    const inserted = [];
    for (const d of diasHorarios) {
      const [row] = await tx`
        INSERT INTO horarios (id_empleado, dia, hora_entrada, hora_salida, estado, updated_at)
        VALUES (${id_empleado}, ${d.dia}, ${d.hora_entrada}, ${d.hora_salida}, TRUE, timezone('America/Bogota', NOW()))
        RETURNING id_horario AS "ID_Horario", dia AS "Dia", hora_entrada AS "HoraEntrada", hora_salida AS "HoraSalida"
      `;
      inserted.push(row);
    }
    return inserted;
  });

  return result;
};

/**
 * Actualiza el estado (activo/inactivo) de todos los horarios de un empleado.
 */
const toggleEstado = async (id_empleado, estado) => {
  const sql = await getPool();

  if (!estado) {
    const activeRepairs = await sql`
      SELECT COUNT(*)::int as count 
      FROM agendamientos a
      LEFT JOIN reparaciones r ON r.id_agendamiento = a.id_agendamiento
      WHERE a.id_empleado = ${id_empleado} 
        AND (a.estado = 'En reparación' OR r.estado = 'En reparación')
    `;
    if (activeRepairs[0].count > 0) {
      throw { status: 400, message: 'No se puede inactivar el horario del mecánico porque tiene una reparación o agendamiento en estado "En reparación".' };
    }
  }

  await sql`
    UPDATE horarios
    SET estado = ${estado}, updated_at = timezone('America/Bogota', NOW())
    WHERE id_empleado = ${id_empleado}
  `;
  return { message: `Horarios ${estado ? 'activados' : 'desactivados'} exitosamente.` };
};

/**
 * Elimina todos los horarios de un empleado.
 */
const remove = async (id_empleado) => {
  const sql = await getPool();

  const activeRepairs = await sql`
    SELECT COUNT(*)::int as count 
    FROM agendamientos a
    LEFT JOIN reparaciones r ON r.id_agendamiento = a.id_agendamiento
    WHERE a.id_empleado = ${id_empleado} 
      AND (a.estado = 'En reparación' OR r.estado = 'En reparación')
  `;
  if (activeRepairs[0].count > 0) {
    throw { status: 400, message: 'No se puede eliminar el horario del mecánico porque tiene una reparación o agendamiento en estado "En reparación".' };
  }

  await sql`DELETE FROM horarios WHERE id_empleado = ${id_empleado}`;
  return { message: 'Horarios eliminados exitosamente.' };
};

module.exports = { getAll, getByEmpleado, upsertHorarios, toggleEstado, remove };
