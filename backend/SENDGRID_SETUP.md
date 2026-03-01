SendGrid integration and setup
================================

Steps to enable email sending in this project:

1) Environment variables (add to your `.env` in `backend/` or set in your host):

   SENDGRID_API_KEY=SG.xxxxxxx
   SENDER_EMAIL=no-reply@yourdomain.com
   SUPPORT_EMAIL=soporte@yourdomain.com
   FRONTEND_URL=http://localhost:5173

2) Install dependency in `backend`:

   npm install

3) Database: create the `password_resets` table used for reset tokens.
   Run the following SQL in your PostgreSQL (Supabase) database:

   CREATE TABLE IF NOT EXISTS password_resets (
     id BIGSERIAL PRIMARY KEY,
     id_usuario bigint NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
     token_hash text NOT NULL,
     expires_at timestamptz NOT NULL,
     used boolean NOT NULL DEFAULT FALSE,
     created_at timestamptz DEFAULT NOW()
   );

4) API endpoints added:
   - POST /api/auth/forgot-password  { correo }
   - POST /api/auth/reset-password   { token, nueva_contrasena }
   - POST /api/contact               { nombre, correo, asunto, mensaje }

5) Frontend notes:
   - The reset link sent points to `${FRONTEND_URL}/reset-password?token=...`. Implement a page to collect `nueva_contrasena` and call `POST /api/auth/reset-password`.

6) Testing:
   - You can enable SendGrid sandbox for testing by setting `mail_settings.sandbox_mode` in `email.service.js` call or by setting `SENDGRID_SANDBOX=true` and adjusting code (currently the service accepts a `sandbox` option).
   - To run the DB migration script from the project root:

     ```bash
     cd backend
     npm install
     npm run migrate
     ```

7) Security:
   - Do NOT commit `.env` with API keys. Use environment variables in production.
