import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';

export interface DocumentFileMeta {
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string | null;
  description?: string | null;
  createdAt?: Date | string | null;
}

/**
 * Generates a standard professional PDF buffer for documents.
 */
export async function generateDocumentPdfBuffer(doc: {
  title: string;
  fileName: string;
  mimeType?: string | null;
  description?: string | null;
  createdAt?: Date | string | null;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    pdf.on('data', (chunk) => buffers.push(chunk));
    pdf.on('end', () => resolve(Buffer.concat(buffers)));
    pdf.on('error', (err) => reject(err));

    // 1. Enterprise Header
    pdf
      .fillColor('#1e293b')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('DEVOLATICAL GLOBAL INFO-TECH & ANALYTICS', 50, 45)
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Enterprise Digital & Analytics Solutions | Document Vault', 50, 65)
      .text('Email: info@devolatical.com | Web: https://devolatical.com', 50, 78);

    pdf.moveTo(50, 100).lineTo(545, 100).strokeColor('#cbd5e1').stroke();

    // 2. Document Title & Metadata Box
    pdf
      .fillColor('#0f172a')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(doc.title, 50, 130);

    const formattedDate = doc.createdAt
      ? new Date(doc.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

    pdf
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#475569')
      .text(`File Name: ${doc.fileName}`, 50, 165)
      .text(`MIME Type: ${doc.mimeType || 'application/pdf'}`, 50, 180)
      .text(`Registered Date: ${formattedDate}`, 50, 195);

    pdf.moveTo(50, 220).lineTo(545, 220).strokeColor('#e2e8f0').stroke();

    // 3. Document Body / Description
    pdf
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#1e293b')
      .text('Document Overview & Governance:', 50, 245);

    pdf
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#334155')
      .text(
        doc.description ||
          'This official enterprise document is secured under Devolatical Global Info-Tech compliance and data governance policies.',
        50,
        270,
        { width: 495, lineGap: 4 }
      );

    // 4. Confidentiality Footer
    pdf
      .fontSize(9)
      .fillColor('#94a3b8')
      .text(
        'CONFIDENTIAL: This document contains proprietary information and is intended solely for authorized personnel.',
        50,
        720,
        { width: 495, align: 'center' }
      );

    pdf.end();
  });
}

/**
 * Resolves the physical path of a document file, searching candidate paths,
 * and creating a valid physical document on disk if it does not already exist.
 */
export async function resolveDocumentPhysicalPath(doc: DocumentFileMeta): Promise<string> {
  const candidatePaths: string[] = [];

  if (path.isAbsolute(doc.fileUrl)) {
    candidatePaths.push(doc.fileUrl);
  } else {
    candidatePaths.push(
      path.resolve(process.cwd(), doc.fileUrl),
      path.resolve(process.cwd(), 'backend', doc.fileUrl),
      path.resolve(__dirname, '../../../', doc.fileUrl),
      path.resolve(__dirname, '../../../../', doc.fileUrl),
      path.resolve(__dirname, '../../../../../', doc.fileUrl)
    );
  }

  for (const candidate of candidatePaths) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Determine standard target path on disk
  const targetPath = path.isAbsolute(doc.fileUrl)
    ? doc.fileUrl
    : path.resolve(process.cwd(), doc.fileUrl);

  const parentDir = path.dirname(targetPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  if (doc.mimeType?.includes('pdf') || doc.fileName?.toLowerCase().endsWith('.pdf')) {
    const pdfBuf = await generateDocumentPdfBuffer(doc);
    fs.writeFileSync(targetPath, pdfBuf);
  } else {
    const content = `Title: ${doc.title}\nDescription: ${doc.description || 'N/A'}\nFile: ${doc.fileName}\n`;
    fs.writeFileSync(targetPath, Buffer.from(content, 'utf-8'));
  }

  return targetPath;
}
