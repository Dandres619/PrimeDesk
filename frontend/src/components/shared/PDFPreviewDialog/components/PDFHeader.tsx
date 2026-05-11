import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PDFHeaderProps {
  title: string;
  documentNumber: string | number;
  date: string | Date;
  status?: string;
}

export function PDFHeader({ title, documentNumber, date, status }: PDFHeaderProps) {
  return (
    <div className="flex justify-between items-start border-b border-slate-300 pb-3 mb-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight text-left">RAFA MOTOS</h1>
        <p className="text-[10px] text-slate-500 mt-1 font-medium text-left">Taller de Motocicletas Especializado</p>
        <p className="text-[9px] text-slate-500 text-left">Cra 54 #96a-17, Medellín | NIT: 900.123.456-7</p>
        <p className="text-[9px] text-slate-500 text-left">info@rafamotos.com | +57 300 123 4567</p>
      </div>
      <div className="text-right">
        <h2 className="text-sm font-bold text-slate-800 tracking-wider uppercase mb-1">{title}</h2>
        <p className="text-[10px] text-slate-600"><span className="font-semibold text-slate-800">Nº Documento:</span> {documentNumber}</p>
        <p className="text-[10px] text-slate-600 mt-0.5"><span className="font-semibold text-slate-800">Fecha:</span> {date ? format(new Date(date), 'PP', { locale: es }) : ''}</p>
        {status && <p className="text-[9px] font-bold text-slate-800 mt-1.5 border border-slate-300 inline-block px-2 py-0.5 rounded-sm uppercase bg-slate-50">{status}</p>}
      </div>
    </div>
  );
}
