import React, { useState } from 'react';
import {
  ShieldAlert,
  Building,
  Calendar,
  FileText,
  Coins,
  Radio,
  CheckCircle2,
  Copy,
  Check,
  Activity
} from 'lucide-react';
import { FreezeButton } from '../actions/FreezeButton';
import { maskAccountNumber } from '../../utils/constants';

export const CaseEvidenceDocket = ({
  alert,
  onOpenDossier,
  onOpenRestitution,
  onOpenPatrol
}) => {
  const [copied, setCopied] = useState(false);

  if (!alert) {
    return (
      <div className="flex flex-col items-center justify-center h-full rounded-xl bg-zinc-900/60 border border-white/[0.06] p-6 text-center text-zinc-500 font-mono text-xs select-none">
        <ShieldAlert className="w-8 h-8 text-zinc-600 mb-2" />
        <p className="font-medium text-zinc-300">No Target Selected</p>
        <p className="text-[11px] text-zinc-500 mt-1">Select an incident from the queue to view evidence.</p>
      </div>
    );
  }

  const isCritical = alert.risk_score >= 0.85;
  const isElevated = alert.risk_score >= 0.70 && alert.risk_score < 0.85;
  const isFrozen = alert.status === 'FREEZE_DISPATCHED' || alert.status === 'FREEZE_CONFIRMED';
  const explanation = alert.explanation || {};
  const factors = explanation.shap_factors || [];

  const copyLegalDossier = () => {
    const text = `RAKSHANET EVIDENCE DOSSIER (SEC 65B CERTIFIED)
Suspect: ${alert.target_holder_name}
Account: ${alert.target_account_number}
Bank: ${alert.bank_name || 'Core Banking Entity'}
Fused Risk: ${(alert.risk_score * 100).toFixed(1)}% [Graph: ${(alert.graph_score || 0).toFixed(3)}, Geo: ${(alert.geo_score || 0).toFixed(3)}]

SHAP ATTRIBUTION FACTORS:
${factors.map((f, i) => `${i + 1}. [${f.impact}] ${f.factor}: ${f.detail}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const graphPct = Math.round((alert.graph_score || 0.8) * 100);
  const geoPct = Math.round((alert.geo_score || 0.75) * 100);

  return (
    <div className="flex flex-col h-full rounded-xl bg-zinc-900/60 border border-white/[0.06] overflow-hidden select-none">
      {/* Docket Header */}
      <div className="p-3.5 border-b border-white/[0.06] flex items-center justify-between bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="font-mono font-semibold text-zinc-200 text-xs tracking-wide uppercase">
            Suspect Intelligence
          </h3>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
            isFrozen
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : isCritical
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
          }`}
        >
          {isFrozen ? 'FROZEN' : isCritical ? 'CRITICAL' : 'ELEVATED'}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
        {/* Suspect Identity */}
        <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/[0.06] space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                Target Account
              </span>
              <h4 className="font-semibold text-white text-sm mt-0.5">
                {alert.target_holder_name || 'Suspect Entity'}
              </h4>
              <p className="text-zinc-400 text-xs mt-0.5">
                {maskAccountNumber(alert.target_account_number)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                Risk Score
              </span>
              <span className={`text-xl font-bold font-mono ${isCritical ? 'text-rose-400' : 'text-amber-400'}`}>
                {(alert.risk_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.04] text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5 truncate">
              <Building className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{alert.bank_name || 'Core Bank'}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>{alert.city || 'Sector Hub'}</span>
            </div>
          </div>

          {alert.bank_lien_reference && (
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Lien Reference:
              </span>
              <span className="font-bold text-white font-mono">{alert.bank_lien_reference}</span>
            </div>
          )}
        </div>

        {/* Dual-AI Split Gauge */}
        <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-300 font-medium">Dual-AI Model</span>
            <span className="text-zinc-500 text-[10px]">0.60·Graph + 0.40·Geo</span>
          </div>

          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                <span>Graph Link Prediction</span>
                <span className="text-blue-400 font-mono font-semibold">{graphPct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(graphPct, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                <span>Geospatial Proximity</span>
                <span className="text-rose-400 font-mono font-semibold">{geoPct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${Math.min(geoPct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Attribution Factors (SHAP) */}
        <div className="p-3 rounded-lg bg-zinc-950/60 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-300 text-xs">Attribution Factors</span>
            <button
              onClick={copyLegalDossier}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] border border-white/[0.06] transition-colors cursor-pointer"
              title="Copy forensic summary"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {factors.length === 0 ? (
              <p className="text-[11px] text-zinc-500 py-1">Analyzing pattern factors...</p>
            ) : (
              factors.map((f, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-zinc-900/60 border border-white/[0.04] flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-200 text-[11px] truncate">{f.factor}</p>
                    <p className="text-zinc-500 text-[10px] mt-0.5 leading-snug truncate">{f.detail}</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[9px] font-semibold shrink-0 border border-amber-500/20">
                    {f.impact}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Directives */}
        <div className="space-y-2 pt-1">
          {/* Hero Freeze Button */}
          <FreezeButton
            accountId={alert.target_account_id}
            accountHolder={alert.target_holder_name}
            isFrozen={isFrozen}
          />

          {/* Secondary Actions - Semantic Purposeful Accents */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={onOpenDossier}
              className="py-1.5 px-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.06] text-zinc-300 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate"
              title="Section 65B Electronic Evidence Brief"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Sec 65B</span>
            </button>

            <button
              onClick={onOpenRestitution}
              className="py-1.5 px-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.06] text-zinc-300 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate"
              title="Section 457 Restitution Order"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Sec 457</span>
            </button>

            <button
              onClick={onOpenPatrol}
              className="py-1.5 px-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.06] text-zinc-300 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate"
              title="Dispatch Patrol"
            >
              <Radio className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">Patrol</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

