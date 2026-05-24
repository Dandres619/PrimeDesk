interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isCurrency?: boolean;
}

export function CustomTooltip({ active, payload, label, isCurrency = false }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-indigo-500/30 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm font-bold" style={{ color: entry.color || '#3b82f6' }}>
          {isCurrency
            ? `$${Number(entry.value).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
            : entry.value
          }
        </p>
      ))}
    </div>
  );
}
