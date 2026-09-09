import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Shield, Radio, Navigation, Clock, UserCheck, AlertOctagon } from 'lucide-react';

/**
 * Custom SVG DivIcon for LEA Patrol Units with dynamic status styling.
 */
const createPatrolIcon = (unit) => {
  const isDispatched = unit.status === 'DISPATCHED_INTERDICTION';
  const isMotorcycle = unit.unit_type === 'MOTORCYCLE_MARSHAL';
  const isInterceptor = unit.unit_type === 'INTERCEPTOR_MOBILE';

  const badgeColor = isDispatched ? '#EF4444' : '#3B82F6';
  const pulseClass = isDispatched ? 'patrol-pulse-dispatched' : 'patrol-pulse-active';

  const svgIcon = `
    <div class="relative flex items-center justify-center cursor-pointer group">
      <div class="absolute -inset-2 rounded-full ${isDispatched ? 'bg-red-500/30 animate-ping' : 'bg-blue-500/20'}"></div>
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg"
           style="background: #0f172a; border-color: ${badgeColor}; box-shadow: 0 0 12px ${badgeColor}88;">
        ${
          isDispatched
            ? `<svg class="w-4 h-4 text-red-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
               </svg>`
            : isMotorcycle
            ? `<svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
               </svg>`
            : `<svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
               </svg>`
        }
      </div>
      <div class="absolute -bottom-5 px-1.5 py-0.5 rounded bg-slate-900/90 border border-white/20 text-[9px] font-mono text-white font-bold whitespace-nowrap shadow">
        ${unit.callsign.split('-').slice(-2).join('-')}
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'leaflet-patrol-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
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
