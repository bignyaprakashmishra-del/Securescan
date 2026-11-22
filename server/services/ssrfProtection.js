// SecureScan SSRF Protection Engine
// Comprehensive IP Validation, DNS Resolution, Pinning, and Safe Request Dispatcher

const dns = require('dns').promises;
const net = require('net');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { SCANNER, METADATA_IPS } = require('../config/constants');

/**
 * Checks whether an IPv4 address is in a private, loopback, link-local, carrier-NAT, or reserved range.
 */
function isBlockedIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed is treated as blocked
  }

  const [b0, b1, b2, b3] = parts;

  // 0.0.0.0/8 Current network
  if (b0 === 0) return true;

  // 127.0.0.0/8 Loopback
  if (b0 === 127) return true;

  // 10.0.0.0/8 Private network (RFC 1918)
  if (b0 === 10) return true;

  // 172.16.0.0/12 Private network (172.16.0.0 - 172.31.255.255)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

  // 192.168.0.0/16 Private network
  if (b0 === 192 && b1 === 168) return true;

  // 169.254.0.0/16 Link-Local / Cloud Metadata (169.254.169.254)
  if (b0 === 169 && b1 === 254) return true;

  // 100.64.0.0/10 Shared Address Space / Carrier-Grade NAT (100.64.0.0 - 100.127.255.255)
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

  // 192.0.0.0/24 IETF Protocol Assignments
  if (b0 === 192 && b1 === 0 && b2 === 0) return true;

  // 192.0.2.0/24 TEST-NET-1
  if (b0 === 192 && b1 === 0 && b2 === 2) return true;

  // 198.18.0.0/15 Network Benchmark Testing
  if (b0 === 198 && (b1 === 18 || b1 === 19)) return true;

  // 198.51.100.0/24 TEST-NET-2
  if (b0 === 198 && b1 === 51 && b2 === 100) return true;

  // 203.0.113.0/24 TEST-NET-3
  if (b0 === 203 && b1 === 0 && b2 === 113) return true;

  // 224.0.0.0/4 Multicast (224.0.0.0 - 239.255.255.255)
  if (b0 >= 224 && b0 <= 239) return true;

  // 240.0.0.0/4 Reserved (240.0.0.0 - 255.255.255.254)
  if (b0 >= 240) return true;

  // Broadcast
  if (b0 === 255 && b1 === 255 && b2 === 255 && b3 === 255) return true;

  return false;
}

/**
 * Checks whether an IPv6 address is in a blocked, unique local, link-local, loopback, or mapped IPv4 range.
 */
function isBlockedIPv6(ip) {
  const normalized = ip.toLowerCase().trim();

  // Loopback (::1)
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;

  // Unspecified (::)
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;

  // Unique local addresses fc00::/7 (fc00:: to fdff::)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  // Link-local unicast fe80::/10 (fe80:: to febf::)
  if (
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  ) {
    return true;
  }

  // Multicast ff00::/8
  if (normalized.startsWith('ff')) return true;

  // IPv4-mapped IPv6 ::ffff:a.b.c.d
  if (normalized.includes('::ffff:')) {
    const ipv4Part = normalized.split('::ffff:')[1];
    if (net.isIPv4(ipv4Part)) {
      return isBlockedIPv4(ipv4Part);
    }
    return true;
  }

  // Check specific metadata IPs
  if (METADATA_IPS.includes(normalized)) return true;

  return false;
}

/**
 * Validates any single IP address. Returns true if SAFE, false if BLOCKED.
 */
function isSafeIP(ip) {
  if (net.isIPv4(ip)) {
    return !isBlockedIPv4(ip);
  }
  if (net.isIPv6(ip)) {
    return !isBlockedIPv6(ip);
  }
  return false; // Not a valid IP
}

/**
 * Resolves all IPv4 and IPv6 addresses for a domain name and verifies that NONE are private or blocked.
 * Returns an array of safe IP addresses. Throws an error if any address is blocked or unresolvable.
 */
async function resolveAndValidateDomain(domain) {
  // Reject IP literals provided as domain names
  if (net.isIP(domain)) {
    throw new Error(`SSRF Protection: Direct IP literals (${domain}) are prohibited. Provide an FQDN.`);
  }

  let addresses = [];

  try {
    const ipv4 = await dns.resolve4(domain);
    addresses = addresses.concat(ipv4);
  } catch (err) {
    // IPv4 resolve might fail if only IPv6 exists
  }

  try {
    const ipv6 = await dns.resolve6(domain);
    addresses = addresses.concat(ipv6);
  } catch (err) {
    // IPv6 resolve might fail if only IPv4 exists
  }

  if (addresses.length === 0) {
    throw new Error(`DNS Resolution failed: No A or AAAA records found for domain '${domain}'.`);
  }

  // Inspect EVERY resolved IP address
  for (const ip of addresses) {
    if (!isSafeIP(ip)) {
      throw new Error(
        `SSRF Protection Violation: Domain '${domain}' resolved to prohibited/internal IP address (${ip}). Scanning aborted.`
      );
    }
  }

  return addresses;
}

/**
 * Dispatches a safe HTTP/HTTPS GET request with:
 * 1. Pinned DNS resolution (connects to validated IP while preserving SNI and Host headers).
 * 2. Strict timeout enforcement.
 * 3. Strict response body size capping.
 * 4. Safe redirect chain validation (re-validates every redirect destination).
 */
async function safeHttpGet(targetUrl, options = {}, redirectCount = 0) {
  if (redirectCount > SCANNER.MAX_REDIRECTS) {
    throw new Error(`Exceeded maximum redirect limit (${SCANNER.MAX_REDIRECTS}).`);
  }

  const parsedUrl = new URL(targetUrl);

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error(`Prohibited protocol: ${parsedUrl.protocol}. Only http: and https: are allowed.`);
  }

  const hostname = parsedUrl.hostname;

  // Resolve and validate all destination IPs
  const safeIPs = await resolveAndValidateDomain(hostname);
  const pinnedIP = safeIPs[0]; // Pin the first validated IP for connection

  const isHttps = parsedUrl.protocol === 'https:';
  const defaultPort = isHttps ? 443 : 80;
  const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : defaultPort;

  return new Promise((resolve, reject) => {
    let timer;
    let bodyBuffer = '';
    let totalBytes = 0;

    const requestOptions = {
      protocol: parsedUrl.protocol,
      host: pinnedIP, // Connect directly to validated IP (prevents DNS rebinding)
      port: port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        Host: hostname, // Maintain standard Host header
        'User-Agent': SCANNER.USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'identity', // Avoid compressed streams for simple inspection
        ...options.headers,
      },
      // For HTTPS, preserve Server Name Indication (SNI) for the original hostname
      servername: hostname,
      rejectUnauthorized: options.rejectUnauthorized !== false, // Default to strict TLS verification
    };

    const client = isHttps ? https : http;

    const req = client.request(requestOptions, async (res) => {
      clearTimeout(timer);

      // Handle Redirects (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        req.destroy();
        const nextUrl = new URL(res.headers.location, targetUrl).toString();
        try {
          const redirectRes = await safeHttpGet(nextUrl, options, redirectCount + 1);
          resolve({
            ...redirectRes,
            redirectHistory: [
              {
                from: targetUrl,
                to: nextUrl,
                statusCode: res.statusCode,
              },
              ...(redirectRes.redirectHistory || []),
            ],
          });
        } catch (redirErr) {
          reject(redirErr);
        }
        return;
      }

      res.on('data', (chunk) => {
        totalBytes += chunk.length;
        if (totalBytes <= SCANNER.MAX_RESPONSE_BYTES) {
          bodyBuffer += chunk.toString('utf8');
        } else {
          // If response exceeds 1MB limit, stop reading further chunks safely
          req.destroy();
        }
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          rawHeaders: res.rawHeaders,
          body: bodyBuffer,
          httpVersion: res.httpVersion,
          finalUrl: targetUrl,
          pinnedIP: pinnedIP,
          redirectHistory: [],
        });
      });
    });

    // Timeout enforcement
    timer = setTimeout(() => {
      req.destroy();
      reject(new Error(`Connection timed out after ${SCANNER.TIMEOUT_MS}ms.`));
    }, options.timeout || SCANNER.TIMEOUT_MS);

    req.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    req.end();
  });
}

module.exports = {
  isBlockedIPv4,
  isBlockedIPv6,
  isSafeIP,
  resolveAndValidateDomain,
  safeHttpGet,
};
