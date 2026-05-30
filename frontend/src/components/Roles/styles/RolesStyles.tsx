export function RolesStyles() {
    return (
        <style>{`
            .roles-root {
                min-height: 100vh;
                border-radius: 20px;
                overflow: hidden;
                padding: 32px;
            }

            /* ── DARK MODE (CINEMATIC) ── */
            .dark .roles-root {
                background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%) !important;
                color: #f1f5f9 !important;
            }

            .dark .roles-root [data-slot="card"] {
                background: rgba(15, 23, 42, 0.7) !important;
                backdrop-filter: blur(12px) !important;
                border: 1px solid rgba(99, 102, 241, 0.3) !important;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6) !important;
            }

            .dark .roles-root [data-slot="card-title"],
            .dark [data-slot="dialog-title"] {
                color: #ffffff !important;
                text-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
            }

            /* Autofill Fix */
            .dark input:-webkit-autofill,
            .dark input:-webkit-autofill:hover, 
            .dark input:-webkit-autofill:focus, 
            .dark input:-webkit-autofill:active {
                -webkit-box-shadow: 0 0 0 30px #020617 inset !important;
                -webkit-text-fill-color: #ffffff !important;
                transition: background-color 5000s ease-in-out 0s;
                caret-color: #ffffff !important;
            }

            /* Table Header */
            .dark .roles-root th {
                color: #94a3b8 !important;
                border-bottom: 1px solid rgba(99, 102, 241, 0.2) !important;
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 0.1em;
            }

            /* Table Rows */
            .dark .roles-root tr {
                border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                transition: background 0.2s ease;
            }

            .dark .roles-root tr:hover {
                background: rgba(99, 102, 241, 0.05) !important;
            }

            .dark .roles-root td {
                color: #cbd5e1 !important;
            }

            /* Inputs */
            .dark .roles-root input {
                background: rgba(2, 6, 23, 0.6) !important;
                border: 1.5px solid rgba(99, 102, 241, 0.2) !important;
                color: #ffffff !important;
            }

            .dark .roles-root input:focus {
                border-color: #6366f1 !important;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2) !important;
            }

            /* Buttons */
            .roles-btn-primary {
                background: linear-gradient(135deg, #2563eb, #4f46e5);
                color: #ffffff !important;
                border: none;
                border-radius: 10px;
                padding: 10px 20px;
                font-weight: 600;
                box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
                transition: all 0.2s ease;
            }

            .roles-btn-primary:hover {
                background: linear-gradient(135deg, #1d4ed8, #4338ca);
                box-shadow: 0 6px 14px rgba(37, 99, 235, 0.3);
                transform: translateY(-1px);
            }

            .dark .roles-btn-primary {
                background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
                border-radius: 12px !important;
                font-weight: 600 !important;
                /* Reduced glow */
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
                transition: all 0.2s ease !important;
            }

            .dark .roles-btn-primary:hover {
                box-shadow: 0 6px 15px rgba(99, 102, 241, 0.2) !important;
                transform: translateY(-1px);
            }

            /* Entrance Animation */
            .roles-content-animate {
                animation: roles-fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes roles-fade-in {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .mp-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: calc(100vh - 200px);
                gap: 16px;
            }
            .mp-loading-ring {
                width: 40px;
                height: 40px;
                border: 3px solid #cbd5e1;
                border-top-color: #2563eb;
                border-radius: 50%;
                animation: mp-spin 0.8s linear infinite;
            }
            @keyframes mp-spin { to { transform: rotate(360deg); } }
            .mp-loading-text {
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
            }
        `}</style>
    );
}
