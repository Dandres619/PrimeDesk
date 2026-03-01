require('dotenv').config();
const { sendMail } = require('../services/email.service');

const run = async () => {
    try {
        console.log('Enviando email de prueba (welcome) usando SendGrid...');
        // Usamos la función de bienvenida para probar plantilla o HTML
        await require('../services/email.service').sendWelcomeEmail(process.env.SENDER_EMAIL, 'Daniel');
        console.log('✅ Email de bienvenida enviado correctamente.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error enviando email de prueba:');
        if (err && err.response && err.response.body) {
            console.error('SendGrid response body:', JSON.stringify(err.response.body, null, 2));
        } else {
            console.error(err);
        }
        process.exit(1);
    }
};

run();
