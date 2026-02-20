const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', (err) => {
    console.error('❌ Error en el pool de conexión a SQL Server:', err);
});

/**
 * Retorna la conexión activa al pool de SQL Server.
 * @returns {Promise<sql.ConnectionPool>}
 */
const getPool = async () => {
    await poolConnect;
    return pool;
};

module.exports = { sql, getPool };
