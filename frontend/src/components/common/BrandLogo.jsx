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
            fill="#121216"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1.2"
          />

          {/* Interconnecting Neural Transaction Edges */}
          <path d="M14 15L20 22L26 15" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" strokeLinecap="round" />
          <path d="M20 22V30" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" strokeLinecap="round" />
          <path d="M14 15L20 11L26 15" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" />

          {/* Core Topology Nodes */}
          {/* Ingress Node */}
          <circle cx="20" cy="11" r="2" fill="#e4e4e7" />
          {/* Layering Intermediary Left */}
          <circle cx="14" cy="15" r="1.8" fill="#a1a1aa" />
          {/* Layering Intermediary Right */}
          <circle cx="26" cy="15" r="1.8" fill="#a1a1aa" />
          {/* Central Interdicted Mule Hub (Single Threat Accent) */}
          <circle cx="20" cy="22" r="2.8" fill="#e11d48" />
          <circle cx="20" cy="22" r="4.2" stroke="#e11d48" strokeWidth="0.6" strokeOpacity="0.4" />
          {/* Intercepted Fund / Cordon Terminal */}
          <circle cx="20" cy="30" r="2" fill="#71717a" />
        </svg>
      </div>

      {/* Brand Wordmark & Agency Scope */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-sans font-extrabold text-base tracking-tight text-white">
            RAKSHA<span className="text-zinc-400 font-semibold">NET</span>
          </span>
          <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 tracking-wide">
            I4C GRID
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-zinc-500 tracking-tight mt-0.5 font-sans">
            National Cyber Crime Interdiction
          </span>
        )}
      </div>
    </div>
  );
};
