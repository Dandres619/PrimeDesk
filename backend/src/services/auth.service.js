const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const jwtConfig = require('../config/jwt');

/**
 * Login: verifica correo/contraseña y devuelve JWT + datos del usuario.
 */
const login = async (correo, contrasena) => {
    const sql = await getPool();

    const users = await sql`
        SELECT u.id_usuario, u.correo, u.contrasena, u.id_rol, u.estado,
               r.nombre AS nombre_rol
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.correo = ${correo}
    `;

    if (users.length === 0) {
        throw { status: 401, message: 'Credenciales incorrectas.' };
    }

    const user = users[0];

    if (!user.estado) {
        throw { status: 403, message: 'Usuario inactivo. Contacte al administrador.' };
    }

    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!passwordMatch) {
        throw { status: 401, message: 'Credenciales incorrectas.' };
    }

    const payload = {
        id_usuario: user.id_usuario,
        correo: user.correo,
        id_rol: user.id_rol,
        nombre_rol: user.nombre_rol,
    };

    const token = jwt.sign(payload, jwtConfig.secret, jwtConfig.options);

    return {
        token,
        usuario: {
            id_usuario: user.id_usuario,
            correo: user.correo,
            id_rol: user.id_rol,
            nombre_rol: user.nombre_rol,
        },
    };
};

/**
 * Registro de nuevo usuario.
 */
const register = async (data) => {
    const {
        correo, contrasena, id_rol,
        nombre, apellido, tipo_documento, documento, telefono,
        barrio, direccion, fecha_nacimiento
    } = data;

    const sql = await getPool();

    try {
        const result = await sql.begin(async (tx) => {
            // 1. Verificar si el correo ya existe
            const existing = await tx`SELECT id_usuario FROM usuarios WHERE correo = ${correo}`;

            if (existing.length > 0) {
                throw { status: 409, message: 'El correo ya está registrado.' };
            }

            // 2. Crear Usuario
            const hashed = await bcrypt.hash(contrasena, 10);
            const [newUser] = await tx`
                INSERT INTO usuarios (id_rol, correo, contrasena, estado)
                VALUES (${id_rol}, ${correo}, ${hashed}, TRUE)
                RETURNING id_usuario, correo, id_rol
            `;

            const id_usuario = newUser.id_usuario;

            // 3. Crear Perfil Cliente si id_rol = 3
            if (Number(id_rol) === 3) {
                if (!nombre || !apellido || !documento) {
                    throw { status: 400, message: 'Datos de perfil de cliente incompletos.' };
                }

                await tx`
                    INSERT INTO clientes (id_usuario, nombre, apellido, tipodocumento, documento, telefono, barrio, direccion, fechanacimiento)
                    VALUES (${id_usuario}, ${nombre}, ${apellido}, ${tipo_documento}, ${documento}, ${telefono}, ${barrio || null}, ${direccion || null}, ${fecha_nacimiento || null})
                `;
            }

            return newUser;
        });

        return result;

    } catch (err) {
        console.error('Error en registro:', err);
        throw err;
    }
};

/**
 * Perfil completo del usuario.
 */
const getMe = async (id_usuario) => {
    const sql = await getPool();

    const users = await sql`
      SELECT u.id_usuario, u.correo AS "Correo", u.estado, u.id_rol,
             r.nombre AS "NombreRol", r.descripcion AS "DescripcionRol",
             e.id_empleado AS "ID_Empleado", e.nombre AS "NombreEmpleado", e.apellido AS "ApellidoEmpleado",
             e.tipodocumento AS "TipoDocEmpleado", e.documento AS "DocEmpleado", e.telefono AS "TelEmpleado",
             e.barrio AS "BarrioEmpleado", e.direccion AS "DirEmpleado", e.fechanacimiento AS "NacEmpleado",
             c.id_cliente AS "ID_Cliente", c.nombre AS "NombreCliente", c.apellido AS "ApellidoCliente",
             c.tipodocumento AS "TipoDocumento", c.documento AS "Documento", c.telefono AS "Telefono", 
             c.barrio AS "Barrio", c.direccion AS "Direccion", c.fechanacimiento AS "FechaNacimiento"
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id_rol
      LEFT JOIN empleados e ON e.id_usuario = u.id_usuario
      LEFT JOIN clientes c ON c.id_usuario = u.id_usuario
      WHERE u.id_usuario = ${id_usuario}
    `;

    if (users.length === 0) {
        throw { status: 404, message: 'Usuario no encontrado.' };
    }

    return users[0];
};

/**
 * Actualizar Perfil.
 */
const updateProfile = async (id_usuario, data) => {
    const sql = await getPool();
    const { nombre, apellido, tipo_documento, documento, telefono, barrio, direccion } = data;

    const user = await getMe(id_usuario);

    if (user.id_rol === 3) { // Cliente
        await sql`
            UPDATE clientes 
            SET nombre = ${nombre}, apellido = ${apellido}, tipodocumento = ${tipo_documento},
                documento = ${documento}, telefono = ${telefono}, barrio = ${barrio}, direccion = ${direccion}
            WHERE id_usuario = ${id_usuario}
        `;
    } else { // Admin / Empleado
        // Check if admin has employee record
        const emp = await sql`SELECT id_empleado FROM empleados WHERE id_usuario = ${id_usuario}`;
        if (emp.length === 0) {
            await sql`
                INSERT INTO empleados (id_usuario, nombre, apellido, tipodocumento, documento, telefono, barrio, direccion, fechaingreso)
                VALUES (${id_usuario}, ${nombre}, ${apellido}, ${tipo_documento}, ${documento}, ${telefono}, ${barrio}, ${direccion}, NOW())
            `;
        } else {
            await sql`
                UPDATE empleados 
                SET nombre = ${nombre}, apellido = ${apellido}, tipodocumento = ${tipo_documento},
                    documento = ${documento}, telefono = ${telefono}, barrio = ${barrio}, direccion = ${direccion}
                WHERE id_usuario = ${id_usuario}
            `;
        }
    }

    return { message: 'Perfil actualizado correctamente.' };
};

/**
 * Cambiar contraseña.
 */
const changePassword = async (id_usuario, contrasenaActual, nuevaContrasena) => {
    const sql = await getPool();

    const users = await sql`SELECT contrasena FROM usuarios WHERE id_usuario = ${id_usuario}`;

    if (users.length === 0) {
        throw { status: 404, message: 'Usuario no encontrado.' };
    }

    const match = await bcrypt.compare(contrasenaActual, users[0].contrasena);
    if (!match) {
        throw { status: 401, message: 'La contraseña actual es incorrecta.' };
    }

    const hashed = await bcrypt.hash(nuevaContrasena, 10);
    await sql`UPDATE usuarios SET contrasena = ${hashed} WHERE id_usuario = ${id_usuario}`;

    return { message: 'Contraseña actualizada correctamente.' };
};

module.exports = { login, register, getMe, updateProfile, changePassword };
