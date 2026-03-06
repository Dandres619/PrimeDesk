const { getPool } = require('../config/db');

const getAll = async () => {
    const sql = await getPool();
    return await sql`SELECT id_rol AS "ID_Rol", nombre AS "Nombre", descripcion AS "Descripcion", estado AS "Estado" FROM roles ORDER BY id_rol`;
};

const getById = async (id) => {
    const sql = await getPool();
    const rows = await sql`SELECT id_rol AS "ID_Rol", nombre AS "Nombre", descripcion AS "Descripcion", estado AS "Estado" FROM roles WHERE id_rol = ${id}`;
    if (rows.length === 0) throw { status: 404, message: 'Rol no encontrado.' };
    return rows[0];
};

const create = async ({ nombre, descripcion }) => {
    const sql = await getPool();
    const [row] = await sql`
        INSERT INTO roles (nombre, descripcion, estado)
        VALUES (${nombre}, ${descripcion || null}, TRUE)
        RETURNING id_rol AS "ID_Rol", nombre AS "Nombre", descripcion AS "Descripcion", estado AS "Estado"
    `;
    return row;
};

const update = async (id, { nombre, descripcion, estado }) => {
    const sql = await getPool();

    // Si se intenta desactivar el rol (estado = false)
    if (estado === false) {
        const usersCount = await sql`SELECT COUNT(*) FROM usuarios WHERE id_rol = ${id} AND estado = TRUE`;
        if (parseInt(usersCount[0].count) > 0) {
            throw { status: 400, message: 'No se puede desactivar el rol dado que hay uno o más usuarios que tienen este rol activo.' };
        }
    }

    const [row] = await sql`
        UPDATE roles SET nombre = ${nombre}, descripcion = ${descripcion || null}, estado = ${estado}
        WHERE id_rol = ${id}
        RETURNING id_rol AS "ID_Rol", nombre AS "Nombre", descripcion AS "Descripcion", estado AS "Estado"
    `;
    if (!row) throw { status: 404, message: 'Rol no encontrado.' };
    return row;
};

const remove = async (id) => {
    const sql = await getPool();

    // 1. Verificar si hay usuarios con este rol
    const usersCount = await sql`SELECT COUNT(*) FROM usuarios WHERE id_rol = ${id} AND estado = TRUE`;
    if (parseInt(usersCount[0].count) > 0) {
        throw { status: 400, message: 'No se puede eliminar el rol dado que hay uno o más usuarios que tienen este rol activo.' };
    }

    return await sql.begin(async (tx) => {
        // 2. Eliminar primero los permisos asociados para evitar violación de llave foránea
        await tx`DELETE FROM roles_permisos WHERE id_rol = ${id}`;

        // 3. Eliminar el rol
        const [row] = await tx`
            DELETE FROM roles 
            WHERE id_rol = ${id}
            RETURNING id_rol
        `;

        if (!row) throw { status: 404, message: 'Rol no encontrado.' };
        return { message: 'Rol eliminado correctamente.' };
    });
};

// Gestión de permisos de un rol
const getPermisosByRol = async (id_rol) => {
    const sql = await getPool();
    return await sql`
        SELECT p.id_permiso AS "ID_Permiso", p.nombre AS "Nombre", p.descripcion AS "Descripcion"
        FROM roles_permisos rp
        INNER JOIN permisos p ON rp.id_permiso = p.id_permiso
        WHERE rp.id_rol = ${id_rol}
    `;
};

const asignarPermiso = async (id_rol, id_permiso) => {
    const sql = await getPool();
    // Verificar si ya existe
    const exists = await sql`
        SELECT 1 FROM roles_permisos 
        WHERE id_rol = ${id_rol} AND id_permiso = ${id_permiso}
    `;
    if (exists.length > 0) throw { status: 409, message: 'El permiso ya está asignado a este rol.' };

    await sql`
        INSERT INTO roles_permisos (id_rol, id_permiso) 
        VALUES (${id_rol}, ${id_permiso})
    `;
    return { message: 'Permiso asignado correctamente.' };
};

const quitarPermiso = async (id_rol, id_permiso) => {
    const sql = await getPool();
    const [row] = await sql`
        DELETE FROM roles_permisos 
        WHERE id_rol = ${id_rol} AND id_permiso = ${id_permiso}
        RETURNING id_rol, id_permiso
    `;
    if (!row) throw { status: 404, message: 'Asignación no encontrada.' };
    return { message: 'Permiso removido del rol.' };
};

module.exports = { getAll, getById, create, update, remove, getPermisosByRol, asignarPermiso, quitarPermiso };
