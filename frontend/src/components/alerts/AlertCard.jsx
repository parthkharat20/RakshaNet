import React from 'react';
import { AlertTriangle, ShieldCheck, Eye, Zap, ArrowRight, Lock } from 'lucide-react';
import { ALERT_TYPE_META, maskAccountNumber } from '../../utils/constants';

export const AlertCard = ({ alert, isSelected, onSelect, onFreezeClick }) => {
  const isCritical = alert.risk_score >= 0.75;
  const isFrozen = alert.status === 'FREEZE_DISPATCHED';
  const meta = ALERT_TYPE_META[alert.alert_type] || ALERT_TYPE_META.SURVEILLANCE;

  // Top SHAP factor
  const topFactor = alert.explanation?.shap_factors?.[0];

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-xl cursor-pointer transition-all border relative overflow-hidden ${
        isSelected
          ? 'bg-slate-900 border-blue-500 shadow-lg shadow-blue-500/10'
          : isCritical
          ? 'bg-slate-900/60 border-red-500/30 hover:border-red-500/60 hover:bg-slate-900/90'
          : 'bg-slate-900/40 border-white/10 hover:border-white/20 hover:bg-slate-900/70'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`pill ${meta.badgeClass}`}>
          {isCritical ? <AlertTriangle className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {meta.label}
        </span>

        {/* Fused Risk Score Indicator */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[11px] text-slate-400">Fused Risk:</span>
          <span
            className={`font-bold text-xs px-2 py-0.5 rounded ${
              isCritical
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}
          >
            {(alert.risk_score * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Account Info */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white text-sm truncate pr-2">
            {alert.target_holder_name || 'Suspect Account'}
          </h4>
          {isFrozen && (
            <span className="pill pill-success text-[10px] flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> FROZEN
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
          <span>{maskAccountNumber(alert.target_account_number)}</span>
          <span>•</span>
          <span className="text-slate-300">{alert.target_account_id ? `UUID:${alert.target_account_id.slice(0, 8)}` : 'ID N/A'}</span>
        </div>
      </div>

      {/* Multi-Branch Score Breakdown */}
      <div className="grid grid-cols-2 gap-2 py-1.5 px-2 bg-slate-950/60 rounded-lg border border-white/5 mb-2 font-mono text-[11px]">
        <div className="flex justify-between items-center text-slate-400">
          <span>Branch A (Graph):</span>
          <span className="text-blue-400 font-semibold">{alert.graph_score ? alert.graph_score.toFixed(3) : '0.000'}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Branch B (Geo):</span>
          <span className="text-emerald-400 font-semibold">{alert.geo_score ? alert.geo_score.toFixed(3) : '0.000'}</span>
        </div>
      </div>

      {/* SHAP Factor Snippet */}
      {topFactor && (
        <div className="text-[11px] text-slate-400 bg-white/5 p-2 rounded-lg border border-white/5 flex items-start gap-1.5 mb-2">
          <span className="text-blue-400 font-bold font-mono shrink-0">{topFactor.impact}</span>
          <p className="line-clamp-2 text-slate-300">
            <strong className="text-white">{topFactor.factor}:</strong> {topFactor.detail}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <span className="text-[10px] font-mono text-slate-400">
          ID: {alert.id.slice(0, 8)}...
        </span>

        <div className="flex items-center gap-2">
          {!isFrozen && isCritical && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFreezeClick(alert);
              }}
              className="px-2.5 py-1 rounded bg-red-600/90 hover:bg-red-500 text-white font-mono text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-sm"
            >
              <Lock className="w-3 h-3" /> Freeze Order
            </button>
          )}
          <span className="text-xs text-slate-400 flex items-center gap-0.5 hover:text-white">
            Inspect <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
