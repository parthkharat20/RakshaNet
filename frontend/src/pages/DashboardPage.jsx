import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsBar } from '../components/analytics/StatsBar';
import { AlertFeed } from '../components/alerts/AlertFeed';
import { CaseDrawer } from '../components/alerts/CaseDrawer';
import { TxnGraph } from '../components/graph/TxnGraph';
import { HeatmapView } from '../components/map/HeatmapView';
import { SyndicateHub } from '../components/syndicates/SyndicateHub';
import { useAlertContext } from '../contexts/AlertContext';
import { Network, MapPin, FileText, ChevronRight, Flame } from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { selectedAlert } = useAlertContext();
  const [activeTab, setActiveTab] = useState('GRAPH'); // GRAPH, MAP, DOSSIER, SYNDICATES


  const handleOpenCommand = (alert) => {
    navigate('/command', { state: { selectedAccountId: alert?.target_account_id } });
  };

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Telemetry KPI Cards */}
      <StatsBar />

      {/* Main Operations Grid: 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[760px]">
        {/* Left Column: Real-Time Prioritized Alert Stream (5 Columns) */}
        <div className="lg:col-span-5 h-full">
          <AlertFeed />
        </div>

        {/* Right Column: Multi-Modal Visualization & Investigation View (7 Columns) */}
        <div className="lg:col-span-7 h-full flex flex-col space-y-3">
          {/* Visual Mode Selector Tabs */}
          <div className="flex items-center justify-between bg-slate-900/60 p-1.5 rounded-xl border border-white/10 shrink-0">
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
                <span>SHAP Evidence Dossier</span>
              </button>

              <button
                onClick={() => setActiveTab('SYNDICATES')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'SYNDICATES'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Organized Syndicates</span>
              </button>
            </div>

            {/* Jump to Fullscreen Tactical Command */}
            <button
              onClick={() => handleOpenCommand(selectedAlert)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 flex items-center gap-1 transition-colors"
            >
              <span>Full Tactical Mode</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Visualization Container */}
          <div className="flex-1 overflow-hidden relative rounded-xl">
            {activeTab === 'GRAPH' && (
              <TxnGraph
                accountId={selectedAlert?.target_account_id}
                onNodeClick={(node) => console.log('Selected node:', node)}
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
    </div>
  );
};
