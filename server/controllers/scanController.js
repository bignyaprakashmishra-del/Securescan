// SecureScan Security Scan Controller
const prisma = require('../config/db');
const { runPassiveSecurityScan } = require('../services/scanner');
const { calculateSecurityScore } = require('../services/scoring');
const { compareScans } = require('../services/comparison');
const { generatePdfReport } = require('../services/reportGenerator');

async function createScan(req, res, next) {
  try {
    const { websiteId } = req.params;
    const userId = req.user.id;

    // Verify website ownership and authorization status
    const website = await prisma.website.findFirst({
      where: { id: websiteId, userId: userId },
    });

    if (!website) {
      return res.status(404).json({ error: 'Target website not found.' });
    }

    if (!website.isVerified) {
      return res.status(403).json({
        error:
          'Security policy violation: Only verified domains can be scanned. Complete DNS TXT ownership verification first.',
      });
    }

    // Execute genuine passive security assessment
    const scanResult = await runPassiveSecurityScan(website.domain);

    // Calculate explainable security score
    const scoreMetrics = calculateSecurityScore(scanResult.findings);

    // Save scan and findings atomically in DB
    const scan = await prisma.scan.create({
      data: {
        websiteId: website.id,
        userId: userId,
        score: scoreMetrics.score,
        grade: scoreMetrics.grade,
        riskLevel: scoreMetrics.riskLevel,
        totalChecks: scoreMetrics.totalChecks,
        criticalCount: scoreMetrics.criticalCount,
        highCount: scoreMetrics.highCount,
        mediumCount: scoreMetrics.mediumCount,
        lowCount: scoreMetrics.lowCount,
        infoCount: scoreMetrics.infoCount,
        summary: scoreMetrics.summary,
        scanDurationMs: scanResult.durationMs,
        findings: {
          create: scanResult.findings.map((f) => ({
            category: f.category,
            name: f.name,
            severity: f.severity,
            description: f.description,
            evidence: f.evidence || '',
            impact: f.impact || '',
            remediation: f.remediation || '',
            technicalDetails: f.technicalDetails || '',
          })),
        },
      },
      include: {
        findings: true,
        website: {
          select: { domain: true },
        },
      },
    });

    res.status(201).json({
      message: 'Security assessment completed successfully.',
      scan: scan,
    });
  } catch (err) {
    next(err);
  }
}

async function getScans(req, res, next) {
  try {
    const userId = req.user.id;

    const scans = await prisma.scan.findMany({
      where: { userId: userId },
      include: {
        website: {
          select: { id: true, domain: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ scans: scans });
  } catch (err) {
    next(err);
  }
}

async function getScanById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const scan = await prisma.scan.findFirst({
      where: { id: id, userId: userId },
      include: {
        findings: {
          orderBy: { createdAt: 'asc' },
        },
        website: {
          select: { id: true, domain: true },
        },
      },
    });

    if (!scan) {
      return res.status(404).json({ error: 'Scan record not found or access denied.' });
    }

    res.json({ scan: scan });
  } catch (err) {
    next(err);
  }
}

async function downloadReport(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const scan = await prisma.scan.findFirst({
      where: { id: id, userId: userId },
      include: {
        findings: true,
        website: {
          select: { domain: true },
        },
      },
    });

    if (!scan) {
      return res.status(404).json({ error: 'Scan record not found.' });
    }

    const filename = `SecureScan-Report-${scan.website.domain}-${scan.id.slice(0, 8)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    generatePdfReport(scan, res);
  } catch (err) {
    next(err);
  }
}

async function compareScansController(req, res, next) {
  try {
    const { id } = req.params;
    const { targetId } = req.query;
    const userId = req.user.id;

    if (!targetId) {
      return res.status(400).json({ error: 'Target scan ID for comparison is required (?targetId=...)' });
    }

    const [scanA, scanB] = await Promise.all([
      prisma.scan.findFirst({
        where: { id: id, userId: userId },
        include: { findings: true, website: true },
      }),
      prisma.scan.findFirst({
        where: { id: targetId, userId: userId },
        include: { findings: true, website: true },
      }),
    ]);

    if (!scanA || !scanB) {
      return res.status(404).json({ error: 'One or both scan records were not found.' });
    }

    if (scanA.websiteId !== scanB.websiteId) {
      return res.status(400).json({
        error: 'Cannot compare scans from different domains. Scans must belong to the same target website.',
      });
    }

    const comparison = compareScans(scanA, scanB);

    res.json({ comparison: comparison });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createScan,
  getScans,
  getScanById,
  downloadReport,
  compareScansController,
};
