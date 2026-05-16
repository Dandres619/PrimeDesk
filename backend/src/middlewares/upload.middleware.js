const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directorio de subida (comentado o eliminado para evitar creación automática)
// const uploadDir = path.join(__dirname, '../../uploads/profiles');


// Configuración de almacenamiento en memoria para procesar con Supabase
const storage = multer.memoryStorage();

// Filtro de archivos (opcional, por seguridad)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp).'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
    fileFilter: fileFilter
});

module.exports = upload;
