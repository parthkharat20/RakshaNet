import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request interceptor: attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rakshanet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.message || 'API request failed';

    // Handle 401 — redirect to login
    if (status === 401) {
      localStorage.removeItem('rakshanet_token');
      localStorage.removeItem('rakshanet_officer');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
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

export default api;


