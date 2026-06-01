const { getPool } = require('../config/db');

// Función auxiliar para rellenar ceros en las gráficas
const generateDateRange = (period) => {
  const dates = [];
  const now = new Date();
  
  if (period === 'day') {
    const nowUtc = new Date();
    const bogotaTime = new Date(nowUtc.getTime() - (5 * 60 * 60 * 1000));
    for (let i = 6; i >= 0; i--) {
      const d = new Date(bogotaTime);
      d.setUTCDate(d.getUTCDate() - i);
      const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const dayLabel = weekdays[d.getUTCDay()];
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      dates.push({ label: dayLabel, dateStr, total: 0 });
    }
  } else if (period === 'week') {
    for (let i = 4; i >= 0; i--) {
      const lbl = i === 0 ? 'Esta semana' : i === 1 ? '1 sem. atrás' : `${i} sem. atrás`;
      dates.push({ label: lbl, offset: i, total: 0 });
    }
  } else if (period === 'quarter') {
    for (let i = 3; i >= 0; i--) {
      const lbl = i === 0 ? 'Este trimestre' : i === 1 ? 'Trim. anterior' : `Hace ${i} trim.`;
      dates.push({ label: lbl, offset: i, total: 0 });
    }
  } else if (period === 'semester') {
    for (let i = 1; i >= 0; i--) {
      const lbl = i === 0 ? 'Este semestre' : 'Sem. anterior';
      dates.push({ label: lbl, offset: i, total: 0 });
    }
  } else { // month (default)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const shortMonth = d.toLocaleDateString('es-CO', { month: 'short' });
      dates.push({ label: shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1), dateStr: yearMonth, total: 0 });
    }
  }
  return dates;
};

const getStats = async (period = 'month') => {
  const sql = await getPool();

  let startDateActual, startDateAnterior, endDateAnterior;
  let chartQuery;

  // El cálculo real de ingresos: (Venta_Total - Repuestos_Total) + Servicios_Total
  const ingresosFormula = sql`SUM(
    (v.total - COALESCE((SELECT SUM(c.total) FROM compras c WHERE c.id_reparacion = v.id_reparacion AND c.estado != 'Anulado'), 0)) 
    + 
    COALESCE((SELECT SUM(s.precio) FROM reparaciones_servicios rs JOIN servicios s ON rs.id_servicio = s.id_servicio WHERE rs.id_reparacion = v.id_reparacion AND rs.estado != 'Anulado'), 0)
  )`;
  
  // Rango de fechas dinámico según el periodo
  if (period === 'day') {
    startDateActual = sql`timezone('America/Bogota', NOW())::date`;
    startDateAnterior = sql`timezone('America/Bogota', NOW())::date - interval '1 day'`;
    endDateAnterior = sql`timezone('America/Bogota', NOW())::date`;
    chartQuery = sql`
      SELECT 
        to_char(v.fecha, 'YYYY-MM-DD') as grouping, 
        ${ingresosFormula}::numeric as total 
      FROM ventas v 
      WHERE v.fecha >= timezone('America/Bogota', NOW())::date - interval '6 days'
        AND v.fecha < timezone('America/Bogota', NOW())::date + interval '1 day'
      GROUP BY grouping 
      ORDER BY grouping
    `;
  } else if (period === 'week') {
    startDateActual = sql`date_trunc('week', timezone('America/Bogota', NOW()))`;
    startDateAnterior = sql`date_trunc('week', timezone('America/Bogota', NOW())) - interval '1 week'`;
    endDateAnterior = sql`date_trunc('week', timezone('America/Bogota', NOW()))`;
    chartQuery = sql`
      SELECT 
        (EXTRACT(epoch FROM (date_trunc('week', timezone('America/Bogota', NOW())) - date_trunc('week', timezone('America/Bogota', v.fecha)))) / 604800)::int as idx, 
        ${ingresosFormula}::numeric as total 
      FROM ventas v 
      WHERE v.fecha >= date_trunc('week', timezone('America/Bogota', NOW())) - interval '4 weeks' 
      GROUP BY idx
    `;
  } else if (period === 'quarter') {
    startDateActual = sql`date_trunc('quarter', timezone('America/Bogota', NOW()))`;
    startDateAnterior = sql`date_trunc('quarter', timezone('America/Bogota', NOW())) - interval '3 months'`;
    endDateAnterior = sql`date_trunc('quarter', timezone('America/Bogota', NOW()))`;
    chartQuery = sql`SELECT (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) - EXTRACT(QUARTER FROM v.fecha) + (EXTRACT(YEAR FROM timezone('America/Bogota', NOW())) - EXTRACT(YEAR FROM v.fecha)) * 4)::int as idx, ${ingresosFormula}::numeric as total FROM ventas v WHERE v.fecha >= date_trunc('quarter', timezone('America/Bogota', NOW())) - interval '9 months' GROUP BY idx`;
  } else if (period === 'semester') {
    startDateActual = sql`date_trunc('year', timezone('America/Bogota', NOW())) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) > 2)::int`;
    startDateAnterior = sql`date_trunc('year', timezone('America/Bogota', NOW())) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) > 2)::int - interval '6 months'`;
    endDateAnterior = sql`date_trunc('year', timezone('America/Bogota', NOW())) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) > 2)::int`;
    chartQuery = sql`SELECT CASE WHEN v.fecha >= date_trunc('year', timezone('America/Bogota', NOW())) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) > 2)::int THEN 0 ELSE 1 END as idx, ${ingresosFormula}::numeric as total FROM ventas v WHERE v.fecha >= date_trunc('year', timezone('America/Bogota', NOW())) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) > 2)::int - interval '6 months' GROUP BY idx`;
  } else { // month (default: last 30 days)
    startDateActual = sql`timezone('America/Bogota', NOW())::date - interval '30 days'`;
    startDateAnterior = sql`timezone('America/Bogota', NOW())::date - interval '60 days'`;
    endDateAnterior = sql`timezone('America/Bogota', NOW())::date - interval '30 days'`;
    chartQuery = sql`SELECT to_char(v.fecha, 'YYYY-MM') as grouping, ${ingresosFormula}::numeric as total FROM ventas v WHERE v.fecha >= (date_trunc('month', timezone('America/Bogota', NOW())) - interval '5 months') GROUP BY grouping ORDER BY grouping`;
  }

  // Ejecutamos secuencialmente
  const clientesCount = await sql`SELECT COUNT(*)::int as total FROM clientes`;
  const motosCount = await sql`SELECT COUNT(*)::int as total FROM motocicletas`;

  let reparacionesQuery;
  const activeStatesFilter = sql`r.estado NOT IN ('Reparación finalizada', 'Anulado', 'Anulada')`;
  
  if (period === 'day') {
    reparacionesQuery = sql`
      SELECT COUNT(*)::int as total 
      FROM reparaciones r 
      LEFT JOIN agendamientos a ON r.id_agendamiento = a.id_agendamiento 
      WHERE ${activeStatesFilter} 
        AND (a.dia = timezone('America/Bogota', NOW())::date OR r.id_agendamiento IS NULL)
    `;
  } else if (period === 'week') {
    reparacionesQuery = sql`
      SELECT COUNT(*)::int as total 
      FROM reparaciones r 
      LEFT JOIN agendamientos a ON r.id_agendamiento = a.id_agendamiento 
      WHERE ${activeStatesFilter} 
        AND (date_trunc('week', a.dia) = date_trunc('week', timezone('America/Bogota', NOW())::date) OR r.id_agendamiento IS NULL)
    `;
  } else if (period === 'quarter') {
    reparacionesQuery = sql`
      SELECT COUNT(*)::int as total 
      FROM reparaciones r 
      LEFT JOIN agendamientos a ON r.id_agendamiento = a.id_agendamiento 
      WHERE ${activeStatesFilter} 
        AND (date_trunc('quarter', a.dia) = date_trunc('quarter', timezone('America/Bogota', NOW())::date) OR r.id_agendamiento IS NULL)
    `;
  } else if (period === 'semester') {
    reparacionesQuery = sql`
      SELECT COUNT(*)::int as total 
      FROM reparaciones r 
      LEFT JOIN agendamientos a ON r.id_agendamiento = a.id_agendamiento 
      WHERE ${activeStatesFilter} 
        AND (date_trunc('year', a.dia) + interval '6 months' * (EXTRACT(QUARTER FROM a.dia) > 2)::int = date_trunc('year', timezone('America/Bogota', NOW())::date) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())::date) > 2)::int OR r.id_agendamiento IS NULL)
    `;
  } else { // month
    reparacionesQuery = sql`
      SELECT COUNT(*)::int as total 
      FROM reparaciones r 
      LEFT JOIN agendamientos a ON r.id_agendamiento = a.id_agendamiento 
      WHERE ${activeStatesFilter} 
        AND (date_trunc('month', a.dia) = date_trunc('month', timezone('America/Bogota', NOW())::date) OR r.id_agendamiento IS NULL)
    `;
  }
  const reparacionesActivas = await reparacionesQuery;

  let agendamientosQuery;
  if (period === 'day') {
    agendamientosQuery = sql`SELECT COUNT(*)::int as total FROM agendamientos WHERE dia = timezone('America/Bogota', NOW())::date`;
  } else if (period === 'week') {
    agendamientosQuery = sql`SELECT COUNT(*)::int as total FROM agendamientos WHERE date_trunc('week', dia) = date_trunc('week', timezone('America/Bogota', NOW())::date)`;
  } else if (period === 'quarter') {
    agendamientosQuery = sql`SELECT COUNT(*)::int as total FROM agendamientos WHERE date_trunc('quarter', dia) = date_trunc('quarter', timezone('America/Bogota', NOW())::date)`;
  } else if (period === 'semester') {
    agendamientosQuery = sql`SELECT COUNT(*)::int as total FROM agendamientos WHERE date_trunc('year', dia) + interval '6 months' * (EXTRACT(QUARTER FROM dia) > 2)::int = date_trunc('year', timezone('America/Bogota', NOW())::date) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())::date) > 2)::int`;
  } else {
    agendamientosQuery = sql`SELECT COUNT(*)::int as total FROM agendamientos WHERE date_trunc('month', dia) = date_trunc('month', timezone('America/Bogota', NOW())::date)`;
  }
  const agendamientosPeriodo = await agendamientosQuery;
  
  
  // Ingresos reales
  const ventasMesActual = await sql`
    SELECT COUNT(*)::int as cantidad, 
    COALESCE(${ingresosFormula}, 0)::numeric as ingresos 
    FROM ventas v WHERE v.fecha >= ${startDateActual}
  `;
  const ventasMesAnterior = await sql`
    SELECT COUNT(*)::int as cantidad, 
    COALESCE(${ingresosFormula}, 0)::numeric as ingresos 
    FROM ventas v WHERE v.fecha >= ${startDateAnterior} AND v.fecha < ${endDateAnterior}
  `;
  
  const clientesNuevosSemana = await sql`SELECT COUNT(*)::int as total FROM clientes WHERE id_cliente > (SELECT COALESCE(MAX(id_cliente), 0) - 10 FROM clientes) AND id_usuario IS NOT NULL`;
  const estadoReparaciones = await sql`SELECT estado, COUNT(*)::int as cantidad FROM reparaciones GROUP BY estado ORDER BY cantidad DESC`;
  const topServicios = await sql`SELECT s.nombre, COUNT(*)::int as cantidad FROM reparaciones_servicios rs JOIN servicios s ON rs.id_servicio = s.id_servicio GROUP BY s.nombre ORDER BY cantidad DESC LIMIT 5`;
  
  const proximosAgendamientos = await sql`
    SELECT 
      'agendamiento' as tipo,
      CONCAT('Agendamiento #', a.id_agendamiento, ' - ', c.nombre, ' ', c.apellido, ' (', m.placa, ')') as descripcion, 
      (a.dia::date + a.horainicio::time)::timestamp as fecha
    FROM agendamientos a 
    LEFT JOIN reparaciones r ON r.id_agendamiento = a.id_agendamiento 
    LEFT JOIN motocicletas m ON r.id_motocicleta = m.id_motocicleta 
    LEFT JOIN clientes c ON m.id_cliente = c.id_cliente
    WHERE (a.dia::date + a.horainicio::time)::timestamp >= timezone('America/Bogota', NOW())
      AND LOWER(a.estado) NOT IN ('anulado', 'anulada')
    ORDER BY fecha ASC 
    LIMIT 5
  `;

  // Gráfica de ingresos con "Rellenador" de ceros
  const chartDataRaw = await chartQuery;
  const paddingDates = generateDateRange(period);
  
  const chartFinal = paddingDates.map(pad => {
    let match;
    if (period === 'day' || period === 'month') {
      match = chartDataRaw.find(r => r.grouping === pad.dateStr);
    } else {
      match = chartDataRaw.find(r => r.idx === pad.offset);
    }
    return {
      mes: pad.label,
      total: match ? parseFloat(match.total) : 0,
      dateStr: pad.dateStr || null,
      offset: pad.offset !== undefined ? pad.offset : null
    };
  });

  return {
    kpis: {
      ingresosMes: parseFloat(ventasMesActual[0].ingresos) || 0,
      ingresosMesAnterior: parseFloat(ventasMesAnterior[0].ingresos) || 0,
      ventasMes: ventasMesActual[0].cantidad,
      ventasMesAnterior: ventasMesAnterior[0].cantidad,
      reparacionesActivas: reparacionesActivas[0].total,
      agendamientosPeriodo: agendamientosPeriodo[0].total,
      totalClientes: clientesCount[0].total,
      totalMotos: motosCount[0].total,
      clientesNuevosSemana: clientesNuevosSemana[0].total,
      period: period
    },
    charts: {
      ingresosMensuales: chartFinal,
      estadoReparaciones: estadoReparaciones.map(r => ({ estado: r.estado, cantidad: r.cantidad })),
      topServicios: topServicios.map(r => ({ nombre: r.nombre, cantidad: r.cantidad }))
    },
    recentActivity: proximosAgendamientos.map(r => ({ tipo: r.tipo, descripcion: r.descripcion, fecha: r.fecha }))
  };
};

const getPeriodSales = async (period, dateStr, offset) => {
  const sql = await getPool();
  let filter = sql``;

  if (period === 'day') {
    filter = sql`WHERE v.fecha::date = ${dateStr}::date`;
  } else if (period === 'month') {
    filter = sql`WHERE to_char(v.fecha, 'YYYY-MM') = ${dateStr}`;
  } else if (period === 'week') {
    const off = parseInt(offset) || 0;
    filter = sql`WHERE v.fecha >= date_trunc('week', timezone('America/Bogota', NOW())) - interval '1 week' * ${off}
                   AND v.fecha < date_trunc('week', timezone('America/Bogota', NOW())) - interval '1 week' * ${off - 1}`;
  } else if (period === 'quarter') {
    const off = parseInt(offset) || 0;
    filter = sql`WHERE v.fecha >= date_trunc('quarter', timezone('America/Bogota', NOW())) - interval '3 months' * ${off}
                   AND v.fecha < date_trunc('quarter', timezone('America/Bogota', NOW())) - interval '3 months' * ${off - 1}`;
  } else if (period === 'semester') {
    const off = parseInt(offset) || 0;
    const semesterStart = sql`date_trunc('year', timezone('America/Bogota', NOW())) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) > 2)::int`;
    filter = sql`WHERE v.fecha >= ${semesterStart} - interval '6 months' * ${off}
                   AND v.fecha < ${semesterStart} - interval '6 months' * ${off - 1}`;
  }

  const sales = await sql`
    SELECT v.id_venta AS "ID_Venta", v.fecha AS "Fecha", v.total AS "Total", v.observaciones AS "Observaciones",
           e.nombre AS "NombreEmpleado", e.apellido AS "ApellidoEmpleado",
           m.placa AS "Placa", m.marca AS "MarcaMoto", m.modelo AS "ModeloMoto",
           c.nombre AS "NombreCliente", c.apellido AS "ApellidoCliente",
           (
             SELECT COALESCE(SUM(s.precio), 0)::numeric
             FROM reparaciones_servicios rs
             JOIN servicios s ON rs.id_servicio = s.id_servicio
             WHERE rs.id_reparacion = v.id_reparacion AND rs.estado != 'Anulado'
           ) AS "CostoServicios",
           (
             SELECT COALESCE(SUM(dc.subtotal), 0)::numeric
             FROM compras c_ref
             JOIN detalle_compras dc ON c_ref.id_compra = dc.id_compra
             WHERE c_ref.id_reparacion = v.id_reparacion AND c_ref.estado != 'Anulado'
           ) AS "CostoRepuestos",
           (
             SELECT COALESCE(json_agg(s.nombre), '[]'::json)
             FROM reparaciones_servicios rs
             JOIN servicios s ON rs.id_servicio = s.id_servicio
             WHERE rs.id_reparacion = v.id_reparacion AND rs.estado != 'Anulado'
           ) AS "servicios",
           (
             SELECT COALESCE(json_agg(json_build_object(
               'product', p.nombre, 
               'quantity', dc.cantidad, 
               'unitCost', dc.preciounitario, 
               'total', dc.subtotal
             )), '[]'::json)
             FROM compras c_ref
             JOIN detalle_compras dc ON c_ref.id_compra = dc.id_compra
             JOIN productos p ON dc.id_producto = p.id_producto
             WHERE c_ref.id_reparacion = v.id_reparacion AND c_ref.estado != 'Anulado'
           ) AS "repuestos"
    FROM ventas v
    LEFT JOIN empleados e ON v.id_empleado = e.id_empleado
    LEFT JOIN motocicletas m ON v.id_motocicleta = m.id_motocicleta
    LEFT JOIN clientes c ON m.id_cliente = c.id_cliente
    ${filter}
    ORDER BY v.fecha DESC
  `;

  return sales;
};

module.exports = { getStats, getPeriodSales };
