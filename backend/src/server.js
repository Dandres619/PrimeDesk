require('dotenv').config();
const app = require('./app');
const { getPool } = require('./config/db');

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        // Verificar conexión a la BD antes de levantar el servidor
        await getPool();
        console.log('✅ Conexión a SQL Server establecida correctamente.');

        app.listen(PORT, () => {
            console.log(`🚀 PrimeDeskDB API corriendo en http://localhost:${PORT}`);
            console.log(`📋 Health check: http://localhost:${PORT}/health`);
        });
    } catch (err) {
        console.error('❌ Error al iniciar el servidor:', err.message);
        process.exit(1);
    }
};

start();
