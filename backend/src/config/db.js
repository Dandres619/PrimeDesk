const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Error: DATABASE_URL no está definida en el archivo .env');
}

const sql = postgres(connectionString, {
    ssl: 'require', // Supabase requiere SSL
    max: 10,
    idle_timeout: 30,
    connect_timeout: 30
});

/**
 * En PostgreSQL.js, el objeto 'sql' ya actúa como el pool de conexiones.
 * Para mantener compatibilidad con el código existente, creamos un simulador de getPool.
 */
const getPool = async () => {
    return sql;
};

// Log de éxito (Postgres.js se conecta bajo demanda, pero validamos la cadena básica)
console.log('✅ Configuración de PostgreSQL (Supabase) cargada.');

module.exports = { sql, getPool };
