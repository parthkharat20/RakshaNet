import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Shield, Radio, Navigation, Clock, UserCheck, AlertOctagon } from 'lucide-react';

/**
 * Custom SVG DivIcon for LEA Patrol Units with dynamic status styling.
 */
const createPatrolIcon = (unit) => {
  const isDispatched = unit.status === 'DISPATCHED_INTERDICTION';

  const badgeBorder = isDispatched ? '#e11d48' : 'rgba(255, 255, 255, 0.3)';
  const badgeBg = isDispatched ? '#18181b' : '#18181b';

  const svgIcon = `
    <div class="relative flex items-center justify-center cursor-pointer group">
      ${isDispatched ? '<div class="absolute -inset-1.5 rounded-full bg-rose-500/25 animate-ping"></div>' : ''}
      <div class="relative flex items-center justify-center w-7 h-7 rounded-full border shadow-sm"
           style="background: ${badgeBg}; border-color: ${badgeBorder};">
        <svg class="w-3.5 h-3.5 ${isDispatched ? 'text-rose-400 animate-spin' : 'text-zinc-300'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      </div>
      <div class="absolute -bottom-4 px-1.5 py-0.2 rounded bg-zinc-950/95 border border-white/10 text-[9px] font-mono text-zinc-300 font-medium whitespace-nowrap shadow-xs">
        ${unit.callsign.split('-').slice(-2).join('-')}
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'leaflet-patrol-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

export const PatrolMarker = ({ unit, onSelectForDispatch }) => {
  if (!unit || unit.lat == null || unit.lon == null) return null;

  const isDispatched = unit.status === 'DISPATCHED_INTERDICTION';

  return (
    <Marker position={[unit.lat, unit.lon]} icon={createPatrolIcon(unit)}>
      <Popup>
        <div className="font-mono text-xs p-1 space-y-2 min-w-[220px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Shield className={`w-4 h-4 ${isDispatched ? 'text-red-400' : 'text-blue-400'}`} />
              <span className="font-bold text-white text-sm">{unit.callsign}</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isDispatched
                  ? 'bg-red-950/80 text-red-300 border border-red-700/60 animate-pulse'
                  : 'bg-blue-950/80 text-blue-300 border border-blue-700/60'
              }`}
            >
              {unit.status.replace('_', ' ')}
            </span>
          </div>

          {/* Unit Details */}
          <div className="space-y-1 text-slate-300 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-400" /> Officer:
              </span>
              <strong className="text-white">{unit.officer_in_charge}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Badge ID:</span>
              <span className="font-mono text-cyan-300">{unit.badge_id || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-slate-400" /> Speed:
              </span>
              <span className="text-emerald-400 font-bold">{unit.current_speed_kmh} km/h</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Radio className="w-3 h-3 text-slate-400" /> Channel:
              </span>
              <span className="text-slate-300 text-[10px]">{unit.contact_channel}</span>
            </div>

            <div className="pt-1 border-t border-white/10 text-[10px] text-slate-400">
              <span className="font-semibold text-slate-300">Sector:</span> {unit.jurisdiction} ({unit.city})
            </div>
          </div>

          {/* Quick Action Button */}
          {onSelectForDispatch && (
            <button
              onClick={() => onSelectForDispatch(unit)}
              className={`w-full mt-2 py-1.5 px-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                isDispatched
                  ? 'bg-amber-600/80 hover:bg-amber-600 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              {isDispatched ? 'Reassign Patrol Flash' : '🚨 Dispatch Unit to Hotspot'}
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
};
