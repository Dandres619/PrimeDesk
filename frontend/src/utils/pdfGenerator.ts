import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDFFromElement(element: HTMLElement, filename: string = 'documento.pdf') {
  try {
    // Configurar opciones para html2canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Mayor resolución
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Calcular dimensiones para el PDF
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    // Crear el PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Agregar la primera página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Agregar páginas adicionales si es necesario
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Descargar el PDF
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return false;
  }
}

export function generateSimplePDF(data: any, type: string, filename: string = 'documento.pdf') {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = margin;

  // Helper para agregar texto
  const addText = (text: string, size: number = 10, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') => {
    pdf.setFontSize(size);
    pdf.setFont('helvetica', style);
    
    if (align === 'center') {
      pdf.text(text, pageWidth / 2, yPosition, { align: 'center' });
    } else if (align === 'right') {
      pdf.text(text, pageWidth - margin, yPosition, { align: 'right' });
    } else {
      pdf.text(text, margin, yPosition);
    }
    
    yPosition += size * 0.5;
  };

  const checkNewPage = (requiredSpace: number = 10) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Encabezado común
  pdf.setFillColor(59, 130, 246); // blue-600
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  yPosition = 15;
  addText('RAFA MOTOS', 20, 'bold', 'center');
  yPosition = 25;
  addText('Taller de Motocicletas Especializado', 10, 'normal', 'center');
  yPosition = 32;
  addText('Calle Principal #123-45, Bogotá, Colombia | Tel: +57 300 123 4567', 8, 'normal', 'center');
  
  pdf.setTextColor(0, 0, 0);
  yPosition = 50;

  // Agregar línea separadora
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Contenido específico por tipo
  switch (type) {
    case 'clients':
      generateClientsList(pdf, data, margin, pageWidth, pageHeight, yPosition, addText, checkNewPage);
      break;
    case 'purchase':
      generatePurchasePDF(pdf, data, margin, pageWidth, pageHeight, yPosition, addText, checkNewPage);
      break;
    case 'sale':
      generateSalePDF(pdf, data, margin, pageWidth, pageHeight, yPosition, addText, checkNewPage);
      break;
    case 'service-order':
      generateServiceOrderPDF(pdf, data, margin, pageWidth, pageHeight, yPosition, addText, checkNewPage);
      break;
    default:
      addText('Documento generado', 12, 'bold');
      break;
  }

  // Footer
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Documento generado el ${dateStr}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  pdf.text('Rafa Motos - Sistema de Gestión Administrativa', pageWidth / 2, pageHeight - 6, { align: 'center' });

  // Descargar
  pdf.save(filename);
}

function generateClientsList(pdf: any, clients: any[], margin: number, pageWidth: number, pageHeight: number, startY: number, addText: Function, checkNewPage: Function) {
  let yPosition = startY;
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LISTADO DE CLIENTES', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Tabla de clientes
  clients.forEach((client, index) => {
    checkNewPage(40);
    
    // Fondo alternado
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin - 2, yPosition - 5, pageWidth - 2 * margin + 4, 35, 'F');
    }
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${client.nombre} ${client.apellido}`, margin, yPosition);
    
    yPosition += 6;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Documento: ${client.documentType} ${client.document}`, margin, yPosition);
    
    yPosition += 5;
    pdf.text(`Email: ${client.email} | Teléfono: ${client.phone}`, margin, yPosition);
    
    yPosition += 5;
    pdf.text(`Dirección: ${client.direccion}, ${client.barrio}`, margin, yPosition);
    
    yPosition += 5;
    pdf.text(`Estado: ${client.status} | Motos: ${client.motorcycles}`, margin, yPosition);
    
    yPosition += 12;
    
    // Línea separadora
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
  });
}

function generatePurchasePDF(pdf: any, purchase: any, margin: number, pageWidth: number, pageHeight: number, startY: number, addText: Function, checkNewPage: Function) {
  let yPosition = startY;
  
  // Título
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ORDEN DE COMPRA', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Información de la compra
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Número de Compra:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(purchase.invoiceNumber, margin + 50, yPosition);
  yPosition += 7;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Fecha:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(purchase.date, margin + 50, yPosition);
  yPosition += 7;

  if (purchase.status === 'Anulada') {
    pdf.setTextColor(220, 38, 38);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ESTADO: ANULADA', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 7;
  }

  yPosition += 5;

  // Información del proveedor
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PROVEEDOR', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(purchase.supplier, margin, yPosition);
  yPosition += 6;
  pdf.text(`Contacto: ${purchase.supplierContact}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Teléfono: ${purchase.supplierPhone}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Email: ${purchase.supplierEmail}`, margin, yPosition);
  yPosition += 15;

  // Productos
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PRODUCTOS', margin, yPosition);
  yPosition += 10;

  // Encabezados de tabla
  pdf.setFillColor(59, 130, 246);
  pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.text('Producto', margin + 2, yPosition);
  pdf.text('Cantidad', pageWidth - 100, yPosition);
  pdf.text('Precio Unit.', pageWidth - 70, yPosition);
  pdf.text('Total', pageWidth - 30, yPosition, { align: 'right' });
  
  pdf.setTextColor(0, 0, 0);
  yPosition += 10;

  // Items
  purchase.items.forEach((item: any, index: number) => {
    checkNewPage(10);
    
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 8, 'F');
    }
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(item.productName, margin + 2, yPosition);
    pdf.text(item.quantity.toString(), pageWidth - 100, yPosition);
    pdf.text(`$${item.unitPrice.toLocaleString()}`, pageWidth - 70, yPosition);
    pdf.text(`$${item.total.toLocaleString()}`, pageWidth - 30, yPosition, { align: 'right' });
    
    yPosition += 8;
  });

  yPosition += 10;

  // Totales
  pdf.setFont('helvetica', 'normal');
  pdf.text('Subtotal:', pageWidth - 70, yPosition);
  pdf.text(`$${purchase.subtotal.toLocaleString()}`, pageWidth - 30, yPosition, { align: 'right' });
  yPosition += 6;

  pdf.text('IVA (19%):', pageWidth - 70, yPosition);
  pdf.text(`$${purchase.tax.toLocaleString()}`, pageWidth - 30, yPosition, { align: 'right' });
  yPosition += 6;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('TOTAL:', pageWidth - 70, yPosition);
  pdf.text(`$${purchase.total.toLocaleString()}`, pageWidth - 30, yPosition, { align: 'right' });
  yPosition += 10;

  // Observaciones
  if (purchase.notes) {
    yPosition += 5;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSERVACIONES:', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const notesLines = pdf.splitTextToSize(purchase.notes, pageWidth - 2 * margin);
    pdf.text(notesLines, margin, yPosition);
  }
}

function generateSalePDF(pdf: any, sale: any, margin: number, pageWidth: number, pageHeight: number, startY: number, addText: Function, checkNewPage: Function) {
  let yPosition = startY;
  
  // Título
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FACTURA DE VENTA', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Información de la venta
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Número de Factura:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(sale.invoiceNumber, margin + 50, yPosition);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Fecha:', pageWidth - 80, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(sale.date, pageWidth - 40, yPosition);
  yPosition += 7;

  if (sale.serviceOrderNumber) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pedido de Servicio:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(sale.serviceOrderNumber, margin + 50, yPosition);
    yPosition += 7;
  }

  yPosition += 5;

  // Cliente
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DATOS DEL CLIENTE', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(sale.clientName, margin, yPosition);
  yPosition += 6;
  pdf.text(`Documento: ${sale.clientDocument}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Teléfono: ${sale.clientPhone}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Email: ${sale.clientEmail}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Dirección: ${sale.clientAddress}`, margin, yPosition);
  yPosition += 15;

  // Motocicleta
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DATOS DE LA MOTOCICLETA', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${sale.motorcycleBrand} ${sale.motorcycleModel} (${sale.motorcycleYear})`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Placa: ${sale.motorcyclePlate}`, margin, yPosition);
  yPosition += 15;

  // Servicios
  if (sale.serviceTypes && sale.serviceTypes.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SERVICIOS REALIZADOS', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    sale.serviceTypes.forEach((service: string) => {
      pdf.text(`• ${service}`, margin + 5, yPosition);
      yPosition += 6;
    });
    
    yPosition += 3;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Servicios:', pageWidth - 80, yPosition);
    pdf.text(`$${sale.serviceCost.toLocaleString()}`, pageWidth - 30, yPosition, { align: 'right' });
    yPosition += 15;
  }

  // Repuestos
  if (sale.parts && sale.parts.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('REPUESTOS UTILIZADOS', margin, yPosition);
    yPosition += 10;

    // Tabla
    pdf.setFillColor(59, 130, 246);
    pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text('Producto', margin + 2, yPosition);
    pdf.text('Cant.', pageWidth - 80, yPosition);
    pdf.text('P. Unit.', pageWidth - 60, yPosition);
    pdf.text('Total', pageWidth - 30, yPosition, { align: 'right' });
    
    pdf.setTextColor(0, 0, 0);
    yPosition += 10;

    sale.parts.forEach((part: any, index: number) => {
      checkNewPage(10);
      
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 8, 'F');
      }
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(part.product, margin + 2, yPosition);
      pdf.text(part.quantity.toString(), pageWidth - 80, yPosition);
      pdf.text(`$${part.unitCost.toLocaleString()}`, pageWidth - 60, yPosition);
      pdf.text(`$${part.total.toLocaleString()}`, pageWidth - 30, yPosition, { align: 'right' });
      
      yPosition += 8;
    });

    yPosition += 10;
  }

  // Totales
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('Subtotal:', pageWidth - 70, yPosition);
  pdf.text(`$${sale.subtotal.toLocaleString()}`, pageWidth - 30, yPosition, { align: 'right' });
  yPosition += 6;

  pdf.text('IVA (19%):', pageWidth - 70, yPosition);
  pdf.text(`$${sale.tax.toLocaleString()}`, pageWidth - 30, yPosition, { align: 'right' });
  yPosition += 6;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(59, 130, 246);
  pdf.text('TOTAL A PAGAR:', pageWidth - 90, yPosition);
  pdf.text(`$${sale.total.toLocaleString()}`, pageWidth - 30, yPosition, { align: 'right' });
  pdf.setTextColor(0, 0, 0);
  yPosition += 10;

  // Observaciones
  if (sale.notes) {
    yPosition += 5;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSERVACIONES:', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const notesLines = pdf.splitTextToSize(sale.notes, pageWidth - 2 * margin);
    pdf.text(notesLines, margin, yPosition);
  }
}

function generateServiceOrderPDF(pdf: any, order: any, margin: number, pageWidth: number, pageHeight: number, startY: number, addText: Function, checkNewPage: Function) {
  let yPosition = startY;
  
  // Título
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PEDIDO DE SERVICIO', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Información del pedido
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Número de Pedido:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(order.orderNumber, margin + 50, yPosition);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Fecha:', pageWidth - 80, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(order.date, pageWidth - 40, yPosition);
  yPosition += 10;

  if (order.anulado) {
    pdf.setTextColor(220, 38, 38);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('*** PEDIDO ANULADO ***', pageWidth / 2, yPosition, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    yPosition += 10;
  }

  yPosition += 5;

  // Cliente
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DATOS DEL CLIENTE', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(order.clientName, margin, yPosition);
  yPosition += 6;
  pdf.text(`Documento: ${order.clientDocument}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Teléfono: ${order.clientPhone}`, margin, yPosition);
  yPosition += 15;

  // Motocicleta
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DATOS DE LA MOTOCICLETA', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${order.motorcycleBrand} ${order.motorcycleModel} (${order.motorcycleYear})`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Placa: ${order.motorcyclePlate}`, margin, yPosition);
  yPosition += 15;

  // Descripción
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DESCRIPCIÓN DEL SERVICIO', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const descLines = pdf.splitTextToSize(order.description, pageWidth - 2 * margin);
  pdf.text(descLines, margin, yPosition);
  yPosition += descLines.length * 6 + 10;

  // Observaciones
  if (order.observations) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSERVACIONES', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const obsLines = pdf.splitTextToSize(order.observations, pageWidth - 2 * margin);
    pdf.text(obsLines, margin, yPosition);
    yPosition += obsLines.length * 6 + 10;
  }

  // Avances
  if (order.progress && order.progress.length > 0) {
    checkNewPage(30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AVANCES DEL TRABAJO', margin, yPosition);
    yPosition += 10;

    order.progress.forEach((progress: any, index: number) => {
      checkNewPage(20);
      
      pdf.setFillColor(59, 130, 246);
      pdf.circle(margin + 3, yPosition - 1, 3, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${progress.description}`, margin + 10, yPosition);
      yPosition += 6;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`Técnico: ${progress.technician}`, margin + 10, yPosition);
      yPosition += 10;
    });
  }
}
