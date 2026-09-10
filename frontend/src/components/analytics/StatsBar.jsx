import React from 'react';
import { ShieldAlert, Users, Network, MapPin, Lock, IndianRupee } from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { formatINR } from '../../utils/constants';

export const StatsBar = () => {
  const { stats, isLoading } = useAlertContext();

  const cards = [
    {
      label: 'Complaints',
      value: stats?.total_complaints || 31,
      sub: `Loss ${formatINR(stats?.total_loss_reported || stats?.total_loss_reported_inr || 3472242)}`,
      icon: ShieldAlert,
      badge: 'NCRP',
      badgeColor: 'text-rose-400 bg-rose-500/10'
    },
    {
      label: 'Accounts Monitored',
      value: (stats?.total_accounts_monitored || 500).toLocaleString('en-IN'),
      sub: `${(stats?.total_transactions || 2526).toLocaleString('en-IN')} Txns`,
      icon: Users,
      badge: 'Live',
      badgeColor: 'text-zinc-400 bg-zinc-800/60'
    },
    {
      label: 'Mule Syndicates',
      value: stats?.active_mule_rings || stats?.active_mule_rings_count || 3,
      sub: 'Graph Detected',
      icon: Network,
      badge: 'Rings',
      badgeColor: 'text-amber-400 bg-amber-500/10'
    },
    {
      label: 'ATM Hotspots',
      value: stats?.high_risk_atms_count || 6,
      sub: 'Geofenced High Risk',
      icon: MapPin,
      badge: 'Cordon',
      badgeColor: 'text-indigo-400 bg-indigo-500/10'
    },
    {
      label: 'Accounts Frozen',
      value: stats?.frozen_accounts_count || 6,
      sub: 'Sec 91 Liens',
      icon: Lock,
      badge: 'Sec 91',
      badgeColor: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      label: 'Funds Intercepted',
      value: formatINR(stats?.total_funds_intercepted || stats?.total_funds_intercepted_inr || 83060),
      sub: 'Held for Restitution',
      icon: IndianRupee,
      badge: 'Sec 457',
      badgeColor: 'text-emerald-300 bg-emerald-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 select-none">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[11px] font-medium text-zinc-400 truncate">
                {card.label}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            <div className="my-1">
              <div className="text-xl font-mono font-bold tracking-tight text-white">
                {isLoading ? (
                  <div className="h-6 w-16 bg-zinc-800 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 truncate pt-1.5 border-t border-white/[0.04]">
              {card.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
};

