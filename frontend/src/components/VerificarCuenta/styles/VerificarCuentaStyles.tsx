export function VerificarCuentaStyles() {
    return (
        <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes blurIn {
                from { filter: blur(10px); opacity: 0; }
                to { filter: blur(0); opacity: 1; }
            }
            .animate-blur-in { 
                animation: blurIn 0.5s ease-out; 
            }
        `}} />
    );
}
