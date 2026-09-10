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
  Radio,
  Coins,
  LayoutGrid,
  Columns,
  Scale
} from 'lucide-react';
import { maskAccountNumber } from '../utils/constants';

export const CommandPage = () => {
  const location = useLocation();
  const { alerts, selectedAlert, setSelectedAlert } = useAlertContext();
  
  // Layout mode: 'TRI' (Graph + Map + SHAP), 'DUAL' (Graph + Map), 'FORENSIC' (Graph + SHAP)
  const [layoutMode, setLayoutMode] = useState('TRI');

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
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#09090b] select-none">
      {/* Tactical Subheader / Context Bar */}
      <div className="h-12 border-b border-white/[0.08] bg-zinc-900/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/[0.06]"
            title="Return to Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-200 text-xs tracking-wide uppercase">
              Command Theater
            </span>
          </div>

          {/* View Mode Switcher Pills */}
          <div className="hidden md:flex items-center gap-1 ml-3 p-0.5 rounded-lg bg-zinc-950/80 border border-white/[0.06] text-xs">
            <button
              onClick={() => setLayoutMode('TRI')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'TRI'
                  ? 'bg-zinc-800 text-white shadow-xs border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
              title="Full Tri-Command Grid (Graph + Map + SHAP)"
            >
              <LayoutGrid className="w-3 h-3 text-zinc-400" />
              <span>Tri-Grid (All)</span>
            </button>

            <button
              onClick={() => setLayoutMode('DUAL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'DUAL'
                  ? 'bg-zinc-800 text-white shadow-xs border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
              title="Graph & Map Surveillance"
            >
              <Columns className="w-3 h-3 text-zinc-400" />
              <span>Surveillance (2)</span>
            </button>

            <button
              onClick={() => setLayoutMode('FORENSIC')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'FORENSIC'
                  ? 'bg-zinc-800 text-white shadow-xs border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
              title="Graph & SHAP Attribution Deep-Dive"
            >
              <Scale className="w-3 h-3 text-zinc-400" />
              <span>Forensic XAI (2)</span>
            </button>
          </div>
        </div>

        {/* Selected Suspect Info Ticker & Full Action Suite */}
        {currentTarget ? (
          <div className="flex items-center gap-2 text-xs">
            <div className="hidden lg:flex items-center gap-2 bg-zinc-950/80 px-2.5 py-1 rounded-md border border-white/[0.06]">
              <span className="text-zinc-500 text-[10px]">TARGET:</span>
              <span className="font-semibold text-white">{currentTarget.target_holder_name}</span>
              <span className="text-zinc-400 font-mono text-[11px]">({maskAccountNumber(currentTarget.target_account_number)})</span>
              <span className={`px-1.5 py-0.5 rounded font-medium font-mono text-[10px] ${
                isCritical ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40' : 'bg-zinc-800 text-zinc-300 border border-zinc-700/50'
              }`}>
                {(currentTarget.risk_score * 100).toFixed(0)}% RISK
              </span>
            </div>

            {/* Quick Tactical Action Buttons */}
            <button
              onClick={() => setDossierModalOpen(true)}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.06] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Export Section 65B Evidence Dossier"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden xl:inline">Sec 65B</span>
            </button>

            <button
              onClick={() => setRestitutionModalOpen(true)}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.06] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Execute Section 457 Restitution"
            >
              <Coins className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden xl:inline">Sec 457</span>
            </button>

            <button
              onClick={() => setPatrolModalOpen(true)}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.06] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Dispatch Mobile Beat Patrol to ATM"
            >
              <Radio className="w-3.5 h-3.5 text-zinc-400" />
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

      {/* Main Tactical Viewport: Adaptive Grid based on layoutMode */}
      <div className="flex-1 p-2.5 overflow-hidden">
        {layoutMode === 'TRI' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
            {/* Screen 1: Neo4j Multi-Hop Graph (4 Cols / ~33%) */}
            <div className="lg:col-span-4 h-full rounded-xl overflow-hidden border border-white/[0.06] bg-zinc-900/60 relative">
              <TxnGraph
                accountId={targetAccId}
                accountNumber={currentTarget?.target_account_number}
                onNodeClick={(node) => {
                  const matched = alerts.find(a => a.target_account_id === node.id || a.target_account_number === node.accountNumber);
                  if (matched) setSelectedAlert(matched);
                }}
              />
            </div>

            {/* Screen 2: PostGIS ATM Cash-Out Hotspot Map (4 Cols / ~33%) */}
            <div className="lg:col-span-4 h-full rounded-xl overflow-hidden border border-white/[0.06] bg-zinc-900/60 relative">
              <HeatmapView />
            </div>

            {/* Screen 3: Dedicated Full-Height AI Forensic & SHAP Attribution Suite (4 Cols / ~34%) */}
            <div className="lg:col-span-4 h-full rounded-xl overflow-y-auto border border-white/[0.06] bg-zinc-900/60 p-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-semibold text-zinc-200 text-xs tracking-wide uppercase">
                    Forensic XAI Intelligence
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  Target: {currentTarget ? maskAccountNumber(currentTarget.target_account_number) : 'N/A'}
                </span>
              </div>

              <ExplainPanel
                explanation={currentTarget?.explanation}
                fusedScore={currentTarget?.risk_score || 0}
                graphScore={currentTarget?.graph_score || 0}
                geoScore={currentTarget?.geo_score || 0}
              />
            </div>
          </div>
        )}

        {layoutMode === 'DUAL' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-2.5 overflow-hidden">
            {/* 50% Graph */}
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

            {/* 50% Map */}
            <div className="h-full rounded-xl overflow-hidden border border-white/[0.06] bg-zinc-900/60 relative">
              <HeatmapView />
            </div>
          </div>
        )}

        {layoutMode === 'FORENSIC' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
            {/* 60% Graph */}
            <div className="lg:col-span-7 h-full rounded-xl overflow-hidden border border-white/[0.06] bg-zinc-900/60 relative">
              <TxnGraph
                accountId={targetAccId}
                accountNumber={currentTarget?.target_account_number}
                onNodeClick={(node) => {
                  const matched = alerts.find(a => a.target_account_id === node.id || a.target_account_number === node.accountNumber);
                  if (matched) setSelectedAlert(matched);
                }}
              />
            </div>

            {/* 40% Forensic SHAP */}
            <div className="lg:col-span-5 h-full rounded-xl overflow-y-auto border border-white/[0.06] bg-zinc-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-semibold text-zinc-200 text-xs tracking-wide uppercase">
                    Forensic XAI & SHAP Attribution
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  Target: {currentTarget ? maskAccountNumber(currentTarget.target_account_number) : 'N/A'}
                </span>
              </div>

              <ExplainPanel
                explanation={currentTarget?.explanation}
                fusedScore={currentTarget?.risk_score || 0}
                graphScore={currentTarget?.graph_score || 0}
                geoScore={currentTarget?.geo_score || 0}
              />
            </div>
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

