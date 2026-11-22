import React from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Zap, 
  FileText, 
  GitCompare, 
  Lock, 
  Terminal, 
  Server, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';

export default function LandingPage({ onNavigate }) {
  const { enableDemoMode } = useDemo();

  const handleLaunchDemo = () => {
    enableDemoMode();
    onNavigate('demo');
  };

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden">
        {/* Glow backdrop blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-purple/20 via-brand-blue/20 to-brand-cyan/20 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-brand-purple/40 text-xs font-mono text-brand-purple mb-8 shadow-glow-purple">
            <Shield className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Non-Destructive • Passive Security Intelligence • Zero-Exploit</span>
          </div>

          {/* Master Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Know Your Website&apos;s Security <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan bg-clip-text text-transparent">
              Before Attackers Do.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            An explainable web security assessment platform that identifies security misconfigurations, evaluates risk, and recommends actionable fixes.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold text-base shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-mono text-sm border border-brand-cyan/30 shadow-glow-cyan transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-brand-cyan" />
              <span>Explore Demo Mode</span>
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-slate-300 hover:text-white font-medium text-sm transition"
            >
              Sign In
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Security Checks</span>
              <p className="text-xl font-bold font-mono text-white mt-1">15+ Genuine Audits</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Headers, TLS, Cookies & Assets</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Scoring Engine</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">100-Point Formula</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Transparent point deductions</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">SSRF Protection</span>
              <p className="text-xl font-bold font-mono text-brand-cyan mt-1">Pinned DNS Rebinding</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Blocks private & cloud IPs</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Remediation Code</span>
              <p className="text-xl font-bold font-mono text-brand-purple mt-1">3 Server Platforms</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Express, Nginx, and Apache</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="features" className="py-20 bg-dark-900/60 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-blue">
              Comprehensive Analysis
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Real Security Intelligence. Zero Guesswork.
            </h2>
            <p className="mt-3 text-slate-300 text-sm sm:text-base">
              SecureScan is engineered for precision. We execute genuine non-invasive HTTP, TLS, header, and configuration audits against your target domains.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-purple/40 transition">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-brand-purple mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">HTTPS & Transport Security</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Verifies full HTTPS availability, HTTP-to-HTTPS redirect enforcement, TLS certificate validity, issuer metadata, and days to expiration.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-blue/40 transition">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center text-brand-blue mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Defense-in-Depth Headers</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Audits Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-cyan/40 transition">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan mb-4">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Cookie Flag Forensics</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Validates critical protection flags across all Set-Cookie directives: HttpOnly (blocks XSS exfiltration), Secure (HTTPS only), and SameSite (CSRF mitigation).
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-purple/40 transition">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-brand-purple mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">SSRF-Hardened Scanner Engine</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Full protection against internal network attacks: pins validated IPs, enforces redirect policies, rejects private/cloud metadata ranges, and mitigates DNS rebinding.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-blue/40 transition">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center text-brand-blue mb-4">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Scan Comparison & Diffing</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Track security posture over time. Compare any two scans to see resolved misconfigurations, newly introduced vulnerabilities, and net score changes.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-cyan/40 transition">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Executive PDF Reports</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Generate competition-grade, downloadable PDF audit reports featuring executive risk summaries, evidence logs, technical explanations, and remediation guides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-cyan">
              Engine Workflow
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How SecureScan Works
            </h2>
            <p className="mt-3 text-slate-300 text-sm">
              From cryptographic domain ownership verification to actionable remediation in three simple steps.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-white mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-white">Domain Ownership Verification</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Add your domain and insert a custom DNS TXT token (<span className="text-brand-cyan font-mono">_securescan-challenge</span>) to guarantee authorization before any scan is permitted.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-white mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-white">Passive Security Audit</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                The engine dispatches non-destructive GET probes to evaluate transport encryption, browser security headers, cookie flags, and metadata files without attacking the host.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-white mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-white">Score & Remediation</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Receive an explainable 100-point security grade with precise point deduction reasons and drop-in code snippets for Express.js, Nginx, and Apache.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Checks Detailed Overview */}
      <section className="py-20 bg-dark-900/60 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-purple">
              Protocol Specs
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
              Passive Security Checks Executed
            </h2>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-slate-800 glass-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-dark-950/80 text-xs uppercase font-mono text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Security Check</th>
                    <th className="px-6 py-4">Standard / RFC</th>
                    <th className="px-6 py-4">Severity Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
                  <tr>
                    <td className="px-6 py-3.5 text-brand-cyan font-semibold">Transport</td>
                    <td className="font-sans text-white font-medium">HTTPS Availability & Strict Redirection</td>
                    <td className="text-slate-400">RFC 2818 / RFC 7230</td>
                    <td><span className="text-rose-400 font-bold">Critical (-25 pts)</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 text-brand-cyan font-semibold">Transport</td>
                    <td className="font-sans text-white font-medium">TLS Certificate Validity & Expiry Lifespan</td>
                    <td className="text-slate-400">RFC 5280 / X.509</td>
                    <td><span className="text-orange-400 font-bold">High (-15 pts)</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 text-brand-purple font-semibold">Headers</td>
                    <td className="font-sans text-white font-medium">Strict-Transport-Security (HSTS)</td>
                    <td className="text-slate-400">RFC 6797</td>
                    <td><span className="text-orange-400 font-bold">High (-15 pts)</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 text-brand-purple font-semibold">Headers</td>
                    <td className="font-sans text-white font-medium">Content-Security-Policy (CSP)</td>
                    <td className="text-slate-400">W3C CSP Level 3</td>
                    <td><span className="text-orange-400 font-bold">High (-15 pts)</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 text-brand-purple font-semibold">Headers</td>
                    <td className="font-sans text-white font-medium">X-Frame-Options (Clickjacking Protection)</td>
                    <td className="text-slate-400">RFC 7034</td>
                    <td><span className="text-amber-400 font-bold">Medium (-8 pts)</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 text-brand-purple font-semibold">Headers</td>
                    <td className="font-sans text-white font-medium">X-Content-Type-Options (MIME Sniffing)</td>
                    <td className="text-slate-400">Fetch Living Standard</td>
                    <td><span className="text-amber-400 font-bold">Medium (-8 pts)</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 text-brand-blue font-semibold">Cookies</td>
                    <td className="font-sans text-white font-medium">HttpOnly, Secure, & SameSite Flags</td>
                    <td className="text-slate-400">RFC 6265bis</td>
                    <td><span className="text-amber-400 font-bold">Medium (-8 pts each)</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 text-emerald-400 font-semibold">Public Assets</td>
                    <td className="font-sans text-white font-medium">robots.txt & sitemap.xml Exposure Audit</td>
                    <td className="text-slate-400">RFC 9309 (REP)</td>
                    <td><span className="text-emerald-400 font-bold">Low / Info (0-3 pts)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass-panel p-10 rounded-3xl border border-brand-purple/40 shadow-glow-purple">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to assess your application&apos;s security?
            </h2>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
              Create an account or launch Demo Mode to test the explainable intelligence platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold text-sm shadow-glow hover:opacity-95 transition"
              >
                Create Free Account
              </button>
              <button
                onClick={handleLaunchDemo}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800 text-brand-cyan font-mono text-sm border border-brand-cyan/40 hover:bg-slate-700 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Demo Mode</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-dark-950 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-cyan" />
            <span className="font-semibold text-slate-300">SecureScan Platform</span>
            <span>— Competition Edition</span>
          </div>
          <p className="text-center sm:text-right">
            Designed for Web Application Security Intelligence &amp; Responsible Auditing.
          </p>
        </div>
      </footer>
    </div>
  );
}
