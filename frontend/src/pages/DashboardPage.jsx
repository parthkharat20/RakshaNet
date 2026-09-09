import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsBar } from '../components/analytics/StatsBar';
import { AlertFeed } from '../components/alerts/AlertFeed';
import { CaseDrawer } from '../components/alerts/CaseDrawer';
import { TxnGraph } from '../components/graph/TxnGraph';
import { HeatmapView } from '../components/map/HeatmapView';
import { SyndicateHub } from '../components/syndicates/SyndicateHub';
import { FreezeButton } from '../components/actions/FreezeButton';
import { PatrolDispatchModal } from '../components/patrols/PatrolDispatchModal';
import { LegalDossierModal } from '../components/dossier/LegalDossierModal';
import { RestitutionModal } from '../components/restitution/RestitutionModal';
import { useAlertContext } from '../contexts/AlertContext';
import {
  Network,
  MapPin,
  FileText,
  ChevronRight,
  Flame,
  Radio,
  Coins,
  ShieldAlert,
  Lock,
  Building,
  CheckCircle2
} from 'lucide-react';
import { maskAccountNumber } from '../utils/constants';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { alerts, selectedAlert, setSelectedAlert } = useAlertContext();
  const [activeTab, setActiveTab] = useState('GRAPH'); // GRAPH, MAP, DOSSIER, SYNDICATES

  // Quick Action Modal States
  const [patrolModalOpen, setPatrolModalOpen] = useState(false);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [restitutionModalOpen, setRestitutionModalOpen] = useState(false);

  // Active target fallback: selected alert or top critical alert
  const currentTarget = selectedAlert || (alerts && alerts.length > 0 ? alerts[0] : null);
  const isCritical = currentTarget?.risk_score >= 0.75;
  const isFrozen = currentTarget?.status === 'FREEZE_DISPATCHED' || currentTarget?.status === 'FREEZE_CONFIRMED';

  const handleOpenCommand = (alert) => {
    navigate('/command', { state: { selectedAccountId: alert?.target_account_id } });
  };

  const handleFreezeFromFeed = (alert) => {
    setSelectedAlert(alert);
    setActiveTab('DOSSIER');
  };

  const handleInspectFromFeed = (alert) => {
    setSelectedAlert(alert);
    setActiveTab('DOSSIER');
  };

  return (
    <div className="p-5 max-w-[1780px] mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Top National Telemetry KPI Cards */}
      <StatsBar />

      {/* Main Operations Grid: 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[800px]">
        {/* Left Column: Real-Time Prioritized Alert Stream (5 Columns) */}
        <div className="lg:col-span-5 h-full">
          <AlertFeed
            onFreezeClick={handleFreezeFromFeed}
            onInspectClick={handleInspectFromFeed}
          />
        </div>

        {/* Right Column: Multi-Modal Visualization & Investigation Theater (7 Columns) */}
        <div className="lg:col-span-7 h-full flex flex-col space-y-3">
          {/* Universal LEA Interdiction Action Bar */}
          {currentTarget && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs font-mono">
                      {currentTarget.target_holder_name || 'Suspect Account'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({maskAccountNumber(currentTarget.target_account_number)})
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-300 border border-white/10">
                      {currentTarget.bank_name || 'Active Node'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                    <span className="text-slate-400">Fused Risk:</span>
                    <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                      {(currentTarget.risk_score * 100).toFixed(1)}%
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">Status:</span>
                    {isFrozen ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> SEC 91 FROZEN
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold">ACTION PENDING</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Core Indian Law Enforcement Tactical Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDossierModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Generate court-admissible Section 65B Electronic Evidence Brief"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Sec 65B Dossier</span>
                </button>

                <button
                  onClick={() => setRestitutionModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Draft and execute Section 457 Cr.P.C. / BNSS 503 Magisterial Restitution"
                >
                  <Coins className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Sec 457 Restitution</span>
                </button>

                <button
                  onClick={() => setPatrolModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Dispatch nearest police beat marshal to predicted ATM cash-out point"
                >
                  <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span className="hidden sm:inline">Dispatch Patrol</span>
                </button>

                <FreezeButton
                  accountId={currentTarget.target_account_id}
                  accountHolder={currentTarget.target_holder_name}
                  isFrozen={isFrozen}
                />
              </div>
            </div>
          )}

          {/* Visual Mode Selector Tabs */}
          <div className="flex items-center justify-between bg-slate-900/70 p-1.5 rounded-xl border border-white/10 shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('GRAPH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'GRAPH'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Multi-Hop Graph</span>
              </button>

              <button
                onClick={() => setActiveTab('MAP')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'MAP'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>ATM Hotspot Map</span>
              </button>

              <button
                onClick={() => setActiveTab('DOSSIER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'DOSSIER'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>SHAP Evidence Dossier</span>
              </button>

              <button
                onClick={() => setActiveTab('SYNDICATES')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'SYNDICATES'
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Organized Syndicates</span>
              </button>
            </div>

            {/* Jump to Fullscreen Tactical Command */}
            <button
              onClick={() => handleOpenCommand(currentTarget)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Full Tactical Mode</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Visualization Container */}
          <div className="flex-1 overflow-hidden relative rounded-xl border border-white/10">
            {activeTab === 'GRAPH' && (
              <TxnGraph
                accountId={currentTarget?.target_account_id}
                onNodeClick={(node) => {
                  const matched = alerts.find(a => a.target_account_id === node.id);
                  if (matched) setSelectedAlert(matched);
                }}
              />
            )}

            {activeTab === 'MAP' && (
              <HeatmapView />
            )}

            {activeTab === 'DOSSIER' && (
              <CaseDrawer
                onOpenCommandCenter={handleOpenCommand}
              />
            )}

            {activeTab === 'SYNDICATES' && (
              <div className="h-full overflow-y-auto">
                <SyndicateHub />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Modals triggered from Universal Action Bar */}
      {currentTarget && (
        <>
          <PatrolDispatchModal
            isOpen={patrolModalOpen}
            onClose={() => setPatrolModalOpen(false)}
            targetHotspot={{
              alert_id: currentTarget.id,
              terminal_id: currentTarget.target_terminal_id || 'ATM_MUM_001',
              name: currentTarget.target_atm_name || 'State Bank of India - Matunga East ATM',
              lat: currentTarget.target_lat || (currentTarget.city === 'Delhi' ? 28.6290 : currentTarget.city === 'Bengaluru' ? 12.9352 : 19.0270),
              lon: currentTarget.target_lon || (currentTarget.city === 'Delhi' ? 77.2260 : currentTarget.city === 'Bengaluru' ? 77.6245 : 72.8550)
            }}
          />

          <LegalDossierModal
            isOpen={dossierModalOpen}
            onClose={() => setDossierModalOpen(false)}
            alertId={currentTarget.id}
          />

          <RestitutionModal
            isOpen={restitutionModalOpen}
            onClose={() => setRestitutionModalOpen(false)}
            alertId={currentTarget.id}
          />
        </>
      )}
    </div>
  );
};

