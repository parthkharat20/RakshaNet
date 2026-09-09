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
  VolumeX,
  HeartHandshake,
  Clock,
  Award,
  Layers
} from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { getStoredOfficer, logoutOfficer } from '../../utils/api';
import { ScenarioModal } from '../demo/ScenarioModal';
import { VictimTrackModal } from '../restitution/VictimTrackModal';

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
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const location = useLocation();
  const officer = getStoredOfficer() || {
    badge_id: 'LE-CYBER-MUM-4029',
    name: 'Inspector Parth Kharat',
    rank: 'Cyber Crime Inspector',
    department: 'Maharashtra Cyber Cell, I4C Division'
  };

  // Live Indian Standard Time (IST) Atomic Clock
  const [istTime, setIstTime] = useState('');
  const [istDate, setIstDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const dateStr = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).toUpperCase();

      setIstTime(timeStr);
      setIstDate(dateStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* 3-Color National Tiranga Ribbon (Saffron, White, India Green) */}
      <div className="tiranga-ribbon" />

      <header className="border-b border-white/10 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50">
        {/* Top Operational Telemetry & Statutory Classification Bar */}
        <div className="h-6 px-6 bg-slate-950 border-b border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-400 font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              RESTRICTED LEVEL-4 LEA GATEWAY
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">AUTHORITY: MHA / I4C / CERT-IN</span>
            <span className="text-slate-600">|</span>
            <span className="text-blue-400">STATUTORY: SEC 91 CrPC • SEC 69B IT ACT • SEC 457 CrPC / BNSS 503</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live IST Atomic Clock */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{istDate}</span>
              <span className="font-bold text-white tracking-wider">{istTime} IST</span>
              <span className="px-1 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold">
                NPL SYNC
              </span>
            </div>

            <span className="text-slate-600">|</span>

            {/* Live WebSocket Status */}
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className={wsConnected ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {wsConnected ? 'CFCFRMS LIVE' : 'FEED OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Command Header Bar */}
        <div className="h-16 px-6 flex items-center justify-between">
          {/* Official Emblem & National Brand Section */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              {/* Ashoka Chakra & Lion Emblem Seal */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600/30 via-slate-900 to-blue-900/40 p-0.5 border border-amber-500/50 shadow-lg shadow-amber-500/10 group-hover:border-amber-400 transition-all flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center relative">
                  {/* Stylized State Insignia */}
                  <ShieldAlert className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] text-amber-400/90 font-mono tracking-widest uppercase font-bold">
                    भारत सरकार | गृह मंत्रालय | I4C
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-display font-black text-xl tracking-wider text-white">
                    RAKSHA<span className="text-blue-500">NET</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/90 text-blue-300 border border-blue-700/60 font-bold tracking-wider">
                    CFCFRMS TACTICAL
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono -mt-0.5">
                  National Cyber Financial Fraud Interdiction & Magisterial Restitution Grid
                </p>
              </div>
            </Link>

            {/* Tactical Navigation Tabs */}
            <nav className="ml-6 hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  location.pathname === '/'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                Overview & Telemetry
              </Link>
              <Link
                to="/command"
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                  location.pathname === '/command'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Command Center
              </Link>
            </nav>
          </div>

          {/* Action Controls & Authorized Officer Dossier */}
          <div className="flex items-center gap-2.5">
            {/* Tactical Audio Chime Switch */}
            <button
              onClick={toggleMuteAudio}
              className={`p-2 rounded-xl border transition-all ${
                isAudioMuted
                  ? 'text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/5'
                  : 'text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20'
              }`}
              title={isAudioMuted ? 'Tactical Audio: Muted' : 'Tactical Audio: Active'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* ⚡ Simulate Live Attack (Hackathon Demo Trigger) */}
            <button
              onClick={() => setIsScenarioModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white shadow-lg shadow-red-500/20 border border-rose-500/40 transition-all active:scale-95 font-mono cursor-pointer"
              title="Inject live cyber attack syndicate scenario for demonstration"
            >
              <Zap className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span>Simulate Live Attack</span>
            </button>

            {/* 🤝 Citizen Recovery Portal (Section 457 Tracking) */}
            <button
              onClick={() => setIsTrackModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-3.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 shadow-sm transition-all font-mono cursor-pointer"
              title="Track Citizen NCRP Complaint & Magisterial Restitution Settlement"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Citizen Recovery Portal</span>
            </button>

            {/* AI Scoring Pipeline Trigger */}
            <button
              onClick={runScoring}
              disabled={isScoring}
              className={`btn-primary text-xs py-2 px-3.5 rounded-xl font-mono cursor-pointer ${
                isScoring ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              title="Execute Dual-Branch AI: Graph Link Prediction & Spatio-Temporal Clustering"
            >
              <Cpu className={`w-3.5 h-3.5 ${isScoring ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isScoring ? 'AI Scoring...' : 'Run Dual AI'}</span>
            </button>

            {/* Manual Telemetry Refresh */}
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              title="Sync Latest Database Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Authorized Law Enforcement Officer Profile */}
            <div className="flex items-center gap-2 pl-3 ml-1 border-l border-white/10">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-right hidden xl:block">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-mono font-bold text-white">{officer.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="MHA Active Clearance" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-end gap-1">
                  <span className="text-amber-400 font-semibold">{officer.badge_id}</span>
                  <span>•</span>
                  <span>{officer.rank}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logoutOfficer}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                title="Secure Officer Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Real-time WebSocket Notification Ticker */}
        {wsNotification && (
          <div className="bg-blue-950/90 border-t border-blue-600/40 px-6 py-1.5 text-xs font-mono text-blue-200 flex items-center justify-between animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-bold text-[10px]">
                INTER-BANK FLASH
              </span>
              <span>{wsNotification.message}</span>
            </div>
            <span className="text-[10px] text-blue-400">
              {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
            </span>
          </div>
        )}
      </header>

      {/* Demonstration Modals */}
      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
      />

      <VictimTrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />
    </>
  );
};


