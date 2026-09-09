import React from 'react';
import { ShieldAlert, Users, Network, MapPin, Lock, IndianRupee, Activity, CheckCircle2 } from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { formatINR } from '../../utils/constants';

export const StatsBar = () => {
  const { stats, isLoading } = useAlertContext();

  const cards = [
    {
      title: 'NCRP Cyber Complaints',
      value: stats?.total_complaints || 31,
      subValue: `Reported Loss: ${formatINR(stats?.total_loss_reported || stats?.total_loss_reported_inr || 3472242)}`,
      icon: ShieldAlert,
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      badge: 'NCRP LIVE',
      badgeColor: 'bg-rose-950/80 text-rose-300 border-rose-700/50'
    },
    {
      title: 'Monitored Banking Nodes',
      value: stats?.total_accounts_monitored || 500,
      subValue: `${stats?.total_transactions || 2526} Ledger Transactions Analyzed`,
      icon: Users,
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      badge: 'CORE BANKING',
      badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-700/50'
    },
    {
      title: 'Active Mule Syndicates',
      value: stats?.active_mule_rings || stats?.active_mule_rings_count || 3,
      subValue: 'Star Hub • Multi-Hop Chain • Smurfing',
      icon: Network,
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      badge: 'GRAPH AI',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/50',
      pulse: true
    },
    {
      title: 'Flagged ATM Terminals',
      value: stats?.high_risk_atms_count || 6,
      subValue: 'PostGIS Geofence Cordon Active',
      icon: MapPin,
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      badge: 'CASHOUT RISK',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/50'
    },
    {
      title: 'CFCFRMS Bank Liens',
      value: stats?.frozen_accounts_count || 6,
      subValue: 'Section 91 CrPC Freezes Dispatched',
      icon: Lock,
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      badge: 'INTERDICTED',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
    },
    {
      title: 'Intercepted Victim Funds',
      value: formatINR(stats?.total_funds_intercepted || stats?.total_funds_intercepted_inr || 83060),
      subValue: 'Retained for Sec 457 Restitution',
      icon: IndianRupee,
      textColor: 'text-emerald-300',
      borderColor: 'border-emerald-500/40',
      badge: 'SEC 457 CrPC',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
      glow: true
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-panel p-4 flex flex-col justify-between relative overflow-hidden transition-all hover:-translate-y-0.5 border ${card.borderColor} bg-slate-900/80 ${
              card.glow ? 'shadow-lg shadow-emerald-500/10' : ''
            }`}
          >
            {/* Corner Decorative Accent */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 pointer-events-none" />

            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg bg-white/5 ${card.textColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className={`text-xl font-display font-bold text-white tracking-tight flex items-baseline gap-2 ${card.textColor}`}>
                {isLoading ? (
                  <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </div>

              <div className="flex items-center justify-between mt-1 gap-1">
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  {card.subValue}
                </p>
                <span className={`text-[8px] font-mono px-1 py-0.2 rounded border shrink-0 ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

