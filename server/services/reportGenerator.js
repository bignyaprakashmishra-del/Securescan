// SecureScan Professional PDF Report Generator
// Generates publication-grade cybersecurity assessment reports using PDFKit

const PDFDocument = require('pdfkit');

function generatePdfReport(scan, res) {
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true,
  });

  doc.pipe(res);

  // Color Palette
  const colors = {
    primary: '#1E293B',
    accent: '#3B82F6',
    purple: '#8B5CF6',
    cyan: '#06B6D4',
    dark: '#0B0F19',
    text: '#1E293B',
    muted: '#64748B',
    critical: '#EF4444',
    high: '#F97316',
    medium: '#F59E0B',
    low: '#10B981',
    border: '#E2E8F0',
  };

  // Header Banner
  doc.rect(40, 40, 515, 65).fill('#0F172A');

  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .fillColor('#FFFFFF')
    .text('SecureScan Intelligence Platform', 55, 52);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#94A3B8')
    .text('Explainable Web Application Security Assessment Report', 55, 75);

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor('#38BDF8')
    .text('COMPETITION EDITION • AUDIT COMPLIANCE', 340, 54, { align: 'right' });

  doc.moveDown(3);

  // Metadata Grid
  const metaY = 120;
  doc
    .rect(40, metaY, 515, 55)
    .strokeColor(colors.border)
    .lineWidth(1)
    .stroke();

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(colors.muted)
    .text('TARGET DOMAIN', 55, metaY + 12);
  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor(colors.text)
    .text(scan.website?.domain || 'Target', 55, metaY + 26);

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(colors.muted)
    .text('AUDIT DATE', 220, metaY + 12);
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(colors.text)
    .text(new Date(scan.createdAt).toLocaleDateString(), 220, metaY + 26);

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(colors.muted)
    .text('SECURITY SCORE', 380, metaY + 12);
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor(scan.score >= 80 ? colors.low : scan.score >= 60 ? colors.medium : colors.critical)
    .text(`${scan.score} / 100 (${scan.grade})`, 380, metaY + 24);

  // Executive Summary Card
  const summaryY = 190;
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor(colors.text)
    .text('1. Executive Security Summary', 40, summaryY);

  doc
    .rect(40, summaryY + 18, 515, 60)
    .fillColor('#F8FAFC')
    .fill()
    .strokeColor(colors.border)
    .stroke();

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#334155')
    .text(
      scan.summary ||
        `Automated passive assessment completed for ${scan.website?.domain}. Risk classification is determined as ${scan.riskLevel} with ${scan.criticalCount} Critical, ${scan.highCount} High, ${scan.mediumCount} Medium, and ${scan.lowCount} Low severity findings.`,
      55,
      summaryY + 28,
      { width: 485, lineGap: 3 }
    );

  // Metrics Table
  const tableY = 285;
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor(colors.text)
    .text('2. Severity Breakdown', 40, tableY);

  const colW = 103;
  const metrics = [
    { label: 'CRITICAL', count: scan.criticalCount, color: colors.critical },
    { label: 'HIGH RISK', count: scan.highCount, color: colors.high },
    { label: 'MEDIUM RISK', count: scan.mediumCount, color: colors.medium },
    { label: 'LOW RISK', count: scan.lowCount, color: colors.low },
    { label: 'TOTAL ISSUES', count: (scan.findings || []).length, color: colors.primary },
  ];

  metrics.forEach((m, idx) => {
    const x = 40 + idx * colW;
    doc.rect(x, tableY + 20, colW, 45).strokeColor(colors.border).stroke();
    doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.muted).text(m.label, x + 10, tableY + 28);
    doc.fontSize(16).font('Helvetica-Bold').fillColor(m.color).text(String(m.count), x + 10, tableY + 42);
  });

  // Detailed Findings Section
  let currentY = 370;
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor(colors.text)
    .text('3. Detailed Audit Findings & Remediation', 40, currentY);

  currentY += 25;

  const findings = scan.findings || [];

  findings.forEach((finding, index) => {
    // Check for page boundary
    if (currentY > 680) {
      doc.addPage();
      currentY = 50;
    }

    const sevColor =
      finding.severity?.toLowerCase() === 'critical'
        ? colors.critical
        : finding.severity?.toLowerCase() === 'high'
        ? colors.high
        : finding.severity?.toLowerCase() === 'medium'
        ? colors.medium
        : colors.low;

    // Finding Card Header
    doc
      .rect(40, currentY, 515, 22)
      .fillColor('#F1F5F9')
      .fill();

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(sevColor)
      .text(`[${finding.severity?.toUpperCase()}]`, 48, currentY + 6);

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(colors.text)
      .text(`${finding.name} (${finding.category})`, 125, currentY + 6);

    currentY += 28;

    // Description & Evidence
    doc
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor(colors.muted)
      .text('Evidence Log: ', 48, currentY, { continued: true })
      .font('Helvetica')
      .fillColor(colors.text)
      .text(finding.evidence || 'N/A');

    currentY += 16;

    doc
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor(colors.muted)
      .text('Potential Impact: ', 48, currentY, { continued: true })
      .font('Helvetica')
      .fillColor(colors.text)
      .text(finding.impact || finding.description, { width: 490 });

    currentY += 24;

    doc
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor(colors.low)
      .text('Recommended Fix: ', 48, currentY, { continued: true })
      .font('Helvetica')
      .fillColor(colors.text)
      .text(finding.remediation, { width: 490 });

    currentY += 32;
  });

  // Footer / Page numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(colors.muted)
      .text(
        `SecureScan Security Intelligence Platform • Page ${i + 1} of ${pages.count} • Confidential Evaluation`,
        40,
        800,
        { align: 'center', width: 515 }
      );
  }

  doc.end();
}

module.exports = {
  generatePdfReport,
};
