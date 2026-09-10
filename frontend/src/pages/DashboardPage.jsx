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

  // Active target fallback: selected alert or top alert
  const currentTarget = selectedAlert || (alerts && alerts.length > 0 ? alerts[0] : null);
  const isCritical = currentTarget?.risk_score >= 0.85;
  const isElevated = currentTarget?.risk_score >= 0.70 && currentTarget?.risk_score < 0.85;
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
    <div className="p-4 max-w-[1780px] mx-auto space-y-4 animate-in fade-in duration-200 select-none">
      {/* Top Operational Telemetry Strip */}
      <StatsBar />

      {/* Main Operations Grid: 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[780px]">
        {/* Left Column: Real-Time Incident Feed (5 Columns) */}
        <div className="lg:col-span-5 h-full">
          <AlertFeed
            onFreezeClick={handleFreezeFromFeed}
            onInspectClick={handleInspectFromFeed}
          />
        </div>

        {/* Right Column: Case Investigation Workbench (7 Columns) */}
        <div className="lg:col-span-7 h-full flex flex-col space-y-3">
          {/* Integrated Suspect Intelligence Banner */}
          {currentTarget && (
            <div className="command-panel p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B101D] border-white/10">
              {/* Suspect Info */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-950/80 text-red-400 border border-red-500/40' : 'bg-blue-950/80 text-blue-400 border border-blue-500/40'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-bold text-white text-sm">
                      {currentTarget.target_holder_name || 'Suspect Account'}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      {maskAccountNumber(currentTarget.target_account_number)}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-300 border border-white/10">
                      {currentTarget.bank_name || 'Active Bank Node'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
                    <span>Fused Risk:</span>
                    <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                      {(currentTarget.risk_score * 100).toFixed(1)}%
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>Status:</span>
                    {isFrozen ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Section 91 Lien Active
                      </span>
                    ) : (
                      <span className="text-red-400 font-semibold">Action Required</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Integrated Action Toolbar */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setDossierModalOpen(true)}
                  className="btn-command-secondary text-xs cursor-pointer"
                  title="Export Section 65B Electronic Evidence Brief"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">65B Dossier</span>
                </button>

                <button
                  onClick={() => setRestitutionModalOpen(true)}
                  className="btn-command-secondary text-xs cursor-pointer"
                  title="Draft Section 457 Cr.P.C. Restitution Order"
                >
                  <Coins className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">457 Restitution</span>
                </button>

                <button
                  onClick={() => setPatrolModalOpen(true)}
                  className="btn-command-secondary text-xs cursor-pointer"
                  title="Dispatch Beat Patrol to ATM"
                >
                  <Radio className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Patrol</span>
                </button>

                <FreezeButton
                  accountId={currentTarget.target_account_id}
                  accountHolder={currentTarget.target_holder_name}
                  isFrozen={isFrozen}
                />
              </div>
            </div>
          )}

          {/* Workbench Tab Navigation Bar */}
          <div className="flex items-center justify-between p-1 rounded-lg bg-[#070A12] border border-white/10 shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('GRAPH')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'GRAPH'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Topology Graph</span>
              </button>

              <button
                onClick={() => setActiveTab('MAP')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'MAP'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>ATM Hotspot Map</span>
              </button>

              <button
                onClick={() => setActiveTab('DOSSIER')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'DOSSIER'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Forensic SHAP Evidence</span>
              </button>

              <button
                onClick={() => setActiveTab('SYNDICATES')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'SYNDICATES'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Syndicate Clusters</span>
              </button>
            </div>

            {/* Jump to Fullscreen Tactical Command */}
            <button
              onClick={() => handleOpenCommand(currentTarget)}
              className="px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Full Tactical Theater</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Visualization Container */}
          <div className="flex-1 overflow-hidden relative rounded-lg border border-white/10 command-panel">
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

      {/* Global Modals */}
      {currentTarget && (
        <>
          <PatrolDispatchModal
            isOpen={patrolModalOpen}
            onClose={() => setPatrolModalOpen(false)}
            targetHotspot={{
              alert_id: currentTarget.id,
              terminal_id: currentTarget.target_terminal_id || 'ATM_MUM_001',
              name: currentTarget.target_atm_name || 'State Bank of India - Matunga East ATM',
              lat: currentTarget.target_lat || 19.0270,
              lon: currentTarget.target_lon || 72.8550
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
