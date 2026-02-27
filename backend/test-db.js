const { sql } = require('./src/config/db');
const postgres = require('postgres');

async function testConnection() {
    console.log('--- Iniciando prueba de conexión ---');

    const tryConnection = async (connStr, label) => {
        console.log(`\nProbando: ${label}...`);
        const testSql = postgres(connStr, { ssl: 'require', timeout: 10 });
        try {
            const result = await testSql`SELECT 1 as connected`;
            if (result && result.length > 0) {
                console.log(`✅ ÉXITO con ${label}`);
                return true;
            }
        } catch (error) {
            console.error(`❌ FALLO con ${label}: ${error.message}`);
        } finally {
            await testSql.end();
        }
        return false;
    };

    const originalUrl = process.env.DATABASE_URL;

    // Intento 1: Original
    if (await tryConnection(originalUrl, 'URL original')) return;

    // Intento 2: Solo 'postgres' como usuario (a veces el pooler prefiere esto si el host es específico)
    const urlOnlyPostgres = originalUrl.replace('postgres.ynigfdldjybizqysmnaf', 'postgres');
    if (await tryConnection(urlOnlyPostgres, 'Usuario solo "postgres"')) return;

    // Intento 3: Codificando el punto
    const urlEncodedUser = originalUrl.replace('postgres.ynigfdldjybizqysmnaf', encodeURIComponent('postgres.ynigfdldjybizqysmnaf'));
    if (await tryConnection(urlEncodedUser, 'Usuario con punto codificado')) return;

    // Intento 4: Usuario "postgres" y proyecto en options (formato alternativo de Supavisor)
    const urlWithOptions = originalUrl.replace('postgres.ynigfdldjybizqysmnaf', 'postgres') + (originalUrl.includes('?') ? '&' : '?') + 'options=project%3Dynigfdldjybizqysmnaf';
    if (await tryConnection(urlWithOptions, 'Proyecto en "options" param')) return;

    // Intento 5: Sin el pooler (puerto estándar 5432) - Si este funciona, el problema es el pooler
    const urlDirect = originalUrl.replace('pooler.supabase.com:6543', 'db.ynigfdldjybizqysmnaf.supabase.co:5432');
    if (await tryConnection(urlDirect, 'Conexión directa (puerto 5432)')) return;

    // Intento 6: Formato de objeto (más robusto con caracteres especiales)
    const tryObjectConnection = async () => {
        console.log(`\nProbando: Formato de Objeto...`);
        const testSql = postgres({
            host: 'aws-1-us-east-1.pooler.supabase.com',
            port: 6543,
            database: 'postgres',
            username: 'postgres.ynigfdldjybizqysmnaf',
            password: 'primedesksena2026*',
            ssl: 'require',
            idle_timeout: 10
        });
        try {
            const result = await testSql`SELECT 1 as connected`;
            if (result && result.length > 0) {
                console.log(`✅ ÉXITO con Formato de Objeto`);
                return true;
            }
        } catch (error) {
            console.error(`❌ FALLO con Formato de Objeto: ${error.message}`);
        } finally {
            await testSql.end();
        }
        return false;
    };
    if (await tryObjectConnection()) return;

    console.log('\nNingún formato funcionó. CONCLUSIÓN: Las credenciales (usuario/proyecto o contraseña) en el .env son incorrectas.');
    process.exit();
}

testConnection();
