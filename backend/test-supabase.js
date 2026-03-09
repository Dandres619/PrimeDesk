const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey ? supabaseKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseKey);

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
