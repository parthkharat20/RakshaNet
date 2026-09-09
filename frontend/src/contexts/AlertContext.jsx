import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchAlerts,
  fetchDashboardStats,
  freezeAccount,
  triggerAIRun,
  fetchDemoScenarios,
  simulateAttackApi,
  dispatchPatrolApi
} from '../utils/api';
import { useSocket } from '../hooks/useSocket';
import { tacticalAudio } from '../utils/audio';

const AlertContext = createContext(null);


export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, CRITICAL, ELEVATED, FROZEN
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [freezeReceipt, setFreezeReceipt] = useState(null);
  const [patrolReceipt, setPatrolReceipt] = useState(null);
  const [wsNotification, setWsNotification] = useState(null);
  const [demoScenarios, setDemoScenarios] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(tacticalAudio.isMuted());

  const toggleMuteAudio = () => {
    const muted = tacticalAudio.toggleMute();
    setIsAudioMuted(muted);
    return muted;
  };

  const loadScenarios = useCallback(async () => {
    try {
      const data = await fetchDemoScenarios();
      setDemoScenarios(data || []);
    } catch (err) {
      console.error('Failed to load demo scenarios:', err);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [statsData, alertsData] = await Promise.all([
        fetchDashboardStats().catch(() => null),
        fetchAlerts(100).catch(() => [])
      ]);
      if (statsData) setStats(statsData);
      setAlerts(alertsData || []);
      // Default select the highest risk alert if none selected
      if (!selectedAlert && alertsData && alertsData.length > 0) {
        setSelectedAlert(alertsData[0]);
      }
    } catch (err) {
      console.error('Failed to load telemetry:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAlert]);

  useEffect(() => {
    loadData();
    loadScenarios();
    // Auto-refresh every 30 seconds as fallback
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData, loadScenarios]);

  // --- WebSocket Real-Time Event Handler ---
  const handleWsEvent = useCallback((event) => {
    const { event_type, payload, timestamp } = event;

    switch (event_type) {
      case 'ALERT_BATCH':
        console.log('[WS] Received ALERT_BATCH:', payload);
        tacticalAudio.playTacticalAlert();
        setWsNotification({
          type: 'ALERT_BATCH',
          message: `AI Pipeline: ${payload.critical_count} critical, ${payload.elevated_count} elevated alerts generated.`,
          timestamp
        });
        loadData();
        break;

      case 'FREEZE_EXECUTED':
        console.log('[WS] Received FREEZE_EXECUTED:', payload);
        setAlerts(prev => prev.map(a => {
          if (a.target_account_id === payload.account_id) {
            return { ...a, status: 'FREEZE_DISPATCHED' };
          }
          return a;
        }));
        setWsNotification({
          type: 'FREEZE_EXECUTED',
          message: `Account ${payload.account_number} (${payload.holder_name}) frozen by ${payload.officer_badge_id}.`,
          timestamp
        });
        fetchDashboardStats().then(s => s && setStats(s)).catch(() => {});
        break;

      case 'LIEN_CONFIRMED':
        console.log('[WS] Received LIEN_CONFIRMED:', payload);
        tacticalAudio.playLienConfirmed();
        setAlerts(prev => prev.map(a => {
          if (a.target_account_number === payload.account_number) {
            return { ...a, status: 'FREEZE_CONFIRMED', bank_lien_reference: payload.bank_lien_reference };
          }
          return a;
        }));
        setWsNotification({
          type: 'LIEN_CONFIRMED',
          message: `Bank Lien Placed by ${payload.bank_name} (${payload.bank_lien_reference}) — Retained ₹${Number(payload.funds_retained).toLocaleString('en-IN')}`,
          timestamp
        });
        break;

      case 'PATROL_DISPATCHED':
        console.log('[WS] Received PATROL_DISPATCHED:', payload);
        tacticalAudio.playPatrolDispatchSound();
        setWsNotification({
          type: 'PATROL_DISPATCHED',
          message: `🚨 LEA Beat Dispatch: ${payload.callsign} (${payload.officer_in_charge}) -> ${payload.target_hotspot} (ETA ${payload.eta_minutes}m) [Ref: ${payload.dispatch_order_id}]`,
          timestamp
        });
        break;


      case 'COMPLAINT_INGESTED':
        console.log('[WS] Received COMPLAINT_INGESTED:', payload);
        setWsNotification({
          type: 'COMPLAINT_INGESTED',
          message: `New NCRP Complaint ${payload.acknowledgement_no}: ₹${payload.loss_amount.toLocaleString('en-IN')} (${payload.city})`,
          timestamp
        });
        fetchDashboardStats().then(s => s && setStats(s)).catch(() => {});
        break;

      case 'ATTACK_SIMULATED':
        console.log('[WS] Received ATTACK_SIMULATED:', payload);
        tacticalAudio.playTacticalAlert();
        setWsNotification({
          type: 'ATTACK_SIMULATED',
          message: `Incident Injected: ${payload.scenario_name} (₹${Number(payload.loss_amount).toLocaleString('en-IN')})`,
          timestamp
        });
        break;

      case 'PIPELINE_PROGRESS':
        setWsNotification({
          type: 'PIPELINE_PROGRESS',
          message: `${payload.stage}: ${payload.message} (${payload.progress_pct}%)`,
          timestamp
        });
        break;

      case 'CONNECTED':
        console.log('[WS] Server greeting:', payload.message);
        break;

      default:
        console.log('[WS] Unknown event:', event_type);
    }
  }, [loadData]);


  // Connect WebSocket
  const { isConnected: wsConnected } = useSocket(handleWsEvent);

  // Auto-dismiss WS notifications after 8 seconds
  useEffect(() => {
    if (wsNotification) {
      const timer = setTimeout(() => setWsNotification(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [wsNotification]);

  const runScoring = async () => {
    try {
      setIsScoring(true);
      await triggerAIRun();
      // Data will auto-refresh via WebSocket ALERT_BATCH event
      // Fallback: also load manually
      await loadData();
    } catch (err) {
      setError(`AI pipeline execution failed: ${err.message}`);
    } finally {
      setIsScoring(false);
    }
  };

  const dispatchFreeze = async (accountId, { officerBadgeId, reason, notes } = {}) => {
    try {
      const receipt = await freezeAccount(accountId, { officerBadgeId, reason, notes });
      setFreezeReceipt(receipt);
      
      // Update local alerts list state
      setAlerts(prev => prev.map(a => {
        if (a.target_account_id === accountId) {
          return { ...a, status: 'FREEZE_DISPATCHED' };
        }
        return a;
      }));

      // Update selected alert if active
      if (selectedAlert && selectedAlert.target_account_id === accountId) {
        setSelectedAlert(prev => ({
          ...prev,
          status: 'FREEZE_CONFIRMED',
          bank_lien_reference: receipt.bank_lien_reference
        }));
      }

      // Refresh stats
      fetchDashboardStats().then(s => s && setStats(s)).catch(() => {});
      return receipt;
    } catch (err) {
      throw err;
    }
  };

  const dispatchPatrol = async (unitId, payload) => {
    try {
      const receipt = await dispatchPatrolApi(unitId, payload);
      setPatrolReceipt(receipt);
      return receipt;
    } catch (err) {
      throw err;
    }
  };

  const simulateAttack = async (scenarioId) => {
    try {
      const result = await simulateAttackApi(scenarioId);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const filteredAlerts = alerts.filter(a => {
    // Filter by type / status
    if (filter === 'CRITICAL' && a.risk_score < 0.75) return false;
    if (filter === 'ELEVATED' && (a.risk_score >= 0.75 || a.risk_score < 0.40)) return false;
    if (filter === 'FROZEN' && a.status !== 'FREEZE_DISPATCHED' && a.status !== 'FREEZE_CONFIRMED') return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const holder = (a.target_holder_name || '').toLowerCase();
      const accNum = (a.target_account_number || '').toLowerCase();
      const type = (a.alert_type || '').toLowerCase();
      return holder.includes(q) || accNum.includes(q) || type.includes(q);
    }

    return true;
  });

  const value = {
    alerts: filteredAlerts,
    allAlertsCount: alerts.length,
    stats,
    selectedAlert,
    setSelectedAlert,
    isLoading,
    isScoring,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    error,
    freezeReceipt,
    setFreezeReceipt,
    patrolReceipt,
    setPatrolReceipt,
    wsConnected,
    wsNotification,
    setWsNotification,
    refreshData: loadData,
    runScoring,
    dispatchFreeze,
    dispatchPatrol,
    demoScenarios,
    fetchScenarios: loadScenarios,
    simulateAttack,
    isAudioMuted,
    toggleMuteAudio
  };



  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlertContext = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  return context;
};
