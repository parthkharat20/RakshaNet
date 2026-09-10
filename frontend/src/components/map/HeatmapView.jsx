import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { MapPin, RefreshCw, Shield, Radio, AlertTriangle } from 'lucide-react';
import { fetchHeatmapGeoJSON, fetchPatrols } from '../../utils/api';
import { formatINR } from '../../utils/constants';
import { PatrolMarker } from './PatrolMarker';
import { TacticalGeofence } from './TacticalGeofence';
import { PatrolDispatchModal } from '../patrols/PatrolDispatchModal';

// Custom Map Controller to pan smoothly
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

// Quick corridor coordinates
const CORRIDORS = [
  { name: 'National', coords: [20.5937, 78.9629], zoom: 5 },
  { name: 'Mumbai', coords: [19.0760, 72.8777], zoom: 12 },
  { name: 'Delhi-NCR', coords: [28.6139, 77.2090], zoom: 11 },
  { name: 'Jamtara', coords: [23.9625, 86.8020], zoom: 11 },
  { name: 'Mewat', coords: [28.1130, 77.0016], zoom: 11 },
  { name: 'Bengaluru', coords: [12.9716, 77.5946], zoom: 12 }
];

export const HeatmapView = () => {
  const [geoData, setGeoData] = useState({ features: [] });
  const [patrols, setPatrols] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCorridor, setSelectedCorridor] = useState(CORRIDORS[0]);

  // Layer toggles
  const [showPatrols, setShowPatrols] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);

  // Dispatch modal state
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [targetHotspot, setTargetHotspot] = useState(null);

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
  const hotspotATMs = atmFeatures.filter(f => f.properties?.is_hotspot || f.properties?.risk_score > 0.7);

  const handleOpenDispatchForATM = (feat) => {
    const [lon, lat] = feat.geometry.coordinates;
    setTargetHotspot({
      terminal_id: feat.properties.terminal_id || feat.properties.id,
      name: feat.properties.title || 'ATM Terminal',
      lat: lat,
      lon: lon
    });
    setDispatchModalOpen(true);
  };

  const handlePatrolSelectForDispatch = () => {
    if (hotspotATMs.length > 0) {
      handleOpenDispatchForATM(hotspotATMs[0]);
    } else if (atmFeatures.length > 0) {
      handleOpenDispatchForATM(atmFeatures[0]);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl bg-zinc-900/60 border border-white/[0.06] overflow-hidden relative select-none">
      {/* Header & Controls */}
      <div className="p-3 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2 z-10 bg-zinc-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
          <h3 className="font-mono font-semibold text-zinc-200 text-xs tracking-wide uppercase">
            Geospatial Grid
          </h3>
          <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
            {atmFeatures.length} ATMs • {patrols.length} Patrols
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Layer toggles - Clean Monochrome Switches */}
          <div className="flex items-center gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-white/[0.06] text-xs font-mono">
            <button
              onClick={() => setShowPatrols(!showPatrols)}
              className={`px-2.5 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer ${
                showPatrols ? 'bg-zinc-700 text-white font-medium shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle Patrols"
            >
              <Shield className="w-3 h-3 text-zinc-300" />
              <span>Patrols</span>
            </button>
            <button
              onClick={() => setShowGeofences(!showGeofences)}
              className={`px-2.5 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer ${
                showGeofences ? 'bg-zinc-700 text-white font-medium shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle Cordon"
            >
              <Radio className="w-3 h-3 text-zinc-300" />
              <span>Cordon</span>
            </button>
          </div>

          {/* Corridor quick jump */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {CORRIDORS.map(corridor => (
              <button
                key={corridor.name}
                onClick={() => setSelectedCorridor(corridor)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCorridor.name === corridor.name
                    ? 'bg-zinc-800 text-white border border-white/10 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                {corridor.name}
              </button>
            ))}
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

      {/* Leaflet Map Canvas */}
      <div className="flex-1 relative w-full h-full min-h-[380px]">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/70 backdrop-blur-xs text-zinc-400">
            <RefreshCw className="w-5 h-5 animate-spin text-zinc-400 mb-2" />
            <p className="text-xs font-mono">Syncing spatial clusters...</p>
          </div>
        )}

        <MapContainer
          center={selectedCorridor.coords}
          zoom={selectedCorridor.zoom}
          style={{ width: '100%', height: '100%', minHeight: '380px' }}
          zoomControl={true}
        >
          <MapController center={selectedCorridor.coords} zoom={selectedCorridor.zoom} />

          {/* Clean Esri Dark Gray Tiles (Zero Watermark) */}
          <TileLayer
            attribution='&copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
          />

          {/* 750m Tactical Geofencing Circles around Hotspot ATMs */}
          {showGeofences &&
            hotspotATMs.map((feat, idx) => {
              const [lon, lat] = feat.geometry.coordinates;
              return (
                <TacticalGeofence
                  key={`geofence-${feat.properties.id || idx}`}
                  center={[lat, lon]}
                  radiusMeters={750}
                  title={feat.properties.title}
                  riskScore={feat.properties.risk_score}
                />
              );
            })}

          {/* Render Active Police Patrol Fleet Markers */}
          {showPatrols &&
            patrols.map(unit => (
              <PatrolMarker
                key={`patrol-${unit.id}`}
                unit={unit}
                onSelectForDispatch={handlePatrolSelectForDispatch}
              />
            ))}

          {/* Render ATM Markers */}
          {atmFeatures.map((feat, idx) => {
            const [lon, lat] = feat.geometry.coordinates;
            const isHotspot = feat.properties.is_hotspot || feat.properties.risk_score > 0.7;
            const color = isHotspot ? '#f43f5e' : '#10b981';

            return (
              <CircleMarker
                key={`atm-${feat.properties.id || idx}`}
                center={[lat, lon]}
                radius={isHotspot ? 8 : 5}
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
                          onClick={() => handleOpenDispatchForATM(feat)}
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

          {/* Render NCRP Complaint Incidents */}
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
        <div className="absolute bottom-3 right-3 z-[400] p-2 rounded-lg bg-zinc-950/85 backdrop-blur-md border border-white/[0.08] text-[10px] font-mono space-y-1 pointer-events-none text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-300" />
            <span>Patrol Units ({patrols.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>ATM Cashout Hotspot</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span>Monitored ATM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            <span>Citizen Complaint</span>
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

