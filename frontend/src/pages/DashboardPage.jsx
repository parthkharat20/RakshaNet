import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsBar } from '../components/analytics/StatsBar';
import { AlertFeed } from '../components/alerts/AlertFeed';
import { CaseDrawer } from '../components/alerts/CaseDrawer';
import { TxnGraph } from '../components/graph/TxnGraph';
import { HeatmapView } from '../components/map/HeatmapView';
import { useAlertContext } from '../contexts/AlertContext';
import { Network, MapPin, FileText, ChevronRight } from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { selectedAlert, theme } = useAlertContext();
  const [activeTab, setActiveTab] = useState('GRAPH'); // GRAPH, MAP, DOSSIER
  const isDark = theme === 'dark';

  const handleOpenCommand = (alert) => {
    navigate('/command', { state: { selectedAccountId: alert?.target_account_id } });
  };

  return (
    <div className={`flex flex-col flex-1 overflow-hidden ${isDark ? '' : 'bg-slate-100'}`}>
      {/* Top Telemetry KPI Cards */}
      <div className="px-4 pt-4 shrink-0">
        <StatsBar />
      </div>

      {/* Main Operations Grid: fills remaining height */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 overflow-hidden min-h-0">
        {/* Left Column: Alert Feed (5 Columns) */}
        <div className="lg:col-span-5 min-h-0 overflow-hidden">
          <AlertFeed />
        </div>

        {/* Right Column: Visualization (7 Columns) */}
        <div className="lg:col-span-7 min-h-0 flex flex-col gap-2 overflow-hidden">
          {/* Visual Mode Selector Tabs */}
          <div className={`flex items-center justify-between p-1.5 rounded-xl border shrink-0 ${
            isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('GRAPH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'GRAPH'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
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
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
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
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>SHAP Evidence</span>
              </button>
            </div>

            <button
              onClick={() => handleOpenCommand(selectedAlert)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 flex items-center gap-1 transition-colors"
            >
              <span>Full Tactical Mode</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visualization Container — flex-1 fills space, no fixed height */}
          <div className="flex-1 overflow-hidden relative rounded-xl min-h-0">
            {activeTab === 'GRAPH' && (
              <TxnGraph
                accountId={selectedAlert?.target_account_id}
                onNodeClick={(node) => console.log('Selected node:', node)}
              />
            )}
            {activeTab === 'MAP' && <HeatmapView />}
            {activeTab === 'DOSSIER' && (
              <CaseDrawer onOpenCommandCenter={handleOpenCommand} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
