const authService = require('../services/auth.service');

// Store failed login attempts in memory
// Key: ip:IP_ADDR or serial:DEVICE_SERIAL
// Value: { count: number, lockUntil: number }
const attemptsStore = new Map();

const login = async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const deviceSerial = req.headers['x-device-serial'] || req.body.deviceSerial || 'unknown_device';
    const ipKey = `ip:${ip}`;
    const serialKey = `serial:${deviceSerial}`;

    const now = Date.now();

    // 1. Check if locked out
    const ipLock = attemptsStore.get(ipKey);
    const serialLock = deviceSerial !== 'unknown_device' ? attemptsStore.get(serialKey) : null;

    let activeLock = null;
    if (ipLock && ipLock.lockUntil > now) {
        activeLock = ipLock;
    } else if (serialLock && serialLock.lockUntil > now) {
        activeLock = serialLock;
    }

    if (activeLock) {
        const timeLeft = Math.ceil((activeLock.lockUntil - now) / 1000);
        return res.status(429).json({
            message: `Demasiados intentos fallidos. Intenta nuevamente en ${Math.ceil(timeLeft / 60)} minutos.`,
            locked: true,
            timeLeft
        });
    }

    // 2. Increment attempts synchronously BEFORE the async login call to prevent race conditions
    const ipAttempt = attemptsStore.get(ipKey) || { count: 0, lockUntil: 0 };
    ipAttempt.count += 1;
    
    let serialAttempt = null;
    if (deviceSerial !== 'unknown_device') {
        serialAttempt = attemptsStore.get(serialKey) || { count: 0, lockUntil: 0 };
        serialAttempt.count += 1;
    }

    // Save the incremented count in the store
    attemptsStore.set(ipKey, ipAttempt);
    if (deviceSerial !== 'unknown_device' && serialAttempt) {
        attemptsStore.set(serialKey, serialAttempt);
    }

    try {
        const { correo, contrasena } = req.body;
        const data = await authService.login(correo, contrasena);

        // Login success: clear attempts
        attemptsStore.delete(ipKey);
        if (deviceSerial !== 'unknown_device') {
            attemptsStore.delete(serialKey);
        }

        res.status(200).json(data);
    } catch (err) {
        if (err.status === 401) {
            const currentAttemptCount = Math.max(ipAttempt.count, serialAttempt ? serialAttempt.count : 0);
            if (currentAttemptCount >= 5) {
                const lockTime = Date.now() + 5 * 60 * 1000;
                ipAttempt.lockUntil = lockTime;
                attemptsStore.set(ipKey, ipAttempt);

                if (serialAttempt) {
                    serialAttempt.lockUntil = lockTime;
                    attemptsStore.set(serialKey, serialAttempt);
                }

                return res.status(429).json({
                    message: 'Demasiados intentos fallidos. Acceso bloqueado temporalmente por 5 minutos.',
                    locked: true,
                    timeLeft: 300
                });
            }

            const attemptsLeft = 5 - currentAttemptCount;
            const msg = `Credenciales incorrectas. Te ${attemptsLeft === 1 ? 'queda' : 'quedan'} ${attemptsLeft} ${attemptsLeft === 1 ? 'intento' : 'intentos'}.`;
            return res.status(401).json({ message: msg });
        } else {
            // Revert increment for non-auth errors (e.g. account inactive or unverified)
            ipAttempt.count = Math.max(0, ipAttempt.count - 1);
            attemptsStore.set(ipKey, ipAttempt);
            if (serialAttempt) {
                serialAttempt.count = Math.max(0, serialAttempt.count - 1);
                attemptsStore.set(serialKey, serialAttempt);
            }
        }
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

const register = async (req, res) => {
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

        res.status(201).json({ message: 'Usuario registrado correctamente. Revisa tu correo para verificar la cuenta.', usuario: data });
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
    try {
        const { correo } = req.body;
        const data = await authService.checkEmail(correo);
        res.status(200).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

module.exports = { login, register, getMe, updateProfile, changePassword, forgotPassword, resetPassword, verify, checkEmail };
