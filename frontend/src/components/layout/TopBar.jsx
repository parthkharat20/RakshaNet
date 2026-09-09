import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Radio,
  Terminal,
  LogOut,
  Wifi,
  WifiOff,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { getStoredOfficer, logoutOfficer } from '../../utils/api';
import { ScenarioModal } from '../demo/ScenarioModal';

export const TopBar = () => {
  const {
    isScoring,
    runScoring,
    refreshData,
    isLoading,
    stats,
    wsConnected,
    wsNotification,
    isAudioMuted,
    toggleMuteAudio
  } = useAlertContext();
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const location = useLocation();
  const officer = getStoredOfficer();

  return (
    <>
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

        {/* WebSocket Notification Toast */}
        {wsNotification && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-lg bg-blue-950/90 border border-blue-700/50 text-blue-200 text-xs font-mono shadow-lg animate-in slide-in-from-top duration-300 z-50 max-w-md text-center backdrop-blur-sm">
            <span className="text-blue-400 font-bold mr-1">📡 LIVE:</span>
            {wsNotification.message}
          </div>
        )}

        {/* Live System Status & Controls */}
        <div className="flex items-center gap-3">
          {/* WebSocket Connection Status */}
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono ${
            wsConnected 
              ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' 
              : 'bg-amber-950/40 border-amber-800/40 text-amber-400'
          }`}>
            <span className="relative flex h-2 w-2">
              {wsConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            {wsConnected ? (
              <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> LIVE FEED</span>
            ) : (
              <span className="flex items-center gap-1"><WifiOff className="w-3 h-3" /> RECONNECTING</span>
            )}
          </div>

          {/* Tactical Audio Toggle */}
          <button
            onClick={toggleMuteAudio}
            className={`p-2 rounded-lg border transition-colors ${
              isAudioMuted
                ? 'text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/5'
                : 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20'
            }`}
            title={isAudioMuted ? 'Unmute Tactical Chimes' : 'Mute Tactical Chimes'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* ⚡ SIH Live Incident Injector Button */}
          <button
            onClick={() => setIsScenarioModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/25 border border-rose-500/40 transition-all active:scale-95"
            title="Inject simulated live cyber scam incident for hackathon demonstration"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Simulate Live Attack</span>
          </button>

          {/* AI Scoring Pipeline Trigger */}
          <button
            onClick={runScoring}
            disabled={isScoring}
            className={`btn-primary text-xs py-1.5 px-3 ${isScoring ? 'opacity-70 cursor-not-allowed' : ''}`}
            title="Run Dual-Branch AI Pipeline: Graph Link Prediction & Geo-Spatial Hotspots"
          >
            <Cpu className={`w-3.5 h-3.5 ${isScoring ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isScoring ? 'Running AI...' : 'Run Dual AI'}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Officer Credential Badge with Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/15 flex items-center justify-center text-blue-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="text-right hidden xl:block">
              <p className="text-[11px] font-mono text-slate-300 font-semibold">
                {officer?.badge_id || 'UNAUTHENTICATED'}
              </p>
              <p className="text-[10px] text-emerald-400 font-mono">
                {officer?.name || 'Login Required'}
              </p>
            </div>
            <button
              onClick={logoutOfficer}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Live Scenario Simulator Modal */}
      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
      />
    </>
  );
};

