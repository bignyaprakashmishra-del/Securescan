// SecureScan Scan Comparison & Posture Diff Service

/**
 * Compares two scans and categorizes findings into:
 * - fixedFindings: in Scan A, not in Scan B
 * - newFindings: in Scan B, not in Scan A
 * - unchangedFindings: in both Scan A and Scan B
 */
function compareScans(scanA, scanB) {
  // Sort chronologically so priorScan is the earlier one
  const isAEarlier = new Date(scanA.createdAt) <= new Date(scanB.createdAt);
  const priorScan = isAEarlier ? scanA : scanB;
  const currentScan = isAEarlier ? scanB : scanA;

  const priorFindings = priorScan.findings || [];
  const currentFindings = currentScan.findings || [];

  const priorMap = new Map();
  priorFindings.forEach((f) => priorMap.set(f.name.toLowerCase().trim(), f));

  const currentMap = new Map();
  currentFindings.forEach((f) => currentMap.set(f.name.toLowerCase().trim(), f));

  const fixedFindings = [];
  const unchangedFindings = [];
  const newFindings = [];

  // Check prior findings against current
  priorFindings.forEach((f) => {
    const key = f.name.toLowerCase().trim();
    if (currentMap.has(key)) {
      unchangedFindings.push(f);
    } else {
      fixedFindings.push(f);
    }
  });

  // Check current findings for newly introduced ones
  currentFindings.forEach((f) => {
    const key = f.name.toLowerCase().trim();
    if (!priorMap.has(key)) {
      newFindings.push(f);
    }
  });

  const scoreDelta = currentScan.score - priorScan.score;

  return {
    priorScan: {
      id: priorScan.id,
      score: priorScan.score,
      grade: priorScan.grade,
      riskLevel: priorScan.riskLevel,
      createdAt: priorScan.createdAt,
    },
    currentScan: {
      id: currentScan.id,
      score: currentScan.score,
      grade: currentScan.grade,
      riskLevel: currentScan.riskLevel,
      createdAt: currentScan.createdAt,
    },
    scoreDelta: scoreDelta,
    fixedFindings: fixedFindings,
    newFindings: newFindings,
    unchangedFindings: unchangedFindings,
    metrics: {
      fixedCount: fixedFindings.length,
      newCount: newFindings.length,
      unchangedCount: unchangedFindings.length,
    },
  };
}

module.exports = {
  compareScans,
};
