const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getPool } = require('../config/db');
const jwtConfig = require('../config/jwt');
const emailService = require('./email.service');

require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173';

/**
 * Login: verifica correo/contraseña y devuelve JWT + datos del usuario.
 */
const login = async (correo, contrasena) => {
    const sql = await getPool();

    const users = await sql`
        SELECT u.id_usuario, u.correo, u.contrasena, u.id_rol, u.estado, u.correo_verificado,
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
        throw { status: 403, message: 'Su cuenta está inactiva. Por favor, contacte con la administración del taller para más información.' };
    }

    if (!user.correo_verificado) {
        throw { status: 403, message: 'Su correo no ha sido verificado. Por favor, revise su bandeja de entrada.' };
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

        // Generar token de verificación y enviarlo
        try {
            const userEmail = result.correo || data.correo;
            const token = crypto.randomBytes(32).toString('hex');
            const tokenHash = await bcrypt.hash(token, 10);
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

            await sql`
                INSERT INTO email_verifications (id_usuario, token_hash, expires_at, used)
                VALUES (${result.id_usuario}, ${tokenHash}, ${expiresAt}, FALSE)
            `;

            await emailService.sendVerificationEmail(userEmail, token, data.nombre || data.correo);
        } catch (e) {
            console.warn('No se pudo enviar email de verificación:', e.message || e);
        }

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
      SELECT u.id_usuario, u.correo AS "Correo", u.estado, u.id_rol, u.correo_verificado,
             r.nombre AS "NombreRol", r.descripcion AS "DescripcionRol",
             e.id_empleado AS "ID_Empleado", e.nombre AS "NombreEmpleado", e.apellido AS "ApellidoEmpleado",
             e.tipodocumento AS "TipoDocEmpleado", e.documento AS "DocEmpleado", e.telefono AS "TelEmpleado",
             e.barrio AS "BarrioEmpleado", e.direccion AS "DirEmpleado", e.fechanacimiento AS "NacEmpleado", e.foto AS "FotoEmpleado",
             c.id_cliente AS "ID_Cliente", c.nombre AS "NombreCliente", c.apellido AS "ApellidoCliente",
             c.tipodocumento AS "TipoDocumento", c.documento AS "Documento", c.telefono AS "Telefono", 
             c.barrio AS "Barrio", c.direccion AS "Direccion", c.fechanacimiento AS "FechaNacimiento", c.foto AS "FotoCliente"
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id_rol
      LEFT JOIN empleados e ON e.id_usuario = u.id_usuario
      LEFT JOIN clientes c ON c.id_usuario = u.id_usuario
      WHERE u.id_usuario = ${id_usuario}
    `;

    if (users.length === 0) {
        throw { status: 404, message: 'Usuario no encontrado.' };
    }

    const unUsuario = users[0];

    // Obtener los permisos del rol del usuario
    const permisos = await sql`
        SELECT p.nombre 
        FROM roles_permisos rp
        INNER JOIN permisos p ON rp.id_permiso = p.id_permiso
        WHERE rp.id_rol = ${unUsuario.id_rol}
    `;

    unUsuario.permisos = permisos.map(p => p.nombre);

    return unUsuario;
};

/**
 * Actualizar Perfil.
 */
const updateProfile = async (id_usuario, data, file) => {
    const sql = await getPool();
    const {
        nombre, apellido, tipo_documento, documento, telefono,
        barrio, direccion, foto, fecha_nacimiento
    } = data;

    const user = await getMe(id_usuario);
    const isClient = Number(user.id_rol) === 3;
    const currentFoto = isClient ? user.FotoCliente : user.FotoEmpleado;
    const currentNacimiento = isClient ? user.FechaNacimiento : user.NacEmpleado;

    // Determinar qué foto usar
    let finalFoto = currentFoto;
    if (file) {
        finalFoto = `/uploads/profiles/${file.filename}`;
    } else if (foto && foto.trim() !== '') {
        finalFoto = foto;
    }

    const finalNacimiento = fecha_nacimiento || currentNacimiento;

    if (isClient) {
        await sql`
            UPDATE clientes 
            SET nombre = ${nombre}, apellido = ${apellido}, tipodocumento = ${tipo_documento},
                documento = ${documento}, telefono = ${telefono}, barrio = ${barrio || null}, 
                direccion = ${direccion || null}, fechanacimiento = ${finalNacimiento || null},
                foto = ${finalFoto || null}
            WHERE id_usuario = ${id_usuario}
        `;
    } else {
        await sql.begin(async (tx) => {
            const emp = await tx`SELECT id_empleado FROM empleados WHERE id_usuario = ${id_usuario}`;
            if (emp.length === 0) {
                await tx`
                    INSERT INTO empleados (id_usuario, nombre, apellido, tipodocumento, documento, telefono, barrio, direccion, fechanacimiento, foto, fechaingreso)
                    VALUES (${id_usuario}, ${nombre}, ${apellido}, ${tipo_documento}, ${documento}, ${telefono}, ${barrio || null}, ${direccion || null}, ${finalNacimiento || null}, ${finalFoto || null}, NOW())
                `;
            } else {
                await tx`
                    UPDATE empleados 
                    SET nombre = ${nombre}, apellido = ${apellido}, tipodocumento = ${tipo_documento},
                        documento = ${documento}, telefono = ${telefono}, barrio = ${barrio || null}, 
                        direccion = ${direccion || null}, fechanacimiento = ${finalNacimiento || null},
                        foto = ${finalFoto || null}
                    WHERE id_usuario = ${id_usuario}
                `;
            }
        });
    }

    return { message: 'Perfil actualizado correctamente.' };
};

/**
 * Cambiar contraseña.
 */
const changePassword = async (id_usuario, contrasenaActual, nuevaContrasena) => {
    const sql = await getPool();

    const users = await sql`SELECT contrasena FROM usuarios WHERE id_usuario = ${id_usuario} `;

    if (users.length === 0) {
        throw { status: 404, message: 'Usuario no encontrado.' };
    }

    const match = await bcrypt.compare(contrasenaActual, users[0].contrasena);
    if (!match) {
        throw { status: 401, message: 'La contraseña actual es incorrecta.' };
    }

    const hashed = await bcrypt.hash(nuevaContrasena, 10);
    await sql`UPDATE usuarios SET contrasena = ${hashed} WHERE id_usuario = ${id_usuario} `;

    return { message: 'Contraseña actualizada correctamente.' };
};

/**
 * Solicitar restablecimiento de contraseña: genera token, lo guarda y envía email.
 */
const requestPasswordReset = async (correo) => {
    const sql = await getPool();

    const users = await sql`SELECT id_usuario, correo FROM usuarios WHERE correo = ${correo} `;
    if (users.length === 0) {
        // No revelar información: devolver sin error
        return;
    }

    const user = users[0];
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await sql.begin(async (tx) => {
        // Insertar registro de token
        await tx`INSERT INTO password_resets(id_usuario, token_hash, expires_at, used)
        VALUES(${user.id_usuario}, ${tokenHash}, ${expiresAt}, FALSE)`;
    });

    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

    try {
        await emailService.sendResetPasswordEmail(user.correo, null, resetLink);
    } catch (e) {
        console.warn('Error enviando email de reset:', e.message || e);
    }
};

/**
 * Restablecer contraseña con token público.
 */
const resetPassword = async (token, nuevaContrasena) => {
    const sql = await getPool();

    // Buscar tokens no usados y no expirados
    const rows = await sql`SELECT id, id_usuario, token_hash, expires_at, used
                           FROM password_resets
                           WHERE used = FALSE AND expires_at > NOW()`;

    // Buscar el token coincidente
    let match = null;
    for (const r of rows) {
        const ok = await bcrypt.compare(token, r.token_hash);
        if (ok) {
            match = r;
            break;
        }
    }

    if (!match) {
        throw { status: 400, message: 'Token inválido o expirado.' };
    }

    const hashed = await bcrypt.hash(nuevaContrasena, 10);

    await sql.begin(async (tx) => {
        await tx`UPDATE usuarios SET contrasena = ${hashed} WHERE id_usuario = ${match.id_usuario}`;
        await tx`UPDATE password_resets SET used = TRUE WHERE id = ${match.id}`;
    });
};

/**
 * Verificar email usando token público.
 */
const verifyEmailToken = async (token) => {
    const sql = await getPool();

    const rows = await sql`SELECT id, id_usuario, token_hash, expires_at, used FROM email_verifications WHERE used = FALSE AND expires_at > NOW()`;

    let match = null;
    for (const r of rows) {
        const ok = await bcrypt.compare(token, r.token_hash);
        if (ok) { match = r; break; }
    }

    if (!match) {
        throw { status: 400, message: 'Token de verificación inválido o expirado.' };
    }

    await sql.begin(async (tx) => {
        await tx`UPDATE usuarios SET correo_verificado = TRUE WHERE id_usuario = ${match.id_usuario}`;
        await tx`UPDATE email_verifications SET used = TRUE WHERE id = ${match.id}`;
    });

    return { message: 'Correo verificado correctamente.' };
};

module.exports = { login, register, getMe, updateProfile, changePassword, requestPasswordReset, resetPassword, verifyEmailToken };
