import React from 'react';
import { Search, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
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
    { id: 'ALL', label: 'All', count: allCount },
    { id: 'CRITICAL', label: 'Critical', count: critCount },
    { id: 'ELEVATED', label: 'Elevated', count: elevCount },
    { id: 'FROZEN', label: 'Frozen', count: frozCount }
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
    <div className="flex flex-col h-full rounded-xl bg-zinc-900/60 border border-white/[0.06] overflow-hidden select-none">
      {/* Feed Header */}
      <div className="p-3.5 border-b border-white/[0.06] space-y-2.5 bg-zinc-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="font-mono font-semibold text-zinc-200 text-xs tracking-wide uppercase">
              Incident Queue
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {displayedAlerts.length} Active
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search suspects, accounts, banks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-950/80 border border-white/[0.06] text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors font-mono"
          />
        </div>

        {/* Filter Segment Tabs */}
        <div className="flex items-center gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 py-1 rounded-md text-[11px] font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                filter === tab.id
                  ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.08]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] text-zinc-500">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed Card Stream */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <p className="text-xs font-mono">Syncing incidents...</p>
          </div>
        ) : displayedAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-center p-6">
            <ShieldCheck className="w-7 h-7 text-emerald-400/80 mb-2" />
            <p className="text-xs font-medium text-zinc-300">No Incidents in Queue</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
              Filtered criteria returned zero active alerts.
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

