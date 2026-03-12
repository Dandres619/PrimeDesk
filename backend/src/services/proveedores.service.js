const { getPool } = require('../config/db');

const getAll = async () => {
    const sql = await getPool();
    return await sql`
        SELECT id_proveedor AS "ID_Proveedor", nombreempresa AS "NombreEmpresa", 
               nit AS "NIT", personacontacto AS "PersonaContacto", 
               especialidad AS "Especialidad", telefono AS "Telefono",
               email AS "Email", direccion AS "Direccion", 
               ciudad AS "Ciudad", pais AS "Pais", 
               sitioweb AS "SitioWeb", notas AS "Notas", 
               estado AS "Estado"
        FROM proveedores 
        ORDER BY id_proveedor
    `;
};

const getById = async (id) => {
    const sql = await getPool();
    const rows = await sql`
        SELECT id_proveedor AS "ID_Proveedor", nombreempresa AS "NombreEmpresa", 
               nit AS "NIT", personacontacto AS "PersonaContacto", 
               especialidad AS "Especialidad", telefono AS "Telefono",
               email AS "Email", direccion AS "Direccion", 
               ciudad AS "Ciudad", pais AS "Pais", 
               sitioweb AS "SitioWeb", notas AS "Notas", 
               estado AS "Estado"
        FROM proveedores 
        WHERE id_proveedor = ${id}
    `;
    if (rows.length === 0) throw { status: 404, message: 'Proveedor no encontrado.' };
    return rows[0];
};

const create = async (data) => {
    const sql = await getPool();
    const { nombre_empresa, nit, persona_contacto, especialidad, telefono,
        email, direccion, ciudad, pais, sitio_web, notas } = data;

    const [row] = await sql`
        INSERT INTO proveedores (nombreempresa, nit, personacontacto, especialidad, telefono,
            email, direccion, ciudad, pais, sitioweb, notas, estado)
        VALUES (${nombre_empresa}, ${nit || null}, ${persona_contacto}, ${especialidad || null}, ${telefono},
            ${email}, ${direccion}, ${ciudad || 'Medellin'}, ${pais || 'Colombia'}, ${sitio_web || null}, ${notas || null}, TRUE)
        RETURNING id_proveedor AS "ID_Proveedor", nombreempresa AS "NombreEmpresa", 
                  nit AS "NIT", personacontacto AS "PersonaContacto", 
                  especialidad AS "Especialidad", telefono AS "Telefono",
                  email AS "Email", direccion AS "Direccion", 
                  ciudad AS "Ciudad", pais AS "Pais", 
                  sitioweb AS "SitioWeb", notas AS "Notas", 
                  estado AS "Estado"
    `;
    return row;
};

const update = async (id, data) => {
    const sql = await getPool();
    const { nombre_empresa, nit, persona_contacto, especialidad, telefono,
        email, direccion, ciudad, pais, sitio_web, notas, estado } = data;

    const boolEstado = estado === true || estado === 1 || estado === '1' || estado === 'Activo';

    const [row] = await sql`
        UPDATE proveedores 
        SET nombreempresa = ${nombre_empresa}, nit = ${nit || null}, personacontacto = ${persona_contacto},
            especialidad = ${especialidad || null}, telefono = ${telefono}, email = ${email}, 
            direccion = ${direccion}, ciudad = ${ciudad || 'Medellin'}, pais = ${pais || 'Colombia'}, 
            sitioweb = ${sitio_web || null}, notas = ${notas || null}, estado = ${boolEstado}
        WHERE id_proveedor = ${id}
        RETURNING id_proveedor AS "ID_Proveedor", nombreempresa AS "NombreEmpresa", 
                  nit AS "NIT", personacontacto AS "PersonaContacto", 
                  especialidad AS "Especialidad", telefono AS "Telefono",
                  email AS "Email", direccion AS "Direccion", 
                  ciudad AS "Ciudad", pais AS "Pais", 
                  sitioweb AS "SitioWeb", notas AS "Notas", 
                  estado AS "Estado"
    `;
    if (!row) throw { status: 404, message: 'Proveedor no encontrado.' };
    return row;
};

const remove = async (id) => {
    const sql = await getPool();
    const [row] = await sql`
        DELETE FROM proveedores 
        WHERE id_proveedor = ${id}
        RETURNING id_proveedor AS "ID_Proveedor"
    `;
    if (!row) throw { status: 404, message: 'Proveedor no encontrado.' };
    return { message: 'Proveedor eliminado.' };
};

module.exports = { getAll, getById, create, update, remove };
