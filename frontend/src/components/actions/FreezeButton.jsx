import React, { useState } from 'react';
import { Lock, ShieldAlert, CheckCircle2, Copy, Check, X, AlertTriangle } from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { DEFAULT_OFFICER_BADGE } from '../../utils/constants';

export const FreezeButton = ({ accountId, accountHolder, isFrozen, onSuccess }) => {
  const { dispatchFreeze } = useAlertContext();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('NCRP Cyber Financial Fraud Emergency Interdiction');
  const [notes, setNotes] = useState('High-velocity multi-hop fund layering mule detected by Dual AI Pipeline');
  const [officerBadge, setOfficerBadge] = useState(DEFAULT_OFFICER_BADGE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleOpen = (e) => {
    e.stopPropagation();
    setIsOpen(true);
    setReceipt(null);
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDispatch = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await dispatchFreeze(accountId, {
        officerBadgeId: officerBadge,
        reason,
        notes
      });
      setReceipt(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setError(err.message || 'Freeze dispatch failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReceipt = () => {
    if (!receipt) return;
    const text = `RAKSHANET ONE-CLICK ACCOUNT FREEZE RECEIPT
Target Account ID: ${receipt.account_id}
Account Number: ${receipt.account_number}
Bank Name: ${receipt.bank_name || 'Beneficiary Core Banking'}
Bank Lien Reference: ${receipt.bank_lien_reference || 'N/A'}
CFCFRMS Ack Code: ${receipt.cfcfrms_ack_code || 'N/A'}
Funds Retained: ₹${receipt.funds_retained ? Number(receipt.funds_retained).toLocaleString('en-IN') : '0.00'}
Branch IFSC: ${receipt.branch_ifsc || 'N/A'}
Officer Badge ID: ${officerBadge}
Timestamp: ${receipt.action_taken_at || receipt.timestamp}
Audit Log ID: ${receipt.audit_log_id}
SHA-256 Signature: ${receipt.hash_signature}
Status: SECTION 91 CRPC INTER-BANK LIEN CONFIRMED & DISPATCHED VIA CFCFRMS`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  if (isFrozen) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>FROZEN (SEC 91)</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="btn-command-danger text-xs py-1.5 px-3 cursor-pointer"
        title="Execute emergency Section 91 CrPC Bank Lien Freeze"
      >
        <Lock className="w-3.5 h-3.5" />
        <span>Dispatch Freeze Order</span>
      </button>

      {/* Confirmation & Evidence Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/15 p-6 shadow-2xl space-y-4 font-mono text-xs relative"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-950/80 border border-red-800/60 text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    {receipt ? 'Freeze Order Executed & Logged' : 'Dispatch Emergency Freeze Order'}
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Target: <strong className="text-white">{accountHolder || 'Suspect Account'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {!receipt ? (
              /* Order Submission Form */
              <div className="space-y-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wider">
                    Authorizing Officer Badge ID:
                  </label>
                  <input
                    type="text"
                    value={officerBadge}
                    onChange={(e) => setOfficerBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wider">
                    Statutory Reason / Directive:
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wider">
                    Tactical Case Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white font-mono focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-[11px] space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> LEGAL DIRECTIVE NOTICE:
                  </p>
                  <p className="text-amber-200/80">
                    Executing this order will synchronously flag the account as frozen in PostgreSQL & Neo4j,
                    lock debit capabilities, and generate a tamper-proof SHA-256 evidence log.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={handleClose}
                    className="btn-ghost text-xs"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDispatch}
                    disabled={isSubmitting}
                    className="btn-critical text-xs"
                  >
                    {isSubmitting ? 'Dispatching Cryptographic Order...' : 'Confirm & Freeze Account'}
                  </button>
                </div>
              </div>
            ) : (
              /* Cryptographic Evidence Receipt */
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>INTERDICTION CONFIRMED</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Account <strong>{receipt.account_number}</strong> has been successfully frozen across banking nodes.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2 text-[11px]">
                  {receipt.bank_lien_reference && (
                    <div className="flex justify-between items-center py-1 px-2 rounded bg-blue-950/60 border border-blue-800/40">
                      <span className="text-blue-300 font-bold">Bank Lien Ref:</span>
                      <span className="text-white font-mono font-extrabold text-[12px]">{receipt.bank_lien_reference}</span>
                    </div>
                  )}
                  {receipt.funds_retained && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400">Funds Retained (Lien):</span>
                      <span className="text-emerald-400 font-mono font-bold">₹{Number(receipt.funds_retained).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Audit Log ID:</span>
                    <span className="text-white font-mono">{receipt.audit_log_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Executed At:</span>
                    <span className="text-white font-mono">{new Date(receipt.action_taken_at || receipt.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Cryptographic Evidence SHA-256 Signature:</span>
                    <div className="p-2 rounded bg-slate-900 border border-white/15 text-blue-300 font-mono break-all text-[10px]">
                      {receipt.hash_signature}
                    </div>
                  </div>
                </div>


                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={copyReceipt}
                    className="btn-ghost text-xs flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Receipt' : 'Copy Evidence Receipt'}</span>
                  </button>
                  <button
                    onClick={handleClose}
                    className="btn-primary text-xs"
                  >
                    Dismiss & Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
