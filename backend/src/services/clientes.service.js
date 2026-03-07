const { getPool } = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('./email.service');

const getAll = async () => {
  const sql = await getPool();
  return await sql`
        SELECT c.id_cliente AS "ID_Cliente", c.id_usuario AS "ID_Usuario", c.nombre AS "Nombre", 
               c.apellido AS "Apellido", c.tipodocumento AS "TipoDocumento", c.documento AS "Documento",
               c.telefono AS "Telefono", c.barrio AS "Barrio", c.direccion AS "Direccion", 
               c.fechanacimiento AS "FechaNacimiento", c.foto AS "Foto", u.correo AS "Correo",
               u.correo_verificado AS "CorreoVerificado", u.estado AS "EstadoUsuario",
               (SELECT COUNT(*) FROM motocicletas WHERE id_cliente = c.id_cliente)::int AS "MotosCount"
        FROM clientes c
        LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
        ORDER BY c.id_cliente DESC
    `;
};

const getById = async (id) => {
  const sql = await getPool();
  const rows = await sql`
        SELECT c.id_cliente AS "ID_Cliente", c.id_usuario AS "ID_Usuario", c.nombre AS "Nombre", 
               c.apellido AS "Apellido", c.tipodocumento AS "TipoDocumento", c.documento AS "Documento",
               c.telefono AS "Telefono", c.barrio AS "Barrio", c.direccion AS "Direccion", 
               c.fechanacimiento AS "FechaNacimiento", c.foto AS "Foto", u.correo AS "Correo",
               u.correo_verificado AS "CorreoVerificado", u.estado AS "EstadoUsuario",
               (SELECT COUNT(*) FROM motocicletas WHERE id_cliente = c.id_cliente)::int AS "MotosCount"
        FROM clientes c
        LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE c.id_cliente = ${id}
    `;
  if (rows.length === 0) throw { status: 404, message: 'Cliente no encontrado.' };
  return rows[0];
};

const create = async (data) => {
  const sql = await getPool();
  const {
    crear_usuario, correo, contrasena,
    nombre, apellido, tipo_documento, documento, telefono,
    barrio, direccion, fecha_nacimiento, foto
  } = data;

  try {
    return await sql.begin(async (tx) => {
      let final_id_usuario = data.id_usuario || null;

      // 1. Si se solicita crear usuario
      if (crear_usuario && correo && contrasena) {
        // Verificar si existe
        const existing = await tx`SELECT id_usuario FROM usuarios WHERE correo = ${correo}`;
        if (existing.length > 0) throw { status: 409, message: 'El correo ya está registrado.' };

        const hashed = await bcrypt.hash(contrasena, 10);
        // id_rol 3 = Cliente
        const [newUser] = await tx`
            INSERT INTO usuarios (id_rol, correo, contrasena, estado, correo_verificado)
            VALUES (3, ${correo}, ${hashed}, TRUE, TRUE)
            RETURNING id_usuario
          `;
        final_id_usuario = newUser.id_usuario;

        // Enviar correo de verificación de forma asíncrona (sin bloquear la TRX)
        try {
          const token = crypto.randomBytes(32).toString('hex');
          const tokenHash = await bcrypt.hash(token, 10);
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

          await tx`
                  INSERT INTO email_verifications (id_usuario, token_hash, expires_at, used)
                  VALUES (${final_id_usuario}, ${tokenHash}, ${expiresAt}, FALSE)
              `;

          // Note: In real production, email sending should be outside TX or handled by a job
          emailService.sendVerificationEmail(correo, token, nombre);
        } catch (e) {
          console.warn('Error email verificación:', e);
        }
      }

      // 2. Crear Cliente
      const [row] = await tx`
          INSERT INTO clientes (id_usuario, nombre, apellido, tipodocumento, documento,
              telefono, barrio, direccion, fechanacimiento, foto)
          VALUES (${final_id_usuario}, ${nombre}, ${apellido}, ${tipo_documento}, ${documento},
              ${telefono}, ${barrio}, ${direccion}, ${fecha_nacimiento}, ${foto || null})
          RETURNING id_cliente AS "ID_Cliente", id_usuario AS "ID_Usuario", nombre AS "Nombre", 
                    apellido AS "Apellido", tipodocumento AS "TipoDocumento", documento AS "Documento",
                    telefono AS "Telefono", barrio AS "Barrio", direccion AS "Direccion", 
                    fechanacimiento AS "FechaNacimiento", foto AS "Foto"
        `;
      return row;
    });
  } catch (err) {
    throw err;
  }
};

const update = async (id, data) => {
  const sql = await getPool();
  const { nombre, apellido, tipo_documento, documento, telefono,
    barrio, direccion, fecha_nacimiento, foto } = data;

  const [row] = await sql`
        UPDATE clientes 
        SET nombre = ${nombre}, apellido = ${apellido}, tipodocumento = ${tipo_documento},
            documento = ${documento}, telefono = ${telefono}, barrio = ${barrio}, 
            direccion = ${direccion}, fechanacimiento = ${fecha_nacimiento}, foto = ${foto || null}
        WHERE id_cliente = ${id}
        RETURNING id_cliente AS "ID_Cliente", id_usuario AS "ID_Usuario", nombre AS "Nombre", 
                  apellido AS "Apellido", tipodocumento AS "TipoDocumento", documento AS "Documento",
                  telefono AS "Telefono", barrio AS "Barrio", direccion AS "Direccion", 
                  fechanacimiento AS "FechaNacimiento", foto AS "Foto"
    `;
  if (!row) throw { status: 404, message: 'Cliente no encontrado.' };
  return row;
};

const remove = async (id) => {
  const sql = await getPool();

  // Obtener ID de usuario antes de borrar el cliente
  const [cli] = await sql`SELECT id_usuario FROM clientes WHERE id_cliente = ${id}`;
  if (!cli) throw { status: 404, message: 'Cliente no encontrado.' };

  try {
    return await sql.begin(async (tx) => {
      // Borrar cliente
      await tx`DELETE FROM clientes WHERE id_cliente = ${id}`;
      // Borrar usuario si existe
      if (cli.id_usuario) {
        await tx`DELETE FROM usuarios WHERE id_usuario = ${cli.id_usuario}`;
      }
      return { message: 'Cliente y usuario eliminados correctamente.' };
    });
  } catch (err) {
    throw err;
  }
};

module.exports = { getAll, getById, create, update, remove };
