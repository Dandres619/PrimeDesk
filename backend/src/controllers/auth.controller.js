const authService = require('../services/auth.service');
const { getPool } = require('../config/db');

const getCleanIP = (req) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '';
    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }
    if (ip === '::1' || ip === 'localhost') {
        ip = '127.0.0.1';
    }
    return ip.trim();
};

const checkLockout = async (sql, ip, deviceSerial, res) => {
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS intentos_login (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(100),
        device_serial VARCHAR(255),
        intentos INT DEFAULT 0,
        bloqueado_hasta TIMESTAMP WITH TIME ZONE
      )
    `;

    const activeLocks = await sql`
      SELECT * FROM intentos_login 
      WHERE (ip_address = ${ip} OR (device_serial = ${deviceSerial} AND device_serial != 'unknown_device'))
        AND bloqueado_hasta > NOW()
      LIMIT 1
    `;

    if (activeLocks.length > 0) {
        const lock = activeLocks[0];
        // Calculate time left relative to database time
        const dbTimeRes = await sql`SELECT NOW() as now`;
        const dbTime = new Date(dbTimeRes[0].now).getTime();
        const lockTime = new Date(lock.bloqueado_hasta).getTime();
        const timeLeft = Math.ceil((lockTime - dbTime) / 1000);

        if (timeLeft > 0) {
            res.status(429).json({
                message: `Demasiados intentos fallidos. Intenta nuevamente en ${Math.ceil(timeLeft / 60)} minutos.`,
                locked: true,
                timeLeft
            });
            return true;
        }
    }
    return false;
};

const incrementAttempts = async (sql, ip, deviceSerial) => {
    let record = await sql`
      SELECT * FROM intentos_login 
      WHERE ip_address = ${ip} OR (device_serial = ${deviceSerial} AND device_serial != 'unknown_device')
      LIMIT 1
    `;
    let currentAttempts = 0;
    if (record.length > 0) {
        currentAttempts = record[0].intentos + 1;
        await sql`
          UPDATE intentos_login 
          SET intentos = ${currentAttempts}, ip_address = ${ip}, device_serial = ${deviceSerial}
          WHERE id = ${record[0].id}
        `;
    } else {
        currentAttempts = 1;
        await sql`
          INSERT INTO intentos_login (ip_address, device_serial, intentos)
          VALUES (${ip}, ${deviceSerial}, 1)
        `;
    }
    return currentAttempts;
};

const handleBlockIfExceeded = async (sql, ip, deviceSerial, currentAttempts, res) => {
    if (currentAttempts >= 5) {
        await sql`
          UPDATE intentos_login 
          SET bloqueado_hasta = NOW() + interval '5 minutes'
          WHERE ip_address = ${ip} OR (device_serial = ${deviceSerial} AND device_serial != 'unknown_device')
        `;
        res.status(429).json({
            message: 'Demasiados intentos fallidos. Acceso bloqueado temporalmente por 5 minutos.',
            locked: true,
            timeLeft: 300
        });
        return true;
    }
    return false;
};

const login = async (req, res) => {
    const sql = await getPool();
    const ip = getCleanIP(req);
    const deviceSerial = req.headers['x-device-serial'] || req.body.deviceSerial || 'unknown_device';

    try {
        const isLocked = await checkLockout(sql, ip, deviceSerial, res);
        if (isLocked) return;

        // Synchronous pre-increment to avoid race conditions
        const currentAttempts = await incrementAttempts(sql, ip, deviceSerial);

        const { correo, contrasena } = req.body;
        try {
            const data = await authService.login(correo, contrasena);

            // Success: clear attempts in DB
            await sql`
              DELETE FROM intentos_login 
              WHERE ip_address = ${ip} OR (device_serial = ${deviceSerial} AND device_serial != 'unknown_device')
            `;
            return res.status(200).json(data);
        } catch (err) {
            if (err.status === 401) {
                const blocked = await handleBlockIfExceeded(sql, ip, deviceSerial, currentAttempts, res);
                if (blocked) return;

                const attemptsLeft = 5 - currentAttempts;
                const msg = `Credenciales incorrectas. Te ${attemptsLeft === 1 ? 'queda' : 'quedan'} ${attemptsLeft} ${attemptsLeft === 1 ? 'intento' : 'intentos'}.`;
                return res.status(401).json({ message: msg });
            } else {
                // Revert increment for non-auth errors
                await sql`
                  UPDATE intentos_login 
                  SET intentos = GREATEST(0, intentos - 1)
                  WHERE ip_address = ${ip} OR (device_serial = ${deviceSerial} AND device_serial != 'unknown_device')
                `;
                throw err;
            }
        }
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const register = async (req, res) => {
    const sql = await getPool();
    const ip = getCleanIP(req);
    const deviceSerial = req.headers['x-device-serial'] || req.body.deviceSerial || 'unknown_device';

    try {
        const isLocked = await checkLockout(sql, ip, deviceSerial, res);
        if (isLocked) return;

        // Pre-increment because registration could fail
        const currentAttempts = await incrementAttempts(sql, ip, deviceSerial);

        try {
            const {
                correo, contrasena, id_rol,
                nombre, apellido, tipo_documento, documento, telefono,
                barrio, direccion, fecha_nacimiento
            } = req.body;

            const data = await authService.register({
                correo, contrasena, id_rol,
                nombre, apellido, tipo_documento, documento, telefono,
                barrio, direccion, fecha_nacimiento
            });

            // Registration success: clear attempts in DB
            await sql`
              DELETE FROM intentos_login 
              WHERE ip_address = ${ip} OR (device_serial = ${deviceSerial} AND device_serial != 'unknown_device')
            `;

            res.status(201).json({ message: 'Usuario registrado correctamente. Revisa tu correo para verificar la cuenta.', usuario: data });
        } catch (err) {
            const blocked = await handleBlockIfExceeded(sql, ip, deviceSerial, currentAttempts, res);
            if (blocked) return;

            const attemptsLeft = 5 - currentAttempts;
            const msg = `${err.message || 'Error en el registro.'} Te ${attemptsLeft === 1 ? 'queda' : 'quedan'} ${attemptsLeft} ${attemptsLeft === 1 ? 'intento' : 'intentos'}.`;
            res.status(err.status || 400).json({ message: msg });
        }
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const getMe = async (req, res) => {
    try {
        const data = await authService.getMe(req.user.id_usuario);
        res.status(200).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const data = await authService.updateProfile(req.user.id_usuario, req.body, req.file);
        res.status(200).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { contrasena_actual, nueva_contrasena } = req.body;
        const data = await authService.changePassword(req.user.id_usuario, contrasena_actual, nueva_contrasena);
        res.status(200).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { correo } = req.body;
        await authService.requestPasswordReset(correo);
        res.status(200).json({ message: 'Si el correo existe, se envió un email con instrucciones.' });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, nueva_contrasena } = req.body;
        await authService.resetPassword(token, nueva_contrasena);
        res.status(200).json({ message: 'Contraseña restablecida correctamente.' });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const verify = async (req, res) => {
    try {
        const { token } = req.body;
        const data = await authService.verifyEmailToken(token);
        res.status(200).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const checkEmail = async (req, res) => {
    const sql = await getPool();
    const ip = getCleanIP(req);
    const deviceSerial = req.headers['x-device-serial'] || req.body.deviceSerial || 'unknown_device';

    try {
        const isLocked = await checkLockout(sql, ip, deviceSerial, res);
        if (isLocked) return;

        const { correo } = req.body;
        const data = await authService.checkEmail(correo);

        if (data.exists) {
            // Email exists: consider it a failed attempt (step 2 invalid)
            const currentAttempts = await incrementAttempts(sql, ip, deviceSerial);
            const blocked = await handleBlockIfExceeded(sql, ip, deviceSerial, currentAttempts, res);
            if (blocked) return;

            const attemptsLeft = 5 - currentAttempts;
            const msg = `Este correo electrónico ya está registrado. Te ${attemptsLeft === 1 ? 'queda' : 'quedan'} ${attemptsLeft} ${attemptsLeft === 1 ? 'intento' : 'intentos'}.`;
            return res.status(400).json({ exists: true, message: msg });
        }

        // Email is available/valid
        res.status(200).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const validateResetToken = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: 'Token requerido.' });
        }
        const data = await authService.validateResetToken(token);
        res.status(200).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

module.exports = { login, register, getMe, updateProfile, changePassword, forgotPassword, resetPassword, validateResetToken, verify, checkEmail };
