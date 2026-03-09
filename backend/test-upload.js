const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testUpload() {
    console.log('Intentando subir archivo de prueba...');
    const content = 'test content ' + Date.now();
    const fileName = 'test-' + Date.now() + '.txt';

    // Convert string to Buffer for Node.js
    const buffer = Buffer.from(content);

    const { data, error } = await supabase.storage
        .from('profiles')
        .upload(fileName, buffer, {
            contentType: 'text/plain',
            upsert: true
        });

    if (error) {
        console.error('❌ Error al subir:', error.message);
        console.error('Detalles:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Archivo subido con éxito:', data.path);
        const { data: publicUrl } = supabase.storage
            .from('profiles')
            .getPublicUrl(fileName);
        console.log('🔗 URL pública:', publicUrl.publicUrl);

        // Limpiar
        await supabase.storage.from('profiles').remove([fileName]);
        console.log('🧹 Archivo de prueba eliminado.');
    }
}

testUpload();
