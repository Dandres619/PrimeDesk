#!/usr/bin/env node
/**
 * Crea la columna correo_verificado en usuarios y la tabla email_verifications.
 */
const { getPool } = require('../config/db');

const run = async () => {
    try {
        const sql = await getPool();

        await sql`
            ALTER TABLE usuarios
            ADD COLUMN IF NOT EXISTS correo_verificado boolean DEFAULT FALSE;
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS email_verifications (
                id BIGSERIAL PRIMARY KEY,
                id_usuario bigint NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                token_hash text NOT NULL,
                expires_at timestamptz NOT NULL,
                used boolean NOT NULL DEFAULT FALSE,
                created_at timestamptz DEFAULT NOW()
            );
        `;

        console.log('✅ Verificacion: columna y tabla creadas o ya existentes.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creando tablas de verificacion:', err);
        process.exit(1);
    }
};

run();
