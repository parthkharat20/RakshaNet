import React, { useState, useEffect } from 'react';
import {
  Network,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  MapPin,
  RefreshCw,
  Users,
  Building,
  Radio
} from 'lucide-react';
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

  const totalDetected = syndicates.reduce((acc, s) => acc + (s.total_detected_loss || 0), 0);
  const totalIntercepted = syndicates.reduce((acc, s) => acc + (s.funds_intercepted || 0), 0);
  const totalMules = syndicates.reduce((acc, s) => acc + (s.active_mules_identified || 0), 0);
  const overallDisruption = totalDetected > 0 ? ((totalIntercepted / totalDetected) * 100).toFixed(1) : 0;

  return (
    <div className="command-panel p-4 flex flex-col space-y-4 border-[#1E293B]">
      {/* Top Banner & Disruption KPI */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
              Organized Cybercrime Syndicate Intelligence
              <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                {syndicates.length} ACTIVE RINGS
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Cross-Jurisdictional Topological Clustering & Interdiction Tracking
            </p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Disrupted Volume</div>
            <div className="font-bold text-emerald-400">{formatINR(totalIntercepted)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Suppression Rate</div>
            <div className="font-bold text-cyan-300">{overallDisruption}%</div>
          </div>
          <button
            onClick={loadSyndicates}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title="Refresh Syndicate Intelligence"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Syndicate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        {syndicates.map((syn) => {
          const isSelected = selectedSyndicate?.id === syn.id;
          return (
            <div
              key={syn.id}
              onClick={() => setSelectedSyndicate(syn)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-red-950/20 border-red-500/60 shadow-lg shadow-red-950/40'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1">
                  <span>{syn.id}</span>
                  <span className="px-1.5 py-0.2 rounded font-bold bg-amber-950/60 text-amber-300 border border-amber-700/50">
                    {syn.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h4 className="font-bold text-white text-xs mt-1 leading-snug">
                  {syn.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  {syn.modus_operandi}
                </p>
              </div>

              {/* Progress Bar & Interception Stats */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Interdiction Efficacy:</span>
                  <span className="font-bold text-emerald-400">{syn.disruption_rate_pct}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(syn.disruption_rate_pct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>Mules: <strong className="text-white">{syn.active_mules_identified}</strong></span>
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
