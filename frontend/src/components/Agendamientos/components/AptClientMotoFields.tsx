import { Label } from '../../ui/label';
import { User } from 'lucide-react';
import { PiMotorcycle } from 'react-icons/pi';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Button } from '../../ui/button';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AptClientMotoFields({
  form, setForm, popovers, setPopovers, showErrors, search, setSearch,
  filteredClients, selectedClient, clientMotorcycles, selectedMoto
}: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" /> Cliente *
          {showErrors && !form.clientId && <span className="text-[10px] text-red-500 font-bold ml-auto">Requerido</span>}
        </Label>
        <Popover open={popovers.client} onOpenChange={(open: boolean) => setPopovers({ ...popovers, client: open })}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                !form.clientId && "text-slate-500",
                showErrors && !form.clientId && "border-red-500 ring-1 ring-red-500/20 bg-red-50/10"
              )}
            >
              <span className="truncate">
                {selectedClient ? `${selectedClient.Nombre} ${selectedClient.Apellido}` : "Seleccionar cliente..."}
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
            align="start"
            onCloseAutoFocus={(e: any) => e.preventDefault()}
          >
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
              <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                  placeholder="Buscar cliente..."
                  value={search.client}
                  onChange={(e: any) => setSearch({ ...search, client: e.target.value })}
                />
              </div>
            </div>
            <div
              className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar"
              onWheel={(e: any) => e.stopPropagation()}
            >
              {filteredClients.length === 0 ? (
                <div className="py-6 px-2 text-center">
                  <p className="text-sm text-slate-500">No se encontraron clientes.</p>
                </div>
              ) : (
                filteredClients.map((c: any) => (
                  <div
                    key={c.ID_Cliente}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                      "hover:bg-slate-50 dark:hover:bg-slate-900",
                      form.clientId === c.ID_Cliente.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                    )}
                    onClick={() => {
                      setForm({ ...form, clientId: c.ID_Cliente.toString(), motorcycleId: '' });
                      setPopovers({ ...popovers, client: false });
                      setSearch({ ...search, client: '' });
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", form.clientId === c.ID_Cliente.toString() ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                      <span>{c.Nombre} {c.Apellido}</span>
                      <span className="text-[10px] opacity-60">CC: {c.Documento}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiMotorcycle className="w-5 h-5 text-blue-500" /> Motocicleta *
          </div>
          {showErrors && !form.motorcycleId && <span className="text-[10px] text-red-500 font-bold">Requerido</span>}
        </Label>
        <Popover open={popovers.motorcycle} onOpenChange={(open: boolean) => setPopovers({ ...popovers, motorcycle: open })}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between font-medium h-11 px-4 text-left overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                !form.motorcycleId && "text-slate-500",
                showErrors && !form.motorcycleId && "border-red-500 ring-1 ring-red-500/20 bg-red-50/10"
              )}
              disabled={!form.clientId}
            >
              <span className="truncate">
                {selectedMoto
                  ? `${selectedMoto.Placa} — ${selectedMoto.Marca} ${selectedMoto.Modelo}`
                  : (form.clientId ? "Seleccionar motocicleta..." : "Primero el cliente...")}
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
            align="start"
            onCloseAutoFocus={(e: any) => e.preventDefault()}
          >
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
              <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                  placeholder="Buscar placa o modelo..."
                  value={search.motorcycle}
                  onChange={(e: any) => setSearch({ ...search, motorcycle: e.target.value })}
                />
              </div>
            </div>
            <div
              className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar"
              onWheel={(e: any) => e.stopPropagation()}
            >
              {clientMotorcycles.length === 0 ? (
                <div className="py-6 px-2 text-center">
                  <p className="text-sm text-slate-500">No se encontraron motocicletas.</p>
                </div>
              ) : (
                clientMotorcycles.map((m: any) => (
                  <div
                    key={m.ID_Motocicleta}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                      "hover:bg-slate-50 dark:hover:bg-slate-900",
                      form.motorcycleId === m.ID_Motocicleta.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                    )}
                    onClick={() => {
                      setForm({ ...form, motorcycleId: m.ID_Motocicleta.toString() });
                      setPopovers({ ...popovers, motorcycle: false });
                      setSearch({ ...search, motorcycle: '' });
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", form.motorcycleId === m.ID_Motocicleta.toString() ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                      <span>{m.Placa}</span>
                      <span className="text-[10px] opacity-60">{m.Marca} {m.Modelo}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
