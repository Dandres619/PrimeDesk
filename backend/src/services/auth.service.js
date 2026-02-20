const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/db');
const jwtConfig = require('../config/jwt');

/**
 * Login: verifica correo/contraseña y devuelve JWT + datos del usuario.
 */
const login = async (correo, contrasena) => {
    const pool = await getPool();

    const result = await pool.request()
        .input('correo', sql.VarChar(255), correo)
        .query(`
      SELECT u.ID_Usuario, u.Correo, u.Contrasena, u.ID_Rol, u.Estado,
             r.Nombre AS NombreRol
      FROM Usuarios u
      INNER JOIN Roles r ON u.ID_Rol = r.ID_Rol
      WHERE u.Correo = @correo
    `);

    if (result.recordset.length === 0) {
        throw { status: 401, message: 'Credenciales incorrectas.' };
    }

    const user = result.recordset[0];

    if (!user.Estado) {
        throw { status: 403, message: 'Usuario inactivo. Contacte al administrador.' };
    }

    const passwordMatch = await bcrypt.compare(contrasena, user.Contrasena);
    if (!passwordMatch) {
        throw { status: 401, message: 'Credenciales incorrectas.' };
    }

    const payload = {
        id_usuario: user.ID_Usuario,
        correo: user.Correo,
        id_rol: user.ID_Rol,
        nombre_rol: user.NombreRol,
    };

    const token = jwt.sign(payload, jwtConfig.secret, jwtConfig.options);

    return {
        token,
        usuario: {
            id_usuario: user.ID_Usuario,
            correo: user.Correo,
            id_rol: user.ID_Rol,
            nombre_rol: user.NombreRol,
        },
    };
};

/**
 * Registro de nuevo usuario con hash de contraseña.
 * Crea el registro en Usuarios (y opcionalmente en Empleados o Clientes).
 */
const register = async (data) => {
    const {
        correo, contrasena, id_rol,
        nombre, apellido, tipo_documento, documento, telefono,
        barrio, direccion, fecha_nacimiento
    } = data;

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Verificar si el correo ya existe (dentro de la transacción o antes, aqui lo hacemos antes de insertar)
        const existing = await transaction.request()
            .input('correo', sql.VarChar(255), correo)
            .query('SELECT ID_Usuario FROM Usuarios WHERE Correo = @correo');

        if (existing.recordset.length > 0) {
            throw { status: 409, message: 'El correo ya está registrado.' };
        }

        // 2. Crear Usuario
        const hashed = await bcrypt.hash(contrasena, 10);
        const insertUser = await transaction.request()
            .input('id_rol', sql.Int, id_rol)
            .input('correo', sql.VarChar(255), correo)
            .input('contrasena', sql.VarChar(255), hashed)
            .query(`
                INSERT INTO Usuarios (ID_Rol, Correo, Contrasena, Estado)
                OUTPUT INSERTED.ID_Usuario, INSERTED.Correo, INSERTED.ID_Rol
                VALUES (@id_rol, @correo, @contrasena, 1)
            `);

        const newUser = insertUser.recordset[0];
        const id_usuario = newUser.ID_Usuario;

        // 3. Si es Cliente (ID_Rol = 3 asumimos, o verificamos por nombre pero por ahora usaremos id_rol que viene del front o forzamos 3)
        // Nota: En un sistema real deberíamos buscar el ID del rol 'Cliente' en la BD, aqui asumiremos que enviamos el ID correcto o lo forzamos.
        // Vamos a asumir que si pasan datos de perfil, intentamos crearlo. O mejor, si id_rol es 3 (Cliente).
        // Por seguridad, para este registro público, siempre forzaremos id_rol = 3 (Cliente) si no es un admin quien crea usuarios.
        // Pero mantendremos la flexibilidad por si se usa para otros fines, confiando en la validación.

        // Suponiendo ID Rol 3 = Cliente.
        if (Number(id_rol) === 3) {
            if (!nombre || !apellido || !documento) {
                throw { status: 400, message: 'Datos de perfil de cliente incompletos.' };
            }

            await transaction.request()
                .input('id_usuario', sql.Int, id_usuario)
                .input('nombre', sql.VarChar(50), nombre)
                .input('apellido', sql.VarChar(50), apellido)
                .input('tipo_documento', sql.VarChar(20), tipo_documento)
                .input('documento', sql.VarChar(20), documento)
                .input('telefono', sql.VarChar(10), telefono)
                .input('barrio', sql.VarChar(60), barrio || null)
                .input('direccion', sql.VarChar(100), direccion || null)
                .input('fecha_nacimiento', sql.Date, fecha_nacimiento || null)
                .query(`
                    INSERT INTO Clientes (ID_Usuario, Nombre, Apellido, TipoDocumento, Documento, Telefono, Barrio, Direccion, FechaNacimiento)
                    VALUES (@id_usuario, @nombre, @apellido, @tipo_documento, @documento, @telefono, @barrio, @direccion, @fecha_nacimiento)
                `);
        }

        await transaction.commit();
        return newUser;

    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

/**
 * Obtiene el perfil completo del usuario autenticado.
 */
const getMe = async (id_usuario) => {
    const pool = await getPool();

    const result = await pool.request()
        .input('id', sql.Int, id_usuario)
        .query(`
      SELECT u.ID_Usuario, u.Correo, u.Estado, u.ID_Rol,
             r.Nombre AS NombreRol, r.Descripcion AS DescripcionRol,
             e.Nombre AS NombreEmpleado, e.Apellido AS ApellidoEmpleado,
             c.ID_Cliente, c.Nombre AS NombreCliente, c.Apellido AS ApellidoCliente,
             c.TipoDocumento, c.Documento, c.Telefono, c.Barrio, c.Direccion, c.FechaNacimiento
      FROM Usuarios u
      INNER JOIN Roles r ON u.ID_Rol = r.ID_Rol
      LEFT JOIN Empleados e ON e.ID_Usuario = u.ID_Usuario
      LEFT JOIN Clientes c ON c.ID_Usuario = u.ID_Usuario
      WHERE u.ID_Usuario = @id
    `);

    if (result.recordset.length === 0) {
        throw { status: 404, message: 'Usuario no encontrado.' };
    }

    return result.recordset[0];
};

/**
 * Cambiar contraseña del usuario autenticado.
 */
const changePassword = async (id_usuario, contrasenaActual, nuevaContrasena) => {
    const pool = await getPool();

    const result = await pool.request()
        .input('id', sql.Int, id_usuario)
        .query('SELECT Contrasena FROM Usuarios WHERE ID_Usuario = @id');

    if (result.recordset.length === 0) {
        throw { status: 404, message: 'Usuario no encontrado.' };
    }

    const match = await bcrypt.compare(contrasenaActual, result.recordset[0].Contrasena);
    if (!match) {
        throw { status: 401, message: 'La contraseña actual es incorrecta.' };
    }

    const hashed = await bcrypt.hash(nuevaContrasena, 10);

    await pool.request()
        .input('id', sql.Int, id_usuario)
        .input('contrasena', sql.VarChar(255), hashed)
        .query('UPDATE Usuarios SET Contrasena = @contrasena WHERE ID_Usuario = @id');

    return { message: 'Contraseña actualizada correctamente.' };
};

module.exports = { login, register, getMe, changePassword };
