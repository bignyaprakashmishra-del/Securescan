// SecureScan Remediation Intelligence Service
// Multi-platform hardening snippets for Express.js, Nginx, and Apache

const REMEDIATION_KNOWLEDGE_BASE = {
  csp: {
    category: 'Security Headers',
    whyItMatters:
      'Content-Security-Policy (CSP) is the single most effective HTTP response header for preventing Cross-Site Scripting (XSS), clickjacking, and arbitrary code injection in modern browsers.',
    attackerExploit:
      'Without CSP, any stored or reflected XSS flaw allows an attacker to inject <script> tags, execute malicious code in the victim\'s browser, read DOM storage, and exfiltrate authentication tokens.',
    express: `// Express.js with Helmet\nconst helmet = require('helmet');\n\napp.use(\n  helmet.contentSecurityPolicy({\n    directives: {\n      defaultSrc: ["'self'"],\n      scriptSrc: ["'self'"],\n      styleSrc: ["'self'", "'unsafe-inline'"],\n      imgSrc: ["'self'", "data:", "https:"],\n      connectSrc: ["'self'"],\n      objectSrc: ["'none'"],\n      upgradeInsecureRequests: [],\n    },\n  })\n);`,
    nginx: `# Nginx Configuration (inside server or location block)\nadd_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none'; upgrade-insecure-requests;" always;`,
    apache: `# Apache Configuration (.htaccess or VirtualHost)\n<IfModule mod_headers.c>\n    Header set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none'; upgrade-insecure-requests;"\n</IfModule>`,
  },

  hsts: {
    category: 'Security Headers',
    whyItMatters:
      'HTTP Strict Transport Security (HSTS) mandates that browsers only establish HTTPS connections to the domain, mitigating SSL-stripping attacks and man-in-the-middle interception.',
    attackerExploit:
      'An adversary on an untrusted local network can intercept the initial HTTP request, strip TLS, and proxy plain HTTP to the client while communicating securely with the server, reading credentials in cleartext.',
    express: `// Express.js with Helmet\nconst helmet = require('helmet');\n\napp.use(\n  helmet.hsts({\n    maxAge: 31536000, // 1 year in seconds\n    includeSubDomains: true,\n    preload: true,\n  })\n);`,
    nginx: `# Nginx Configuration\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;`,
    apache: `# Apache Configuration\n<IfModule mod_headers.c>\n    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"\n</IfModule>`,
  },

  xfo: {
    category: 'Security Headers',
    whyItMatters:
      'X-Frame-Options instructs the browser whether a page can be rendered inside an <iframe>, <frame>, or <object> element, preventing UI Redressing / Clickjacking.',
    attackerExploit:
      'Attackers embed your site in a transparent iframe on a malicious webpage, positioning buttons beneath the cursor to deceive users into initiating money transfers, password resets, or account deletions.',
    express: `// Express.js with Helmet\nconst helmet = require('helmet');\n\napp.use(helmet.frameguard({ action: 'deny' }));`,
    nginx: `# Nginx Configuration\nadd_header X-Frame-Options "DENY" always;`,
    apache: `# Apache Configuration\n<IfModule mod_headers.c>\n    Header always set X-Frame-Options "DENY"\n</IfModule>`,
  },

  xcto: {
    category: 'Security Headers',
    whyItMatters:
      'X-Content-Type-Options: nosniff forces browsers to respect the MIME types advertised in Content-Type headers rather than sniffing content.',
    attackerExploit:
      'An attacker uploading a malicious executable disguised as an image (.jpg) could trigger arbitrary JavaScript execution if the browser sniffs the file as text/html.',
    express: `// Express.js with Helmet\nconst helmet = require('helmet');\n\napp.use(helmet.noSniff());`,
    nginx: `# Nginx Configuration\nadd_header X-Content-Type-Options "nosniff" always;`,
    apache: `# Apache Configuration\n<IfModule mod_headers.c>\n    Header set X-Content-Type-Options "nosniff"\n</IfModule>`,
  },

  cookies: {
    category: 'Cookie Flags',
    whyItMatters:
      'Cookie flags (HttpOnly, Secure, SameSite) provide essential browser-enforced isolation for session tokens and authorization cookies.',
    attackerExploit:
      'Omitting HttpOnly allows XSS scripts to steal session credentials via document.cookie. Omitting Secure allows sniffing over unencrypted channels. Omitting SameSite enables Cross-Site Request Forgery (CSRF).',
    express: `// Express session cookie configuration\napp.use(session({\n  secret: process.env.SESSION_SECRET,\n  cookie: {\n    httpOnly: true,\n    secure: process.env.NODE_ENV === 'production', // true for HTTPS\n    sameSite: 'lax',\n    maxAge: 24 * 60 * 60 * 1000 // 24 hours\n  }\n}));`,
    nginx: `# Nginx Reverse Proxy cookie flag injection\nproxy_cookie_path / "/; Secure; HttpOnly; SameSite=Lax";`,
    apache: `# Apache mod_headers Set-Cookie edit\n<IfModule mod_headers.c>\n    Header edit Set-Cookie ^(.*)$ "$1; HttpOnly; Secure; SameSite=Lax"\n</IfModule>`,
  },
};

function getRemediationDetails(findingName = '') {
  const lower = findingName.toLowerCase();
  if (lower.includes('csp') || lower.includes('content-security-policy')) {
    return REMEDIATION_KNOWLEDGE_BASE.csp;
  }
  if (lower.includes('hsts') || lower.includes('strict-transport-security')) {
    return REMEDIATION_KNOWLEDGE_BASE.hsts;
  }
  if (lower.includes('frame') || lower.includes('clickjack')) {
    return REMEDIATION_KNOWLEDGE_BASE.xfo;
  }
  if (lower.includes('content-type') || lower.includes('sniff')) {
    return REMEDIATION_KNOWLEDGE_BASE.xcto;
  }
  if (lower.includes('cookie') || lower.includes('httponly') || lower.includes('samesite')) {
    return REMEDIATION_KNOWLEDGE_BASE.cookies;
  }
  return REMEDIATION_KNOWLEDGE_BASE.csp;
}

module.exports = {
  REMEDIATION_KNOWLEDGE_BASE,
  getRemediationDetails,
};
