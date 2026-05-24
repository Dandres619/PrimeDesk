const { getPool } = require('../config/db');

// Función auxiliar para rellenar ceros en las gráficas
const generateDateRange = (period) => {
  const dates = [];
  const now = new Date();
  
  if (period === 'day') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push({ label: d.toLocaleDateString('es-CO', { weekday: 'short' }), dateStr: d.toISOString().split('T')[0], total: 0 });
    }
  } else if (period === 'week') {
    for (let i = 3; i >= 0; i--) {
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
    startDateActual = sql`CURRENT_DATE`;
    startDateAnterior = sql`CURRENT_DATE - interval '1 day'`;
    endDateAnterior = sql`CURRENT_DATE`;
    chartQuery = sql`SELECT to_char(fecha, 'YYYY-MM-DD') as grouping, ${ingresosFormula}::numeric as total FROM ventas v WHERE fecha >= CURRENT_DATE - interval '6 days' GROUP BY grouping ORDER BY grouping`;
  } else if (period === 'week') {
    startDateActual = sql`date_trunc('week', timezone('America/Bogota', NOW()))`;
    startDateAnterior = sql`date_trunc('week', timezone('America/Bogota', NOW())) - interval '1 week'`;
    endDateAnterior = sql`date_trunc('week', timezone('America/Bogota', NOW()))`;
    chartQuery = sql`SELECT (EXTRACT(WEEK FROM timezone('America/Bogota', NOW())) - EXTRACT(WEEK FROM fecha))::int as idx, ${ingresosFormula}::numeric as total FROM ventas v WHERE fecha >= date_trunc('week', timezone('America/Bogota', NOW())) - interval '3 weeks' GROUP BY idx`;
  } else if (period === 'quarter') {
    startDateActual = sql`date_trunc('quarter', timezone('America/Bogota', NOW()))`;
    startDateAnterior = sql`date_trunc('quarter', timezone('America/Bogota', NOW())) - interval '3 months'`;
    endDateAnterior = sql`date_trunc('quarter', timezone('America/Bogota', NOW()))`;
    chartQuery = sql`SELECT (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) - EXTRACT(QUARTER FROM fecha) + (EXTRACT(YEAR FROM timezone('America/Bogota', NOW())) - EXTRACT(YEAR FROM fecha)) * 4)::int as idx, ${ingresosFormula}::numeric as total FROM ventas v WHERE fecha >= date_trunc('quarter', timezone('America/Bogota', NOW())) - interval '9 months' GROUP BY idx`;
  } else if (period === 'semester') {
    startDateActual = sql`date_trunc('year', timezone('America/Bogota', NOW())) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) > 2)::int`;
    startDateAnterior = sql`date_trunc('year', timezone('America/Bogota', NOW())) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) > 2)::int - interval '6 months'`;
    endDateAnterior = sql`date_trunc('year', timezone('America/Bogota', NOW())) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) > 2)::int`;
    chartQuery = sql`SELECT CASE WHEN fecha >= date_trunc('year', timezone('America/Bogota', NOW())) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) > 2)::int THEN 0 ELSE 1 END as idx, ${ingresosFormula}::numeric as total FROM ventas v WHERE fecha >= date_trunc('year', timezone('America/Bogota', NOW())) + interval '6 months' * (EXTRACT(QUARTER FROM timezone('America/Bogota', NOW())) > 2)::int - interval '6 months' GROUP BY idx`;
  } else { // month
    startDateActual = sql`date_trunc('month', timezone('America/Bogota', NOW()))`;
    startDateAnterior = sql`date_trunc('month', timezone('America/Bogota', NOW())) - interval '1 month'`;
    endDateAnterior = sql`date_trunc('month', timezone('America/Bogota', NOW()))`;
    chartQuery = sql`SELECT to_char(fecha, 'YYYY-MM') as grouping, ${ingresosFormula}::numeric as total FROM ventas v WHERE fecha >= (date_trunc('month', timezone('America/Bogota', NOW())) - interval '5 months') GROUP BY grouping ORDER BY grouping`;
  }

  // Ejecutamos secuencialmente
  const clientesCount = await sql`SELECT COUNT(*)::int as total FROM clientes`;
  const motosCount = await sql`SELECT COUNT(*)::int as total FROM motocicletas`;
  const reparacionesActivas = await sql`SELECT COUNT(*)::int as total FROM reparaciones WHERE estado NOT IN ('Reparación finalizada', 'Anulado', 'Anulada')`;

  let agendamientosQuery;
  if (period === 'day') {
    agendamientosQuery = sql`SELECT COUNT(*)::int as total FROM agendamientos WHERE dia = CURRENT_DATE`;
  } else if (period === 'week') {
    agendamientosQuery = sql`SELECT COUNT(*)::int as total FROM agendamientos WHERE date_trunc('week', dia) = date_trunc('week', CURRENT_DATE)`;
  } else if (period === 'quarter') {
    agendamientosQuery = sql`SELECT COUNT(*)::int as total FROM agendamientos WHERE date_trunc('quarter', dia) = date_trunc('quarter', CURRENT_DATE)`;
  } else if (period === 'semester') {
    agendamientosQuery = sql`SELECT COUNT(*)::int as total FROM agendamientos WHERE date_trunc('year', dia) + interval '6 months' * (EXTRACT(QUARTER FROM dia) > 2)::int = date_trunc('year', CURRENT_DATE) + interval '6 months' * (EXTRACT(QUARTER FROM CURRENT_DATE) > 2)::int`;
  } else {
    agendamientosQuery = sql`SELECT COUNT(*)::int as total FROM agendamientos WHERE date_trunc('month', dia) = date_trunc('month', CURRENT_DATE)`;
  }
  const agendamientosPeriodo = await agendamientosQuery;
  
  
  // Ingresos reales
  const ventasMesActual = await sql`
    SELECT COUNT(*)::int as cantidad, 
    COALESCE(${ingresosFormula}, 0)::numeric as ingresos 
    FROM ventas v WHERE fecha >= ${startDateActual}
  `;
  const ventasMesAnterior = await sql`
    SELECT COUNT(*)::int as cantidad, 
    COALESCE(${ingresosFormula}, 0)::numeric as ingresos 
    FROM ventas v WHERE fecha >= ${startDateAnterior} AND fecha < ${endDateAnterior}
  `;
  
  const clientesNuevosSemana = await sql`SELECT COUNT(*)::int as total FROM clientes WHERE id_cliente > (SELECT COALESCE(MAX(id_cliente), 0) - 10 FROM clientes) AND id_usuario IS NOT NULL`;
  const estadoReparaciones = await sql`SELECT estado, COUNT(*)::int as cantidad FROM reparaciones GROUP BY estado ORDER BY cantidad DESC`;
  const topServicios = await sql`SELECT s.nombre, COUNT(*)::int as cantidad FROM reparaciones_servicios rs JOIN servicios s ON rs.id_servicio = s.id_servicio GROUP BY s.nombre ORDER BY cantidad DESC LIMIT 5`;
  
  const actividadReciente = await sql`(
    SELECT 'venta' as tipo, CONCAT('Venta #', v.id_venta, ' - ', c.nombre, ' ', c.apellido) as descripcion, v.fecha as fecha
    FROM ventas v LEFT JOIN motocicletas m ON v.id_motocicleta = m.id_motocicleta LEFT JOIN clientes c ON m.id_cliente = c.id_cliente
    ORDER BY v.fecha DESC LIMIT 3
  ) UNION ALL (
    SELECT 'reparacion' as tipo, CONCAT('Reparación #', r.id_reparacion, ' - ', m.placa, ' (', m.marca, ' ', m.modelo, ')') as descripcion, COALESCE((SELECT MAX(rs.fecha_finalizacion) FROM reparaciones_servicios rs WHERE rs.id_reparacion = r.id_reparacion), timezone('America/Bogota', NOW())) as fecha
    FROM reparaciones r LEFT JOIN motocicletas m ON r.id_motocicleta = m.id_motocicleta
    ORDER BY r.id_reparacion DESC LIMIT 3
  ) UNION ALL (
    SELECT 'agendamiento' as tipo, CONCAT('Agendamiento #', a.id_agendamiento, ' - ', e.nombre, ' ', e.apellido) as descripcion, (a.dia::date + a.horainicio::time)::timestamp as fecha
    FROM agendamientos a LEFT JOIN empleados e ON a.id_empleado = e.id_empleado
    ORDER BY a.dia DESC, a.horainicio DESC LIMIT 3
  ) ORDER BY fecha DESC LIMIT 5`;

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
      total: match ? parseFloat(match.total) : 0
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
    recentActivity: actividadReciente.map(r => ({ tipo: r.tipo, descripcion: r.descripcion, fecha: r.fecha }))
  };
};

module.exports = { getStats };
