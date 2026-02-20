const { getPool, sql } = require('../config/db');

const getAll = async (id_cliente = null) => {
    const pool = await getPool();
    const request = pool.request();
    let query = `
    SELECT m.*, c.Nombre AS NombreCliente, c.Apellido AS ApellidoCliente
    FROM Motocicletas m
    INNER JOIN Clientes c ON m.ID_Cliente = c.ID_Cliente
  `;
    if (id_cliente) {
        request.input('id_cliente', sql.Int, id_cliente);
        query += ' WHERE m.ID_Cliente = @id_cliente';
    }
    query += ' ORDER BY m.ID_Motocicleta';
    return (await request.query(query)).recordset;
};

const getById = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id).query(`
    SELECT m.*, c.Nombre AS NombreCliente, c.Apellido AS ApellidoCliente
    FROM Motocicletas m
    INNER JOIN Clientes c ON m.ID_Cliente = c.ID_Cliente
    WHERE m.ID_Motocicleta = @id
  `);
    if (!r.recordset.length) throw { status: 404, message: 'Motocicleta no encontrada.' };
    return r.recordset[0];
};

const create = async ({ id_cliente, marca, modelo, anio, placa, color, motor, kilometraje }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id_cliente', sql.Int, id_cliente)
        .input('marca', sql.VarChar(50), marca)
        .input('modelo', sql.VarChar(50), modelo)
        .input('anio', sql.Int, anio)
        .input('placa', sql.VarChar(10), placa)
        .input('color', sql.VarChar(20), color)
        .input('motor', sql.Int, motor)
        .input('kilometraje', sql.Int, kilometraje || 0)
        .query(`
      INSERT INTO Motocicletas (ID_Cliente, Marca, Modelo, Anio, Placa, Color, Motor, Kilometraje, Estado)
      OUTPUT INSERTED.*
      VALUES (@id_cliente, @marca, @modelo, @anio, @placa, @color, @motor, @kilometraje, 1)
    `);
    return r.recordset[0];
};

const update = async (id, { id_cliente, marca, modelo, anio, placa, color, motor, kilometraje, estado }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id', sql.Int, id)
        .input('id_cliente', sql.Int, id_cliente)
        .input('marca', sql.VarChar(50), marca)
        .input('modelo', sql.VarChar(50), modelo)
        .input('anio', sql.Int, anio)
        .input('placa', sql.VarChar(10), placa)
        .input('color', sql.VarChar(20), color)
        .input('motor', sql.Int, motor)
        .input('kilometraje', sql.Int, kilometraje)
        .input('estado', sql.Bit, estado)
        .query(`
      UPDATE Motocicletas SET ID_Cliente=@id_cliente, Marca=@marca, Modelo=@modelo,
        Anio=@anio, Placa=@placa, Color=@color, Motor=@motor,
        Kilometraje=@kilometraje, Estado=@estado
      OUTPUT INSERTED.*
      WHERE ID_Motocicleta=@id
    `);
    if (!r.recordset.length) throw { status: 404, message: 'Motocicleta no encontrada.' };
    return r.recordset[0];
};

const remove = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id)
        .query('DELETE FROM Motocicletas OUTPUT DELETED.ID_Motocicleta WHERE ID_Motocicleta=@id');
    if (!r.recordset.length) throw { status: 404, message: 'Motocicleta no encontrada.' };
    return { message: 'Motocicleta eliminada.' };
};

module.exports = { getAll, getById, create, update, remove };
