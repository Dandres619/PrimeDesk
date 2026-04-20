const {getPool} = require('./backend/src/config/db');
(async () => {
    const sql = await getPool();
    const e = await sql`SELECT id_empleado FROM empleados LIMIT 1`;
    console.log("Empleado:", e);
    process.exit(0);
})();
