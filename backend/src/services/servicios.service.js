const { getPool } = require('../config/db');

const getAll = async () => {
    const sql = await getPool();
    return await sql`SELECT id_servicio AS "ID_Servicio", nombre AS "Nombre", descripcion AS "Descripcion", duracion AS "Duracion", precio AS "Precio", estado AS "Estado" FROM servicios ORDER BY id_servicio`;
};

const getById = async (id) => {
    const sql = await getPool();
    const rows = await sql`SELECT id_servicio AS "ID_Servicio", nombre AS "Nombre", descripcion AS "Descripcion", duracion AS "Duracion", precio AS "Precio", estado AS "Estado" FROM servicios WHERE id_servicio = ${id}`;
    if (rows.length === 0) throw { status: 404, message: 'Servicio no encontrado.' };
    return rows[0];
};

const create = async (data) => {
    const { nombre, descripcion, duracion, precio } = data;
    console.log('📦 Intentando crear servicio:', { nombre, descripcion, duracion, precio });
    
    const sql = await getPool();

    // Validar nombre duplicado
    const [existing] = await sql`SELECT 1 FROM servicios WHERE LOWER(nombre) = LOWER(${nombre})`;
    if (existing) throw { status: 400, message: 'Ya existe un servicio con este nombre.' };

    const [row] = await sql`
        INSERT INTO servicios (nombre, descripcion, duracion, precio, estado) 
        VALUES (
            ${nombre}, 
            ${descripcion ?? null}, 
            ${parseInt(duracion) || 30}, 
            ${parseFloat(precio) || 0}, 
            TRUE
        )
        RETURNING id_servicio AS "ID_Servicio", nombre AS "Nombre", descripcion AS "Descripcion", duracion AS "Duracion", precio AS "Precio", estado AS "Estado"
    `;
    return row;
};

const update = async (id, data) => {
    const { nombre, descripcion, duracion, precio, estado } = data;
    console.log('📦 Intentando actualizar servicio ID:', id, 'con datos:', { nombre, descripcion, duracion, precio, estado });

    const sql = await getPool();

    // Validar nombre duplicado
    const [existing] = await sql`SELECT 1 FROM servicios WHERE LOWER(nombre) = LOWER(${nombre}) AND id_servicio <> ${id}`;
    if (existing) throw { status: 400, message: 'Ya existe otro servicio con este nombre.' };

    const [row] = await sql`
        UPDATE servicios 
        SET 
            nombre = ${nombre}, 
            descripcion = ${descripcion ?? null}, 
            duracion = ${parseInt(duracion) || 30}, 
            precio = ${parseFloat(precio) || 0}, 
            estado = ${estado ?? true} 
        WHERE id_servicio = ${id}
        RETURNING id_servicio AS "ID_Servicio", nombre AS "Nombre", descripcion AS "Descripcion", duracion AS "Duracion", precio AS "Precio", estado AS "Estado"
    `;
    if (!row) throw { status: 404, message: 'Servicio no encontrado.' };

    if (estado === false) {
        const agendamientos = await sql`SELECT 1 FROM agendamientos_servicios WHERE id_servicio = ${id} LIMIT 1`;
        const reparaciones = await sql`SELECT 1 FROM reparaciones_servicios WHERE id_servicio = ${id} LIMIT 1`;
        if (agendamientos.length > 0 || reparaciones.length > 0) {
            await sql`UPDATE servicios SET estado = TRUE WHERE id_servicio = ${id}`;
            throw { status: 400, message: 'No se puede inactivar el servicio porque está siendo utilizado en agendamientos o reparaciones.' };
        }
    }

    return row;
};

const remove = async (id) => {
    const sql = await getPool();

    const agendamientos = await sql`SELECT 1 FROM agendamientos_servicios WHERE id_servicio = ${id} LIMIT 1`;
    const reparaciones = await sql`SELECT 1 FROM reparaciones_servicios WHERE id_servicio = ${id} LIMIT 1`;

    if (agendamientos.length > 0 || reparaciones.length > 0) {
        throw { status: 400, message: 'No se puede eliminar el servicio porque tiene historial de uso. Considere inactivarlo.' };
    }

    const [row] = await sql`
        DELETE FROM servicios 
        WHERE id_servicio = ${id}
        RETURNING id_servicio
    `;
    if (!row) throw { status: 404, message: 'Servicio no encontrado.' };
    return { message: 'Servicio eliminado.' };
};

module.exports = { getAll, getById, create, update, remove };
