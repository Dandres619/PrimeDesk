export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border p-3 rounded-lg shadow-xl shadow-black/10 transition-all">
        <p className="text-sm font-bold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs py-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-semibold">{entry.name.includes('ingresos') || entry.name.includes('egresos') ? `$${entry.value.toLocaleString()}` : `${entry.value}%`}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
