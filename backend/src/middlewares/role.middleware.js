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

            const sql = await getPool();
            const rows = await sql`
                SELECT 1
                FROM roles_permisos rp
                INNER JOIN permisos p ON rp.id_permiso = p.id_permiso
                WHERE rp.id_rol = ${req.user.id_rol}
                  AND p.nombre = ${nombrePermiso}
            `;

            if (rows.length === 0) {
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
