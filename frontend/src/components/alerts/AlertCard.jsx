import React from 'react';
import { maskAccountNumber } from '../../utils/constants';

export const AlertCard = ({ alert, isSelected, onSelect }) => {
  const isCritical = alert.risk_score >= 0.85;
  const isElevated = alert.risk_score >= 0.70 && alert.risk_score < 0.85;
  const isFrozen = alert.status === 'FREEZE_DISPATCHED' || alert.status === 'FREEZE_CONFIRMED';

  // Primary SHAP factor
  const topFactor = alert.explanation?.shap_factors?.[0];

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg cursor-pointer transition-all border text-xs relative select-none ${
        isSelected
          ? 'bg-zinc-800/90 border-zinc-500 shadow-xs'
          : isCritical
          ? 'bg-zinc-900/40 border-rose-500/20 hover:border-rose-500/40 hover:bg-zinc-800/40'
          : 'bg-zinc-900/40 border-white/[0.04] hover:border-white/[0.1] hover:bg-zinc-800/30'
      }`}
    >
      {/* Top Header: Badge + Bank + Risk % */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider shrink-0 ${
              isFrozen
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                : isCritical
                ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
            }`}
          >
            {isFrozen ? 'FROZEN' : isCritical ? 'CRITICAL' : 'ELEVATED'}
          </span>
          <span className="text-[11px] text-zinc-400 truncate">
            {alert.bank_name || 'Bank'}
          </span>
        </div>

        <span
          className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded shrink-0 ${
            isCritical
              ? 'text-rose-400 bg-rose-500/10'
              : 'text-zinc-300 bg-zinc-800'
          }`}
        >
          {(alert.risk_score * 100).toFixed(0)}%
        </span>
      </div>

      {/* Suspect Account Info */}
      <div className="mb-1.5">
        <div className="text-xs font-semibold text-zinc-100 truncate">
          {alert.target_holder_name || 'Suspect Target'}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
          <span className="text-zinc-400 font-mono">
            {maskAccountNumber(alert.target_account_number)}
          </span>
          <span>•</span>
          <span>{alert.city || 'Sector Hub'}</span>
        </div>
      </div>

      {/* Concise Threat Vector */}
      {topFactor && (
        <div className="text-[10px] text-zinc-400 bg-zinc-950/60 px-2 py-1 rounded border border-white/[0.04] flex items-center justify-between gap-1.5">
          <span className="truncate text-zinc-300">
            {topFactor.factor}: <span className="text-zinc-500">{topFactor.detail}</span>
          </span>
          <span className="text-zinc-300 font-mono font-medium shrink-0 text-[10px]">
            {topFactor.impact}
          </span>
        </div>
      )}
    </div>
  );
};

