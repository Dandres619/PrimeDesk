const { sql } = require('./src/config/db');

async function seed() {
    try {
        console.log('Sembrando roles...');
        await sql.unsafe(`
            INSERT INTO roles (id_rol, nombre, estado) 
            VALUES (1, 'Administrador', true), (2, 'Empleado', true), (3, 'Cliente', true) 
            ON CONFLICT (id_rol) DO NOTHING
        `);
        console.log('✅ Roles insertados/verificados.');
    } catch (err) {
        console.error('❌ Error sembrando:', err.message);
    } finally {
        process.exit();
    }
}

seed();
