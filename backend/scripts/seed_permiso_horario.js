const { getPool } = require('../src/config/db');

async function seedPermiso() {
    try {
        const sql = await getPool();
        
        // 1. Insertar el permiso ver_horario si no existe
        let permisos = await sql`SELECT id_permiso FROM permisos WHERE nombre = 'ver_horario'`;
        let idPermiso;
        
        if (permisos.length === 0) {
            const [permiso] = await sql`
                INSERT INTO permisos (nombre, descripcion)
                VALUES ('ver_horario', 'Permite al empleado visualizar su propio horario de trabajo')
                RETURNING id_permiso;
            `;
            idPermiso = permiso.id_permiso;
        } else {
            idPermiso = permisos[0].id_permiso;
        }
        console.log('Permiso ver_horario insertado/obtenido con ID:', idPermiso);
        
        // 2. Obtener el ID del rol "Mecánico" (suponiendo que existe)
        const roles = await sql`SELECT id_rol FROM roles WHERE LOWER(nombre) = 'mecánico' OR LOWER(nombre) = 'mecanico' LIMIT 1;`;
        
        if (roles.length === 0) {
            console.log('No se encontró el rol de Mecánico.');
            return;
        }
        
        const idRol = roles[0].id_rol;
        console.log('Rol Mecánico encontrado con ID:', idRol);
        
        // 3. Asignar el permiso al rol Mecánico si no lo tiene
        const rolesPermisos = await sql`
            SELECT 1 FROM roles_permisos WHERE id_rol = ${idRol} AND id_permiso = ${idPermiso}
        `;
        
        if (rolesPermisos.length === 0) {
            await sql`
                INSERT INTO roles_permisos (id_rol, id_permiso)
                VALUES (${idRol}, ${idPermiso});
            `;
        }
        
        console.log('Permiso asignado al rol Mecánico exitosamente.');
        
        process.exit(0);
    } catch (err) {
        console.error('Error al insertar el permiso:', err);
        process.exit(1);
    }
}

seedPermiso();
