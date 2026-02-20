const { getPool, sql } = require('../config/db');

const getAll = async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
    SELECT e.*, u.Correo, r.Nombre AS NombreRol
    FROM Empleados e
    INNER JOIN Usuarios u ON e.ID_Usuario = u.ID_Usuario
    INNER JOIN Roles r ON u.ID_Rol = r.ID_Rol
    ORDER BY e.ID_Empleado
  `);
    return result.recordset;
};

const getById = async (id) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
      SELECT e.*, u.Correo, r.Nombre AS NombreRol
      FROM Empleados e
      INNER JOIN Usuarios u ON e.ID_Usuario = u.ID_Usuario
      INNER JOIN Roles r ON u.ID_Rol = r.ID_Rol
      WHERE e.ID_Empleado = @id
    `);
    if (!result.recordset.length) throw { status: 404, message: 'Empleado no encontrado.' };
    return result.recordset[0];
};

const create = async (data) => {
    const pool = await getPool();
    const { id_usuario, nombre, apellido, tipo_documento, documento, telefono,
        barrio, direccion, fecha_nacimiento, fecha_ingreso, foto } = data;

    const result = await pool.request()
        .input('id_usuario', sql.Int, id_usuario)
        .input('nombre', sql.VarChar(50), nombre)
        .input('apellido', sql.VarChar(50), apellido)
        .input('tipo_documento', sql.VarChar(20), tipo_documento)
        .input('documento', sql.VarChar(20), documento)
        .input('telefono', sql.VarChar(10), telefono)
        .input('barrio', sql.VarChar(60), barrio)
        .input('direccion', sql.VarChar(100), direccion)
        .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
        .input('fecha_ingreso', sql.Date, fecha_ingreso || new Date())
        .input('foto', sql.VarChar(255), foto || null)
        .query(`
      INSERT INTO Empleados (ID_Usuario, Nombre, Apellido, TipoDocumento, Documento,
        Telefono, Barrio, Direccion, FechaNacimiento, FechaIngreso, Foto)
      OUTPUT INSERTED.*
      VALUES (@id_usuario, @nombre, @apellido, @tipo_documento, @documento,
        @telefono, @barrio, @direccion, @fecha_nacimiento, @fecha_ingreso, @foto)
    `);
    return result.recordset[0];
};

const update = async (id, data) => {
    const pool = await getPool();
    const { nombre, apellido, tipo_documento, documento, telefono,
        barrio, direccion, fecha_nacimiento, foto } = data;

    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('nombre', sql.VarChar(50), nombre)
        .input('apellido', sql.VarChar(50), apellido)
        .input('tipo_documento', sql.VarChar(20), tipo_documento)
        .input('documento', sql.VarChar(20), documento)
        .input('telefono', sql.VarChar(10), telefono)
        .input('barrio', sql.VarChar(60), barrio)
        .input('direccion', sql.VarChar(100), direccion)
        .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
        .input('foto', sql.VarChar(255), foto || null)
        .query(`
      UPDATE Empleados SET Nombre=@nombre, Apellido=@apellido, TipoDocumento=@tipo_documento,
        Documento=@documento, Telefono=@telefono, Barrio=@barrio, Direccion=@direccion,
        FechaNacimiento=@fecha_nacimiento, Foto=@foto
      OUTPUT INSERTED.*
      WHERE ID_Empleado = @id
    `);
    if (!result.recordset.length) throw { status: 404, message: 'Empleado no encontrado.' };
    return result.recordset[0];
};

const remove = async (id) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Empleados OUTPUT DELETED.ID_Empleado WHERE ID_Empleado = @id');
    if (!result.recordset.length) throw { status: 404, message: 'Empleado no encontrado.' };
    return { message: 'Empleado eliminado.' };
};

module.exports = { getAll, getById, create, update, remove };
