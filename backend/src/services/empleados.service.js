const { getPool } = require('../config/db');

const getAll = async () => {
  const sql = await getPool();
  return await sql`
        SELECT e.id_empleado AS "ID_Empleado", e.id_usuario AS "ID_Usuario", e.nombre AS "Nombre", 
               e.apellido AS "Apellido", e.tipodocumento AS "TipoDocumento", e.documento AS "Documento",
               e.telefono AS "Telefono", e.barrio AS "Barrio", e.direccion AS "Direccion", 
               e.fechanacimiento AS "FechaNacimiento", e.fechaingreso AS "FechaIngreso", 
               e.foto AS "Foto", u.correo AS "Correo", r.nombre AS "NombreRol"
        FROM empleados e
        INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
        INNER JOIN roles r ON u.id_rol = r.id_rol
        ORDER BY e.id_empleado
    `;
};

const getById = async (id) => {
  const sql = await getPool();
  const rows = await sql`
        SELECT e.id_empleado AS "ID_Empleado", e.id_usuario AS "ID_Usuario", e.nombre AS "Nombre", 
               e.apellido AS "Apellido", e.tipodocumento AS "TipoDocumento", e.documento AS "Documento",
               e.telefono AS "Telefono", e.barrio AS "Barrio", e.direccion AS "Direccion", 
               e.fechanacimiento AS "FechaNacimiento", e.fechaingreso AS "FechaIngreso", 
               e.foto AS "Foto", u.correo AS "Correo", r.nombre AS "NombreRol"
        FROM empleados e
        INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE e.id_empleado = ${id}
    `;
  if (rows.length === 0) throw { status: 404, message: 'Empleado no encontrado.' };
  return rows[0];
};

const create = async (data) => {
  const sql = await getPool();
  const { id_usuario, nombre, apellido, tipo_documento, documento, telefono,
    barrio, direccion, fecha_nacimiento, fecha_ingreso, foto } = data;

  const [row] = await sql`
        INSERT INTO empleados (id_usuario, nombre, apellido, tipodocumento, documento,
            telefono, barrio, direccion, fechanacimiento, fechaingreso, foto)
        VALUES (${id_usuario}, ${nombre}, ${apellido}, ${tipo_documento}, ${documento},
            ${telefono}, ${barrio}, ${direccion}, ${fecha_nacimiento}, ${fecha_ingreso || new Date()}, ${foto || null})
        RETURNING id_empleado AS "ID_Empleado", id_usuario AS "ID_Usuario", nombre AS "Nombre", 
                  apellido AS "Apellido", tipodocumento AS "TipoDocumento", documento AS "Documento",
                  telefono AS "Telefono", barrio AS "Barrio", direccion AS "Direccion", 
                  fechanacimiento AS "FechaNacimiento", fechaingreso AS "FechaIngreso", foto AS "Foto"
    `;
  return row;
};

const update = async (id, data) => {
  const sql = await getPool();
  const { nombre, apellido, tipo_documento, documento, telefono,
    barrio, direccion, fecha_nacimiento, foto } = data;

  const [row] = await sql`
        UPDATE empleados 
        SET nombre = ${nombre}, apellido = ${apellido}, tipodocumento = ${tipo_documento},
            documento = ${documento}, telefono = ${telefono}, barrio = ${barrio}, 
            direccion = ${direccion}, fechanacimiento = ${fecha_nacimiento}, foto = ${foto || null}
        WHERE id_empleado = ${id}
        RETURNING id_empleado AS "ID_Empleado", id_usuario AS "ID_Usuario", nombre AS "Nombre", 
                  apellido AS "Apellido", tipodocumento AS "TipoDocumento", documento AS "Documento",
                  telefono AS "Telefono", barrio AS "Barrio", direccion AS "Direccion", 
                  fechanacimiento AS "FechaNacimiento", fechaingreso AS "FechaIngreso", foto AS "Foto"
    `;
  if (!row) throw { status: 404, message: 'Empleado no encontrado.' };
  return row;
};

const remove = async (id) => {
  const sql = await getPool();
  const [row] = await sql`
        DELETE FROM empleados 
        WHERE id_empleado = ${id}
        RETURNING id_empleado
    `;
  if (!row) throw { status: 404, message: 'Empleado no encontrado.' };
  return { message: 'Empleado eliminado.' };
};

module.exports = { getAll, getById, create, update, remove };
