import { Badge } from '../../ui/badge';
import { Activity } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Panel de Control
          </h1>
          <Badge variant="outline" className="h-6 gap-1 bg-primary/5 text-primary border-primary/20 animate-pulse">
            <Activity className="w-3 h-3" /> EN VIVO
          </Badge>
        </div>
        <p className="text-muted-foreground font-medium">
          Resumen operativo y financiero · <span className="text-primary/80 italic font-semibold">Rafa Motos</span>
        </p>
      </div>
    </div>
  );
}
