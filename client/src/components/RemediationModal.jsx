import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ShieldAlert, BookOpen, Layers } from 'lucide-react';

export default function RemediationModal({ finding, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('express');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !finding) return null;

  // Generate real server-specific snippets based on the finding
  const getFixSnippets = (item) => {
    const name = item.name?.toLowerCase() || '';

    // Content Security Policy
    if (name.includes('content-security-policy') || name.includes('csp')) {
      return {
        express: `// Express.js with Helmet\nconst helmet = require('helmet');\napp.use(\n  helmet.contentSecurityPolicy({\n    directives: {\n      defaultSrc: ["'self'"],\n      scriptSrc: ["'self'"],\n      styleSrc: ["'self'", "'unsafe-inline'"],\n      imgSrc: ["'self'", "data:", "https:"],\n      connectSrc: ["'self'"],\n      objectSrc: ["'none'"],\n      upgradeInsecureRequests: [],\n    },\n  })\n);`,
        nginx: `# Nginx Configuration (inside server block)\nadd_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none';" always;`,
        apache: `# Apache Configuration (.htaccess or VirtualHost)\n<IfModule mod_headers.c>\n    Header set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none';"\n</IfModule>`
      };
    }

    // Strict-Transport-Security (HSTS)
    if (name.includes('strict-transport-security') || name.includes('hsts')) {
      return {
        express: `// Express.js with Helmet\nconst helmet = require('helmet');\napp.use(\n  helmet.hsts({\n    maxAge: 31536000, // 1 year in seconds\n    includeSubDomains: true,\n    preload: true,\n  })\n);`,
        nginx: `# Nginx Configuration\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;`,
        apache: `# Apache Configuration\n<IfModule mod_headers.c>\n    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"\n</IfModule>`
      };
    }

    // X-Content-Type-Options
    if (name.includes('x-content-type-options') || name.includes('sniff')) {
      return {
        express: `// Express.js with Helmet or custom middleware\nconst helmet = require('helmet');\napp.use(helmet.noSniff());\n\n// Or raw Express middleware:\napp.use((req, res, next) => {\n  res.setHeader('X-Content-Type-Options', 'nosniff');\n  next();\n});`,
        nginx: `# Nginx Configuration\nadd_header X-Content-Type-Options "nosniff" always;`,
        apache: `# Apache Configuration\n<IfModule mod_headers.c>\n    Header set X-Content-Type-Options "nosniff"\n</IfModule>`
      };
    }

    // X-Frame-Options (Clickjacking)
    if (name.includes('x-frame-options') || name.includes('frame') || name.includes('clickjack')) {
      return {
        express: `// Express.js with Helmet\nconst helmet = require('helmet');\napp.use(helmet.frameguard({ action: 'deny' }));\n\n// Or raw middleware:\napp.use((req, res, next) => {\n  res.setHeader('X-Frame-Options', 'DENY');\n  next();\n});`,
        nginx: `# Nginx Configuration\nadd_header X-Frame-Options "DENY" always;`,
        apache: `# Apache Configuration\n<IfModule mod_headers.c>\n    Header always set X-Frame-Options "DENY"\n</IfModule>`
      };
    }

    // Referrer-Policy
    if (name.includes('referrer-policy')) {
      return {
        express: `// Express.js with Helmet\nconst helmet = require('helmet');\napp.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));`,
        nginx: `# Nginx Configuration\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;`,
        apache: `# Apache Configuration\n<IfModule mod_headers.c>\n    Header set Referrer-Policy "strict-origin-when-cross-origin"\n</IfModule>`
      };
    }

    // Permissions-Policy
    if (name.includes('permissions-policy') || name.includes('feature-policy')) {
      return {
        express: `// Express.js Permissions-Policy middleware\napp.use((req, res, next) => {\n  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');\n  next();\n});`,
        nginx: `# Nginx Configuration\nadd_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;`,
        apache: `# Apache Configuration\n<IfModule mod_headers.c>\n    Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"\n</IfModule>`
      };
    }

    // Cookies (Secure, HttpOnly, SameSite)
    if (name.includes('cookie') || name.includes('httponly') || name.includes('samesite')) {
      return {
        express: `// Express-session cookie configuration\napp.use(session({\n  secret: process.env.SESSION_SECRET,\n  cookie: {\n    httpOnly: true,\n    secure: true, // Requires HTTPS\n    sameSite: 'lax', // or 'strict'\n    maxAge: 24 * 60 * 60 * 1000 // 24 hours\n  }\n}));`,
        nginx: `# Nginx proxy cookie flag injection\nproxy_cookie_path / "/; Secure; HttpOnly; SameSite=Lax";`,
        apache: `# Apache cookie flag injection via mod_headers\n<IfModule mod_headers.c>\n    Header edit Set-Cookie ^(.*)$ "$1; HttpOnly; Secure; SameSite=Lax"\n</IfModule>`
      };
    }

    // HTTPS / TLS / Redirect
    if (name.includes('https') || name.includes('tls') || name.includes('redirect')) {
      return {
        express: `// Express.js enforce HTTPS middleware\napp.use((req, res, next) => {\n  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {\n    return res.redirect(301, \`https://\${req.hostname}\${req.url}\`);\n  }\n  next();\n});`,
        nginx: `# Nginx HTTP to HTTPS 301 Permanent Redirect\nserver {\n    listen 80;\n    server_name yourdomain.com www.yourdomain.com;\n    return 301 https://$host$request_uri;\n}`,
        apache: `# Apache Rewrite rule in .htaccess\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`
      };
    }

    // Default / Public resource security
    return {
      express: `// Generic Express.js Security Configuration\nconst helmet = require('helmet');\napp.use(helmet());\napp.disable('x-powered-by');`,
      nginx: `# Generic Nginx Server Hardening\nserver_tokens off;\nadd_header X-Content-Type-Options "nosniff" always;`,
      apache: `# Apache Hardening\nServerSignature Off\nServerTokens Prod`
    };
  };

  const snippets = getFixSnippets(finding);
  const currentSnippet = snippets[activeTab] || snippets.express;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                Remediation Intelligence
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {finding.category}
              </span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-white tracking-tight">
              {finding.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Why It Matters */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-cyan flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Why This Issue Matters
            </h4>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed bg-dark-900/60 p-3.5 rounded-xl border border-slate-800">
              {finding.description}
            </p>
          </div>

          {/* Attacker Exploit Scenario */}
          {finding.impact && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Exploit & Threat Vector
              </h4>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed bg-rose-500/5 p-3.5 rounded-xl border border-rose-500/20">
                {finding.impact}
              </p>
            </div>
          )}

          {/* Step by Step Remediation Guidance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Remediation Strategy
            </h4>
            <p className="mt-2 text-sm text-slate-300">
              {finding.remediation}
            </p>
          </div>

          {/* Server Config Tabs & Code Block */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('express')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                    activeTab === 'express'
                      ? 'bg-brand-blue text-white shadow-glow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  Express.js (Node)
                </button>
                <button
                  onClick={() => setActiveTab('nginx')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                    activeTab === 'nginx'
                      ? 'bg-brand-blue text-white shadow-glow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  Nginx
                </button>
                <button
                  onClick={() => setActiveTab('apache')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                    activeTab === 'apache'
                      ? 'bg-brand-blue text-white shadow-glow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  Apache
                </button>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Fix</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Box */}
            <div className="mt-3 relative rounded-xl bg-dark-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
              <pre className="whitespace-pre">{currentSnippet}</pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-dark-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
