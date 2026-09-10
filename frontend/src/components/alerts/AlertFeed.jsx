import React from 'react';
import { Search, MapPin, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { AlertCard } from './AlertCard';

export const AlertFeed = ({ onFreezeClick }) => {
  const {
    alerts,
    allAlertsCount,
    solvedAlertsCount,
    selectedAlert,
    setSelectedAlert,
    filter,
    setFilter,
    cityFilter,
    setCityFilter,
    availableCities,
    searchQuery,
    setSearchQuery,
    isLoading
  } = useAlertContext();

  const filterTabs = [
    { id: 'ALL', label: 'Active', count: allAlertsCount },
    { id: 'CRITICAL', label: 'Critical', count: alerts.filter(a => a.risk_score >= 0.75).length },
    { id: 'ELEVATED', label: 'Elevated', count: alerts.filter(a => a.risk_score >= 0.40 && a.risk_score < 0.75).length },
    { id: 'FROZEN', label: 'Interdicted', count: alerts.filter(a => a.status === 'FREEZE_DISPATCHED' || a.status === 'FREEZE_CONFIRMED').length },
    { id: 'SOLVED', label: 'Solved DB', count: solvedAlertsCount || 0 }
  ];

  const panel = 'glass-panel flex flex-col h-full overflow-hidden border-white/10';
  const headerBorder = 'border-white/10';
  const inputCls = 'w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono';
  const tabActive = 'bg-blue-600 text-white shadow-sm shadow-blue-500/30';
  const tabIdle = 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10';
  const cityBtnActive = 'bg-indigo-600 text-white';
  const cityBtnIdle = 'bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-900/40 border border-white/10';

  return (
    <div className={panel}>
      {/* Header & Filter Controls */}
      <div className={`p-4 border-b ${headerBorder} space-y-3 shrink-0`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base flex items-center gap-2 text-white">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              Real-Time Threat Feed
            </h3>
            <p className="text-xs font-mono mt-0.5 text-slate-400">
              {allAlertsCount} active threats &bull; {solvedAlertsCount || 0} solved in DB
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search suspect name, account, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Risk Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap flex items-center gap-1 ${filter === tab.id ? tabActive : tabIdle
                }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 bg-black/20 rounded text-[10px]">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* City Filter Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 border-t border-white/5">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
          <span className="text-[11px] font-mono text-slate-400 shrink-0"></span>
          {availableCities.map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all whitespace-nowrap ${cityFilter === city ? cityBtnActive : cityBtnIdle
                }`}
            >
              {city === 'ALL' ? 'All Cities' : city}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <p className="text-xs font-mono">Syncing AI threat feeds...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6 text-slate-400">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-300">No Threats In Filter</p>
            <p className="text-xs mt-1 max-w-xs text-slate-500">
              No cases match the current filters.
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
            />
          ))
        )}
      </div>
    </div>
  );
};
