const { getPool } = require('../config/db');

const getAll = async () => {
  const sql = await getPool();
  return await sql`
        SELECT c.id_cliente AS "ID_Cliente", c.id_usuario AS "ID_Usuario", c.nombre AS "Nombre", 
               c.apellido AS "Apellido", c.tipodocumento AS "TipoDocumento", c.documento AS "Documento",
               c.telefono AS "Telefono", c.barrio AS "Barrio", c.direccion AS "Direccion", 
               c.fechanacimiento AS "FechaNacimiento", c.foto AS "Foto", u.correo AS "Correo"
        FROM clientes c
        INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
        ORDER BY c.id_cliente
    `;
};

const getById = async (id) => {
  const sql = await getPool();
  const rows = await sql`
        SELECT c.id_cliente AS "ID_Cliente", c.id_usuario AS "ID_Usuario", c.nombre AS "Nombre", 
               c.apellido AS "Apellido", c.tipodocumento AS "TipoDocumento", c.documento AS "Documento",
               c.telefono AS "Telefono", c.barrio AS "Barrio", c.direccion AS "Direccion", 
               c.fechanacimiento AS "FechaNacimiento", c.foto AS "Foto", u.correo AS "Correo"
        FROM clientes c
        INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE c.id_cliente = ${id}
    `;
  if (rows.length === 0) throw { status: 404, message: 'Cliente no encontrado.' };
  return rows[0];
};

const create = async (data) => {
  const sql = await getPool();
  const { id_usuario, nombre, apellido, tipo_documento, documento, telefono,
    barrio, direccion, fecha_nacimiento, foto } = data;

  const [row] = await sql`
        INSERT INTO clientes (id_usuario, nombre, apellido, tipodocumento, documento,
            telefono, barrio, direccion, fechanacimiento, foto)
        VALUES (${id_usuario}, ${nombre}, ${apellido}, ${tipo_documento}, ${documento},
            ${telefono}, ${barrio}, ${direccion}, ${fecha_nacimiento}, ${foto || null})
        RETURNING id_cliente AS "ID_Cliente", id_usuario AS "ID_Usuario", nombre AS "Nombre", 
                  apellido AS "Apellido", tipodocumento AS "TipoDocumento", documento AS "Documento",
                  telefono AS "Telefono", barrio AS "Barrio", direccion AS "Direccion", 
                  fechanacimiento AS "FechaNacimiento", foto AS "Foto"
    `;
  return row;
};

const update = async (id, data) => {
  const sql = await getPool();
  const { nombre, apellido, tipo_documento, documento, telefono,
    barrio, direccion, fecha_nacimiento, foto } = data;

  const [row] = await sql`
        UPDATE clientes 
        SET nombre = ${nombre}, apellido = ${apellido}, tipodocumento = ${tipo_documento},
            documento = ${documento}, telefono = ${telefono}, barrio = ${barrio}, 
            direccion = ${direccion}, fechanacimiento = ${fecha_nacimiento}, foto = ${foto || null}
        WHERE id_cliente = ${id}
        RETURNING id_cliente AS "ID_Cliente", id_usuario AS "ID_Usuario", nombre AS "Nombre", 
                  apellido AS "Apellido", tipodocumento AS "TipoDocumento", documento AS "Documento",
                  telefono AS "Telefono", barrio AS "Barrio", direccion AS "Direccion", 
                  fechanacimiento AS "FechaNacimiento", foto AS "Foto"
    `;
  if (!row) throw { status: 404, message: 'Cliente no encontrado.' };
  return row;
};

const remove = async (id) => {
  const sql = await getPool();
  const [row] = await sql`
        DELETE FROM clientes 
        WHERE id_cliente = ${id}
        RETURNING id_cliente
    `;
  if (!row) throw { status: 404, message: 'Cliente no encontrado.' };
  return { message: 'Cliente eliminado.' };
};

module.exports = { getAll, getById, create, update, remove };
