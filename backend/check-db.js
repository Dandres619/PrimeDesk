
const { getPool } = require('./src/config/db');

async function checkTableInfo() {
    const sql = await getPool();
    try {
        console.log('--- Tabla Clientes ---');
        const clientesCols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'clientes'
        `;
        clientesCols.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

        console.log('\n--- Tabla Empleados ---');
        const empleadosCols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'empleados'
        `;
        empleadosCols.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkTableInfo();
