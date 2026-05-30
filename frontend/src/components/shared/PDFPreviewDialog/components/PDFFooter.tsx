import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function PDFFooter() {
  return (
    <div className="mt-6 pt-4 border-t-2 border-slate-100 dark:border-slate-800 text-center text-[9px] text-slate-400 dark:text-slate-500 font-medium pb-2">
      <p>Documento generado electrónicamente el {format(new Date(), "PPP 'a las' p", { locale: es })}</p>
      <p className="mt-1 font-bold text-slate-500 dark:text-slate-400">Rafa Motos - Sistema de Gestión</p>
    </div>
  );
}
