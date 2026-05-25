const { Router } = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const dashboardService = require('../services/dashboard.service');

const router = Router();

router.get('/stats', verifyToken, async (req, res) => {
  try {
    const period = req.query.period || 'month';
    console.log(`[Dashboard Route] GET /stats requested. Period: ${period}`);
    const stats = await dashboardService.getStats(period);
    console.log(`[Dashboard Route] Result for period ${period} - agendamientosPeriodo: ${stats?.kpis?.agendamientosPeriodo}`);
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard.' });
  }
});

router.get('/period-sales', verifyToken, async (req, res) => {
  try {
    const { period, dateStr, offset } = req.query;
    const sales = await dashboardService.getPeriodSales(period, dateStr, offset);
    res.json(sales);
  } catch (error) {
    console.error('Error al obtener ventas del periodo:', error);
    res.status(500).json({ error: 'Error al obtener ventas del periodo.' });
  }
});

module.exports = router;
