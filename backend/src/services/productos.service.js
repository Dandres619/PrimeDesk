const { getPool } = require('../config/db');

const getAll = async () => {
  const sql = await getPool();
  return await sql`
        SELECT p.*, c."Nombre" AS "NombreCategoria"
        FROM "Productos" p
        INNER JOIN "Categorias_Productos" c ON p."ID_Categoria" = c."ID_Categoria"
        ORDER BY p."ID_Producto"
    `;
};

const getById = async (id) => {
  const sql = await getPool();
  const rows = await sql`
        SELECT p.*, c."Nombre" AS "NombreCategoria"
        FROM "Productos" p
        INNER JOIN "Categorias_Productos" c ON p."ID_Categoria" = c."ID_Categoria"
        WHERE p."ID_Producto" = ${id}
    `;
  if (rows.length === 0) throw { status: 404, message: 'Producto no encontrado.' };
  return rows[0];
};

const create = async ({ id_categoria, nombre, marca, cantidad, descripcion }) => {
  const sql = await getPool();
  const [row] = await sql`
        INSERT INTO "Productos" ("ID_Categoria", "Nombre", "Marca", "Cantidad", "Descripcion", "Estado")
        VALUES (${id_categoria}, ${nombre}, ${marca}, ${cantidad || 0}, ${descripcion || null}, 1)
        RETURNING *
    `;
  return row;
};

const update = async (id, { id_categoria, nombre, marca, cantidad, descripcion, estado }) => {
  const sql = await getPool();
  const [row] = await sql`
        UPDATE "Productos" 
        SET "ID_Categoria" = ${id_categoria}, "Nombre" = ${nombre}, "Marca" = ${marca},
            "Cantidad" = ${cantidad}, "Descripcion" = ${descripcion || null}, "Estado" = ${estado}
        WHERE "ID_Producto" = ${id}
        RETURNING *
    `;
  if (!row) throw { status: 404, message: 'Producto no encontrado.' };
  return row;
};

const updateStock = async (id, cantidad) => {
  const sql = await getPool();
  const [row] = await sql`
        UPDATE "Productos" 
        SET "Cantidad" = ${cantidad} 
        WHERE "ID_Producto" = ${id}
        RETURNING "ID_Producto", "Cantidad"
    `;
  if (!row) throw { status: 404, message: 'Producto no encontrado.' };
  return row;
};

const remove = async (id) => {
  const sql = await getPool();
  const [row] = await sql`
        DELETE FROM "Productos" 
        WHERE "ID_Producto" = ${id}
        RETURNING "ID_Producto"
    `;
  if (!row) throw { status: 404, message: 'Producto no encontrado.' };
  return { message: 'Producto eliminado.' };
};

module.exports = { getAll, getById, create, update, updateStock, remove };
