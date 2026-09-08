import React from 'react';
import { ShieldAlert, FileText, CheckCircle, Scale, Copy, Check } from 'lucide-react';
import { ShapChart } from './ShapChart';

export const ExplainPanel = ({ explanation, fusedScore, graphScore, geoScore }) => {
  const [copied, setCopied] = React.useState(false);

  if (!explanation) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 font-mono">
        Select an alert to view AI explainability and court-admissible SHAP attribution factors.
      </div>
    );
  }

  const factors = explanation.shap_factors || [];
  const verdict = explanation.verdict || 'EVALUATION_PENDING';

  const copyLegalDossier = () => {
    const text = `RAKSHANET LAW ENFORCEMENT EVIDENCE DOSSIER
Account ID: ${explanation.account_id}
Holder: ${explanation.holder_name}
Verdict: ${verdict}
Fused Risk Score: ${(fusedScore * 100).toFixed(1)}% (Graph: ${(graphScore || 0).toFixed(3)}, Geo: ${(geoScore || 0).toFixed(3)})

KEY STATISTICAL ATTRIBUTIONS (SHAP FEATURE IMPACT):
${factors.map((f, i) => `${i + 1}. [${f.impact}] ${f.factor} — ${f.detail}`).join('\n')}

Cryptographically Prepared for Evidence Submission under Section 65B Indian Evidence Act.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Verdict & Fusion Math Header */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider">AI Classification Verdict</span>
          <span className="pill pill-critical font-bold text-[10px]">
            <ShieldAlert className="w-3 h-3" /> {verdict}
          </span>
        </div>

        {/* Fusion Equation Visual */}
        <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/30 text-blue-200 text-xs">
          <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-blue-300">
            <span>Score Fusion Formula:</span>
            <span className="text-white font-bold font-mono">0.60·Graph + 0.40·Geo</span>
          </div>
          <div className="flex items-center justify-between text-slate-300 text-[11px]">
            <span>= 0.60 × <strong className="text-blue-400">{(graphScore || 0).toFixed(3)}</strong> + 0.40 × <strong className="text-emerald-400">{(geoScore || 0).toFixed(3)}</strong></span>
            <span className="font-bold text-white text-sm">{(fusedScore * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* SHAP Feature Attribution Waterfall Chart */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-white flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            SHAP Feature Attribution (TreeExplainer)
          </h4>
          <span className="text-[10px] text-slate-400">Additive Factor Weights</span>
        </div>
        <ShapChart factors={factors} />
      </div>

      {/* Itemized Court-Admissible Factors */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-white flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Court-Admissible Evidence Narrative
          </h4>
          <button
            onClick={copyLegalDossier}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/10 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied Dossier' : 'Copy Evidence'}</span>
          </button>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {factors.map((f, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-900 border border-white/5 hover:border-white/15 transition-colors flex items-start gap-2"
            >
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[11px] shrink-0 border border-blue-500/30">
                {f.impact}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-200 text-xs truncate">{f.factor}</p>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
