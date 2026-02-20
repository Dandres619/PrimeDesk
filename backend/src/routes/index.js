const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/roles', require('./roles.routes'));
router.use('/permisos', require('./permisos.routes'));
router.use('/usuarios', require('./usuarios.routes'));
router.use('/empleados', require('./empleados.routes'));
router.use('/clientes', require('./clientes.routes'));
router.use('/categorias', require('./categorias.routes'));
router.use('/productos', require('./productos.routes'));
router.use('/proveedores', require('./proveedores.routes'));
router.use('/motocicletas', require('./motocicletas.routes'));
router.use('/servicios', require('./servicios.routes'));
router.use('/agendamientos', require('./agendamientos.routes'));
router.use('/reparaciones', require('./reparaciones.routes'));
router.use('/compras', require('./compras.routes'));
router.use('/ventas', require('./ventas.routes'));

module.exports = router;
