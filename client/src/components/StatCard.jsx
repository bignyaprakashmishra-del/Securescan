import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'blue', onClick }) {
  const colorMap = {
    purple: {
      border: 'hover:border-purple-500/50',
      bg: 'bg-purple-500/10 text-purple-400',
      glow: 'shadow-glow-purple',
    },
    blue: {
      border: 'hover:border-blue-500/50',
      bg: 'bg-blue-500/10 text-blue-400',
      glow: 'shadow-glow',
    },
    cyan: {
      border: 'hover:border-cyan-500/50',
      bg: 'bg-cyan-500/10 text-cyan-400',
      glow: 'shadow-glow-cyan',
    },
    red: {
      border: 'hover:border-rose-500/50',
      bg: 'bg-rose-500/10 text-rose-400',
      glow: 'hover:shadow-rose-500/10',
    },
    orange: {
      border: 'hover:border-orange-500/50',
      bg: 'bg-orange-500/10 text-orange-400',
      glow: 'hover:shadow-orange-500/10',
    },
    amber: {
      border: 'hover:border-amber-500/50',
      bg: 'bg-amber-500/10 text-amber-400',
      glow: 'hover:shadow-amber-500/10',
    },
    green: {
      border: 'hover:border-emerald-500/50',
      bg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'hover:shadow-emerald-500/10',
    },
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-xl p-5 border border-slate-800 transition duration-200 ${currentTheme.border} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono">{value}</h3>
          {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${currentTheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
