import { Plus, Search, Wrench } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

interface ServiciosHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenDialog: () => void;
}

export function ServiciosHeader({ searchTerm, setSearchTerm, onOpenDialog }: ServiciosHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center transition-transform hover:scale-105">
            <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Servicios</h1>
            <p className="text-sm text-muted-foreground">Catálogo de servicios para motocicletas</p>
          </div>
        </div>
        <Button onClick={onOpenDialog} className="servicios-btn-primary whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      <div className="flex justify-start">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar servicios..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-10" 
          />
        </div>
      </div>
    </div>
  );
}
