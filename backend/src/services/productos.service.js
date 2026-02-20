const { getPool, sql } = require('../config/db');

const getAll = async () => {
    const pool = await getPool();
    const r = await pool.request().query(`
    SELECT p.*, c.Nombre AS NombreCategoria
    FROM Productos p
    INNER JOIN Categorias_Productos c ON p.ID_Categoria = c.ID_Categoria
    ORDER BY p.ID_Producto
  `);
    return r.recordset;
};

const getById = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id).query(`
    SELECT p.*, c.Nombre AS NombreCategoria
    FROM Productos p
    INNER JOIN Categorias_Productos c ON p.ID_Categoria = c.ID_Categoria
    WHERE p.ID_Producto = @id
  `);
    if (!r.recordset.length) throw { status: 404, message: 'Producto no encontrado.' };
    return r.recordset[0];
};

const create = async ({ id_categoria, nombre, marca, cantidad, descripcion }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id_categoria', sql.Int, id_categoria)
        .input('nombre', sql.VarChar(60), nombre)
        .input('marca', sql.VarChar(40), marca)
        .input('cantidad', sql.Int, cantidad || 0)
        .input('descripcion', sql.Text, descripcion || null)
        .query(`
      INSERT INTO Productos (ID_Categoria, Nombre, Marca, Cantidad, Descripcion, Estado)
      OUTPUT INSERTED.*
      VALUES (@id_categoria, @nombre, @marca, @cantidad, @descripcion, 1)
    `);
    return r.recordset[0];
};

const update = async (id, { id_categoria, nombre, marca, cantidad, descripcion, estado }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id', sql.Int, id)
        .input('id_categoria', sql.Int, id_categoria)
        .input('nombre', sql.VarChar(60), nombre)
        .input('marca', sql.VarChar(40), marca)
        .input('cantidad', sql.Int, cantidad)
        .input('descripcion', sql.Text, descripcion || null)
        .input('estado', sql.Bit, estado)
        .query(`
      UPDATE Productos SET ID_Categoria=@id_categoria, Nombre=@nombre, Marca=@marca,
        Cantidad=@cantidad, Descripcion=@descripcion, Estado=@estado
      OUTPUT INSERTED.*
      WHERE ID_Producto = @id
    `);
    if (!r.recordset.length) throw { status: 404, message: 'Producto no encontrado.' };
    return r.recordset[0];
};

const updateStock = async (id, cantidad) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id', sql.Int, id)
        .input('cantidad', sql.Int, cantidad)
        .query('UPDATE Productos SET Cantidad=@cantidad OUTPUT INSERTED.ID_Producto, INSERTED.Cantidad WHERE ID_Producto=@id');
    if (!r.recordset.length) throw { status: 404, message: 'Producto no encontrado.' };
    return r.recordset[0];
};

const remove = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id)
        .query('DELETE FROM Productos OUTPUT DELETED.ID_Producto WHERE ID_Producto=@id');
    if (!r.recordset.length) throw { status: 404, message: 'Producto no encontrado.' };
    return { message: 'Producto eliminado.' };
};

module.exports = { getAll, getById, create, update, updateStock, remove };
