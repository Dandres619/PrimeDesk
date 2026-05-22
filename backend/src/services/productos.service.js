const { getPool } = require('../config/db');

const getAll = async () => {
  const sql = await getPool();
  return await sql`
        SELECT p.id_producto AS "ID_Producto", p.id_categoria AS "ID_Categoria", 
               p.nombre AS "Nombre", p.marca AS "Marca", 
               p.descripcion AS "Descripcion", 
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
               p.descripcion AS "Descripcion", 
               p.estado AS "Estado",
               c.nombre AS "NombreCategoria"
        FROM productos p
        INNER JOIN categorias_productos c ON p.id_categoria = c.id_categoria
        WHERE p.id_producto = ${id}
    `;
  if (rows.length === 0) throw { status: 404, message: 'Producto no encontrado.' };
  return rows[0];
};

const create = async ({ id_categoria, nombre, marca, descripcion }) => {
  const sql = await getPool();

  // Validar nombre único
  const [existing] = await sql`
        SELECT id_producto 
        FROM productos 
        WHERE UPPER(TRIM(nombre)) = UPPER(TRIM(${nombre}))
    `;
  if (existing) {
    throw { status: 400, message: `Ya existe un producto registrado con el nombre ${nombre}.` };
  }

  // Validar límite de descripción
  if (descripcion && descripcion.length > 80) {
    throw { status: 400, message: 'La descripción no puede superar los 80 caracteres.' };
  }

  const [row] = await sql`
        INSERT INTO productos (id_categoria, nombre, marca, descripcion, estado)
        VALUES (${id_categoria}, ${nombre}, ${marca}, ${descripcion || null}, TRUE)
        RETURNING id_producto AS "ID_Producto", id_categoria AS "ID_Categoria", 
                  nombre AS "Nombre", marca AS "Marca", 
                  descripcion AS "Descripcion", 
                  estado AS "Estado"
    `;
  return row;
};

const update = async (id, { id_categoria, nombre, marca, descripcion, estado }) => {
  const sql = await getPool();

  // Validar nombre único al actualizar
  const [existing] = await sql`
        SELECT id_producto 
        FROM productos 
        WHERE UPPER(TRIM(nombre)) = UPPER(TRIM(${nombre})) AND id_producto <> ${id}
    `;
  if (existing) {
    throw { status: 400, message: `Ya existe otro producto registrado con el nombre ${nombre}.` };
  }

  // Validar límite de descripción
  if (descripcion && descripcion.length > 80) {
    throw { status: 400, message: 'La descripción no puede superar los 80 caracteres.' };
  }

  // Ensure estado is boolean
  const boolEstado = estado === true || estado === 1 || estado === '1' || estado === 'Activo';
  
  const [row] = await sql`
        UPDATE productos 
        SET id_categoria = ${id_categoria}, nombre = ${nombre}, marca = ${marca},
            descripcion = ${descripcion || null}, 
            estado = ${boolEstado}
        WHERE id_producto = ${id}
        RETURNING id_producto AS "ID_Producto", id_categoria AS "ID_Categoria", 
                  nombre AS "Nombre", marca AS "Marca", 
                  descripcion AS "Descripcion", 
                  estado AS "Estado"
    `;
  if (!row) throw { status: 404, message: 'Producto no encontrado.' };
  return row;
};



const remove = async (id) => {
  const sql = await getPool();

  // 1. Verificar si el producto existe
  const [prod] = await sql`SELECT nombre, estado FROM productos WHERE id_producto = ${id}`;
  if (!prod) throw { status: 404, message: 'Producto no encontrado.' };

  // 2. Verificar asociaciones (compras)
  const compras = await sql`SELECT COUNT(*) FROM detalle_compras WHERE id_producto = ${id}`;
  if (parseInt(compras[0].count) > 0) {
      throw { status: 400, message: `No se puede eliminar ${prod.nombre} porque tiene compras registradas.` };
  }

  await sql`
        DELETE FROM productos 
        WHERE id_producto = ${id}
    `;
  return { message: 'Producto eliminado correctamente.' };
};

module.exports = { getAll, getById, create, update, remove };
