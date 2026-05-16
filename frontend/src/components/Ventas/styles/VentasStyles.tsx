export function VentasStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      .ventas-root {
        min-height: 100vh;
        border-radius: 20px;
        overflow: hidden;
        padding: 32px;
      }

      /* ── DARK MODE (CINEMATIC) ── */
      .dark .ventas-root {
        background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%) !important;
        color: #f1f5f9 !important;
      }

      .dark .ventas-root [data-slot="card"] {
        background: rgba(15, 23, 42, 0.7) !important;
        backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(99, 102, 241, 0.3) !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6) !important;
      }

      .dark .ventas-root [data-slot="card-title"],
      .dark [data-slot="dialog-title"] {
        color: #ffffff !important;
        text-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
      }

      /* Table Styles in Dark Mode */
      .dark .ventas-root th {
        color: #94a3b8 !important;
        border-bottom: 1px solid rgba(99, 102, 241, 0.2) !important;
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 0.1em;
      }

      .dark .ventas-root tr {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        transition: background 0.2s ease;
      }

      .dark .ventas-root tr:hover {
        background: rgba(99, 102, 241, 0.05) !important;
      }

      .dark .ventas-root td {
        color: #cbd5e1 !important;
      }

      /* Primary Button */
      .ventas-btn-primary {
        background: linear-gradient(135deg, #2563eb, #4f46e5) !important;
        color: white !important;
        font-weight: 700 !important;
        border-radius: 12px !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2) !important;
        border: none !important;
        height: 44px;
        padding: 0 24px;
      }

      .ventas-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4) !important;
        filter: brightness(1.1);
      }

      .dark .ventas-btn-primary {
        background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25) !important;
      }

      /* Entrance Animation */
      .ventas-content-animate {
        animation: ventas-fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      @keyframes ventas-fade-in {
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

      @keyframes mp-spin {
        to { transform: rotate(360deg); }
      }

      .mp-loading-text {
        font-size: 14px;
        color: #64748b;
        font-weight: 500;
      }

      .animate-modal {
        animation: modalShow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes modalShow {
        from { opacity: 0; transform: scale(0.95) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #cbd5e1;
      }
    `}} />
  );
}
