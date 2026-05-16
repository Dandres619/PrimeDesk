import { UserCog, Plus } from 'lucide-react';

export function UsersHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
          <UserCog className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gestión de acceso al sistema</p>
        </div>
      </div>
      <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 shrink-0">
          <Plus className="w-6 h-6" />
        </div>
        <div className="text-sm">
          <p className="font-semibold text-blue-900 dark:text-blue-300">¿Deseas registrar o eliminar un usuario?</p>
          <p className="text-blue-700 dark:text-blue-400">Dirígete al módulo de <strong>Empleados</strong> o <strong>Clientes</strong> para registrar o eliminar una cuenta vinculada a una persona.</p>
        </div>
      </div>
    </div>
  );
}
