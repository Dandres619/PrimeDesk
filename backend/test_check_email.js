const authService = require('./src/services/auth.service');

async function test() {
    console.time('checkEmail');
    try {
        const result = await authService.checkEmail('test@noexiste.com');
        console.log('Resultado para no existe:', result);
    } catch (err) {
        console.error('Error:', err);
    }
    console.timeEnd('checkEmail');
    process.exit(0);
}

test();
