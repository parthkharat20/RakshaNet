import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export const ShapChart = ({ factors = [] }) => {
  if (!factors || factors.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-zinc-500 font-mono">
        No SHAP factor attribution data available.
      </div>
    );
  }

  // Parse impact float values and normalize
  const parsedFactors = factors.map(f => {
    let rawVal = parseFloat(f.impact);
    if (isNaN(rawVal)) {
      rawVal = 0;
    }
    const cleanFactor = (f.factor || 'Factor')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      factor: cleanFactor,
      impact: rawVal,
      detail: f.detail,
      isPositive: rawVal >= 0
    };
  });

  const maxAbsImpact = Math.max(...parsedFactors.map(f => Math.abs(f.impact)), 0.4);

  return (
    <div className="space-y-3 select-none">
      {/* Attribution Factors List with Precision Deviation Bars */}
      <div className="space-y-2.5">
        {parsedFactors.map((item, idx) => {
          const impactPercent = Math.min(Math.round((Math.abs(item.impact) / maxAbsImpact) * 100), 100);
          const formattedImpact = `${item.impact > 0 ? '+' : ''}${item.impact.toFixed(2)}`;

          return (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-zinc-950/60 border border-white/[0.05] hover:border-white/[0.1] transition-all space-y-1.5"
            >
              {/* Factor Title + Exact Numerical Impact */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {item.isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span className="text-xs font-medium text-zinc-200 truncate">
                    {item.factor}
                  </span>
                </div>

                <span
                  className={`font-mono font-bold text-xs px-1.5 py-0.2 rounded shrink-0 ${
                    item.isPositive
                      ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  }`}
                >
                  {formattedImpact}
                </span>
              </div>

              {/* Visual Deviation Bar */}
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-zinc-800/80 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.isPositive
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${impactPercent}%` }}
                  />
                </div>
              </div>

              {/* Forensic Context Detail */}
              {item.detail && (
                <p className="text-[11px] text-zinc-400 leading-snug pt-0.5">
                  {item.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Model Baseline Reference */}
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-zinc-950/40 border border-white/[0.04] text-[10px] text-zinc-500">
        <span>Baseline Prior: <strong className="text-zinc-400 font-mono">0.05</strong></span>
        <span>Algorithm: <strong className="text-zinc-300 font-mono">TreeExplainer (XGBoost)</strong></span>
      </div>
    </div>
  );
};

