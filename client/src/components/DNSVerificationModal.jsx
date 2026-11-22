import React, { useState } from 'react';
import { X, Copy, Check, Globe, RefreshCw, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { websitesApi } from '../api/client';

export default function DNSVerificationModal({ website, isOpen, onClose, onVerified }) {
  const [copyToken, setCopyToken] = useState(false);
  const [copyHost, setCopyHost] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen || !website) return null;

  const recordHost = `_securescan-challenge.${website.domain}`;
  const recordValue = `securescan-verify=${website.verificationToken}`;

  const handleCopyHost = () => {
    navigator.clipboard.writeText(recordHost);
    setCopyHost(true);
    setTimeout(() => setCopyHost(false), 2000);
  };

  const handleCopyValue = () => {
    navigator.clipboard.writeText(recordValue);
    setCopyToken(true);
    setTimeout(() => setCopyToken(false), 2000);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setResult(null);
    try {
      const data = await websitesApi.verify(website.id);
      setResult({
        success: data.verified,
        message: data.message || 'Domain successfully verified!'
      });
      if (data.verified && onVerified) {
        onVerified(data.website);
      }
    } catch (err) {
      setResult({
        success: false,
        message: err.message || 'Verification failed. TXT record not found.'
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">DNS Ownership Verification</h3>
              <p className="text-xs text-slate-400 font-mono">{website.domain}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-300">
            To prevent unauthorized scanning and ensure responsible security auditing, please verify you own or administer{' '}
            <span className="font-mono text-brand-cyan font-semibold">{website.domain}</span> by adding this DNS TXT record to your DNS provider (e.g. Cloudflare, GoDaddy, Route53, Namecheap).
          </p>

          {/* DNS Record Specs */}
          <div className="space-y-3 bg-dark-950 p-4 rounded-xl border border-slate-800 text-xs">
            {/* Record Type */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400 font-medium uppercase tracking-wider">Record Type</span>
              <span className="font-mono font-bold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded border border-brand-purple/30">
                TXT
              </span>
            </div>

            {/* Host / Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 font-medium uppercase tracking-wider">Host / Name</span>
                <button
                  onClick={handleCopyHost}
                  className="flex items-center gap-1 text-[11px] text-brand-blue hover:text-brand-cyan transition"
                >
                  {copyHost ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copyHost ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-slate-200 bg-dark-900 p-2 rounded-lg border border-slate-800 select-all truncate">
                {recordHost}
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                (Note: You can also use root &quot;@&quot; if your DNS provider requires it)
              </p>
            </div>

            {/* Record Value */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 font-medium uppercase tracking-wider">Record Value</span>
                <button
                  onClick={handleCopyValue}
                  className="flex items-center gap-1 text-[11px] text-brand-blue hover:text-brand-cyan transition"
                >
                  {copyToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copyToken ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-emerald-400 bg-dark-900 p-2 rounded-lg border border-slate-800 break-all select-all">
                {recordValue}
              </div>
            </div>
          </div>

          {/* Verification feedback message */}
          {result && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                result.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{result.success ? 'Verified Successfully!' : 'Verification Unsuccessful'}</p>
                <p className="mt-0.5 text-slate-300">{result.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-dark-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Close
          </button>

          <button
            onClick={handleVerify}
            disabled={verifying || website.isVerified}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              website.isVerified
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-glow hover:opacity-95'
            }`}
          >
            {verifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Querying DNS TXT Records...</span>
              </>
            ) : website.isVerified ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ownership Verified</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify DNS TXT Record</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
