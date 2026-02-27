const { getPool } = require('../config/db');

// --- Categorias ---
const getAllCategorias = async () => {
    const sql = await getPool();
    return await sql`SELECT * FROM "Categorias_Productos" ORDER BY "ID_Categoria"`;
};

const getCategoriaById = async (id) => {
    const sql = await getPool();
    const rows = await sql`SELECT * FROM "Categorias_Productos" WHERE "ID_Categoria" = ${id}`;
    if (rows.length === 0) throw { status: 404, message: 'Categoría no encontrada.' };
    return rows[0];
};

const createCategoria = async ({ nombre, descripcion }) => {
    const sql = await getPool();
    const [row] = await sql`
        INSERT INTO "Categorias_Productos" ("Nombre", "Descripcion", "Estado") 
        VALUES (${nombre}, ${descripcion || null}, TRUE)
        RETURNING *
    `;
    return row;
};

const updateCategoria = async (id, { nombre, descripcion, estado }) => {
    const sql = await getPool();
    const [row] = await sql`
        UPDATE "Categorias_Productos" 
        SET "Nombre" = ${nombre}, "Descripcion" = ${descripcion || null}, "Estado" = ${estado} 
        WHERE "ID_Categoria" = ${id}
        RETURNING *
    `;
    if (!row) throw { status: 404, message: 'Categoría no encontrada.' };
    return row;
};

const deleteCategoria = async (id) => {
    const sql = await getPool();
    const [row] = await sql`
        DELETE FROM "Categorias_Productos" 
        WHERE "ID_Categoria" = ${id}
        RETURNING "ID_Categoria"
    `;
    if (!row) throw { status: 404, message: 'Categoría no encontrada.' };
    return { message: 'Categoría eliminada.' };
};

module.exports = { getAllCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria };
