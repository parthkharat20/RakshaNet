import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, ShieldAlert, Cpu, RefreshCw, Radio, Terminal } from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { DEFAULT_OFFICER_BADGE } from '../../utils/constants';

export const TopBar = () => {
  const { isScoring, runScoring, refreshData, isLoading, stats } = useAlertContext();
  const location = useLocation();

  return (
    <header className="h-16 border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Brand & Emblem */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg tracking-wider text-white">RAKSHA<span className="text-blue-500">NET</span></span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60">I4C / NCRP</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">National Cyber Financial Fraud Interdiction</p>
          </div>
        </Link>

        {/* Tactical Nav Tabs */}
        <nav className="ml-8 hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/5">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              location.pathname === '/' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Overview & Telemetry
          </Link>
          <Link
            to="/command"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              location.pathname === '/command' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Command Center
          </Link>
        </nav>
      </div>

      {/* Live System Status & Controls */}
      <div className="flex items-center gap-4">
        {/* Connection Pulse */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>SYSTEM ONLINE // 3 DUAL-DB ENGINES</span>
        </div>

        {/* AI Scoring Pipeline Trigger */}
        <button
          onClick={runScoring}
          disabled={isScoring}
          className={`btn-primary text-xs py-1.5 px-3 ${isScoring ? 'opacity-70 cursor-not-allowed' : ''}`}
          title="Run Dual-Branch AI Pipeline: Graph Link Prediction & Geo-Spatial Hotspots"
        >
          <Cpu className={`w-3.5 h-3.5 ${isScoring ? 'animate-spin' : ''}`} />
          <span>{isScoring ? 'Running AI Engine...' : 'Run Dual AI Pipeline'}</span>
        </button>

        {/* Refresh */}
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        {/* Officer Credential Badge */}
        <div className="flex items-center gap-2 pl-3 border-l border-white/10">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/15 flex items-center justify-center text-blue-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-mono text-slate-300 font-semibold">{DEFAULT_OFFICER_BADGE}</p>
            <p className="text-[10px] text-emerald-400 font-mono">AUTHORIZED OFFICER</p>
          </div>
        </div>
      </div>
    </header>
  );
};
