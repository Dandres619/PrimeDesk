const { getPool, sql } = require('../config/db');

const getAll = async () => {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Permisos ORDER BY ID_Permiso');
    return result.recordset;
};

const getById = async (id) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Permisos WHERE ID_Permiso = @id');
    if (!result.recordset.length) throw { status: 404, message: 'Permiso no encontrado.' };
    return result.recordset[0];
};

const create = async ({ nombre, descripcion }) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('nombre', sql.VarChar(50), nombre)
        .input('descripcion', sql.Text, descripcion || null)
        .query(`
      INSERT INTO Permisos (Nombre, Descripcion)
      OUTPUT INSERTED.*
      VALUES (@nombre, @descripcion)
    `);
    return result.recordset[0];
};

const update = async (id, { nombre, descripcion }) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('nombre', sql.VarChar(50), nombre)
        .input('descripcion', sql.Text, descripcion || null)
        .query(`
      UPDATE Permisos SET Nombre=@nombre, Descripcion=@descripcion
      OUTPUT INSERTED.*
      WHERE ID_Permiso = @id
    `);
    if (!result.recordset.length) throw { status: 404, message: 'Permiso no encontrado.' };
    return result.recordset[0];
};

const remove = async (id) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Permisos OUTPUT DELETED.ID_Permiso WHERE ID_Permiso = @id');
    if (!result.recordset.length) throw { status: 404, message: 'Permiso no encontrado.' };
    return { message: 'Permiso eliminado.' };
};

module.exports = { getAll, getById, create, update, remove };
