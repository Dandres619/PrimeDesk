const { getPool } = require('../config/db');

const getAll = async () => {
  const sql = await getPool();
  const rows = await sql`
        SELECT v.id_venta AS "ID_Venta", v.id_reparacion AS "ID_Reparacion", 
               v.id_empleado AS "ID_Empleado", v.id_motocicleta AS "ID_Motocicleta", 
               v.fecha AS "Fecha", v.total AS "Total", v.observaciones AS "Observaciones", 
               v.estado AS "Estado",
               e.nombre AS "NombreEmpleado", e.apellido AS "ApellidoEmpleado",
               m.placa AS "Placa", m.marca AS "MarcaMoto", m.modelo AS "ModeloMoto", m.anio AS "AnioMoto",
               c.nombre AS "NombreCliente", c.apellido AS "ApellidoCliente", c.telefono AS "TelefonoCliente", 
               c.documento AS "DocumentoCliente", '' AS "EmailCliente", c.direccion AS "DireccionCliente",
                (
                  SELECT COALESCE(json_agg(s.nombre), '[]'::json)
                  FROM reparaciones_servicios rs
                  JOIN servicios s ON rs.id_servicio = s.id_servicio
                  WHERE rs.id_reparacion = v.id_reparacion
                ) AS "TiposServicio",
                (
                  SELECT COALESCE(SUM(s.precio), 0)
                  FROM reparaciones_servicios rs
                  JOIN servicios s ON rs.id_servicio = s.id_servicio
                  WHERE rs.id_reparacion = v.id_reparacion
                ) AS "CostoServicios",
                 (
                   SELECT COALESCE(json_agg(json_build_object(
                      'NombreServicio', s.nombre,
                      'CostoServicios', s.precio
                   )), '[]'::json)
                   FROM reparaciones_servicios rs
                   JOIN servicios s ON rs.id_servicio = s.id_servicio
                   WHERE rs.id_reparacion = v.id_reparacion
                 ) AS "servicios",
                (
                  SELECT COALESCE(json_agg(json_build_object(
                     'id', p.id_producto,
                     'product', p.nombre, 
                     'category', cat.nombre,
                     'quantity', dc.cantidad, 
                     'unitCost', dc.preciounitario, 
                     'total', dc.subtotal,
                     'purchaseInvoice', CONCAT('COMP-', c_ref.id_compra)
                  )), '[]'::json)
                  FROM compras c_ref
                  JOIN detalle_compras dc ON c_ref.id_compra = dc.id_compra
                  JOIN productos p ON dc.id_producto = p.id_producto
                  JOIN categorias_productos cat ON p.id_categoria = cat.id_categoria
                  WHERE c_ref.id_reparacion = v.id_reparacion AND c_ref.estado != 'Anulado'
                ) AS "Repuestos",
                (
                  SELECT COALESCE(json_agg(CONCAT('COMP-', c_ref.id_compra)), '[]'::json)
                  FROM compras c_ref
                  WHERE c_ref.id_reparacion = v.id_reparacion AND c_ref.estado != 'Anulado'
                ) AS "FacturasCompras",
               rep.observaciones AS "NotasReparacion",
               rep.id_reparacion AS "ID_Rep"
        FROM ventas v
        LEFT JOIN empleados e ON v.id_empleado = e.id_empleado
        LEFT JOIN motocicletas m ON v.id_motocicleta = m.id_motocicleta
        LEFT JOIN clientes c ON m.id_cliente = c.id_cliente
        LEFT JOIN reparaciones rep ON v.id_reparacion = rep.id_reparacion
        ORDER BY v.fecha DESC`;
  return rows;
};

const getById = async (id) => {
  const sql = await getPool();
  const sales = await sql`
        SELECT v.id_venta AS "ID_Venta", v.id_reparacion AS "ID_Reparacion", 
               v.id_empleado AS "ID_Empleado", v.id_motocicleta AS "ID_Motocicleta", 
               v.fecha AS "Fecha", v.total AS "Total", v.observaciones AS "Observaciones", 
               v.estado AS "Estado",
               e.nombre AS "NombreEmpleado", e.apellido AS "ApellidoEmpleado",
               m.placa AS "Placa", m.marca AS "MarcaMoto", m.modelo AS "ModeloMoto", m.anio AS "AnioMoto",
               c.nombre AS "NombreCliente", c.apellido AS "ApellidoCliente", c.telefono AS "TelefonoCliente", 
               c.documento AS "DocumentoCliente", '' AS "EmailCliente", c.direccion AS "DireccionCliente",
                (
                  SELECT COALESCE(json_agg(s.nombre), '[]'::json)
                  FROM reparaciones_servicios rs
                  JOIN servicios s ON rs.id_servicio = s.id_servicio
                  WHERE rs.id_reparacion = v.id_reparacion
                ) AS "TiposServicio",
                (
                  SELECT COALESCE(SUM(s.precio), 0)
                  FROM reparaciones_servicios rs
                  JOIN servicios s ON rs.id_servicio = s.id_servicio
                  WHERE rs.id_reparacion = v.id_reparacion
                ) AS "CostoServicios",
                (
                  SELECT COALESCE(json_agg(json_build_object(
                     'id', p.id_producto,
                     'product', p.nombre, 
                     'category', cat.nombre,
                     'quantity', dc.cantidad, 
                     'unitCost', dc.preciounitario, 
                     'total', dc.subtotal,
                     'purchaseInvoice', CONCAT('COMP-', c_ref.id_compra)
                  )), '[]'::json)
                  FROM compras c_ref
                  JOIN detalle_compras dc ON c_ref.id_compra = dc.id_compra
                  JOIN productos p ON dc.id_producto = p.id_producto
                  JOIN categorias_productos cat ON p.id_categoria = cat.id_categoria
                  WHERE c_ref.id_reparacion = v.id_reparacion AND c_ref.estado != 'Anulado'
                ) AS "Repuestos",
                (
                  SELECT COALESCE(json_agg(CONCAT('COMP-', c_ref.id_compra)), '[]'::json)
                  FROM compras c_ref
                  WHERE c_ref.id_reparacion = v.id_reparacion AND c_ref.estado != 'Anulado'
                ) AS "FacturasCompras"
        FROM ventas v
        LEFT JOIN empleados e ON v.id_empleado = e.id_empleado
        LEFT JOIN motocicletas m ON v.id_motocicleta = m.id_motocicleta
        LEFT JOIN clientes c ON m.id_cliente = c.id_cliente
        WHERE v.id_venta = ${id}`;
  if (sales.length === 0) throw { status: 404, message: 'Venta no encontrada.' };

  const id_reparacion = sales[0].ID_Reparacion;
  let services = [];
  let purchases = [];

  if (id_reparacion) {
    services = await sql`
        SELECT rs.id_servicio AS "ID_Servicio", s.precio AS "CostoServicios",
               s.nombre AS "NombreServicio"
        FROM reparaciones_servicios rs
        INNER JOIN servicios s ON rs.id_servicio = s.id_servicio
        WHERE rs.id_reparacion = ${id_reparacion}
    `;

    purchases = await sql`
        SELECT c.id_compra AS "ID_Compra", c.total AS "Subtotal",
               c.fechacompra AS "FechaCompra", c.total AS "TotalCompra"
        FROM compras c
        WHERE c.id_reparacion = ${id_reparacion} AND c.estado != 'Anulado'
    `;
  }

  return { ...sales[0], servicios: services, compras: purchases };
};

const create = async ({ id_reparacion, id_empleado, id_motocicleta, fecha, total, observaciones, servicios, compras }) => {
  const sql = await getPool();

  try {
    const result = await sql.begin(async (tx) => {
      let final_id_empleado = id_empleado;
      if (!final_id_empleado) {
          const emp = await tx`SELECT id_empleado FROM empleados LIMIT 1`;
          final_id_empleado = emp.length ? emp[0].id_empleado : null;
      }

      const [venta] = await tx`
                INSERT INTO ventas (id_reparacion, id_empleado, id_motocicleta, fecha, total, observaciones, estado)
                VALUES (${id_reparacion}, ${final_id_empleado}, ${id_motocicleta}, COALESCE(${fecha || null}::timestamp, timezone('America/Bogota', NOW())), ${total}, ${observaciones || null}, true)
                RETURNING id_venta AS "ID_Venta"
            `;

      if (compras && compras.length > 0) {
        for (const comp of compras) {
           await tx`UPDATE compras SET estado = 'Compra finalizada' WHERE id_compra = ${comp.id_compra}`;
        }
      }

      if (id_reparacion) {
        await tx`UPDATE reparaciones SET estado = 'Reparación finalizada' WHERE id_reparacion = ${id_reparacion}`;
      }

      return venta;
    });

    return result;
  } catch (err) {
    console.error('Error al crear venta:', err);
    throw err;
  }
};

const update = async (id, { total, observaciones, estado }) => {
  const sql = await getPool();
  const [row] = await sql`
        UPDATE ventas 
        SET total = ${total}, observaciones = ${observaciones || null}, estado = ${estado}
        WHERE id_venta = ${id}
        RETURNING id_venta AS "ID_Venta"
    `;
  if (!row) throw { status: 404, message: 'Venta no encontrada.' };
  return row;
};

const remove = async (id) => {
  const sql = await getPool();
  const [row] = await sql`
        UPDATE ventas SET estado = false WHERE id_venta = ${id}
        RETURNING id_venta AS "ID_Venta"
    `;
  if (!row) throw { status: 404, message: 'Venta no encontrada.' };
  return row;
};

module.exports = { getAll, getById, create, update, remove };
