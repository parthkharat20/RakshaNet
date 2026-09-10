import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Cpu,
  RefreshCw,
  Terminal,
  LogOut,
  Zap,
  Volume2,
  VolumeX,
  HeartHandshake,
  Clock,
  User
} from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { getStoredOfficer, logoutOfficer } from '../../utils/api';
import { BrandLogo } from '../common/BrandLogo';
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
    name: 'Insp. Parth Kharat',
    rank: 'Cyber Crime Inspector',
    department: 'Maharashtra Cyber Cell'
  };

  // Live IST Clock
  const [istTime, setIstTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="tiranga-strip" />

      <header className="border-b border-white/[0.08] bg-[#09090b]/95 backdrop-blur-md sticky top-0 z-50 select-none">
        <div className="h-14 px-5 flex items-center justify-between gap-4">
          {/* Brand & Nav */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center group">
              <BrandLogo size="default" />
            </Link>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900/80 border border-white/[0.06]">
              <Link
                to="/"
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  location.pathname === '/'
                    ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                Overview
              </Link>
              <Link
                to="/command"
                className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  location.pathname === '/command'
                    ? 'bg-zinc-800 text-white shadow-xs border border-white/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Command Theater</span>
              </Link>
            </nav>

            {/* Live Gateway & Clock Pill */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900/60 border border-white/[0.05] text-[11px] text-zinc-400">
              <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className={`text-[10px] font-mono font-bold ${wsConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {wsConnected ? 'LIVE' : 'RECONNECTING'}
              </span>
              <span className="text-zinc-700">|</span>
              <Clock className="w-3 h-3 text-zinc-500" />
              <span className="text-zinc-200 font-mono text-[11px]">{istTime} IST</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleMuteAudio}
              className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
                isAudioMuted
                  ? 'text-zinc-500 border-white/[0.06] hover:text-zinc-300 hover:bg-zinc-800/50'
                  : 'text-blue-400 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20'
              }`}
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Refresh */}
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-white/[0.06] transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Semantic Action Suite: Amber (Simulate), Emerald (Citizen), Cobalt (AI) */}
            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={() => setIsScenarioModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
                title="Inject attack simulation"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Attack</span>
              </button>

              <button
                onClick={() => setIsTrackModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
                title="Citizen restitution status"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                <span>Citizen Portal</span>
              </button>

              <button
                onClick={runScoring}
                disabled={isScoring}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/40 shadow-sm transition-all cursor-pointer ${
                  isScoring ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                title="Run Dual-AI Scoring"
              >
                <Cpu className={`w-3.5 h-3.5 text-white ${isScoring ? 'animate-spin' : ''}`} />
                <span>{isScoring ? 'Scoring...' : 'Run Dual AI'}</span>
              </button>
            </div>

            {/* Officer Clearance */}
            <div className="flex items-center gap-2.5 pl-3 ml-2 border-l border-white/[0.08]">
              <div className="w-7 h-7 rounded-md bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-400">
                <User className="w-3.5 h-3.5 text-zinc-300" />
              </div>
              <div className="text-right hidden sm:block leading-tight">
                <div className="text-xs font-medium text-zinc-200">{officer.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono">{officer.badge_id}</div>
              </div>

              <button
                onClick={logoutOfficer}
                className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* WebSocket Alert Banner */}
        {wsNotification && (
          <div className="bg-zinc-900/90 border-t border-white/[0.08] px-5 py-1 text-xs font-mono text-zinc-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-semibold text-white">INTERDICTION FLASH:</span>
              <span>{wsNotification.message}</span>
            </div>
            <span className="text-[10px] text-zinc-500">{istTime} IST</span>
          </div>
        )}
      </header>

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

