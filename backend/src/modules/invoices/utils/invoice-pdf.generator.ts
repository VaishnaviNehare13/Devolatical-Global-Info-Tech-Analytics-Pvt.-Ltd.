import PDFDocument from 'pdfkit';

/**
 * Server-side PDF Generator for Enterprise Invoices.
 * Formats database invoice records into a professional PDF Buffer.
 */
export async function generateInvoicePdf(invoice: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // 1. Enterprise Header
    doc
      .fillColor('#1e293b')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('DEVOLATICAL GLOBAL INFO-TECH & ANALYTICS', 50, 45)
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Enterprise Digital & Analytics Solutions', 50, 65)
      .text('Email: billing@devolatical.com | Web: https://devolatical.com', 50, 78);

    doc
      .fillColor('#0f172a')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('INVOICE', 430, 45, { align: 'right', width: 115 })
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#475569')
      .text(`# ${invoice.invoiceNumber}`, 430, 72, { align: 'right', width: 115 });

    doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#cbd5e1').stroke();

    // 2. Bill To & Invoice Meta
    let y = 115;
    doc
      .fontSize(10)
      .fillColor('#334155')
      .font('Helvetica-Bold')
      .text('BILLED TO:', 50, y)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(invoice.client?.name || 'Client Organization', 50, y + 15)
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#64748b')
      .text(`Client Code: ${invoice.client?.code || 'N/A'}`, 50, y + 30);

    if (invoice.client?.email) {
      doc.text(`Email: ${invoice.client.email}`, 50, y + 42);
    }
    if (invoice.client?.addressLine1) {
      const cityCountry = [invoice.client.city, invoice.client.country].filter(Boolean).join(', ');
      doc.text(`${invoice.client.addressLine1}${cityCountry ? ' - ' + cityCountry : ''}`, 50, y + 54);
    }

    doc
      .fontSize(10)
      .fillColor('#334155')
      .font('Helvetica-Bold')
      .text('INVOICE DETAILS:', 350, y)
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text(`Issue Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 350, y + 15)
      .text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Upon Receipt'}`, 350, y + 30)
      .text(`Status: ${invoice.status}`, 350, y + 45)
      .text(`Currency: ${invoice.currency}`, 350, y + 60);

    y += 85;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#cbd5e1').stroke();
    y += 15;

    // 3. Project & Milestone Billing Context
    if (invoice.project || invoice.milestone) {
      doc
        .fontSize(9)
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text('PROJECT & MILESTONE BILLING REFERENCE:', 50, y);
      y += 15;
      if (invoice.project) {
        doc.font('Helvetica').fontSize(9).fillColor('#475569').text(`Project: ${invoice.project.name} (${invoice.project.code})`, 50, y);
        y += 14;
      }
      if (invoice.milestone) {
        doc.font('Helvetica').fontSize(9).fillColor('#475569').text(`Milestone: ${invoice.milestone.title} [Status: ${invoice.milestone.status}]`, 50, y);
        y += 14;
      }
      y += 10;
    }

    // 4. Line Items Table Header
    doc
      .fillColor('#f8fafc')
      .rect(50, y, 495, 22)
      .fill();
    doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(9);
    doc.text('DESCRIPTION', 60, y + 6);
    doc.text('AMOUNT', 430, y + 6, { align: 'right', width: 105 });

    y += 28;

    // Line Item Content
    doc.font('Helvetica').fontSize(9).fillColor('#334155');
    const itemDescription = invoice.description || (invoice.milestone ? `Billing for Milestone: ${invoice.milestone.title}` : `Professional Services - Invoice ${invoice.invoiceNumber}`);
    doc.text(itemDescription, 60, y, { width: 350 });
    const amountFormatted = `${invoice.currency || 'INR'} ${Number(invoice.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.text(amountFormatted, 430, y, { align: 'right', width: 105 });

    y += 35;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#e2e8f0').stroke();
    y += 15;

    // 5. Totals
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a');
    doc.text('TOTAL AMOUNT:', 320, y);
    doc.text(amountFormatted, 430, y, { align: 'right', width: 105 });

    // 6. Footer
    y = 720;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#cbd5e1').stroke();
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text('Thank you for your business. Devolatical Global Info-Tech & Analytics Pvt. Ltd.', 50, y + 12, { align: 'center' })
      .text('For billing inquiries, please contact billing@devolatical.com', 50, y + 24, { align: 'center' });

    doc.end();
  });
}
