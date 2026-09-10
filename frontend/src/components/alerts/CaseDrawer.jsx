import React, { useState } from 'react';
import { X, ShieldAlert, User, Building, Calendar, Lock, ArrowUpRight, CheckCircle2, Radio, Scale, FileText, Coins } from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { ExplainPanel } from '../explain/ExplainPanel';
import { FreezeButton } from '../actions/FreezeButton';
import { PatrolDispatchModal } from '../patrols/PatrolDispatchModal';
import { LegalDossierModal } from '../dossier/LegalDossierModal';
import { RestitutionModal } from '../restitution/RestitutionModal';
import { maskAccountNumber, formatDateTime, formatINR } from '../../utils/constants';

export const CaseDrawer = ({ onClose, onOpenCommandCenter }) => {
  const { selectedAlert } = useAlertContext();
  const [patrolModalOpen, setPatrolModalOpen] = useState(false);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [restitutionModalOpen, setRestitutionModalOpen] = useState(false);



  if (!selectedAlert) return null;

  const isCritical = selectedAlert.risk_score >= 0.75;
  const isFrozen = selectedAlert.status === 'FREEZE_DISPATCHED' || selectedAlert.status === 'FREEZE_CONFIRMED';
  const hasLienRef = selectedAlert.bank_lien_reference || (isFrozen && 'SBI-CFCFRMS-CONFIRMED');

  return (
    <div className="command-panel flex flex-col h-full overflow-hidden">
      {/* Drawer Header */}
      <div className="px-4 py-3 border-b border-[#1E293B]/80 flex items-center justify-between shrink-0 bg-[#0B101D]">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${isCritical ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
              Intelligence Case Dossier
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              ALERT REF: {selectedAlert.id}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dossier Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
        {/* Suspect Account Header Card */}
        <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#1E293B] relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Flagged Suspect Holder</span>
              <h4 className="text-sm font-bold text-slate-100 mt-0.5 font-sans">
                {selectedAlert.target_holder_name || 'Suspect Account'}
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                {maskAccountNumber(selectedAlert.target_account_number)}
              </p>
            </div>

            {/* Fused Risk Gauge */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Fused Risk</span>
              <span className={`text-xl font-bold font-mono ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                {(selectedAlert.risk_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#1E293B]/60 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Target Bank: <strong className="text-slate-100">{selectedAlert.bank_name || 'Active Node'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Reported: <strong className="text-slate-100">{formatDateTime(selectedAlert.created_at)}</strong></span>
            </div>
          </div>

          {/* Bank Lien Confirmation Badge */}
          {selectedAlert.bank_lien_reference && (
            <div className="mt-3 p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                CFCFRMS Lien Confirmed:
              </span>
              <span className="font-mono font-bold text-white">{selectedAlert.bank_lien_reference}</span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 rounded-lg bg-[#0E1526] border border-[#1E293B]">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Interdiction:</span>
            {isFrozen ? (
              <span className="badge-status-success text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> {selectedAlert.status === 'FREEZE_CONFIRMED' ? 'LIEN CONFIRMED' : 'FREEZE DISPATCHED'}
              </span>
            ) : (
              <span className="badge-status-critical text-[10px]">
                ACTION REQUIRED
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setDossierModalOpen(true)}
              className="btn-command-secondary text-[11px] py-1 px-2.5"
              title="Generate court-admissible Section 65B Electronic Evidence Brief & Section 91 Notice"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sec 65B Dossier</span>
            </button>

            <button
              onClick={() => setRestitutionModalOpen(true)}
              className="btn-command-secondary text-[11px] py-1 px-2.5"
              title="Draft and execute Section 457 Cr.P.C. / BNSS 503 Magisterial Restitution Order"
            >
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sec 457 Restitution</span>
            </button>

            <button
              onClick={() => setPatrolModalOpen(true)}
              className="btn-command-secondary text-[11px] py-1 px-2.5 border-red-500/40 text-red-300 hover:bg-red-500/10"
              title="Dispatch nearest police PCR van or Beat Marshal to predicted ATM cashout point"
            >
              <Radio className="w-3.5 h-3.5 text-red-400" />
              <span>Patrol</span>
            </button>

            <FreezeButton
              accountId={selectedAlert.target_account_id}
              accountHolder={selectedAlert.target_holder_name}
              isFrozen={isFrozen}
            />
          </div>
        </div>

        {/* Tactical Deep Dive Link */}
        {onOpenCommandCenter && (
          <button
            onClick={() => onOpenCommandCenter(selectedAlert)}
            className="btn-command-primary w-full justify-center py-2 text-xs"
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

      {/* Court-Admissible Electronic Evidence Dossier Modal */}
      <LegalDossierModal
        isOpen={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        alertId={selectedAlert.id}
      />

      {/* Section 457 Cr.P.C. / BNSS 503 Victim Restitution Modal */}
      <RestitutionModal
        isOpen={restitutionModalOpen}
        onClose={() => setRestitutionModalOpen(false)}
        alertId={selectedAlert.id}
      />
    </div>
  );
};


