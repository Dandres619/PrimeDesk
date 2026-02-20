const { getPool, sql } = require('../config/db');

const getAll = async () => {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Roles ORDER BY ID_Rol');
    return result.recordset;
};

const getById = async (id) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Roles WHERE ID_Rol = @id');
    if (!result.recordset.length) throw { status: 404, message: 'Rol no encontrado.' };
    return result.recordset[0];
};

const create = async ({ nombre, descripcion }) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('nombre', sql.VarChar(50), nombre)
        .input('descripcion', sql.Text, descripcion || null)
        .query(`
      INSERT INTO Roles (Nombre, Descripcion, Estado)
      OUTPUT INSERTED.*
      VALUES (@nombre, @descripcion, 1)
    `);
    return result.recordset[0];
};

const update = async (id, { nombre, descripcion, estado }) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('nombre', sql.VarChar(50), nombre)
        .input('descripcion', sql.Text, descripcion || null)
        .input('estado', sql.Bit, estado)
        .query(`
      UPDATE Roles SET Nombre=@nombre, Descripcion=@descripcion, Estado=@estado
      OUTPUT INSERTED.*
      WHERE ID_Rol = @id
    `);
    if (!result.recordset.length) throw { status: 404, message: 'Rol no encontrado.' };
    return result.recordset[0];
};

const remove = async (id) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Roles OUTPUT DELETED.ID_Rol WHERE ID_Rol = @id');
    if (!result.recordset.length) throw { status: 404, message: 'Rol no encontrado.' };
    return { message: 'Rol eliminado.' };
};

// Gestión de permisos de un rol
const getPermisosByRol = async (id_rol) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id_rol', sql.Int, id_rol)
        .query(`
      SELECT p.ID_Permiso, p.Nombre, p.Descripcion
      FROM Roles_Permisos rp
      INNER JOIN Permisos p ON rp.ID_Permiso = p.ID_Permiso
      WHERE rp.ID_Rol = @id_rol
    `);
    return result.recordset;
};

const asignarPermiso = async (id_rol, id_permiso) => {
    const pool = await getPool();
    // Verificar si ya existe
    const exists = await pool.request()
        .input('id_rol', sql.Int, id_rol)
        .input('id_permiso', sql.Int, id_permiso)
        .query('SELECT 1 FROM Roles_Permisos WHERE ID_Rol=@id_rol AND ID_Permiso=@id_permiso');
    if (exists.recordset.length > 0) throw { status: 409, message: 'El permiso ya está asignado a este rol.' };
    await pool.request()
        .input('id_rol', sql.Int, id_rol)
        .input('id_permiso', sql.Int, id_permiso)
        .query('INSERT INTO Roles_Permisos (ID_Rol, ID_Permiso) VALUES (@id_rol, @id_permiso)');
    return { message: 'Permiso asignado correctamente.' };
};

const quitarPermiso = async (id_rol, id_permiso) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id_rol', sql.Int, id_rol)
        .input('id_permiso', sql.Int, id_permiso)
        .query('DELETE FROM Roles_Permisos OUTPUT DELETED.ID_RolPermiso WHERE ID_Rol=@id_rol AND ID_Permiso=@id_permiso');
    if (!result.recordset.length) throw { status: 404, message: 'Asignación no encontrada.' };
    return { message: 'Permiso removido del rol.' };
};

module.exports = { getAll, getById, create, update, remove, getPermisosByRol, asignarPermiso, quitarPermiso };
