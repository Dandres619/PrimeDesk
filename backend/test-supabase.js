const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;

console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.service_role);

async function test() {
    console.log('Probando conexión y buckets...');
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('❌ Error conectando a Supabase:', error.message);
    } else {
        console.log('✅ Conexión exitosa. Buckets encontrados:', data.map(b => b.name));
        const profilesBucket = data.find(b => b.name === 'profiles');
        if (profilesBucket) {
            console.log('✅ El bucket "profiles" existe.');
            console.log('   Público:', profilesBucket.public);
        } else {
            console.log('❌ El bucket "profiles" NO existe. DEBES CREARLO en el panel de Supabase.');
        }
    }
}

test();
