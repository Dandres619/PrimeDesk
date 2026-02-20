const { getPool, sql } = require('../config/db');

const getAll = async () => {
    const pool = await getPool();
    return (await pool.request().query('SELECT * FROM Servicios ORDER BY ID_Servicio')).recordset;
};

const getById = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id).query('SELECT * FROM Servicios WHERE ID_Servicio=@id');
    if (!r.recordset.length) throw { status: 404, message: 'Servicio no encontrado.' };
    return r.recordset[0];
};

const create = async ({ nombre, descripcion }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('nombre', sql.VarChar(100), nombre)
        .input('descripcion', sql.Text, descripcion || null)
        .query('INSERT INTO Servicios (Nombre, Descripcion, Estado) OUTPUT INSERTED.* VALUES (@nombre, @descripcion, 1)');
    return r.recordset[0];
};

const update = async (id, { nombre, descripcion, estado }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id', sql.Int, id)
        .input('nombre', sql.VarChar(100), nombre)
        .input('descripcion', sql.Text, descripcion || null)
        .input('estado', sql.Bit, estado)
        .query('UPDATE Servicios SET Nombre=@nombre, Descripcion=@descripcion, Estado=@estado OUTPUT INSERTED.* WHERE ID_Servicio=@id');
    if (!r.recordset.length) throw { status: 404, message: 'Servicio no encontrado.' };
    return r.recordset[0];
};

const remove = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id)
        .query('DELETE FROM Servicios OUTPUT DELETED.ID_Servicio WHERE ID_Servicio=@id');
    if (!r.recordset.length) throw { status: 404, message: 'Servicio no encontrado.' };
    return { message: 'Servicio eliminado.' };
};

module.exports = { getAll, getById, create, update, remove };
