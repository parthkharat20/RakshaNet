import React from 'react';
import { Lock, ArrowRight, CheckCircle2, Building, ShieldAlert, AlertTriangle } from 'lucide-react';
import { maskAccountNumber } from '../../utils/constants';

export const AlertCard = ({ alert, isSelected, onSelect, onFreezeClick, onInspectClick }) => {
  const isCritical = alert.risk_score >= 0.85;
  const isElevated = alert.risk_score >= 0.70 && alert.risk_score < 0.85;
  const isFrozen = alert.status === 'FREEZE_DISPATCHED' || alert.status === 'FREEZE_CONFIRMED';

  // Primary SHAP threat factor
  const topFactor = alert.explanation?.shap_factors?.[0];

  const handleInspect = (e) => {
    e.stopPropagation();
    if (onInspectClick) {
      onInspectClick(alert);
    } else if (onSelect) {
      onSelect(alert);
    }
  };

  const handleFreeze = (e) => {
    e.stopPropagation();
    if (onFreezeClick) {
      onFreezeClick(alert);
    } else if (onSelect) {
      onSelect(alert);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-lg cursor-pointer transition-all border font-mono text-xs relative select-none ${
        isSelected
          ? 'bg-[#141C30] border-blue-500 shadow-md ring-1 ring-blue-500/30'
          : isFrozen
          ? 'bg-[#0D1422] border-emerald-500/30 hover:bg-[#111A2C]'
          : isCritical
          ? 'bg-[#0D1322] border-red-500/30 hover:border-red-500/60 hover:bg-[#121A2E]'
          : 'bg-[#0D1322] border-white/5 hover:border-white/15 hover:bg-[#121A2E]'
      }`}
    >
      {/* Left Severity Indicator Strip */}
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

      <div className="pl-1">
        {/* Top Meta Row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 truncate">
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
              isFrozen
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                : isCritical
                ? 'bg-red-950/80 text-red-400 border border-red-500/30'
                : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
            }`}>
              {isFrozen ? 'INTERDICTED' : isCritical ? 'CRITICAL MULE' : 'ELEVATED RISK'}
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              {alert.bank_name || 'Core Bank'}
            </span>
          </div>

          {/* Fused Risk Percentage */}
          <span
            className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded shrink-0 ${
              isCritical
                ? 'text-red-400 bg-red-950/50'
                : isElevated
                ? 'text-amber-400 bg-amber-950/50'
                : 'text-blue-400 bg-blue-950/50'
            }`}
          >
            {(alert.risk_score * 100).toFixed(1)}% RISK
          </span>
        </div>

        {/* Suspect Name & Account Identity */}
        <div className="mb-2">
          <h4 className="font-sans font-semibold text-white text-sm truncate">
            {alert.target_holder_name || 'Suspect Beneficiary'}
          </h4>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span className="text-slate-300 font-mono">
              {maskAccountNumber(alert.target_account_number)}
            </span>
            <span className="text-slate-600">•</span>
            <span>{alert.city || 'Mumbai Sector'}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-[10px]">
              REF: {alert.id.slice(0, 8)}
            </span>
          </div>
        </div>

        {/* Forensic SHAP Context Callout */}
        {topFactor && (
          <div className="text-[11px] text-slate-300 bg-white/5 px-2.5 py-1.5 rounded border border-white/5 mb-2.5 flex items-baseline gap-1.5">
            <span className="text-amber-400 font-bold shrink-0 text-[10px]">
              {topFactor.impact}
            </span>
            <p className="line-clamp-1 text-slate-300 text-[11px]">
              <span className="text-white font-medium">{topFactor.factor}:</span> {topFactor.detail}
            </p>
          </div>
        )}

        {/* Card Footer: Action Controls */}
        <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[11px]">
          <div className="text-slate-400 text-[10px]">
            {isFrozen ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Section 91 Lien Active
              </span>
            ) : (
              <span>Dual-AI Prioritized</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isFrozen && (
              <button
                onClick={handleFreeze}
                className="btn-command-danger text-[11px] py-1 px-2.5 cursor-pointer"
                title="Execute emergency Section 91 CrPC Freeze"
              >
                <Lock className="w-3 h-3" />
                <span>Freeze</span>
              </button>
            )}

            <button
              onClick={handleInspect}
              className="btn-command-secondary text-[11px] py-1 px-2.5 cursor-pointer"
              title="Inspect Case Docket & Open Multi-Hop Graph"
            >
              <span>Inspect</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
