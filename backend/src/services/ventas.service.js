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
                 FROM ventas_servicios vs
                 JOIN servicios s ON vs.id_servicio = s.id_servicio
                 WHERE vs.id_venta = v.id_venta
               ) AS "TiposServicio",
               (
                 SELECT COALESCE(SUM(vs.costoservicios), 0)
                 FROM ventas_servicios vs
                 WHERE vs.id_venta = v.id_venta
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
                 FROM ventas_compras vc
                 JOIN compras c_ref ON vc.id_compra = c_ref.id_compra
                 JOIN detalle_compras dc ON c_ref.id_compra = dc.id_compra
                 JOIN productos p ON dc.id_producto = p.id_producto
                 JOIN categorias_productos cat ON p.id_categoria = cat.id_categoria
                 WHERE vc.id_venta = v.id_venta
               ) AS "Repuestos",
               (
                 SELECT COALESCE(json_agg(CONCAT('COMP-', vc.id_compra)), '[]'::json)
                 FROM ventas_compras vc
                 WHERE vc.id_venta = v.id_venta
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
                 FROM ventas_servicios vs
                 JOIN servicios s ON vs.id_servicio = s.id_servicio
                 WHERE vs.id_venta = v.id_venta
               ) AS "TiposServicio",
               (
                 SELECT COALESCE(SUM(vs.costoservicios), 0)
                 FROM ventas_servicios vs
                 WHERE vs.id_venta = v.id_venta
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
                 FROM ventas_compras vc
                 JOIN compras c_ref ON vc.id_compra = c_ref.id_compra
                 JOIN detalle_compras dc ON c_ref.id_compra = dc.id_compra
                 JOIN productos p ON dc.id_producto = p.id_producto
                 JOIN categorias_productos cat ON p.id_categoria = cat.id_categoria
                 WHERE vc.id_venta = v.id_venta
               ) AS "Repuestos",
               (
                 SELECT COALESCE(json_agg(CONCAT('COMP-', vc.id_compra)), '[]'::json)
                 FROM ventas_compras vc
                 WHERE vc.id_venta = v.id_venta
               ) AS "FacturasCompras"
        FROM ventas v
        LEFT JOIN empleados e ON v.id_empleado = e.id_empleado
        LEFT JOIN motocicletas m ON v.id_motocicleta = m.id_motocicleta
        LEFT JOIN clientes c ON m.id_cliente = c.id_cliente
        WHERE v.id_venta = ${id}`;
  if (sales.length === 0) throw { status: 404, message: 'Venta no encontrada.' };

  const services = await sql`
        SELECT vs.id_ventaservicio AS "ID_VentaServicio", vs.id_venta AS "ID_Venta", 
               vs.id_servicio AS "ID_Servicio", vs.costoservicios AS "CostoServicios",
               s.nombre AS "NombreServicio"
        FROM ventas_servicios vs
        INNER JOIN servicios s ON vs.id_servicio = s.id_servicio
        WHERE vs.id_venta = ${id}
    `;

  const purchases = await sql`
        SELECT vc.id_ventacompra AS "ID_VentaCompra", vc.id_venta AS "ID_Venta", 
               vc.id_compra AS "ID_Compra", vc.subtotal AS "Subtotal",
               c.fechacompra AS "FechaCompra", c.total AS "TotalCompra"
        FROM ventas_compras vc
        INNER JOIN compras c ON vc.id_compra = c.id_compra
        WHERE vc.id_venta = ${id}
    `;

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
                VALUES (${id_reparacion}, ${final_id_empleado}, ${id_motocicleta}, COALESCE(${fecha || null}::timestamp, NOW()), ${total}, ${observaciones || null}, true)
                RETURNING id_venta AS "ID_Venta"
            `;

      if (servicios && servicios.length > 0) {
        const serviceInserts = servicios.map(svc => ({
          id_venta: venta.ID_Venta,
          id_servicio: svc.id_servicio,
          costoservicios: svc.costo
        }));
        await tx`INSERT INTO ventas_servicios ${sql(serviceInserts, 'id_venta', 'id_servicio', 'costoservicios')}`;
      }

      if (compras && compras.length > 0) {
        const purchaseInserts = compras.map(comp => ({
          id_venta: venta.ID_Venta,
          id_compra: comp.id_compra,
          subtotal: comp.subtotal
        }));
        await tx`INSERT INTO ventas_compras ${sql(purchaseInserts, 'id_venta', 'id_compra', 'subtotal')}`;

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
