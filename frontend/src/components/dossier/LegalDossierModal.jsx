import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  X,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Building,
  Radio,
  Lock,
  Hash,
  Scale,
  Clock,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { fetchCourtDossier } from '../../utils/api';
import { formatINR, maskAccountNumber } from '../../utils/constants';

export const LegalDossierModal = ({ isOpen, onClose, alertId }) => {
  const [dossier, setDossier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (!isOpen || !alertId) return;

    const loadDossier = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const data = await fetchCourtDossier(alertId);
        setDossier(data);
      } catch (err) {
        console.error('Failed to load court dossier:', err);
        setErrorMessage(err.message || 'Failed to assemble electronic court evidence dossier.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDossier();
  }, [isOpen, alertId]);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    if (!dossier?.certificate_65b?.evidence_hash_sha256) return;
    navigator.clipboard.writeText(dossier.certificate_65b.evidence_hash_sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header Bar */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                Section 65B Electronic Evidence Dossier
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  COURT ADMISSIBLE
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Bharatiya Sakshya Adhiniyam, 2023 (Sec 63) • Cr.P.C. Sec 91
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isLoading || !dossier}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              title="Print official legal brief or save as PDF"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print Court Brief</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body / Printable Brief Area */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs flex-1 print:p-0 print:overflow-visible print:text-black">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
              <span className="text-sm">Assembling multi-hop court dossier & computing root SHA-256 checksum...</span>
            </div>
          ) : errorMessage ? (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300">
              {errorMessage}
            </div>
          ) : dossier ? (
            <div className="space-y-6 print:space-y-4">
              {/* Government Official Header (Printable) */}
              <div className="text-center border-b-2 border-emerald-500/40 pb-4 space-y-1 print:border-black">
                <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-widest print:text-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-black" />
                  <span>Government of India • Indian Cybercrime Coordination Centre (I4C)</span>
                </div>
                <h1 className="text-lg font-bold font-serif text-white tracking-wide uppercase print:text-black">
                  State Cyber Crime Investigation Wing
                </h1>
                <h2 className="text-xs font-bold text-emerald-400 tracking-wider uppercase print:text-black">
                  Electronic Evidence Certificate & Statutory Section 91 Interdiction Brief
                </h2>
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-6 pt-1 print:text-gray-700">
                  <span>Dossier ID: <strong className="text-white print:text-black">{dossier.dossier_id}</strong></span>
                  <span>Case Ref: <strong className="text-white print:text-black">{dossier.case_reference}</strong></span>
                  <span>Generated: {new Date(dossier.generated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span>
                </div>
              </div>

              {/* Section 91 Cr.P.C. Statutory Notice */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 print:border-black print:bg-gray-50">
                <div className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-2 print:text-black">
                  <Scale className="w-4 h-4 text-amber-400 print:text-black" />
                  <span>Statutory Directive under Section 91 Cr.P.C., 1973 & Section 69B IT Act, 2000</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300 print:text-black font-sans">
                  <strong>TO:</strong> The Nodal Cyber Officer / Authorized Signatory, Core Banking Systems & Participating Intermediaries.<br />
                  <strong>WHEREAS</strong>, credible intelligence and inductive topological analysis indicate that Account Number <strong>{dossier.suspect_account_number}</strong> ({dossier.suspect_holder_name}) is actively functioning as a layered financial mule conduit in an ongoing cyber-financial fraud ring resulting in victim loss of <strong>{formatINR(dossier.citizen_loss_amount)}</strong> under NCRP Acknowledgement <strong>{dossier.citizen_acknowledgement_no}</strong>. You are hereby commanded to immediately preserve all ledger records and enforce full debit restriction under CFCFRMS interdiction protocols.
                </p>
              </div>

              {/* Suspect Account & Beneficiary Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 print:border-black">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider print:text-black">
                    Indicted Suspect Entity
                  </div>
                  <div className="space-y-1 text-slate-300 print:text-black">
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-700">Account Holder:</span>
                      <strong className="text-white print:text-black">{dossier.suspect_holder_name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-700">Account Number:</span>
                      <span className="font-mono text-white font-bold print:text-black">{dossier.suspect_account_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-700">Bank & Branch:</span>
                      <span>{dossier.suspect_bank} ({dossier.suspect_ifsc})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-700">Fused Threat Score:</span>
                      <span className="text-red-400 font-bold print:text-black">{dossier.fused_risk_score}% (CRITICAL)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 print:border-black">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider print:text-black">
                    Inter-Bank Lien & Operational Status
                  </div>
                  <div className="space-y-1 text-slate-300 print:text-black">
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-700">CFCFRMS Lien Ref:</span>
                      <strong className="font-mono text-emerald-300 print:text-black">{dossier.cfcfrms_lien_reference || 'PENDING CONFIRMATION'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-700">Retained Under Lien:</span>
                      <strong className="text-emerald-400 font-bold print:text-black">{formatINR(dossier.funds_retained)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-700">Beat Interdiction Flash:</span>
                      <span className="font-mono text-cyan-300 print:text-black">{dossier.patrol_dispatch_order || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-700">Assigned Patrol Unit:</span>
                      <span>{dossier.patrol_callsign}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Hop Forensic Fund Dissipation Trail */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between print:text-black">
                  <span>Forensic Multi-Hop Transaction Ledger (Neo4j Property Graph Trail)</span>
                  <span className="text-slate-400 text-[10px] print:text-gray-700">{dossier.transaction_trail.length} Sequential Transfers</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60 print:border-black print:bg-white">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold print:border-black print:bg-gray-100 print:text-black">
                        <th className="p-2.5">Hop</th>
                        <th className="p-2.5">Source Account</th>
                        <th className="p-2.5">Beneficiary Entity</th>
                        <th className="p-2.5">Bank / IFSC</th>
                        <th className="p-2.5 text-right">Amount (INR)</th>
                        <th className="p-2.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 print:divide-black text-slate-300 print:text-black">
                      {dossier.transaction_trail.map((t) => (
                        <tr key={t.hop_number} className="hover:bg-white/5">
                          <td className="p-2.5 font-bold text-amber-400 print:text-black">#{t.hop_number}</td>
                          <td className="p-2.5 font-mono">{t.from_account}</td>
                          <td className="p-2.5 font-bold text-white print:text-black">{t.to_holder_name}</td>
                          <td className="p-2.5">{t.bank_name} ({t.ifsc})</td>
                          <td className="p-2.5 text-right font-bold text-emerald-400 print:text-black">{formatINR(t.amount)}</td>
                          <td className="p-2.5 text-slate-400 print:text-gray-700 text-[10px]">{t.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Court-Admissible SHAP Feature Attributions */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 print:border-black">
                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider print:text-black">
                  AI Algorithmic Justification (SHAP Feature Attributions for Judicial Review)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px]">
                  {Object.entries(dossier.shap_attributions).map(([key, val]) => (
                    <div key={key} className="p-2 rounded bg-black/40 border border-white/5 print:border-gray-300 print:bg-gray-50">
                      <div className="text-[10px] text-slate-400 uppercase print:text-gray-700 truncate">{key.replace(/_/g, ' ')}</div>
                      <div className="text-white font-bold text-xs mt-0.5 print:text-black">
                        +{Number(val).toFixed(3)} SHAP
                      </div>
                    </div>
                  ))}
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside pt-2 print:text-black">
                  {dossier.legal_grounds.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>

              {/* Statutory Section 63 BSA / 65B IEA Electronic Evidence Certificate */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border-2 border-emerald-500/50 space-y-3 print:border-2 print:border-black print:bg-white">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2 print:border-black">
                  <div className="font-bold text-emerald-400 text-xs uppercase flex items-center gap-2 print:text-black">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-black" />
                    <span>Statutory Certificate under Section 63, Bharatiya Sakshya Adhiniyam, 2023</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 print:text-gray-700">
                    Ref: {dossier.certificate_65b.certificate_id}
                  </span>
                </div>

                <p className="text-[11px] text-slate-200 leading-relaxed font-sans italic print:text-black">
                  "{dossier.certificate_65b.legal_declaration}"
                </p>

                {/* Cryptographic SHA-256 Checksum */}
                <div className="p-2.5 rounded-lg bg-black/50 border border-emerald-500/30 space-y-1 print:border-black print:bg-gray-100">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 print:text-gray-700">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-cyan-400 print:text-black" />
                      Immutable Merkle Root SHA-256 Evidence Digest:
                    </span>
                    <button
                      onClick={handleCopyHash}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[10px] print:hidden"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? 'Hash Copied' : 'Copy Hash'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-cyan-300 break-all select-all font-bold print:text-black">
                    {dossier.certificate_65b.evidence_hash_sha256}
                  </div>
                </div>

                {/* Signature Block */}
                <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20 text-[11px] print:border-black">
                  <div>
                    <span className="text-slate-400 print:text-gray-700">System Device ID:</span>
                    <div className="font-bold text-white print:text-black">{dossier.certificate_65b.device_system_id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white text-xs print:text-black">{dossier.certificate_65b.certifying_officer}</div>
                    <div className="text-slate-400 text-[10px] print:text-gray-700">
                      {dossier.certificate_65b.officer_rank} • Badge: {dossier.certificate_65b.officer_badge_id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/70 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admissible in High Courts & District Sessions Courts of India</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-colors"
            >
              Close Dossier
            </button>
            <button
              onClick={handlePrint}
              disabled={isLoading || !dossier}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export Court PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
