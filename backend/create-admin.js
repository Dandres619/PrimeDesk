const bcrypt = require('bcryptjs');
const { sql } = require('./src/config/db');

async function createAdmin() {
    try {
        console.log('Creando admin por defecto...');
        const hashed = await bcrypt.hash('admin123', 10);
        await sql.unsafe(`
            INSERT INTO usuarios (id_rol, correo, contrasena, estado, correo_verificado) 
            VALUES (1, 'admin@primedesk.com', '${hashed}', true, true) 
            ON CONFLICT (correo) DO UPDATE SET correo_verificado = true
        `);
        console.log('✅ Admin creado/verificado (admin@primedesk.com / admin123).');
    } catch (err) {
        console.error('❌ Error creando admin:', err.message);
    } finally {
        process.exit();
    }
}

createAdmin();
