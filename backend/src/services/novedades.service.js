const { getPool } = require('../config/db');

const getAll = async () => {
  const sql = await getPool();
  const rows = await sql`
    SELECT n.id_novedad AS "ID_Novedad", n.id_empleado AS "ID_Empleado", 
           n.dia AS "Dia", n.hora_inicio AS "HoraInicio", n.hora_fin AS "HoraFin",
           n.tipo AS "Tipo", n.descripcion AS "Descripcion", n.created_at AS "CreatedAt",
           e.nombre AS "NombreEmpleado", e.apellido AS "ApellidoEmpleado"
    FROM novedades n
    INNER JOIN empleados e ON n.id_empleado = e.id_empleado
    ORDER BY n.dia DESC, n.created_at DESC
  `;
  return rows;
};

const create = async ({ id_empleado, dia, hora_inicio, hora_fin, tipo, descripcion }) => {
  const sql = await getPool();

  try {
    const result = await sql.begin(async (tx) => {
      // 1. Insert the novelty
      const [novedad] = await tx`
        INSERT INTO novedades (id_empleado, dia, hora_inicio, hora_fin, tipo, descripcion)
        VALUES (
          ${id_empleado}, 
          ${dia}, 
          ${hora_inicio || null}, 
          ${hora_fin || null}, 
          ${tipo}, 
          ${descripcion || null}
        )
        RETURNING id_novedad AS "ID_Novedad", id_empleado AS "ID_Empleado", 
                  dia AS "Dia", hora_inicio AS "HoraInicio", hora_fin AS "HoraFin",
                  tipo AS "Tipo", descripcion AS "Descripcion"
      `;

      // 2. Identify and cancel overlapping appointments
      // We will select them first so we know which ones we are canceling (for future email/log purposes)
      const overlappingApts = await tx`
        SELECT id_agendamiento AS "ID_Agendamiento", horainicio AS "HoraInicio", horafin AS "HoraFin"
        FROM agendamientos
        WHERE id_empleado = ${id_empleado}
          AND dia = ${dia}
          AND estado NOT IN ('Anulado', 'Anulada')
          AND (
            (${hora_inicio || null}::TIME IS NULL OR ${hora_fin || null}::TIME IS NULL)
            OR
            (horainicio >= ${hora_inicio} AND horainicio < ${hora_fin}) OR
            (horafin > ${hora_inicio} AND horafin <= ${hora_fin}) OR
            (horainicio <= ${hora_inicio} AND horafin >= ${hora_fin})
          )
      `;

      const aptIds = overlappingApts.map(a => a.ID_Agendamiento);

      if (aptIds.length > 0) {
        // Cancel the appointments
        await tx`
          UPDATE agendamientos
          SET estado = 'Anulada'
          WHERE id_agendamiento IN (${aptIds})
        `;

        // Cancel the associated repairs
        await tx`
          UPDATE reparaciones
          SET estado = 'Anulada'
          WHERE id_agendamiento IN (${aptIds})
        `;
      }

      return { novedad, affectedAppointments: overlappingApts };
    });

    return result;
  } catch (err) {
    console.error('Error al registrar novedad:', err);
    throw err;
  }
};

const getByEmpleado = async (id_empleado) => {
  const sql = await getPool();
  const rows = await sql`
    SELECT n.id_novedad AS "ID_Novedad", n.dia AS "Dia", 
           n.hora_inicio AS "HoraInicio", n.hora_fin AS "HoraFin",
           n.tipo AS "Tipo", n.descripcion AS "Descripcion", n.created_at AS "CreatedAt"
    FROM novedades n
    WHERE n.id_empleado = ${id_empleado}
    ORDER BY n.dia DESC, n.created_at DESC
  `;
  return rows;
};

module.exports = { getAll, create, getByEmpleado };
