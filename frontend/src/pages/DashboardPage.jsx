import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsBar } from '../components/analytics/StatsBar';
import { AlertFeed } from '../components/alerts/AlertFeed';
import { TxnGraph } from '../components/graph/TxnGraph';
import { HeatmapView } from '../components/map/HeatmapView';
import { SyndicateHub } from '../components/syndicates/SyndicateHub';
import { CaseEvidenceDocket } from '../components/explain/CaseEvidenceDocket';
import { PatrolDispatchModal } from '../components/patrols/PatrolDispatchModal';
import { LegalDossierModal } from '../components/dossier/LegalDossierModal';
import { RestitutionModal } from '../components/restitution/RestitutionModal';
import { useAlertContext } from '../contexts/AlertContext';
import {
  Network,
  MapPin,
  Flame,
  ChevronRight,
  Maximize2
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { alerts, selectedAlert, setSelectedAlert } = useAlertContext();
  const [activeCanvas, setActiveCanvas] = useState('GRAPH'); // GRAPH, MAP, SYNDICATES

  // Global Action Modal States
  const [patrolModalOpen, setPatrolModalOpen] = useState(false);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [restitutionModalOpen, setRestitutionModalOpen] = useState(false);

  // Active suspect fallback: selected alert or first alert
  const currentTarget = selectedAlert || (alerts && alerts.length > 0 ? alerts[0] : null);

  const handleOpenCommand = () => {
    navigate('/command', { state: { selectedAccountId: currentTarget?.target_account_id } });
  };

  return (
    <div className="p-4 max-w-[1920px] mx-auto space-y-3.5 animate-in fade-in duration-200 select-none">
      {/* Top Operational Telemetry Bar */}
      <StatsBar />

      {/* 3-Zone Mission-Critical Command Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-[calc(100vh-14.5rem)] min-h-[660px]">
        {/* Zone 1: Real-Time Threat Intelligence Radar (3 Cols / ~25%) */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <AlertFeed />
        </div>

        {/* Zone 2: Interactive Visual Topology & Spatial Canvas (5 Cols / ~41.7%) */}
        <div className="lg:col-span-5 h-full flex flex-col space-y-2 overflow-hidden">
          {/* Canvas View Switcher Ribbon */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0B101D] border border-white/10 shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveCanvas('GRAPH')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeCanvas === 'GRAPH'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Topology Graph</span>
              </button>

              <button
                onClick={() => setActiveCanvas('MAP')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeCanvas === 'MAP'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>ATM Hotspot Map</span>
              </button>

              <button
                onClick={() => setActiveCanvas('SYNDICATES')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeCanvas === 'SYNDICATES'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Syndicate Clusters</span>
              </button>
            </div>

            {/* Jump to Fullscreen Tactical Command Theater */}
            <button
              onClick={handleOpenCommand}
              className="px-2 py-1 text-xs font-mono text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
              title="Open full tactical command theater"
            >
              <span className="hidden xl:inline">Tactical Theater</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Canvas Body */}
          <div className="flex-1 overflow-hidden relative rounded-lg border border-white/10 command-panel">
            {activeCanvas === 'GRAPH' && (
              <TxnGraph
                accountId={currentTarget?.target_account_id}
                accountNumber={currentTarget?.target_account_number}
                onNodeClick={(node) => {
                  const matched = alerts.find(a => a.target_account_id === node.id || a.target_account_number === node.accountNumber);
                  if (matched) setSelectedAlert(matched);
                }}
              />
            )}

            {activeCanvas === 'MAP' && (
              <HeatmapView />
            )}

            {activeCanvas === 'SYNDICATES' && (
              <div className="h-full overflow-y-auto">
                <SyndicateHub />
              </div>
            )}
          </div>
        </div>

        {/* Zone 3: Suspect Evidence Dossier & Action Docket (4 Cols / ~33.3%) */}
        <div className="lg:col-span-4 h-full overflow-hidden">
          <CaseEvidenceDocket
            alert={currentTarget}
            onOpenDossier={() => setDossierModalOpen(true)}
            onOpenRestitution={() => setRestitutionModalOpen(true)}
            onOpenPatrol={() => setPatrolModalOpen(true)}
          />
        </div>
      </div>

      {/* Global Interactive Modals */}
      {currentTarget && (
        <>
          <PatrolDispatchModal
            isOpen={patrolModalOpen}
            onClose={() => setPatrolModalOpen(false)}
            targetHotspot={{
              alert_id: currentTarget.id || currentTarget.alert_id,
              terminal_id: currentTarget.target_terminal_id || 'ATM_MUM_001',
              name: currentTarget.target_atm_name || 'State Bank of India - Matunga East ATM',
              lat: currentTarget.target_lat || 19.0270,
              lon: currentTarget.target_lon || 72.8550
            }}
          />

          <LegalDossierModal
            isOpen={dossierModalOpen}
            onClose={() => setDossierModalOpen(false)}
            alertId={currentTarget.id || currentTarget.alert_id}
          />

          <RestitutionModal
            isOpen={restitutionModalOpen}
            onClose={() => setRestitutionModalOpen(false)}
            alertId={currentTarget.id || currentTarget.alert_id}
          />
        </>
      )}
    </div>
  );
};
