export function AgendamientosStyles() {
    return (
        <style>{`
            .agendamientos-root {
                min-height: 100vh;
                border-radius: 20px;
                overflow: hidden;
                padding: 32px;
            }

            /* ── DARK MODE (CINEMATIC) ── */
            .dark .agendamientos-root {
                background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%) !important;
                color: #f1f5f9 !important;
            }

            .dark .agendamientos-root [data-slot="card"] {
                background: rgba(15, 23, 42, 0.7) !important;
                backdrop-filter: blur(12px) !important;
                border: 1px solid rgba(99, 102, 241, 0.3) !important;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6) !important;
            }

            .dark .agendamientos-root [data-slot="card-title"],
            .dark [data-slot="dialog-title"] {
                color: #ffffff !important;
                text-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
            }

            /* Primary Button */
            .agendamientos-btn-primary {
                background: linear-gradient(135deg, #2563eb, #4f46e5);
                color: white !important;
                font-weight: 700 !important;
                border-radius: 12px !important;
                transition: all 0.3s ease !important;
                box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2) !important;
                border: none !important;
            }

            .agendamientos-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4) !important;
                filter: brightness(1.1);
            }

            .dark .agendamientos-btn-primary {
                background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25) !important;
            }

            /* Entrance Animation */
            .agendamientos-content-animate {
                animation: agendamientos-fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes agendamientos-fade-in {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Modal Animation */
            @keyframes agendamientosModalScaleIn {
                from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }

            .animate-modal {
                animation: agendamientosModalScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

            /* Scrollbar Customization */
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(100, 116, 139, 0.2);
                border-radius: 10px;
            }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
            }
        `}</style>
    );
}
