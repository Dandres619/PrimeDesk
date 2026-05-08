const { sql } = require('../config/db');

async function checkSchema() {
  try {
    const rows = await sql`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clientes' AND column_name = 'fechanacimiento';
    `;
    console.log('Clientes fechanacimiento:', rows[0]);

    const rows2 = await sql`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'empleados' AND column_name = 'fechanacimiento';
    `;
    console.log('Empleados fechanacimiento:', rows2[0]);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkSchema();
