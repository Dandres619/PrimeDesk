const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');

const getAll = async () => {
  const sql = await getPool();
  return await sql`
        SELECT u.id_usuario AS "ID_Usuario", u.correo AS "Correo", u.estado AS "Estado", u.id_rol AS "ID_Rol", r.nombre AS "NombreRol"
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        ORDER BY u.id_usuario
    `;
};

const getById = async (id) => {
  const sql = await getPool();
  const rows = await sql`
        SELECT u.id_usuario AS "ID_Usuario", u.correo AS "Correo", u.estado AS "Estado", u.id_rol AS "ID_Rol", r.nombre AS "NombreRol"
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
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

const update = async (id, { id_rol, correo, estado }) => {
  const sql = await getPool();
  const [row] = await sql`
        UPDATE usuarios 
        SET id_rol = ${id_rol}, correo = ${correo}, estado = ${estado}
        WHERE id_usuario = ${id}
        RETURNING id_usuario AS "ID_Usuario", correo AS "Correo", id_rol AS "ID_Rol", estado AS "Estado"
    `;
  if (!row) throw { status: 404, message: 'Usuario no encontrado.' };
  return row;
};

const toggleEstado = async (id) => {
  const sql = await getPool();
  const [row] = await sql`
        UPDATE usuarios 
        SET estado = NOT estado
        WHERE id_usuario = ${id}
        RETURNING id_usuario AS "ID_Usuario", estado AS "Estado"
    `;
  if (!row) throw { status: 404, message: 'Usuario no encontrado.' };
  return row;
};

module.exports = { getAll, getById, create, update, toggleEstado };
