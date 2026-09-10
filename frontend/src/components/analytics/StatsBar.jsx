import React from 'react';
import { ShieldAlert, Users, Network, MapPin, Lock, IndianRupee } from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { formatINR } from '../../utils/constants';

export const StatsBar = () => {
  const { stats, isLoading } = useAlertContext();

  const cards = [
    {
      title: 'NCRP Complaints',
      value: stats?.total_complaints || 31,
      subValue: `Reported Loss: ${formatINR(stats?.total_loss_reported || stats?.total_loss_reported_inr || 3472242)}`,
      icon: ShieldAlert,
      accentColor: 'text-red-400',
      statusDot: 'bg-red-400',
      statusText: 'Active Feed'
    },
    {
      title: 'Monitored Accounts',
      value: (stats?.total_accounts_monitored || 500).toLocaleString('en-IN'),
      subValue: `${(stats?.total_transactions || 2526).toLocaleString('en-IN')} Transactions Analyzed`,
      icon: Users,
      accentColor: 'text-blue-400',
      statusDot: 'bg-blue-400',
      statusText: 'Core Banking'
    },
    {
      title: 'Active Mule Rings',
      value: stats?.active_mule_rings || stats?.active_mule_rings_count || 3,
      subValue: 'Star Hub • Chain • Smurfing',
      icon: Network,
      accentColor: 'text-amber-400',
      statusDot: 'bg-amber-400 animate-pulse',
      statusText: 'Graph Predicted'
    },
    {
      title: 'ATM Cashout Terminals',
      value: stats?.high_risk_atms_count || 6,
      subValue: 'Geofenced High-Risk Points',
      icon: MapPin,
      accentColor: 'text-amber-400',
      statusDot: 'bg-amber-400',
      statusText: 'PostGIS Cordon'
    },
    {
      title: 'Sec 91 Bank Liens',
      value: stats?.frozen_accounts_count || 6,
      subValue: 'Interdiction Orders Active',
      icon: Lock,
      accentColor: 'text-emerald-400',
      statusDot: 'bg-emerald-400',
      statusText: 'CFCFRMS Frozen'
    },
    {
      title: 'Intercepted Funds',
      value: formatINR(stats?.total_funds_intercepted || stats?.total_funds_intercepted_inr || 83060),
      subValue: 'Retained for Sec 457 Restitution',
      icon: IndianRupee,
      accentColor: 'text-emerald-300',
      statusDot: 'bg-emerald-400',
      statusText: 'Victim Recovery'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="command-panel p-3.5 flex flex-col justify-between hover:border-white/20 transition-all"
          >
            {/* Top Label & Icon */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-medium truncate">
                {card.title}
              </span>
              <div className="p-1 rounded bg-white/5 text-slate-400 shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Main Numeric Metric */}
            <div className="my-0.5">
              <div className="text-xl font-mono font-bold tracking-tight text-white flex items-baseline gap-1">
                {isLoading ? (
                  <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </div>
            </div>

            {/* Bottom Context Line & Status Dot */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-white/5 mt-1">
              <span className="truncate pr-1 text-slate-400">{card.subValue}</span>
              <span className="flex items-center gap-1 shrink-0 text-slate-500">
                <span className={`w-1.5 h-1.5 rounded-full ${card.statusDot}`} />
                <span className="hidden xl:inline text-[9px]">{card.statusText}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
