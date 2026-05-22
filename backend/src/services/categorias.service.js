const { getPool } = require('../config/db');

// --- Categorias ---
const getAllCategorias = async () => {
    const sql = await getPool();
    return await sql`
        SELECT id_categoria AS "ID_Categoria", nombre AS "Nombre", 
               descripcion AS "Descripcion", estado AS "Estado"
        FROM categorias_productos 
        ORDER BY id_categoria
    `;
};

const getCategoriaById = async (id) => {
    const sql = await getPool();
    const rows = await sql`
        SELECT id_categoria AS "ID_Categoria", nombre AS "Nombre", 
               descripcion AS "Descripcion", estado AS "Estado"
        FROM categorias_productos 
        WHERE id_categoria = ${id}
    `;
    if (rows.length === 0) throw { status: 404, message: 'Categoría no encontrada.' };
    return rows[0];
};

const createCategoria = async ({ nombre, descripcion }) => {
    const sql = await getPool();

    // Validar nombre único
    const [existing] = await sql`
        SELECT id_categoria 
        FROM categorias_productos 
        WHERE UPPER(TRIM(nombre)) = UPPER(TRIM(${nombre}))
    `;
    if (existing) {
        throw { status: 400, message: `Ya existe una categoría registrada con el nombre ${nombre}.` };
    }

    if (descripcion && descripcion.length > 80) {
        throw { status: 400, message: 'La descripción no puede superar los 80 caracteres.' };
    }

    const finalDesc = (descripcion && descripcion.trim()) ? descripcion.trim() : 'Sin descripción detallada';

    const [row] = await sql`
        INSERT INTO categorias_productos (nombre, descripcion, estado) 
        VALUES (${nombre}, ${finalDesc}, TRUE)
        RETURNING id_categoria AS "ID_Categoria", nombre AS "Nombre", 
                  descripcion AS "Descripcion", estado AS "Estado"
    `;
    return row;
};

const updateCategoria = async (id, { nombre, descripcion, estado }) => {
    const sql = await getPool();

    // Validar nombre único al actualizar
    const [existing] = await sql`
        SELECT id_categoria 
        FROM categorias_productos 
        WHERE UPPER(TRIM(nombre)) = UPPER(TRIM(${nombre})) AND id_categoria <> ${id}
    `;
    if (existing) {
        throw { status: 400, message: `Ya existe otra categoría registrada con el nombre ${nombre}.` };
    }

    if (descripcion && descripcion.length > 80) {
        throw { status: 400, message: 'La descripción no puede superar los 80 caracteres.' };
    }

    const finalDesc = (descripcion && descripcion.trim()) ? descripcion.trim() : 'Sin descripción detallada';

    // Ensure estado is boolean
    const boolEstado = estado === true || estado === 1 || estado === '1' || estado === 'Activo';

    if (boolEstado === false) {
        const prods = await sql`SELECT COUNT(*) FROM productos WHERE id_categoria = ${id}`;
        if (parseInt(prods[0].count) > 0) {
            throw { status: 400, message: 'No se puede inactivar la categoría porque tiene productos asociados.' };
        }
    }

    const [row] = await sql`
        UPDATE categorias_productos 
        SET nombre = ${nombre}, descripcion = ${finalDesc}, estado = ${boolEstado} 
        WHERE id_categoria = ${id}
        RETURNING id_categoria AS "ID_Categoria", nombre AS "Nombre", 
                  descripcion AS "Descripcion", estado AS "Estado"
    `;
    if (!row) throw { status: 404, message: 'Categoría no encontrada.' };
    return row;
};

const deleteCategoria = async (id) => {
    const sql = await getPool();

    // 1. Verificar si la categoría existe
    const [cat] = await sql`SELECT nombre, estado FROM categorias_productos WHERE id_categoria = ${id}`;
    if (!cat) throw { status: 404, message: 'Categoría no encontrada.' };

    // 2. Verificar asociaciones (productos)
    const prods = await sql`SELECT COUNT(*) FROM productos WHERE id_categoria = ${id}`;
    if (parseInt(prods[0].count) > 0) {
        throw { status: 400, message: `No se puede eliminar la categoría ${cat.nombre} porque tiene productos asociados.` };
    }

    const [row] = await sql`
        DELETE FROM categorias_productos 
        WHERE id_categoria = ${id}
        RETURNING id_categoria AS "ID_Categoria"
    `;
    return { message: 'Categoría eliminada correctamente.' };
};

module.exports = { getAllCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria };
