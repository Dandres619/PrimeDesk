const { getPool } = require('../config/db');

const getAll = async () => {
    const sql = await getPool();
    return await sql`
        SELECT id_proveedor AS "ID_Proveedor", nombreempresa AS "NombreEmpresa", 
               documento AS "Documento", personacontacto AS "PersonaContacto", 
               especialidad AS "Especialidad", telefono AS "Telefono",
               email AS "Email", direccion AS "Direccion", 
               ciudad AS "Ciudad", pais AS "Pais", 
               sitioweb AS "SitioWeb", notas AS "Notas", 
               estado AS "Estado", tipopersona AS "TipoPersona"
        FROM proveedores 
        ORDER BY id_proveedor
    `;
};

const getById = async (id) => {
    const sql = await getPool();
    const rows = await sql`
        SELECT id_proveedor AS "ID_Proveedor", nombreempresa AS "NombreEmpresa", 
               documento AS "Documento", personacontacto AS "PersonaContacto", 
               especialidad AS "Especialidad", telefono AS "Telefono",
               email AS "Email", direccion AS "Direccion", 
               ciudad AS "Ciudad", pais AS "Pais", 
               sitioweb AS "SitioWeb", notas AS "Notas", 
               estado AS "Estado", tipopersona AS "TipoPersona"
        FROM proveedores 
        WHERE id_proveedor = ${id}
    `;
    if (rows.length === 0) throw { status: 404, message: 'Proveedor no encontrado.' };
    return rows[0];
};

const create = async (data) => {
    const sql = await getPool();
    const { nombre_empresa, documento, persona_contacto, especialidad, telefono,
        email, direccion, ciudad, pais, sitio_web, notas, tipo_persona } = data;

    // Verificar si ya existe un proveedor con el mismo documento
    const [existing] = await sql`
        SELECT id_proveedor FROM proveedores WHERE documento = ${documento}
    `;
    if (existing) {
        throw { status: 400, message: 'El NIT o documento ingresado ya está registrado por otro proveedor.' };
    }

    if (notas && notas.length > 80) {
        throw { status: 400, message: 'Las notas no pueden superar los 80 caracteres.' };
    }

    const [row] = await sql`
        INSERT INTO proveedores (nombreempresa, documento, personacontacto, especialidad, telefono,
            email, direccion, ciudad, pais, sitioweb, notas, estado, tipopersona)
        VALUES (${nombre_empresa}, ${documento}, ${persona_contacto}, ${especialidad || null}, ${telefono},
            ${email || null}, ${direccion}, ${ciudad || 'Medellin'}, ${pais || 'Colombia'}, ${sitio_web || null}, ${notas || null}, TRUE, ${tipo_persona || 'Natural'})
        RETURNING id_proveedor AS "ID_Proveedor", nombreempresa AS "NombreEmpresa", 
                  documento AS "Documento", personacontacto AS "PersonaContacto", 
                  especialidad AS "Especialidad", telefono AS "Telefono",
                  email AS "Email", direccion AS "Direccion", 
                  ciudad AS "Ciudad", pais AS "Pais", 
                  sitioweb AS "SitioWeb", notas AS "Notas", 
                  estado AS "Estado", tipopersona AS "TipoPersona"
    `;
    return row;
};

const update = async (id, data) => {
    const sql = await getPool();
    const { nombre_empresa, documento, persona_contacto, especialidad, telefono,
        email, direccion, ciudad, pais, sitio_web, notas, estado, tipo_persona } = data;

    // Verificar si ya existe otro proveedor con el mismo documento
    const [existing] = await sql`
        SELECT id_proveedor FROM proveedores WHERE documento = ${documento} AND id_proveedor <> ${id}
    `;
    if (existing) {
        throw { status: 400, message: 'El NIT o documento ingresado ya está registrado por otro proveedor.' };
    }

    if (notas && notas.length > 80) {
        throw { status: 400, message: 'Las notas no pueden superar los 80 caracteres.' };
    }

    const boolEstado = estado === true || estado === 1 || estado === '1' || estado === 'Activo';

    const [row] = await sql`
        UPDATE proveedores 
        SET nombreempresa = ${nombre_empresa}, documento = ${documento}, personacontacto = ${persona_contacto},
            especialidad = ${especialidad || null}, telefono = ${telefono}, email = ${email || null}, 
            direccion = ${direccion}, ciudad = ${ciudad || 'Medellin'}, pais = ${pais || 'Colombia'}, 
            sitioweb = ${sitio_web || null}, notas = ${notas || null}, estado = ${boolEstado},
            tipopersona = ${tipo_persona || 'Natural'}
        WHERE id_proveedor = ${id}
        RETURNING id_proveedor AS "ID_Proveedor", nombreempresa AS "NombreEmpresa", 
                  documento AS "Documento", personacontacto AS "PersonaContacto", 
                  especialidad AS "Especialidad", telefono AS "Telefono",
                  email AS "Email", direccion AS "Direccion", 
                  ciudad AS "Ciudad", pais AS "Pais", 
                  sitioweb AS "SitioWeb", notas AS "Notas", 
                  estado AS "Estado", tipopersona AS "TipoPersona"
    `;
    if (!row) throw { status: 404, message: 'Proveedor no encontrado.' };
    return row;
};

const remove = async (id) => {
    const sql = await getPool();

    // 1. Verificar si el proveedor existe y su estado
    const [prov] = await sql`SELECT nombreempresa, estado FROM proveedores WHERE id_proveedor = ${id}`;
    if (!prov) throw { status: 404, message: 'Proveedor no encontrado.' };

    if (prov.estado !== false && prov.estado !== 'Inactivo') {
        throw { status: 400, message: `No se puede eliminar el proveedor ${prov.nombreempresa} porque está Activo. Primero debe inactivarlo.` };
    }

    // 2. Verificar asociaciones (compras)
    const compras = await sql`SELECT COUNT(*) FROM compras WHERE id_proveedor = ${id}`;
    if (parseInt(compras[0].count) > 0) {
        throw { status: 400, message: `No se puede eliminar a ${prov.nombreempresa} porque tiene compras asociadas en el sistema.` };
    }

    const [row] = await sql`
        DELETE FROM proveedores 
        WHERE id_proveedor = ${id}
        RETURNING id_proveedor AS "ID_Proveedor"
    `;
    return { message: 'Proveedor eliminado correctamente.' };
};

module.exports = { getAll, getById, create, update, remove };
