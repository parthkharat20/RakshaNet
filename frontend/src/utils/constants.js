/**
 * RakshaNet UI Constants & Styling Tokens
 */

export const ROLE_COLORS = {
  VICTIM: '#38bdf8',      // Cyan-Blue: Defrauded citizen node
  MULE_HUB: '#f43f5e',    // Crimson: Interdicted mule aggregator (Primary Threat Accent)
  MULE_NODE: '#fbbf24',   // Amber: Layering intermediary mule
  CLEAN: '#64748b',       // Slate: Legitimate background account
  ATM: '#10b981'          // Emerald: Physical cash-out terminal
};

export const ROLE_LABELS = {
  VICTIM: 'Victim Node',
  MULE_HUB: 'Mule Hub (Collector)',
  MULE_NODE: 'Layering Mule',
  CLEAN: 'Standard Account',
  ATM: 'Cash-Out Terminal'
};

export const ALERT_TYPE_META = {
  MULE_RING: {
    label: 'Critical Mule Ring',
    color: '#EF4444',
    badgeClass: 'badge-status-critical',
    icon: 'AlertTriangle'
  },
  SURVEILLANCE: {
    label: 'Surveillance Advisory',
    color: '#F59E0B',
    badgeClass: 'badge-status-amber',
    icon: 'Eye'
  },
  ATM_CASHOUT_SURGE: {
    label: 'ATM Cash-Out Surge',
    color: '#10B981',
    badgeClass: 'badge-status-success',
    icon: 'Zap'
  }
};

export const DEFAULT_OFFICER_BADGE = 'LE-CYBER-MUM-4029';

export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const maskAccountNumber = (accNo) => {
  if (!accNo) return '•••• ••••';
  const str = String(accNo);
  if (str.length <= 4) return str;
  return '•••• ' + str.slice(-4);
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};
