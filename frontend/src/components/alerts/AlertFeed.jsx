import React from 'react';
import { Search, ShieldCheck, RefreshCw, ShieldAlert, Filter } from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { AlertCard } from './AlertCard';

export const AlertFeed = ({ onFreezeClick, onInspectClick }) => {
  const {
    alerts,
    selectedAlert,
    setSelectedAlert,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    isLoading
  } = useAlertContext();

  // Deduplicate alerts by suspect account ID or target holder
  const uniqueAlerts = React.useMemo(() => {
    const seen = new Set();
    return alerts.filter(a => {
      const key = a.target_account_id || a.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [alerts]);

  const allCount = uniqueAlerts.length;
  const critCount = uniqueAlerts.filter(a => a.risk_score >= 0.85).length;
  const elevCount = uniqueAlerts.filter(a => a.risk_score >= 0.70 && a.risk_score < 0.85).length;
  const frozCount = uniqueAlerts.filter(a => a.status === 'FREEZE_DISPATCHED' || a.status === 'FREEZE_CONFIRMED').length;

  const filterTabs = [
    { id: 'ALL', label: 'All Targets', count: allCount },
    { id: 'CRITICAL', label: 'Critical (>85%)', count: critCount },
    { id: 'ELEVATED', label: 'Elevated', count: elevCount },
    { id: 'FROZEN', label: 'Interdicted', count: frozCount }
  ];

  // Apply active filter
  const displayedAlerts = React.useMemo(() => {
    let list = uniqueAlerts;
    if (filter === 'CRITICAL') {
      list = list.filter(a => a.risk_score >= 0.85);
    } else if (filter === 'ELEVATED') {
      list = list.filter(a => a.risk_score >= 0.70 && a.risk_score < 0.85);
    } else if (filter === 'FROZEN') {
      list = list.filter(a => a.status === 'FREEZE_DISPATCHED' || a.status === 'FREEZE_CONFIRMED');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        (a.target_holder_name && a.target_holder_name.toLowerCase().includes(q)) ||
        (a.target_account_number && a.target_account_number.includes(q)) ||
        (a.bank_name && a.bank_name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [uniqueAlerts, filter, searchQuery]);

  return (
    <div className="command-panel flex flex-col h-full overflow-hidden select-none">
      {/* Feed Header */}
      <div className="p-4 border-b border-white/10 space-y-3 bg-[#0B101D]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h3 className="font-sans font-bold text-white text-sm tracking-wide">
              Threat Intelligence Incident Queue
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {displayedAlerts.length} Queued
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter suspect name, account, or bank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#070A12] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
          />
        </div>

        {/* Filter Segment Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1 py-0.2 rounded bg-black/40 text-[9px] text-slate-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed Card Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
            <p className="text-xs font-mono">Loading threat intelligence stream...</p>
          </div>
        ) : displayedAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center p-6">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
            <p className="text-xs font-semibold text-slate-300">No Threat Alerts In This Filter</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
              All monitored accounts meet standard behavioral thresholds.
            </p>
          </div>
        ) : (
          displayedAlerts.map((alert) => (
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
