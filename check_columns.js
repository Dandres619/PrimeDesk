const { getPool } = require('./backend/src/config/db');

async function checkColumns() {
  const sql = await getPool();
  const tables = ['compras', 'compras_detalle', 'ventas', 'ventas_detalle', 'productos'];

  for (const table of tables) {
    try {
      const resp = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${table}
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      console.log(`Table: ${table}`);
      console.table(resp);
    } catch (err) {
      console.error(`Error checking ${table}:`, err.message);
    }
  }
}

checkColumns();
