import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PDFHeaderProps {
  title: string;
  documentNumber: string | number;
  date: string | Date;
  dateLabel?: string;
  status?: string;
  anulada?: boolean;
}

export function PDFHeader({ title, documentNumber, date, dateLabel, status, anulada }: PDFHeaderProps) {
  return (
    <div className="mb-6 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
      <div className="flex flex-col items-center gap-2 mb-4 text-center">
        <div className="w-20 h-20 flex items-center justify-center shrink-0">
          <img src="/favicon/rafamotos-logo.png" alt="Rafa Motos Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">RAFA MOTOS</h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Taller de Motocicletas Especializado</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">NIT: 900.123.456-7 | Cra 54 #96a-17, Medellín</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">info@rafamotos.com | +57 300 123 4567</p>
        </div>
      </div>
      
      <div className="flex justify-between items-end border-t border-slate-50 dark:border-slate-800/50 pt-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase">{title}</h2>
          {status && (
            <div className="mt-1.5 text-left">
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block ${
                anulada || status === 'Anulada' || status === 'Anulado' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 
                status === 'Activa' || status === 'Completada' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 
                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {status}
              </span>
            </div>
          )}
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="text-xs text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Nº Documento:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{documentNumber}</span></p>
          {date && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5"><span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">{dateLabel || 'Fecha:'}</span> <span className="font-bold text-slate-800 dark:text-slate-200">{format(new Date(date), 'PPP', { locale: es })}</span></p>}
        </div>
      </div>
    </div>
  );
}
