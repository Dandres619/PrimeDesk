export function MotosStyles() {
    return (
        <style>{`
            .motos-root {
                min-height: 100vh;
                background: transparent;
                font-family: inherit;
                border-radius: 20px;
                overflow: hidden;
                padding: 32px;
            }

            /* ── Scrollbar ── */
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(99, 102, 241, 0.2);
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(99, 102, 241, 0.4);
            }

            /* ── Entrance Animation ── */
            .motos-content-animate {
                animation: motos-fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes motos-fade-in {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* ── DARK MODE (ULTRA CINEMATIC) ── */
            .dark .motos-root {
                background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%) !important;
                color: #f1f5f9 !important;
            }

            .dark .motos-root [data-slot="card"] {
                background: rgba(15, 23, 42, 0.7) !important;
                backdrop-filter: blur(12px) !important;
                border: 1px solid rgba(99, 102, 241, 0.3) !important;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6) !important;
            }

            .dark .motos-root [data-slot="card-title"],
            .dark [data-slot="dialog-title"] {
                color: #ffffff !important;
                text-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
            }

            /* Table Header */
            .dark .motos-root th {
                color: #94a3b8 !important;
                border-bottom: 1px solid rgba(99, 102, 241, 0.2) !important;
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 0.1em;
            }

            /* Table Rows */
            .dark .motos-root tr {
                border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                transition: background 0.2s ease;
            }

            .dark .motos-root tr:hover {
                background: rgba(99, 102, 241, 0.05) !important;
            }

            .dark .motos-root td {
                color: #cbd5e1 !important;
            }

            /* Inputs */
            .dark .motos-root input {
                background: rgba(2, 6, 23, 0.6) !important;
                border: 1.5px solid rgba(99, 102, 241, 0.2) !important;
                color: #ffffff !important;
            }

            .dark .motos-root input:focus {
                border-color: #6366f1 !important;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2) !important;
            }

            /* Buttons */
            .motos-btn-primary {
                background: linear-gradient(135deg, #2563eb, #4f46e5);
                color: #ffffff !important;
                border: none;
                border-radius: 10px;
                padding: 10px 20px;
                font-weight: 600;
                box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
                transition: all 0.2s ease;
            }

            .motos-btn-primary:hover {
                background: linear-gradient(135deg, #1d4ed8, #4338ca);
                box-shadow: 0 6px 14px rgba(37, 99, 235, 0.3);
                transform: translateY(-1px);
            }

            .dark .motos-btn-primary {
                background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
                border-radius: 12px !important;
                font-weight: 600 !important;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
                transition: all 0.2s ease !important;
            }

            .dark .motos-btn-primary:hover {
                box-shadow: 0 6px 15px rgba(99, 102, 241, 0.2) !important;
                transform: translateY(-1px);
            }

            /* Action Buttons */
            .dark .motos-root .text-blue-600 {
                color: #818cf8 !important;
            }
            .dark .motos-root .text-green-600 {
                color: #4ade80 !important;
            }
            .dark .motos-root .text-red-600 {
                color: #f87171 !important;
            }
            .dark .motos-root .hover\:bg-blue-50:hover {
                background: rgba(99, 102, 241, 0.15) !important;
            }
            .dark .motos-root .hover\:bg-green-50:hover {
                background: rgba(74, 222, 128, 0.1) !important;
            }
            .dark .motos-root .hover\:bg-red-50:hover {
                background: rgba(248, 113, 113, 0.1) !important;
            }
            /* ── Loading State ── */
            .mp-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: calc(100vh - 200px);
                gap: 16px;
                background: transparent;
            }

            .mp-loading-ring {
                width: 40px;
                height: 40px;
                border: 3px solid #cbd5e1;
                border-top-color: #2563eb;
                border-radius: 50%;
                animation: mp-spin 0.8s linear infinite;
            }

            @keyframes mp-spin {
                to { transform: rotate(360deg); }
            }

            .mp-loading-text {
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
            }

            .dark .mp-loading-ring {
                border-color: rgba(255, 255, 255, 0.1);
                border-top-color: #6366f1;
            }

            .dark .mp-loading-text {
                color: #94a3b8 !important;
            }
        `}</style>
    );
}
