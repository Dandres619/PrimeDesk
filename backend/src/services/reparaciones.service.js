const { getPool } = require('../config/db');
const supabase = require('../config/supabase');
const path = require('path');

const getAll = async (filters = {}) => {
  const sql = await getPool();
  const { id_cliente, id_motocicleta } = filters;

  let where = sql``;
  if (id_cliente && id_motocicleta) {
    where = sql`WHERE m.id_cliente = ${id_cliente} AND rep.id_motocicleta = ${id_motocicleta}`;
  } else if (id_cliente) {
    where = sql`WHERE m.id_cliente = ${id_cliente}`;
  } else if (id_motocicleta) {
    where = sql`WHERE rep.id_motocicleta = ${id_motocicleta}`;
  }

  try {
    const rows = await sql`
          SELECT rep.id_reparacion AS "ID_Reparacion", 
                 rep.id_reparacion AS "id", 
                 rep.id_motocicleta AS "ID_Motocicleta", 
                 rep.id_agendamiento AS "ID_Agendamiento", 
                 rep.observaciones AS "Observaciones", 
                 rep.estado AS "Estado",
                 rep.nota_estado AS "NotaEstado",
                 m.placa AS "Placa", m.marca AS "Marca", m.modelo AS "Modelo", m.anio AS "Anio",
                 c.id_cliente AS "ID_Cliente", CONCAT(c.nombre, ' ', c.apellido) AS "NombreCliente",
                 a.dia AS "DiaAgendamiento",
                 CONCAT(e.nombre, ' ', e.apellido) AS "Mecanico",
                 v_assoc.id_venta AS "AssociatedSaleId",
                 (
                   SELECT json_agg(json_build_object(
                     'ID_Servicio', s.id_servicio, 
                     'NombreServicio', s.nombre,
                     'Estado', rs.estado,
                     'Observaciones', rs.observaciones,
                     'FechaFinalizacion', rs.fecha_finalizacion
                   ))
                   FROM reparaciones_servicios rs
                   JOIN servicios s ON rs.id_servicio = s.id_servicio
                   WHERE rs.id_reparacion = rep.id_reparacion
                 ) AS "servicios",
                 (
                   SELECT json_agg(json_build_object(
                     'ID_Reparacion_Compra', rc.id_reparacion_compra,
                     'ID_Producto', rc.id_producto,
                     'NombreProducto', p.nombre,
                     'Cantidad', rc.cantidad,
                     'PrecioUnitario', rc.precio_unitario,
                     'Subtotal', rc.subtotal,
                     'Factura', rc.factura,
                     'Observaciones', rc.observaciones
                   ))
                   FROM reparaciones_compras rc
                   LEFT JOIN productos p ON rc.id_producto = p.id_producto
                   WHERE rc.id_reparacion = rep.id_reparacion
                 ) AS "compras"
          FROM reparaciones rep
          INNER JOIN motocicletas m ON rep.id_motocicleta = m.id_motocicleta
          INNER JOIN clientes c ON m.id_cliente = c.id_cliente
          LEFT JOIN agendamientos a ON rep.id_agendamiento = a.id_agendamiento
          LEFT JOIN empleados e ON a.id_empleado = e.id_empleado
          LEFT JOIN ventas v_assoc ON rep.id_reparacion = v_assoc.id_reparacion
          ${where}
          ORDER BY COALESCE(a.dia, '1900-01-01'::date) DESC, rep.id_reparacion DESC
      `;
    return rows;
  } catch (err) {
    console.error('❌ Error en reparaciones.service.getAll:', err);
    throw err;
  }
};

const getById = async (id) => {
  const sql = await getPool();
  const appointments = await sql`
        SELECT rep.id_reparacion AS "ID_Reparacion", rep.id_motocicleta AS "ID_Motocicleta", 
               rep.id_agendamiento AS "ID_Agendamiento", 
               rep.observaciones AS "Observaciones", 
               rep.estado AS "Estado",
               rep.nota_estado AS "NotaEstado",
               m.placa AS "Placa", m.marca AS "Marca", m.modelo AS "Modelo", m.anio AS "Anio",
               a.dia AS "DiaAgendamiento"
        FROM reparaciones rep
        INNER JOIN motocicletas m ON rep.id_motocicleta = m.id_motocicleta
        LEFT JOIN agendamientos a ON rep.id_agendamiento = a.id_agendamiento
        WHERE rep.id_reparacion = ${id}
    `;
  if (appointments.length === 0) throw { status: 404, message: 'Reparación no encontrada.' };

  const services = await sql`
        SELECT s.id_servicio AS "ID_Servicio", s.nombre AS "Nombre",
               rs.estado AS "Estado", rs.observaciones AS "Observaciones",
               rs.fecha_finalizacion AS "FechaFinalizacion"
        FROM reparaciones_servicios rs
        INNER JOIN servicios s ON rs.id_servicio = s.id_servicio
        WHERE rs.id_reparacion = ${id}
    `;

  const purchases = await sql`
        SELECT rc.id_reparacion_compra AS "ID_Reparacion_Compra", rc.id_producto AS "ID_Producto",
               p.nombre AS "NombreProducto", rc.cantidad AS "Cantidad", rc.precio_unitario AS "PrecioUnitario",
               rc.subtotal AS "Subtotal", rc.factura AS "Factura", rc.observaciones AS "Observaciones"
        FROM reparaciones_compras rc
        LEFT JOIN productos p ON rc.id_producto = p.id_producto
        WHERE rc.id_reparacion = ${id}
    `;

  return { ...appointments[0], servicios: services, compras: purchases };
};

const create = async ({ id_motocicleta, id_agendamiento, observaciones, estado, servicios }) => {
  const sql = await getPool();

  try {
    const result = await sql.begin(async (tx) => {
      const [reparacion] = await tx`
                INSERT INTO reparaciones (id_motocicleta, id_agendamiento, observaciones, estado)
                VALUES (${id_motocicleta}, ${id_agendamiento || null}, ${observaciones || null}, ${estado || 'Esperando motocicleta'})
                RETURNING id_reparacion AS "ID_Reparacion", id_motocicleta AS "ID_Motocicleta", id_agendamiento AS "ID_Agendamiento"
            `;

      if (servicios && servicios.length > 0) {
        const serviceInserts = servicios.map(id_servicio => ({
          id_reparacion: reparacion.ID_Reparacion,
          id_servicio: id_servicio
        }));

        await tx`
                    INSERT INTO reparaciones_servicios ${sql(serviceInserts, 'id_reparacion', 'id_servicio')}
                `;
      }

      return reparacion;
    });

    return result;
  } catch (err) {
    console.error('Error al crear reparación:', err);
    throw err;
  }
};

const update = async (id, { observaciones, estado, nota_estado }) => {
  const sql = await getPool();
  const [row] = await sql`
        UPDATE reparaciones 
        SET observaciones = ${observaciones || null}, 
            estado = ${estado},
            nota_estado = ${nota_estado || null}
        WHERE id_reparacion = ${id}
        RETURNING id_reparacion AS "ID_Reparacion"
    `;

  if (!row) throw { status: 404, message: 'Reparación no encontrada.' };
  return row;
};

const addServicio = async (id_reparacion, id_servicio) => {
  const sql = await getPool();
  const exists = await sql`
        SELECT 1 FROM reparaciones_servicios 
        WHERE id_reparacion = ${id_reparacion} AND id_servicio = ${id_servicio}
    `;
  if (exists.length > 0) throw { status: 409, message: 'El servicio ya está en esta reparación.' };

  await sql`
        INSERT INTO reparaciones_servicios (id_reparacion, id_servicio, estado) 
        VALUES (${id_reparacion}, ${id_servicio}, 'Pendiente')
    `;
  return { message: 'Servicio agregado a la reparación.' };
};

const updateEstado = async (id, estado, nota_estado) => {
    const sql = await getPool();
    const [row] = await sql`
        UPDATE reparaciones 
        SET estado = ${estado}, nota_estado = ${nota_estado || null}
        WHERE id_reparacion = ${id}
        RETURNING id_reparacion AS "ID_Reparacion"
    `;
    if (!row) throw { status: 404, message: 'Reparación no encontrada.' };
    return row;
};

const updateServicioEstado = async (id_reparacion, id_servicio, estado, observaciones) => {
    const sql = await getPool();
    const [row] = await sql`
        UPDATE reparaciones_servicios 
        SET estado = ${estado}, observaciones = ${observaciones || null}, fecha_finalizacion = CASE WHEN ${estado} = 'Finalizado' THEN NOW() ELSE NULL END
        WHERE id_reparacion = ${id_reparacion} AND id_servicio = ${id_servicio}
        RETURNING id_reparacion AS "ID_Reparacion"
    `;
    if (!row) throw { status: 404, message: 'Servicio no encontrado en esta reparación.' };
    return row;
};

const addCompra = async (id_reparacion, data, file) => {
    const sql = await getPool();
    const { id_producto, cantidad, precio_unitario, observaciones } = data;
    const subtotal = (cantidad || 1) * (precio_unitario || 0);

    let finalFoto = null;
    if (file) {
        try {
            const fileBuffer = file.buffer;
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            const fileName = `factura-${uniqueSuffix}${ext}`;

            const { data: uploadData, error } = await supabase.storage
                .from('facturas')
                .upload(fileName, fileBuffer, {
                    contentType: file.mimetype,
                    upsert: true
                });

            if (error) {
                console.error('❌ Error al subir a Supabase Storage (facturas):', error.message || error);
                throw new Error(`Error en Supabase Storage: ${error.message || 'Sin detalles'}`);
            } else {
                console.log('✅ Factura subida exitosamente a Supabase Storage:', fileName);
                const { data: publicUrl } = supabase.storage
                    .from('facturas')
                    .getPublicUrl(fileName);

                finalFoto = publicUrl.publicUrl;
            }
        } catch (uploadErr) {
            console.error('❌ Error crítico en el proceso de subida:', uploadErr.message);
            throw uploadErr;
        }
    }

    const [row] = await sql`
        INSERT INTO reparaciones_compras (id_reparacion, id_producto, cantidad, precio_unitario, subtotal, factura, observaciones)
        VALUES (${id_reparacion}, ${id_producto}, ${cantidad || 1}, ${precio_unitario || 0}, ${subtotal}, ${finalFoto}, ${observaciones || null})
        RETURNING id_reparacion_compra AS "ID_Reparacion_Compra"
    `;

    return row;
};

const remove = async (id) => {
  const sql = await getPool();
  try {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM reparaciones_servicios WHERE id_reparacion = ${id}`;
      await tx`DELETE FROM reparaciones_compras WHERE id_reparacion = ${id}`;
      const [deleted] = await tx`
                DELETE FROM reparaciones 
                WHERE id_reparacion = ${id}
                RETURNING id_reparacion AS "ID_Reparacion"
            `;
      if (!deleted) throw { status: 404, message: 'Reparación no encontrada.' };
    });
    return { message: 'Reparación eliminada.' };
  } catch (err) {
    throw err;
  }
};


module.exports = { getAll, getById, create, update, addServicio, updateEstado, updateServicioEstado, addCompra, remove };
