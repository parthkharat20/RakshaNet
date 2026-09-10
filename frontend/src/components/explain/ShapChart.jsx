import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const ShapChart = ({ factors = [] }) => {
  if (!factors || factors.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 font-mono">
        No SHAP factor attribution data available.
      </div>
    );
  }

  // Parse impact float values
  const data = factors.map(f => {
    const rawVal = parseFloat(f.impact);
    return {
      factor: f.factor,
      impact: isNaN(rawVal) ? 0 : rawVal,
      detail: f.detail
    };
  });

  return (
    <div className="w-full h-44 font-mono text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <XAxis
            type="number"
            domain={[-0.1, 0.4]}
            tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(2)}`}
            stroke="#64748b"
            fontSize={10}
          />
          <YAxis
            type="category"
            dataKey="factor"
            width={160}
            stroke="#94a3b8"
            fontSize={10}
            tickFormatter={(v) => (v && typeof v === 'string' && v.length > 22) ? v.slice(0, 22) + '...' : (v || '')}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-white/20 shadow-xl text-xs font-mono max-w-xs">
                    <p className="font-bold text-white">{item.factor}</p>
                    <p className="text-blue-400 font-semibold my-0.5">Impact: {item.impact > 0 ? '+' : ''}{item.impact.toFixed(3)}</p>
                    <p className="text-slate-300 text-[11px]">{item.detail}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.impact > 0 ? '#3B82F6' : '#10B981'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
