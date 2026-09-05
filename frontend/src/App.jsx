import React, { useState, useEffect, useRef } from 'react';
import { fetchStats, fetchHeatmapGeoJSON, logFreezeRequest, WS_BASE_URL } from './services/api';

export default function App() {
  const [stats, setStats] = useState({
    total_complaints: 8247,
    active_alerts: 47,
    funds_preserved_inr: 24000000.0,
    avg_response_minutes: 4.2,
    predicted_clean_accounts: 23,
  });

  const [alerts, setAlerts] = useState([
    {
      alert_code: "RN-9042",
      tier: "CRITICAL",
      account_no: "888822220001",
      bank: "HDFC Bank",
      amount: 45000,
      zone: "Bandra-Kurla Complex",
      atm_code: "ATM-MUM-042",
      score: 89.8,
      explanation: "Account A/C-0001 flagged with 90% risk (CRITICAL). 2 hops from 2 confirmed mule clusters (+34%), high-density cash-out zone BKC (+26%), zero prior legitimate business history (+18%).",
      status: "NEW",
      timestamp: "2 mins ago"
    },
    {
      alert_code: "RN-8114",
      tier: "CRITICAL",
      account_no: "991122334455",
      bank: "State Bank of India",
      amount: 120000,
      zone: "Connaught Place",
      atm_code: "ATM-DEL-009",
      score: 92.4,
      explanation: "Rapid fan-out transfer detected. 3 hops from Jamtara cluster (+38%), high ATM velocity (+28%).",
      status: "NEW",
      timestamp: "8 mins ago"
    },
    {
      alert_code: "RN-7023",
      tier: "HIGH",
      account_no: "776655443322",
      bank: "ICICI Bank",
      amount: 32000,
      zone: "Koramangala 5th Block",
      atm_code: "ATM-BLR-014",
      score: 68.5,
      explanation: "Dormant savings account activated with high withdrawal request (+24%), unusual geo-deviation (+22%).",
      status: "NEW",
      timestamp: "18 mins ago"
    }
  ]);

  const [selectedAlert, setSelectedAlert] = useState(alerts[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [freezeStatus, setFreezeStatus] = useState("IDLE"); // IDLE, LOGGING, LOGGED
  const [dispatchRef, setDispatchRef] = useState("NB-8819");
  const [clock, setClock] = useState(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const canvasRef = useRef(null);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats().then(data => setStats(data));
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    if (window.L) {
      const map = window.L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629], // Center India
        zoom: 5,
        zoomControl: false,
        attributionControl: false
      });

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      // Add ATM Markers
      const atms = [
        { lat: 19.0657, lng: 72.8688, code: "ATM-MUM-042", zone: "BKC Mumbai", score: 90, tier: "CRITICAL" },
        { lat: 28.6139, lng: 77.2090, code: "ATM-DEL-009", zone: "Connaught Place", score: 92, tier: "CRITICAL" },
        { lat: 12.9352, lng: 77.6245, code: "ATM-BLR-014", zone: "Koramangala", score: 68, tier: "HIGH" },
        { lat: 17.4399, lng: 78.3758, code: "ATM-HYD-007", zone: "Hitec City", score: 45, tier: "MEDIUM" }
      ];

      atms.forEach(atm => {
        const color = atm.tier === "CRITICAL" ? "#EF4444" : (atm.tier === "HIGH" ? "#F59E0B" : "#14B8A6");
        const marker = window.L.circleMarker([atm.lat, atm.lng], {
          radius: atm.tier === "CRITICAL" ? 10 : 7,
          fillColor: color,
          color: "#FFFFFF",
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family:Inter,sans-serif; color:#111; padding:4px;">
            <strong>${atm.code}</strong><br/>
            Zone: ${atm.zone}<br/>
            Risk Score: <b>${atm.score}%</b> (${atm.tier})
          </div>
        `);
      });

      mapInstanceRef.current = map;
    }
  }, []);

  // Draw 2-Hop Network Graph on Canvas
  useEffect(() => {
    if (!canvasRef.current || !selectedAlert) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.parentElement.clientWidth || 320;
    const h = canvas.height = 180;

    ctx.clearRect(0, 0, w, h);

    // Nodes
    const nodes = [
      { x: w * 0.15, y: h * 0.5, label: "Victim (Delhi)", color: "#3B82F6", sub: "Source" },
      { x: w * 0.5, y: h * 0.35, label: `Clean Target ...${selectedAlert.account_no.slice(-4)}`, color: "#EF4444", sub: "2-Hop Bridge" },
      { x: w * 0.85, y: h * 0.25, label: "Mule Hub 1", color: "#A855F7", sub: "Confirmed Ring" },
      { x: w * 0.85, y: h * 0.65, label: "Mule Hub 2", color: "#A855F7", sub: "Confirmed Ring" },
      { x: w * 0.5, y: h * 0.82, label: selectedAlert.atm_code, color: "#F59E0B", sub: "Predicted Cashout" }
    ];

    // Edges
    const edges = [
      { from: 0, to: 1, label: `₹${selectedAlert.amount.toLocaleString('en-IN')}` },
      { from: 1, to: 2, label: "Hop 2" },
      { from: 1, to: 3, label: "Hop 2" },
      { from: 1, to: 4, label: "ATM Withdrawal" }
    ];

    // Draw edges
    edges.forEach(e => {
      ctx.beginPath();
      ctx.moveTo(nodes[e.from].x, nodes[e.from].y);
      ctx.lineTo(nodes[e.to].x, nodes[e.to].y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FFFFFF";
      ctx.stroke();

      ctx.font = "10px Inter, sans-serif";
      ctx.fillStyle = "#F8FAFC";
      ctx.textAlign = "center";
      ctx.fillText(n.label, n.x, n.y - 12);

      ctx.font = "9px Inter, sans-serif";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(n.sub, n.x, n.y + 18);
    });
  }, [selectedAlert, isDrawerOpen]);

  const handleFreeze = async () => {
    if (freezeStatus === "LOGGED") return;
    setFreezeStatus("LOGGING");
    const res = await logFreezeRequest(selectedAlert.alert_code);
    setFreezeStatus("LOGGED");
    setDispatchRef(res.bank_dispatch_ref || "NB-8819");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
      
      {/* TOP COMMAND BAR */}
      <header style={{
        height: 'var(--topbar-h)',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>RakshaNet</span>
          </div>
          <div style={{ width: '1px', height: '22px', background: 'var(--border)' }}></div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Predictive Cash-Out Hotspot Intelligence · LEA Maharashtra Cyber Cell
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* SYNTHETIC DEMO BADGE */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.12)',
            color: '#60A5FA',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            fontWeight: '600',
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '4px'
          }}>
            🧪 Synthetic Demo Data · Calibrated to Public Stats
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(34, 197, 94, 0.12)',
            color: '#4ADE80',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '700'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80' }}></span>
            LIVE STREAM
          </div>

          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {clock} IST
          </span>
        </div>
      </header>

      {/* STATS KPI BAR */}
      <div style={{
        height: 'var(--stats-h)',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        padding: '10px 20px'
      }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>📋</span>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Complaints Ingested</div>
            <div style={{ fontSize: '16px', fontWeight: '800' }}>{stats.total_complaints.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🛡️</span>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Funds Preserved (Lien Applied)</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--green)' }}>₹2.4 Cr</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>⚡</span>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Intervention Lead Time</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--amber)' }}>4.2 min</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🎯</span>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Zero-History Accounts Flagged</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--teal)' }}>23 Accounts</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT WORKSPACE */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        {/* MAP COMPONENT */}
        <div ref={mapContainerRef} style={{ flex: 1, height: '100%', background: '#000' }} />

        {/* ALERT FEED (RIGHT PANEL) */}
        <div style={{
          width: isDrawerOpen ? '320px' : '380px',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', fontSize: '13px', letterSpacing: '0.5px' }}>🚨 REAL-TIME ALERT FEED</span>
            <span style={{ background: 'var(--red)', color: 'white', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '10px' }}>
              {alerts.length} ACTIVE
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {alerts.map(a => (
              <div
                key={a.alert_code}
                onClick={() => { setSelectedAlert(a); setIsDrawerOpen(true); setFreezeStatus("IDLE"); }}
                style={{
                  background: selectedAlert?.alert_code === a.alert_code ? 'var(--bg-hover)' : 'var(--bg-card)',
                  border: selectedAlert?.alert_code === a.alert_code ? '1px solid var(--blue)' : '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    background: a.tier === "CRITICAL" ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                    color: a.tier === "CRITICAL" ? '#F87171' : '#FBBF24',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '800'
                  }}>
                    {a.tier} · {a.score}% RISK
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{a.timestamp}</span>
                </div>

                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  ₹{a.amount.toLocaleString('en-IN')} · A/C ...{a.account_no.slice(-4)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  📍 {a.atm_code} ({a.zone})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLIDE-OUT CASE INVESTIGATION DRAWER */}
        {isDrawerOpen && selectedAlert && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '440px',
            height: '100%',
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border)',
            boxShadow: '-10px 0 25px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 20
          }}>
            {/* Drawer Header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Case Investigation</span>
                <div style={{ fontSize: '15px', fontWeight: '800' }}>Alert #{selectedAlert.alert_code}</div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
              {/* Target Profile Card */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>TARGET INTERMEDIARY ACCOUNT</div>
                <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace' }}>
                  {selectedAlert.account_no}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Bank: <strong>{selectedAlert.bank}</strong> · Zero Prior Complaints
                </div>
              </div>

              {/* Canvas 2-Hop Network Graph */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>2-HOP GRAPH TOPOLOGY (UVP)</span>
                  <span style={{ fontSize: '10px', color: 'var(--teal)', fontWeight: '600' }}>Adamic-Adar Proximity</span>
                </div>
                <canvas ref={canvasRef} style={{ width: '100%', height: '180px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)' }} />
              </div>

              {/* SHAP Explainability Panel */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  SHAP ATTRIBUTION (COURT-ADMISSIBLE REASONING)
                </div>
                <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {selectedAlert.explanation}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                      <span>Network Proximity (Adamic-Adar)</span>
                      <strong>+34%</strong>
                    </div>
                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                      <div style={{ width: '34%', height: '100%', background: 'var(--blue)', borderRadius: '2px' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                      <span>ATM Cash-Out Cluster Density</span>
                      <strong>+26%</strong>
                    </div>
                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                      <div style={{ width: '26%', height: '100%', background: 'var(--red)', borderRadius: '2px' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                      <span>Account Dormancy / Age Risk</span>
                      <strong>+18%</strong>
                    </div>
                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                      <div style={{ width: '18%', height: '100%', background: 'var(--amber)', borderRadius: '2px' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence Log Status */}
              {freezeStatus === "LOGGED" && (
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', padding: '12px', fontSize: '11px', color: '#4ADE80' }}>
                  🛡️ <strong>Freeze Request Logged</strong> — Dispatched to Nodal Bank via API (Ref #{dispatchRef}). Recorded in Evidence Log Vault.
                </div>
              )}
            </div>

            {/* Drawer Footer / Freeze CTA */}
            <div style={{ padding: '16px 18px', borderTop: '1px solid var(--border)' }}>
              <button
                onClick={handleFreeze}
                disabled={freezeStatus === "LOGGED"}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: freezeStatus === "LOGGED" ? 'var(--bg-card)' : 'linear-gradient(135deg, #EF4444, #B91C1C)',
                  color: freezeStatus === "LOGGED" ? 'var(--green)' : '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: freezeStatus === "LOGGED" ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: freezeStatus === "LOGGED" ? '1px solid var(--green)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {freezeStatus === "LOGGED" ? (
                  "✅ Freeze Request Logged — Dispatched to Bank via API"
                ) : (
                  "🛡️ Log Freeze Request"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
