// SecureScan Demonstration Mode Controller
// Delivers realistic, explicitly fictional datasets for judges without authentication

const { DEMO_TARGETS } = require('../services/demoData');
const { generatePdfReport } = require('../services/reportGenerator');
const { compareScans } = require('../services/comparison');

function getDemoOverview(req, res) {
  const targets = Object.values(DEMO_TARGETS);
  let totalScore = 0;
  let critical = 0;
  let high = 0;
  let med = 0;
  let low = 0;

  targets.forEach((t) => {
    totalScore += t.scan.score;
    critical += t.scan.criticalCount;
    high += t.scan.highCount;
    med += t.scan.mediumCount;
    low += t.scan.lowCount;
  });

  res.json({
    isDemo: true,
    banner: 'DEMONSTRATION DATASET — FOR PROJECT COMPETITION JUDGES',
    stats: {
      avgScore: Math.round(totalScore / targets.length),
      totalWebsites: targets.length,
      totalScans: targets.length,
      criticalCount: critical,
      highCount: high,
      mediumCount: med,
      lowCount: low,
    },
    targets: targets.map((t) => ({
      id: t.id,
      domain: t.domain,
      name: t.name,
      type: t.type,
      score: t.scan.score,
      grade: t.scan.grade,
      riskLevel: t.scan.riskLevel,
    })),
  });
}

function getDemoWebsites(req, res) {
  const list = Object.values(DEMO_TARGETS).map((t) => ({
    id: t.id,
    domain: t.domain,
    name: t.name,
    type: t.type,
    isVerified: true,
    createdAt: new Date().toISOString(),
    scans: [t.scan],
  }));

  res.json({ isDemo: true, websites: list });
}

function getDemoScan(req, res) {
  const { id } = req.params;
  const target =
    DEMO_TARGETS[id] ||
    Object.values(DEMO_TARGETS).find((t) => t.id === id || t.scan.id === id || t.domain === id) ||
    DEMO_TARGETS.retail;

  res.json({
    isDemo: true,
    scan: {
      ...target.scan,
      website: {
        id: target.id,
        domain: target.domain,
      },
    },
  });
}

function downloadDemoReport(req, res) {
  const { id } = req.params;
  const target =
    DEMO_TARGETS[id] ||
    Object.values(DEMO_TARGETS).find((t) => t.id === id || t.scan.id === id) ||
    DEMO_TARGETS.retail;

  const mockScanRecord = {
    ...target.scan,
    website: {
      domain: `[DEMO] ${target.domain}`,
    },
    summary: `[DEMONSTRATION SAMPLE REPORT] ${target.scan.summary}`,
  };

  const filename = `SecureScan-DEMO-Report-${target.domain}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  generatePdfReport(mockScanRecord, res);
}

function compareDemoScans(req, res) {
  const targetA = DEMO_TARGETS.retail;
  const targetB = DEMO_TARGETS.finvault;

  const comparison = compareScans(
    { ...targetA.scan, website: { domain: targetA.domain } },
    { ...targetB.scan, website: { domain: targetB.domain } }
  );

  res.json({ isDemo: true, comparison: comparison });
}

module.exports = {
  getDemoOverview,
  getDemoWebsites,
  getDemoScan,
  downloadDemoReport,
  compareDemoScans,
};
