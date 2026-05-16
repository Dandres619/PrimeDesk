import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Checkbox } from '../../ui/checkbox';
import { Textarea } from '../../ui/textarea';
import { DollarSign, Loader2, Search, Check, ChevronsUpDown, ClipboardPen } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SaleDialogProps {
  clients: any[];
  motorcycles: any[];
  purchases: any[];
  serviceTypes: any[];
  serviceOrders: any[];
  onSave: (data: any) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
}

export function SaleDialog({ purchases, serviceOrders, onSave, onOpenChange }: Omit<SaleDialogProps, 'clients' | 'motorcycles' | 'serviceTypes'>) {
  const [formData, setFormData] = useState({
    serviceOrderId: '',
    clientId: '',
    motorcycleId: '',
    selectedPurchases: [] as number[],
    selectedServices: [] as string[],
    serviceCost: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');

  const filteredOrders = serviceOrders.filter(order =>
    !order.associatedSaleId && (
      order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.clientName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.motorcyclePlate.toLowerCase().includes(orderSearch.toLowerCase())
    )
  );

  const selectedOrder = serviceOrders.find(o => o.id.toString() === formData.serviceOrderId);

  const handleOrderSelect = (orderId: string) => {
    const order = serviceOrders.find(o => o.id.toString() === orderId);
    setFormData(prev => ({
      ...prev,
      serviceOrderId: orderId,
      clientId: order ? order.clientId.toString() : '',
      motorcycleId: order ? order.motorcycleId.toString() : '',
      selectedServices: order && order.services ? order.services.map((s: any) => s.ID_Servicio.toString()) : []
    }));
    setPopoverOpen(false);
  };

  const handlePurchaseChange = (purchaseId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedPurchases: checked 
        ? [...prev.selectedPurchases, purchaseId]
        : prev.selectedPurchases.filter(id => id !== purchaseId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceOrderId || !formData.serviceCost || formData.selectedPurchases.length === 0) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    setIsSaving(true);
    const success = await onSave(formData);
    setIsSaving(false);
    if (success) onOpenChange(false);
  };

  // Totales
  const selectedPurchasesData = purchases.filter(p => formData.selectedPurchases.includes(p.id));
  const partsTotal = selectedPurchasesData.reduce((sum, p) => sum + p.total, 0);
  const grandTotal = partsTotal + parseFloat(formData.serviceCost || '0');

  return (
    <DialogContent 
      className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col animate-modal max-w-4xl w-[95vw] bg-white dark:bg-slate-950"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Registrar Nueva Venta
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Facturación de reparación y repuestos</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar space-y-8 text-left">
          {/* Section: Reparación */}
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <ClipboardPen className="w-3.5 h-3.5 text-blue-600" /> Orden de Reparación *
            </Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between font-medium h-12 px-4 text-left bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl",
                    !formData.serviceOrderId && "text-slate-500"
                  )}
                >
                  <span className="truncate">
                    {selectedOrder 
                      ? `${selectedOrder.orderNumber} - ${selectedOrder.clientName} (${selectedOrder.motorcyclePlate})` 
                      : "Seleccionar orden de reparación..."}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden pointer-events-auto" align="start">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <div className="flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500"
                      placeholder="Buscar por placa, cliente u orden..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-[250px] overflow-y-auto p-1 bg-white dark:bg-slate-950 custom-scrollbar" onWheel={(e) => e.stopPropagation()}>
                  {filteredOrders.length === 0 ? (
                    <div className="py-6 px-2 text-center text-sm text-slate-500">
                      No se encontraron órdenes pendientes.
                    </div>
                  ) : (
                    filteredOrders.map(order => (
                      <div
                        key={order.id}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center rounded-xl px-4 py-3 text-sm outline-none transition-colors",
                          "hover:bg-slate-50 dark:hover:bg-slate-900",
                          formData.serviceOrderId === order.id.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                        )}
                        onClick={() => handleOrderSelect(order.id.toString())}
                      >
                        <Check className={cn("mr-2 h-4 w-4", formData.serviceOrderId === order.id.toString() ? "opacity-100" : "opacity-0")} />
                        <div className="flex flex-col">
                          <span className="font-bold">{order.orderNumber} - {order.clientName}</span>
                          <span className="text-[10px] opacity-60 font-black uppercase">{order.motorcycleBrand} {order.motorcycleModel} — {order.motorcyclePlate}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Compras Asociadas */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Repuestos (Facturas de Compra) *</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                {purchases.map(p => (
                  <label 
                    key={p.id} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                      formData.selectedPurchases.includes(p.id)
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400"
                        : "bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={formData.selectedPurchases.includes(p.id)}
                        onCheckedChange={(checked) => handlePurchaseChange(p.id, checked as boolean)}
                      />
                      <span className="font-bold text-sm">{p.invoiceNumber}</span>
                    </div>
                    <span className="font-black text-sm">{p.total.toLocaleString()}</span>
                  </label>
                ))}
                {purchases.length === 0 && <p className="text-xs text-muted-foreground italic">No hay compras pendientes de facturar.</p>}
              </div>
            </div>

            {/* Costo de Servicios */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Mano de Obra (Servicios) *</Label>
              <div className="space-y-4">
                <div className="relative">
                  <Input 
                    type="number"
                    placeholder="Costo total de servicios"
                    className="h-12 px-4 font-black text-lg rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                    value={formData.serviceCost}
                    onChange={e => setFormData(prev => ({ ...prev, serviceCost: e.target.value }))}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder?.services?.map((s: any) => (
                    <Badge key={s.ID_Servicio} variant="secondary" className="bg-slate-100 dark:bg-slate-800 border-none font-bold">
                      {s.Nombre}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Observaciones</Label>
            <Textarea 
              placeholder="Detalles adicionales sobre la facturación..."
              className="min-h-[100px] rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 resize-none"
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Resumen Total */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resumen de Totales</p>
              <div className="flex gap-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                <span>Repuestos: {partsTotal.toLocaleString()}</span>
                <span>Servicios: {parseFloat(formData.serviceCost || '0').toLocaleString()}</span>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-end">
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-[0.2em] mb-1">Total Facturar</span>
              <span className="text-4xl font-black text-slate-900 dark:text-white">{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-11 px-8 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSaving || !formData.serviceOrderId || !formData.serviceCost}
            className="h-12 px-10 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Registrar Venta
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
