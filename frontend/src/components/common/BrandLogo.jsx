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
          className="w-full h-full drop-shadow-sm"
        >
          {/* Subtle Outer Shield Geometry */}
          <path
            d="M20 3L34 8V18C34 27.5 28 34.5 20 37C12 34.5 6 27.5 6 18V8L20 3Z"
            fill="#0F172A"
            stroke="url(#shield_border_grad)"
            strokeWidth="1.5"
          />

          {/* Interconnecting Neural Transaction Edges */}
          <path d="M14 15L20 22L26 15" stroke="rgba(96, 165, 250, 0.4)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M20 22V30" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M14 15L20 11L26 15" stroke="rgba(96, 165, 250, 0.3)" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" />

          {/* Core Topology Nodes */}
          {/* Victim / Ingress Node */}
          <circle cx="20" cy="11" r="2.2" fill="#3B82F6" />
          {/* Layering Intermediary Left */}
          <circle cx="14" cy="15" r="2" fill="#60A5FA" />
          {/* Layering Intermediary Right */}
          <circle cx="26" cy="15" r="2" fill="#60A5FA" />
          {/* Central Interdicted Mule Hub */}
          <circle cx="20" cy="22" r="3" fill="#EF4444" />
          <circle cx="20" cy="22" r="4.5" stroke="#EF4444" strokeWidth="0.8" strokeOpacity="0.6" />
          {/* Intercepted Fund / Cordon Terminal */}
          <circle cx="20" cy="30" r="2.2" fill="#10B981" />

          <defs>
            <linearGradient id="shield_border_grad" x1="6" y1="3" x2="34" y2="37" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" stopOpacity="0.8" />
              <stop offset="0.5" stopColor="#1E293B" />
              <stop offset="1" stopColor="#10B981" stopOpacity="0.7" />
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
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-wide">
            I4C GRID
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-mono text-zinc-400 tracking-tight mt-0.5">
            National Cyber Crime Interdiction
          </span>
        )}
      </div>
    </div>
  );
};
