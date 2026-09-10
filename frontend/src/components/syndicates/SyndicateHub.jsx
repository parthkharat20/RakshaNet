import React, { useState, useEffect } from 'react';
import { Network, RefreshCw } from 'lucide-react';
import { fetchSyndicates } from '../../utils/api';
import { formatINR } from '../../utils/constants';

export const SyndicateHub = () => {
  const [syndicates, setSyndicates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSyndicate, setSelectedSyndicate] = useState(null);

  const loadSyndicates = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSyndicates();
      setSyndicates(data || []);
      if (data && data.length > 0 && !selectedSyndicate) {
        setSelectedSyndicate(data[0]);
      }
    } catch (err) {
      console.error('Failed to load syndicates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSyndicates();
  }, []);

  const totalIntercepted = syndicates.reduce((acc, s) => acc + (s.funds_intercepted || 0), 0);

  return (
    <div className="p-4 flex flex-col space-y-3 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Network className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-zinc-200 text-xs tracking-wide uppercase">
            Mule Syndicates ({syndicates.length})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase mr-1.5">Intercepted:</span>
            <span className="font-bold text-emerald-400">{formatINR(totalIntercepted)}</span>
          </div>
          <button
            onClick={loadSyndicates}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-white/[0.06] transition-colors cursor-pointer"
            title="Refresh Syndicates"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Syndicate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {syndicates.map((syn) => {
          const isSelected = selectedSyndicate?.id === syn.id;
          return (
            <div
              key={syn.id}
              onClick={() => setSelectedSyndicate(syn)}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between space-y-2.5 ${
                isSelected
                  ? 'bg-zinc-800/90 border-indigo-500/50 shadow-sm'
                  : 'bg-zinc-900/40 border-white/[0.04] hover:border-white/[0.1] hover:bg-zinc-800/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                  <span>{syn.id}</span>
                  <span className="px-1.5 py-0.5 rounded font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {syn.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h4 className="font-semibold text-zinc-100 text-xs truncate">
                  {syn.name}
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                  {syn.modus_operandi}
                </p>
              </div>

              {/* Progress Bar & Interception Stats */}
              <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500">Disruption:</span>
                  <span className="font-semibold text-emerald-400">{syn.disruption_rate_pct}%</span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(syn.disruption_rate_pct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                  <span>Mules: <strong className="text-zinc-200">{syn.active_mules_identified}</strong></span>
                  <span>Intercepted: <strong className="text-emerald-400">{formatINR(syn.funds_intercepted)}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

