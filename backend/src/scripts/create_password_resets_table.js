#!/usr/bin/env node
/**
 * Script migrate: crea la tabla password_resets si no existe.
 */
const { getPool } = require('../config/db');

const createTable = async () => {
    try {
        const sql = await getPool();

        await sql`
            CREATE TABLE IF NOT EXISTS password_resets (
                id BIGSERIAL PRIMARY KEY,
                id_usuario bigint NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                token_hash text NOT NULL,
                expires_at timestamptz NOT NULL,
                used boolean NOT NULL DEFAULT FALSE,
                created_at timestamptz DEFAULT NOW()
            )
        `;

        console.log('✅ Tabla password_resets creada o ya existente.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creando la tabla password_resets:', err);
        process.exit(1);
    }
};

createTable();
