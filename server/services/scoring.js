// SecureScan Explainable Security Scoring Engine
const { SCORING } = require('../config/constants');

/**
 * Calculates a transparent, explainable 100-point security score
 * based on identified findings and their respective severity weights.
 */
function calculateSecurityScore(findings = []) {
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let infoCount = 0;

  findings.forEach((finding) => {
    const sev = finding.severity?.toLowerCase();
    if (sev === 'critical') criticalCount++;
    else if (sev === 'high') highCount++;
    else if (sev === 'medium') mediumCount++;
    else if (sev === 'low') lowCount++;
    else infoCount++;
  });

  const totalDeductions =
    criticalCount * SCORING.DEDUCTIONS.CRITICAL +
    highCount * SCORING.DEDUCTIONS.HIGH +
    mediumCount * SCORING.DEDUCTIONS.MEDIUM +
    lowCount * SCORING.DEDUCTIONS.LOW;

  const rawScore = SCORING.BASE_SCORE - totalDeductions;
  const finalScore = Math.max(0, Math.min(100, rawScore));

  // Determine Letter Grade and Risk Classification
  let grade = 'F';
  let riskLevel = 'Critical Risk';

  for (const threshold of SCORING.GRADES) {
    if (finalScore >= threshold.min) {
      grade = threshold.grade;
      riskLevel = threshold.risk;
      break;
    }
  }

  // Construct itemized deduction reasons
  const deductionReasons = [];
  if (criticalCount > 0) {
    deductionReasons.push(
      `${criticalCount} Critical issue(s) deducted ${criticalCount * SCORING.DEDUCTIONS.CRITICAL} points (-25 ea)`
    );
  }
  if (highCount > 0) {
    deductionReasons.push(
      `${highCount} High-risk issue(s) deducted ${highCount * SCORING.DEDUCTIONS.HIGH} points (-15 ea)`
    );
  }
  if (mediumCount > 0) {
    deductionReasons.push(
      `${mediumCount} Medium-risk issue(s) deducted ${mediumCount * SCORING.DEDUCTIONS.MEDIUM} points (-8 ea)`
    );
  }
  if (lowCount > 0) {
    deductionReasons.push(
      `${lowCount} Low-risk / informational issue(s) deducted ${lowCount * SCORING.DEDUCTIONS.LOW} points (-3 ea)`
    );
  }

  // Construct Executive Summary
  let summary = '';
  if (finalScore >= 90) {
    summary = `Excellent security posture. All core transport security and high-impact browser defenses are properly configured. Minor optimizations recommended for defense-in-depth hardening.`;
  } else if (finalScore >= 75) {
    summary = `Good baseline security posture. The target implements essential encryption, but lacks secondary hardening headers or strict cookie controls that mitigate clickjacking or CSRF.`;
  } else if (finalScore >= 55) {
    summary = `Moderate risk posture with multiple security misconfigurations detected. Critical defense-in-depth headers (such as CSP or HSTS) or cookie flags are missing, leaving the host vulnerable to client-side injection.`;
  } else {
    summary = `High to critical risk posture. Urgent remediation required. Identified missing transport safeguards, insecure session cookie transmission, or absence of primary browser exploit mitigations.`;
  }

  return {
    score: finalScore,
    grade: grade,
    riskLevel: riskLevel,
    criticalCount: criticalCount,
    highCount: highCount,
    mediumCount: mediumCount,
    lowCount: lowCount,
    infoCount: infoCount,
    totalChecks: findings.length,
    deductionReasons: deductionReasons,
    summary: summary,
  };
}

module.exports = {
  calculateSecurityScore,
};
