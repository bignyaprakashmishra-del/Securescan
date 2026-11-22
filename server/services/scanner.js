// SecureScan Passive Security Assessment Engine
// Genuine non-destructive checks: Transport, TLS, Headers, Cookies, and Public Assets

const tls = require('tls');
const http = require('http');
const https = require('https');
const { safeHttpGet, resolveAndValidateDomain } = require('./ssrfProtection');
const { SCANNER } = require('../config/constants');

/**
 * Inspects TLS Certificate using a safe TLS connection.
 */
async function inspectTlsCertificate(domain, pinnedIP) {
  return new Promise((resolve) => {
    let socket;
    const timeout = setTimeout(() => {
      if (socket) socket.destroy();
      resolve({
        valid: false,
        error: 'TLS handshake timed out.',
      });
    }, SCANNER.TIMEOUT_MS);

    try {
      socket = tls.connect(
        {
          host: pinnedIP,
          port: 443,
          servername: domain,
          rejectUnauthorized: false, // We check authorization manually to provide detailed findings
        },
        () => {
          clearTimeout(timeout);
          const cert = socket.getPeerCertificate(true);
          const authorized = socket.authorized;
          const authError = socket.authorizationError;
          const protocol = socket.getProtocol();
          socket.destroy();

          if (!cert || Object.keys(cert).length === 0) {
            return resolve({
              valid: false,
              error: 'No peer certificate returned by server.',
            });
          }

          const validFrom = new Date(cert.valid_from);
          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));

          resolve({
            valid: authorized,
            authError: authError || null,
            protocol: protocol,
            subject: cert.subject ? cert.subject.CN || cert.subject.O : 'Unknown',
            issuer: cert.issuer ? cert.issuer.O || cert.issuer.CN : 'Unknown',
            validFrom: validFrom.toISOString(),
            validTo: validTo.toISOString(),
            daysRemaining: daysRemaining,
            isExpired: now > validTo,
          });
        }
      );

      socket.on('error', (err) => {
        clearTimeout(timeout);
        resolve({
          valid: false,
          error: err.message,
        });
      });
    } catch (e) {
      clearTimeout(timeout);
      resolve({
        valid: false,
        error: e.message,
      });
    }
  });
}

/**
 * Checks if HTTP (port 80) permanently redirects to HTTPS.
 */
async function inspectHttpToHttpsRedirect(domain, pinnedIP) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        host: pinnedIP,
        port: 80,
        path: '/',
        method: 'GET',
        headers: {
          Host: domain,
          'User-Agent': SCANNER.USER_AGENT,
        },
        timeout: SCANNER.TIMEOUT_MS,
      },
      (res) => {
        const statusCode = res.statusCode;
        const location = res.headers.location || '';
        const redirectsToHttps =
          (statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) &&
          location.startsWith('https://');

        resolve({
          statusCode: statusCode,
          location: location,
          redirectsToHttps: redirectsToHttps,
          isPermanent: statusCode === 301 || statusCode === 308,
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ statusCode: null, redirectsToHttps: false, error: 'Port 80 connection timed out.' });
    });

    req.on('error', (err) => {
      resolve({ statusCode: null, redirectsToHttps: false, error: err.message });
    });

    req.end();
  });
}

/**
 * Comprehensive Passive Security Scanner.
 * Executes genuine HTTP/TLS probes and returns structured, explainable findings.
 */
async function runPassiveSecurityScan(domain) {
  const startTime = Date.now();
  const findings = [];

  // 1. Resolve and validate target IP against SSRF protection policies
  const safeIPs = await resolveAndValidateDomain(domain);
  const pinnedIP = safeIPs[0];

  // 2. Transport & TLS Audits
  const tlsInfo = await inspectTlsCertificate(domain, pinnedIP);
  const redirectInfo = await inspectHttpToHttpsRedirect(domain, pinnedIP);

  // Check: HTTPS Availability
  if (tlsInfo.error && tlsInfo.error.includes('ECONNREFUSED')) {
    findings.push({
      category: 'HTTPS & Transport',
      name: 'HTTPS Not Available',
      severity: 'Critical',
      evidence: `Connection refused on ${domain}:443. ${tlsInfo.error}`,
      description: 'The target domain does not have HTTPS enabled on port 443.',
      impact: 'All client communication is unencrypted and vulnerable to plaintext eavesdropping and traffic tampering.',
      remediation: 'Provision and configure a TLS/SSL certificate (e.g. via Let\'s Encrypt) and listen on port 443.',
      technicalDetails: 'Modern web standards mandate TLS for all HTTP traffic. Browsers mark non-HTTPS endpoints as Not Secure.',
    });
  } else if (!tlsInfo.valid) {
    findings.push({
      category: 'HTTPS & Transport',
      name: 'Invalid or Untrusted TLS Certificate',
      severity: 'High',
      evidence: `TLS handshake reported error: ${tlsInfo.authError || tlsInfo.error || 'Certificate untrusted'}`,
      description: 'The server presented a TLS certificate that failed validation by standard certificate authorities.',
      impact: 'Users encounter prominent browser security warning screens, deterring traffic and exposing sessions to MitM.',
      remediation: 'Renew or reconfigure the certificate with a recognized Certificate Authority (CA) and ensure intermediate certificates are chained.',
      technicalDetails: 'X.509 chain of trust validation failed during the TLS handshake.',
    });
  } else {
    // Check: TLS Expiration Lifespan
    if (tlsInfo.isExpired) {
      findings.push({
        category: 'HTTPS & Transport',
        name: 'TLS Certificate Expired',
        severity: 'Critical',
        evidence: `Certificate expired on ${tlsInfo.validTo}. Days remaining: ${tlsInfo.daysRemaining}.`,
        description: 'The website\'s SSL/TLS certificate has passed its validity date.',
        impact: 'Browsers strictly block access with SEC_ERROR_EXPIRED_CERTIFICATE warnings.',
        remediation: 'Immediately renew the SSL certificate and configure automated renewal via ACME / certbot.',
        technicalDetails: `Certificate valid_to: ${tlsInfo.validTo}, Issuer: ${tlsInfo.issuer}.`,
      });
    } else if (tlsInfo.daysRemaining <= 14) {
      findings.push({
        category: 'HTTPS & Transport',
        name: 'TLS Certificate Expiring Soon',
        severity: 'Medium',
        evidence: `Certificate expires in ${tlsInfo.daysRemaining} days (on ${tlsInfo.validTo}).`,
        description: 'The certificate is close to expiration and requires renewal.',
        impact: 'If renewal fails before expiration, service will suffer unexpected downtime and security blocks.',
        remediation: 'Trigger certificate renewal workflow.',
        technicalDetails: `Days remaining: ${tlsInfo.daysRemaining}. Issuer: ${tlsInfo.issuer}.`,
      });
    }
  }

  // Check: HTTP to HTTPS Redirection
  if (!redirectInfo.redirectsToHttps) {
    findings.push({
      category: 'HTTPS & Transport',
      name: 'Missing Automatic HTTP-to-HTTPS Redirection',
      severity: 'High',
      evidence: redirectInfo.error
        ? `HTTP probe on port 80 failed: ${redirectInfo.error}`
        : `Port 80 returned HTTP status ${redirectInfo.statusCode} (Location: "${redirectInfo.location || 'none'}").`,
      description: 'Requests initiated over unencrypted HTTP (port 80) are not automatically upgraded to HTTPS via a 301/308 redirect.',
      impact: 'Users typing the domain without https:// may navigate insecurely, exposing initial requests to SSL-stripping attacks.',
      remediation: 'Configure your reverse proxy (Nginx, Apache, or cloud CDN) to issue a 301 redirect from HTTP to HTTPS for all routes.',
      technicalDetails: 'RFC 7230 / RFC 7538 recommendation. Web servers should return 301 Moved Permanently with target https://<domain>$request_uri.',
    });
  }

  // 3. Security Headers & Cookie Audit via Safe HTTPS GET
  let mainResponse = null;
  try {
    mainResponse = await safeHttpGet(`https://${domain}/`, {
      rejectUnauthorized: false,
    });
  } catch (err) {
    // If https:// failed, try http:// as fallback
    try {
      mainResponse = await safeHttpGet(`http://${domain}/`);
    } catch (httpErr) {
      // Endpoint completely unreachable
    }
  }

  if (mainResponse && mainResponse.headers) {
    const headers = mainResponse.headers;

    // Check: Strict-Transport-Security (HSTS)
    const hsts = headers['strict-transport-security'];
    if (!hsts) {
      findings.push({
        category: 'Security Headers',
        name: 'Missing Strict-Transport-Security (HSTS)',
        severity: 'High',
        evidence: 'Strict-Transport-Security header was not returned in the server response.',
        description: 'HSTS instructs browsers to strictly communicate over HTTPS, preventing protocol downgrade and cookie hijacking.',
        impact: 'Vulnerable to active Man-in-the-Middle (MitM) attacks utilizing SSL stripping (e.g. sslstrip).',
        remediation: 'Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload to your server response headers.',
        technicalDetails: 'RFC 6797 standard. Requires max-age of at least 15768000 seconds (recommended 31536000 seconds).',
      });
    } else {
      const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
      const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
      if (maxAge < 10368000) {
        // Less than 120 days
        findings.push({
          category: 'Security Headers',
          name: 'Low HSTS max-age Directive',
          severity: 'Low',
          evidence: `Strict-Transport-Security: ${hsts} (max-age is only ${maxAge} seconds)`,
          description: 'The max-age duration for HSTS is relatively short. Recommended value is at least 31536000 (1 year).',
          impact: 'Browser security policy will expire quickly if the user does not revisit the site within the time window.',
          remediation: 'Increase max-age to 31536000 and consider includeSubDomains.',
          technicalDetails: 'RFC 6797 Section 6.1.1.',
        });
      }
    }

    // Check: Content-Security-Policy (CSP)
    const csp = headers['content-security-policy'];
    if (!csp) {
      findings.push({
        category: 'Security Headers',
        name: 'Missing Content-Security-Policy (CSP)',
        severity: 'High',
        evidence: 'Content-Security-Policy header is absent.',
        description: 'No Content-Security-Policy header was returned. CSP provides defense-in-depth against XSS and data injection.',
        impact: 'If an application vulnerability allows script injection, the browser will execute arbitrary attacker scripts without restriction.',
        remediation: 'Implement a strict CSP restricting default-src, script-src, style-src, and disabling unsafe-inline / unsafe-eval.',
        technicalDetails: 'W3C Content Security Policy Level 3 recommendation.',
      });
    }

    // Check: X-Frame-Options (Clickjacking)
    const xfo = headers['x-frame-options'];
    if (!xfo && (!csp || !csp.includes('frame-ancestors'))) {
      findings.push({
        category: 'Security Headers',
        name: 'Missing Clickjacking Protection (X-Frame-Options)',
        severity: 'Medium',
        evidence: 'Neither X-Frame-Options nor CSP frame-ancestors was found.',
        description: 'The website allows itself to be framed within <iframe> tags on arbitrary third-party web pages.',
        impact: 'Attackers can perform UI redressing (Clickjacking) to trick authenticated users into performing unintended actions.',
        remediation: 'Send X-Frame-Options: DENY or X-Frame-Options: SAMEORIGIN on all HTML responses.',
        technicalDetails: 'RFC 7034 Clickjacking defense specification.',
      });
    }

    // Check: X-Content-Type-Options
    const xcto = headers['x-content-type-options'];
    if (!xcto || xcto.toLowerCase().trim() !== 'nosniff') {
      findings.push({
        category: 'Security Headers',
        name: 'Missing X-Content-Type-Options Header',
        severity: 'Medium',
        evidence: xcto ? `X-Content-Type-Options: ${xcto}` : 'Header not present.',
        description: 'Header instructs the browser to honor the declared Content-Type and refuse MIME-type sniffing.',
        impact: 'Non-executable assets (such as user profile images) could be parsed and executed as scripts or HTML in older browsers.',
        remediation: 'Add X-Content-Type-Options: nosniff to all responses.',
        technicalDetails: 'Fetch Living Standard requirement for MIME confusion mitigation.',
      });
    }

    // Check: Referrer-Policy
    const referrerPolicy = headers['referrer-policy'];
    if (!referrerPolicy) {
      findings.push({
        category: 'Security Headers',
        name: 'Missing Referrer-Policy Header',
        severity: 'Low',
        evidence: 'Referrer-Policy header not configured.',
        description: 'Controls how much referrer information (URL paths, query parameters) is included with navigational requests.',
        impact: 'Sensitive query parameters (e.g. tokens, user IDs, search queries) may be leaked to external links.',
        remediation: 'Add Referrer-Policy: strict-origin-when-cross-origin to response headers.',
        technicalDetails: 'W3C Referrer Policy specification.',
      });
    }

    // Check: Permissions-Policy
    const permissionsPolicy = headers['permissions-policy'] || headers['feature-policy'];
    if (!permissionsPolicy) {
      findings.push({
        category: 'Security Headers',
        name: 'Missing Permissions-Policy Header',
        severity: 'Low',
        evidence: 'Permissions-Policy header not present.',
        description: 'Allows web applications to selectively enable, disable, and modify browser features and hardware APIs (camera, microphone, geolocation).',
        impact: 'Third-party scripts or embedded iframes could request access to device hardware without host application restrictions.',
        remediation: 'Define a Permissions-Policy header, e.g. Permissions-Policy: geolocation=(), camera=(), microphone=().',
        technicalDetails: 'W3C Permissions Policy specification.',
      });
    }

    // Check: Information Disclosure (Server / X-Powered-By)
    const serverHeader = headers['server'];
    const poweredBy = headers['x-powered-by'];
    if (poweredBy || (serverHeader && /\d/.test(serverHeader))) {
      const disclosed = [
        serverHeader ? `Server: ${serverHeader}` : null,
        poweredBy ? `X-Powered-By: ${poweredBy}` : null,
      ]
        .filter(Boolean)
        .join(', ');

      findings.push({
        category: 'Security Headers',
        name: 'Server Technology Version Disclosure',
        severity: 'Low',
        evidence: disclosed,
        description: 'The server reveals specific software names and version numbers in response headers.',
        impact: 'Aids attackers during reconnaissance in mapping exact CVEs and exploit modules targeting the identified version.',
        remediation: 'Disable Server banner tokens (e.g. ServerTokens Prod in Apache, server_tokens off in Nginx) and disable X-Powered-By.',
        technicalDetails: 'CWE-200: Exposure of Sensitive Information to an Unauthorized Actor.',
      });
    }

    // Check: Cookie Security Flags (Set-Cookie)
    const setCookieHeaders = headers['set-cookie'];
    if (setCookieHeaders) {
      const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

      let missingHttpOnly = [];
      let missingSecure = [];
      let missingSameSite = [];

      cookieArray.forEach((cookieStr) => {
        const cookieName = cookieStr.split('=')[0]?.trim() || 'cookie';
        const lower = cookieStr.toLowerCase();

        if (!lower.includes('httponly')) {
          missingHttpOnly.push(cookieName);
        }
        if (!lower.includes('secure')) {
          missingSecure.push(cookieName);
        }
        if (!lower.includes('samesite')) {
          missingSameSite.push(cookieName);
        }
      });

      if (missingHttpOnly.length > 0) {
        findings.push({
          category: 'Cookie Flags',
          name: 'Cookies Missing HttpOnly Attribute',
          severity: 'Critical',
          evidence: `Cookies lacking HttpOnly: ${missingHttpOnly.join(', ')}`,
          description: 'The HttpOnly attribute prevents client-side scripts from accessing cookies via document.cookie.',
          impact: 'If any XSS vulnerability exists, attackers can immediately steal session tokens and hijack user accounts.',
          remediation: 'Configure your application framework to set the HttpOnly flag on all sensitive authentication and session cookies.',
          technicalDetails: 'RFC 6265bis Section 5.4. Mitigates session credential exfiltration.',
        });
      }

      if (missingSecure.length > 0) {
        findings.push({
          category: 'Cookie Flags',
          name: 'Cookies Missing Secure Attribute',
          severity: 'High',
          evidence: `Cookies lacking Secure: ${missingSecure.join(', ')}`,
          description: 'The Secure attribute ensures cookies are only transmitted over encrypted (HTTPS) connections.',
          impact: 'Cookies transmitted over unencrypted HTTP channels can be intercepted in plaintext by network sniffers.',
          remediation: 'Append the Secure directive to all Set-Cookie headers in production.',
          technicalDetails: 'RFC 6265bis Section 5.3.',
        });
      }

      if (missingSameSite.length > 0) {
        findings.push({
          category: 'Cookie Flags',
          name: 'Cookies Missing SameSite Attribute',
          severity: 'Medium',
          evidence: `Cookies lacking SameSite: ${missingSameSite.join(', ')}`,
          description: 'The SameSite attribute controls whether cookies are sent with cross-site requests.',
          impact: 'Increases exposure to Cross-Site Request Forgery (CSRF) and cross-site timing attacks.',
          remediation: 'Set SameSite=Lax (or SameSite=Strict for sensitive endpoints) on all Set-Cookie instructions.',
          technicalDetails: 'RFC 6265bis Section 5.3.7.',
        });
      }
    }
  }

  // 4. Public Resource Checks (robots.txt & sitemap.xml)
  try {
    const robotsRes = await safeHttpGet(`https://${domain}/robots.txt`, { timeout: 4000 });
    if (robotsRes.statusCode === 200 && robotsRes.body) {
      const lines = robotsRes.body.split('\n');
      const sensitiveDisallows = lines.filter((l) => {
        const lower = l.toLowerCase();
        return (
          lower.startsWith('disallow:') &&
          (lower.includes('admin') ||
            lower.includes('login') ||
            lower.includes('private') ||
            lower.includes('backup') ||
            lower.includes('internal') ||
            lower.includes('staging'))
        );
      });

      if (sensitiveDisallows.length > 0) {
        findings.push({
          category: 'Public Resources',
          name: 'Potentially Sensitive Paths Disclosed in robots.txt',
          severity: 'Low',
          evidence: `Found directives: ${sensitiveDisallows.slice(0, 3).map((s) => s.trim()).join(', ')}`,
          description: 'The robots.txt file references sensitive administrative or internal directories under Disallow rules.',
          impact: 'Disallow entries do not restrict access; they advertise sensitive endpoints to attacker reconnaissance tools.',
          remediation: 'Remove internal paths from robots.txt and enforce server-side authentication and IP whitelisting instead.',
          technicalDetails: 'RFC 9309 Robots Exclusion Protocol.',
        });
      }
    }
  } catch (robotsErr) {
    // Non-fatal if robots.txt check fails
  }

  const durationMs = Date.now() - startTime;

  return {
    domain: domain,
    durationMs: durationMs,
    tlsInfo: tlsInfo,
    redirectInfo: redirectInfo,
    findings: findings,
  };
}

module.exports = {
  runPassiveSecurityScan,
  inspectTlsCertificate,
  inspectHttpToHttpsRedirect,
};
