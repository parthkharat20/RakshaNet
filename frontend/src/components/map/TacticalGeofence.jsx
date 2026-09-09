import React from 'react';
import { Circle, CircleMarker, Popup } from 'react-leaflet';
import { ShieldAlert, Radio } from 'lucide-react';

/**
 * Tactical Geofence Layer (750m containment perimeter)
 * Rendered around predicted cash-out ATM hotspots during active threat window.
 */
export const TacticalGeofence = ({ center, radiusMeters = 750, title, riskScore }) => {
  if (!center || center[0] == null || center[1] == null) return null;

  return (
    <>
      {/* Outer Tactical Containment Ring (750m) */}
      <Circle
        center={center}
        radius={radiusMeters}
        pathOptions={{
          color: '#EF4444',
          weight: 2,
          opacity: 0.85,
          dashArray: '6, 8',
          fillColor: '#EF4444',
          fillOpacity: 0.08
        }}
      >
        <Popup>
          <div className="font-mono text-xs p-1 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span>750m Tactical Interdiction Cordon</span>
            </div>
            <div className="text-white font-semibold">{title || 'High-Risk ATM Terminal'}</div>
            <div className="text-slate-300">Containment Radius: <strong className="text-white">{radiusMeters}m</strong></div>
            <div className="text-slate-400">
              Objective: Intercept mule cash-out runner before ATM departure.
            </div>
            <div className="text-[10px] text-red-400 bg-red-950/60 p-1 rounded border border-red-800/40">
              ⚠️ LEA BEAT UNITS ALERTED • IMMEDIATE VEHICULAR INTERDICTION
            </div>
          </div>
        </Popup>
      </Circle>

      {/* Inner Inner Critical Impact Zone (200m) */}
      <Circle
        center={center}
        radius={200}
        pathOptions={{
          color: '#F87171',
          weight: 1,
          opacity: 0.6,
          fillColor: '#EF4444',
          fillOpacity: 0.15
        }}
      />
    </>
  );
};
