const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');

const getAll = async () => {
  const sql = await getPool();
  return await sql`
        SELECT 
          u.id_usuario AS "ID_Usuario", 
          u.correo AS "Correo", 
          u.estado AS "Estado", 
          u.id_rol AS "ID_Rol", 
          r.nombre AS "NombreRol",
          COALESCE(e.nombre, c.nombre) AS "Nombre",
          COALESCE(e.apellido, c.apellido) AS "Apellido",
          COALESCE(e.foto, c.foto) AS "Foto"
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        LEFT JOIN empleados e ON u.id_usuario = e.id_usuario
        LEFT JOIN clientes c ON u.id_usuario = c.id_usuario
        ORDER BY u.id_usuario DESC
    `;
};

const getById = async (id) => {
  const sql = await getPool();
  const rows = await sql`
        SELECT 
          u.id_usuario AS "ID_Usuario", 
          u.correo AS "Correo", 
          u.estado AS "Estado", 
          u.id_rol AS "ID_Rol", 
          r.nombre AS "NombreRol",
          COALESCE(e.nombre, c.nombre) AS "Nombre",
          COALESCE(e.apellido, c.apellido) AS "Apellido",
          COALESCE(e.foto, c.foto) AS "Foto"
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        LEFT JOIN empleados e ON u.id_usuario = e.id_usuario
        LEFT JOIN clientes c ON u.id_usuario = c.id_usuario
        WHERE u.id_usuario = ${id}
    `;
  if (rows.length === 0) throw { status: 404, message: 'Usuario no encontrado.' };
  return rows[0];
};

const create = async ({ correo, contrasena, id_rol }) => {
  const sql = await getPool();
  const existing = await sql`SELECT id_usuario FROM usuarios WHERE correo = ${correo}`;
  if (existing.length > 0) throw { status: 409, message: 'El correo ya existe.' };

  const hashed = await bcrypt.hash(contrasena, 10);
  const [row] = await sql`
        INSERT INTO usuarios (id_rol, correo, contrasena, estado)
        VALUES (${id_rol}, ${correo}, ${hashed}, TRUE)
        RETURNING id_usuario AS "ID_Usuario", correo AS "Correo", id_rol AS "ID_Rol", estado AS "Estado"
    `;
  return row;
};

const update = async (id, { id_rol, correo, estado, contrasena }) => {
  const sql = await getPool();

  // Si se intenta desactivar
  if (estado === false || estado === 0) {
    // 1. Verificar si es un empleado con agendamientos
    const [emp] = await sql`SELECT id_empleado FROM empleados WHERE id_usuario = ${id}`;
    if (emp) {
      const agendamientos = await sql`SELECT COUNT(*) FROM agendamientos WHERE id_empleado = ${emp.id_empleado}`;
      if (parseInt(agendamientos[0].count) > 0) {
        throw { status: 400, message: 'No se puede inactivar este usuario porque tiene agendamientos asignados.' };
      }
    }
  }

  let hashed = null;
  if (contrasena) {
    hashed = await bcrypt.hash(contrasena, 10);
  }

  const [row] = await sql`
        UPDATE usuarios 
        SET 
          id_rol = COALESCE(${id_rol ?? null}, id_rol), 
          correo = COALESCE(${correo ?? null}, correo), 
          estado = COALESCE(${estado ?? null}, estado)
          ${hashed ? sql`, contrasena = ${hashed}` : sql``}
        WHERE id_usuario = ${id}
        RETURNING id_usuario AS "ID_Usuario", correo AS "Correo", id_rol AS "ID_Rol", estado AS "Estado"
    `;
  if (!row) throw { status: 404, message: 'Usuario no encontrado.' };
  return row;
};

const toggleEstado = async (id) => {
  const sql = await getPool();

  // Obtener estado actual
  const [user] = await sql`SELECT estado FROM usuarios WHERE id_usuario = ${id}`;
  if (!user) throw { status: 404, message: 'Usuario no encontrado.' };

  // Si se va a desactivar (estado actual es true)
  if (user.estado) {
    const [emp] = await sql`SELECT id_empleado FROM empleados WHERE id_usuario = ${id}`;
    if (emp) {
      const agendamientos = await sql`SELECT COUNT(*) FROM agendamientos WHERE id_empleado = ${emp.id_empleado}`;
      if (parseInt(agendamientos[0].count) > 0) {
        throw { status: 400, message: 'No se puede inactivar este usuario porque tiene agendamientos asignados.' };
      }
    }
  }

  const [row] = await sql`
        UPDATE usuarios 
        SET estado = NOT estado
        WHERE id_usuario = ${id}
        RETURNING id_usuario AS "ID_Usuario", estado AS "Estado"
    `;
  return row;
};

module.exports = { getAll, getById, create, update, toggleEstado };
