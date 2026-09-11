import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  Cpu,
  RefreshCw,
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
    wsConnected,
    wsNotification,
    isAudioMuted,
    toggleMuteAudio
  } = useAlertContext();
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const location = useLocation();
  const officer = getStoredOfficer();

  // Real-time ticking clock formatted as in official system ticker (e.g. 11 SEPT 2026 15:49:14 IST)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = now.getDate();
      const monthNames = ['SEPT', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'];
      // Format Month
      const fullMonth = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'][now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${day} ${fullMonth} ${year} ${hours}:${minutes}:${seconds} IST`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Official Government & Legal Compliance Banner Strip */}
      <div className="bg-slate-950 border-b border-white/10 text-[11px] font-mono text-slate-300 px-4 py-1 flex flex-wrap items-center justify-between gap-2 shrink-0 z-50">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="font-bold text-slate-100">गृह मंत्रालय, भारत सरकार | Ministry of Home Affairs</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-semibold">भारतीय साइबर अपराध समन्वय केंद्र (I4C)</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Sec. 91 CrPC</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Sec. 69B IT Act</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Sec. 457 CrPC</span>
        </div>

        <div className="flex items-center gap-2.5 text-[11px] shrink-0 font-mono">
          <span className="text-slate-200 font-semibold">{timeStr || '11 SEPT 2026 15:49:14 IST'}</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-700/50 text-[10px] font-bold">
            [NPL SYNC]
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            CFCFRMS LIVE
          </span>
        </div>
      </div>

      {/* Main Professional Header Bar */}
      <header className="h-14 border-b border-white/10 bg-slate-950 px-6 flex items-center justify-between sticky top-0 z-40 text-white">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/15 flex items-center justify-center text-blue-400 group-hover:border-blue-500/50 transition-colors">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base tracking-wider text-white">RAKSHA<span className="text-blue-400">NET</span></span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/10 font-bold">
                  MHA / I4C
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">National Cyber Financial Fraud Interdiction System</p>
            </div>
          </Link>

          {/* Tactical Nav Tabs */}
          <nav className="ml-6 hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-white/10 font-mono">
            <Link
              to="/"
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                location.pathname === '/'
                  ? 'bg-slate-800 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Overview & Telemetry
            </Link>
            <Link
              to="/command"
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                location.pathname === '/command'
                  ? 'bg-slate-800 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              Command Center
            </Link>
          </nav>
        </div>

        {/* WebSocket Notification Toast */}
        {wsNotification && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-lg bg-slate-900/95 border border-blue-500/40 text-slate-200 text-xs font-mono shadow-xl animate-in slide-in-from-top duration-300 z-50 max-w-md text-center backdrop-blur-md">
            <span className="text-blue-400 font-bold mr-1">📡 LIVE ALERT:</span>
            {wsNotification.message}
          </div>
        )}

        {/* Live System Status & Action Controls */}
        <div className="flex items-center gap-2.5 font-mono">
          {/* WebSocket Connection Status */}
          <div className={`hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono ${
            wsConnected
              ? 'bg-slate-900 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-900 border-amber-500/30 text-amber-400'
          }`}>
            <span className="relative flex h-2 w-2">
              {wsConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            {wsConnected ? (
              <span className="flex items-center gap-1 text-[11px] font-bold"><Wifi className="w-3 h-3 text-emerald-400" /> LIVE FEED</span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold"><WifiOff className="w-3 h-3 text-amber-400" /> CONNECTING</span>
            )}
          </div>

          {/* Tactical Audio Toggle */}
          <button
            onClick={toggleMuteAudio}
            className={`p-1.5 rounded-lg border transition-colors ${
              isAudioMuted
                ? 'text-slate-500 border-white/10 hover:text-slate-300 hover:bg-white/5 bg-slate-900'
                : 'text-amber-400 border-amber-500/40 bg-slate-900 hover:bg-amber-950/30'
            }`}
            title={isAudioMuted ? 'Unmute Tactical Audio' : 'Mute Tactical Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Simulate Incident Button */}
          <button
            onClick={() => setIsScenarioModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 transition-colors shadow-sm"
            title="Inject simulated live cyber financial fraud incident"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Attack</span>
          </button>

          {/* AI Pipeline Trigger Button */}
          <button
            onClick={runScoring}
            disabled={isScoring}
            className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-500/40 transition-colors shadow-sm ${
              isScoring ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            title="Run Dual-Branch AI Pipeline"
          >
            <Cpu className={`w-3.5 h-3.5 text-blue-400 ${isScoring ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isScoring ? 'Running AI...' : 'Run Dual AI'}</span>
          </button>

          {/* Refresh Data */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/10 transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Officer Credential Badge with Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/15 flex items-center justify-center text-blue-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="text-right hidden xl:block">
              <p className="text-[11px] font-mono text-slate-200 font-bold leading-tight">
                {officer?.badge_id || 'LE-CYBER-MUM'}
              </p>
              <p className="text-[10px] text-emerald-400 font-mono leading-tight">
                {officer?.name || 'Officer Active'}
              </p>
            </div>
            <button
              onClick={logoutOfficer}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
              title="Logout Officer"
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

