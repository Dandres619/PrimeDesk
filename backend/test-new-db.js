const postgres = require('postgres');
require('dotenv').config();

async function testConnection() {
    const url = process.env.DATABASE_URL;
    console.log('--- Probando Nueva URL ---');
    console.log('URL a probar:', url.replace(/:[^:@]+@/, ':****@')); // Ocultar pass

    const sql = postgres(url, {
        ssl: 'require',
        connect_timeout: 10
    });

    try {
        const result = await sql`SELECT 1 as connected`;
        if (result && result.length > 0) {
            console.log('✅ ÉXITO: Conexión establecida correctamente!');
        }
    } catch (error) {
        console.error('❌ FALLO:', error.message);
        if (error.message.includes('ENOTFOUND')) {
            console.log('\nSugerencia: El host no se encuentra. Verifica que la URL no tenga espacios extra o caracteres invisibles.');
        }
    } finally {
        await sql.end();
        process.exit();
    }
}

testConnection();
