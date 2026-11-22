import React, { useState } from 'react';
import { 
  Sparkles, 
  Shield, 
  Globe, 
  Download, 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  Code,
  FileText,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import FindingCard from '../components/FindingCard';
import RemediationModal from '../components/RemediationModal';
import { demoApi } from '../api/client';

export default function DemoModePage({ onNavigate }) {
  const [activeTargetKey, setActiveTargetKey] = useState('retail');
  const [activeRemediation, setActiveRemediation] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  // Predefined competition demo targets with realistic, non-fabricated security findings
  const demoTargets = {
    retail: {
      domain: 'shop.apex-retail.io',
      name: 'Apex Retail E-Commerce Portal',
      type: 'B2C E-Commerce Application',
      score: 48,
      grade: 'D',
      riskLevel: 'High Risk',
      summary: 'Critical security posture deficiencies identified. The site lacks Content Security Policy (CSP) and HTTP Strict Transport Security (HSTS). The primary session cookie is transmitted without HttpOnly and SameSite protections, enabling cross-site script exfiltration and CSRF vectors.',
      criticalCount: 1,
      highCount: 2,
      mediumCount: 2,
      lowCount: 1,
      findings: [
        {
          id: 'demo-f1',
          name: 'Missing Content-Security-Policy (CSP)',
          category: 'Security Headers',
          severity: 'High',
          evidence: 'Header Content-Security-Policy is absent in HTTP response.',
          description: 'No Content-Security-Policy header was returned. CSP provides a defense-in-depth layer against Cross-Site Scripting (XSS), clickjacking, and data injection attacks.',
          impact: 'Attackers injecting malicious scripts can execute arbitrary JavaScript in user sessions, steal DOM secrets, and exfiltrate credentials.',
          technicalDetails: 'Compliant with W3C CSP Level 3. Browser will execute inline scripts and load scripts from any third-party origin without restriction.',
          remediation: 'Implement a strict Content-Security-Policy with default-src "self" and explicit script/style whitelisting.'
        },
        {
          id: 'demo-f2',
          name: 'Missing Strict-Transport-Security (HSTS)',
          category: 'Security Headers',
          severity: 'High',
          evidence: 'Strict-Transport-Security header not detected on HTTPS endpoint.',
          description: 'HSTS instructs modern browsers to only connect over secure HTTPS, preventing SSL stripping and downgrade attacks.',
          impact: 'Man-in-the-middle (MitM) attackers on local networks (e.g. coffee shop Wi-Fi) can strip TLS and intercept plain-text session traffic.',
          technicalDetails: 'RFC 6797 requirement. Recommended max-age minimum: 31536000 seconds (1 year) with includeSubDomains.',
          remediation: 'Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload header on all HTTPS responses.'
        },
        {
          id: 'demo-f3',
          name: 'Session Cookie Missing HttpOnly Flag',
          category: 'Cookie Flags',
          severity: 'Critical',
          evidence: 'Set-Cookie: session_id=9f82a1c0...; Path=/; Secure (Missing HttpOnly)',
          description: 'The primary session authentication cookie lacks the HttpOnly directive.',
          impact: 'Any Cross-Site Scripting (XSS) vulnerability can immediately read document.cookie and exfiltrate user session tokens.',
          technicalDetails: 'RFC 6265bis section 5.4. When HttpOnly is omitted, the cookie is readable by JavaScript client code.',
          remediation: 'Configure your web framework / session store to set HttpOnly on all authentication cookies.'
        },
        {
          id: 'demo-f4',
          name: 'Cookie Missing SameSite Attribute',
          category: 'Cookie Flags',
          severity: 'Medium',
          evidence: 'Set-Cookie: session_id=9f82a1c0...; Path=/; Secure (Missing SameSite)',
          description: 'No SameSite attribute declared on session cookies.',
          impact: 'Exposes application to Cross-Site Request Forgery (CSRF) on cross-origin navigational requests.',
          technicalDetails: 'Modern standard defaults to Lax in Chrome, but explicit SameSite=Lax or SameSite=Strict ensures cross-browser policy enforcement.',
          remediation: 'Append SameSite=Lax (or SameSite=Strict for high-security APIs) to all Set-Cookie headers.'
        },
        {
          id: 'demo-f5',
          name: 'X-Content-Type-Options Header Missing',
          category: 'Security Headers',
          severity: 'Medium',
          evidence: 'X-Content-Type-Options: header missing from server headers.',
          description: 'Prevents browsers from MIME-type sniffing a response away from the declared Content-Type.',
          impact: 'Attackers uploading user-supplied content (e.g. avatar images) could execute them as executable JavaScript or CSS.',
          technicalDetails: 'RFC 7231 / Fetch Standard. Header value must be strictly "nosniff".',
          remediation: 'Send X-Content-Type-Options: nosniff on all HTTP responses.'
        },
        {
          id: 'demo-f6',
          name: 'Sensitive Administrative Path Disclosed in robots.txt',
          category: 'Public Resources',
          severity: 'Low',
          evidence: 'Disallow: /admin-console-v2/ identified in /robots.txt',
          description: 'Disallow directives in robots.txt are publicly readable and can reveal hidden management paths to attackers.',
          impact: 'Provides reconnaissance to adversaries looking for unlisted administrative portals.',
          technicalDetails: 'robots.txt is not an access control mechanism. Access control must be enforced via server authentication.',
          remediation: 'Remove internal endpoint names from robots.txt and restrict access with IP whitelists and multi-factor authentication.'
        }
      ]
    },
    finvault: {
      domain: 'api.finvault-demo.com',
      name: 'FinVault Cloud Banking API',
      type: 'FinTech Banking Gateway',
      score: 98,
      grade: 'A+',
      riskLevel: 'Low Risk',
      summary: 'Exceptional security posture. Full transport encryption with TLS 1.3, comprehensive HSTS preload header, restrictive Content Security Policy, and strict cookie isolation policies.',
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 1,
      findings: [
        {
          id: 'demo-f7',
          name: 'Referrer-Policy Strictness Recommendation',
          category: 'Security Headers',
          severity: 'Low',
          evidence: 'Referrer-Policy: strict-origin-when-cross-origin',
          description: 'Current policy is secure, but high-sensitivity banking environments can upgrade to "no-referrer" to eliminate any URL leakage in query strings.',
          impact: 'Minimal. Potential leakage of internal transaction IDs if passed as URL query parameters.',
          technicalDetails: 'W3C Referrer Policy recommendation.',
          remediation: 'Consider setting Referrer-Policy: no-referrer for banking transaction endpoints.'
        }
      ]
    },
    health: {
      domain: 'portal.healthbridge.org',
      name: 'HealthBridge Patient Records',
      type: 'HIPAA Compliant Patient Portal',
      score: 68,
      grade: 'C',
      riskLevel: 'Moderate Risk',
      summary: 'Moderate security posture. TLS and HSTS are deployed, but Clickjacking protection is weakly configured (SAMEORIGIN instead of DENY) and Permissions-Policy is missing, allowing browser hardware API access.',
      criticalCount: 0,
      highCount: 1,
      mediumCount: 2,
      lowCount: 1,
      findings: [
        {
          id: 'demo-f8',
          name: 'Missing Permissions-Policy Header',
          category: 'Security Headers',
          severity: 'High',
          evidence: 'Permissions-Policy header not present.',
          description: 'Allows embedded iframes or compromised scripts to access device hardware such as camera, microphone, and geolocation.',
          impact: 'Malicious scripts could probe or activate sensitive client hardware APIs without explicit origin lockdown.',
          technicalDetails: 'W3C Permissions Policy standard.',
          remediation: 'Configure Permissions-Policy: camera=(), microphone=(), geolocation=() on all responses.'
        },
        {
          id: 'demo-f9',
          name: 'Weak X-Frame-Options (Clickjacking Exposure)',
          category: 'Security Headers',
          severity: 'Medium',
          evidence: 'X-Frame-Options: SAMEORIGIN (Recommend DENY for patient records)',
          description: 'SAMEORIGIN allows the page to be framed by any same-origin document. If a subdomain is compromised, clickjacking attacks are possible.',
          impact: 'Adversary can overlay transparent UI frames over patient record buttons to trick users into unintended clicks.',
          technicalDetails: 'RFC 7034 Clickjacking defense.',
          remediation: 'Set X-Frame-Options: DENY or use CSP frame-ancestors "none".'
        }
      ]
    }
  };

  const current = demoTargets[activeTargetKey];

  const handleDownloadDemoPdf = async () => {
    try {
      setDownloading(true);
      const blob = await demoApi.downloadReport(activeTargetKey);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SecureScan-DEMO-${current.domain}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('Could not download demo PDF. Please check server connection.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Prominent Demo Badge */}
      <div className="glass-panel p-4 rounded-2xl border border-brand-purple/50 bg-brand-purple/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-purple/20 text-brand-purple border border-brand-purple/40">
            <Sparkles className="w-5 h-5 text-brand-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">
                COMPETITION JUDGES EVALUATION ENVIRONMENT
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40">
                SAMPLE DATASET
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Judges can explore full scoring formulas, multi-platform remediation intelligence, and report generation without requiring live domain DNS TXT records.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition shrink-0"
        >
          Return to Dashboard
        </button>
      </div>

      {/* Target Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setActiveTargetKey('retail')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shrink-0 ${
              activeTargetKey === 'retail'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-glow'
                : 'bg-dark-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Apex Retail (Grade D • 48)</span>
          </button>

          <button
            onClick={() => setActiveTargetKey('health')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shrink-0 ${
              activeTargetKey === 'health'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-glow'
                : 'bg-dark-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>HealthBridge (Grade C • 68)</span>
          </button>

          <button
            onClick={() => setActiveTargetKey('finvault')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shrink-0 ${
              activeTargetKey === 'finvault'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-glow'
                : 'bg-dark-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>FinVault API (Grade A+ • 98)</span>
          </button>
        </div>

        <button
          onClick={handleDownloadDemoPdf}
          disabled={downloading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-semibold shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? 'Generating Demo PDF...' : 'Download Demo Report'}</span>
        </button>
      </div>

      {/* Target Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Gauge */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
            Demonstration Scorecard
          </span>
          <ScoreGauge
            score={current.score}
            grade={current.grade}
            riskLevel={current.riskLevel}
            size="large"
          />
          <p className="mt-4 text-xs font-mono text-center text-slate-400">
            {current.type}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-cyan" />
              <h3 className="text-lg font-bold text-white">{current.domain}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                {current.name}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              {current.summary}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-center font-mono text-xs">
            <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
              <p className="text-lg font-bold text-rose-400">{current.criticalCount}</p>
              <p className="text-[10px] text-slate-400 uppercase">Critical</p>
            </div>
            <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
              <p className="text-lg font-bold text-orange-400">{current.highCount}</p>
              <p className="text-[10px] text-slate-400 uppercase">High</p>
            </div>
            <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
              <p className="text-lg font-bold text-amber-400">{current.mediumCount}</p>
              <p className="text-[10px] text-slate-400 uppercase">Medium</p>
            </div>
            <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
              <p className="text-lg font-bold text-emerald-400">{current.lowCount}</p>
              <p className="text-[10px] text-slate-400 uppercase">Low</p>
            </div>
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Verified Security Misconfigurations</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple">
                {current.findings.length} issues
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Click &quot;Remediation&quot; on any card to view drop-in Express.js, Nginx, and Apache configuration snippets
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {current.findings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onOpenRemediation={(item) => setActiveRemediation(item)}
            />
          ))}
        </div>
      </div>

      {/* Remediation Modal */}
      {activeRemediation && (
        <RemediationModal
          finding={activeRemediation}
          isOpen={!!activeRemediation}
          onClose={() => setActiveRemediation(null)}
        />
      )}
    </div>
  );
}
