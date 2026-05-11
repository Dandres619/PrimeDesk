import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Activity } from 'lucide-react';

interface RecentActivityProps {
  activities: any[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" /> Actividad Reciente
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">Ver Historial</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {activities.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl bg-background border border-border shadow-sm group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">{item.detail}</p>
                </div>
              </div>
              <div className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
