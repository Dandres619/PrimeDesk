const { sendContactEmail } = require('../services/email.service');

const contact = async (req, res) => {
    try {
        const { nombre, correo, asunto, mensaje } = req.body;

        const supportTo = process.env.SUPPORT_EMAIL || process.env.SENDER_EMAIL || 'support@yourdomain.com';

        const html = `
            <p>Nuevo mensaje de contacto</p>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Correo:</strong> ${correo}</p>
            <p><strong>Asunto:</strong> ${asunto}</p>
            <p><strong>Mensaje:</strong><br/>${mensaje}</p>
        `;

        // Enviar al soporte
        await sendContactEmail(supportTo, `Contacto: ${asunto}`, html);

        // Opcional: enviar acuse al remitente
        try {
            await sendContactEmail(correo, `Hemos recibido tu mensaje: ${asunto}`, `<p>Hola ${nombre},</p><p>Hemos recibido tu mensaje y te responderemos pronto.</p>`);
        } catch (e) {
            // no bloquear la respuesta principal
            console.warn('No se pudo enviar acuse al remitente', e.message || e);
        }

        res.status(200).json({ message: 'Mensaje enviado correctamente.' });
    } catch (err) {
        res.status(500).json({ message: 'Error enviando el mensaje.' });
    }
};

module.exports = { contact };
