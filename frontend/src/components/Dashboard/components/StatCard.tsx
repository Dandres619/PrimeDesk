import { Card, CardContent } from '../../ui/card';

interface StatCardProps {
  stat: any;
  index: number;
}

export function StatCard({ stat, index }: StatCardProps) {
  const gradientClass = index === 0 ? 'from-blue-500 to-indigo-500' : 
                       index === 1 ? 'from-amber-400 to-orange-500' : 
                       index === 2 ? 'from-emerald-400 to-teal-500' : 
                       'from-rose-500 to-red-600';

  return (
    <Card className="group relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 ring-1 ring-border/50 hover:ring-primary/20 bg-card/80 backdrop-blur-xl">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradientClass}`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-black/5`}>
            <stat.icon className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-5 space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">{stat.title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black tracking-tighter tabular-nums">{stat.value}</h3>
          </div>
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            {stat.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
