const { getPool } = require('../config/db');

const getAll = async () => {
  const sql = await getPool();
  const rows = await sql`
        SELECT c.id_compra AS "ID_Compra", c.id_proveedor AS "ID_Proveedor", 
               c.id_motocicleta AS "ID_Motocicleta", c.fechacompra AS "FechaCompra", 
               c.total AS "Total", c.notas AS "Notas", c.estado AS "Estado",
               p.nombreempresa AS "NombreEmpresa", p.telefono AS "TelefonoProveedor", p.email AS "EmailProveedor", m.placa AS "Placa"
        FROM compras c
        INNER JOIN proveedores p ON c.id_proveedor = p.id_proveedor
        INNER JOIN motocicletas m ON c.id_motocicleta = m.id_motocicleta
        ORDER BY c.fechacompra DESC
    `;
  return rows;
};

const getById = async (id) => {
  const sql = await getPool();
  const purchases = await sql`
        SELECT c.id_compra AS "ID_Compra", c.id_proveedor AS "ID_Proveedor", 
               c.id_motocicleta AS "ID_Motocicleta", c.fechacompra AS "FechaCompra", 
               c.total AS "Total", c.notas AS "Notas", c.estado AS "Estado",
               p.nombreempresa AS "NombreEmpresa", p.telefono AS "TelefonoProveedor", p.email AS "EmailProveedor", m.placa AS "Placa"
        FROM compras c
        INNER JOIN proveedores p ON c.id_proveedor = p.id_proveedor
        INNER JOIN motocicletas m ON c.id_motocicleta = m.id_motocicleta
        WHERE c.id_compra = ${id}
    `;
  if (purchases.length === 0) throw { status: 404, message: 'Compra no encontrada.' };

  const detail = await sql`
        SELECT dc.id_detallecompra AS "ID_DetalleCompra", dc.id_compra AS "ID_Compra", 
               dc.id_producto AS "ID_Producto", dc.cantidad AS "Cantidad", 
               dc.preciounitario AS "PrecioUnitario", dc.subtotal AS "Subtotal",
               pr.nombre AS "NombreProducto", cat.nombre AS "NombreCategoria"
        FROM detalle_compras dc
        INNER JOIN productos pr ON dc.id_producto = pr.id_producto
        INNER JOIN categorias_productos cat ON pr.id_categoria = cat.id_categoria
        WHERE dc.id_compra = ${id}
    `;

  return { ...purchases[0], detalle: detail };
};

const create = async ({ id_proveedor, id_motocicleta, fechacompra, total, notas, detalle }) => {
  const sql = await getPool();

  try {
    const result = await sql.begin(async (tx) => {
      const [compra] = await tx`
                INSERT INTO compras (id_proveedor, id_motocicleta, fechacompra, total, notas, estado)
                VALUES (${id_proveedor}, ${id_motocicleta}, COALESCE(${fechacompra || null}::timestamp, NOW()), ${total}, ${notas || null}, 'Pendiente de venta')
                RETURNING id_compra AS "ID_Compra"
            `;

      if (detalle && detalle.length > 0) {
        const itemInserts = detalle.map(item => ({
          id_compra: compra.ID_Compra,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          preciounitario: item.precio_unitario,
          subtotal: item.subtotal
        }));

        await tx`INSERT INTO detalle_compras ${sql(itemInserts, 'id_compra', 'id_producto', 'cantidad', 'preciounitario', 'subtotal')}`;

        // Actualizar stock de los productos a 0 según requerimiento especial
        for (const item of detalle) {
          await tx`
                        UPDATE productos 
                        SET cantidad = 0 
                        WHERE id_producto = ${item.id_producto}
                    `;
        }
      }

      return compra;
    });

    return result;
  } catch (err) {
    console.error('Error al crear compra:', err);
    throw err;
  }
};

const update = async (id, { id_proveedor, id_motocicleta, total, notas, estado }) => {
  const sql = await getPool();
  const [row] = await sql`
        UPDATE compras 
        SET id_proveedor = ${id_proveedor}, id_motocicleta = ${id_motocicleta},
            total = ${total}, notas = ${notas || null}, estado = ${estado}
        WHERE id_compra = ${id}
        RETURNING id_compra AS "ID_Compra"
    `;
  if (!row) throw { status: 404, message: 'Compra no encontrada.' };
  return row;
};

const remove = async (id) => {
  const sql = await getPool();

  // 1. Validar que la compra no esté asociada a una venta
  const association = await sql`SELECT 1 FROM ventas_compras WHERE id_compra = ${id} LIMIT 1`;
  if (association.length > 0) {
    throw { status: 400, message: 'No se puede anular la compra porque ya está asociada a una venta.' };
  }

  // 2. Anular la compra y revertir el stock de productos
  try {
    await sql.begin(async (tx) => {
      // Marcar compra como anulada
      await tx`UPDATE compras SET estado = 'Anulado' WHERE id_compra = ${id}`;
    });
    return { message: 'Compra anulada y stock actualizado.' };
  } catch (err) {
    console.error('Error al anular compra:', err);
    throw err;
  }
};

module.exports = { getAll, getById, create, update, remove };
