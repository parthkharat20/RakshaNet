import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  User,
  Scale,
  Printer,
  X,
  Loader2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { trackVictimComplaintApi } from '../../utils/api';
import { formatINR } from '../../utils/constants';

export const VictimTrackModal = ({ isOpen, onClose, initialAckNo = 'NCRP-2026-MUM-8921' }) => {
  const [ackNo, setAckNo] = useState(initialAckNo);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (queryNo) => {
    const target = (queryNo || ackNo || '').trim();
    if (!target) return;
    try {
      setLoading(true);
      setError('');
      const res = await trackVictimComplaintApi(target);
      setData(res);
    } catch (err) {
      console.error('Failed to track victim complaint:', err);
      setError(err.response?.data?.detail || 'Complaint acknowledgement number not found in national registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleSearch(initialAckNo);
    }
  }, [isOpen, initialAckNo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-950 border border-emerald-500/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  Citizen Cyber Fraud Recovery Portal
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                  NCRP / CFCFRMS TRANSPARENCY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Real-Time Tracking of Defrauded Funds from Interdiction to Magisterial Restitution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Print Restitution Status Report"
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

        {/* Search & Quick Chips Bar */}
        <div className="p-4 border-b border-white/10 bg-slate-900/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex-1 relative flex items-center"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={ackNo}
              onChange={(e) => setAckNo(e.target.value)}
              placeholder="Enter 14-digit NCRP Acknowledgement Number (e.g. NCRP-2026-MUM-8921)"
              className="w-full pl-9 pr-24 py-2 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Track'}
            </button>
          </form>

          {/* Quick Demo Chips */}
          <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono">
            <span className="text-slate-500 hidden md:inline">Quick Ref:</span>
            <button
              type="button"
              onClick={() => {
                setAckNo('NCRP-2026-MUM-8921');
                handleSearch('NCRP-2026-MUM-8921');
              }}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/30 transition-colors text-[10px]"
            >
              MUM-8921
            </button>
            <button
              type="button"
              onClick={() => {
                setAckNo('NCRP-2026-DEL-1044');
                handleSearch('NCRP-2026-DEL-1044');
              }}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/30 transition-colors text-[10px]"
            >
              DEL-1044
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p>Fetching encrypted NCRP restitution telemetry...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold">Tracking Notice</p>
                <p className="text-[11px] text-amber-400/90 mt-0.5">{error}</p>
              </div>
            </div>
          ) : data && (
            <>
              {/* Citizen & Recovery Highlights Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/40 border border-white/10 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">Complainant / Defrauded Citizen</span>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      {data.citizen_name} ({data.city})
                    </h4>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">NCRP Acknowledgement</span>
                    <p className="text-emerald-400 font-bold text-xs mt-0.5">{data.acknowledgement_no}</p>
                  </div>
                </div>

                {/* Amount Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-1">Reported Financial Loss</span>
                    <span className="text-base font-bold text-white">
                      {formatINR(data.loss_amount)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-300 block mb-1">Funds Secured Under Lien</span>
                    <span className="text-base font-bold text-emerald-400">
                      {formatINR(data.secured_amount)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40">
                    <span className="text-[10px] text-cyan-300 block mb-1">Recovery Rate</span>
                    <span className="text-base font-bold text-cyan-300">
                      {data.recovery_rate_pct}%
                    </span>
                  </div>
                </div>

                {/* Recovery Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-slate-400">Interdiction & Restitution Progress</span>
                    <span className="text-emerald-400 font-bold">Stage {data.current_stage} of 4</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${(data.current_stage / 4) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4-Stage Transparent Timeline */}
              <div className="space-y-3">
                <h5 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Restitution Lifecycle & Audit Milestone Timeline
                </h5>

                <div className="space-y-3">
                  {data.timeline?.map((item) => {
                    const isPassed = item.completed;
                    const isCurrent = !isPassed && item.stage === data.current_stage;

                    return (
                      <div
                        key={item.stage}
                        className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                          isPassed
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                            : isCurrent
                            ? 'bg-cyan-950/30 border-cyan-500/50 text-white shadow-md'
                            : 'bg-slate-900/30 border-white/5 text-slate-500'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          isPassed
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isCurrent
                            ? 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                            : 'bg-slate-800 text-slate-600'
                        }`}>
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h6 className="font-bold text-xs text-white">
                              Stage {item.stage}: {item.title}
                            </h6>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legal Note & Reference Identifiers */}
              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Scale className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs">Section 457 Cr.P.C. / Section 503 BNSS Legal Protection</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Under statutory procedural guidelines, cyber fraud victims are entitled to Magisterial restitution of lien-secured balances without requiring in-person station visits. The public prosecutor coordinates with the Chief Metropolitan Magistrate to release the fund debit order directly to the beneficiary banking node.
                </p>
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-4 text-[11px]">
                  <span>CFCFRMS Lien Ref: <strong className="text-white">{data.cfcfrms_lien_reference}</strong></span>
                  {data.court_order_number && (
                    <span>Court Order No: <strong className="text-emerald-300">{data.court_order_number}</strong></span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
