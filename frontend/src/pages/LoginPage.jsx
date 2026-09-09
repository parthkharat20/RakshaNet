import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { loginOfficer, isAuthenticated } from '../utils/api';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [badgeId, setBadgeId] = useState('LE-CYBER-MUM-4029');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!badgeId.trim() || !pin.trim()) {
      setError('Badge ID and Security PIN are required.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await loginOfficer(badgeId.trim(), pin.trim());
      console.log('✅ Authenticated:', data.officer_name, data.officer_rank);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-mono">
      {/* Background Cyber Grid Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 space-y-6 relative z-10 border-white/15">
        {/* Emblem */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-blue-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white font-display tracking-wide">
            RAKSHA<span className="text-blue-500">NET</span>
          </h2>
          <p className="text-xs text-slate-400">
            National Cybercrime Threat Intelligence Portal
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-300 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3" />
            <span>MHA / I4C LAW ENFORCEMENT ACCESS ONLY</span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/60 border border-red-800/40 text-red-300 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase">
              Officer Badge / Token ID:
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-900 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                placeholder="LE-CYBER-MUM-4029"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase">
              Security PIN / Hardware Key:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-900 border border-white/10 text-white focus:border-blue-500 focus:outline-none tracking-widest"
                placeholder="••••"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-xs font-bold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Authenticate Secure Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Hint */}
        <div className="text-[10px] text-center text-slate-500 space-y-1">
          <p>Authorized under Section 91 CrPC and Information Technology Act 2000.</p>
          <p>All queries are audited and cryptographically hashed.</p>
          <div className="mt-2 px-3 py-1.5 rounded bg-slate-900/60 border border-white/5 text-slate-400">
            Demo: Badge <span className="text-blue-400 font-bold">LE-CYBER-MUM-4029</span> / PIN <span className="text-blue-400 font-bold">1234</span>
          </div>
        </div>
      </div>
    </div>
  );
};
