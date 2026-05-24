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
                 a.horainicio AS "HoraInicio",
                 CONCAT(e.nombre, ' ', e.apellido) AS "Mecanico",
                 e.documento AS "MecanicoDocumento",
                 e.telefono AS "MecanicoTelefono",
                 v_assoc.id_venta AS "AssociatedSaleId",
                 v_assoc.total AS "AssociatedSaleTotal",
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
                     'Observaciones', rc.observaciones,
                     'ID_Proveedor', rc.id_proveedor,
                     'NombreProveedor', prov.nombreempresa
                   ))
                   FROM reparaciones_compras rc
                   LEFT JOIN productos p ON rc.id_producto = p.id_producto
                   LEFT JOIN proveedores prov ON rc.id_proveedor = prov.id_proveedor
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
  
  const [appointments, services, purchases] = await Promise.all([
    sql`
      SELECT rep.id_reparacion AS "ID_Reparacion", rep.id_motocicleta AS "ID_Motocicleta", 
             rep.id_agendamiento AS "ID_Agendamiento", 
             rep.observaciones AS "Observaciones", 
             rep.estado AS "Estado",
             rep.nota_estado AS "NotaEstado",
             m.placa AS "Placa", m.marca AS "Marca", m.modelo AS "Modelo", m.anio AS "Anio",
             a.dia AS "DiaAgendamiento",
             a.horainicio AS "HoraInicio",
             v_assoc.id_venta AS "AssociatedSaleId",
             v_assoc.total AS "AssociatedSaleTotal"
      FROM reparaciones rep
      INNER JOIN motocicletas m ON rep.id_motocicleta = m.id_motocicleta
      LEFT JOIN agendamientos a ON rep.id_agendamiento = a.id_agendamiento
      LEFT JOIN ventas v_assoc ON rep.id_reparacion = v_assoc.id_reparacion
      WHERE rep.id_reparacion = ${id}
    `,
    sql`
      SELECT s.id_servicio AS "ID_Servicio", s.nombre AS "Nombre",
             rs.estado AS "Estado", rs.observaciones AS "Observaciones",
             rs.fecha_finalizacion AS "FechaFinalizacion"
      FROM reparaciones_servicios rs
      INNER JOIN servicios s ON rs.id_servicio = s.id_servicio
      WHERE rs.id_reparacion = ${id}
    `,
    sql`
      SELECT rc.id_reparacion_compra AS "ID_Reparacion_Compra", rc.id_producto AS "ID_Producto",
             p.nombre AS "NombreProducto", rc.cantidad AS "Cantidad", rc.precio_unitario AS "PrecioUnitario",
             rc.subtotal AS "Subtotal", rc.factura AS "Factura", rc.observaciones AS "Observaciones",
             rc.id_proveedor AS "ID_Proveedor", prov.nombreempresa AS "NombreProveedor"
      FROM reparaciones_compras rc
      LEFT JOIN productos p ON rc.id_producto = p.id_producto
      LEFT JOIN proveedores prov ON rc.id_proveedor = prov.id_proveedor
      WHERE rc.id_reparacion = ${id}
    `
  ]);

  if (appointments.length === 0) throw { status: 404, message: 'Reparación no encontrada.' };

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

const syncComprasForReparacion = async (id_reparacion, estado) => {
    const sql = await getPool();

    if (estado === 'Reparación finalizada') {
        const [reparacion] = await sql`SELECT id_motocicleta FROM reparaciones WHERE id_reparacion = ${id_reparacion}`;
        if (!reparacion) return;

        const purchases = await sql`
            SELECT id_producto, cantidad, precio_unitario, subtotal, id_proveedor, observaciones, factura
            FROM reparaciones_compras
            WHERE id_reparacion = ${id_reparacion}
        `;

        if (purchases.length === 0) return;

        const grouped = {};
        for (const p of purchases) {
            let provId = p.id_proveedor;
            if (!provId) {
                const [firstProv] = await sql`SELECT id_proveedor FROM proveedores WHERE estado = true OR estado = 'Activo' LIMIT 1`;
                provId = firstProv ? firstProv.id_proveedor : null;
            }
            if (!provId) continue;

            if (!grouped[provId]) {
                grouped[provId] = [];
            }
            grouped[provId].push(p);
        }

        for (const [provId, items] of Object.entries(grouped)) {
            const existing = await sql`
                SELECT id_compra FROM compras 
                WHERE id_reparacion = ${id_reparacion} AND id_proveedor = ${provId} AND estado != 'Anulado'
                LIMIT 1
            `;
            if (existing.length > 0) continue;

            const total = items.reduce((acc, cur) => acc + parseFloat(cur.subtotal || 0), 0);
            
            await sql.begin(async (tx) => {
                const [compra] = await tx`
                    INSERT INTO compras (id_proveedor, id_motocicleta, fechacompra, total, notas, estado, id_reparacion)
                    VALUES (${provId}, ${reparacion.id_motocicleta}, timezone('America/Bogota', NOW()), ${total}, ${`Compra registrada automáticamente al finalizar la reparación #${id_reparacion}`}, 'Activa', ${id_reparacion})
                    RETURNING id_compra
                `;

                const detailInserts = items.map(item => ({
                    id_compra: compra.id_compra,
                    id_producto: item.id_producto,
                    cantidad: item.cantidad,
                    preciounitario: item.precio_unitario,
                    subtotal: item.subtotal,
                    factura: item.factura
                }));

                await tx`
                    INSERT INTO detalle_compras ${sql(detailInserts, 'id_compra', 'id_producto', 'cantidad', 'preciounitario', 'subtotal', 'factura')}
                `;
            });
        }
    } else if (estado === 'Anulada') {
        await sql`
            UPDATE compras 
            SET estado = 'Anulado' 
            WHERE id_reparacion = ${id_reparacion}
        `;
        await sql`
            UPDATE reparaciones_servicios
            SET estado = 'Anulado'
            WHERE id_reparacion = ${id_reparacion}
        `;
    }
};

const syncAgendamientoState = async (id_agendamiento, repairEstado) => {
    if (!id_agendamiento) return;
    const sql = await getPool();
    await sql`
        UPDATE agendamientos
        SET estado = ${repairEstado}
        WHERE id_agendamiento = ${id_agendamiento}
    `;
};

const update = async (id, { observaciones, estado, nota_estado }) => {
  const sql = await getPool();
  const [row] = await sql`
        UPDATE reparaciones 
        SET observaciones = ${observaciones || null}, 
            estado = ${estado},
            nota_estado = ${nota_estado || null}
        WHERE id_reparacion = ${id}
        RETURNING id_reparacion AS "ID_Reparacion", id_agendamiento AS "ID_Agendamiento"
    `;

  if (!row) throw { status: 404, message: 'Reparación no encontrada.' };

  await syncComprasForReparacion(id, estado);
  await syncAgendamientoState(row.ID_Agendamiento, estado);

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
        RETURNING id_reparacion AS "ID_Reparacion", id_agendamiento AS "ID_Agendamiento"
    `;
    if (!row) throw { status: 404, message: 'Reparación no encontrada.' };

    await syncComprasForReparacion(id, estado);
    await syncAgendamientoState(row.ID_Agendamiento, estado);

    return row;
};

const updateServicioEstado = async (id_reparacion, id_servicio, estado, observaciones) => {
    const sql = await getPool();
    const [row] = await sql`
        UPDATE reparaciones_servicios 
        SET estado = ${estado}, observaciones = ${observaciones || null}, fecha_finalizacion = CASE WHEN ${estado} = 'Finalizado' THEN timezone('America/Bogota', NOW()) ELSE NULL END
        WHERE id_reparacion = ${id_reparacion} AND id_servicio = ${id_servicio}
        RETURNING id_reparacion AS "ID_Reparacion"
    `;
    if (!row) throw { status: 404, message: 'Servicio no encontrado en esta reparación.' };
    return row;
};

const addCompra = async (id_reparacion, data, file) => {
    const sql = await getPool();
    const { id_producto, cantidad, precio_unitario, observaciones, id_proveedor } = data;

    if (precio_unitario < 1000) {
        throw { status: 400, message: 'El precio unitario mínimo es $1.000.' };
    }
    if (precio_unitario > 5000000) {
        throw { status: 400, message: 'El precio unitario máximo es $5.000.000.' };
    }

    const subtotal = (cantidad || 1) * (precio_unitario || 0);

    let finalFoto = null;
    if (file) {
        try {
            let nombreProductoClean = 'repuesto';
            let placaClean = 'sin_placa';
            try {
                const [prodObj] = await sql`SELECT nombre FROM productos WHERE id_producto = ${id_producto}`;
                if (prodObj && (prodObj.nombre || prodObj.Nombre)) {
                    const rawName = prodObj.nombre || prodObj.Nombre;
                    nombreProductoClean = rawName.toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]/g, '_')
                        .replace(/__+/g, '_')
                        .replace(/^_+|_+$/g, '');
                }

                const [repObj] = await sql`
                    SELECT m.placa 
                    FROM reparaciones rep
                    INNER JOIN motocicletas m ON rep.id_motocicleta = m.id_motocicleta
                    WHERE rep.id_reparacion = ${id_reparacion}
                `;
                if (repObj && (repObj.placa || repObj.Placa)) {
                    const rawPlaca = repObj.placa || repObj.Placa;
                    placaClean = rawPlaca.toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]/g, '')
                        .trim();
                }
            } catch (dbErr) {
                console.error('❌ Error fetching product name or motorcycle plate for filename:', dbErr);
            }

            const fileBuffer = file.buffer;
            const ext = path.extname(file.originalname);
            const fileName = `factura_${id_reparacion}_${placaClean}_${nombreProductoClean}${ext}`;

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
        INSERT INTO reparaciones_compras (id_reparacion, id_producto, cantidad, precio_unitario, subtotal, factura, observaciones, id_proveedor)
        VALUES (${id_reparacion}, ${id_producto}, ${cantidad || 1}, ${precio_unitario || 0}, ${subtotal}, ${finalFoto}, ${observaciones || null}, ${id_proveedor || null})
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

const removeCompra = async (id_reparacion, id_reparacion_compra) => {
  const sql = await getPool();
  try {
    const [compra] = await sql`
      SELECT factura 
      FROM reparaciones_compras 
      WHERE id_reparacion = ${id_reparacion} AND id_reparacion_compra = ${id_reparacion_compra}
    `;

    if (!compra) {
      throw { status: 404, message: 'El repuesto no se encuentra en esta reparación.' };
    }

    if (compra.factura) {
      const parts = compra.factura.split('/');
      const fileName = parts[parts.length - 1];
      if (fileName) {
        const { error } = await supabase.storage.from('facturas').remove([fileName]);
        if (error) {
          console.error('❌ Error al eliminar factura de Supabase Storage:', error.message || error);
        } else {
          console.log('✅ Factura eliminada de Supabase Storage:', fileName);
        }
      }
    }

    const [deleted] = await sql`
      DELETE FROM reparaciones_compras
      WHERE id_reparacion = ${id_reparacion} AND id_reparacion_compra = ${id_reparacion_compra}
      RETURNING id_reparacion_compra AS "ID_Reparacion_Compra"
    `;

    if (!deleted) {
      throw { status: 404, message: 'No se pudo eliminar el repuesto.' };
    }

    return { message: 'Repuesto eliminado de la reparación.' };
  } catch (err) {
    console.error('❌ Error en reparaciones.service.removeCompra:', err);
    throw err;
  }
};

const finalizarReparacionConVenta = async (id, { mano_obra, observaciones_venta }) => {
  const sql = await getPool();

  try {
    return await sql.begin(async (tx) => {
      // 1. Update the repair state to 'Reparación finalizada'
      const [row] = await tx`
          UPDATE reparaciones 
          SET estado = 'Reparación finalizada'
          WHERE id_reparacion = ${id}
          RETURNING id_reparacion AS "ID_Reparacion", id_agendamiento AS "ID_Agendamiento", id_motocicleta AS "ID_Motocicleta"
      `;
      if (!row) throw { status: 404, message: 'Reparación no encontrada.' };

      // 2. Sync agendamiento state if exists
      if (row.ID_Agendamiento) {
        await tx`
            UPDATE agendamientos
            SET estado = 'Reparación finalizada'
            WHERE id_agendamiento = ${row.ID_Agendamiento}
        `;
      }

      // 3. Sync/Generate compras from reparaciones_compras
      const purchases = await tx`
          SELECT id_producto, cantidad, precio_unitario, subtotal, id_proveedor, observaciones, factura
          FROM reparaciones_compras
          WHERE id_reparacion = ${id}
      `;

      const generatedPurchaseIds = [];
      const grouped = {};
      
      if (purchases.length > 0) {
          for (const p of purchases) {
              let provId = p.id_proveedor;
              if (!provId) {
                  const [firstProv] = await tx`SELECT id_proveedor FROM proveedores WHERE estado = true OR estado = 'Activo' LIMIT 1`;
                  provId = firstProv ? firstProv.id_proveedor : null;
              }
              if (!provId) continue;

              if (!grouped[provId]) {
                  grouped[provId] = [];
              }
              grouped[provId].push(p);
          }

          for (const [provId, items] of Object.entries(grouped)) {
              const total = items.reduce((acc, cur) => acc + parseFloat(cur.subtotal || 0), 0);
              
              const [compra] = await tx`
                  INSERT INTO compras (id_proveedor, id_motocicleta, fechacompra, total, notas, estado, id_reparacion)
                  VALUES (${provId}, ${row.ID_Motocicleta}, timezone('America/Bogota', NOW()), ${total}, ${`Compra registrada automáticamente al finalizar la reparación #${id}`}, 'Compra finalizada', ${id})
                  RETURNING id_compra
              `;

              generatedPurchaseIds.push({ id_compra: compra.id_compra, total });

              const detailInserts = items.map(item => ({
                  id_compra: compra.id_compra,
                  id_producto: item.id_producto,
                  cantidad: item.cantidad,
                  preciounitario: item.precio_unitario,
                  subtotal: item.subtotal,
                  factura: item.factura
              }));

              await tx`
                  INSERT INTO detalle_compras ${tx(detailInserts, 'id_compra', 'id_producto', 'cantidad', 'preciounitario', 'subtotal', 'factura')}
              `;
          }
      }

      // 4. Retrieve repair services
      const services = await tx`
          SELECT id_servicio 
          FROM reparaciones_servicios
          WHERE id_reparacion = ${id}
      `;

      // 5. Get employee/mechanic from agendamiento or first employee as fallback
      let id_empleado = null;
      if (row.ID_Agendamiento) {
        const [agend] = await tx`SELECT id_empleado FROM agendamientos WHERE id_agendamiento = ${row.ID_Agendamiento}`;
        id_empleado = agend ? agend.id_empleado : null;
      }
      if (!id_empleado) {
        const [firstEmp] = await tx`SELECT id_empleado FROM empleados LIMIT 1`;
        id_empleado = firstEmp ? firstEmp.id_empleado : null;
      }

      // 6. Calculate total for the sale (parts total + labor cost)
      const partsTotal = generatedPurchaseIds.reduce((sum, p) => sum + parseFloat(p.total), 0);
      const saleTotal = partsTotal + parseFloat(mano_obra || 0);

      // 7. Create the Venta (Sale)
      const [venta] = await tx`
          INSERT INTO ventas (id_reparacion, id_empleado, id_motocicleta, fecha, total, observaciones, estado)
          VALUES (${id}, ${id_empleado}, ${row.ID_Motocicleta}, timezone('America/Bogota', NOW()), ${saleTotal}, ${observaciones_venta || 'Venta registrada automáticamente al finalizar la reparación'}, true)
          RETURNING id_venta AS "ID_Venta"
      `;

      return { ID_Reparacion: id, ID_Venta: venta.ID_Venta };
    });
  } catch (err) {
    console.error('❌ Error en finalizarReparacionConVenta:', err);
    throw err;
  }
};

module.exports = { getAll, getById, create, update, addServicio, updateEstado, updateServicioEstado, addCompra, remove, removeCompra, finalizarReparacionConVenta };
