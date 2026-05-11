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
    `}</style>
  );
}
