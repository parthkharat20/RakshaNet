import React, { useState } from 'react';
import { X, ShieldAlert, User, Building, Calendar, Lock, ArrowUpRight, CheckCircle2, Radio, CheckSquare } from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { ExplainPanel } from '../explain/ExplainPanel';
import { FreezeButton } from '../actions/FreezeButton';
import { PatrolDispatchModal } from '../patrols/PatrolDispatchModal';
import { maskAccountNumber, formatDateTime, formatINR } from '../../utils/constants';

export const CaseDrawer = ({ onClose, onOpenCommandCenter }) => {
  const { selectedAlert, resolveAlert } = useAlertContext();
  const [patrolModalOpen, setPatrolModalOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  if (!selectedAlert) return null;

  const isCritical = selectedAlert.risk_score >= 0.75;
  const isFrozen = selectedAlert.status === 'FREEZE_DISPATCHED' || selectedAlert.status === 'FREEZE_CONFIRMED';
  const isSolved = selectedAlert.status === 'RESOLVED' || selectedAlert.status === 'SOLVED';

  const handleResolveCase = async () => {
    try {
      setIsResolving(true);
      await resolveAlert(selectedAlert.id, 'Case successfully resolved and saved to PostgreSQL database');
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to resolve case:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const hasLienRef = selectedAlert.bank_lien_reference || (isFrozen && 'SBI-CFCFRMS-CONFIRMED');

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
              <span>Target Bank: <strong className="text-white">{selectedAlert.bank_name || 'Active Node'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Reported: <strong className="text-white">{formatDateTime(selectedAlert.created_at)}</strong></span>
            </div>
          </div>

          {/* Bank Lien Confirmation Badge */}
          {selectedAlert.bank_lien_reference && (
            <div className="mt-3 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                CFCFRMS Lien Confirmed:
              </span>
              <span className="font-mono font-bold text-white">{selectedAlert.bank_lien_reference}</span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Interdiction Status:</span>
            {isFrozen ? (
              <span className="pill pill-success text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> {selectedAlert.status === 'FREEZE_CONFIRMED' ? 'LIEN CONFIRMED' : 'FREEZE DISPATCHED'}
              </span>
            ) : (
              <span className="pill pill-critical text-[10px]">
                ACTION REQUIRED
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPatrolModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors"
              title="Dispatch nearest police PCR van or Beat Marshal to predicted ATM cashout point"
            >
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Dispatch Patrol</span>
            </button>

            <FreezeButton
              accountId={selectedAlert.target_account_id}
              accountHolder={selectedAlert.target_holder_name}
              isFrozen={isFrozen}
            />

            <button
              onClick={handleResolveCase}
              disabled={isResolving || isSolved}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-sm ${
                isSolved
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 cursor-default'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 active:scale-95'
              }`}
              title="Mark Case Solved & Save Status to PostgreSQL Database"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSolved ? 'Case Solved' : isResolving ? 'Saving DB...' : 'Mark Case Solved'}</span>
            </button>
          </div>
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

      {/* Patrol Dispatch Modal */}
      <PatrolDispatchModal
        isOpen={patrolModalOpen}
        onClose={() => setPatrolModalOpen(false)}
        targetHotspot={{
          alert_id: selectedAlert.id,
          terminal_id: selectedAlert.target_terminal_id || 'ATM_MUM_001',
          name: selectedAlert.target_atm_name || 'State Bank of India - Matunga East ATM',
          lat: selectedAlert.target_lat || (selectedAlert.city === 'Delhi' ? 28.6290 : selectedAlert.city === 'Bengaluru' ? 12.9352 : 19.0270),
          lon: selectedAlert.target_lon || (selectedAlert.city === 'Delhi' ? 77.2260 : selectedAlert.city === 'Bengaluru' ? 77.6245 : 72.8550)
        }}
      />
    </div>
  );
};

