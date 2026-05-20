const { getPool } = require('../config/db');
const emailService = require('./email.service');

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

      // 2. Identify and cancel overlapping appointments with client/user details
      const overlappingApts = await tx`
        SELECT a.id_agendamiento AS "ID_Agendamiento", a.horainicio AS "HoraInicio", a.horafin AS "HoraFin",
               a.dia AS "Dia",
               c.nombre AS "NombreCliente", c.apellido AS "ApellidoCliente",
               u.correo AS "CorreoCliente"
        FROM agendamientos a
        INNER JOIN motocicletas m ON a.id_motocicleta = m.id_motocicleta
        INNER JOIN clientes c ON m.id_cliente = c.id_cliente
        LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE a.id_empleado = ${id_empleado}
          AND a.dia = ${dia}
          AND a.estado NOT IN ('Anulado', 'Anulada')
          AND (
            (${hora_inicio || null}::TIME IS NULL OR ${hora_fin || null}::TIME IS NULL)
            OR
            (a.horainicio >= ${hora_inicio} AND a.horainicio < ${hora_fin}) OR
            (a.horafin > ${hora_inicio} AND a.horafin <= ${hora_fin}) OR
            (a.horainicio <= ${hora_inicio} AND a.horafin >= ${hora_fin})
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

    // Send email notifications to affected clients
    if (result && result.affectedAppointments && result.affectedAppointments.length > 0) {
      const emailPromises = result.affectedAppointments
        .filter(apt => apt.CorreoCliente)
        .map(async (apt) => {
          try {
            let dateStr = apt.Dia;
            if (apt.Dia instanceof Date) {
              dateStr = apt.Dia.toISOString().split('T')[0];
            } else if (dateStr && typeof dateStr === 'object') {
              dateStr = String(dateStr);
            }
            
            let timeStr = apt.HoraInicio;
            if (timeStr && typeof timeStr === 'string') {
              const parts = timeStr.split(':');
              if (parts.length >= 2) {
                timeStr = `${parts[0]}:${parts[1]}`;
              }
            }
            
            const fullName = `${apt.NombreCliente} ${apt.ApellidoCliente}`.trim();
            await emailService.sendCancellationEmail(apt.CorreoCliente, fullName, dateStr, timeStr);
            console.log(`📧 Novedad: Correo enviado a ${apt.CorreoCliente} por cancelación de agendamiento del ${dateStr} a las ${timeStr}`);
          } catch (emailErr) {
            console.error(`❌ Novedad: Error al enviar correo a ${apt.CorreoCliente}:`, emailErr);
          }
        });
      
      Promise.all(emailPromises).catch(err => {
        console.error('Error sending novelty cancellation emails:', err);
      });
    }

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
