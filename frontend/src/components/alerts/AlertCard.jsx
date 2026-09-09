import React from 'react';
import { AlertTriangle, ShieldCheck, Eye, Zap, ArrowRight, Lock, CheckCircle2, Building, Scale, FileText } from 'lucide-react';
import { ALERT_TYPE_META, maskAccountNumber } from '../../utils/constants';

export const AlertCard = ({ alert, isSelected, onSelect, onFreezeClick, onInspectClick }) => {
  const isCritical = alert.risk_score >= 0.75;
  const isFrozen = alert.status === 'FREEZE_DISPATCHED' || alert.status === 'FREEZE_CONFIRMED';
  const meta = ALERT_TYPE_META[alert.alert_type] || ALERT_TYPE_META.SURVEILLANCE;

  // Top SHAP factor
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
      className={`p-4 rounded-xl cursor-pointer transition-all border relative overflow-hidden font-mono text-xs ${
        isSelected
          ? 'bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/15 ring-1 ring-blue-500/50'
          : isCritical
          ? 'bg-slate-900/80 border-red-500/40 hover:border-red-500/80 hover:bg-slate-900/95 hover:shadow-lg hover:shadow-red-500/10'
          : 'bg-slate-900/50 border-white/10 hover:border-white/20 hover:bg-slate-900/80'
      }`}
    >
      {/* Corner Tactical Bracket for Selected or Critical */}
      {isCritical && (
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-500 pointer-events-none" />
      )}
      {isSelected && (
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-500 pointer-events-none" />
      )}

      {/* Top Classification Strip */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`pill ${meta.badgeClass} text-[10px]`}>
            {isCritical ? <AlertTriangle className="w-3 h-3 text-red-400" /> : <Eye className="w-3 h-3" />}
            {meta.label}
          </span>
          <span className="text-[10px] text-slate-500">
            DOCKET #{alert.id.slice(0, 6).toUpperCase()}
          </span>
        </div>

        {/* Dual AI Fused Risk Indicator */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Dual-AI Risk:</span>
          <span
            className={`font-bold text-xs px-2 py-0.5 rounded ${
              isCritical
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-sm shadow-red-500/20'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
            }`}
          >
            {(alert.risk_score * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Suspect Account Header */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white text-sm truncate pr-2 font-display">
            {alert.target_holder_name || 'Suspect Account'}
          </h4>
          {isFrozen ? (
            <span className="pill pill-success text-[10px] flex items-center gap-1 bg-emerald-950/80 border-emerald-500/50 text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SEC 91 FROZEN
            </span>
          ) : isCritical ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-700/60 font-bold">
              HIGH-PRIORITY
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
          <span className="text-white font-mono">{maskAccountNumber(alert.target_account_number)}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-400" />
            {alert.bank_name || 'Bank Node'}
          </span>
        </div>
      </div>

      {/* Multi-Branch AI Score Vectors */}
      <div className="grid grid-cols-2 gap-2 py-1.5 px-2.5 bg-slate-950/80 rounded-lg border border-white/5 mb-2 text-[11px]">
        <div className="flex justify-between items-center text-slate-400">
          <span>Branch A (Graph Link):</span>
          <span className="text-blue-400 font-bold">{alert.graph_score ? alert.graph_score.toFixed(3) : '0.000'}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Branch B (Geo Velocity):</span>
          <span className="text-emerald-400 font-bold">{alert.geo_score ? alert.geo_score.toFixed(3) : '0.000'}</span>
        </div>
      </div>

      {/* Forensic SHAP Snippet */}
      {topFactor && (
        <div className="text-[11px] text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5 flex items-start gap-1.5 mb-2.5">
          <span className="text-amber-400 font-bold shrink-0">{topFactor.impact}</span>
          <p className="line-clamp-2 text-slate-300 text-[11px]">
            <strong className="text-white">{topFactor.factor}:</strong> {topFactor.detail}
          </p>
        </div>
      )}

      {/* Card Footer: One-Click Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
          ID: {alert.id.slice(0, 10)}
        </span>

        <div className="flex items-center gap-2">
          {/* Quick Freeze Button directly on card */}
          {!isFrozen && (
            <button
              onClick={handleFreeze}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
              title="Execute emergency Section 91 CrPC freeze directive on this account"
            >
              <Lock className="w-3 h-3" />
              <span>Freeze</span>
            </button>
          )}

          {/* Inspect & Open Dossier Button */}
          <button
            onClick={handleInspect}
            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all hover:text-white cursor-pointer"
            title="Inspect full case docket and open investigation drawer"
          >
            <span>Inspect</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

