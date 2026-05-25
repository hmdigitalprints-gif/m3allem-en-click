import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (booking: any) => {
  const doc = new jsPDF();
  
  // Custom styling and layout
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  // Company Logo / Title
  doc.setFontSize(24);
  doc.setTextColor(33, 33, 33);
  doc.text("INVOICE", 14, 22);
  
  // Company Details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("M3ALLEMI Platform", 14, 30);
  doc.text("123 Service Street, Casablanca, Morocco", 14, 35);
  doc.text("Email: support@m3allemi.com", 14, 40);

  // Invoice Details
  const invoiceId = `INV-${booking.id.split('-')[0].toUpperCase()}`;
  const date = new Date().toLocaleDateString();
  
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`Invoice Number: ${invoiceId}`, pageWidth - 14, 22, { align: 'right' });
  doc.text(`Date: ${date}`, pageWidth - 14, 27, { align: 'right' });
  doc.text(`Status: ${booking.status.toUpperCase()}`, pageWidth - 14, 32, { align: 'right' });

  // Divider
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 45, pageWidth - 14, 45);

  // Customer Details
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("Bill To:", 14, 55);
  
  const customerName = booking.client_name || booking.customer || (booking.client && booking.client.name) || "Customer";
  const locationName = booking.city || booking.shippingAddress || "Not specified";
  const providerName = booking.artisan_name || "M3ALLEMI Platfom Seller";
  const serviceTitle = booking.service_title || booking.product || (booking.items && booking.items[0] && booking.items[0].product && booking.items[0].product.name) || 'General Service / Product';
  const price = booking.price || booking.amount || booking.totalPrice || 0;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Customer Name: ${customerName}`, 14, 62);
  doc.text(`Location: ${locationName}`, 14, 67);

  // Artisan Details
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("Service Provider:", pageWidth / 2, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Provider Name: ${providerName}`, pageWidth / 2, 62);
  
  const bookingDate = booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleDateString() : (booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : date);
  const bookingTime = booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";
  
  // Items Table
  autoTable(doc, {
    startY: 85,
    head: [['Description', 'Date', 'Time', 'Amount']],
    body: [
      [
        serviceTitle,
        bookingDate,
        bookingTime,
        `${price} MAD`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [40, 40, 40], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30, halign: 'right' },
    }
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("Total:", pageWidth - 50, finalY);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`${price} MAD`, pageWidth - 14, finalY, { align: 'right' });
  
  // Footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for using M3ALLEMI!", pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });

  // Save the PDF
  doc.save(`invoice_${invoiceId}.pdf`);
};
