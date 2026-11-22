import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ScoreGauge({ score = 100, grade = 'A+', riskLevel = 'Low Risk', size = 'normal' }) {
  // Determine color palette based on score
  const getTheme = (s) => {
    if (s >= 90) return {
      stroke: '#10B981', // Emerald
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck
    };
    if (s >= 75) return {
      stroke: '#06B6D4', // Cyan
      bg: 'rgba(6, 182, 212, 0.1)',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      icon: ShieldCheck
    };
    if (s >= 55) return {
      stroke: '#F59E0B', // Amber
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle
    };
    if (s >= 35) return {
      stroke: '#F97316', // Orange
      bg: 'rgba(249, 115, 22, 0.1)',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      icon: ShieldAlert
    };
    return {
      stroke: '#EF4444', // Red
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: ShieldAlert
    };
  };

  const theme = getTheme(score);
  const IconComponent = theme.icon;

  const radius = size === 'large' ? 70 : 48;
  const strokeWidth = size === 'large' ? 10 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center">
        {/* SVG Circular Progress */}
        <svg
          className="transform -rotate-90"
          width={radius * 2 + strokeWidth * 2}
          height={radius * 2 + strokeWidth * 2}
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#1F2937"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-mono font-extrabold ${size === 'large' ? 'text-4xl' : 'text-2xl'} text-white`}>
            {score}
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            / 100
          </span>
        </div>
      </div>

      {/* Grade and Risk classification */}
      <div className="mt-3 flex items-center gap-2">
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-mono border ${theme.badge}`}>
          Grade {grade}
        </span>
        <span className="text-xs font-medium text-slate-300">
          {riskLevel}
        </span>
      </div>
    </div>
  );
}
