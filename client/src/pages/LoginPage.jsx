import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const { enableDemoMode } = useDemo();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAccess = () => {
    enableDemoMode();
    onNavigate('demo');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Subtle glow header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 border border-brand-purple/30 mb-3 shadow-glow">
              <Shield className="w-8 h-8 text-brand-cyan" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Sign In to SecureScan
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Access your verified domains and security scan intelligence
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold text-sm shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Judges Demo Mode Shortcut */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center space-y-4">
            <button
              onClick={handleDemoAccess}
              className="w-full py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-brand-cyan/30 text-xs font-mono text-brand-cyan flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Judges Quick Demo Mode (No Sign-in)</span>
            </button>

            <p className="text-xs text-slate-400">
              Need an account?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-brand-cyan hover:underline font-medium"
              >
                Register Here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
