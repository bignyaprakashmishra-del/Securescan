import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Globe, 
  Activity, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Plus, 
  ArrowUpRight, 
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import StatCard from '../components/StatCard';
import ScoreGauge from '../components/ScoreGauge';
import { websitesApi, scansApi } from '../api/client';

export default function DashboardPage({ onNavigate, onSelectScan }) {
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState([]);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState({
    avgScore: 100,
    totalWebsites: 0,
    totalScans: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [websitesRes, scansRes] = await Promise.all([
        websitesApi.getAll(),
        scansApi.getAll(),
      ]);

      const siteList = websitesRes.websites || [];
      const scanList = scansRes.scans || [];

      setWebsites(siteList);
      setScans(scanList);

      // Aggregate statistics from real DB data
      if (scanList.length > 0) {
        let totalScore = 0;
        let critical = 0;
        let high = 0;
        let med = 0;
        let low = 0;

        scanList.forEach(s => {
          totalScore += s.score;
          critical += s.criticalCount || 0;
          high += s.highCount || 0;
          med += s.mediumCount || 0;
          low += s.lowCount || 0;
        });

        setStats({
          avgScore: Math.round(totalScore / scanList.length),
          totalWebsites: siteList.length,
          totalScans: scanList.length,
          criticalCount: critical,
          highCount: high,
          mediumCount: med,
          lowCount: low,
        });
      } else {
        setStats({
          avgScore: 100,
          totalWebsites: siteList.length,
          totalScans: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare trend data from scans
  const trendData = scans.slice(-7).map((s, idx) => ({
    name: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: s.score,
    domain: s.website?.domain || 'Target',
  }));

  // Prepare severity chart data
  const severityData = [
    { name: 'Critical', count: stats.criticalCount, color: '#EF4444' },
    { name: 'High', count: stats.highCount, color: '#F97316' },
    { name: 'Medium', count: stats.mediumCount, color: '#F59E0B' },
    { name: 'Low', count: stats.lowCount, color: '#10B981' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Security Intelligence Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time telemetry, misconfiguration counts, and security score posture
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            title="Refresh metrics"
            className="p-2.5 rounded-xl bg-dark-800 border border-slate-700 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate('websites')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold text-xs sm:text-sm shadow-glow hover:opacity-95 transition flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Scan Website</span>
          </button>
        </div>
      </div>

      {/* Top Highlight Grid: Score Gauge + Key Counts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Overall Security Score Card */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Security Posture
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-blue/10 text-brand-blue border border-brand-blue/30">
              Live Aggregate
            </span>
          </div>

          <ScoreGauge
            score={stats.avgScore}
            grade={stats.avgScore >= 90 ? 'A+' : stats.avgScore >= 75 ? 'B' : stats.avgScore >= 55 ? 'C' : 'D'}
            riskLevel={stats.avgScore >= 90 ? 'Low Risk' : stats.avgScore >= 75 ? 'Moderate' : 'Elevated'}
            size="large"
          />

          <p className="mt-4 text-xs text-slate-400 text-center max-w-xs">
            Composite score derived from verified domain security headers, TLS configuration, and cookie policies.
          </p>
        </div>

        {/* Stat Cards Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            title="Monitored Domains"
            value={stats.totalWebsites}
            subtext="Registered targets"
            icon={Globe}
            color="cyan"
            onClick={() => onNavigate('websites')}
          />
          <StatCard
            title="Total Scans"
            value={stats.totalScans}
            subtext="Security audits run"
            icon={Activity}
            color="blue"
            onClick={() => onNavigate('scans')}
          />
          <StatCard
            title="Critical Risks"
            value={stats.criticalCount}
            subtext="Immediate priority"
            icon={AlertOctagon}
            color="red"
          />
          <StatCard
            title="High Risks"
            value={stats.highCount}
            subtext="Significant impact"
            icon={AlertTriangle}
            color="orange"
          />
          <StatCard
            title="Medium Risks"
            value={stats.mediumCount}
            subtext="Hardening needed"
            icon={AlertTriangle}
            color="amber"
          />
          <StatCard
            title="Low & Info"
            value={stats.lowCount}
            subtext="Best practices"
            icon={CheckCircle}
            color="green"
          />
        </div>
      </div>

      {/* Visual Data Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Score Trend Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-cyan" />
                <span>Security Score History</span>
              </h3>
              <p className="text-xs text-slate-400">Score progress across recent scan runs</p>
            </div>
            <span className="text-xs font-mono text-slate-500">Last 7 Scans</span>
          </div>

          <div className="h-64 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#6B7280" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#06B6D4"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6, fill: '#8B5CF6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <p>No scan history yet.</p>
                <button
                  onClick={() => onNavigate('websites')}
                  className="mt-2 text-brand-cyan hover:underline"
                >
                  Verify a website &amp; run your first scan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Findings Distribution Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-purple" />
                <span>Findings by Severity</span>
              </h3>
              <p className="text-xs text-slate-400">Distribution of identified security issues</p>
            </div>
            <span className="text-xs font-mono text-slate-500">All Scans</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#6B7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Security Audits</h3>
            <p className="text-xs text-slate-400">Latest non-destructive passive assessments</p>
          </div>
          <button
            onClick={() => onNavigate('scans')}
            className="text-xs text-brand-blue hover:text-brand-cyan font-semibold flex items-center gap-1 transition"
          >
            <span>View All Scans</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {scans.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950/80 font-mono text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Target Domain</th>
                  <th className="px-6 py-3.5">Score / Grade</th>
                  <th className="px-6 py-3.5">Risk Level</th>
                  <th className="px-6 py-3.5">Findings</th>
                  <th className="px-6 py-3.5">Scan Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {scans.slice(0, 5).map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-sans font-medium text-white flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>{scan.website?.domain || 'Target Domain'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white text-sm mr-2">{scan.score}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {scan.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
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
                      <span className="text-rose-400 font-bold">{scan.criticalCount}C</span> •{' '}
                      <span className="text-orange-400 font-bold">{scan.highCount}H</span> •{' '}
                      <span className="text-amber-400 font-bold">{scan.mediumCount}M</span> •{' '}
                      <span className="text-emerald-400 font-bold">{scan.lowCount}L</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          onSelectScan(scan.id);
                          onNavigate('scan-detail');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-sans text-xs inline-flex items-center gap-1"
                      >
                        <span>View Report</span>
                        <ArrowUpRight className="w-3 h-3 text-brand-blue" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>No scans recorded yet. Add and verify a domain to run your first audit.</p>
              <button
                onClick={() => onNavigate('websites')}
                className="mt-3 px-4 py-2 rounded-xl bg-brand-blue text-white font-medium hover:bg-brand-blueDark transition inline-block"
              >
                Go to Websites
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
