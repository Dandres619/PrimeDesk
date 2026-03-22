const { getPool } = require('../config/db');

const getAll = async () => {
  const sql = await getPool();
  return await sql`
        SELECT p.id_producto AS "ID_Producto", p.id_categoria AS "ID_Categoria", 
               p.nombre AS "Nombre", p.marca AS "Marca", 
               p.cantidad AS "Cantidad", p.descripcion AS "Descripcion", 
               p.estado AS "Estado",
               c.nombre AS "NombreCategoria"
        FROM productos p
        INNER JOIN categorias_productos c ON p.id_categoria = c.id_categoria
        ORDER BY p.id_producto
    `;
};

const getById = async (id) => {
  const sql = await getPool();
  const rows = await sql`
        SELECT p.id_producto AS "ID_Producto", p.id_categoria AS "ID_Categoria", 
               p.nombre AS "Nombre", p.marca AS "Marca", 
               p.cantidad AS "Cantidad", p.descripcion AS "Descripcion", 
               p.estado AS "Estado",
               c.nombre AS "NombreCategoria"
        FROM productos p
        INNER JOIN categorias_productos c ON p.id_categoria = c.id_categoria
        WHERE p.id_producto = ${id}
    `;
  if (rows.length === 0) throw { status: 404, message: 'Producto no encontrado.' };
  return rows[0];
};

const create = async ({ id_categoria, nombre, marca, cantidad, descripcion }) => {
  const sql = await getPool();
  const [row] = await sql`
        INSERT INTO productos (id_categoria, nombre, marca, cantidad, descripcion, estado)
        VALUES (${id_categoria}, ${nombre}, ${marca}, ${cantidad || 0}, ${descripcion || null}, TRUE)
        RETURNING id_producto AS "ID_Producto", id_categoria AS "ID_Categoria", 
                  nombre AS "Nombre", marca AS "Marca", 
                  cantidad AS "Cantidad", descripcion AS "Descripcion", 
                  estado AS "Estado"
    `;
  return row;
};

const update = async (id, { id_categoria, nombre, marca, cantidad, descripcion, estado }) => {
  const sql = await getPool();
  // Ensure estado is boolean
  const boolEstado = estado === true || estado === 1 || estado === '1' || estado === 'Activo';
  
  const [row] = await sql`
        UPDATE productos 
        SET id_categoria = ${id_categoria}, nombre = ${nombre}, marca = ${marca},
            cantidad = ${cantidad}, descripcion = ${descripcion || null}, 
            estado = ${boolEstado}
        WHERE id_producto = ${id}
        RETURNING id_producto AS "ID_Producto", id_categoria AS "ID_Categoria", 
                  nombre AS "Nombre", marca AS "Marca", 
                  cantidad AS "Cantidad", descripcion AS "Descripcion", 
                  estado AS "Estado"
    `;
  if (!row) throw { status: 404, message: 'Producto no encontrado.' };
  return row;
};

const updateStock = async (id, cantidad) => {
  const sql = await getPool();
  const [row] = await sql`
        UPDATE productos 
        SET cantidad = ${cantidad} 
        WHERE id_producto = ${id}
        RETURNING id_producto AS "ID_Producto", cantidad AS "Cantidad"
    `;
  if (!row) throw { status: 404, message: 'Producto no encontrado.' };
  return row;
};

const remove = async (id) => {
  const sql = await getPool();

  // 1. Verificar si el producto existe y su estado
  const [prod] = await sql`SELECT nombre, estado FROM productos WHERE id_producto = ${id}`;
  if (!prod) throw { status: 404, message: 'Producto no encontrado.' };

  if (prod.estado !== false && prod.estado !== 'Inactivo') {
      throw { status: 400, message: `No se puede eliminar el producto ${prod.nombre} porque está Activo. Primero debe inactivarlo.` };
  }

  // 2. Verificar asociaciones (compras)
  const compras = await sql`SELECT COUNT(*) FROM detalle_compras WHERE id_producto = ${id}`;
  if (parseInt(compras[0].count) > 0) {
      throw { status: 400, message: `No se puede eliminar ${prod.nombre} porque tiene compras registradas.` };
  }

  // 3. Verificar asociaciones (ventas)
  const ventas = await sql`SELECT COUNT(*) FROM ventas_compras WHERE id_compra IN (SELECT id_compra FROM detalle_compras WHERE id_producto = ${id})`;
  if (parseInt(ventas[0].count) > 0) {
      throw { status: 400, message: `No se puede eliminar ${prod.nombre} porque tiene ventas registradas.` };
  }

  await sql`
        DELETE FROM productos 
        WHERE id_producto = ${id}
    `;
  return { message: 'Producto eliminado correctamente.' };
};

module.exports = { getAll, getById, create, update, updateStock, remove };
