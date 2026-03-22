const { getPool } = require('./src/config/db');
require('dotenv').config();

async function check() {
  const sql = await getPool();
  try {
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'compras'
    `;
    console.log('COMPRAS COLUMNS:', cols);
    
    const reps = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reparaciones'
    `;
    console.log('REPARACIONES COLUMNS:', reps);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
check();
