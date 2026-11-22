import React, { useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Code, 
  ShieldAlert, 
  CheckCircle,
  ExternalLink,
  Terminal
} from 'lucide-react';

export default function FindingCard({ finding, onOpenRemediation }) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-500',
          icon: ShieldAlert,
        };
      case 'high':
        return {
          bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          dot: 'bg-orange-500',
          icon: AlertCircle,
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
          icon: AlertTriangle,
        };
      case 'low':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500',
          icon: Info,
        };
      default:
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-500',
          icon: Info,
        };
    }
  };

  const badge = getSeverityBadge(finding.severity);
  const SeverityIcon = badge.icon;

  return (
    <div className="glass-card rounded-xl border border-slate-800/80 overflow-hidden transition-all duration-200">
      {/* Header bar */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-800/30 transition select-none"
      >
        <div className="flex items-start gap-3.5 flex-1">
          <div className="mt-0.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${badge.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              {finding.severity?.toUpperCase()}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-semibold text-white tracking-tight">
                {finding.name}
              </h4>
              <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                {finding.category}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400 line-clamp-1">
              {finding.description}
            </p>

            {/* Quick Evidence Preview */}
            {finding.evidence && (
              <div className="mt-2 text-xs font-mono text-slate-300 bg-dark-900/90 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 max-w-2xl">
                <Terminal className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                <span className="truncate">{finding.evidence}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenRemediation && onOpenRemediation(finding);
            }}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-blue/10 text-brand-blue border border-brand-blue/30 hover:bg-brand-blue/20 transition"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Remediation</span>
          </button>
          
          <div className="p-1 text-slate-400 hover:text-white">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 bg-dark-900/40 space-y-4">
          {/* Description */}
          <div>
            <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Issue Overview
            </h5>
            <p className="mt-1 text-sm text-slate-300 leading-relaxed">
              {finding.description}
            </p>
          </div>

          {/* Potential Impact */}
          {finding.impact && (
            <div className="p-3.5 rounded-lg bg-rose-500/5 border border-rose-500/20">
              <h5 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Potential Security Impact
              </h5>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                {finding.impact}
              </p>
            </div>
          )}

          {/* Technical Details */}
          {finding.technicalDetails && (
            <div>
              <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Technical Explanation
              </h5>
              <p className="mt-1 text-xs font-mono text-slate-400 leading-relaxed bg-dark-950 p-3 rounded-lg border border-slate-800/80">
                {finding.technicalDetails}
              </p>
            </div>
          )}

          {/* Recommended Remediation & Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Recommended Fix
              </h5>
              <p className="mt-1 text-xs text-slate-300">
                {finding.remediation}
              </p>
            </div>

            <button
              onClick={() => onOpenRemediation && onOpenRemediation(finding)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand-purple to-brand-blue text-white hover:opacity-90 transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Get Multi-Platform Fix Code</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
