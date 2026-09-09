import React from 'react';
import { Search, Filter, AlertTriangle, ShieldCheck, Lock, RefreshCw, Radio } from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { AlertCard } from './AlertCard';

export const AlertFeed = ({ onFreezeClick, onInspectClick }) => {
  const {
    alerts,
    allAlertsCount,
    selectedAlert,
    setSelectedAlert,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    isLoading
  } = useAlertContext();

  const filterTabs = [
    { id: 'ALL', label: 'All Threats', count: allAlertsCount },
    { id: 'CRITICAL', label: 'Critical Mules', count: alerts.filter(a => a.risk_score >= 0.75).length },
    { id: 'ELEVATED', label: 'Surveillance', count: alerts.filter(a => a.risk_score >= 0.40 && a.risk_score < 0.75).length },
    { id: 'FROZEN', label: 'Interdicted', count: alerts.filter(a => a.status === 'FREEZE_DISPATCHED' || a.status === 'FREEZE_CONFIRMED').length }
  ];

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden border-white/10 bg-slate-950/70">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-white/10 space-y-3 shrink-0 bg-slate-950/90">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              National Threat Intelligence Feed
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Dual-AI Pipeline Prioritization Stream ({alerts.length} Active Targets)
            </p>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 font-bold">
            I4C / CFCFRMS
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search suspect holder, account number, or syndicate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded text-[10px]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <p className="text-xs font-mono">Syncing AI threat feeds...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center p-6">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-300">No Threat Alerts In This Filter</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs font-mono">
              All monitored accounts meet standard behavioral thresholds or no search criteria matched.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              isSelected={selectedAlert?.id === alert.id}
              onSelect={() => setSelectedAlert(alert)}
              onFreezeClick={onFreezeClick}
              onInspectClick={onInspectClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

