import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function PDFFooter() {
  return (
    <div className="mt-4 pt-3 border-t border-slate-300 text-center text-[8px] text-slate-500">
      <p>Documento generado el {format(new Date(), 'PPpp', { locale: es })}</p>
      <p className="mt-0.5">Rafa Motos - Sistema de Gestión Administrativa | Este documento tiene validez administrativa interna.</p>
    </div>
  );
}
