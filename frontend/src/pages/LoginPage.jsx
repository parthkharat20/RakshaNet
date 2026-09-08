import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { DEFAULT_OFFICER_BADGE } from '../utils/constants';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [badgeId, setBadgeId] = useState(DEFAULT_OFFICER_BADGE);
  const [pin, setPin] = useState('••••');

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/');
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
                required
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
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-xs font-bold mt-2"
          >
            <span>Authenticate Secure Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-500">
          Authorized under Section 91 CrPC and Information Technology Act 2000. All queries are audited and cryptographically hashed.
        </p>
      </div>
    </div>
  );
};
