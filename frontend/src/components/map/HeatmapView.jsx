import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, AlertTriangle, Zap, Shield, RefreshCw } from 'lucide-react';
import { fetchHeatmapGeoJSON } from '../../utils/api';
import { formatINR } from '../../utils/constants';

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

// Corridor quick zoom coordinates
const CORRIDORS = [
  { name: 'All India', coords: [20.5937, 78.9629], zoom: 5 },
  { name: 'Mumbai Hub', coords: [19.0760, 72.8777], zoom: 12 },
  { name: 'Delhi-NCR', coords: [28.6139, 77.2090], zoom: 11 },
  { name: 'Jamtara-Deoghar', coords: [23.9625, 86.8020], zoom: 11 },
  { name: 'Mewat-Nuh', coords: [28.1130, 77.0016], zoom: 11 },
  { name: 'Bengaluru', coords: [12.9716, 77.5946], zoom: 12 }
];

export const HeatmapView = () => {
  const [geoData, setGeoData] = useState({ features: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCorridor, setSelectedCorridor] = useState(CORRIDORS[0]);

  const loadHeatmap = async () => {
    try {
      setIsLoading(true);
      const data = await fetchHeatmapGeoJSON();
      setGeoData(data);
    } catch (err) {
      console.error('Failed to load GeoJSON heatmap:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHeatmap();
  }, []);

  const features = geoData.features || [];
  const atmFeatures = features.filter(f => f.properties?.type === 'ATM');
  const complaintFeatures = features.filter(f => f.properties?.type === 'COMPLAINT');

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden relative border-white/10">
      {/* Header & Corridor Switcher */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between z-10 bg-slate-950/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <h3 className="font-display font-bold text-white text-sm">
            Geo-Spatial ATM Cash-Out & Complaint Hotspot Map
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            ({atmFeatures.length} ATMs • {complaintFeatures.length} Complaints)
          </span>
        </div>

        {/* Quick Corridor Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {CORRIDORS.map(corridor => (
            <button
              key={corridor.name}
              onClick={() => setSelectedCorridor(corridor)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap ${
                selectedCorridor.name === corridor.name
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {corridor.name}
            </button>
          ))}
          <button
            onClick={loadHeatmap}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 ml-1"
            title="Refresh PostGIS Markers"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="flex-1 relative w-full h-full min-h-[380px]">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-2" />
            <p className="text-xs font-mono">Querying PostGIS Spatial Hotspot Clusters...</p>
          </div>
        )}

        <MapContainer
          center={selectedCorridor.coords}
          zoom={selectedCorridor.zoom}
          style={{ width: '100%', height: '100%', minHeight: '380px' }}
          zoomControl={true}
        >
          <MapController center={selectedCorridor.coords} zoom={selectedCorridor.zoom} />

          {/* CartoDB Dark Matter Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Render ATM Markers */}
          {atmFeatures.map((feat, idx) => {
            const [lon, lat] = feat.geometry.coordinates;
            const isHotspot = feat.properties.is_hotspot || feat.properties.risk_score > 0.7;
            const color = isHotspot ? '#EF4444' : '#10B981';

            return (
              <CircleMarker
                key={`atm-${feat.properties.id || idx}`}
                center={[lat, lon]}
                radius={isHotspot ? 9 : 6}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: isHotspot ? 0.85 : 0.6,
                  weight: isHotspot ? 2.5 : 1
                }}
              >
                <Popup>
                  <div className="font-mono text-xs p-1 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <span className={`w-2 h-2 rounded-full ${isHotspot ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      <span>{feat.properties.title}</span>
                    </div>
                    <div className="text-slate-400">City: {feat.properties.city || 'N/A'}</div>
                    <div className="text-slate-400">Cash-Out Freq: <strong className="text-white">{feat.properties.cash_out_frequency || 0}</strong></div>
                    <div className="text-slate-400">
                      Terminal Risk: <span className={isHotspot ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {feat.properties.risk_score ? (feat.properties.risk_score * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    {isHotspot && (
                      <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-950/60 p-1 rounded border border-red-800/40 mt-1">
                        🚨 AI XGBOOST CASH-OUT HOTSPOT
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
                radius={7}
                pathOptions={{
                  color: '#F59E0B',
                  fillColor: '#F59E0B',
                  fillOpacity: 0.75,
                  weight: 1.5
                }}
              >
                <Popup>
                  <div className="font-mono text-xs p-1 space-y-1">
                    <div className="font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      NCRP Complaint Incident
                    </div>
                    <div className="text-white font-semibold">{feat.properties.title}</div>
                    <div className="text-slate-300">Reported Loss: <span className="text-red-400 font-bold">{formatINR(feat.properties.amount || 0)}</span></div>
                    <div className="text-slate-400">Location: {lat.toFixed(4)}, {lon.toFixed(4)}</div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Tactical Map Legend */}
        <div className="absolute bottom-3 right-3 z-[400] p-2.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-white/10 text-[11px] font-mono space-y-1 shadow-xl pointer-events-none">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Spatial Layer Legend</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> High-Risk Cashout Terminal</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Monitored ATM Terminal</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> NCRP Citizen Complaint Incident</div>
        </div>
      </div>
    </div>
  );
};
