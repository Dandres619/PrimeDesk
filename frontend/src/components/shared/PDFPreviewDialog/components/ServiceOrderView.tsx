import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';
import { SectionTitle, InfoGrid } from './PDFSections';

export function ServiceOrderView({ data }: { data: any }) {
  const statusText = data?.estadoBase || (data?.anulada ? 'Anulada' : data?.associatedSaleId ? 'Reparación finalizada' : 'Pendiente de Venta');

  return (
    <div className="flex flex-col h-full">
      <PDFHeader title="Orden de Reparación" documentNumber={data?.orderNumber} date={data?.date} status={statusText} />
      <InfoGrid>
        <div className="text-left">
          <SectionTitle>Datos del Cliente</SectionTitle>
          <p className="font-semibold text-slate-800 text-[11px] mb-0.5">{data?.clientName}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Doc:</span> {data?.clientDocument}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Tel:</span> {data?.clientPhone}</p>
        </div>
        <div className="text-left">
          <SectionTitle>Motocicleta</SectionTitle>
          <p className="font-semibold text-slate-800 text-[11px] mb-0.5">{data?.motorcycleBrand} {data?.motorcycleModel}</p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Placa:</span> <span className="font-semibold text-slate-800">{data?.motorcyclePlate}</span></p>
          <p className="text-[10px] text-slate-600"><span className="font-medium">Año:</span> {data?.motorcycleYear}</p>
        </div>
      </InfoGrid>

      {data?.description && (
        <div className="mb-4">
          <SectionTitle>Descripción del Servicio</SectionTitle>
          <p className="text-[10px] text-slate-700 bg-slate-50 p-2.5 rounded-sm border border-slate-100 text-left">{data.description}</p>
        </div>
      )}

      {data?.observations && (
        <div className="mb-4">
          <SectionTitle>Observaciones del Cliente</SectionTitle>
          <p className="text-[10px] text-slate-700 bg-slate-50 p-2.5 rounded-sm border border-slate-100 text-left">{data.observations}</p>
        </div>
      )}

      <div className="mb-4">
        <SectionTitle>Avances del Trabajo</SectionTitle>
        {data?.progress && data.progress.length > 0 ? (
          <div className="space-y-2 mt-2">
            {data.progress.map((prog: any, i: number) => (
              <div key={i} className="flex gap-3 text-[10px] border-b border-slate-100 pb-2 text-left">
                <span className="font-bold text-slate-400 mt-0.5">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-slate-800 leading-snug">{prog.description}</p>
                  <p className="text-slate-500 text-[9px] mt-1"><span className="font-medium">Técnico:</span> {prog.technician}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 italic mt-2 text-left">Sin avances registrados.</p>
        )}
      </div>

      <div className="flex-grow"></div>
      <PDFFooter />
    </div>
  );
}
