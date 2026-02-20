const { getPool, sql } = require('../config/db');

const getAll = async () => {
    const pool = await getPool();
    return (await pool.request().query('SELECT * FROM Proveedores ORDER BY ID_Proveedor')).recordset;
};

const getById = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id).query('SELECT * FROM Proveedores WHERE ID_Proveedor=@id');
    if (!r.recordset.length) throw { status: 404, message: 'Proveedor no encontrado.' };
    return r.recordset[0];
};

const create = async (data) => {
    const pool = await getPool();
    const { nombre_empresa, nit, persona_contacto, especialidad, telefono,
        email, direccion, ciudad, pais, sitio_web, notas } = data;
    const r = await pool.request()
        .input('nombre_empresa', sql.VarChar(50), nombre_empresa)
        .input('nit', sql.VarChar(20), nit || null)
        .input('persona_contacto', sql.VarChar(50), persona_contacto)
        .input('especialidad', sql.VarChar(40), especialidad || null)
        .input('telefono', sql.VarChar(10), telefono)
        .input('email', sql.VarChar(255), email)
        .input('direccion', sql.VarChar(60), direccion)
        .input('ciudad', sql.VarChar(25), ciudad || 'Medellin')
        .input('pais', sql.VarChar(25), pais || 'Colombia')
        .input('sitio_web', sql.VarChar(80), sitio_web || null)
        .input('notas', sql.Text, notas || null)
        .query(`
      INSERT INTO Proveedores (NombreEmpresa, NIT, PersonaContacto, Especialidad, Telefono,
        Email, Direccion, Ciudad, Pais, SitioWeb, Notas, Estado)
      OUTPUT INSERTED.*
      VALUES (@nombre_empresa, @nit, @persona_contacto, @especialidad, @telefono,
        @email, @direccion, @ciudad, @pais, @sitio_web, @notas, 1)
    `);
    return r.recordset[0];
};

const update = async (id, data) => {
    const pool = await getPool();
    const { nombre_empresa, nit, persona_contacto, especialidad, telefono,
        email, direccion, ciudad, pais, sitio_web, notas, estado } = data;
    const r = await pool.request()
        .input('id', sql.Int, id)
        .input('nombre_empresa', sql.VarChar(50), nombre_empresa)
        .input('nit', sql.VarChar(20), nit || null)
        .input('persona_contacto', sql.VarChar(50), persona_contacto)
        .input('especialidad', sql.VarChar(40), especialidad || null)
        .input('telefono', sql.VarChar(10), telefono)
        .input('email', sql.VarChar(255), email)
        .input('direccion', sql.VarChar(60), direccion)
        .input('ciudad', sql.VarChar(25), ciudad || 'Medellin')
        .input('pais', sql.VarChar(25), pais || 'Colombia')
        .input('sitio_web', sql.VarChar(80), sitio_web || null)
        .input('notas', sql.Text, notas || null)
        .input('estado', sql.Bit, estado)
        .query(`
      UPDATE Proveedores SET NombreEmpresa=@nombre_empresa, NIT=@nit, PersonaContacto=@persona_contacto,
        Especialidad=@especialidad, Telefono=@telefono, Email=@email, Direccion=@direccion,
        Ciudad=@ciudad, Pais=@pais, SitioWeb=@sitio_web, Notas=@notas, Estado=@estado
      OUTPUT INSERTED.*
      WHERE ID_Proveedor=@id
    `);
    if (!r.recordset.length) throw { status: 404, message: 'Proveedor no encontrado.' };
    return r.recordset[0];
};

const remove = async (id) => {
    const pool = await getPool();
    const r = await pool.request().input('id', sql.Int, id)
        .query('DELETE FROM Proveedores OUTPUT DELETED.ID_Proveedor WHERE ID_Proveedor=@id');
    if (!r.recordset.length) throw { status: 404, message: 'Proveedor no encontrado.' };
    return { message: 'Proveedor eliminado.' };
};

module.exports = { getAll, getById, create, update, remove };
