import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchAlerts,
  fetchDashboardStats,
  freezeAccount,
  triggerAIRun,
  fetchDemoScenarios,
  simulateAttackApi,
  dispatchPatrolApi,
  updateAlertStatusApi
} from '../utils/api';
import { useSocket } from '../hooks/useSocket';
import { tacticalAudio } from '../utils/audio';

const AlertContext = createContext(null);


const getStoredSolvedIds = () => {
  try {
    const raw = localStorage.getItem('rakshanet_solved_alert_ids');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredSolvedId = (id) => {
  try {
    const current = getStoredSolvedIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem('rakshanet_solved_alert_ids', JSON.stringify(current));
    }
  } catch (err) {
    console.error('Failed to save solved alert ID to localStorage:', err);
  }
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, CRITICAL, ELEVATED, FROZEN
  const [cityFilter, setCityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [freezeReceipt, setFreezeReceipt] = useState(null);
  const [patrolReceipt, setPatrolReceipt] = useState(null);
  const [wsNotification, setWsNotification] = useState(null);
  const [demoScenarios, setDemoScenarios] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(tacticalAudio.isMuted());
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

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

  const loadData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      setError(null);
      const [statsData, alertsData] = await Promise.all([
        fetchDashboardStats().catch(() => null),
        fetchAlerts(100).catch(() => [])
      ]);
      if (statsData) setStats(statsData);
      const fetched = alertsData || [];

      // Combine database status with stored solved IDs so page refreshes never revert solved status
      const storedSolvedIds = new Set(getStoredSolvedIds());
      const citiesList = ['Mumbai', 'Delhi', 'Bengaluru', 'Jamtara', 'Mewat', 'Hyderabad'];
      const mergedAlerts = fetched.map((a, idx) => {
        const city = a.city || a.target_city || a.explanation?.city || a.explanation?.target_city || citiesList[idx % citiesList.length];
        const isSolvedAlert = storedSolvedIds.has(a.id) || a.status === 'RESOLVED' || a.status === 'SOLVED' || a.status === 'CLOSED';
        return {
          ...a,
          city,
          status: isSolvedAlert ? 'RESOLVED' : a.status
        };
      });

      setAlerts(mergedAlerts);

      // Default select the highest risk active alert if none selected or if current selection is resolved
      setSelectedAlert(prev => {
        if (!prev || prev.status === 'RESOLVED' || prev.status === 'SOLVED' || prev.status === 'CLOSED' || storedSolvedIds.has(prev.id)) {
          const activeList = mergedAlerts.filter(a => a.status !== 'RESOLVED' && a.status !== 'SOLVED' && a.status !== 'CLOSED');
          return activeList.length > 0 ? activeList[0] : null;
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to load telemetry:', err);
      setError(err.message);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, []);

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
          if (a.target_account_id === payload.account_id || a.target_account_number === payload.account_number || a.id === payload.account_id) {
            return { ...a, status: 'FREEZE_DISPATCHED' };
          }
          return a;
        }));
        setSelectedAlert(prev => {
          if (prev && (prev.target_account_id === payload.account_id || prev.target_account_number === payload.account_number || prev.id === payload.account_id)) {
            return { ...prev, status: 'FREEZE_DISPATCHED' };
          }
          return prev;
        });
        setWsNotification({
          type: 'FREEZE_EXECUTED',
          message: `Account ${payload.account_number} (${payload.holder_name}) frozen by ${payload.officer_badge_id}.`,
          timestamp
        });
        loadData();
        break;

      case 'LIEN_CONFIRMED':
        console.log('[WS] Received LIEN_CONFIRMED:', payload);
        tacticalAudio.playLienConfirmed();
        setAlerts(prev => prev.map(a => {
          if (a.target_account_number === payload.account_number || a.target_account_id === payload.account_id) {
            return { ...a, status: 'FREEZE_CONFIRMED', bank_lien_reference: payload.bank_lien_reference };
          }
          return a;
        }));
        setSelectedAlert(prev => {
          if (prev && (prev.target_account_number === payload.account_number || prev.target_account_id === payload.account_id)) {
            return { ...prev, status: 'FREEZE_CONFIRMED', bank_lien_reference: payload.bank_lien_reference };
          }
          return prev;
        });
        setWsNotification({
          type: 'LIEN_CONFIRMED',
          message: `Bank Lien Placed by ${payload.bank_name} (${payload.bank_lien_reference}) — Retained ₹${Number(payload.funds_retained).toLocaleString('en-IN')}`,
          timestamp
        });
        loadData();
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
        if (a.target_account_id === accountId || a.target_account_number === accountId || a.id === accountId) {
          return { ...a, status: 'FREEZE_DISPATCHED' };
        }
        return a;
      }));

      // Update selected alert if active
      if (selectedAlert && (selectedAlert.target_account_id === accountId || selectedAlert.target_account_number === accountId || selectedAlert.id === accountId)) {
        setSelectedAlert(prev => ({
          ...prev,
          status: 'FREEZE_CONFIRMED',
          bank_lien_reference: receipt.bank_lien_reference
        }));
      }

      // Refresh stats and full telemetry
      await loadData();
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

  const resolveAlert = async (alertId, notes = '') => {
    try {
      // 1. Save to local storage for persistent cross-refresh safety
      saveStoredSolvedId(alertId);

      // 2. Immediately mark resolved in local state
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a));

      // 3. Clear or switch selected alert to next active threat
      setSelectedAlert(prev => {
        if (prev && prev.id === alertId) {
          const remainingActive = alerts.filter(a => a.id !== alertId && a.status !== 'RESOLVED' && a.status !== 'SOLVED' && a.status !== 'CLOSED');
          return remainingActive.length > 0 ? remainingActive[0] : null;
        }
        return prev;
      });

      // 4. Persist to PostgreSQL backend database
      await updateAlertStatusApi(alertId, 'RESOLVED', notes).catch(err => {
        console.warn('Backend update error during resolveAlert, local state updated:', err);
      });

      // 5. Refresh telemetry silently without UI flash or full loader
      await loadData(true);
    } catch (err) {
      console.error('Failed to resolve case:', err);
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

  // Unique city list derived from raw alerts combined with default hotspot corridors
  const DEFAULT_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Jamtara', 'Mewat', 'Hyderabad'];
  const rawCities = alerts
    .map(a => a.city || a.target_city || a.explanation?.city || a.explanation?.target_city)
    .filter(Boolean);
  const availableCities = ['ALL', ...Array.from(new Set([...DEFAULT_CITIES, ...rawCities])).sort()];

  const filteredAlerts = alerts.filter(a => {
    const isSolved = a.status === 'RESOLVED' || a.status === 'SOLVED' || a.status === 'CLOSED';

    // If viewing Solved tab, only return solved cases
    if (filter === 'SOLVED') {
      return isSolved;
    }

    // For active tabs (ALL, CRITICAL, ELEVATED, FROZEN), hide solved cases so they don't stay on screen
    if (isSolved) {
      return false;
    }

    // Filter by type / status
    if (filter === 'CRITICAL' && a.risk_score < 0.75) return false;
    if (filter === 'ELEVATED' && (a.risk_score >= 0.75 || a.risk_score < 0.40)) return false;
    if (filter === 'FROZEN' && a.status !== 'FREEZE_DISPATCHED' && a.status !== 'FREEZE_CONFIRMED') return false;

    // Filter by city
    if (cityFilter !== 'ALL') {
      const alertCity = (a.city || a.target_city || a.explanation?.city || a.explanation?.target_city || '').toLowerCase();
      const cFilter = cityFilter.toLowerCase();
      if (!alertCity.includes(cFilter)) return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const holder = (a.target_holder_name || '').toLowerCase();
      const accNum = (a.target_account_number || '').toLowerCase();
      const type = (a.alert_type || '').toLowerCase();
      const city = (a.city || a.target_city || '').toLowerCase();
      return holder.includes(q) || accNum.includes(q) || type.includes(q) || city.includes(q);
    }

    return true;
  });

  const value = {
    alerts: filteredAlerts,
    allAlertsCount: alerts.filter(a => a.status !== 'RESOLVED' && a.status !== 'SOLVED' && a.status !== 'CLOSED').length,
    totalRawAlertsCount: alerts.length,
    solvedAlertsCount: alerts.filter(a => a.status === 'RESOLVED' || a.status === 'SOLVED' || a.status === 'CLOSED').length,
    stats,
    selectedAlert,
    setSelectedAlert,
    isLoading,
    isScoring,
    filter,
    setFilter,
    cityFilter,
    setCityFilter,
    availableCities,
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
    resolveAlert,
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
