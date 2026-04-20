import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  type: 'purchase' | 'sale' | 'supplier' | 'client' | 'appointment' | 'service-order' | 'general';
  onGenerate: () => void;
}

export function PDFPreviewDialog({
  open,
  onOpenChange,
  data,
  type,
  onGenerate
}: PDFPreviewDialogProps) {

  const handleGenerate = async () => {
    // Apuntamos al primer hijo de 'pdf-content-wrapper' para capturar el contenido real sin el scroll
    const wrapper = document.getElementById('pdf-content-wrapper');
    const element = wrapper?.firstElementChild as HTMLElement;
    if (!element) return;

    // Generar nombre descriptivo según el tipo
    let customFilename = `RafaMotos_${type}_${Date.now()}.pdf`;
    if (type === 'purchase') {
      customFilename = `Compras_RafaMotos_${data?.invoiceNumber || 'SinNumero'}.pdf`;
    } else if (type === 'service-order') {
      customFilename = `Reparaciones_RafaMotos_${data?.orderNumber || 'SinNumero'}.pdf`;
    }

    const opt = {
      margin: 10,
      filename: customFilename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        height: element.offsetHeight, // Forzamos la altura total del contenido
        scrollY: -window.scrollY // Ajuste para evitar desplazamientos
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      onGenerate();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'purchase':
        return renderPurchasePDF();
      case 'sale':
        return renderSalePDF();
      case 'supplier':
        return renderSupplierPDF();
      case 'client':
        return renderClientPDF();
      case 'appointment':
        return renderAppointmentPDF();
      case 'service-order':
        return renderServiceOrderPDF();
      default:
        return renderGeneralPDF();
    }
  };

  const renderPurchasePDF = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-6">
        <h1 className="text-2xl font-bold text-blue-600">RAFA MOTOS</h1>
        <p className="text-sm text-muted-foreground">Taller de Motocicletas Especializado</p>
        <p className="text-sm text-muted-foreground">Carrera 54 #96a-17, Barrio Aranjuez, Medellín, Antioquia</p>
        <p className="text-sm text-muted-foreground">Tel: +57 300 123 4567 | Email: info@rafamotos.com</p>
      </div>

      {/* Document Info */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">ORDEN DE COMPRA</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Número:</span> {data?.invoiceNumber}</p>
            <p><span className="font-medium">Fecha:</span> {data?.date ? format(new Date(data.date), 'PPP', { locale: es }) : ''}</p>
            <div className="mt-2 text-sm">
              <span className="font-medium mr-1">Estado de la Compra:</span>
              <span className="uppercase">{data?.status}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">PROVEEDOR</h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{data?.supplier}</p>
            <p>Contacto: {data?.supplierContact}</p>
            <p>Teléfono: {data?.supplierPhone}</p>
            <p>Email: {data?.supplierEmail}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Items */}
      <div>
        <h3 className="font-semibold mb-3">PRODUCTOS</h3>
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Producto</TableHead>
              <TableHead className="w-[20%]">Categoría</TableHead>
              <TableHead className="w-[15%] text-center">Cantidad</TableHead>
              <TableHead className="w-[15%] text-right">Precio Unit.</TableHead>
              <TableHead className="w-[15%] text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items?.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{item.productName || item.product}</TableCell>
                <TableCell>{item.categoryName || item.category}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right font-medium text-slate-900">${(Number(item.unitPrice || item.unitCost))?.toLocaleString('es-CO')}</TableCell>
                <TableCell className="text-right font-black text-blue-600">${Number(item.total)?.toLocaleString('es-CO')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Separator />

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${Number(data?.subtotal)?.toLocaleString('es-CO')}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>TOTAL:</span>
            <span className="text-blue-600">${Number(data?.total)?.toLocaleString('es-CO')}</span>
          </div>
        </div>
      </div>

      {data?.notes && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">OBSERVACIONES</h3>
            <p className="text-sm text-muted-foreground">{data.notes}</p>
          </div>
        </>
      )}

      <Separator />
      <div className="text-center text-xs text-muted-foreground">
        <p>Documento generado el {format(new Date(), 'PPP pp', { locale: es })}</p>
        <p>Rafa Motos - Sistema de Gestión Administrativa</p>
      </div>
    </div>
  );

  const renderSalePDF = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-blue-600">RAFA MOTOS</h1>
        <p className="text-sm text-muted-foreground">Taller de Motocicletas</p>
        <p className="text-sm text-muted-foreground">Carrera 54 #96a-17, Barrio Aranjuez, Medellín, Antioquia</p>
        <p className="text-sm text-muted-foreground">Tel: +57 300 123 4567 | Email: info@rafamotos.com</p>
        <p className="text-sm text-muted-foreground">NIT: 900.123.456-7</p>
      </div>

      {/* Document Info */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3 text-lg">FACTURA DE VENTA</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Número:</span> {data?.invoiceNumber}</p>
            <p><span className="font-medium">Fecha:</span> {data?.date ? format(new Date(data.date), 'PPP', { locale: es }) : ''}</p>
            {data?.serviceOrderNumber && (
              <p><span className="font-medium">Reparación:</span> {data.serviceOrderNumber}</p>
            )}
            <div className="mt-2 text-sm">
              <span className="font-medium mr-1">Estado de la Venta:</span> 
              <span className="uppercase">{data?.anulada ? 'ANULADA' : 'COMPLETADA'}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-lg">DATOS DEL CLIENTE</h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{data?.clientName}</p>
            <p>Documento: {data?.clientDocument || 'CC 12345678'}</p>
            <p>Teléfono: {data?.clientPhone}</p>
            <p>Email: {data?.clientEmail || 'cliente@email.com'}</p>
            <p>Dirección: {data?.clientAddress || 'Dirección del cliente'}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Service Order Info */}
      {data?.serviceOrderNumber && (
        <>
          <div>
            <h3 className="font-semibold mb-3 text-lg">INFORMACIÓN DE LA REPARACIÓN</h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p><span className="font-medium">Número de Reparación:</span> {data.serviceOrderNumber}</p>
              </div>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Motorcycle Info */}
      <div>
        <h3 className="font-semibold mb-3 text-lg">DATOS DE LA MOTOCICLETA</h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p><span className="font-medium">Marca:</span> {data?.motorcycleBrand}</p>
            <p><span className="font-medium">Modelo:</span> {data?.motorcycleModel}</p>
          </div>
          <div>
            <p><span className="font-medium">Placa:</span> {data?.motorcyclePlate}</p>
            <p><span className="font-medium">Año:</span> {data?.motorcycleYear}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Purchase Details */}
      {data?.purchaseInvoices && data?.purchaseInvoices.length > 0 && (
        <>
          <div>
            <h3 className="font-semibold mb-3 text-lg">REPUESTOS UTILIZADOS</h3>
            <p className="text-sm text-muted-foreground mb-3">Provenientes de las siguientes compras: {data.purchaseInvoices.join(', ')}</p>

            {data?.parts && data?.parts.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Costo Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.parts.map((part: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{part.product}</TableCell>
                      <TableCell className="text-right">{part.quantity}</TableCell>
                      <TableCell className="text-right">${Number(part.unitCost)?.toLocaleString('es-CO')}</TableCell>
                      <TableCell className="text-right">${Number(part.quantity * (part.unitCost || 0))?.toLocaleString('es-CO')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Services */}
      {data?.serviceTypes && data?.serviceTypes.length > 0 && (
        <>
          <div>
            <h3 className="font-semibold mb-3 text-lg">SERVICIOS REALIZADOS</h3>
            <div className="space-y-2">
              {data.serviceTypes.map((service: string, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm">{service}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 font-medium">
                <span>Total:</span>
                <span>${Number(data?.serviceCost)?.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Totals */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">RESUMEN DE COSTOS</h3>
        <div className="flex justify-end">
          <div className="w-96 space-y-2">
            {data?.parts && data?.parts.length > 0 && (
              <div className="flex justify-between">
                <span>Subtotal Repuestos:</span>
                <span>${Number(data.parts.reduce((sum: number, part: any) => sum + (part.total || 0), 0)).toLocaleString('es-CO')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Total Servicios:</span>
              <span>${Number(data?.serviceCost).toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${Number(data?.subtotal).toLocaleString('es-CO')}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-xl">
              <span>TOTAL A PAGAR:</span>
              <span className="text-blue-600">${Number(data?.total).toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>
      </div>



      {data?.notes && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2 text-lg">OBSERVACIONES</h3>
            <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">{data.notes}</p>
          </div>
        </>
      )}

      <Separator />

      <div className="text-center text-xs text-muted-foreground">
        <p>Documento generado el {format(new Date(), 'PPP pp', { locale: es })}</p>
        <p>Rafa Motos - Sistema de Gestión Administrativa v1.0</p>
      </div>
    </div>
  );

  const renderSupplierPDF = () => (
    <div className="space-y-6">
      <div className="text-center border-b pb-6">
        <h1 className="text-2xl font-bold text-blue-600">RAFA MOTOS</h1>
        <p className="text-sm text-muted-foreground">Reporte de Proveedores</p>
      </div>
      <div className="text-center text-xs text-muted-foreground">
        <p>Reporte generado el {format(new Date(), 'PPP pp', { locale: es })}</p>
      </div>
    </div>
  );

  const renderClientPDF = () => (
    <div className="space-y-6">
      <div className="text-center border-b pb-6">
        <h1 className="text-2xl font-bold text-blue-600">RAFA MOTOS</h1>
        <p className="text-sm text-muted-foreground">Reporte de Clientes</p>
      </div>
      <div className="text-center text-xs text-muted-foreground">
        <p>Reporte generado el {format(new Date(), 'PPP pp', { locale: es })}</p>
      </div>
    </div>
  );

  const renderAppointmentPDF = () => (
    <div className="space-y-6">
      <div className="text-center border-b pb-6">
        <h1 className="text-2xl font-bold text-blue-600">RAFA MOTOS</h1>
        <p className="text-sm text-muted-foreground">Reporte de Agendamientos</p>
      </div>
      <div className="text-center text-xs text-muted-foreground">
        <p>Reporte generado el {format(new Date(), 'PPP pp', { locale: es })}</p>
      </div>
    </div>
  );

  const renderServiceOrderPDF = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-blue-600">RAFA MOTOS</h1>
        <p className="text-sm text-muted-foreground">Taller de Motocicletas Especializado</p>
        <p className="text-sm text-muted-foreground">Carrera 54 #96a-17, Barrio Aranjuez, Medellín, Antioquia</p>
        <p className="text-sm text-muted-foreground">Tel: +57 300 123 4567 | Email: info@rafamotos.com</p>
        <p className="text-sm text-muted-foreground">NIT: 900.123.456-7</p>
      </div>

      {/* Document Info */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3 text-lg">REPARACIÓN</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Número:</span> {data?.orderNumber}</p>
            <p><span className="font-medium">Fecha de Recepción:</span> {data?.date ? format(new Date(data.date), 'PPP', { locale: es }) : ''}</p>
            <div className="mt-2 text-sm">
              <span className="font-medium mr-1">Estado de la Reparación:</span>
              <span className="uppercase">{data?.estadoBase || (data?.anulada ? 'Anulada' : data?.associatedSaleId ? 'Reparación finalizada' : 'Pendiente de Venta')}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-lg">DATOS DEL CLIENTE</h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{data?.clientName}</p>
            <p>Documento: {data?.clientDocument}</p>
            <p>Teléfono: {data?.clientPhone}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Motorcycle Info */}
      <div>
        <h3 className="font-semibold mb-3 text-lg">DATOS DE LA MOTOCICLETA</h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p><span className="font-medium">Marca:</span> {data?.motorcycleBrand}</p>
            <p><span className="font-medium">Modelo:</span> {data?.motorcycleModel}</p>
          </div>
          <div>
            <p><span className="font-medium">Placa:</span> {data?.motorcyclePlate}</p>
            <p><span className="font-medium">Año:</span> {data?.motorcycleYear}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Service Description */}
      <div>
        <h3 className="font-semibold mb-3 text-lg">DESCRIPCIÓN DEL SERVICIO</h3>
        <div className="bg-gray-50 p-4 rounded-lg text-sm">
          <p>{data?.description}</p>
        </div>
      </div>

      {/* Observations */}
      {data?.observations && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-3 text-lg">OBSERVACIONES</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <p>{data?.observations}</p>
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Progress */}
      <div>
        <h3 className="font-semibold mb-3 text-lg">AVANCES DEL TRABAJO</h3>
        {data?.progress && data?.progress.length > 0 ? (
          <div className="space-y-3">
            {data.progress.map((progress: any, index: number) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-2">{progress.description}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Técnico:</span> {progress.technician}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No se han registrado avances aún.</p>
        )}
      </div>

      <Separator />

      <div className="text-center text-xs text-muted-foreground">
        <p>Documento generado el {format(new Date(), 'PPP pp', { locale: es })}</p>
        <p>Rafa Motos - Sistema de Gestión Administrativa v1.0</p>
        {data?.anulado && (
          <p className="text-red-600 font-semibold mt-2">*** DOCUMENTO ANULADO ***</p>
        )}
      </div>
    </div>
  );

  const renderGeneralPDF = () => (
    <div className="space-y-6">
      <div className="text-center border-b pb-6">
        <h1 className="text-2xl font-bold text-blue-600">RAFA MOTOS</h1>
        <p className="text-sm text-muted-foreground">Reporte General</p>
      </div>
      <div className="text-center text-xs text-muted-foreground">
        <p>Reporte generado el {format(new Date(), 'PPP pp', { locale: es })}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[98vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Vista Previa del PDF
          </DialogTitle>
        </DialogHeader>

        <div id="pdf-content-wrapper" className="border border-gray-200 rounded-lg p-8 bg-white text-slate-950 shadow-sm overflow-y-auto max-h-[calc(98vh-8rem)] light p-4 sm:p-8 shrink-0">
          <div className="p-4" style={{ backgroundColor: 'white' }}>
            {renderContent()}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Generar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}