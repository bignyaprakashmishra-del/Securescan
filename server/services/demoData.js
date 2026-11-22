// SecureScan Demonstration Mode Datasets
// Explicitly fictional, realistic competition evaluation data for judges

const DEMO_TARGETS = {
  retail: {
    id: 'demo-target-retail',
    domain: 'shop.apex-retail.io',
    name: 'Apex Retail E-Commerce Portal',
    type: 'B2C E-Commerce Application',
    isVerified: true,
    scan: {
      id: 'demo-scan-retail-001',
      score: 48,
      grade: 'D',
      riskLevel: 'High Risk',
      totalChecks: 6,
      criticalCount: 1,
      highCount: 2,
      mediumCount: 2,
      lowCount: 1,
      scanDurationMs: 412,
      createdAt: new Date().toISOString(),
      summary:
        'DEMONSTRATION SAMPLE: High security posture risk. Critical lack of Content Security Policy and HTTP Strict Transport Security. Active session cookies transmitted without HttpOnly and SameSite directives.',
      findings: [
        {
          id: 'demo-f1',
          name: 'Missing Content-Security-Policy (CSP)',
          category: 'Security Headers',
          severity: 'High',
          evidence: 'Content-Security-Policy header is absent in HTTP response.',
          description:
            'No Content-Security-Policy header was returned. CSP provides a defense-in-depth layer against Cross-Site Scripting (XSS), clickjacking, and data injection attacks.',
          impact:
            'Attackers injecting malicious scripts can execute arbitrary JavaScript in user sessions, steal DOM secrets, and exfiltrate credentials.',
          technicalDetails:
            'Compliant with W3C CSP Level 3. Browser will execute inline scripts and load scripts from any third-party origin without restriction.',
          remediation:
            'Implement a strict Content-Security-Policy with default-src "self" and explicit script/style whitelisting.',
        },
        {
          id: 'demo-f2',
          name: 'Missing Strict-Transport-Security (HSTS)',
          category: 'Security Headers',
          severity: 'High',
          evidence: 'Strict-Transport-Security header not detected on HTTPS endpoint.',
          description:
            'HSTS instructs modern browsers to only connect over secure HTTPS, preventing SSL stripping and downgrade attacks.',
          impact:
            'Man-in-the-middle (MitM) attackers on local networks (e.g. public Wi-Fi) can strip TLS and intercept plain-text session traffic.',
          technicalDetails:
            'RFC 6797 requirement. Recommended max-age minimum: 31536000 seconds (1 year) with includeSubDomains.',
          remediation:
            'Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload header on all HTTPS responses.',
        },
        {
          id: 'demo-f3',
          name: 'Session Cookie Missing HttpOnly Flag',
          category: 'Cookie Flags',
          severity: 'Critical',
          evidence: 'Set-Cookie: session_id=9f82a1c0...; Path=/; Secure (Missing HttpOnly)',
          description: 'The primary session authentication cookie lacks the HttpOnly directive.',
          impact:
            'Any Cross-Site Scripting (XSS) vulnerability can immediately read document.cookie and exfiltrate user session tokens.',
          technicalDetails:
            'RFC 6265bis section 5.4. When HttpOnly is omitted, the cookie is readable by JavaScript client code.',
          remediation:
            'Configure your web framework / session store to set HttpOnly on all authentication cookies.',
        },
        {
          id: 'demo-f4',
          name: 'Cookie Missing SameSite Attribute',
          category: 'Cookie Flags',
          severity: 'Medium',
          evidence: 'Set-Cookie: session_id=9f82a1c0...; Path=/; Secure (Missing SameSite)',
          description: 'No SameSite attribute declared on session cookies.',
          impact:
            'Exposes application to Cross-Site Request Forgery (CSRF) on cross-origin navigational requests.',
          technicalDetails:
            'Modern standard defaults to Lax in Chrome, but explicit SameSite=Lax or SameSite=Strict ensures cross-browser policy enforcement.',
          remediation:
            'Append SameSite=Lax (or SameSite=Strict for high-security APIs) to all Set-Cookie headers.',
        },
        {
          id: 'demo-f5',
          name: 'X-Content-Type-Options Header Missing',
          category: 'Security Headers',
          severity: 'Medium',
          evidence: 'X-Content-Type-Options header missing from server headers.',
          description: 'Prevents browsers from MIME-type sniffing a response away from the declared Content-Type.',
          impact:
            'Attackers uploading user-supplied content (e.g. avatar images) could execute them as executable JavaScript or CSS.',
          technicalDetails: 'RFC 7231 / Fetch Standard. Header value must be strictly "nosniff".',
          remediation: 'Send X-Content-Type-Options: nosniff on all HTTP responses.',
        },
        {
          id: 'demo-f6',
          name: 'Sensitive Administrative Path Disclosed in robots.txt',
          category: 'Public Resources',
          severity: 'Low',
          evidence: 'Disallow: /admin-console-v2/ identified in /robots.txt',
          description:
            'Disallow directives in robots.txt are publicly readable and can reveal hidden management paths to attackers.',
          impact: 'Provides reconnaissance to adversaries looking for unlisted administrative portals.',
          technicalDetails:
            'robots.txt is not an access control mechanism. Access control must be enforced via server authentication.',
          remediation:
            'Remove internal endpoint names from robots.txt and restrict access with IP whitelists and multi-factor authentication.',
        },
      ],
    },
  },

  finvault: {
    id: 'demo-target-finvault',
    domain: 'api.finvault-demo.com',
    name: 'FinVault Cloud Banking API',
    type: 'FinTech Banking Gateway',
    isVerified: true,
    scan: {
      id: 'demo-scan-finvault-001',
      score: 98,
      grade: 'A+',
      riskLevel: 'Low Risk',
      totalChecks: 1,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 1,
      scanDurationMs: 290,
      createdAt: new Date().toISOString(),
      summary:
        'DEMONSTRATION SAMPLE: Outstanding enterprise security grade. Full transport encryption with TLS 1.3, strict HSTS preload, zero cleartext cookies, and comprehensive Content Security Policy.',
      findings: [
        {
          id: 'demo-f7',
          name: 'Referrer-Policy Strictness Recommendation',
          category: 'Security Headers',
          severity: 'Low',
          evidence: 'Referrer-Policy: strict-origin-when-cross-origin',
          description:
            'Current policy is secure, but high-sensitivity banking environments can upgrade to "no-referrer" to eliminate any URL leakage in query strings.',
          impact: 'Minimal. Potential leakage of internal transaction IDs if passed as URL query parameters.',
          technicalDetails: 'W3C Referrer Policy recommendation.',
          remediation: 'Consider setting Referrer-Policy: no-referrer for banking transaction endpoints.',
        },
      ],
    },
  },

  health: {
    id: 'demo-target-health',
    domain: 'portal.healthbridge.org',
    name: 'HealthBridge Patient Records',
    type: 'HIPAA Compliant Patient Portal',
    isVerified: true,
    scan: {
      id: 'demo-scan-health-001',
      score: 68,
      grade: 'C',
      riskLevel: 'Moderate Risk',
      totalChecks: 2,
      criticalCount: 0,
      highCount: 1,
      mediumCount: 1,
      lowCount: 0,
      scanDurationMs: 345,
      createdAt: new Date().toISOString(),
      summary:
        'DEMONSTRATION SAMPLE: Moderate security posture. TLS and HSTS are deployed, but Clickjacking protection is weakly configured and Permissions-Policy is absent.',
      findings: [
        {
          id: 'demo-f8',
          name: 'Missing Permissions-Policy Header',
          category: 'Security Headers',
          severity: 'High',
          evidence: 'Permissions-Policy header not present.',
          description:
            'Allows embedded iframes or compromised scripts to access device hardware such as camera, microphone, and geolocation.',
          impact:
            'Malicious scripts could probe or activate sensitive client hardware APIs without explicit origin lockdown.',
          technicalDetails: 'W3C Permissions Policy standard.',
          remediation: 'Configure Permissions-Policy: camera=(), microphone=(), geolocation=() on all responses.',
        },
        {
          id: 'demo-f9',
          name: 'Weak X-Frame-Options (Clickjacking Exposure)',
          category: 'Security Headers',
          severity: 'Medium',
          evidence: 'X-Frame-Options: SAMEORIGIN (Recommend DENY for patient records)',
          description:
            'SAMEORIGIN allows the page to be framed by any same-origin document. If a subdomain is compromised, clickjacking attacks are possible.',
          impact:
            'Adversary can overlay transparent UI frames over patient record buttons to trick users into unintended clicks.',
          technicalDetails: 'RFC 7034 Clickjacking defense.',
          remediation: 'Set X-Frame-Options: DENY or use CSP frame-ancestors "none".',
        },
      ],
    },
  },
};

module.exports = {
  DEMO_TARGETS,
};
