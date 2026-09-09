import React from 'react';
import { AlertTriangle, ShieldCheck, Eye, Zap, ArrowRight, Lock } from 'lucide-react';
import { ALERT_TYPE_META, maskAccountNumber } from '../../utils/constants';

export const AlertCard = ({ alert, isSelected, onSelect, onFreezeClick, theme = 'dark' }) => {
  const isCritical = alert.risk_score >= 0.75;
  const isFrozen = alert.status === 'FREEZE_DISPATCHED' || alert.status === 'FREEZE_CONFIRMED';
  const meta = ALERT_TYPE_META[alert.alert_type] || ALERT_TYPE_META.SURVEILLANCE;
  const isDark = theme === 'dark';

  // Top SHAP factor
  const topFactor = alert.explanation?.shap_factors?.[0];

  const getCardStyle = () => {
    if (isDark) {
      if (isSelected) return 'bg-slate-900 border-blue-500 shadow-lg shadow-blue-500/10';
      if (isCritical) return 'bg-slate-900/60 border-red-500/30 hover:border-red-500/60 hover:bg-slate-900/90';
      return 'bg-slate-900/40 border-white/10 hover:border-white/20 hover:bg-slate-900/70';
    } else {
      if (isSelected) return 'bg-blue-50/90 border-blue-500 shadow-md shadow-blue-500/10';
      if (isCritical) return 'bg-red-50/70 border-red-300 hover:border-red-400 hover:bg-red-50';
      return 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-xl cursor-pointer transition-all border relative overflow-hidden ${getCardStyle()}`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`pill ${meta.badgeClass}`}>
          {isCritical ? <AlertTriangle className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {meta.label}
        </span>

        {/* Fused Risk Score Indicator */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fused Risk:</span>
          <span
            className={`font-bold text-xs px-2 py-0.5 rounded ${
              isCritical
                ? (isDark ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-red-100 text-red-700 border border-red-300')
                : (isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-amber-100 text-amber-700 border border-amber-300')
            }`}
          >
            {(alert.risk_score * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Account Info */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h4 className={`font-semibold text-sm truncate pr-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {alert.target_holder_name || 'Suspect Account'}
          </h4>
          {isFrozen && (
            <span className="pill pill-success text-[10px] flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> FROZEN
            </span>
          )}
        </div>
        <div className={`flex items-center gap-2 text-xs font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>{maskAccountNumber(alert.target_account_number)}</span>
          <span>•</span>
          <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
            {alert.city || alert.target_city ? `${alert.city || alert.target_city}` : (alert.target_account_id ? `UUID:${alert.target_account_id.slice(0, 8)}` : 'ID N/A')}
          </span>
        </div>
      </div>

      {/* Multi-Branch Score Breakdown */}
      <div className={`grid grid-cols-2 gap-2 py-1.5 px-2 rounded-lg border mb-2 font-mono text-[11px] ${
        isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-100/80 border-slate-200'
      }`}>
        <div className={`flex justify-between items-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <span>Branch A (Graph):</span>
          <span className="text-blue-500 font-semibold">{alert.graph_score ? alert.graph_score.toFixed(3) : '0.000'}</span>
        </div>
        <div className={`flex justify-between items-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <span>Branch B (Geo):</span>
          <span className="text-emerald-500 font-semibold">{alert.geo_score ? alert.geo_score.toFixed(3) : '0.000'}</span>
        </div>
      </div>

      {/* SHAP Factor Snippet */}
      {topFactor && (
        <div className={`text-[11px] p-2 rounded-lg border flex items-start gap-1.5 mb-2 ${
          isDark ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <span className="text-blue-500 font-bold font-mono shrink-0">{topFactor.impact}</span>
          <p className="line-clamp-2">
            <strong className={isDark ? 'text-white' : 'text-slate-900'}>{topFactor.factor}:</strong> {topFactor.detail}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className={`flex items-center justify-between pt-1 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          ID: {alert.id.slice(0, 8)}...
        </span>

        <div className="flex items-center gap-2">
          {!isFrozen && isCritical && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFreezeClick(alert);
              }}
              className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-sm"
            >
              <Lock className="w-3 h-3" /> Freeze Order
            </button>
          )}
          <span className={`text-xs flex items-center gap-0.5 font-medium ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
            Inspect <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
