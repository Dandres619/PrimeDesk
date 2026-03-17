const bcrypt = require('bcryptjs');
const { sql } = require('./src/config/db');

async function crearEmpleados() {
    const empleados = [
        { correo: 'mecanico@primedesk.com', password: 'mecanico123', nombre: "Mecánico", apellido: "Test", id_rol: 2 }
    ];

    try {
        for (const emp of empleados) {
            console.log(`Procesando ${emp.correo}...`);
            const hashedPassword = await bcrypt.hash(emp.password, 10);

            const [user] = await sql`
                INSERT INTO usuarios (correo, contrasena, id_rol, estado, correo_verificado)
                VALUES (${emp.correo}, ${hashedPassword}, ${emp.id_rol}, TRUE, TRUE)
                ON CONFLICT (correo) DO UPDATE SET contrasena = ${hashedPassword}, correo_verificado = TRUE
                RETURNING id_usuario
            `;

            if (emp.id_rol === 2) { // Si es mecánico, crear perfil de empleado si no existe
                const existingEmp = await sql`SELECT 1 FROM empleados WHERE id_usuario = ${user.id_usuario}`;
                if (existingEmp.length === 0) {
                    await sql`
                        INSERT INTO empleados (id_usuario, nombre, apellido, tipodocumento, documento, telefono, barrio, direccion, fechanacimiento, fechaingreso)
                        VALUES (${user.id_usuario}, ${emp.nombre}, ${emp.apellido}, 'CC', '12345678', '3001234567', 'Central', 'Calle 123', '1990-01-01', NOW())
                    `;
                    console.log(`Perfil de empleado creado para ${emp.correo}`);
                }
            }
        }
        console.log('✅ Usuarios creados/actualizados exitosamente.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        process.exit();
    }
}

crearEmpleados();
