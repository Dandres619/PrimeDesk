const { getPool } = require('../config/db');

const getAll = async () => {
  const sql = await getPool();
  const rows = await sql`
        SELECT v.id_venta AS "ID_Venta", v.id_reparacion AS "ID_Reparacion", 
               v.id_empleado AS "ID_Empleado", v.id_motocicleta AS "ID_Motocicleta", 
               v.fecha AS "Fecha", v.total AS "Total", v.observaciones AS "Observaciones", 
               v.estado AS "Estado",
               e.nombre AS "NombreEmpleado", e.apellido AS "ApellidoEmpleado",
               m.placa AS "Placa", m.marca AS "MarcaMoto"
        FROM ventas v
        INNER JOIN empleados e ON v.id_empleado = e.id_empleado
        INNER JOIN motocicletas m ON v.id_motocicleta = m.id_motocicleta
        ORDER BY v.fecha DESC
    `;
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
               m.placa AS "Placa", m.marca AS "MarcaMoto"
        FROM ventas v
        INNER JOIN empleados e ON v.id_empleado = e.id_empleado
        INNER JOIN motocicletas m ON v.id_motocicleta = m.id_motocicleta
        WHERE v.id_venta = ${id}
    `;
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
      const [venta] = await tx`
                INSERT INTO ventas (id_reparacion, id_empleado, id_motocicleta, fecha, total, observaciones, estado)
                VALUES (${id_reparacion}, ${id_empleado}, ${id_motocicleta}, COALESCE(${fecha || null}::timestamp, NOW()), ${total}, ${observaciones || null}, true)
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
