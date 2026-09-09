import React, { useState, useEffect } from 'react';
import {
  Coins,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building,
  User,
  ShieldCheck,
  Copy,
  Check,
  Printer,
  X,
  Loader2,
  Lock,
  Hash,
  ExternalLink,
  FileCheck
} from 'lucide-react';
import { draftRestitutionApi, executeRestitutionApi } from '../../utils/api';
import { formatINR, maskAccountNumber, formatDateTime } from '../../utils/constants';

export const RestitutionModal = ({ isOpen, onClose, alertId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  // Execution form fields
  const [courtOrderNumber, setCourtOrderNumber] = useState('');
  const [magistrateCourt, setMagistrateCourt] = useState('Esplanade Court of Chief Metropolitan Magistrate, Mumbai');
  const [judicialNotes, setJudicialNotes] = useState('Court release order granted under Section 457 Cr.P.C. / Section 503 BNSS. 100% frozen balance sanctioned for reverse debit.');

  useEffect(() => {
    if (!isOpen) return;

    const loadDraft = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await draftRestitutionApi({ alert_id: alertId });
        setOrder(res);
        if (res.court_order_number) {
          setCourtOrderNumber(res.court_order_number);
        }
        if (res.magistrate_court) {
          setMagistrateCourt(res.magistrate_court);
        }
      } catch (err) {
        console.error('Failed to draft restitution order:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to initialize restitution petition.');
      } finally {
        setLoading(false);
      }
    };

    loadDraft();
  }, [isOpen, alertId]);

  const handleExecute = async () => {
    if (!order?.id) return;
    try {
      setExecuting(true);
      setError('');
      const res = await executeRestitutionApi(order.id, {
        court_order_number: courtOrderNumber || `CJM-MUM-457-${Date.now().toString().slice(-6)}`,
        magistrate_court: magistrateCourt,
        judicial_notes: judicialNotes
      });
      setOrder(res);
    } catch (err) {
      console.error('Failed to execute reverse settlement:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to execute bank reverse settlement.');
    } finally {
      setExecuting(false);
    }
  };

  const handleCopyHash = () => {
    if (!order?.sha256_hash) return;
    navigator.clipboard.writeText(order.sha256_hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!isOpen) return null;

  const isCompleted = order?.status === 'RESTITUTION_COMPLETED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-950 border border-white/10 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  Citizen Restitution Engine (Section 457 Cr.P.C. / BNSS 503)
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  isCompleted
                    ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                    : 'bg-amber-950 border border-amber-500/50 text-amber-300'
                }`}>
                  {isCompleted ? 'RESTITUTION EXECUTED' : 'PETITION DRAFTED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Chief Metropolitan Magistrate Fund Release & Reverse Inter-Bank Settlement Rails
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Print Section 457 Restitution Decree"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p>Assembling Section 457 Restitution Petition & Banking Lien Details...</p>
            </div>
          ) : error && !order ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="font-bold">Restitution Petition Error</p>
                <p className="text-[11px] text-red-400/90 mt-0.5">{error}</p>
              </div>
            </div>
          ) : order && (
            <>
              {/* Success Notification Bar if Completed */}
              {isCompleted && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 flex items-start justify-between shadow-lg shadow-emerald-950/40">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-300">
                        Funds Restored to Citizen Under Section 457 Cr.P.C. / BNSS 503
                      </h4>
                      <p className="text-[11px] text-emerald-400/90 mt-1">
                        Reverse RTGS debit dispatched to frozen mule account at {order.frozen_bank}. Defrauded citizen account credited in full.
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px]">
                        <span>Settlement Ref: <strong className="text-white">{order.reverse_settlement_ref || 'RTGS-SETTLE-OK'}</strong></span>
                        <span>Restituted Amount: <strong className="text-emerald-300 font-bold">{formatINR(order.amount_restituted)}</strong></span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold">
                    100% RECOVERED
                  </span>
                </div>
              )}

              {/* Transfer Flow Diagram (From Mule -> To Victim) */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                {/* Debited Suspect / Mule Node */}
                <div className="md:col-span-3 p-4 rounded-xl bg-slate-900 border border-rose-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                      Debited Indicted Mule Node
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[10px]">
                      FROZEN LIEN
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">
                    {maskAccountNumber(order.frozen_account_number)}
                  </p>
                  <p className="text-slate-400 flex items-center gap-1 mb-2">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    {order.frozen_bank}
                  </p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">CFCFRMS Lien:</span>
                    <span className="text-slate-300 font-semibold">{order.cfcfrms_lien_reference}</span>
                  </div>
                </div>

                {/* Flow Arrow & Sanctioned Amount */}
                <div className="md:col-span-1 flex flex-col items-center justify-center py-2 text-center">
                  <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 mb-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-slate-400">Court Debited</span>
                  <span className="text-xs font-bold text-cyan-300 mt-0.5">
                    {formatINR(order.amount_restituted)}
                  </span>
                </div>

                {/* Credited Victim Account */}
                <div className="md:col-span-3 p-4 rounded-xl bg-slate-900 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Credited Defrauded Citizen
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px]">
                      VICTIM RECOVERY
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    {order.victim_holder_name}
                  </p>
                  <p className="text-slate-400 mb-1">
                    Acc: <strong className="text-slate-200">{maskAccountNumber(order.victim_account_number)}</strong>
                  </p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{order.victim_bank}</span>
                    <span className="text-emerald-300 font-bold">{order.victim_ifsc}</span>
                  </div>
                </div>
              </div>

              {/* Judicial Parameters & Magisterial Order Details */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Statutory Judicial Sanction Details
                  </span>
                  <span className="text-[11px] text-cyan-400">
                    Ref: {order.restitution_reference}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Magisterial Court Order No:
                    </label>
                    <input
                      type="text"
                      disabled={isCompleted}
                      value={courtOrderNumber}
                      onChange={(e) => setCourtOrderNumber(e.target.value)}
                      placeholder="e.g. CJM-MUM-457-2026-8812"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/15 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 disabled:opacity-60 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Designated Magisterial Court:
                    </label>
                    <input
                      type="text"
                      disabled={isCompleted}
                      value={magistrateCourt}
                      onChange={(e) => setMagistrateCourt(e.target.value)}
                      placeholder="Court of Chief Judicial Magistrate"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/15 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 disabled:opacity-60 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Judicial Notes / Magistrate Directives:
                  </label>
                  <textarea
                    rows={2}
                    disabled={isCompleted}
                    value={judicialNotes}
                    onChange={(e) => setJudicialNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/15 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 disabled:opacity-60 font-mono text-xs resize-none"
                  />
                </div>
              </div>

              {/* Cryptographic SHA-256 Signature Verification */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 tracking-wider block">
                      Cryptographic Audit Signature (SHA-256 Root)
                    </span>
                    <span className="font-mono text-[11px] text-cyan-300 break-all select-all">
                      {order.sha256_hash}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyHash}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-mono flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedHash ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Hash</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Banner */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                <div className="text-[11px] text-slate-400">
                  <span>Drafted: <strong className="text-slate-200">{formatDateTime(order.created_at)}</strong></span>
                  {order.executed_at && (
                    <span className="ml-3">Executed: <strong className="text-emerald-300">{formatDateTime(order.executed_at)}</strong></span>
                  )}
                </div>

                {!isCompleted ? (
                  <button
                    onClick={handleExecute}
                    disabled={executing}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {executing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Debiting Mule Account & Crediting Citizen...</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        <span>Execute Magisterial Reverse Settlement ({formatINR(order.amount_restituted)})</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <FileCheck className="w-4 h-4" />
                    <span>Order Executed & Funds Dispatched</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
