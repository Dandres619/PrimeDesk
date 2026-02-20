const { getPool, sql } = require('../config/db');

/**
 * Middleware RBAC: verifica que el rol del usuario tenga el permiso requerido.
 * @param {string} nombrePermiso - Nombre del permiso requerido (columna Nombre en Permisos)
 */
const requirePermiso = (nombrePermiso) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id_rol) {
                return res.status(403).json({ message: 'Acceso denegado. Sin rol asignado.' });
            }

            const pool = await getPool();
            const result = await pool.request()
                .input('id_rol', sql.Int, req.user.id_rol)
                .input('nombre', sql.VarChar(50), nombrePermiso)
                .query(`
          SELECT 1
          FROM Roles_Permisos rp
          INNER JOIN Permisos p ON rp.ID_Permiso = p.ID_Permiso
          WHERE rp.ID_Rol = @id_rol
            AND p.Nombre = @nombre
        `);

            if (result.recordset.length === 0) {
                return res.status(403).json({
                    message: `Acceso denegado. Se requiere el permiso: ${nombrePermiso}`,
                });
            }

            next();
        } catch (error) {
            console.error('Error en middleware de permisos:', error);
            res.status(500).json({ message: 'Error al verificar permisos.' });
        }
    };
};

/**
 * Middleware RBAC: verifica que el usuario tenga uno de los roles permitidos.
 * @param {...number} roles - IDs de roles permitidos
 */
const requireRol = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.id_rol)) {
            return res.status(403).json({ message: 'Acceso denegado. Rol no autorizado.' });
        }
        next();
    };
};

module.exports = { requirePermiso, requireRol };
