const { getPool } = require('../config/db');

const getAll = async (id_cliente = null) => {
  const sql = await getPool();

  if (id_cliente) {
    return await sql`
        SELECT m.id_motocicleta AS "ID_Motocicleta", m.id_cliente AS "ID_Cliente", m.marca AS "Marca", 
               m.modelo AS "Modelo", m.anio AS "Anio", m.placa AS "Placa", m.color AS "Color", 
               m.motor AS "Motor", m.kilometraje AS "Kilometraje", m.estado AS "Estado",
               c.nombre AS "NombreCliente", c.apellido AS "ApellidoCliente"
        FROM motocicletas m
        INNER JOIN clientes c ON m.id_cliente = c.id_cliente
        WHERE m.id_cliente = ${id_cliente} 
        ORDER BY m.id_motocicleta
    `;
  }

  return await sql`
        SELECT m.id_motocicleta AS "ID_Motocicleta", m.id_cliente AS "ID_Cliente", m.marca AS "Marca", 
               m.modelo AS "Modelo", m.anio AS "Anio", m.placa AS "Placa", m.color AS "Color", 
               m.motor AS "Motor", m.kilometraje AS "Kilometraje", m.estado AS "Estado",
               c.nombre AS "NombreCliente", c.apellido AS "ApellidoCliente"
        FROM motocicletas m
        INNER JOIN clientes c ON m.id_cliente = c.id_cliente
        ORDER BY m.id_motocicleta
  `;
};

const getById = async (id) => {
  const sql = await getPool();
  const rows = await sql`
        SELECT m.id_motocicleta AS "ID_Motocicleta", m.id_cliente AS "ID_Cliente", m.marca AS "Marca", 
               m.modelo AS "Modelo", m.anio AS "Anio", m.placa AS "Placa", m.color AS "Color", 
               m.motor AS "Motor", m.kilometraje AS "Kilometraje", m.estado AS "Estado",
               c.nombre AS "NombreCliente", c.apellido AS "ApellidoCliente"
        FROM motocicletas m
        INNER JOIN clientes c ON m.id_cliente = c.id_cliente
        WHERE m.id_motocicleta = ${id}
    `;
  if (rows.length === 0) throw { status: 404, message: 'Motocicleta no encontrada.' };
  return rows[0];
};

const create = async ({ id_cliente, marca, modelo, anio, placa, color, motor, kilometraje }) => {
  const sql = await getPool();
  const [row] = await sql`
        INSERT INTO motocicletas (id_cliente, marca, modelo, anio, placa, color, motor, kilometraje, estado)
        VALUES (${id_cliente}, ${marca}, ${modelo}, ${anio}, ${placa}, ${color}, ${motor}, ${kilometraje || 0}, TRUE)
        RETURNING id_motocicleta AS "ID_Motocicleta", id_cliente AS "ID_Cliente", marca AS "Marca", 
                  modelo AS "Modelo", anio AS "Anio", placa AS "Placa", color AS "Color", 
                  motor AS "Motor", kilometraje AS "Kilometraje", estado AS "Estado"
    `;
  return row;
};

const update = async (id, { id_cliente, marca, modelo, anio, placa, color, motor, kilometraje, estado }) => {
  const sql = await getPool();
  const [row] = await sql`
        UPDATE motocicletas 
        SET id_cliente = ${id_cliente}, marca = ${marca}, modelo = ${modelo},
            anio = ${anio}, placa = ${placa}, color = ${color}, motor = ${motor},
            kilometraje = ${kilometraje}, estado = ${estado}
        WHERE id_motocicleta = ${id}
        RETURNING id_motocicleta AS "ID_Motocicleta", id_cliente AS "ID_Cliente", marca AS "Marca", 
                  modelo AS "Modelo", anio AS "Anio", placa AS "Placa", color AS "Color", 
                  motor AS "Motor", kilometraje AS "Kilometraje", estado AS "Estado"
    `;
  if (!row) throw { status: 404, message: 'Motocicleta no encontrada.' };

  // Si intentan inactivar, verificar dependencias
  if (estado === false) {
    const agendamientos = await sql`SELECT 1 FROM agendamientos WHERE id_motocicleta = ${id} LIMIT 1`;
    const reparaciones = await sql`SELECT 1 FROM reparaciones WHERE id_motocicleta = ${id} LIMIT 1`;
    if (agendamientos.length > 0 || reparaciones.length > 0) {
      // Revertir estado si hay dependencias? O mejor lanzar error antes.
      // Vamos a lanzar error ANTES de actualizar si es posible, o simplemente no permitirlo.
      // Para ser consistente con lo que hicimos antes, lanzamos error si intentan inactivar.
      await sql`UPDATE motocicletas SET estado = TRUE WHERE id_motocicleta = ${id}`;
      throw { status: 400, message: 'No se puede inactivar la motocicleta porque tiene agendamientos o reparaciones asociados.' };
    }
  }

  return row;
};

const remove = async (id) => {
  const sql = await getPool();

  const agendamientos = await sql`SELECT 1 FROM agendamientos WHERE id_motocicleta = ${id} LIMIT 1`;
  const reparaciones = await sql`SELECT 1 FROM reparaciones WHERE id_motocicleta = ${id} LIMIT 1`;

  if (agendamientos.length > 0 || reparaciones.length > 0) {
    throw { status: 400, message: 'No se puede eliminar la motocicleta porque tiene historial de agendamientos o reparaciones. Considere inactivarla.' };
  }

  const [row] = await sql`
        DELETE FROM motocicletas 
        WHERE id_motocicleta = ${id}
        RETURNING id_motocicleta
    `;
  if (!row) throw { status: 404, message: 'Motocicleta no encontrada.' };
  return { message: 'Motocicleta eliminada.' };
};

module.exports = { getAll, getById, create, update, remove };
