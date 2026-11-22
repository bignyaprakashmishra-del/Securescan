import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Play
} from 'lucide-react';
import DNSVerificationModal from '../components/DNSVerificationModal';
import { websitesApi, scansApi } from '../api/client';

export default function WebsitesPage({ onNavigate, onSelectScan }) {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const [activeVerificationSite, setActiveVerificationSite] = useState(null);
  const [scanningSiteId, setScanningSiteId] = useState(null);
  const [scanError, setScanError] = useState('');

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      setLoading(true);
      const data = await websitesApi.getAll();
      setWebsites(data.websites || []);
    } catch (err) {
      console.error('Failed to load websites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    setAddError('');

    let cleaned = newDomain.trim().toLowerCase();
    // Strip protocol if user pasted http:// or https://
    cleaned = cleaned.replace(/^https?:\/\//i, '');
    // Strip trailing slash and path
    cleaned = cleaned.split('/')[0].split(':')[0];

    // Domain regex validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!domainRegex.test(cleaned)) {
      setAddError('Please enter a valid domain name (e.g. example.com or app.mycompany.org). IP addresses and URLs with paths are rejected for SSRF protection.');
      return;
    }

    try {
      setAdding(true);
      const res = await websitesApi.create(cleaned);
      setWebsites([res.website, ...websites]);
      setNewDomain('');
      setShowAddModal(false);
      // Immediately open DNS verification modal for the newly added domain
      setActiveVerificationSite(res.website);
    } catch (err) {
      setAddError(err.message || 'Failed to add domain.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteWebsite = async (id, domain) => {
    if (!window.confirm(`Are you sure you want to remove ${domain}? All associated scan history will be deleted.`)) {
      return;
    }

    try {
      await websitesApi.delete(id);
      setWebsites(websites.filter((w) => w.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete website.');
    }
  };

  const handleRunScan = async (website) => {
    if (!website.isVerified) {
      setActiveVerificationSite(website);
      return;
    }

    try {
      setScanningSiteId(website.id);
      setScanError('');
      const res = await scansApi.create(website.id);
      if (res.scan && res.scan.id) {
        onSelectScan(res.scan.id);
        onNavigate('scan-detail');
      }
    } catch (err) {
      setScanError(`Scan failed: ${err.message}`);
    } finally {
      setScanningSiteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Monitored Websites &amp; Ownership
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Cryptographic DNS TXT ownership verification and passive security scanning
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold text-xs sm:text-sm shadow-glow hover:opacity-95 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Domain</span>
        </button>
      </div>

      {scanError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{scanError}</span>
        </div>
      )}

      {/* Websites Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-blue mb-2" />
          <p className="text-sm">Loading registered domains...</p>
        </div>
      ) : websites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((site) => (
            <div
              key={site.id}
              className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-dark-900 border border-slate-800 text-brand-cyan">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base tracking-tight truncate max-w-[180px]">
                        {site.domain}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400">
                        Added {new Date(site.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteWebsite(site.id, site.domain)}
                    title="Remove domain"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Verification Status Badge */}
                <div className="mt-4">
                  {site.isVerified ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>DNS Ownership Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Pending DNS TXT</span>
                      </div>
                      <button
                        onClick={() => setActiveVerificationSite(site)}
                        className="text-[11px] text-brand-blue hover:text-brand-cyan underline font-sans font-medium"
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </div>

                {/* Latest Scan Summary if available */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                  <span>Audits Performed:</span>
                  <span className="font-mono text-white font-semibold">
                    {site.scans?.length || 0} scans
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                {site.isVerified ? (
                  <button
                    onClick={() => handleRunScan(site)}
                    disabled={scanningSiteId === site.id}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold text-xs shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2"
                  >
                    {scanningSiteId === site.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Running Passive Security Audit...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Run Passive Scan</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveVerificationSite(site)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Setup DNS TXT Record</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center max-w-lg mx-auto">
          <Globe className="w-12 h-12 text-brand-cyan/60 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Monitored Websites Yet</h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Add a website domain to begin passive security assessment. You will be provided with a unique DNS TXT record to prove domain authorization.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold text-xs shadow-glow hover:opacity-95 transition"
          >
            Add First Domain
          </button>
        </div>
      )}

      {/* Add Website Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white">Register Target Domain</h3>
            <p className="mt-1 text-xs text-slate-400">
              Only standard domain names are accepted. IP-literals, localhost, and cloud metadata targets are strictly blocked by our SSRF protection engine.
            </p>

            {addError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddWebsite} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Domain Name
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue transition font-mono"
                    required
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Example: <code className="text-slate-400">mywebsite.com</code> or <code className="text-slate-400">api.service.io</code>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold text-xs shadow-glow hover:opacity-95 transition"
                >
                  {adding ? 'Registering...' : 'Add & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DNS Verification Modal */}
      {activeVerificationSite && (
        <DNSVerificationModal
          website={activeVerificationSite}
          isOpen={!!activeVerificationSite}
          onClose={() => setActiveVerificationSite(null)}
          onVerified={(updatedSite) => {
            setWebsites(websites.map((w) => (w.id === updatedSite.id ? updatedSite : w)));
            setActiveVerificationSite(null);
          }}
        />
      )}
    </div>
  );
}
