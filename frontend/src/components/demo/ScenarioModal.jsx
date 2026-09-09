import React, { useState, useEffect } from 'react';
import {
  Zap,
  X,
  ShieldAlert,
  MapPin,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle2,
  Cpu,
  AlertTriangle,
  Flame,
  Radio
} from 'lucide-react';
import { useAlertContext } from '../../contexts/AlertContext';
import { tacticalAudio } from '../../utils/audio';

export const ScenarioModal = ({ isOpen, onClose }) => {
  const { demoScenarios, fetchScenarios, simulateAttack, setSelectedAlert, refreshData } = useAlertContext();
  const [selectedScenarioId, setSelectedScenarioId] = useState('mumbai_upi_qr');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationResult, setSimulationResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && (!demoScenarios || demoScenarios.length === 0)) {
      fetchScenarios();
    }
  }, [isOpen, demoScenarios, fetchScenarios]);

  if (!isOpen) return null;

  const activeScenario = demoScenarios?.find(s => s.id === selectedScenarioId) || demoScenarios?.[0];

  const steps = [
    { title: 'NCRP Complaint Ingestion', desc: 'Validating citizen report & KYC details' },
    { title: 'Neo4j Multi-Hop Layering', desc: 'Synthesizing transfer chains & bridge mules' },
    { title: 'Dual-AI Risk Evaluation', desc: 'Running GraphSAGE link prediction & PostGIS clustering' },
    { title: 'Command Center Broadcast', desc: 'Dispatching WebSocket threat alert & lien advisory' }
  ];

  const handleInject = async () => {
    if (!activeScenario) return;
    setIsSimulating(true);
    setError(null);
    setSimulationResult(null);
    setCurrentStep(1);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 350);

    try {
      const result = await simulateAttack(activeScenario.id);
      clearInterval(stepInterval);
      setCurrentStep(4);
      setSimulationResult(result);
      tacticalAudio.playTacticalAlert();

      // Refresh data
      await refreshData();

      // Auto-focus if alert returned
      if (result.suspect_alert?.alert_id) {
        setSelectedAlert(result.suspect_alert);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.response?.data?.detail || err.message || 'Simulation failed');
      setIsSimulating(false);
      setCurrentStep(0);
    }
  };

  const handleFinishAndInspect = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-display">Live Incident Simulation Engine</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SIH JUDGE BENCHMARK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inject calibrated cybercrime attacks to demonstrate real-time topological interdiction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSimulating && currentStep < 4}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Scenario Selector Tabs */}
          <div>
            <label className="text-xs font-mono font-semibold uppercase text-slate-400 mb-2 block">
              Select Attack Topology Scenario:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(demoScenarios || []).map(scen => {
                const isSelected = scen.id === selectedScenarioId;
                return (
                  <button
                    key={scen.id}
                    onClick={() => {
                      if (!isSimulating) {
                        setSelectedScenarioId(scen.id);
                        setSimulationResult(null);
                        setCurrentStep(0);
                      }
                    }}
                    disabled={isSimulating}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                        : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20'
                    } ${isSimulating ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-blue-300">
                          {scen.city}
                        </span>
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          ₹{scen.loss_amount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs font-bold line-clamp-1 text-slate-200">{scen.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">{scen.category}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Scenario Details Card */}
          {activeScenario && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    {activeScenario.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeScenario.scam_type}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-400 block">Reported Loss</span>
                  <span className="text-base font-extrabold text-amber-400 font-mono">
                    ₹{activeScenario.loss_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-white/5">
                {activeScenario.narrative}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] font-mono pt-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Target Zone: {activeScenario.target_atm_cluster}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Suspect Bank: {activeScenario.suspect_bank}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Golden Window: &lt; 45 Mins</span>
                </div>
              </div>
            </div>
          )}

          {/* Real-Time Injection Telemetry Pipeline Progress */}
          {isSimulating && (
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                  EXECUTION PIPELINE TELEMETRY
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {currentStep < 4 ? 'Processing Real-Time Steps...' : 'Execution Completed'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {steps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isDone = currentStep > stepNum || (currentStep === 4 && stepNum === 4);
                  const isCurrent = currentStep === stepNum && currentStep < 4;

                  return (
                    <div
                      key={step.title}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        isDone
                          ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300'
                          : isCurrent
                          ? 'bg-blue-950/60 border-blue-500 text-blue-200 ring-1 ring-blue-500/50'
                          : 'bg-slate-900/30 border-white/5 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <Cpu className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono text-slate-500">
                            {stepNum}
                          </span>
                        )}
                        <span className="text-[11px] font-bold truncate">{step.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {simulationResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold">Attack Injected & Flagged in {simulationResult.elapsed_ms}ms!</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-900 text-emerald-300">
                  ACK #{simulationResult.complaint?.acknowledgement_no}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono pt-1 text-slate-300">
                <div className="bg-slate-950/50 p-2 rounded">
                  <span className="text-slate-500 block text-[10px]">Scored Accounts</span>
                  <span className="font-bold text-white">{simulationResult.ai_scoring_summary?.total_scored}</span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded">
                  <span className="text-slate-500 block text-[10px]">Critical Alerts</span>
                  <span className="font-bold text-rose-400">{simulationResult.ai_scoring_summary?.critical_count}</span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded">
                  <span className="text-slate-500 block text-[10px]">Target Suspect</span>
                  <span className="font-bold text-white truncate block">{simulationResult.suspect_alert?.target_holder_name}</span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded">
                  <span className="text-slate-500 block text-[10px]">Composite Risk</span>
                  <span className="font-bold text-amber-400">
                    {simulationResult.suspect_alert?.risk_score
                      ? `${(simulationResult.suspect_alert.risk_score * 100).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-900/50 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-mono">
            Requires Law Enforcement Clearance Token
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSimulating && currentStep < 4}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Close
            </button>

            {simulationResult ? (
              <button
                onClick={handleFinishAndInspect}
                className="btn-primary text-xs py-2 px-5 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20"
              >
                <span>Inspect Target Case in Drawer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleInject}
                disabled={isSimulating}
                className="btn-primary text-xs py-2 px-5 flex items-center gap-2 bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 hover:from-amber-500 hover:to-red-500 shadow-lg shadow-rose-600/30 text-white font-bold"
              >
                {isSimulating ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Injecting Attack & Scoring Network...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Inject Incident into Live Network</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
