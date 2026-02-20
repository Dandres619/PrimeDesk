const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/db');

const getAll = async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
    SELECT u.ID_Usuario, u.Correo, u.Estado, u.ID_Rol, r.Nombre AS NombreRol
    FROM Usuarios u
    INNER JOIN Roles r ON u.ID_Rol = r.ID_Rol
    ORDER BY u.ID_Usuario
  `);
    return result.recordset;
};

const getById = async (id) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
      SELECT u.ID_Usuario, u.Correo, u.Estado, u.ID_Rol, r.Nombre AS NombreRol
      FROM Usuarios u
      INNER JOIN Roles r ON u.ID_Rol = r.ID_Rol
      WHERE u.ID_Usuario = @id
    `);
    if (!result.recordset.length) throw { status: 404, message: 'Usuario no encontrado.' };
    return result.recordset[0];
};

const create = async ({ correo, contrasena, id_rol }) => {
    const pool = await getPool();
    const existing = await pool.request()
        .input('correo', sql.VarChar(255), correo)
        .query('SELECT ID_Usuario FROM Usuarios WHERE Correo = @correo');
    if (existing.recordset.length) throw { status: 409, message: 'El correo ya existe.' };

    const hashed = await bcrypt.hash(contrasena, 10);
    const result = await pool.request()
        .input('id_rol', sql.Int, id_rol)
        .input('correo', sql.VarChar(255), correo)
        .input('contrasena', sql.VarChar(255), hashed)
        .query(`
      INSERT INTO Usuarios (ID_Rol, Correo, Contrasena, Estado)
      OUTPUT INSERTED.ID_Usuario, INSERTED.Correo, INSERTED.ID_Rol, INSERTED.Estado
      VALUES (@id_rol, @correo, @contrasena, 1)
    `);
    return result.recordset[0];
};

const update = async (id, { id_rol, correo, estado }) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('id_rol', sql.Int, id_rol)
        .input('correo', sql.VarChar(255), correo)
        .input('estado', sql.Bit, estado)
        .query(`
      UPDATE Usuarios SET ID_Rol=@id_rol, Correo=@correo, Estado=@estado
      OUTPUT INSERTED.ID_Usuario, INSERTED.Correo, INSERTED.ID_Rol, INSERTED.Estado
      WHERE ID_Usuario = @id
    `);
    if (!result.recordset.length) throw { status: 404, message: 'Usuario no encontrado.' };
    return result.recordset[0];
};

const toggleEstado = async (id) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
      UPDATE Usuarios SET Estado = ~Estado
      OUTPUT INSERTED.ID_Usuario, INSERTED.Estado
      WHERE ID_Usuario = @id
    `);
    if (!result.recordset.length) throw { status: 404, message: 'Usuario no encontrado.' };
    return result.recordset[0];
};

module.exports = { getAll, getById, create, update, toggleEstado };
