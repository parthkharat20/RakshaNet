import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsBar } from '../components/analytics/StatsBar';
import { AlertFeed } from '../components/alerts/AlertFeed';
import { CaseDrawer } from '../components/alerts/CaseDrawer';
import { TxnGraph } from '../components/graph/TxnGraph';
import { HeatmapView } from '../components/map/HeatmapView';
import { FreezeWorkflowModal } from '../components/freeze/FreezeWorkflowModal';
import { ResizableTwoPanel } from '../components/common/ResizablePanels';
import { useAlertContext } from '../contexts/AlertContext';
import { Network, MapPin, FileText, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { alerts, selectedAlert, setSelectedAlert, dispatchFreeze } = useAlertContext();
  const [activeTab, setActiveTab] = useState('GRAPH'); // GRAPH, MAP, DOSSIER
  const [freezeModalAlert, setFreezeModalAlert] = useState(null);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleOpenCommand = (alert) => {
    navigate('/command', { state: { selectedAccountId: alert?.target_account_id } });
  };

  const handleFreezeClick = (alert) => {
    setFreezeModalAlert(alert);
    setIsFreezeModalOpen(true);
  };

  const handleNodeClick = (node) => {
    if (!node) return;
    const match = alerts.find(a => a.target_account_id === node.id || a.target_account_number === node.accountNumber);
    if (match) {
      setSelectedAlert(match);
      setActiveTab('DOSSIER');
    } else {
      navigate('/command', { state: { selectedAccountId: node.id } });
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-slate-950">
      {/* Top Telemetry KPI Cards */}
      <div className="px-4 pt-4 shrink-0">
        <StatsBar />
      </div>

      {/* Main Operations Grid: fills remaining height with Resizable Splitter */}
      <div className="flex-1 p-4 overflow-hidden min-h-0">
        <ResizableTwoPanel
          initialLeftPct={40}
          leftChild={
            <div className="h-full min-h-0 overflow-hidden pr-1">
              <AlertFeed onFreezeClick={handleFreezeClick} />
            </div>
          }
          rightChild={
            <div className="h-full min-h-0 flex flex-col gap-2 overflow-hidden pl-1">
              {/* Visual Mode Selector Tabs & Expand / Fullscreen Button */}
              <div className="flex items-center justify-between p-1.5 rounded-xl border border-white/10 bg-slate-900/60 shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('GRAPH')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === 'GRAPH'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Multi-Hop Graph</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('MAP')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === 'MAP'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>ATM Hotspot Map</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('DOSSIER')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === 'DOSSIER'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>SHAP Evidence</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-1.5 transition-all font-bold shadow-sm"
                    title="Expand to Fullscreen Theater View"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </button>

                  <button
                    onClick={() => handleOpenCommand(selectedAlert)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1 transition-colors"
                    title="Open Command Theater Mode"
                  >
                    <span>Command Mode</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Visualization Container — flex-1 fills space */}
              <div className="flex-1 overflow-hidden relative rounded-xl min-h-0">
                {activeTab === 'GRAPH' && (
                  <TxnGraph
                    accountId={selectedAlert?.target_account_id}
                    onNodeClick={handleNodeClick}
                  />
                )}
                {activeTab === 'MAP' && <HeatmapView />}
                {activeTab === 'DOSSIER' && (
                  <CaseDrawer onOpenCommandCenter={handleOpenCommand} />
                )}
              </div>
            </div>
          }
        />
      </div>

      {/* FULLSCREEN OVERLAY MODAL FOR GRAPH, MAP & SHAP EVIDENCE */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md p-4 flex flex-col overflow-hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setActiveTab('GRAPH')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'GRAPH' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  <span>Multi-Hop Graph</span>
                </button>

                <button
                  onClick={() => setActiveTab('MAP')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'MAP' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>ATM Hotspot Map</span>
                </button>

                <button
                  onClick={() => setActiveTab('DOSSIER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'DOSSIER' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>SHAP Evidence</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Exit Fullscreen</span>
            </button>
          </div>

          <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-white/10 bg-slate-950">
            {activeTab === 'GRAPH' && (
              <TxnGraph
                accountId={selectedAlert?.target_account_id}
                onNodeClick={handleNodeClick}
              />
            )}
            {activeTab === 'MAP' && <HeatmapView />}
            {activeTab === 'DOSSIER' && (
              <CaseDrawer onOpenCommandCenter={handleOpenCommand} />
            )}
          </div>
        </div>
      )}

      {/* Interdiction / Account Freeze Workflow Modal */}
      <FreezeWorkflowModal
        isOpen={isFreezeModalOpen}
        alert={freezeModalAlert}
        onClose={() => setIsFreezeModalOpen(false)}
        onConfirmFreeze={dispatchFreeze}
      />
    </div>
  );
};
