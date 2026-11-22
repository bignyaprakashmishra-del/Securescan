import React from 'react';
import { Shield, ShieldAlert, Sparkles, LogOut, User, Activity, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';

export default function Navbar({ onNavigate, currentPage }) {
  const { user, logout } = useAuth();
  const { isDemoMode, disableDemoMode, enableDemoMode } = useDemo();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-dark-900/80 backdrop-blur-md">
      {isDemoMode && (
        <div className="bg-gradient-to-r from-brand-purple/20 via-brand-blue/20 to-brand-cyan/20 border-b border-brand-purple/40 px-4 py-1.5 text-xs font-mono text-center flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-brand-cyan font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            Judges Demo Mode Active
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Exploring pre-generated competition datasets without domain ownership friction
          </span>
          <button
            onClick={disableDemoMode}
            className="text-xs text-rose-400 hover:text-rose-300 underline font-sans ml-2"
          >
            Exit Demo
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple via-brand-blue to-brand-cyan p-[1px] shadow-glow">
            <div className="w-full h-full bg-dark-900 rounded-[11px] flex items-center justify-center group-hover:bg-dark-850 transition">
              <Shield className="w-5 h-5 text-brand-cyan group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Secure<span className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-cyan bg-clip-text text-transparent">Scan</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-wide rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 tracking-wider hidden sm:block">
              Explainable Web Security Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentPage === 'dashboard'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('websites')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentPage === 'websites'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                Websites
              </button>
              <button
                onClick={() => onNavigate('scans')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentPage === 'scans'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                Scans & History
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('landing')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentPage === 'landing' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview
              </button>
              <a
                href="#features"
                onClick={(e) => {
                  if (currentPage !== 'landing') {
                    e.preventDefault();
                    onNavigate('landing');
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 transition"
              >
                Capabilities
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  if (currentPage !== 'landing') {
                    e.preventDefault();
                    onNavigate('landing');
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 transition"
              >
                Architecture
              </a>
            </>
          )}

          {/* Demo Mode Button for Judges */}
          <button
            onClick={() => {
              enableDemoMode();
              onNavigate('demo');
            }}
            className={`ml-2 px-3 py-1.5 rounded-lg text-sm font-mono flex items-center gap-1.5 transition border ${
              isDemoMode || currentPage === 'demo'
                ? 'bg-brand-purple/20 text-brand-purple border-brand-purple/50'
                : 'text-brand-cyan/90 border-brand-cyan/30 hover:bg-brand-cyan/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Mode</span>
          </button>
        </nav>

        {/* Auth / Profile Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-slate-800 text-xs">
                <User className="w-3.5 h-3.5 text-brand-blue" />
                <span className="text-slate-300 font-medium">{user.name}</span>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-glow hover:opacity-95 transition"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
