import React from 'react';
import { X, ShieldAlert, User, Building, Calendar, Lock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { ExplainPanel } from '../explain/ExplainPanel';
import { FreezeButton } from '../actions/FreezeButton';
import { maskAccountNumber, formatDateTime, formatINR } from '../../utils/constants';

export const CaseDrawer = ({ onClose, onOpenCommandCenter }) => {
  const { selectedAlert } = useAlertContext();

  if (!selectedAlert) return null;

  const isCritical = selectedAlert.risk_score >= 0.75;
  const isFrozen = selectedAlert.status === 'FREEZE_DISPATCHED';

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden border-white/10 bg-slate-950/90">
      {/* Drawer Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-950">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base">
              Intelligence Case Dossier
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              ALERT REF: {selectedAlert.id}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dossier Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
        {/* Suspect Account Header Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-white/10 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Flagged Suspect Holder</span>
              <h4 className="text-base font-bold text-white mt-0.5">
                {selectedAlert.target_holder_name || 'Suspect Account'}
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                {maskAccountNumber(selectedAlert.target_account_number)}
              </p>
            </div>

            {/* Fused Risk Gauge */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Fused Risk</span>
              <span className={`text-xl font-bold font-display ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                {(selectedAlert.risk_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Target Bank: <strong className="text-white">Active Node</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Reported: <strong className="text-white">{formatDateTime(selectedAlert.created_at)}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Interdiction Status:</span>
            {isFrozen ? (
              <span className="pill pill-success text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> FREEZE DISPATCHED
              </span>
            ) : (
              <span className="pill pill-critical text-[10px]">
                ACTION REQUIRED
              </span>
            )}
          </div>

          <FreezeButton
            accountId={selectedAlert.target_account_id}
            accountHolder={selectedAlert.target_holder_name}
            isFrozen={isFrozen}
          />
        </div>

        {/* Tactical Deep Dive Link */}
        {onOpenCommandCenter && (
          <button
            onClick={() => onOpenCommandCenter(selectedAlert)}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center justify-center gap-2 font-semibold transition-all hover:border-blue-500/60"
          >
            <span>Open Multi-Hop Graph in Tactical Command Center</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}

        {/* Explainable AI & SHAP Factors Panel */}
        <ExplainPanel
          explanation={selectedAlert.explanation}
          fusedScore={selectedAlert.risk_score}
          graphScore={selectedAlert.graph_score}
          geoScore={selectedAlert.geo_score}
        />
      </div>
    </div>
  );
};
