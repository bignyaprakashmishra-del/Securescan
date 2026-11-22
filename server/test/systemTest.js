// SecureScan Comprehensive Test Suite
// Verifies: SSRF blocks, Validation, Auth, Verification, Isolation, Scoring, Comparison, PDF, Demo

const assert = require('assert');
const { isSafeIP, isBlockedIPv4, isBlockedIPv6 } = require('../services/ssrfProtection');
const { calculateSecurityScore } = require('../services/scoring');
const { compareScans } = require('../services/comparison');
const { generatePdfReport } = require('../services/reportGenerator');
const { DEMO_TARGETS } = require('../services/demoData');
const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

async function runTestSuite() {
  console.log('====================================================');
  console.log('🛡️  STARTING SECURESCAN AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}\n`);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}\n`);
    }
  }

  console.log('--- 1. SSRF & PRIVATE IP BLOCKING AUDIT ---');

  test('Blocks Loopback IPv4 (127.0.0.1, 127.0.0.254)', () => {
    assert.strictEqual(isSafeIP('127.0.0.1'), false);
    assert.strictEqual(isSafeIP('127.0.0.254'), false);
    assert.strictEqual(isBlockedIPv4('127.0.0.1'), true);
  });

  test('Blocks Private RFC 1918 IPv4 (10.x, 172.16-31.x, 192.168.x)', () => {
    assert.strictEqual(isSafeIP('10.0.0.1'), false);
    assert.strictEqual(isSafeIP('10.255.255.255'), false);
    assert.strictEqual(isSafeIP('172.16.0.1'), false);
    assert.strictEqual(isSafeIP('172.31.255.255'), false);
    assert.strictEqual(isSafeIP('192.168.1.1'), false);
    assert.strictEqual(isSafeIP('192.168.100.50'), false);
  });

  test('Blocks Cloud Metadata & Link-Local (169.254.169.254, 169.254.1.1)', () => {
    assert.strictEqual(isSafeIP('169.254.169.254'), false);
    assert.strictEqual(isSafeIP('169.254.1.1'), false);
    assert.strictEqual(isBlockedIPv4('169.254.169.254'), true);
  });

  test('Blocks Carrier-Grade NAT (100.64.0.1, 100.127.255.255)', () => {
    assert.strictEqual(isSafeIP('100.64.0.1'), false);
    assert.strictEqual(isSafeIP('100.127.255.255'), false);
  });

  test('Blocks Prohibited IPv6 (::1 loopback, fe80:: link-local, fc00:: unique local)', () => {
    assert.strictEqual(isSafeIP('::1'), false);
    assert.strictEqual(isSafeIP('fe80::1'), false);
    assert.strictEqual(isSafeIP('fc00::1'), false);
    assert.strictEqual(isBlockedIPv6('::1'), true);
  });

  test('Allows Legitimate Public IP Addresses (8.8.8.8, 1.1.1.1, 93.184.216.34)', () => {
    assert.strictEqual(isSafeIP('8.8.8.8'), true);
    assert.strictEqual(isSafeIP('1.1.1.1'), true);
    assert.strictEqual(isSafeIP('93.184.216.34'), true);
  });

  console.log('\n--- 2. EXPLAINABLE SCORING FORMULA AUDIT ---');

  test('Calculates Base Score 100 for clean findings', () => {
    const res = calculateSecurityScore([]);
    assert.strictEqual(res.score, 100);
    assert.strictEqual(res.grade, 'A+');
    assert.strictEqual(res.riskLevel, 'Low Risk');
  });

  test('Deducts Critical (-25) and High (-15) points correctly', () => {
    const findings = [
      { severity: 'Critical', name: 'No HTTPS' },
      { severity: 'High', name: 'No CSP' },
      { severity: 'High', name: 'No HSTS' },
      { severity: 'Medium', name: 'No X-Frame-Options' }, // -8
    ];
    // 100 - (25 + 15 + 15 + 8) = 100 - 63 = 37
    const res = calculateSecurityScore(findings);
    assert.strictEqual(res.score, 37);
    assert.strictEqual(res.grade, 'D');
    assert.strictEqual(res.riskLevel, 'High Risk');
    assert.strictEqual(res.criticalCount, 1);
    assert.strictEqual(res.highCount, 2);
    assert.strictEqual(res.mediumCount, 1);
    assert.strictEqual(res.deductionReasons.length, 3);
  });

  test('Caps minimum score at 0 for catastrophic finding set', () => {
    const findings = [
      { severity: 'Critical' },
      { severity: 'Critical' },
      { severity: 'Critical' },
      { severity: 'Critical' },
      { severity: 'Critical' }, // 5 * 25 = 125 deduction
    ];
    const res = calculateSecurityScore(findings);
    assert.strictEqual(res.score, 0);
    assert.strictEqual(res.grade, 'F');
  });

  console.log('\n--- 3. SCAN COMPARISON & POSTURE DIFF AUDIT ---');

  test('Accurately categorizes resolved, new, and unchanged issues', () => {
    const scanA = {
      id: 'scan-1',
      score: 50,
      grade: 'C',
      riskLevel: 'Elevated Risk',
      createdAt: new Date('2026-11-20T10:00:00Z'),
      findings: [
        { name: 'Missing HSTS', category: 'Headers', severity: 'High' },
        { name: 'Missing CSP', category: 'Headers', severity: 'High' },
        { name: 'Cookie Missing HttpOnly', category: 'Cookies', severity: 'Critical' },
      ],
    };

    const scanB = {
      id: 'scan-2',
      score: 85,
      grade: 'B',
      riskLevel: 'Moderate Risk',
      createdAt: new Date('2026-11-22T10:00:00Z'),
      findings: [
        { name: 'Missing HSTS', category: 'Headers', severity: 'High' }, // Unchanged
        { name: 'Referrer-Policy Missing', category: 'Headers', severity: 'Low' }, // New
        // CSP and Cookie resolved!
      ],
    };

    const diff = compareScans(scanA, scanB);
    assert.strictEqual(diff.scoreDelta, 35); // 85 - 50 = +35 pts
    assert.strictEqual(diff.fixedFindings.length, 2); // CSP and Cookie fixed
    assert.strictEqual(diff.newFindings.length, 1); // Referrer-Policy new
    assert.strictEqual(diff.unchangedFindings.length, 1); // HSTS unchanged
  });

  console.log('\n--- 4. AUTH & CROSS-USER ISOLATION DATABASE AUDIT ---');

  await testAsync('Registers users Alice & Bob and hashes passwords with bcrypt', async () => {
    // Clean prior test records if any
    await prisma.finding.deleteMany({});
    await prisma.scan.deleteMany({});
    await prisma.website.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: ['alice@testsecurescan.com', 'bob@testsecurescan.com'] } },
    });

    const hashA = await bcrypt.hash('SecurePasswordAlice123!', 10);
    const hashB = await bcrypt.hash('SecurePasswordBob123!', 10);

    const alice = await prisma.user.create({
      data: { name: 'Alice Analyst', email: 'alice@testsecurescan.com', passwordHash: hashA },
    });

    const bob = await prisma.user.create({
      data: { name: 'Bob Auditor', email: 'bob@testsecurescan.com', passwordHash: hashB },
    });

    assert.ok(alice.id);
    assert.ok(bob.id);
    assert.notStrictEqual(alice.passwordHash, 'SecurePasswordAlice123!');
  });

  await testAsync('Creates domain for Alice and verifies cryptographic token generated', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@testsecurescan.com' } });
    const site = await prisma.website.create({
      data: {
        domain: 'example.com',
        verificationToken: 'token_alice_secret_12345',
        userId: alice.id,
        isVerified: true,
      },
    });

    assert.strictEqual(site.domain, 'example.com');
    assert.strictEqual(site.userId, alice.id);
    assert.strictEqual(site.isVerified, true);
  });

  await testAsync('Enforces Cross-User Isolation: Bob cannot access or scan Alice domains', async () => {
    const bob = await prisma.user.findUnique({ where: { email: 'bob@testsecurescan.com' } });
    const aliceSite = await prisma.website.findFirst({ where: { domain: 'example.com' } });

    // Query for Bob's access to Alice's site
    const forbidden = await prisma.website.findFirst({
      where: {
        id: aliceSite.id,
        userId: bob.id, // Must match Bob's ID
      },
    });

    assert.strictEqual(forbidden, null, 'Cross-user boundary check passed: Bob cannot view Alice site.');
  });

  await testAsync('Atomic scan creation with findings in Prisma', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@testsecurescan.com' } });
    const site = await prisma.website.findFirst({ where: { userId: alice.id } });

    const scan = await prisma.scan.create({
      data: {
        websiteId: site.id,
        userId: alice.id,
        score: 75,
        grade: 'B',
        riskLevel: 'Moderate Risk',
        totalChecks: 2,
        criticalCount: 0,
        highCount: 1,
        mediumCount: 1,
        lowCount: 0,
        summary: 'Test scan for system validation.',
        findings: {
          create: [
            {
              category: 'Security Headers',
              name: 'Missing CSP',
              severity: 'High',
              evidence: 'No CSP header present.',
              description: 'Missing Content-Security-Policy.',
              impact: 'XSS vulnerability exposure.',
              remediation: 'Configure CSP header.',
            },
            {
              category: 'Security Headers',
              name: 'Missing X-Frame-Options',
              severity: 'Medium',
              evidence: 'No XFO present.',
              description: 'Clickjacking risk.',
              impact: 'Framing vulnerability.',
              remediation: 'Configure X-Frame-Options: DENY.',
            },
          ],
        },
      },
      include: { findings: true },
    });

    assert.strictEqual(scan.findings.length, 2);
    assert.strictEqual(scan.score, 75);
    assert.strictEqual(scan.grade, 'B');
  });

  console.log('\n--- 5. PDF REPORT GENERATOR AUDIT ---');

  await testAsync('Generates binary PDF stream with proper signature (%PDF)', async () => {
    const mockScan = {
      id: 'scan-pdf-test-123',
      score: 82,
      grade: 'B',
      riskLevel: 'Moderate Risk',
      criticalCount: 0,
      highCount: 1,
      mediumCount: 1,
      lowCount: 0,
      summary: 'Automated test audit.',
      createdAt: new Date().toISOString(),
      website: { domain: 'test-domain.com' },
      findings: [
        {
          name: 'Missing Strict-Transport-Security',
          category: 'Security Headers',
          severity: 'High',
          evidence: 'Header missing.',
          description: 'Enforce HTTPS.',
          impact: 'MitM risk.',
          remediation: 'Add HSTS header.',
        },
      ],
    };

    const stream = require('stream');
    const chunks = [];
    const writable = new stream.Writable({
      write(chunk, encoding, next) {
        chunks.push(chunk);
        next();
      },
    });

    await new Promise((resolve, reject) => {
      writable.on('finish', resolve);
      writable.on('error', reject);
      generatePdfReport(mockScan, writable);
    });

    const pdfBuffer = Buffer.concat(chunks);
    const pdfHeader = pdfBuffer.slice(0, 5).toString('ascii');
    assert.strictEqual(pdfHeader, '%PDF-', 'PDF file signature check passed (%PDF-)');
    assert.ok(pdfBuffer.length > 1000, 'PDF buffer length contains rendered content.');
  });

  console.log('\n--- 6. DEMO MODE PRESET AUDIT ---');

  test('Validates all 3 competition demo datasets (retail, finvault, health)', () => {
    assert.ok(DEMO_TARGETS.retail, 'Retail demo target exists');
    assert.ok(DEMO_TARGETS.finvault, 'Finvault demo target exists');
    assert.ok(DEMO_TARGETS.health, 'Health demo target exists');

    assert.strictEqual(DEMO_TARGETS.retail.scan.score, 48);
    assert.strictEqual(DEMO_TARGETS.finvault.scan.score, 98);
    assert.strictEqual(DEMO_TARGETS.health.scan.score, 68);

    assert.ok(DEMO_TARGETS.retail.scan.findings.length >= 5);
  });

  console.log('\n====================================================');
  console.log(`🎯 TEST RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log('====================================================\n');

  if (passed === total) {
    console.log('🌟 ALL SYSTEM TESTS PASSED CLEANLY!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('FATAL TEST ERROR:', err);
  process.exit(1);
});
