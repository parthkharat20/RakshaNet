import React from 'react';

export const BrandLogo = ({ size = 'default', showSubtitle = true }) => {
  const isSmall = size === 'small';

  return (
    <div className="flex items-center gap-2.5 group">
      {/* Bespoke Geometric Shield & Graph Node Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${isSmall ? 'w-8 h-8' : 'w-9 h-9'}`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Subtle Outer Shield Geometry */}
          <path
            d="M20 3L34 8V18C34 27.5 28 34.5 20 37C12 34.5 6 27.5 6 18V8L20 3Z"
            fill="#0f172a"
            stroke="url(#shield_border_grad)"
            strokeWidth="1.4"
          />

          {/* Interconnecting Neural Transaction Edges */}
          <path d="M14 15L20 22L26 15" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="1" strokeLinecap="round" />
          <path d="M20 22V30" stroke="rgba(16, 185, 129, 0.45)" strokeWidth="1" strokeLinecap="round" />
          <path d="M14 15L20 11L26 15" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" />

          {/* Core Topology Nodes with Semantic Colors */}
          {/* Ingress Victim Node (Cyan Blue) */}
          <circle cx="20" cy="11" r="2.2" fill="#38bdf8" />
          {/* Layering Intermediary Left (Amber) */}
          <circle cx="14" cy="15" r="2" fill="#fbbf24" />
          {/* Layering Intermediary Right (Amber) */}
          <circle cx="26" cy="15" r="2" fill="#fbbf24" />
          {/* Central Interdicted Mule Hub (Crimson) */}
          <circle cx="20" cy="22" r="3" fill="#ef4444" />
          <circle cx="20" cy="22" r="4.5" stroke="#ef4444" strokeWidth="0.8" strokeOpacity="0.5" />
          {/* Intercepted Fund Terminal (Emerald) */}
          <circle cx="20" cy="30" r="2.2" fill="#10b981" />

          <defs>
            <linearGradient id="shield_border_grad" x1="6" y1="3" x2="34" y2="37" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" stopOpacity="0.7" />
              <stop offset="0.5" stopColor="#334155" />
              <stop offset="1" stopColor="#10b981" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Wordmark & Agency Scope */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-sans font-extrabold text-base tracking-tight text-white">
            RAKSHA<span className="text-blue-500 font-black">NET</span>
          </span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/25 tracking-wide">
            I4C GRID
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-zinc-400 tracking-tight mt-0.5 font-sans">
            National Cyber Crime Interdiction
          </span>
        )}
      </div>
    </div>
  );
};
