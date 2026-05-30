require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'primedesk_fallback_secret',
    options: {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
        algorithm: 'HS256',
    },
};
