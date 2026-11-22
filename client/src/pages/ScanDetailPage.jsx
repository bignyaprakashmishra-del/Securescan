import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Calendar, 
  Clock, 
  Download, 
  GitCompare, 
  ArrowLeft, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  Filter, 
  HelpCircle,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import FindingCard from '../components/FindingCard';
import RemediationModal from '../components/RemediationModal';
import { scansApi } from '../api/client';

export default function ScanDetailPage({ scanId, onNavigate, onCompareScans }) {
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal
  const [activeRemediation, setActiveRemediation] = useState(null);

  useEffect(() => {
    if (scanId) {
      loadScanDetails();
    }
  }, [scanId]);

  const loadScanDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await scansApi.getById(scanId);
      setScan(data.scan);
    } catch (err) {
      setError(err.message || 'Failed to load scan report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!scan) return;
    try {
      setDownloading(true);
      const blob = await scansApi.downloadReport(scan.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SecureScan-Report-${scan.website?.domain || 'Target'}-${scan.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <RefreshCw className="w-10 h-10 animate-spin mx-auto text-brand-blue mb-3" />
        <p className="text-sm">Generating Security Intelligence Report...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="glass-panel p-8 rounded-2xl border border-rose-500/30">
          <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white">Scan Report Not Found</h2>
          <p className="mt-2 text-xs text-slate-400">{error || 'The requested scan could not be loaded.'}</p>
          <button
            onClick={() => onNavigate('scans')}
            className="mt-6 px-5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
          >
            Back to Scans
          </button>
        </div>
      </div>
    );
  }

  const findings = scan.findings || [];

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    const matchesSev = severityFilter === 'ALL' || f.severity?.toUpperCase() === severityFilter;
    const matchesCat = categoryFilter === 'ALL' || f.category?.toUpperCase() === categoryFilter;
    return matchesSev && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('scans')}
            className="p-2 rounded-xl bg-dark-800 border border-slate-700 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-cyan" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {scan.website?.domain}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-blue/10 text-brand-blue border border-brand-blue/30">
                Audit #{scan.id.slice(0, 8)}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(scan.createdAt).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Duration: {scan.scanDurationMs}ms
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Download className={`w-3.5 h-3.5 text-brand-cyan ${downloading ? 'animate-bounce' : ''}`} />
            <span>{downloading ? 'Compiling PDF...' : 'Download PDF Report'}</span>
          </button>

          <button
            onClick={() => {
              onCompareScans && onCompareScans(scan.id);
              onNavigate('scan-compare');
            }}
            className="px-4 py-2.5 rounded-xl bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/40 text-brand-purple font-medium text-xs flex items-center gap-2 transition"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Scan</span>
          </button>
        </div>
      </div>

      {/* Top Section: Explainable Score + Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Gauge Card */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Security Score
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Explainable Formula
            </span>
          </div>

          <ScoreGauge
            score={scan.score}
            grade={scan.grade}
            riskLevel={scan.riskLevel}
            size="large"
          />

          <div className="mt-5 w-full pt-4 border-t border-slate-800/80 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Base Score:</span>
              <span className="text-white">100 pts</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Critical Deductions (-25 ea):</span>
              <span>-{scan.criticalCount * 25} pts</span>
            </div>
            <div className="flex justify-between text-orange-400">
              <span>High Deductions (-15 ea):</span>
              <span>-{scan.highCount * 15} pts</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Medium Deductions (-8 ea):</span>
              <span>-{scan.mediumCount * 8} pts</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Low Deductions (-3 ea):</span>
              <span>-{scan.lowCount * 3} pts</span>
            </div>
          </div>
        </div>

        {/* Executive Summary & Key Deductions */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-brand-blue" />
              <h3 className="text-base font-bold text-white">Executive Security Summary</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {scan.summary || `Automated passive audit performed against ${scan.website?.domain}. The assessment evaluated HTTPS implementation, SSL/TLS handshake security, six defense-in-depth HTTP response headers, session cookie security flags, and public resource exposure.`}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-center">
            <div className="bg-dark-950 p-3 rounded-xl border border-slate-800">
              <p className="text-xl font-mono font-bold text-rose-400">{scan.criticalCount}</p>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Critical Risks</p>
            </div>
            <div className="bg-dark-950 p-3 rounded-xl border border-slate-800">
              <p className="text-xl font-mono font-bold text-orange-400">{scan.highCount}</p>
              <p className="text-[10px] font-mono text-slate-400 uppercase">High Risks</p>
            </div>
            <div className="bg-dark-950 p-3 rounded-xl border border-slate-800">
              <p className="text-xl font-mono font-bold text-amber-400">{scan.mediumCount}</p>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Medium Risks</p>
            </div>
            <div className="bg-dark-950 p-3 rounded-xl border border-slate-800">
              <p className="text-xl font-mono font-bold text-emerald-400">{scan.lowCount}</p>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Low / Info</p>
            </div>
          </div>

          {/* College Project Disclaimer Alert */}
          <div className="p-3 rounded-xl bg-dark-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-300">Explainability Notice:</strong> This score represents passive transport, header, and cookie configuration adherence. It does not perform invasive penetration testing, exploit payloads, or verify business logic vulnerabilities.
            </p>
          </div>
        </div>
      </div>

      {/* Findings Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Security Findings &amp; Evidence</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {filteredFindings.length} of {findings.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Each finding is verified through live server response inspection and protocol analysis
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            {/* Severity Filter */}
            <div className="flex items-center bg-dark-900 rounded-lg p-1 border border-slate-800">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    severityFilter === sev
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center bg-dark-900 rounded-lg p-1 border border-slate-800">
              {['ALL', 'TRANSPORT', 'HEADERS', 'COOKIES', 'PUBLIC_ASSETS'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-1 rounded-md transition ${
                    categoryFilter === cat
                      ? 'bg-brand-blue/30 text-brand-cyan font-bold border border-brand-blue/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Findings List */}
        {filteredFindings.length > 0 ? (
          <div className="space-y-3">
            {filteredFindings.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                onOpenRemediation={(item) => setActiveRemediation(item)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 p-8 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p>No findings match the selected filters.</p>
          </div>
        )}
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
