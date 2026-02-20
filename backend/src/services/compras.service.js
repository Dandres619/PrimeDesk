const { getPool, sql } = require('../config/db');

const getAll = async () => {
    const pool = await getPool();
    return (await pool.request().query(`
    SELECT c.*, p.NombreEmpresa, m.Placa
    FROM Compras c
    INNER JOIN Proveedores p ON c.ID_Proveedor = p.ID_Proveedor
    INNER JOIN Motocicletas m ON c.ID_Motocicleta = m.ID_Motocicleta
    ORDER BY c.FechaCompra DESC
  `)).recordset;
};

const getById = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id).query(`
    SELECT c.*, p.NombreEmpresa, m.Placa
    FROM Compras c
    INNER JOIN Proveedores p ON c.ID_Proveedor = p.ID_Proveedor
    INNER JOIN Motocicletas m ON c.ID_Motocicleta = m.ID_Motocicleta
    WHERE c.ID_Compra = @id
  `);
    if (!r.recordset.length) throw { status: 404, message: 'Compra no encontrada.' };

    const detalle = await pool.request().input('id', sql.Int, id).query(`
    SELECT dc.*, pr.Nombre AS NombreProducto
    FROM Detalle_Compras dc
    INNER JOIN Productos pr ON dc.ID_Producto = pr.ID_Producto
    WHERE dc.ID_Compra = @id
  `);

    return { ...r.recordset[0], detalle: detalle.recordset };
};

const create = async ({ id_proveedor, id_motocicleta, total, notas, detalle }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id_proveedor', sql.Int, id_proveedor)
        .input('id_motocicleta', sql.Int, id_motocicleta)
        .input('total', sql.Decimal(10, 2), total)
        .input('notas', sql.Text, notas || null)
        .query(`
      INSERT INTO Compras (ID_Proveedor, ID_Motocicleta, FechaCompra, Total, Notas, Estado)
      OUTPUT INSERTED.*
      VALUES (@id_proveedor, @id_motocicleta, GETDATE(), @total, @notas, 1)
    `);

    const compra = r.recordset[0];

    if (detalle && detalle.length > 0) {
        for (const item of detalle) {
            await pool.request()
                .input('id_compra', sql.Int, compra.ID_Compra)
                .input('id_producto', sql.Int, item.id_producto)
                .input('cantidad', sql.Int, item.cantidad)
                .input('precio_unitario', sql.Decimal(10, 2), item.precio_unitario)
                .input('subtotal', sql.Decimal(10, 2), item.subtotal)
                .query(`
          INSERT INTO Detalle_Compras (ID_Compra, ID_Producto, Cantidad, PrecioUnitario, Subtotal)
          VALUES (@id_compra, @id_producto, @cantidad, @precio_unitario, @subtotal)
        `);
            // Actualizar stock del producto
            await pool.request()
                .input('id_producto', sql.Int, item.id_producto)
                .input('cantidad', sql.Int, item.cantidad)
                .query('UPDATE Productos SET Cantidad = Cantidad + @cantidad WHERE ID_Producto = @id_producto');
        }
    }

    return compra;
};

const update = async (id, { id_proveedor, id_motocicleta, total, notas, estado }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id', sql.Int, id)
        .input('id_proveedor', sql.Int, id_proveedor)
        .input('id_motocicleta', sql.Int, id_motocicleta)
        .input('total', sql.Decimal(10, 2), total)
        .input('notas', sql.Text, notas || null)
        .input('estado', sql.Bit, estado)
        .query(`
      UPDATE Compras SET ID_Proveedor=@id_proveedor, ID_Motocicleta=@id_motocicleta,
        Total=@total, Notas=@notas, Estado=@estado
      OUTPUT INSERTED.*
      WHERE ID_Compra=@id
    `);
    if (!r.recordset.length) throw { status: 404, message: 'Compra no encontrada.' };
    return r.recordset[0];
};

module.exports = { getAll, getById, create, update };
