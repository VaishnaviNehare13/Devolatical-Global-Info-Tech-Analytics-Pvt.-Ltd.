import PDFDocument from 'pdfkit';

export interface ReportPdfData {
  reportTitle: string;
  subtitle?: string;
  generatedAt: Date;
  filtersSummary?: string;
  kpis: { label: string; value: string | number }[];
  tableHeaders?: string[];
  tableRows?: (string | number)[][];
}

/**
 * Server-side Executive Summary PDF Report Generator.
 */
export async function generateReportPdf(data: ReportPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // 1. Header & Title
    doc
      .fillColor('#0f172a')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('DEVOLATICAL GLOBAL INFO-TECH & ANALYTICS', 50, 45)
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Executive Analytics & Intelligence Report', 50, 65)
      .text(`Generated: ${data.generatedAt.toLocaleString()}`, 50, 78);

    doc
      .fillColor('#0284c7')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(data.reportTitle.toUpperCase(), 350, 45, { align: 'right', width: 195 });

    doc.moveTo(50, 95).lineTo(545, 95).strokeColor('#cbd5e1').stroke();

    let y = 110;

    if (data.subtitle) {
      doc.fontSize(10).font('Helvetica-Oblique').fillColor('#475569').text(data.subtitle, 50, y);
      y += 20;
    }

    if (data.filtersSummary) {
      doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`Applied Filters: ${data.filtersSummary}`, 50, y);
      y += 20;
    }

    // 2. KPI Summary Grid Box
    if (data.kpis && data.kpis.length > 0) {
      doc.fillColor('#f8fafc').rect(50, y, 495, 60).fill();
      doc.rect(50, y, 495, 60).strokeColor('#cbd5e1').stroke();

      const kpiWidth = 495 / Math.min(data.kpis.length, 4);
      data.kpis.slice(0, 4).forEach((kpi, idx) => {
        const xPos = 50 + idx * kpiWidth;
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text(kpi.label.toUpperCase(), xPos + 10, y + 12, { width: kpiWidth - 20 });

        doc
          .fillColor('#0f172a')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(String(kpi.value), xPos + 10, y + 30, { width: kpiWidth - 20 });
      });

      y += 75;
    }

    // 3. Tabular Data
    if (data.tableHeaders && data.tableRows && data.tableRows.length > 0) {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('DETAILED REPORT BREAKDOWN', 50, y);
      y += 18;

      // Table Header Row
      const colWidth = 495 / data.tableHeaders.length;
      doc.fillColor('#0f172a').rect(50, y, 495, 20).fill();
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);

      data.tableHeaders.forEach((header, idx) => {
        doc.text(header.toUpperCase(), 55 + idx * colWidth, y + 6, { width: colWidth - 10 });
      });

      y += 22;

      // Table Data Rows
      doc.font('Helvetica').fontSize(8).fillColor('#334155');
      data.tableRows.slice(0, 20).forEach((row, rowIndex) => {
        if (y > 720) return; // Prevent text overflow past single page A4 margin

        if (rowIndex % 2 === 1) {
          doc.fillColor('#f1f5f9').rect(50, y - 2, 495, 18).fill();
        }

        doc.fillColor('#334155');
        row.forEach((cell, colIndex) => {
          doc.text(String(cell), 55 + colIndex * colWidth, y + 3, { width: colWidth - 10 });
        });

        y += 18;
      });
    }

    // 4. Footer
    doc.moveTo(50, 740).lineTo(545, 740).strokeColor('#cbd5e1').stroke();
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text('Devolatical Global Info-Tech & Analytics Pvt. Ltd. • Enterprise Analytics Engine', 50, 750, { align: 'center' });

    doc.end();
  });
}
