export function ClientPanelStyles() {
  return (
    <style>{`
      /* Calendario estilos */
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background-color: #e2e8f0;
        border: 1px solid #e2e8f0;
      }
      .dark .calendar-grid {
        background-color: #1e293b;
        border-color: #1e293b;
      }
      .calendar-day {
        min-height: 100px;
        background-color: white;
        padding: 8px;
        transition: all 0.2s;
      }
      .dark .calendar-day {
        background-color: #0f172a;
      }
      .calendar-day:hover {
        background-color: #f8fafc;
      }
      .dark .calendar-day:hover {
        background-color: #1e293b;
      }
      .calendar-day.other-month {
        color: #cbd5e1;
        background-color: #f8fafc;
      }
      .dark .calendar-day.other-month {
        color: #475569;
        background-color: #020617;
      }
      .calendar-day.today {
        background-color: #eff6ff;
      }
      .dark .calendar-day.today {
        background-color: #1e3a8a30;
      }

      /* Loading Estándar */
      .mp-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
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
      .dark .mp-loading-ring {
        border-color: rgba(255, 255, 255, 0.1);
        border-top-color: #6366f1;
      }
      .dark .mp-loading-text {
        color: #94a3b8;
      }
    `}</style>
  );
}
