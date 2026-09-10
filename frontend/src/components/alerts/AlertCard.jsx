import React from 'react';
import { ShieldAlert, Building, CheckCircle2 } from 'lucide-react';
import { maskAccountNumber } from '../../utils/constants';

export const AlertCard = ({ alert, isSelected, onSelect }) => {
  const isCritical = alert.risk_score >= 0.85;
  const isElevated = alert.risk_score >= 0.70 && alert.risk_score < 0.85;
  const isFrozen = alert.status === 'FREEZE_DISPATCHED' || alert.status === 'FREEZE_CONFIRMED';

  // Primary SHAP threat factor
  const topFactor = alert.explanation?.shap_factors?.[0];

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg cursor-pointer transition-all border font-mono text-xs relative select-none ${
        isSelected
          ? 'alert-card-selected'
          : isFrozen
          ? 'bg-[#0B1220] border-emerald-500/30 hover:bg-[#101A2C]'
          : isCritical
          ? 'bg-[#0D1322] border-red-500/25 hover:border-red-500/50 hover:bg-[#121A2E]'
          : 'bg-[#0D1322] border-white/5 hover:border-white/15 hover:bg-[#121A2E]'
      }`}
    >
      {/* Left Severity Indicator Stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
          isFrozen
            ? 'bg-emerald-500'
            : isCritical
            ? 'bg-red-500'
            : isElevated
            ? 'bg-amber-500'
            : 'bg-blue-500'
        }`}
      />

      <div className="pl-1.5">
        {/* Top Header Row: Severity Badge + Bank + Risk % */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
              isFrozen
                ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/40'
                : isCritical
                ? 'bg-red-950/90 text-red-400 border border-red-500/40'
                : 'bg-amber-950/90 text-amber-400 border border-amber-500/40'
            }`}>
              {isFrozen ? 'INTERDICTED' : isCritical ? 'CRITICAL' : 'ELEVATED'}
            </span>
            <span className="text-[10px] text-slate-400 truncate font-sans font-medium">
              {alert.bank_name || 'Core Bank'}
            </span>
          </div>

          <span
            className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded shrink-0 ${
              isCritical
                ? 'text-red-400 bg-red-950/60 border border-red-800/40'
                : isElevated
                ? 'text-amber-400 bg-amber-950/60 border border-amber-800/40'
                : 'text-blue-400 bg-blue-950/60 border border-blue-800/40'
            }`}
          >
            {(alert.risk_score * 100).toFixed(1)}%
          </span>
        </div>

        {/* Suspect Name & Account Identity */}
        <div className="mb-1.5">
          <h4 className="font-sans font-bold text-white text-xs truncate leading-snug">
            {alert.target_holder_name || 'Suspect Account'}
          </h4>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
            <span className="text-slate-300 font-mono">
              {maskAccountNumber(alert.target_account_number)}
            </span>
            <span className="text-slate-600">•</span>
            <span>{alert.city || 'Mumbai Sector'}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500 text-[9px]">
              REF: {(alert.id || alert.alert_id || 'ALERT').slice(0, 8)}
            </span>
          </div>
        </div>

        {/* Concise SHAP Attribution Snippet */}
        {topFactor && (
          <div className="text-[10px] text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/5 flex items-baseline gap-1.5">
            <span className="text-amber-400 font-bold shrink-0 text-[10px]">
              {topFactor.impact}
            </span>
            <p className="line-clamp-1 text-slate-300 text-[10px]">
              <span className="text-white font-medium">{topFactor.factor}:</span> {topFactor.detail}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
