const { getPool } = require('./src/config/db');

async function main() {
    const sql = await getPool();
    const us = await sql`SELECT id_usuario, correo, id_rol FROM usuarios`;
    const em = await sql`SELECT id_empleado, id_usuario, nombre, apellido, tipodocumento, documento, telefono, barrio, direccion FROM empleados`;
    console.log(JSON.stringify({ us, em }, null, 2));
    process.exit();
}
main();
