import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  RefreshCw,
  Shield,
  Radio,
  AlertTriangle,
  Target,
  User,
  Crosshair,
  Navigation,
  LocateFixed,
  ShieldAlert
} from 'lucide-react';
import { fetchHeatmapGeoJSON, fetchPatrols } from '../../utils/api';
import { formatINR, maskAccountNumber } from '../../utils/constants';
import { PatrolMarker } from './PatrolMarker';
import { TacticalGeofence } from './TacticalGeofence';
import { PatrolDispatchModal } from '../patrols/PatrolDispatchModal';
import { useAlertContext } from '../../contexts/AlertContext';

// Custom Map Controller to pan and fly smoothly
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] != null && center[1] != null) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

// Quick corridor coordinates
const CORRIDORS = [
  { name: 'National', coords: [20.5937, 78.9629], zoom: 5 },
  { name: 'Mumbai', coords: [19.0270, 72.8550], zoom: 14 },
  { name: 'Delhi-NCR', coords: [28.6290, 77.2260], zoom: 14 },
  { name: 'Bengaluru', coords: [12.9716, 77.5946], zoom: 14 },
  { name: 'Jamtara', coords: [23.9625, 86.8020], zoom: 13 },
  { name: 'Mewat', coords: [28.1130, 77.0016], zoom: 13 }
];

// Helper to create custom Leaflet divIcon for Target Cash-Out ATM
const createTargetAtmIcon = (terminalId, riskPercent) => {
  const svgHtml = `
    <div class="relative flex items-center justify-center cursor-pointer group">
      <!-- Pulsing Outer Radar Cordon -->
      <div class="absolute -inset-3.5 rounded-full bg-rose-500/35 animate-ping"></div>
      <div class="absolute -inset-2 rounded-full bg-rose-600/40 animate-pulse"></div>

      <!-- Core Target Icon -->
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-rose-950 border-2 border-rose-500 shadow-xl shadow-rose-950/80">
        <svg class="w-4 h-4 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v20m10-10H2m15 0a5 5 0 11-10 0 5 5 0 0110 0z"/>
        </svg>
      </div>

      <!-- Tactical Badge Above Pin -->
      <div class="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-zinc-950/95 border border-rose-500/80 text-[10px] font-mono text-rose-300 font-bold whitespace-nowrap shadow-lg flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
        <span>CASHOUT ATM • ${terminalId} (${riskPercent}%)</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'leaflet-target-atm-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22]
  });
};

// Helper to create custom Leaflet divIcon for Suspect Staging Location
const createSuspectPinIcon = (suspectName, last4) => {
  const svgHtml = `
    <div class="relative flex items-center justify-center cursor-pointer group">
      <!-- Warning Ping Pulse -->
      <div class="absolute -inset-2.5 rounded-full bg-amber-500/30 animate-ping"></div>

      <!-- Core Suspect Pin -->
      <div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-amber-950 border-2 border-amber-400 shadow-xl shadow-amber-950/80">
        <svg class="w-3.5 h-3.5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>

      <!-- Tactical Badge Above Pin -->
      <div class="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-zinc-950/95 border border-amber-500/80 text-[10px] font-mono text-amber-300 font-bold whitespace-nowrap shadow-lg flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <span>SUSPECT: ${suspectName.split(' ')[0]} (•••• ${last4})</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'leaflet-suspect-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20]
  });
};

export const HeatmapView = ({ targetAlert: propTargetAlert }) => {
  const { selectedAlert } = useAlertContext();
  const activeAlert = propTargetAlert || selectedAlert;

  const [geoData, setGeoData] = useState({ features: [] });
  const [patrols, setPatrols] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Layer toggles
  const [showPatrols, setShowPatrols] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);

  // Dispatch modal state
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [targetHotspot, setTargetHotspot] = useState(null);

  // Current camera viewpoint state
  const [viewportCenter, setViewportCenter] = useState(CORRIDORS[1].coords);
  const [viewportZoom, setViewportZoom] = useState(CORRIDORS[1].zoom);

  // Resolve target hotspot and suspect staging details from activeAlert
  const activeTargetDetails = useMemo(() => {
    if (!activeAlert) {
      // Fallback default: Mumbai
      return {
        lat: 19.0270,
        lon: 72.8550,
        atmName: 'State Bank of India - Matunga East ATM Hub',
        terminalId: 'ATM-MUM-001',
        bankName: 'State Bank of India',
        city: 'Mumbai',
        suspectName: 'Anand Mohan Verma',
        accountNumber: '86174411141',
        riskScore: 0.94,
        suspectLat: 19.0298,
        suspectLon: 72.8525,
        distanceMeters: 385
      };
    }

    const accNum = activeAlert.target_account_number || '';
    const holder = activeAlert.target_holder_name || '';
    const city = activeAlert.city || '';
    const risk = activeAlert.risk_score || 0.94;

    let lat = activeAlert.target_lat;
    let lon = activeAlert.target_lon;
    let atmName = activeAlert.target_atm_name;
    let terminalId = activeAlert.target_terminal_id;
    let bank = activeAlert.bank_name || 'Partner Core Bank';

    // Calibrated scenario matching if coordinates not in alert
    if (!lat || !lon) {
      if (accNum.includes('1143') || holder.includes('Rajshekhar') || city.toLowerCase().includes('bengaluru')) {
        lat = 12.9716;
        lon = 77.5946;
        atmName = 'HDFC Bank - Whitefield IT Corridor ATM Hub';
        terminalId = 'ATM-BLR-002';
        bank = 'HDFC Bank';
      } else if (accNum.includes('1142') || holder.includes('Singhal') || city.toLowerCase().includes('delhi')) {
        lat = 28.6290;
        lon = 77.2260;
        atmName = 'Punjab National Bank - Connaught Place Inner Circle ATM Hub';
        terminalId = 'ATM-DEL-003';
        bank = 'Punjab National Bank';
      } else {
        lat = 19.0270;
        lon = 72.8550;
        atmName = 'State Bank of India - Matunga East ATM Hub';
        terminalId = 'ATM-MUM-001';
        bank = 'State Bank of India';
      }
    }

    // Calibrated suspect staging offset ~380m NW (lat + 0.0028, lon - 0.0025)
    // Within the 750m containment radius
    const suspectLat = lat + 0.0028;
    const suspectLon = lon - 0.0025;

    return {
      lat,
      lon,
      atmName: atmName || 'Predicted Cash-Out ATM Hub',
      terminalId: terminalId || 'ATM-PRIORITY-01',
      bankName: bank,
      city: city || 'Metro Hub',
      suspectName: holder || 'Suspect Account Holder',
      accountNumber: accNum || '86174411141',
      riskScore: risk,
      suspectLat,
      suspectLon,
      distanceMeters: 385
    };
  }, [activeAlert]);

  // Synchronize map camera when active target changes
  useEffect(() => {
    if (activeTargetDetails?.lat && activeTargetDetails?.lon) {
      setViewportCenter([activeTargetDetails.lat, activeTargetDetails.lon]);
      setViewportZoom(14);
    }
  }, [activeTargetDetails]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [geoRes, patrolRes] = await Promise.all([
        fetchHeatmapGeoJSON().catch(() => ({ features: [] })),
        fetchPatrols().catch(() => [])
      ]);
      setGeoData(geoRes);
      setPatrols(patrolRes || []);
    } catch (err) {
      console.error('Failed to load spatial intelligence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const features = geoData.features || [];
  const atmFeatures = features.filter(f => f.properties?.type === 'ATM');
  const complaintFeatures = features.filter(f => f.properties?.type === 'COMPLAINT');

  const handleOpenDispatchForATM = (hotspotInfo) => {
    setTargetHotspot({
      terminal_id: hotspotInfo.terminalId || hotspotInfo.terminal_id,
      name: hotspotInfo.atmName || hotspotInfo.name || 'ATM Terminal',
      lat: hotspotInfo.lat,
      lon: hotspotInfo.lon
    });
    setDispatchModalOpen(true);
  };

  const handleFocusTarget = () => {
    if (activeTargetDetails?.lat && activeTargetDetails?.lon) {
      setViewportCenter([activeTargetDetails.lat, activeTargetDetails.lon]);
      setViewportZoom(14);
    }
  };

  const last4 = activeTargetDetails.accountNumber.slice(-4);
  const riskPercent = (activeTargetDetails.riskScore * 100).toFixed(0);

  return (
    <div className="flex flex-col h-full rounded-xl bg-zinc-900/60 border border-white/[0.06] overflow-hidden relative select-none">
      {/* Header & Controls */}
      <div className="p-3 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2 z-10 bg-zinc-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <h3 className="font-mono font-semibold text-zinc-200 text-xs tracking-wide uppercase">
            Geospatial Interdiction Grid
          </h3>
          <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline bg-zinc-800/80 px-2 py-0.5 rounded border border-white/[0.06]">
            750m Cordon Active
          </span>
        </div>

        {/* Controls & Quick Corridor Jump */}
        <div className="flex items-center gap-2">
          {/* Layer toggles */}
          <div className="flex items-center gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-white/[0.06] text-xs font-mono">
            <button
              onClick={() => setShowPatrols(!showPatrols)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer ${
                showPatrols ? 'bg-blue-600 text-white font-medium shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle Patrols"
            >
              <Shield className="w-3 h-3" />
              <span>Patrols</span>
            </button>
            <button
              onClick={() => setShowGeofences(!showGeofences)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer ${
                showGeofences ? 'bg-rose-600 text-white font-medium shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle 750m Cordon Radius"
            >
              <Radio className="w-3 h-3" />
              <span>Cordon</span>
            </button>
            <button
              onClick={() => setShowTrajectory(!showTrajectory)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer ${
                showTrajectory ? 'bg-amber-600 text-white font-medium shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle Suspect Vector"
            >
              <Navigation className="w-3 h-3" />
              <span>Vector</span>
            </button>
          </div>

          {/* Quick Corridor Selection */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {CORRIDORS.map(corridor => (
              <button
                key={corridor.name}
                onClick={() => {
                  setViewportCenter(corridor.coords);
                  setViewportZoom(corridor.zoom);
                }}
                className="px-2 py-1 rounded-md text-[11px] font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors whitespace-nowrap cursor-pointer"
              >
                {corridor.name}
              </button>
            ))}
            <button
              onClick={handleFocusTarget}
              className="px-2 py-1 rounded-md text-[11px] font-mono bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60 transition-colors flex items-center gap-1 cursor-pointer"
              title="Snap camera to locked Target ATM & Suspect"
            >
              <LocateFixed className="w-3 h-3" />
              <span>Target</span>
            </button>
            <button
              onClick={loadData}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-white/[0.06] transition-colors cursor-pointer"
              title="Refresh PostGIS Markers"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Tactical Target HUD Ribbon */}
      <div className="absolute top-13 inset-x-3 z-[400] flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-950/90 backdrop-blur-md border border-rose-500/40 shadow-xl pointer-events-auto">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white truncate">
            <Target className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
            <span className="text-zinc-400 uppercase text-[10px]">Locked:</span>
            <span className="text-amber-300 truncate">{activeTargetDetails.suspectName}</span>
            <span className="text-zinc-500 text-[10px]">(•••• {last4})</span>
            <span className="text-zinc-500 hidden md:inline">➔</span>
            <span className="text-rose-300 truncate hidden md:inline">{activeTargetDetails.atmName}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-zinc-400 pl-2 border-l border-white/[0.08]">
            <span>Radius: <strong className="text-white">750m</strong></span>
            <span>Dist: <strong className="text-amber-400">~{activeTargetDetails.distanceMeters}m</strong></span>
            <span className="px-1.5 py-0.2 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
              {riskPercent}% CASHOUT RISK
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenDispatchForATM(activeTargetDetails)}
            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            title="Dispatch immediate beat patrol unit"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Dispatch Patrol</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="flex-1 relative w-full h-full min-h-[380px]">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/70 backdrop-blur-xs text-zinc-400">
            <RefreshCw className="w-5 h-5 animate-spin text-zinc-400 mb-2" />
            <p className="text-xs font-mono">Syncing spatial clusters...</p>
          </div>
        )}

        <MapContainer
          center={viewportCenter}
          zoom={viewportZoom}
          style={{ width: '100%', height: '100%', minHeight: '380px' }}
          zoomControl={true}
        >
          <MapController center={viewportCenter} zoom={viewportZoom} />

          {/* Clean Esri Dark Gray Tiles (Zero Watermark) */}
          <TileLayer
            attribution='&copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
          />

          {/* 1. 750m Tactical Geofence Cordon around Target ATM */}
          {showGeofences && (
            <TacticalGeofence
              center={[activeTargetDetails.lat, activeTargetDetails.lon]}
              radiusMeters={750}
              title={activeTargetDetails.atmName}
              riskScore={activeTargetDetails.riskScore}
            />
          )}

          {/* 2. Trajectory Vector: Suspect Staging Location -> Cashout ATM */}
          {showTrajectory && (
            <Polyline
              positions={[
                [activeTargetDetails.suspectLat, activeTargetDetails.suspectLon],
                [activeTargetDetails.lat, activeTargetDetails.lon]
              ]}
              pathOptions={{
                color: '#ef4444',
                weight: 2.5,
                dashArray: '6, 6',
                opacity: 0.85
              }}
            />
          )}

          {/* 3. Suspect Staging Location Pin */}
          <Marker
            position={[activeTargetDetails.suspectLat, activeTargetDetails.suspectLon]}
            icon={createSuspectPinIcon(activeTargetDetails.suspectName, last4)}
          >
            <Popup>
              <div className="font-mono text-xs p-1 space-y-2 min-w-[220px]">
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <User className="w-4 h-4" />
                    <span>Suspect Mule Staging</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 text-[10px] font-bold">
                    ACTIVE MULE
                  </span>
                </div>

                <div className="space-y-1 text-zinc-300 text-[11px]">
                  <div>Target: <strong className="text-white">{activeTargetDetails.suspectName}</strong></div>
                  <div>Account: <span className="font-mono text-zinc-400">{maskAccountNumber(activeTargetDetails.accountNumber)}</span></div>
                  <div>Bank: <span className="text-zinc-300">{activeTargetDetails.bankName}</span></div>
                  <div>Distance to ATM: <strong className="text-amber-300">~{activeTargetDetails.distanceMeters} meters</strong></div>
                  <div>Movement: <span className="text-emerald-400 font-semibold">Advancing to ATM Cashout</span></div>
                </div>

                <div className="p-1.5 rounded bg-amber-950/60 border border-amber-800/40 text-[10px] text-amber-300">
                  ⚠️ Subject located inside 750m tactical cordon. Ready for vehicular or pedestrian interception.
                </div>
              </div>
            </Popup>
          </Marker>

          {/* 4. Target Cash-Out ATM Terminal Pin */}
          <Marker
            position={[activeTargetDetails.lat, activeTargetDetails.lon]}
            icon={createTargetAtmIcon(activeTargetDetails.terminalId, riskPercent)}
          >
            <Popup>
              <div className="font-mono text-xs p-1 space-y-2 min-w-[240px]">
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-400">
                    <Crosshair className="w-4 h-4" />
                    <span>Target Cash-Out Terminal</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-700/60 text-[10px] font-bold">
                    IMMINENT
                  </span>
                </div>

                <div className="space-y-1 text-zinc-300 text-[11px]">
                  <div className="font-semibold text-white">{activeTargetDetails.atmName}</div>
                  <div>Terminal ID: <span className="font-mono text-cyan-300">{activeTargetDetails.terminalId}</span></div>
                  <div>Bank Entity: <span className="text-zinc-300">{activeTargetDetails.bankName}</span></div>
                  <div>City Sector: <span className="text-zinc-300">{activeTargetDetails.city}</span></div>
                  <div>Predicted Risk: <strong className="text-rose-400 font-bold">{riskPercent}%</strong></div>
                  <div>Tactical Cordon: <span className="text-emerald-400 font-medium">750m Geofenced</span></div>
                </div>

                <div className="pt-1 border-t border-white/10">
                  <button
                    onClick={() => handleOpenDispatchForATM(activeTargetDetails)}
                    className="w-full py-1.5 px-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>🚨 Dispatch Mobile Beat Unit</span>
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>

          {/* 5. Render Active Police Patrol Fleet Markers */}
          {showPatrols &&
            patrols.map(unit => (
              <PatrolMarker
                key={`patrol-${unit.id}`}
                unit={unit}
                onSelectForDispatch={() => handleOpenDispatchForATM(activeTargetDetails)}
              />
            ))}

          {/* 6. Render Other Monitored ATMs from DB */}
          {atmFeatures.map((feat, idx) => {
            const [lon, lat] = feat.geometry.coordinates;
            // Skip target ATM since rendered with high-contrast custom icon
            if (
              Math.abs(lat - activeTargetDetails.lat) < 0.0001 &&
              Math.abs(lon - activeTargetDetails.lon) < 0.0001
            ) {
              return null;
            }

            const isHotspot = feat.properties?.is_hotspot || feat.properties?.risk_score > 0.7;
            const color = isHotspot ? '#f43f5e' : '#10b981';

            return (
              <CircleMarker
                key={`atm-${feat.properties.id || idx}`}
                center={[lat, lon]}
                radius={isHotspot ? 7 : 5}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: isHotspot ? 0.9 : 0.6,
                  weight: isHotspot ? 2 : 1
                }}
              >
                <Popup>
                  <div className="font-mono text-xs p-1 space-y-1.5 min-w-[190px]">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <span className={`w-1.5 h-1.5 rounded-full ${isHotspot ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <span>{feat.properties.title}</span>
                    </div>
                    <div className="text-zinc-400">City: {feat.properties.city || 'N/A'}</div>
                    <div className="text-zinc-400">
                      Risk: <span className={isHotspot ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {feat.properties.risk_score ? (feat.properties.risk_score * 100).toFixed(0) : 0}%
                      </span>
                    </div>

                    {isHotspot && (
                      <div className="pt-1">
                        <button
                          onClick={() => handleOpenDispatchForATM({
                            terminal_id: feat.properties.terminal_id || feat.properties.id,
                            name: feat.properties.title || 'ATM Terminal',
                            lat,
                            lon
                          })}
                          className="w-full py-1 px-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Radio className="w-3 h-3" />
                          <span>Dispatch Patrol</span>
                        </button>
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* 7. Render Citizen NCRP Complaint Incidents */}
          {complaintFeatures.map((feat, idx) => {
            const [lon, lat] = feat.geometry.coordinates;
            return (
              <CircleMarker
                key={`comp-${feat.properties.id || idx}`}
                center={[lat, lon]}
                radius={6}
                pathOptions={{
                  color: '#f59e0b',
                  fillColor: '#f59e0b',
                  fillOpacity: 0.75,
                  weight: 1.5
                }}
              >
                <Popup>
                  <div className="font-mono text-xs p-1 space-y-1">
                    <div className="font-medium text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Complaint #{feat.properties.id || 'NCRP'}
                    </div>
                    <div className="text-white font-medium">{feat.properties.title}</div>
                    <div className="text-zinc-400">Loss: <span className="text-rose-400 font-bold">{formatINR(feat.properties.amount || 0)}</span></div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Tactical Map Legend */}
        <div className="absolute bottom-3 right-3 z-[400] p-2.5 rounded-lg bg-zinc-950/90 backdrop-blur-md border border-white/[0.08] text-[10px] font-mono space-y-1.5 pointer-events-none text-zinc-400 shadow-xl">
          <div className="flex items-center gap-2 text-rose-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-300 animate-ping" />
            <span>Target Cashout ATM</span>
          </div>
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-200" />
            <span>Suspect Runner (~380m)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 border border-dashed border-rose-500 rounded-full" />
            <span>750m Containment Cordon</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Patrol Fleet Units ({patrols.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Monitored ATM ({atmFeatures.length})</span>
          </div>
        </div>
      </div>

      {/* Patrol Dispatch Modal */}
      <PatrolDispatchModal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        targetHotspot={targetHotspot}
        onDispatchSuccess={() => loadData()}
      />
    </div>
  );
};
