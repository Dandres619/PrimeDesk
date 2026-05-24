export function DashboardStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      .dashboard-root {
        min-height: 100vh;
        border-radius: 20px;
        overflow: hidden;
        padding: 32px;
      }

      /* ── DARK MODE (CINEMATIC) ── */
      .dark .dashboard-root {
        background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%) !important;
        color: #f1f5f9 !important;
      }

      .dark .dashboard-root [data-slot="card"] {
        background: rgba(15, 23, 42, 0.7) !important;
        backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(99, 102, 241, 0.3) !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6) !important;
      }

      .dark .dashboard-root [data-slot="card-title"] {
        color: #ffffff !important;
        text-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
      }

      /* ── STAT CARDS ── */
      .dashboard-stat-card {
        position: relative;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .dashboard-stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        border-radius: 12px 12px 0 0;
      }

      .dashboard-stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
      }

      .dark .dashboard-stat-card:hover {
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.1) !important;
        border-color: rgba(99, 102, 241, 0.5) !important;
      }

      .dashboard-stat-card.gradient-blue::before {
        background: linear-gradient(90deg, #3b82f6, #6366f1);
      }
      .dashboard-stat-card.gradient-emerald::before {
        background: linear-gradient(90deg, #10b981, #14b8a6);
      }
      .dashboard-stat-card.gradient-amber::before {
        background: linear-gradient(90deg, #f59e0b, #f97316);
      }
      .dashboard-stat-card.gradient-violet::before {
        background: linear-gradient(90deg, #8b5cf6, #a855f7);
      }
      .dashboard-stat-card.gradient-rose::before {
        background: linear-gradient(90deg, #f43f5e, #e11d48);
      }
      .dashboard-stat-card.gradient-indigo::before {
        background: linear-gradient(90deg, #6366f1, #4f46e5);
      }

      /* ── STAT CARD ICON ANIMATIONS ── */
      .stat-icon-container {
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .dashboard-stat-card:hover .stat-icon-container {
        transform: scale(1.1) rotate(3deg);
      }

      /* ── CHART CARDS ── */
      .dashboard-chart-card {
        transition: all 0.3s ease;
      }

      .dashboard-chart-card:hover {
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1) !important;
      }

      .dark .dashboard-chart-card:hover {
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4) !important;
      }

      /* ── ACTIVITY FEED ── */
      .activity-item {
        transition: all 0.2s ease;
        border-radius: 12px;
        padding: 12px 16px;
      }

      .activity-item:hover {
        background: rgba(59, 130, 246, 0.04);
      }

      .dark .activity-item:hover {
        background: rgba(99, 102, 241, 0.08);
      }

      /* ── ENTRANCE ANIMATION ── */
      .dashboard-content-animate {
        animation: dashboard-fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      @keyframes dashboard-fade-in {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Stagger animation for stat cards */
      .stat-card-animate {
        opacity: 0;
        animation: stat-card-enter 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      .stat-card-animate:nth-child(1) { animation-delay: 0.05s; }
      .stat-card-animate:nth-child(2) { animation-delay: 0.1s; }
      .stat-card-animate:nth-child(3) { animation-delay: 0.15s; }
      .stat-card-animate:nth-child(4) { animation-delay: 0.2s; }
      .stat-card-animate:nth-child(5) { animation-delay: 0.25s; }
      .stat-card-animate:nth-child(6) { animation-delay: 0.3s; }

      @keyframes stat-card-enter {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Chart section entrance */
      .chart-section-animate {
        opacity: 0;
        animation: chart-section-enter 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.35s forwards;
      }

      @keyframes chart-section-enter {
        from {
          opacity: 0;
          transform: translateY(15px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Activity section entrance */
      .activity-section-animate {
        opacity: 0;
        animation: activity-section-enter 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
      }

      @keyframes activity-section-enter {
        from {
          opacity: 0;
          transform: translateY(15px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ── LOADING ── */
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

      /* ── CUSTOM SCROLLBAR ── */
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

      /* ── RECHARTS OVERRIDES ── */
      .dark .recharts-cartesian-axis-tick-value {
        fill: #94a3b8 !important;
      }

      .dark .recharts-cartesian-grid line {
        stroke: rgba(99, 102, 241, 0.1) !important;
      }

      .dark .recharts-legend-item-text {
        color: #cbd5e1 !important;
      }

      /* ── VALUE COUNTER ANIMATION ── */
      .value-animate {
        display: inline-block;
        animation: value-pop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes value-pop {
        0% {
          transform: scale(0.8);
          opacity: 0;
        }
        60% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      /* ── PULSE DOT FOR "EN VIVO" ── */
      .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        position: relative;
      }

      .pulse-dot::before {
        content: '';
        position: absolute;
        inset: -3px;
        border-radius: 50%;
        background: rgba(16, 185, 129, 0.3);
        animation: pulse-ring 2s ease-in-out infinite;
      }

      @keyframes pulse-ring {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.5); opacity: 0; }
      }
    `}} />
  );
}
