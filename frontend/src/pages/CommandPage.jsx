import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { TxnGraph } from '../components/graph/TxnGraph';
import { HeatmapView } from '../components/map/HeatmapView';
import { ExplainPanel } from '../components/explain/ExplainPanel';
import { FreezeButton } from '../components/actions/FreezeButton';
import { PatrolDispatchModal } from '../components/patrols/PatrolDispatchModal';
import { LegalDossierModal } from '../components/dossier/LegalDossierModal';
import { RestitutionModal } from '../components/restitution/RestitutionModal';
import { useAlertContext } from '../contexts/AlertContext';
import {
  Terminal,
  ArrowLeft,
  FileText,
  ChevronDown,
  ChevronUp,
  Radio,
  Coins
} from 'lucide-react';
import { maskAccountNumber } from '../utils/constants';

export const CommandPage = () => {
  const location = useLocation();
  const { alerts, selectedAlert, setSelectedAlert } = useAlertContext();
  const [drawerExpanded, setDrawerExpanded] = useState(true);

  // Tactical Action Modal States
  const [patrolModalOpen, setPatrolModalOpen] = useState(false);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [restitutionModalOpen, setRestitutionModalOpen] = useState(false);

  // Sync selected account from navigation state if available
  useEffect(() => {
    if (location.state?.selectedAccountId && alerts.length > 0) {
      const match = alerts.find(a => a.target_account_id === location.state.selectedAccountId);
      if (match) setSelectedAlert(match);
    }
  }, [location.state, alerts, setSelectedAlert]);

  // Fallback suspect
  const currentTarget = selectedAlert || (alerts && alerts.length > 0 ? alerts[0] : null);
  const targetAccId = currentTarget?.target_account_id;
  const isCritical = currentTarget?.risk_score >= 0.85;
  const isFrozen = currentTarget?.status === 'FREEZE_DISPATCHED' || currentTarget?.status === 'FREEZE_CONFIRMED';

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#09090b] font-mono select-none">
      {/* Tactical Subheader / Context Bar */}
      <div className="h-12 border-b border-white/[0.08] bg-zinc-900/80 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/[0.06]"
            title="Return to Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-zinc-200 text-xs tracking-wide uppercase">
              Command Theater
            </span>
          </div>
        </div>

        {/* Selected Suspect Info Ticker & Full Action Suite */}
        {currentTarget ? (
          <div className="flex items-center gap-2 text-xs">
            <div className="hidden lg:flex items-center gap-2 bg-zinc-950/80 px-2.5 py-1 rounded-md border border-white/[0.06]">
              <span className="text-zinc-500 text-[10px]">TARGET:</span>
              <span className="font-medium text-white">{currentTarget.target_holder_name}</span>
              <span className="text-zinc-500">({maskAccountNumber(currentTarget.target_account_number)})</span>
              <span className={`px-1.5 py-0.2 rounded font-medium text-[10px] ${
                isCritical ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {(currentTarget.risk_score * 100).toFixed(0)}% RISK
              </span>
            </div>

            {/* Quick Tactical Action Buttons */}
            <button
              onClick={() => setDossierModalOpen(true)}
              className="px-2.5 py-1 rounded-md text-xs font-mono text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.06] transition-colors cursor-pointer flex items-center gap-1"
              title="Export Section 65B Evidence Dossier"
            >
              <FileText className="w-3 h-3 text-emerald-400" />
              <span className="hidden xl:inline">Sec 65B</span>
            </button>

            <button
              onClick={() => setRestitutionModalOpen(true)}
              className="px-2.5 py-1 rounded-md text-xs font-mono text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.06] transition-colors cursor-pointer flex items-center gap-1"
              title="Execute Section 457 Restitution"
            >
              <Coins className="w-3 h-3 text-cyan-400" />
              <span className="hidden xl:inline">Sec 457</span>
            </button>

            <button
              onClick={() => setPatrolModalOpen(true)}
              className="px-2.5 py-1 rounded-md text-xs font-mono text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.06] transition-colors cursor-pointer flex items-center gap-1"
              title="Dispatch Mobile Beat Patrol to ATM"
            >
              <Radio className="w-3 h-3 text-rose-400" />
              <span className="hidden xl:inline">Patrol</span>
            </button>

            <div className="w-36">
              <FreezeButton
                accountId={targetAccId}
                accountHolder={currentTarget.target_holder_name}
                isFrozen={isFrozen}
              />
            </div>
          </div>
        ) : (
          <div className="text-xs text-zinc-500">
            No suspect node selected.
          </div>
        )}
      </div>

      {/* Dual Split Screen: Graph (Left) & Geo Hotspots (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2.5 p-2.5 overflow-hidden">
        {/* Left Screen: Neo4j Multi-Hop Graph */}
        <div className="h-full rounded-xl overflow-hidden border border-white/[0.06] bg-zinc-900/60 relative">
          <TxnGraph
            accountId={targetAccId}
            accountNumber={currentTarget?.target_account_number}
            onNodeClick={(node) => {
              const matched = alerts.find(a => a.target_account_id === node.id || a.target_account_number === node.accountNumber);
              if (matched) setSelectedAlert(matched);
            }}
          />
        </div>

        {/* Right Screen: PostGIS ATM Cash-Out Hotspot Map */}
        <div className="h-full rounded-xl overflow-hidden border border-white/[0.06] bg-zinc-900/60 relative">
          <HeatmapView />
        </div>
      </div>

      {/* Bottom Collapsible Intelligence Tray */}
      <div className={`border-t border-white/[0.08] bg-zinc-950/95 transition-all duration-200 shrink-0 ${
        drawerExpanded ? 'h-64' : 'h-8'
      }`}>
        <div
          onClick={() => setDrawerExpanded(!drawerExpanded)}
          className="h-8 px-5 flex items-center justify-between cursor-pointer hover:bg-zinc-900/50 border-b border-white/[0.04] select-none text-xs"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3 h-3 text-indigo-400" />
            <span className="font-semibold text-zinc-200">Intelligence Dossier & Explainability</span>
            <span className="text-[11px] text-zinc-500">
              ({currentTarget ? `${currentTarget.target_holder_name} • ${maskAccountNumber(currentTarget.target_account_number)}` : 'No Target Selected'})
            </span>
          </div>

          <div className="flex items-center gap-1 text-zinc-400 text-xs">
            <span>{drawerExpanded ? 'Collapse' : 'Expand'}</span>
            {drawerExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </div>

        {drawerExpanded && (
          <div className="h-[calc(16rem-2rem)] overflow-y-auto p-3.5">
            <ExplainPanel
              explanation={currentTarget?.explanation}
              fusedScore={currentTarget?.risk_score || 0}
              graphScore={currentTarget?.graph_score || 0}
              geoScore={currentTarget?.geo_score || 0}
            />
          </div>
        )}
      </div>

      {/* Action Modals */}
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
