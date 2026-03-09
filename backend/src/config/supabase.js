const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.service_role;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Advertencia: SUPABASE_URL o SUPABASE_KEY no están definidas. El almacenamiento persistente no funcionará correctamente.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;
