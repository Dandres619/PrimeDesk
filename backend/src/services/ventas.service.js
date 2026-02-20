const { getPool, sql } = require('../config/db');

const getAll = async () => {
    const pool = await getPool();
    return (await pool.request().query(`
    SELECT v.*,
      e.Nombre AS NombreEmpleado, e.Apellido AS ApellidoEmpleado,
      m.Placa, m.Marca AS MarcaMoto
    FROM Ventas v
    INNER JOIN Empleados e ON v.ID_Empleado = e.ID_Empleado
    INNER JOIN Motocicletas m ON v.ID_Motocicleta = m.ID_Motocicleta
    ORDER BY v.Fecha DESC
  `)).recordset;
};

const getById = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id).query(`
    SELECT v.*,
      e.Nombre AS NombreEmpleado, e.Apellido AS ApellidoEmpleado,
      m.Placa, m.Marca AS MarcaMoto
    FROM Ventas v
    INNER JOIN Empleados e ON v.ID_Empleado = e.ID_Empleado
    INNER JOIN Motocicletas m ON v.ID_Motocicleta = m.ID_Motocicleta
    WHERE v.ID_Venta = @id
  `);
    if (!r.recordset.length) throw { status: 404, message: 'Venta no encontrada.' };

    const servicios = await pool.request().input('id', sql.Int, id).query(`
    SELECT vs.*, s.Nombre AS NombreServicio
    FROM Ventas_Servicios vs
    INNER JOIN Servicios s ON vs.ID_Servicio = s.ID_Servicio
    WHERE vs.ID_Venta = @id
  `);

    const compras = await pool.request().input('id', sql.Int, id).query(`
    SELECT vc.*, c.FechaCompra, c.Total AS TotalCompra
    FROM Ventas_Compras vc
    INNER JOIN Compras c ON vc.ID_Compra = c.ID_Compra
    WHERE vc.ID_Venta = @id
  `);

    return { ...r.recordset[0], servicios: servicios.recordset, compras: compras.recordset };
};

const create = async ({ id_reparacion, id_empleado, id_motocicleta, total, observaciones, servicios, compras }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id_reparacion', sql.Int, id_reparacion)
        .input('id_empleado', sql.Int, id_empleado)
        .input('id_motocicleta', sql.Int, id_motocicleta)
        .input('total', sql.Decimal(10, 2), total)
        .input('observaciones', sql.Text, observaciones || null)
        .query(`
      INSERT INTO Ventas (ID_Reparacion, ID_Empleado, ID_Motocicleta, Fecha, Total, Observaciones, Estado)
      OUTPUT INSERTED.*
      VALUES (@id_reparacion, @id_empleado, @id_motocicleta, GETDATE(), @total, @observaciones, 1)
    `);

    const venta = r.recordset[0];

    if (servicios && servicios.length > 0) {
        for (const svc of servicios) {
            await pool.request()
                .input('id_venta', sql.Int, venta.ID_Venta)
                .input('id_servicio', sql.Int, svc.id_servicio)
                .input('costo', sql.Decimal(10, 2), svc.costo)
                .query('INSERT INTO Ventas_Servicios (ID_Venta, ID_Servicio, CostoServicios) VALUES (@id_venta, @id_servicio, @costo)');
        }
    }

    if (compras && compras.length > 0) {
        for (const comp of compras) {
            await pool.request()
                .input('id_venta', sql.Int, venta.ID_Venta)
                .input('id_compra', sql.Int, comp.id_compra)
                .input('subtotal', sql.Decimal(10, 2), comp.subtotal)
                .query('INSERT INTO Ventas_Compras (ID_Venta, ID_Compra, Subtotal) VALUES (@id_venta, @id_compra, @subtotal)');
        }
    }

    return venta;
};

const update = async (id, { total, observaciones, estado }) => {
    const pool = await getPool();
    const r = await pool.request()
        .input('id', sql.Int, id)
        .input('total', sql.Decimal(10, 2), total)
        .input('observaciones', sql.Text, observaciones || null)
        .input('estado', sql.Bit, estado)
        .query(`
      UPDATE Ventas SET Total=@total, Observaciones=@observaciones, Estado=@estado
      OUTPUT INSERTED.*
      WHERE ID_Venta=@id
    `);
    if (!r.recordset.length) throw { status: 404, message: 'Venta no encontrada.' };
    return r.recordset[0];
};

module.exports = { getAll, getById, create, update };
