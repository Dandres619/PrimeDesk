const { getPool } = require('../config/db');

const getAll = async () => {
    const sql = await getPool();
    return await sql`SELECT * FROM "Proveedores" ORDER BY "ID_Proveedor"`;
};

const getById = async (id) => {
    const sql = await getPool();
    const rows = await sql`SELECT * FROM "Proveedores" WHERE "ID_Proveedor" = ${id}`;
    if (rows.length === 0) throw { status: 404, message: 'Proveedor no encontrado.' };
    return rows[0];
};

const create = async (data) => {
    const sql = await getPool();
    const { nombre_empresa, nit, persona_contacto, especialidad, telefono,
        email, direccion, ciudad, pais, sitio_web, notas } = data;

    const [row] = await sql`
        INSERT INTO "Proveedores" ("NombreEmpresa", "NIT", "PersonaContacto", "Especialidad", "Telefono",
            "Email", "Direccion", "Ciudad", "Pais", "SitioWeb", "Notas", "Estado")
        VALUES (${nombre_empresa}, ${nit || null}, ${persona_contacto}, ${especialidad || null}, ${telefono},
            ${email}, ${direccion}, ${ciudad || 'Medellin'}, ${pais || 'Colombia'}, ${sitio_web || null}, ${notes || null}, 1)
        RETURNING *
    `;
    return row;
};

const update = async (id, data) => {
    const sql = await getPool();
    const { nombre_empresa, nit, persona_contacto, especialidad, telefono,
        email, direccion, ciudad, pais, sitio_web, notas, estado } = data;

    const [row] = await sql`
        UPDATE "Proveedores" 
        SET "NombreEmpresa" = ${nombre_empresa}, "NIT" = ${nit || null}, "PersonaContacto" = ${persona_contacto},
            "Especialidad" = ${especialidad || null}, "Telefono" = ${telefono}, "Email" = ${email}, 
            "Direccion" = ${direccion}, "Ciudad" = ${ciudad || 'Medellin'}, "Pais" = ${pais || 'Colombia'}, 
            "SitioWeb" = ${sitio_web || null}, "Notas" = ${notas || null}, "Estado" = ${estado}
        WHERE "ID_Proveedor" = ${id}
        RETURNING *
    `;
    if (!row) throw { status: 404, message: 'Proveedor no encontrado.' };
    return row;
};

const remove = async (id) => {
    const sql = await getPool();
    const [row] = await sql`
        DELETE FROM "Proveedores" 
        WHERE "ID_Proveedor" = ${id}
        RETURNING "ID_Proveedor"
    `;
    if (!row) throw { status: 404, message: 'Proveedor no encontrado.' };
    return { message: 'Proveedor eliminado.' };
};

module.exports = { getAll, getById, create, update, remove };
