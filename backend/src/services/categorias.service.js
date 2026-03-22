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
    const [row] = await sql`
        INSERT INTO categorias_productos (nombre, descripcion, estado) 
        VALUES (${nombre}, ${descripcion || null}, TRUE)
        RETURNING id_categoria AS "ID_Categoria", nombre AS "Nombre", 
                  descripcion AS "Descripcion", estado AS "Estado"
    `;
    return row;
};

const updateCategoria = async (id, { nombre, descripcion, estado }) => {
    const sql = await getPool();
    // Ensure estado is boolean
    const boolEstado = estado === true || estado === 1 || estado === '1' || estado === 'Activo';

    const [row] = await sql`
        UPDATE categorias_productos 
        SET nombre = ${nombre}, descripcion = ${descripcion || null}, estado = ${boolEstado} 
        WHERE id_categoria = ${id}
        RETURNING id_categoria AS "ID_Categoria", nombre AS "Nombre", 
                  descripcion AS "Descripcion", estado AS "Estado"
    `;
    if (!row) throw { status: 404, message: 'Categoría no encontrada.' };
    return row;
};

const deleteCategoria = async (id) => {
    const sql = await getPool();

    // 1. Verificar si la categoría existe y su estado
    const [cat] = await sql`SELECT nombre, estado FROM categorias_productos WHERE id_categoria = ${id}`;
    if (!cat) throw { status: 404, message: 'Categoría no encontrada.' };

    if (cat.estado !== false && cat.estado !== 'Inactivo') {
        throw { status: 400, message: `No se puede eliminar la categoría ${cat.nombre} porque está Activa. Primero debe inactivarla.` };
    }

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
