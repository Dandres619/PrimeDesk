const { getPool } = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');


const getAll = async () => {
  const sql = await getPool();
  return await sql`
        SELECT c.id_cliente AS "ID_Cliente", c.id_usuario AS "ID_Usuario", c.nombre AS "Nombre", 
               c.apellido AS "Apellido", c.tipodocumento AS "TipoDocumento", c.documento AS "Documento",
               c.telefono AS "Telefono", c.barrio AS "Barrio", c.direccion AS "Direccion", 
               c.fechanacimiento AS "FechaNacimiento", u.foto AS "Foto", u.correo AS "Correo",
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
               c.fechanacimiento AS "FechaNacimiento", u.foto AS "Foto", u.correo AS "Correo",
               u.correo_verificado AS "CorreoVerificado", u.estado AS "EstadoUsuario",
               (SELECT COUNT(*) FROM motocicletas WHERE id_cliente = c.id_cliente)::int AS "MotosCount"
        FROM clientes c
        LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE c.id_cliente = ${id}
    `;
  if (rows.length === 0) throw { status: 404, message: 'Cliente no encontrado.' };
  return rows[0];
};

const create = async (data, file) => {
  const sql = await getPool();
  let {
    crear_usuario, correo, contrasena,
    nombre, apellido, tipo_documento, documento, telefono,
    barrio, direccion, fecha_nacimiento, foto
  } = data;

  if (file) {
    try {
      const fileBuffer = file.buffer;
      const ext = path.extname(file.originalname);

      const nombreClean = (nombre || 'nombre').toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '_')
        .replace(/__+/g, '_')
        .replace(/^_+|_+$/g, '');

      const apellidoClean = (apellido || 'apellido').toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '_')
        .replace(/__+/g, '_')
        .replace(/^_+|_+$/g, '');

      const documentoClean = (documento || 'cedula').toString().replace(/[^a-zA-Z0-9]/g, '');
      const fileName = `foto_perfil_${nombreClean}_${apellidoClean}_${documentoClean}${ext}`;

      const { data: uploadData, error } = await supabase.storage
        .from('profiles')
        .upload(fileName, fileBuffer, { contentType: file.mimetype, upsert: true });

      if (error) {
        console.error('❌ Error al subir a Supabase:', error.message);
      } else {
        const { data: publicUrl } = supabase.storage.from('profiles').getPublicUrl(fileName);
        foto = `${publicUrl.publicUrl}?t=${Date.now()}`;
      }
    } catch (err) {
      console.error('Error subiendo foto:', err);
    }
  }


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
            INSERT INTO usuarios (id_rol, correo, contrasena, estado, correo_verificado, foto)
            VALUES (3, ${correo}, ${hashed}, TRUE, TRUE, ${foto || null})
            RETURNING id_usuario
          `;
        final_id_usuario = newUser.id_usuario;
      } else if (final_id_usuario && foto) {
        // Si no se crea usuario pero ya se especificó uno, actualizamos su foto
        await tx`UPDATE usuarios SET foto = ${foto} WHERE id_usuario = ${final_id_usuario}`;
      }

      const finalNacimiento = (fecha_nacimiento && fecha_nacimiento.trim() !== '') ? fecha_nacimiento : null;
      const [row] = await tx`
          INSERT INTO clientes (id_usuario, nombre, apellido, tipodocumento, documento,
              telefono, barrio, direccion, fechanacimiento)
          VALUES (${final_id_usuario}, ${nombre}, ${apellido}, ${tipo_documento}, ${documento},
              ${telefono}, ${barrio || null}, ${direccion || null}, ${finalNacimiento})
          RETURNING id_cliente AS "ID_Cliente", id_usuario AS "ID_Usuario", nombre AS "Nombre", 
                    apellido AS "Apellido", tipodocumento AS "TipoDocumento", documento AS "Documento",
                    telefono AS "Telefono", barrio AS "Barrio", direccion AS "Direccion", 
                    fechanacimiento AS "FechaNacimiento"
        `;
      row.Foto = foto || null;
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
      const fileBuffer = file.buffer;
      const ext = path.extname(file.originalname);

      const nombreClean = (nombre || 'nombre').toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '_')
        .replace(/__+/g, '_')
        .replace(/^_+|_+$/g, '');

      const apellidoClean = (apellido || 'apellido').toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '_')
        .replace(/__+/g, '_')
        .replace(/^_+|_+$/g, '');

      const documentoClean = (documento || 'cedula').toString().replace(/[^a-zA-Z0-9]/g, '');
      const fileName = `foto_perfil_${nombreClean}_${apellidoClean}_${documentoClean}${ext}`;

      const { data: uploadData, error } = await supabase.storage
        .from('profiles')
        .upload(fileName, fileBuffer, { contentType: file.mimetype, upsert: true });

      if (error) {
        console.error('❌ Error al subir a Supabase:', error.message);
      } else {
        const { data: publicUrl } = supabase.storage.from('profiles').getPublicUrl(fileName);
        foto = `${publicUrl.publicUrl}?t=${Date.now()}`;
      }
    } catch (err) {
      console.error('Error subiendo foto:', err);
    }
  } else if (!foto || foto === 'null') {
    const [current] = await sql`
      SELECT u.foto 
      FROM clientes c
      INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.id_cliente = ${id}
    `;
    // Si el frontend envia foto vacia/null y no envia file
    if (current && (!foto || foto.trim() === '')) {
      foto = current.foto;
    }
  }


  const finalNacimiento = (fecha_nacimiento && fecha_nacimiento.trim() !== '') ? fecha_nacimiento : null;
  
  const [row] = await sql.begin(async (tx) => {
    // 1. Obtener el id_usuario del cliente para actualizar su foto en usuarios
    const [cli] = await tx`SELECT id_usuario FROM clientes WHERE id_cliente = ${id}`;
    if (cli && cli.id_usuario) {
      await tx`UPDATE usuarios SET foto = ${foto || null} WHERE id_usuario = ${cli.id_usuario}`;
    }

    const [updatedCli] = await tx`
      UPDATE clientes 
      SET nombre = ${nombre}, apellido = ${apellido}, tipodocumento = ${tipo_documento},
          documento = ${documento}, telefono = ${telefono}, barrio = ${barrio || null}, 
          direccion = ${direccion || null}, fechanacimiento = ${finalNacimiento}
      WHERE id_cliente = ${id}
      RETURNING id_cliente AS "ID_Cliente", id_usuario AS "ID_Usuario", nombre AS "Nombre", 
                apellido AS "Apellido", tipodocumento AS "TipoDocumento", documento AS "Documento",
                telefono AS "Telefono", barrio AS "Barrio", direccion AS "Direccion", 
                fechanacimiento AS "FechaNacimiento"
    `;
    return [updatedCli];
  });

  if (!row) throw { status: 404, message: 'Cliente no encontrado.' };
  row.Foto = foto || null;
  return row;
};

const remove = async (id) => {
  const sql = await getPool();

  // 1. Verificar si el cliente existe y su estado
  const [cli] = await sql`SELECT c.id_usuario, u.estado, c.nombre, c.apellido FROM clientes c LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario WHERE c.id_cliente = ${id}`;
  if (!cli) throw { status: 404, message: 'Cliente no encontrado.' };

  // 2. Verificar asociaciones (motocicletas)
  const motos = await sql`SELECT COUNT(*) FROM motocicletas WHERE id_cliente = ${id}`;
  if (parseInt(motos[0].count) > 0) {
    throw { status: 400, message: `No se puede eliminar al cliente ${cli.nombre} ${cli.apellido} porque tiene motocicletas asociadas.` };
  }

  // 3. Verificar agendamientos
  const agendamientos = await sql`SELECT COUNT(*) FROM agendamientos a INNER JOIN motocicletas m ON a.id_motocicleta = m.id_motocicleta WHERE m.id_cliente = ${id}`;
  if (parseInt(agendamientos[0].count) > 0) {
    throw { status: 400, message: `No se puede eliminar al cliente ${cli.nombre} ${cli.apellido} porque tiene agendamientos registrados.` };
  }

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
