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

            .verify-hero-title {
                font-size: 1.75rem;
                font-weight: 800;
                color: white;
                letter-spacing: -0.02em;
                margin-top: 0.5rem;
                margin-bottom: 0.25rem;
            }
            .verify-hero-subtitle {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: rgba(199, 210, 254, 0.8);
                font-weight: 500;
            }

            /* Panel Style - Glassmorphism Dark Mode */
            .verify-form-card {
                background: rgba(15, 23, 42, 0.75);
                backdrop-filter: blur(24px);
                -webkit-backdrop-filter: blur(24px);
                border-radius: 24px;
                padding: 2.5rem;
                box-shadow: 
                    0 30px 60px rgba(0, 0, 0, 0.6),
                    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
                    0 -4px 24px rgba(99, 102, 241, 0.15) inset;
                border: 1px solid rgba(255, 255, 255, 0.08);
            }

            .verify-form-header {
                margin-bottom: 1.5rem;
                text-align: center;
            }

            .verify-title {
                font-size: 1.75rem;
                font-weight: 800;
                margin-bottom: 0.5rem;
                background: linear-gradient(135deg, #a5b4fc, #c084fc);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .verify-subtitle {
                color: #94a3b8;
                font-size: 0.95rem;
                line-height: 1.5;
            }

            /* Submit Button Custom Styling */
            .verify-submit-btn {
                width: 100%;
                padding: 0.75rem 1.5rem;
                font-weight: 600;
                border-radius: 12px;
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
                color: white !important;
                transition: all 0.3s ease;
                border: none;
                box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            .verify-submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
                background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%) !important;
            }

            .verify-btn-arrow {
                transition: transform 0.3s ease;
            }

            .verify-submit-btn:hover .verify-btn-arrow {
                transform: translateX(3px);
            }
        `}} />
    );
}


