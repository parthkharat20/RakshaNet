import React, { useState } from 'react';
import {
  ShieldAlert,
  Building,
  Calendar,
  Lock,
  FileText,
  Coins,
  Radio,
  CheckCircle2,
  Copy,
  Check,
  Scale,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { FreezeButton } from '../actions/FreezeButton';
import { maskAccountNumber, formatDateTime } from '../../utils/constants';

export const CaseEvidenceDocket = ({
  alert,
  onOpenDossier,
  onOpenRestitution,
  onOpenPatrol
}) => {
  const [copied, setCopied] = useState(false);

  if (!alert) {
    return (
      <div className="command-panel p-6 flex flex-col items-center justify-center h-full text-center text-slate-400 font-mono text-xs">
        <ShieldAlert className="w-8 h-8 text-slate-600 mb-2" />
        <p className="font-semibold text-slate-300">No Target Suspect Selected</p>
        <p className="text-[11px] text-slate-500 mt-1">Select any incident from the queue to view forensic evidence and dispatch legal orders.</p>
      </div>
    );
  }

  const isCritical = alert.risk_score >= 0.85;
  const isElevated = alert.risk_score >= 0.70 && alert.risk_score < 0.85;
  const isFrozen = alert.status === 'FREEZE_DISPATCHED' || alert.status === 'FREEZE_CONFIRMED';
  const explanation = alert.explanation || {};
  const factors = explanation.shap_factors || [];
  const verdict = explanation.verdict || (isCritical ? 'CRITICAL_MULE_INTERDICTION_RECOMMENDED' : 'MONITORING_ADVISORY');

  const copyLegalDossier = () => {
    const text = `RAKSHANET EVIDENCE DOSSIER (SECTION 65B CERTIFIED)
Suspect Holder: ${alert.target_holder_name}
Account Number: ${alert.target_account_number}
Bank: ${alert.bank_name || 'Core Banking Entity'}
Verdict: ${verdict}
Fused Risk Score: ${(alert.risk_score * 100).toFixed(1)}% [Graph: ${(alert.graph_score || 0).toFixed(3)}, Geo: ${(alert.geo_score || 0).toFixed(3)}]

SHAP ATTRIBUTION FACTORS:
${factors.map((f, i) => `${i + 1}. [${f.impact}] ${f.factor} — ${f.detail}`).join('\n')}

Cryptographically Prepared for Evidence Submission under Section 65B Indian Evidence Act / BSA 2023.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="command-panel flex flex-col h-full overflow-hidden select-none bg-[#0B101D]">
      {/* Docket Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#080D18]">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-white text-xs tracking-wide uppercase">
              Target Suspect Dossier & Evidence
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              ALERT ID: {(alert.id || alert.alert_id || 'INCIDENT').slice(0, 13)}...
            </p>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
          isFrozen
            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
            : isCritical
            ? 'bg-red-950/80 text-red-400 border border-red-500/40'
            : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
        }`}>
          {isFrozen ? 'INTERDICTED' : 'ACTION REQUIRED'}
        </span>
      </div>

      {/* Scrollable Intelligence Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 font-mono text-xs">
        {/* Suspect Identity Card */}
        <div className="p-3.5 rounded-lg bg-[#0E1526] border border-white/10 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Indicted Account Holder
              </span>
              <h4 className="font-sans font-bold text-white text-sm mt-0.5">
                {alert.target_holder_name || 'Suspect Entity'}
              </h4>
              <p className="text-slate-300 text-xs mt-0.5">
                {maskAccountNumber(alert.target_account_number)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                Fused Threat
              </span>
              <span className={`text-xl font-bold font-mono ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                {(alert.risk_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 truncate">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{alert.bank_name || 'Core Banking Node'}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{alert.city || 'Mumbai Sector'}</span>
            </div>
          </div>

          {/* CFCFRMS Confirmation if Frozen */}
          {alert.bank_lien_reference && (
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                CFCFRMS Lien Confirmed:
              </span>
              <span className="font-mono font-bold text-white">{alert.bank_lien_reference}</span>
            </div>
          )}
        </div>

        {/* Dual-AI Math Fusion Card */}
        <div className="p-3 rounded-lg bg-[#0E1526] border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
            <span>Dual-AI Risk Equation</span>
            <span className="text-blue-400 font-bold">0.60·Graph + 0.40·Geo</span>
          </div>
          <div className="flex items-center justify-between text-[11px] bg-black/40 p-2 rounded border border-white/5">
            <div className="flex items-center gap-2">
              <span>Graph: <strong className="text-blue-400">{(alert.graph_score || 0).toFixed(3)}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Geo: <strong className="text-emerald-400">{(alert.geo_score || 0).toFixed(3)}</strong></span>
            </div>
            <span className="font-bold text-white">{(alert.risk_score * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* SHAP Feature Attributions (Why it was flagged) */}
        <div className="p-3 rounded-lg bg-[#0E1526] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white text-xs">SHAP Attribution Factors</span>
            </div>
            <button
              onClick={copyLegalDossier}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/10 transition-colors cursor-pointer"
              title="Copy court-admissible forensic text"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {factors.length === 0 ? (
              <p className="text-[11px] text-slate-500 py-2">Analyzing heuristic topology markers...</p>
            ) : (
              factors.map((f, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-black/40 border border-white/5 hover:border-white/15 transition-colors flex items-start gap-2"
                >
                  <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px] shrink-0 border border-blue-500/30">
                    {f.impact}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-200 text-[11px] truncate">{f.factor}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5 leading-snug">{f.detail}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* One-Click Statutory Action Suite */}
        <div className="p-3 rounded-lg bg-[#0E1526] border border-white/10 space-y-2">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
            Statutory Interdiction Directives
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={onOpenDossier}
              className="btn-command-secondary justify-center text-xs py-2 cursor-pointer"
              title="Export Section 65B Electronic Evidence Brief & Section 91 Directive"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sec 65B Dossier</span>
            </button>

            <button
              onClick={onOpenRestitution}
              className="btn-command-secondary justify-center text-xs py-2 cursor-pointer"
              title="Draft and execute Section 457 Cr.P.C. / BNSS 503 Magisterial Restitution Order"
            >
              <Coins className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Sec 457 Restitution</span>
            </button>

            <button
              onClick={onOpenPatrol}
              className="btn-command-secondary justify-center text-xs py-2 border-red-500/30 text-red-300 hover:bg-red-500/10 cursor-pointer"
              title="Dispatch nearest police PCR van or Beat Marshal to ATM liquidation point"
            >
              <Radio className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Dispatch Patrol</span>
            </button>

            <div className="flex items-stretch">
              <FreezeButton
                accountId={alert.target_account_id}
                accountHolder={alert.target_holder_name}
                isFrozen={isFrozen}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
