import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Response interceptor for unified error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'API request failed';
    console.error('API Error:', message, error);
    return Promise.reject(new Error(message));
  }
);

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

export default api;
