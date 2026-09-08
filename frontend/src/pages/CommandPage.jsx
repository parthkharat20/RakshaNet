import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { TxnGraph } from '../components/graph/TxnGraph';
import { HeatmapView } from '../components/map/HeatmapView';
import { ExplainPanel } from '../components/explain/ExplainPanel';
import { FreezeButton } from '../components/actions/FreezeButton';
import { useAlertContext } from '../contexts/AlertContext';
import { Terminal, ShieldAlert, Network, MapPin, ArrowLeft, Lock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { maskAccountNumber } from '../utils/constants';

export const CommandPage = () => {
  const location = useLocation();
  const { alerts, selectedAlert, setSelectedAlert } = useAlertContext();
  const [drawerExpanded, setDrawerExpanded] = useState(true);

  // Sync selected account from navigation state if available
  useEffect(() => {
    if (location.state?.selectedAccountId && alerts.length > 0) {
      const match = alerts.find(a => a.target_account_id === location.state.selectedAccountId);
      if (match) setSelectedAlert(match);
    }
  }, [location.state, alerts, setSelectedAlert]);

  const targetAccId = selectedAlert?.target_account_id;
  const isCritical = selectedAlert?.risk_score >= 0.75;
  const isFrozen = selectedAlert?.status === 'FREEZE_DISPATCHED';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 font-mono">
      {/* Tactical Subheader / Context Bar */}
      <div className="h-12 border-b border-white/10 bg-slate-950 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Return to Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white text-xs">TACTICAL INTERDICTION THEATER</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 font-bold animate-pulse">
              LIVE OPERATION
            </span>
          </div>
        </div>

        {/* Selected Suspect Info Ticker */}
        {selectedAlert && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">TARGET:</span>
            <span className="font-bold text-white">{selectedAlert.target_holder_name}</span>
            <span className="text-slate-400">({maskAccountNumber(selectedAlert.target_account_number)})</span>
            <span className={`px-2 py-0.5 rounded font-bold ${isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400'}`}>
              RISK: {(selectedAlert.risk_score * 100).toFixed(1)}%
            </span>
            <FreezeButton
              accountId={targetAccId}
              accountHolder={selectedAlert.target_holder_name}
              isFrozen={isFrozen}
            />
          </div>
        )}
      </div>

      {/* Dual Split Screen: Graph (Left) & Geo Hotspots (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 overflow-hidden">
        {/* Left Screen: Neo4j Multi-Hop Graph Traversal */}
        <div className="h-full rounded-xl overflow-hidden border border-white/10">
          <TxnGraph
            accountId={targetAccId}
            onNodeClick={(node) => {
              const matched = alerts.find(a => a.target_account_id === node.id);
              if (matched) setSelectedAlert(matched);
            }}
          />
        </div>

        {/* Right Screen: PostGIS ATM Cash-Out Hotspot Map */}
        <div className="h-full rounded-xl overflow-hidden border border-white/10">
          <HeatmapView />
        </div>
      </div>

      {/* Bottom Collapsible Intelligence Tray */}
      <div className={`border-t border-white/10 bg-slate-900/95 backdrop-blur-md transition-all duration-300 shrink-0 ${
        drawerExpanded ? 'h-64' : 'h-10'
      }`}>
        <div
          onClick={() => setDrawerExpanded(!drawerExpanded)}
          className="h-10 px-6 flex items-center justify-between cursor-pointer hover:bg-white/5 border-b border-white/5"
        >
          <div className="flex items-center gap-2 text-xs">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-white">CASE DOSSIER & SHAP EXPLAINABILITY</span>
            <span className="text-[11px] text-slate-400">
              ({selectedAlert ? selectedAlert.target_holder_name : 'No Target Selected'})
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
              explanation={selectedAlert?.explanation}
              fusedScore={selectedAlert?.risk_score || 0}
              graphScore={selectedAlert?.graph_score || 0}
              geoScore={selectedAlert?.geo_score || 0}
            />
          </div>
        )}
      </div>
    </div>
  );
};
