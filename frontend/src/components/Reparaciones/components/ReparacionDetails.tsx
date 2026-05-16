import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Bike, ClipboardPen, Wrench } from 'lucide-react';

interface ReparacionDetailsProps {
  reparacion: any;
  getStatusBadge: (status: string) => React.ReactNode;
  onClose: () => void;
}

export function ReparacionDetails({ reparacion, getStatusBadge, onClose }: ReparacionDetailsProps) {
  if (!reparacion) return null;

  const data = reparacion;

  return (
    <DialogContent
      className="max-w-2xl animate-modal p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl rounded-2xl"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      {/* Header Banner */}
      <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-20 -mt-20 rounded-full" />
        <div className="relative z-10 flex flex-col gap-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0 transition-transform hover:scale-105">
              <ClipboardPen className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Detalles de la Reparación
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Orden #{data.orderNumber} · {getStatusBadge(data.estadoBase)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar space-y-8">
        {/* Main Info Card */}
        <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-100 dark:hover:bg-slate-900/80">
          <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-blue-600 shadow-xl border border-slate-100 dark:border-slate-800">
            <Bike className="w-12 h-12" />
          </div>
          <div className="text-left">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {data.motorcyclePlate}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
              {data.motorcycleBrand} {data.motorcycleModel}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-6 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-left">
          <DetailItem label="Cliente" value={data.clientName} />
          <DetailItem label="Identificación" value={data.clientDocument} />
        </div>

        {/* Services List */}
        <div className="space-y-4 text-left">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5 text-blue-600" /> Servicios Requeridos
          </Label>
          <div className="flex flex-wrap gap-2">
            {data.selectedServices?.map((s: string) => (
              <Badge key={s} variant="outline" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-bold px-3 py-1">
                {s}
              </Badge>
            ))}
          </div>
        </div>

        {/* Observations */}
        <div className="space-y-3 text-left">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Observaciones Generales</Label>
          <div className="p-5 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "{data.observations || 'Sin observaciones registradas'}"
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex justify-end">
        <Button
          onClick={onClose}
          className="h-11 px-8 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
        >
          Cerrar Vista
        </Button>
      </div>
    </DialogContent>
  );
}

function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{label}</Label>
      <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{value || '-'}</p>
    </div>
  );
}
