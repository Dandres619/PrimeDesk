import { User, Mail, Plus } from 'lucide-react';
import { Dialog, DialogContent } from '../../ui/dialog';
import { Badge } from '../../ui/badge';

interface ViewUserDialogProps {
  viewingUser: any;
  isViewDialogOpen: boolean;
  setIsViewDialogOpen: (open: boolean) => void;
  tipoBadges: Record<string, any>;
}

export function ViewUserDialog({
  viewingUser,
  isViewDialogOpen,
  setIsViewDialogOpen,
  tipoBadges
}: ViewUserDialogProps) {
  return (
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent className="max-w-md animate-modal p-0 overflow-hidden">
        {viewingUser && (
          <>
            <div className="px-6 pt-6 pb-6 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  {viewingUser.Foto ? (
                    <img src={viewingUser.Foto} alt="Perfil" className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-md" />
                  ) : (
                    <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <Badge className={`absolute -bottom-2 -right-2 border-2 border-white dark:border-slate-800 shadow-sm ${viewingUser.Estado ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                    {viewingUser.Estado ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {viewingUser.Nombre || viewingUser.Apellido ? `${viewingUser.Nombre || ''} ${viewingUser.Apellido || ''}` : 'Sin nombre asignado'}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Badge variant="outline" className={tipoBadges[viewingUser.NombreRol]?.class}>
                      {viewingUser.NombreRol}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Correo Electrónico</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{viewingUser.Correo}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100/50 dark:border-blue-800/50">
                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Plus className="w-4 h-4 rotate-45" />
                  </div>
                  <p className="text-xs text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                    Este es un perfil de acceso al sistema. Los datos personales detallados se gestionan en los módulos de <strong>Empleados</strong> o <strong>Clientes</strong>.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
