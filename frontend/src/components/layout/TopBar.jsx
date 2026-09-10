import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
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
  Shield,
  Activity
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
      {/* 3-Color Sovereign Tiranga Ribbon */}
      <div className="tiranga-strip" />

      <header className="border-b border-white/10 bg-[#0A0E1A] sticky top-0 z-50 select-none">
        {/* Top Sovereign Telemetry & Legal Clearance Strip */}
        <div className="h-7 px-6 bg-[#070A12] border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>गृह मंत्रालय, भारत सरकार | Ministry of Home Affairs</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">भारतीय साइबर अपराध समन्वय केंद्र (I4C)</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-500 hidden xl:inline">Sec 91 CrPC • Sec 69B IT Act • Sec 457 CrPC</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live IST Atomic Clock */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{istDate}</span>
              <span className="font-bold text-white font-mono">{istTime} IST</span>
              <span className="px-1 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[9px] font-semibold">
                NPL SYNC
              </span>
            </div>

            <span className="text-slate-700">•</span>

            {/* Real-time CFCFRMS Gateway Status */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className={wsConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {wsConnected ? 'CFCFRMS LIVE' : 'RECONNECTING'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Operational Command Bar */}
        <div className="h-16 px-6 flex items-center justify-between gap-4">
          {/* Brand Mark & Agency Scope */}
          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-[#0F172A] border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm group-hover:border-blue-400 transition-colors">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-lg tracking-wider text-white">
                    RAKSHA<span className="text-blue-500">NET</span>
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40 font-semibold tracking-wider uppercase">
                    CYBER COMMAND
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono -mt-0.5">
                  National Cyber Financial Fraud Interdiction Grid
                </p>
              </div>
            </Link>

            {/* Primary Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 p-1 rounded-lg bg-[#070A12] border border-white/5">
              <Link
                to="/"
                className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Overview & Telemetry
              </Link>
              <Link
                to="/command"
                className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                  location.pathname === '/command'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Command Theater</span>
              </Link>
            </nav>
          </div>

          {/* Operational Tools & Authorized Officer Profile */}
          <div className="flex items-center gap-2">
            {/* Audio Alerts Toggle */}
            <button
              onClick={toggleMuteAudio}
              className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                isAudioMuted
                  ? 'text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/5'
                  : 'text-blue-400 border-blue-500/30 bg-blue-950/30 hover:bg-blue-950/50'
              }`}
              title={isAudioMuted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Sync Telemetry Button */}
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Operational Tool Suite */}
            <div className="flex items-center gap-1.5">
              {/* ⚡ Simulate Attack Modal Trigger */}
              <button
                onClick={() => setIsScenarioModalOpen(true)}
                className="btn-command-secondary cursor-pointer"
                title="Inject live cyber syndicate scenario for demonstration"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Attack</span>
              </button>

              {/* 🤝 Citizen Recovery Portal Trigger */}
              <button
                onClick={() => setIsTrackModalOpen(true)}
                className="btn-command-secondary cursor-pointer"
                title="Track Citizen NCRP Cybercrime Complaint Status"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                <span>Citizen Portal</span>
              </button>

              {/* 🤖 Dual-Branch AI Scoring Trigger */}
              <button
                onClick={runScoring}
                disabled={isScoring}
                className={`btn-command-secondary cursor-pointer ${isScoring ? 'opacity-60 cursor-not-allowed' : ''}`}
                title="Execute Dual-Branch AI: Graph Link Prediction & Spatial Hotspots"
              >
                <Cpu className={`w-3.5 h-3.5 text-blue-400 ${isScoring ? 'animate-spin' : ''}`} />
                <span>{isScoring ? 'AI Scoring...' : 'Run Dual AI'}</span>
              </button>
            </div>

            {/* Authorized Law Enforcement Officer Profile */}
            <div className="flex items-center gap-2 pl-3 ml-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-lg bg-[#0F172A] border border-white/10 flex items-center justify-center text-slate-300">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-right hidden xl:block leading-tight font-mono">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-bold text-white tracking-tight">{officer.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Level-4 Active Clearance" />
                </div>
                <div className="text-[10px] text-slate-400">
                  <span className="text-blue-400 font-semibold">{officer.badge_id}</span>
                  <span className="mx-1">•</span>
                  <span>Level-4 LEA</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logoutOfficer}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                title="Officer Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Real-time WebSocket Alert Banner */}
        {wsNotification && (
          <div className="bg-blue-950/80 border-t border-blue-600/30 px-6 py-1.5 text-xs font-mono text-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-bold text-[9px] uppercase">
                INTER-BANK LIEN FLASH
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
