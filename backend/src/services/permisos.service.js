const { getPool } = require('../config/db');

const getAll = async () => {
    const sql = await getPool();
    return await sql`SELECT id_permiso AS "ID_Permiso", nombre AS "Nombre", descripcion AS "Descripcion" FROM permisos ORDER BY id_permiso`;
};

const getById = async (id) => {
    const sql = await getPool();
    const rows = await sql`SELECT id_permiso AS "ID_Permiso", nombre AS "Nombre", descripcion AS "Descripcion" FROM permisos WHERE id_permiso = ${id}`;
    if (rows.length === 0) throw { status: 404, message: 'Permiso no encontrado.' };
    return rows[0];
};

const create = async ({ nombre, descripcion }) => {
    const sql = await getPool();
    const [row] = await sql`
        INSERT INTO permisos (nombre, descripcion)
        VALUES (${nombre}, ${descripcion || null})
        RETURNING id_permiso AS "ID_Permiso", nombre AS "Nombre", descripcion AS "Descripcion"
    `;
    return row;
};

const update = async (id, { nombre, descripcion }) => {
    const sql = await getPool();
    const [row] = await sql`
        UPDATE permisos SET nombre = ${nombre}, descripcion = ${descripcion || null}
        WHERE id_permiso = ${id}
        RETURNING id_permiso AS "ID_Permiso", nombre AS "Nombre", descripcion AS "Descripcion"
    `;
    if (!row) throw { status: 404, message: 'Permiso no encontrado.' };
    return row;
};

const remove = async (id) => {
    const sql = await getPool();
    const [row] = await sql`
        DELETE FROM permisos 
        WHERE id_permiso = ${id}
        RETURNING id_permiso AS "ID_Permiso"
    `;
    if (!row) throw { status: 404, message: 'Permiso no encontrado.' };
    return { message: 'Permiso eliminado.' };
};

module.exports = { getAll, getById, create, update, remove };
