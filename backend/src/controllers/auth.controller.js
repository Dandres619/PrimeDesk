const authService = require('../services/auth.service');

const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        const data = await authService.login(correo, contrasena);
        res.status(200).json(data);
    } catch (err) {
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

        res.status(201).json({ message: 'Usuario registrado correctamente.', usuario: data });
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

const changePassword = async (req, res) => {
    try {
        const { contrasena_actual, nueva_contrasena } = req.body;
        const data = await authService.changePassword(req.user.id_usuario, contrasena_actual, nueva_contrasena);
        res.status(200).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error interno.' });
    }
};

module.exports = { login, register, getMe, changePassword };
