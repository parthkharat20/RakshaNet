import React from 'react';
import { ShieldAlert, Users, Network, MapPin, Lock, DollarSign } from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { formatINR } from '../../utils/constants';

export const StatsBar = () => {
  const { stats, isLoading } = useAlertContext();

  const cards = [
    {
      title: 'NCRP Complaints',
      value: stats?.total_complaints ?? 0,
      subValue: `Reported Loss: ${formatINR(stats?.total_loss_reported_inr ?? stats?.total_loss_reported ?? 0)}`,
      icon: ShieldAlert,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Monitored Accounts',
      value: stats?.total_accounts_monitored ?? 0,
      subValue: `${stats?.total_transactions_analyzed ?? stats?.total_transactions ?? 0} Transactions Analyzed`,
      icon: Users,
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30'
    },
    {
      title: 'Active Fraud Rings',
      value: stats?.active_mule_rings_count ?? stats?.active_mule_rings ?? 0,
      subValue: 'Star Hub • Chain • Smurfing',
      icon: Network,
      color: 'from-rose-500 to-red-600',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      pulse: true
    },
    {
      title: 'High-Risk ATM Terminals',
      value: stats?.high_risk_atms_count ?? 0,
      subValue: 'Flagged Cash-Out Terminals',
      icon: MapPin,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30'
    },
    {
      title: 'Frozen Accounts',
      value: stats?.frozen_accounts_count ?? 0,
      subValue: 'Interdiction Orders Dispatched',
      icon: Lock,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30'
    },
    {
      title: 'Intercepted Funds',
      value: formatINR(stats?.total_funds_intercepted_inr ?? stats?.total_funds_intercepted ?? 0),
      subValue: 'Recovered for Fraud Victims',
      icon: DollarSign,
      color: 'from-emerald-400 to-green-600',
      textColor: 'text-emerald-300',
      borderColor: 'border-emerald-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-panel p-4 flex flex-col justify-between relative overflow-hidden transition-all hover:-translate-y-0.5 ${card.borderColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{card.title}</span>
              <div className={`p-1.5 rounded-lg bg-white/5 ${card.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className={`text-xl font-display font-bold text-white tracking-tight flex items-baseline gap-2 ${card.pulse ? 'text-red-400' : ''}`}>
                {isLoading ? (
                  <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                {card.subValue}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
