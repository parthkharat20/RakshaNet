import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.endsWith('/api/v1')
      ? import.meta.env.VITE_API_URL
      : `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api/v1`)
  : '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

// Officer auto-provisioning credentials for Law Enforcement demonstration
const DEMO_OFFICER = {
  badge_id: 'LE-CYBER-MUM-4029',
  pin: '1234',
  name: 'Inspector Parth Kharat',
  rank: 'Cyber Crime Inspector',
  department: 'Maharashtra Cyber Cell, I4C Division'
};

// Auto-initialize officer session if not present
export const ensureOfficerSession = async () => {
  let token = localStorage.getItem('rakshanet_token');
  let officer = localStorage.getItem('rakshanet_officer');

  if (!token || !officer) {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        badge_id: DEMO_OFFICER.badge_id,
        pin: DEMO_OFFICER.pin
      });
      if (res.data?.access_token) {
        token = res.data.access_token;
        localStorage.setItem('rakshanet_token', token);
        localStorage.setItem('rakshanet_officer', JSON.stringify({
          name: res.data.officer_name,
          rank: res.data.officer_rank,
          badge_id: res.data.badge_id,
          department: DEMO_OFFICER.department
        }));
        return token;
      }
    } catch (err) {
      console.warn('Auto-session initialization fallback:', err);
    }
  }
  return token;
};

// Eagerly ensure session on module load
if (typeof window !== 'undefined') {
  ensureOfficerSession();
}

// Request interceptor: attach JWT token if available, or try ensureOfficerSession
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('rakshanet_token');
  if (!token && !config.url?.includes('/auth/login')) {
    token = await ensureOfficerSession();
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified error extraction and auto-retry on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.message || 'API request failed';

    // Handle 401: Transparently auto-reauthenticate and retry once
    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        localStorage.removeItem('rakshanet_token');
        const token = await ensureOfficerSession();
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          processQueue(null, token);
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        console.error('Session refresh failed:', refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    console.error('API Error:', message, error);
    return Promise.reject(new Error(message));
  }
);

// --- Auth ---
export const loginOfficer = async (badgeId, pin) => {
  const res = await api.post('/auth/login', { badge_id: badgeId, pin: pin });
  const data = res.data;
  localStorage.setItem('rakshanet_token', data.access_token);
  localStorage.setItem('rakshanet_officer', JSON.stringify({
    name: data.officer_name,
    rank: data.officer_rank,
    badge_id: data.badge_id
  }));
  return data;
};

export const logoutOfficer = () => {
  localStorage.removeItem('rakshanet_token');
  localStorage.removeItem('rakshanet_officer');
  window.location.href = '/login';
};

export const getStoredOfficer = () => {
  try {
    const data = localStorage.getItem('rakshanet_officer');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('rakshanet_token');
};

// --- Dashboard ---
export const fetchDashboardStats = async () => {
  const res = await api.get('/stats/dashboard');
  return res.data;
};

export const fetchAlerts = async (limit = 50, status = null) => {
  const params = { limit };
  if (status) params.status = status;
  const res = await api.get('/alerts', { params });
  return res.data;
};

export const fetchAlertDetail = async (alertId) => {
  const res = await api.get(`/alerts/${alertId}`);
  return res.data;
};

export const freezeAccount = async (accountId, { officerBadgeId, reason, notes } = {}) => {
  const res = await api.post(`/freeze/${accountId}`, {
    officer_badge_id: officerBadgeId || 'LE-CYBER-MUM-4029',
    reason: reason || 'NCRP Cyber Financial Fraud Emergency Interdiction',
    notes: notes || 'Automated one-click law enforcement freeze action'
  });
  return res.data;
};

export const fetchAccountGraph = async (accountId, maxHops = 2) => {
  const res = await api.get(`/accounts/${accountId}/graph`, {
    params: { max_hops: maxHops }
  });
  return res.data;
};

export const fetchHeatmapGeoJSON = async () => {
  const res = await api.get('/heatmap');
  return res.data;
};

export const fetchNearbyATMs = async (lat, lon, radiusKm = 10) => {
  const res = await api.get('/heatmap/atms/nearby', {
    params: { lat, lon, radius_km: radiusKm }
  });
  return res.data;
};

export const triggerAIRun = async () => {
  const res = await api.post('/alerts/run-scoring');
  return res.data;
};

export const fetchAccounts = async (params = {}) => {
  const res = await api.get('/accounts', { params });
  return res.data;
};

// --- Live Demonstration Engine ---
export const fetchDemoScenarios = async () => {
  const res = await api.get('/demo/scenarios');
  return res.data;
};

export const simulateAttackApi = async (scenarioId) => {
  const res = await api.post('/demo/simulate-attack', { scenario_id: scenarioId });
  return res.data;
};

// --- Mobile Patrol Interdiction & Beat Dispatch ---
export const fetchPatrols = async (city = null, status = null) => {
  const params = {};
  if (city) params.city = city;
  if (status) params.status = status;
  const res = await api.get('/patrols', { params });
  return res.data;
};

export const fetchNearbyPatrols = async (lat, lon, radiusKm = 15) => {
  const res = await api.get('/patrols/nearby', {
    params: { lat, lon, radius_km: radiusKm }
  });
  return res.data;
};

export const dispatchPatrolApi = async (unitId, payload) => {
  const res = await api.post(`/patrols/${unitId}/dispatch`, payload);
  return res.data;
};

// --- Forensic Legal Dossier & Syndicate Intelligence ---
export const fetchCourtDossier = async (alertId) => {
  const res = await api.get(`/dossier/${alertId}`);
  return res.data;
};

export const fetchSyndicates = async () => {
  const res = await api.get('/syndicates');
  return res.data;
};

// --- Citizen Restitution Engine (Section 457 Cr.P.C. / BNSS 503) ---
export const fetchRestitutionsApi = async () => {
  const res = await api.get('/restitution');
  return res.data;
};

export const draftRestitutionApi = async (payload = {}) => {
  const res = await api.post('/restitution/draft', payload);
  return res.data;
};

export const executeRestitutionApi = async (restitutionId, payload) => {
  const res = await api.post(`/restitution/${restitutionId}/execute`, payload);
  return res.data;
};

export const trackVictimComplaintApi = async (ackNo) => {
  const res = await api.get(`/restitution/track/${encodeURIComponent(ackNo)}`);
  return res.data;
};

export default api;



