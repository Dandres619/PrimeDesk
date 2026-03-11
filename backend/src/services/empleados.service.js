const { getPool } = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('./email.service');
const supabase = require('../config/supabase');
const fs = require('fs');


const getAll = async () => {
  const sql = await getPool();
  return await sql`
        SELECT e.id_empleado AS "ID_Empleado", e.id_usuario AS "ID_Usuario", e.nombre AS "Nombre", 
               e.apellido AS "Apellido", e.tipodocumento AS "TipoDocumento", e.documento AS "Documento",
               e.telefono AS "Telefono", e.barrio AS "Barrio", e.direccion AS "Direccion", 
               e.fechanacimiento AS "FechaNacimiento", e.fechaingreso AS "FechaIngreso", 
               e.foto AS "Foto", u.correo AS "Correo", r.nombre AS "NombreRol", u.estado AS "EstadoUsuario"
        FROM empleados e
        INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
        INNER JOIN roles r ON u.id_rol = r.id_rol
        ORDER BY e.id_empleado DESC
    `;
};

const getById = async (id) => {
  const sql = await getPool();
  const rows = await sql`
        SELECT e.id_empleado AS "ID_Empleado", e.id_usuario AS "ID_Usuario", e.nombre AS "Nombre", 
               e.apellido AS "Apellido", e.tipodocumento AS "TipoDocumento", e.documento AS "Documento",
               e.telefono AS "Telefono", e.barrio AS "Barrio", e.direccion AS "Direccion", 
               e.fechanacimiento AS "FechaNacimiento", e.fechaingreso AS "FechaIngreso", 
               e.foto AS "Foto", u.correo AS "Correo", r.nombre AS "NombreRol"
        FROM empleados e
        INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE e.id_empleado = ${id}
    `;
  if (rows.length === 0) throw { status: 404, message: 'Empleado no encontrado.' };
  return rows[0];
};

const create = async (data, file) => {
  const sql = await getPool();
  let {
    correo, contrasena, id_rol, // id_rol for the user (Admin or Empleado)
    nombre, apellido, tipo_documento, documento, telefono,
    barrio, direccion, fecha_nacimiento, fecha_ingreso, foto
  } = data;

  if (file) {
    try {
        const fileBuffer = fs.readFileSync(file.path);
        const { data: uploadData, error } = await supabase.storage
            .from('profiles')
            .upload(file.filename, fileBuffer, { contentType: file.mimetype, upsert: true });

        if (error) {
            console.error('❌ Error al subir:', error.message);
        } else {
            const { data: publicUrl } = supabase.storage.from('profiles').getPublicUrl(file.filename);
            foto = publicUrl.publicUrl;
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
    } catch (err) {
        console.error('Error subiendo foto:', err);
    }
  }


  try {
    return await sql.begin(async (tx) => {
      // 1. Crear Usuario
      // Verificar si existe
      const existing = await tx`SELECT id_usuario FROM usuarios WHERE correo = ${correo}`;
      if (existing.length > 0) throw { status: 409, message: 'El correo ya está registrado.' };

      const hashed = await bcrypt.hash(contrasena, 10);
      const [newUser] = await tx`
          INSERT INTO usuarios (id_rol, correo, contrasena, estado, correo_verificado)
          VALUES (${id_rol || 2}, ${correo}, ${hashed}, TRUE, TRUE)
          RETURNING id_usuario
        `;
      const id_usuario = newUser.id_usuario;

      // Enviar correo de verificación
      try {
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = await bcrypt.hash(token, 10);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await tx`
                INSERT INTO email_verifications (id_usuario, token_hash, expires_at, used)
                VALUES (${id_usuario}, ${tokenHash}, ${expiresAt}, FALSE)
            `;

        emailService.sendVerificationEmail(correo, token, nombre);
      } catch (e) {
        console.warn('Error email verificación:', e);
      }

      // 2. Crear Empleado
      const [row] = await tx`
          INSERT INTO empleados (id_usuario, nombre, apellido, tipodocumento, documento,
              telefono, barrio, direccion, fechanacimiento, fechaingreso, foto)
          VALUES (${id_usuario}, ${nombre}, ${apellido}, ${tipo_documento}, ${documento},
              ${telefono}, ${barrio}, ${direccion}, ${fecha_nacimiento}, ${fecha_ingreso || new Date()}, ${foto || null})
          RETURNING id_empleado AS "ID_Empleado", id_usuario AS "ID_Usuario", nombre AS "Nombre", 
                    apellido AS "Apellido", tipodocumento AS "TipoDocumento", documento AS "Documento",
                    telefono AS "Telefono", barrio AS "Barrio", direccion AS "Direccion", 
                    fechanacimiento AS "FechaNacimiento", fechaingreso AS "FechaIngreso", foto AS "Foto"
        `;
      return row;
    });
  } catch (err) {
    throw err;
  }
};

const update = async (id, data, file) => {
  const sql = await getPool();
  let { nombre, apellido, tipo_documento, documento, telefono,
    barrio, direccion, fecha_nacimiento, foto } = data;

  if (file) {
    try {
        const fileBuffer = fs.readFileSync(file.path);
        const { data: uploadData, error } = await supabase.storage
            .from('profiles')
            .upload(file.filename, fileBuffer, { contentType: file.mimetype, upsert: true });

        if (error) {
            console.error('❌ Error al subir:', error.message);
        } else {
            const { data: publicUrl } = supabase.storage.from('profiles').getPublicUrl(file.filename);
            foto = publicUrl.publicUrl;
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
    } catch (err) {
        console.error('Error subiendo foto:', err);
    }
  } else if (!foto || foto === 'null') {
      // Mantenemos la foto de la BD si no se manda nueva foto y no se manda URL
      const [current] = await sql`SELECT foto FROM empleados WHERE id_empleado = ${id}`;
      // Si el frontend envia foto vacia, queremos borrarla? El req es si no cambia, foto viene a veces vacia del form data.
      // Espera, el frontend enviara foto = string vacio si es file! Asi que hay que conservar si no hay file Y foto=''
      if (current && (!foto || foto.trim() === '')) {
          foto = current.foto;
      }
  }


  const [row] = await sql`
        UPDATE empleados 
        SET nombre = ${nombre}, apellido = ${apellido}, tipodocumento = ${tipo_documento},
            documento = ${documento}, telefono = ${telefono}, barrio = ${barrio}, 
            direccion = ${direccion}, fechanacimiento = ${fecha_nacimiento}, foto = ${foto || null}
        WHERE id_empleado = ${id}
        RETURNING id_empleado AS "ID_Empleado", id_usuario AS "ID_Usuario", nombre AS "Nombre", 
                  apellido AS "Apellido", tipodocumento AS "TipoDocumento", documento AS "Documento",
                  telefono AS "Telefono", barrio AS "Barrio", direccion AS "Direccion", 
                  fechanacimiento AS "FechaNacimiento", fechaingreso AS "FechaIngreso", foto AS "Foto"
    `;
  if (!row) throw { status: 404, message: 'Empleado no encontrado.' };
  return row;
};

const remove = async (id) => {
  const sql = await getPool();

  // 1. Verificar agendamientos
  const agendamientos = await sql`SELECT COUNT(*) FROM agendamientos WHERE id_empleado = ${id}`;
  if (parseInt(agendamientos[0].count) > 0) {
    throw { status: 400, message: 'No se puede eliminar este empleado porque tiene agendamientos asignados.' };
  }

  // Obtener ID de usuario antes de borrar el empleado
  const [emp] = await sql`SELECT id_usuario FROM empleados WHERE id_empleado = ${id}`;
  if (!emp) throw { status: 404, message: 'Empleado no encontrado.' };

  try {
    return await sql.begin(async (tx) => {
      // Borrar empleado
      await tx`DELETE FROM empleados WHERE id_empleado = ${id}`;
      // Borrar usuario
      if (emp.id_usuario) {
        await tx`DELETE FROM usuarios WHERE id_usuario = ${emp.id_usuario}`;
      }
      return { message: 'Empleado y usuario eliminados correctamente.' };
    });
  } catch (err) {
    throw err;
  }
};

module.exports = { getAll, getById, create, update, remove };
