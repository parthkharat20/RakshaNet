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
  ShieldAlert,
  ArrowLeft,
  FileText,
  ChevronDown,
  ChevronUp,
  Radio,
  Coins,
  Lock,
  Building,
  CheckCircle2
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
  const isCritical = currentTarget?.risk_score >= 0.75;
  const isFrozen = currentTarget?.status === 'FREEZE_DISPATCHED' || currentTarget?.status === 'FREEZE_CONFIRMED';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 font-mono">
      {/* Tactical Subheader / Context Bar */}
      <div className="h-14 border-b border-white/10 bg-slate-950 px-6 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
            title="Return to Overview & Telemetry"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs tracking-wider">
                  NATIONAL CYBER FINANCIAL COMMAND THEATER
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-red-950/90 text-red-300 border border-red-800/60 font-bold animate-pulse">
                  LEVEL-4 LEA LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Neo4j Multi-Hop Traversal • PostGIS ATM Geofence • MHA Section 91 Directives
              </p>
            </div>
          </div>
        </div>

        {/* Selected Suspect Info Ticker & Full Action Suite */}
        {currentTarget ? (
          <div className="flex items-center gap-2.5 text-xs">
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-slate-400 text-[11px]">TARGET:</span>
              <span className="font-bold text-white">{currentTarget.target_holder_name}</span>
              <span className="text-slate-400">({maskAccountNumber(currentTarget.target_account_number)})</span>
              <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {(currentTarget.risk_score * 100).toFixed(1)}% FUSED
              </span>
            </div>

            {/* Quick Tactical Action Buttons */}
            <button
              onClick={() => setDossierModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export Section 65B Evidence Dossier"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Sec 65B Dossier</span>
            </button>

            <button
              onClick={() => setRestitutionModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Execute Section 457 Cr.P.C. Restitution"
            >
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">Sec 457 Restitution</span>
            </button>

            <button
              onClick={() => setPatrolModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Dispatch Mobile Beat Patrol to ATM"
            >
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span className="hidden xl:inline">Dispatch Patrol</span>
            </button>

            <FreezeButton
              accountId={targetAccId}
              accountHolder={currentTarget.target_holder_name}
              isFrozen={isFrozen}
            />
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            No suspect node selected. Select any node in the graph below.
          </div>
        )}
      </div>

      {/* Dual Split Screen: Graph (Left) & Geo Hotspots (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 overflow-hidden">
        {/* Left Screen: Neo4j Multi-Hop Graph Traversal */}
        <div className="h-full rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 shadow-xl relative">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/10 text-[10px] text-blue-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            MULTI-HOP TRANSACTION FLOW GRAPH
          </div>
          <TxnGraph
            accountId={targetAccId}
            onNodeClick={(node) => {
              const matched = alerts.find(a => a.target_account_id === node.id);
              if (matched) setSelectedAlert(matched);
            }}
          />
        </div>

        {/* Right Screen: PostGIS ATM Cash-Out Hotspot Map */}
        <div className="h-full rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 shadow-xl relative">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/10 text-[10px] text-emerald-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SPATIAL ATM CASHOUT GEOFENCE HEATMAP
          </div>
          <HeatmapView />
        </div>
      </div>

      {/* Bottom Collapsible Intelligence Tray */}
      <div className={`border-t border-white/10 bg-slate-900/95 backdrop-blur-md transition-all duration-300 shrink-0 ${
        drawerExpanded ? 'h-64' : 'h-10'
      }`}>
        <div
          onClick={() => setDrawerExpanded(!drawerExpanded)}
          className="h-10 px-6 flex items-center justify-between cursor-pointer hover:bg-white/5 border-b border-white/5 select-none"
        >
          <div className="flex items-center gap-2 text-xs">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-white">INTELLIGENCE DOSSIER & SHAP EXPLAINABILITY</span>
            <span className="text-[11px] text-slate-400">
              ({currentTarget ? `${currentTarget.target_holder_name} • ${maskAccountNumber(currentTarget.target_account_number)}` : 'No Target Selected'})
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <span>{drawerExpanded ? 'Collapse Tray' : 'Expand Tray'}</span>
            {drawerExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>

        {drawerExpanded && (
          <div className="h-[calc(16rem-2.5rem)] overflow-y-auto p-4">
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

