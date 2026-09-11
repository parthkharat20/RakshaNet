import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { TxnGraph } from '../components/graph/TxnGraph';
import { HeatmapView } from '../components/map/HeatmapView';
import { ExplainPanel } from '../components/explain/ExplainPanel';
import { FreezeButton } from '../components/actions/FreezeButton';
import { ResizableThreePanel } from '../components/common/ResizablePanels';
import { useAlertContext } from '../contexts/AlertContext';
import { Terminal, ShieldAlert, FileText, ArrowLeft } from 'lucide-react';
import { maskAccountNumber } from '../utils/constants';

export const CommandPage = () => {
  const location = useLocation();
  const { alerts, selectedAlert, setSelectedAlert } = useAlertContext();

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

      {/* 3 Resizable Blocks Side-by-Side: Graph (Left) | Geo Hotspots (Middle) | Case Dossier & SHAP Explainability (Right) */}
      <div className="flex-1 p-2 overflow-hidden min-h-0">
        <ResizableThreePanel
          initialPcts={[33.33, 33.33, 33.34]}
          leftChild={
            <div className="h-full rounded-xl overflow-hidden border border-white/10 min-h-0 mr-0.5">
              <TxnGraph
                accountId={targetAccId}
                onNodeClick={(node) => {
                  const matched = alerts.find(a => a.target_account_id === node.id);
                  if (matched) setSelectedAlert(matched);
                }}
              />
            </div>
          }
          centerChild={
            <div className="h-full rounded-xl overflow-hidden border border-white/10 min-h-0 mx-0.5">
              <HeatmapView />
            </div>
          }
          rightChild={
            <div className="h-full rounded-xl overflow-hidden border border-white/10 glass-panel bg-slate-950 flex flex-col min-h-0 ml-0.5">
              {/* Section Header */}
              <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <div>
                    <h3 className="font-display font-bold text-white text-xs uppercase tracking-wide">
                      Case Dossier & SHAP Explainability
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      {selectedAlert ? `REF: ${selectedAlert.id.slice(0, 8)}... • ${selectedAlert.target_holder_name}` : 'Select a Target Threat'}
                    </p>
                  </div>
                </div>
                {selectedAlert && (
                  <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                    {(selectedAlert.risk_score * 100).toFixed(1)}%
                  </span>
                )}
              </div>

              {/* Dossier & Explainability Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
                {selectedAlert ? (
                  <>
                    {/* Target Dossier Header Card */}
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Flagged Suspect Holder</span>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            {selectedAlert.target_holder_name || 'Suspect Account'}
                          </h4>
                          <p className="text-slate-400 text-xs mt-0.5">
                            {maskAccountNumber(selectedAlert.target_account_number)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Target Bank</span>
                          <span className="text-xs font-bold text-white">
                            {selectedAlert.bank_name || 'Active Node'}
                          </span>
                        </div>
                      </div>

                      {/* Interdiction Quick Actions */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400">Interdiction:</span>
                        <FreezeButton
                          accountId={targetAccId}
                          accountHolder={selectedAlert.target_holder_name}
                          isFrozen={isFrozen}
                        />
                      </div>
                    </div>

                    {/* Explainable AI & SHAP Panel */}
                    <ExplainPanel
                      explanation={selectedAlert.explanation}
                      fusedScore={selectedAlert.risk_score || 0}
                      graphScore={selectedAlert.graph_score || 0}
                      geoScore={selectedAlert.geo_score || 0}
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-6 space-y-2">
                    <ShieldAlert className="w-8 h-8 text-slate-600 mb-1" />
                    <p className="text-xs font-semibold text-slate-400">No Target Threat Selected</p>
                    <p className="text-[11px] max-w-xs text-slate-500">
                      Select a node in the Multi-Hop Graph or click a threat card to load legal case dossier and SHAP explainability.
                    </p>
                  </div>
                )}
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};
