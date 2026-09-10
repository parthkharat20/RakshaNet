import React, { useState, useEffect } from 'react';
import {
  Shield,
  Radio,
  Navigation,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Send,
  Loader2,
  Lock,
  ChevronRight,
  Hash
} from 'lucide-react';
import { fetchNearbyPatrols, dispatchPatrolApi } from '../../utils/api';
import { tacticalAudio } from '../../utils/audio';

export const PatrolDispatchModal = ({
  isOpen,
  onClose,
  targetHotspot, // { terminal_id, name, lat, lon, alert_id }
  onDispatchSuccess
}) => {
  const [nearbyUnits, setNearbyUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [tacticalInstructions, setTacticalInstructions] = useState(
    'Immediate cash-out interdiction cordon. Intercept active mule runner at ATM terminal before cash egress.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchReceipt, setDispatchReceipt] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load nearby units whenever modal opens with a valid hotspot
  useEffect(() => {
    if (!isOpen || !targetHotspot || targetHotspot.lat == null || targetHotspot.lon == null) {
      return;
    }

    const loadUnits = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        setDispatchReceipt(null);
        const data = await fetchNearbyPatrols(targetHotspot.lat, targetHotspot.lon, 15.0);
        const units = data.units || [];
        setNearbyUnits(units);
        if (units.length > 0) {
          setSelectedUnitId(units[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch nearby patrol units:', err);
        setErrorMessage('Failed to query nearby police units via PostGIS.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUnits();
  }, [isOpen, targetHotspot]);

  if (!isOpen || !targetHotspot) return null;

  const handleDispatch = async () => {
    if (!selectedUnitId) return;

    try {
      setIsDispatching(true);
      setErrorMessage('');

      const payload = {
        alert_id: targetHotspot.alert_id || null,
        target_terminal_id: targetHotspot.terminal_id || null,
        target_atm_name: targetHotspot.name || 'Predicted ATM Liquidation Point',
        target_lat: Number(targetHotspot.lat),
        target_lon: Number(targetHotspot.lon),
        tactical_instructions: tacticalInstructions
      };

      const receipt = await dispatchPatrolApi(selectedUnitId, payload);
      setDispatchReceipt(receipt);
      tacticalAudio.playPatrolDispatchSound();

      if (onDispatchSuccess) {
        onDispatchSuccess(receipt);
      }
    } catch (err) {
      console.error('Patrol dispatch failed:', err);
      setErrorMessage(err.message || 'Failed to transmit patrol interdiction order.');
    } finally {
      setIsDispatching(false);
    }
  };

  const selectedUnit = nearbyUnits.find(u => u.id === selectedUnitId);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-red-950/40 via-slate-900 to-blue-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                Police Beat Dispatch & Mobile Interdiction
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  TACTICAL FLASH
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                PostGIS Spherical Geofence • LEA Beat Marshalling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs flex-1 min-h-0 scrollbar-thin scrollbar-thumb-white/20">
          {/* Target ATM Hotspot Summary Card */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Target Cash-Out Hotspot Terminal
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-white">{targetHotspot.name || 'ATM Terminal'}</span>
              <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-bold border border-red-500/30 text-[11px]">
                {targetHotspot.terminal_id || 'HOTSPOT'}
              </span>
            </div>
            <div className="text-slate-400 text-[11px] flex items-center gap-4">
              <span>Coords: [{Number(targetHotspot.lat).toFixed(4)}, {Number(targetHotspot.lon).toFixed(4)}]</span>
              <span>Radius Cordon: <strong className="text-white">750m</strong></span>
            </div>
          </div>

          {/* Success Receipt View */}
          {dispatchReceipt ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Tactical Interdiction Flash Dispatched!</span>
              </div>
              <p className="text-slate-200">{dispatchReceipt.message}</p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                <div>
                  <span className="text-slate-400">Order Reference:</span>
                  <div className="font-bold text-white text-xs">{dispatchReceipt.dispatch_order_id}</div>
                </div>
                <div>
                  <span className="text-slate-400">Assigned Unit:</span>
                  <div className="font-bold text-cyan-300 text-xs">{dispatchReceipt.callsign} ({dispatchReceipt.officer_in_charge})</div>
                </div>
                <div>
                  <span className="text-slate-400">Estimated Arrival:</span>
                  <div className="font-bold text-amber-300 text-xs">{dispatchReceipt.eta_minutes} mins ({dispatchReceipt.distance_km} km)</div>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <div className="font-bold text-red-400 text-xs uppercase">{dispatchReceipt.unit_status}</div>
                </div>
              </div>

              {/* SHA-256 Cryptographic Signature */}
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <Hash className="w-3 h-3 text-cyan-400" />
                  <span>SHA-256 Court-Admissible Evidence Signature</span>
                </div>
                <div className="font-mono text-[10px] text-cyan-400 break-all select-all">
                  {dispatchReceipt.hash_signature}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Nearby Patrol Units List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 uppercase tracking-wider font-bold">
                    Ranked Proximity Units ({nearbyUnits.length} in 15km sector)
                  </span>
                  <span className="text-slate-500">Sorted by Arrival ETA</span>
                </div>

                {isLoading ? (
                  <div className="p-6 flex flex-col items-center justify-center text-slate-400 bg-white/5 rounded-xl border border-white/5">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400 mb-2" />
                    <span>Calculating spherical distance vectors...</span>
                  </div>
                ) : nearbyUnits.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-white/5 rounded-xl border border-white/5">
                    No active patrol units located within 15 km perimeter.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] min-h-[120px] overflow-y-auto pr-2 border border-white/10 rounded-xl p-2.5 bg-black/40 shadow-inner scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {nearbyUnits.map((unit, idx) => {
                      const isSelected = selectedUnitId === unit.id;
                      return (
                        <div
                          key={unit.id}
                          onClick={() => setSelectedUnitId(unit.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/10'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-slate-500 font-bold text-xs shrink-0">#{idx + 1}</div>
                            <div className={`w-3 h-3 rounded-full shrink-0 ${isSelected ? 'bg-blue-400 ring-2 ring-blue-500/50' : 'bg-slate-600'}`} />
                            <div>
                              <div className="font-bold text-white text-xs flex items-center gap-2">
                                <span>{unit.callsign}</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 font-mono">
                                  {unit.unit_type.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="text-slate-400 text-[11px]">
                                {unit.officer_in_charge} • {unit.jurisdiction}
                              </div>
                            </div>
                          </div>

                          <div className="text-right space-y-0.5 shrink-0">
                            <div className="font-bold text-cyan-300 text-xs">
                              {unit.distance_km} km
                            </div>
                            <div className="text-[10px] text-amber-400 font-bold">
                              ETA ~{unit.eta_minutes} min
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tactical Instructions Field */}
              <div className="space-y-1.5 pt-2">
                <label className="text-slate-400 text-[11px] uppercase font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  Tactical Flash Instructions (Over Comms Channel)
                </label>
                <textarea
                  value={tacticalInstructions}
                  onChange={(e) => setTacticalInstructions(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white font-mono text-xs focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-[11px]">
                  {errorMessage}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authorized LEA Action • Immutable Audit Log</span>
          </div>

          <div className="flex items-center gap-2">
            {dispatchReceipt ? (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-colors"
              >
                Close Window
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  disabled={isDispatching}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatch}
                  disabled={!selectedUnitId || isDispatching || isLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDispatching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Flash...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transmit Interdiction Flash</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
