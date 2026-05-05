const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173';

if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY no está definida. Emails no se enviarán.');
}

const sendMail = async ({ to, subject, text, html }) => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY no configurada');
    }

    const { data, error } = await resend.emails.send({
        from: {
            name: process.env.SENDER_NAME,
            email: process.env.SENDER_EMAIL,
        },
        reply_to: process.env.SUPPORT_EMAIL,
        to,
        subject,
        text,
        html,
    });

    if (error) throw error;
    return data;
};

const sendWelcomeEmail = async (to, name, options = {}) => {
    const subject = 'Bienvenido a Rafa Motos 🏁';
    const html = `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                    body { margin: 0; padding: 0; background-color: #020617; font-family: 'Inter', sans-serif; color: #f8fafc; }
                    .wrapper { width: 100%; background-color: #020617; padding-bottom: 40px; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #0b1426; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
                    .header { padding: 40px 0; text-align: center; background: linear-gradient(135deg, #0b1426, #161e31); }
                    .logo-box { display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #ef4444, #f97316); border-radius: 14px; line-height: 64px; font-weight: 800; font-size: 24px; color: #fff; margin-bottom: 16px; }
                    .content { padding: 40px 32px; text-align: center; }
                    h1 { font-size: 28px; margin: 0 0 16px 0; color: #fff; }
                    p { font-size: 16px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0; }
                    .btn { display: inline-block; padding: 16px 40px; background: linear-gradient(90deg, #ef4444, #f97316); color: #fff !important; text-decoration: none; font-weight: 700; border-radius: 12px; }
                    .footer { padding: 32px; text-align: center; background-color: rgba(0,0,0,0.2); font-size: 13px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="container">
                        <div class="header">
                            <div class="logo-box">RM</div>
                            <div style="font-size: 20px; font-weight: 700; color: #fff;">RAFA MOTOS</div>
                        </div>
                        <div class="content">
                            <h1>¡Bienvenido a bordo!</h1>
                            <p>Hola <strong>${name || 'cliente'}</strong>,</p>
                            <p>Gracias por unirte a la familia de Rafa Motos. Estamos comprometidos con la excelencia y el cuidado de tu motocicleta.</p>
                            <p>Desde tu panel personal podrás gestionar tus citas, ver el historial de mantenimiento y estar al tanto de cada ajuste de tu máquina.</p>
                            <a href="${FRONTEND_URL}" class="btn">ACCEDER AL PANEL</a>
                        </div>
                        <div class="footer">
                            <p>Rafa Motos · Pasión por las dos ruedas</p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;
    return sendMail({ to, subject, html, ...options });
};

const sendResetPasswordEmail = async (to, name, resetLink, options = {}) => {
    const subject = 'Restablece tu contraseña | Rafa Motos';
    const html = `
    <!doctype html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restablecer Contraseña - Rafa Motos</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                body { margin: 0; padding: 0; background-color: #020617; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
                .wrapper { width: 100%; background-color: #020617; padding-bottom: 40px; }
                .container { max-width: 600px; margin: 40px auto; background-color: #0b1426; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); }
                .header { padding: 40px 0; text-align: center; background: linear-gradient(135deg, #0b1426, #161e31); }
                .logo-box { display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #4f46e5, #9333ea); border-radius: 14px; line-height: 64px; text-align: center; font-weight: 800; font-size: 24px; color: #fff; margin-bottom: 16px; }
                .content { padding: 40px 32px; text-align: center; }
                h1 { font-size: 28px; font-weight: 700; margin: 0 0 16px 0; color: #fff; }
                p { font-size: 16px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0; }
                .btn { display: inline-block; padding: 16px 40px; background: linear-gradient(90deg, #4f46e5, #9333ea); color: #fff !important; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 12px; }
                .footer { padding: 32px; text-align: center; background-color: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); }
                .footer p { font-size: 13px; margin: 4px 0; }
                .accent { color: #6366f1; font-weight: 600; }
                .link-alt { font-size: 12px; color: #475569; word-break: break-all; margin-top: 24px; }
                @media screen and (max-width: 600px) { .container { margin-top: 20px; border-radius: 0; } }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <div class="logo-box">RM</div>
                        <div style="font-size: 20px; font-weight: 700; color: #fff; letter-spacing: 1px;">RAFA MOTOS</div>
                    </div>
                    <div class="content">
                        <h1>Recupera tu cuenta</h1>
                        <p>No te preocupes, nos pasa a todos. Hemos recibido una solicitud para restablecer tu contraseña en <span class="accent">Rafa Motos</span>.</p>
                        <a href="${resetLink}" class="btn">RESTABLECER CONTRASEÑA</a>
                        <p style="margin-top: 24px; font-size: 14px;">Este enlace expirará en 1 hora por motivos de seguridad.</p>
                        <p>Si no has solicitado este cambio, por favor ignora este correo.</p>
                        <div class="link-alt">
                            ¿Problemas con el botón? Copia este enlace:<br>
                            <a href="${resetLink}" style="color: #64748b;">${resetLink}</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p><strong>Rafa Motos</strong></p>
                        <p>Servicio Técnico Profesional para Motocicletas</p>
                        <p>© 2026 Rafa Motos. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </body>
    </html>
    `;
    return sendMail({ to, subject, html, ...options });
};

const sendContactEmail = async (to, subject, messageHtml, options = {}) => {
    return sendMail({ to, subject, html: messageHtml, ...options });
};

const sendVerificationEmail = async (to, token, name, options = {}) => {
    const verifyLink = `${FRONTEND_URL}/verify?token=${token}`;
    const subject = 'Verifica tu cuenta | Rafa Motos';
    const html = `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verificación de Cuenta - Rafa Motos</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                    body { margin: 0; padding: 0; background-color: #020617; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
                    .wrapper { width: 100%; background-color: #020617; padding-bottom: 40px; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #0b1426; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); }
                    .header { padding: 40px 0; text-align: center; background: linear-gradient(135deg, #0b1426, #161e31); }
                    .logo-box { display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #4f46e5, #9333ea); border-radius: 14px; line-height: 64px; text-align: center; font-weight: 800; font-size: 24px; color: #fff; margin-bottom: 16px; }
                    .content { padding: 40px 32px; text-align: center; }
                    h1 { font-size: 28px; font-weight: 700; margin: 0 0 16px 0; color: #fff; }
                    p { font-size: 16px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0; }
                    .btn { display: inline-block; padding: 16px 40px; background: linear-gradient(90deg, #4f46e5, #9333ea); color: #fff !important; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 12px; }
                    .footer { padding: 32px; text-align: center; background-color: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); }
                    .footer p { font-size: 13px; margin: 4px 0; }
                    .accent { color: #6366f1; font-weight: 600; }
                    .link-alt { font-size: 12px; color: #475569; word-break: break-all; margin-top: 24px; }
                    @media screen and (max-width: 600px) { .container { margin-top: 20px; border-radius: 0; } }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="container">
                        <div class="header">
                            <div class="logo-box">RM</div>
                            <div style="font-size: 20px; font-weight: 700; color: #fff; letter-spacing: 1px;">RAFA MOTOS</div>
                        </div>
                        <div class="content">
                            <h1>¡Activa tu motor!</h1>
                            <p>Hola <span class="accent">${name || 'amigo'}</span>,</p>
                            <p>Estamos listos para cuidar de tu máquina. Solo falta un paso para completar tu registro en nuestro taller especializado.</p>
                            <a href="${verifyLink}" class="btn">VERIFICAR CUENTA</a>
                            <p style="margin-top: 24px;">Si no has creado esta cuenta, puedes ignorar este mensaje de forma segura.</p>
                            <div class="link-alt">
                                ¿Problemas con el botón? Copia este enlace:<br>
                                <a href="${verifyLink}" style="color: #64748b;">${verifyLink}</a>
                            </div>
                        </div>
                        <div class="footer">
                            <p><strong>Rafa Motos</strong></p>
                            <p>Servicio Técnico Profesional para Motocicletas</p>
                            <p>© 2026 Rafa Motos. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;
    return sendMail({ to, subject, html, ...options });
};

module.exports = { sendMail, sendWelcomeEmail, sendResetPasswordEmail, sendContactEmail, sendVerificationEmail };