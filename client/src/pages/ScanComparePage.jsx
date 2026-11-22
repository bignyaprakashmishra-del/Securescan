import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  MinusCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Globe,
  Calendar
} from 'lucide-react';
import { scansApi } from '../api/client';
import FindingCard from '../components/FindingCard';
import RemediationModal from '../components/RemediationModal';

export default function ScanComparePage({ scanAId, scanBId, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState('');
  const [activeRemediation, setActiveRemediation] = useState(null);

  // Available scans for selection dropdowns
  const [allScans, setAllScans] = useState([]);
  const [firstId, setFirstId] = useState(scanAId || '');
  const [secondId, setSecondId] = useState(scanBId || '');

  useEffect(() => {
    loadScanList();
  }, []);

  useEffect(() => {
    if (firstId && secondId && firstId !== secondId) {
      executeComparison(firstId, secondId);
    }
  }, [firstId, secondId]);

  const loadScanList = async () => {
    try {
      const res = await scansApi.getAll();
      const list = res.scans || [];
      setAllScans(list);

      // Auto-select first two if not provided
      if (!firstId && list.length > 0) {
        setFirstId(list[0].id);
      }
      if (!secondId && list.length > 1) {
        setSecondId(list[1].id);
      }
    } catch (err) {
      console.error('Failed to load scan list:', err);
    }
  };

  const executeComparison = async (idA, idB) => {
    try {
      setLoading(true);
      setError('');
      const data = await scansApi.compare(idA, idB);
      setComparison(data.comparison);
    } catch (err) {
      setError(err.message || 'Comparison failed. Scans must belong to the same domain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('scans')}
            className="p-2 rounded-xl bg-dark-800 border border-slate-700 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-brand-purple" />
              <span>Scan Comparison &amp; Posture Diff</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Evaluate security delta between any two audits: fixed issues, new risks, and net score changes
            </p>
          </div>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Baseline Scan A */}
        <div className="w-full md:w-5/12">
          <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
            Baseline Audit (Prior Scan)
          </label>
          <select
            value={firstId}
            onChange={(e) => setFirstId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-brand-purple"
          >
            <option value="">Select baseline audit...</option>
            {allScans.map((s) => (
              <option key={s.id} value={s.id}>
                {s.website?.domain} — Score {s.score} ({new Date(s.createdAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div className="p-2 rounded-full bg-slate-800 text-slate-400 shrink-0">
          <ArrowRight className="w-4 h-4" />
        </div>

        {/* Current Scan B */}
        <div className="w-full md:w-5/12">
          <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
            Comparison Audit (Newer Scan)
          </label>
          <select
            value={secondId}
            onChange={(e) => setSecondId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-brand-purple"
          >
            <option value="">Select comparison audit...</option>
            {allScans.map((s) => (
              <option key={s.id} value={s.id}>
                {s.website?.domain} — Score {s.score} ({new Date(s.createdAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Metrics & Cards */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-purple mb-2" />
          <p className="text-sm">Calculating security delta &amp; diffing findings...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <p className="font-bold">Comparison Notice:</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : comparison ? (
        <div className="space-y-8">
          {/* Delta Scoreboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Prior Score */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs font-mono uppercase text-slate-400">Baseline Score</span>
              <p className="text-4xl font-extrabold font-mono text-white mt-2">
                {comparison.priorScan.score}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Grade {comparison.priorScan.grade} • {new Date(comparison.priorScan.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Score Delta */}
            <div className={`glass-card p-6 rounded-2xl border text-center ${
              comparison.scoreDelta > 0
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : comparison.scoreDelta < 0
                ? 'border-rose-500/40 bg-rose-500/5'
                : 'border-slate-800'
            }`}>
              <span className="text-xs font-mono uppercase text-slate-400">Net Improvement</span>
              <div className="flex items-center justify-center gap-2 mt-2">
                {comparison.scoreDelta > 0 ? (
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                ) : comparison.scoreDelta < 0 ? (
                  <TrendingDown className="w-6 h-6 text-rose-400" />
                ) : null}
                <p className={`text-4xl font-extrabold font-mono ${
                  comparison.scoreDelta > 0
                    ? 'text-emerald-400'
                    : comparison.scoreDelta < 0
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}>
                  {comparison.scoreDelta > 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} pts
                </p>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                {comparison.scoreDelta > 0
                  ? 'Security posture significantly enhanced'
                  : comparison.scoreDelta < 0
                  ? 'Security regression detected'
                  : 'No net score change'}
              </p>
            </div>

            {/* Current Score */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs font-mono uppercase text-slate-400">Comparison Score</span>
              <p className="text-4xl font-extrabold font-mono text-white mt-2">
                {comparison.currentScan.score}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Grade {comparison.currentScan.grade} • {new Date(comparison.currentScan.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Diff Breakdown: Fixed, New, Unchanged */}
          <div className="space-y-6">
            {/* 1. Resolved / Fixed Findings */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Resolved Vulnerabilities ({comparison.fixedFindings?.length || 0})
                </h3>
              </div>
              {comparison.fixedFindings?.length > 0 ? (
                <div className="space-y-2">
                  {comparison.fixedFindings.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/20 text-emerald-300">
                          RESOLVED
                        </span>
                        <span className="font-semibold text-white">{f.name}</span>
                        <span className="text-slate-400 font-mono">({f.category})</span>
                      </div>
                      <span className="text-emerald-400 font-mono">Points restored</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No issues were fixed between these two scans.</p>
              )}
            </div>

            {/* 2. Newly Introduced Issues */}
            <div className="glass-panel p-6 rounded-2xl border border-rose-500/30">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">
                  Newly Introduced Issues ({comparison.newFindings?.length || 0})
                </h3>
              </div>
              {comparison.newFindings?.length > 0 ? (
                <div className="space-y-2">
                  {comparison.newFindings.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-rose-500/20 text-rose-300">
                          NEW RISK
                        </span>
                        <span className="font-semibold text-white">{f.name}</span>
                        <span className="text-slate-400 font-mono">({f.category})</span>
                      </div>
                      <span className="text-rose-400 font-mono font-bold">Severity: {f.severity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Zero new vulnerabilities detected.</p>
              )}
            </div>

            {/* 3. Persistent Unchanged Issues */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <MinusCircle className="w-5 h-5 text-slate-400" />
                <h3 className="text-base font-bold text-white">
                  Persistent / Unchanged Issues ({comparison.unchangedFindings?.length || 0})
                </h3>
              </div>
              {comparison.unchangedFindings?.length > 0 ? (
                <div className="space-y-2">
                  {comparison.unchangedFindings.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-dark-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-400">
                          UNCHANGED
                        </span>
                        <span className="text-slate-200">{f.name}</span>
                        <span className="text-slate-500 font-mono">({f.category})</span>
                      </div>
                      <span className="text-slate-400 font-mono">{f.severity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No persistent issues found.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

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
