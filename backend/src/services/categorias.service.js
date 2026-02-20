const { getPool, sql } = require('../config/db');

// --- Categorias ---
const getAllCategorias = async () => {
    const pool = await getPool();
    return (await pool.request().query('SELECT * FROM Categorias_Productos ORDER BY ID_Categoria')).recordset;
};

const getCategoriaById = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id).query('SELECT * FROM Categorias_Productos WHERE ID_Categoria = @id');
    if (!r.recordset.length) throw { status: 404, message: 'Categoría no encontrada.' };
    return r.recordset[0];
};

const createCategoria = async ({ nombre, descripcion }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('nombre', sql.VarChar(30), nombre)
        .input('descripcion', sql.Text, descripcion || null)
        .query('INSERT INTO Categorias_Productos (Nombre, Descripcion, Estado) OUTPUT INSERTED.* VALUES (@nombre, @descripcion, 1)');
    return r.recordset[0];
};

const updateCategoria = async (id, { nombre, descripcion, estado }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id', sql.Int, id).input('nombre', sql.VarChar(30), nombre)
        .input('descripcion', sql.Text, descripcion || null).input('estado', sql.Bit, estado)
        .query('UPDATE Categorias_Productos SET Nombre=@nombre, Descripcion=@descripcion, Estado=@estado OUTPUT INSERTED.* WHERE ID_Categoria=@id');
    if (!r.recordset.length) throw { status: 404, message: 'Categoría no encontrada.' };
    return r.recordset[0];
};

const deleteCategoria = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id)
        .query('DELETE FROM Categorias_Productos OUTPUT DELETED.ID_Categoria WHERE ID_Categoria=@id');
    if (!r.recordset.length) throw { status: 404, message: 'Categoría no encontrada.' };
    return { message: 'Categoría eliminada.' };
};

module.exports = { getAllCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria };
