import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Globe, 
  Calendar, 
  ArrowUpRight, 
  Download, 
  GitCompare, 
  Clock, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { scansApi, websitesApi } from '../api/client';

export default function ScansPage({ onNavigate, onSelectScan, onCompareScans }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      setLoading(true);
      const res = await scansApi.getAll();
      setScans(res.scans || []);
    } catch (err) {
      console.error('Failed to load scans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (scanId, domain) => {
    try {
      setDownloadingId(scanId);
      const blob = await scansApi.downloadReport(scanId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SecureScan-Report-${domain}-${scanId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert(`Could not download report: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const toggleCompareSelection = (scanId) => {
    if (selectedForCompare.includes(scanId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== scanId));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], scanId]);
      } else {
        setSelectedForCompare([...selectedForCompare, scanId]);
      }
    }
  };

  const handleExecuteCompare = () => {
    if (selectedForCompare.length === 2) {
      onCompareScans(selectedForCompare[0], selectedForCompare[1]);
      onNavigate('scan-compare');
    }
  };

  const filteredScans = scans.filter((s) => {
    const domain = s.website?.domain?.toLowerCase() || '';
    return domain.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Security Scan History &amp; Audits
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Chronological audit logs, executive scorecards, and historical diffing
          </p>
        </div>

        {/* Compare banner if 2 scans selected */}
        {selectedForCompare.length > 0 && (
          <div className="flex items-center gap-3 bg-brand-purple/10 border border-brand-purple/40 px-4 py-2 rounded-xl">
            <span className="text-xs text-brand-purple font-mono">
              Selected ({selectedForCompare.length}/2) for comparison
            </span>
            <button
              onClick={handleExecuteCompare}
              disabled={selectedForCompare.length !== 2}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                selectedForCompare.length === 2
                  ? 'bg-brand-purple text-white shadow-glow-purple hover:opacity-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Scans</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4 glass-panel p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter scans by domain name..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-dark-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
          />
        </div>

        <button
          onClick={loadScans}
          className="p-2 rounded-lg bg-dark-800 text-slate-400 hover:text-white transition border border-slate-700"
          title="Refresh scan records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Scans List / Table */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-blue mb-2" />
          <p className="text-sm">Loading security audit records...</p>
        </div>
      ) : filteredScans.length > 0 ? (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950/80 font-mono text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-10">Compare</th>
                  <th className="px-6 py-4">Target Website</th>
                  <th className="px-6 py-4">Score &amp; Grade</th>
                  <th className="px-6 py-4">Risk Level</th>
                  <th className="px-6 py-4">Findings Breakdown</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredScans.map((scan) => {
                  const isSelected = selectedForCompare.includes(scan.id);
                  return (
                    <tr
                      key={scan.id}
                      className={`hover:bg-slate-800/30 transition ${
                        isSelected ? 'bg-brand-purple/5' : ''
                      }`}
                    >
                      {/* Checkbox for Compare */}
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCompareSelection(scan.id)}
                          className="rounded border-slate-700 bg-dark-950 text-brand-purple focus:ring-brand-purple cursor-pointer"
                        />
                      </td>

                      <td className="px-6 py-4 font-sans font-medium text-white flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                        <span className="font-semibold">{scan.website?.domain || 'Target Domain'}</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-white">{scan.score}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {scan.grade}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          scan.riskLevel?.includes('Low')
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : scan.riskLevel?.includes('Moderate')
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {scan.riskLevel}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        <span className="text-rose-400 font-bold">{scan.criticalCount} Critical</span> •{' '}
                        <span className="text-orange-400 font-bold">{scan.highCount} High</span> •{' '}
                        <span className="text-amber-400 font-bold">{scan.mediumCount} Med</span> •{' '}
                        <span className="text-emerald-400 font-bold">{scan.lowCount} Low</span>
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{scan.scanDurationMs || 350}ms</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {new Date(scan.createdAt).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 font-sans">
                          {/* Download PDF button */}
                          <button
                            onClick={() => handleDownloadReport(scan.id, scan.website?.domain || 'target')}
                            disabled={downloadingId === scan.id}
                            title="Download PDF Security Report"
                            className="p-1.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-400 hover:text-brand-cyan hover:border-brand-cyan/40 transition"
                          >
                            <Download className={`w-3.5 h-3.5 ${downloadingId === scan.id ? 'animate-bounce' : ''}`} />
                          </button>

                          {/* View Detailed Intelligence */}
                          <button
                            onClick={() => {
                              onSelectScan(scan.id);
                              onNavigate('scan-detail');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs font-medium flex items-center gap-1"
                          >
                            <span>Report</span>
                            <ArrowUpRight className="w-3 h-3 text-brand-blue" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center max-w-lg mx-auto">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Security Scans Recorded</h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Register and verify a website domain to perform a real passive security audit.
          </p>
          <button
            onClick={() => onNavigate('websites')}
            className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold text-xs shadow-glow hover:opacity-95 transition"
          >
            Go to Websites
          </button>
        </div>
      )}
    </div>
  );
}
