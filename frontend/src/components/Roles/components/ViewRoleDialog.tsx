import { Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Badge } from '../../ui/badge';

interface ViewRoleDialogProps {
  viewingRole: any;
  setIsViewDialogOpen: (open: boolean) => void;
  isViewDialogOpen: boolean;
}

export function ViewRoleDialog({ viewingRole, setIsViewDialogOpen, isViewDialogOpen }: ViewRoleDialogProps) {
  return (
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-lg max-h-[90vh] overflow-y-auto animate-modal p-0"
      >
      {viewingRole && (
        <>
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <DialogHeader><DialogTitle className="text-lg font-semibold">{viewingRole.name}</DialogTitle></DialogHeader>
                    <Badge className={`text-[11px] px-2 py-0.5 ${viewingRole.status === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                      {viewingRole.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{viewingRole.description || 'Sin descripción'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          <div className="px-6 pb-6 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Permisos asignados</span>
              <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5">
                {viewingRole.permissions?.length || 0}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {viewingRole.permissions && viewingRole.permissions.length > 0 ? (
                viewingRole.permissions.map((p: any) => (
                  <span key={p.ID_Permiso} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40 transition-colors">
                    <Shield className="w-3 h-3" />
                    {p.Nombre}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tiene permisos asignados.</p>
              )}
            </div>
          </div>
        </>
      )}
    </DialogContent>
    </Dialog>
  );
}
