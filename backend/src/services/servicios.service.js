const { getPool } = require('../config/db');

const getAll = async () => {
    const sql = await getPool();
    return await sql`SELECT id_servicio AS "ID_Servicio", nombre AS "Nombre", descripcion AS "Descripcion", estado AS "Estado" FROM servicios ORDER BY id_servicio`;
};

const getById = async (id) => {
    const sql = await getPool();
    const rows = await sql`SELECT id_servicio AS "ID_Servicio", nombre AS "Nombre", descripcion AS "Descripcion", estado AS "Estado" FROM servicios WHERE id_servicio = ${id}`;
    if (rows.length === 0) throw { status: 404, message: 'Servicio no encontrado.' };
    return rows[0];
};

const create = async ({ nombre, descripcion }) => {
    const sql = await getPool();
    const [row] = await sql`
        INSERT INTO servicios (nombre, descripcion, estado) 
        VALUES (${nombre}, ${descripcion || null}, TRUE)
        RETURNING id_servicio AS "ID_Servicio", nombre AS "Nombre", descripcion AS "Descripcion", estado AS "Estado"
    `;
    return row;
};

const update = async (id, { nombre, descripcion, estado }) => {
    const sql = await getPool();
    const [row] = await sql`
        UPDATE servicios 
        SET nombre = ${nombre}, descripcion = ${descripcion || null}, estado = ${estado} 
        WHERE id_servicio = ${id}
        RETURNING id_servicio AS "ID_Servicio", nombre AS "Nombre", descripcion AS "Descripcion", estado AS "Estado"
    `;
    if (!row) throw { status: 404, message: 'Servicio no encontrado.' };
    return row;
};

const remove = async (id) => {
    const sql = await getPool();
    const [row] = await sql`
        DELETE FROM servicios 
        WHERE id_servicio = ${id}
        RETURNING id_servicio
    `;
    if (!row) throw { status: 404, message: 'Servicio no encontrado.' };
    return { message: 'Servicio eliminado.' };
};

module.exports = { getAll, getById, create, update, remove };
