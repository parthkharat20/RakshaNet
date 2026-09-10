import React, { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, ZoomIn, ZoomOut, Maximize2, RefreshCw, Table, Lock } from 'lucide-react';
import { fetchAccountGraph } from '../../utils/api';
import { ROLE_COLORS, formatINR } from '../../utils/constants';
import { useAlertContext } from '../../contexts/AlertContext';

export const TxnGraph = ({ accountId, onNodeClick }) => {
  const { alerts } = useAlertContext();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [maxHops, setMaxHops] = useState(2);
  const [hoverNode, setHoverNode] = useState(null);
  const [viewMode, setViewMode] = useState('GRAPH'); // 'GRAPH' | 'TABLE'
  const [tableSubTab, setTableSubTab] = useState('NODES'); // 'NODES' | 'EDGES'
  const fgRef = useRef();

  const loadGraph = useCallback(async () => {
    if (!accountId) return;
    try {
      setIsLoading(true);
      const data = await fetchAccountGraph(accountId, maxHops);
      // Format data for React-Force-Graph & Data Table
      const nodes = (data.nodes || []).map(n => ({
        id: n.id,
        name: n.holder_name,
        accountNumber: n.account_number,
        bank: n.bank_name,
        role: n.role,
        risk: n.risk_score,
        isFrozen: n.is_frozen,
        age: n.account_age_days
      }));

      const links = (data.links || []).map(l => ({
        source: l.source,
        target: l.target,
        amount: l.amount,
        channel: l.channel,
        isFlagged: l.is_flagged,
        ringId: l.ring_id
      }));

      setGraphData({ nodes, links });

      // Auto-fit to view after layout stabilizes
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 50);
        }
      }, 500);
    } catch (err) {
      console.error('Failed to load force graph data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, maxHops]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // Custom node drawing with sharp edge dual stroke and razor-sharp text labels
  const paintNode = useCallback((node, ctx, globalScale) => {
    const isTarget = node.id === accountId;
    const isHovered = hoverNode && hoverNode.id === node.id;

    // Node radius
    const radius = isTarget ? 9 : Math.max(5, 4 + (node.risk || 0) * 4);
    const color = ROLE_COLORS[node.role] || '#94a3b8';

    // 1. Sharp Outer Ring for High-Risk or Target Node
    if (isTarget || node.risk >= 0.75 || isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 3.5, 0, 2 * Math.PI);
      ctx.lineWidth = 2 / globalScale;
      ctx.strokeStyle = node.risk >= 0.75 ? '#EF4444' : '#3B82F6';
      ctx.stroke();
    }

    // 2. Node Body (Sharp Edge Circle)
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // 3. Crisp Dual Border Lines for Razor Sharp Edges
    ctx.lineWidth = 2.5 / globalScale;
    ctx.strokeStyle = '#020617';
    ctx.stroke();

    ctx.lineWidth = (isTarget ? 2 : 1.2) / globalScale;
    ctx.strokeStyle = isTarget ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)';
    ctx.stroke();

    // 4. Sharp & Clear Text Label Rendering with Dark Contrast Outline
    if (globalScale > 0.7 || isTarget || isHovered) {
      const label = `${node.name || 'Account'} (${node.accountNumber ? node.accountNumber.slice(-4) : '...'})`;
      const fontSize = Math.max(11 / globalScale, 3);
      ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const textY = node.y + radius + (3 / globalScale);

      // Dark background outline stroke behind text for high contrast & zero blurriness
      ctx.lineWidth = 4 / globalScale;
      ctx.strokeStyle = 'rgba(2, 6, 23, 0.95)';
      ctx.lineJoin = 'round';
      ctx.strokeText(label, node.x, textY);

      // High clarity foreground text
      ctx.fillStyle = isHovered ? '#60A5FA' : isTarget ? '#FACC15' : '#FFFFFF';
      ctx.fillText(label, node.x, textY);
    }
  }, [accountId, hoverNode]);

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden relative border-white/10 bg-slate-950">
      {/* Header & Controls */}
      <div className="p-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 z-10 bg-slate-950/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-blue-500" />
          <h3 className="font-display font-bold text-white text-sm">
            Ego-Network Graph Intelligence
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            ({graphData.nodes.length} Nodes, {graphData.links.length} Flow Edges)
          </span>
        </div>

        {/* Tactical View Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher: Graph View vs Table View */}
          <div className="flex items-center p-0.5 rounded-lg border border-white/10 bg-slate-900 text-xs font-mono">
            <button
              onClick={() => setViewMode('GRAPH')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-bold transition-all ${
                viewMode === 'GRAPH'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Graph View</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-bold transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>

          {/* Hop Selector */}
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-0.5 text-xs font-mono">
            {[1, 2, 3].map(h => (
              <button
                key={h}
                onClick={() => setMaxHops(h)}
                className={`px-2 py-0.5 rounded ${
                  maxHops === h
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h} Hop{h > 1 ? 's' : ''}
              </button>
            ))}
          </div>

          {viewMode === 'GRAPH' && (
            <>
              <button
                onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 300)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.3, 300)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fgRef.current?.zoomToFit(400, 50)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                title="Fit to Viewport"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            onClick={loadGraph}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title="Reload Network"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area: GRAPH or TABLE */}
      <div className="flex-1 relative w-full h-full min-h-0 bg-slate-950 text-slate-200">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/70 text-slate-400 backdrop-blur-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mb-2" />
            <p className="text-xs font-mono">Querying Neo4j Multi-Hop Graph Traversal...</p>
          </div>
        )}

        {viewMode === 'GRAPH' ? (
          /* ---------------- 2D FORCE GRAPH CANVAS ---------------- */
          <>
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeCanvasObject={paintNode}
              nodePointerAreaPaint={(node, color, ctx) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
                ctx.fill();
              }}
              linkColor={link => link.isFlagged ? '#EF4444' : 'rgba(255, 255, 255, 0.25)'}
              linkWidth={link => link.isFlagged ? 2 : 1}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              linkDirectionalParticleSpeed={0.006}
              linkDirectionalParticleColor={link => link.isFlagged ? '#EF4444' : '#3B82F6'}
              onNodeClick={(node) => {
                if (onNodeClick) onNodeClick(node);
              }}
              onNodeHover={setHoverNode}
              cooldownTicks={100}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
            />

            {/* Hover Tooltip Overlay */}
            {hoverNode && (
              <div className="absolute bottom-3 left-3 z-20 p-2.5 rounded-lg border text-xs font-mono pointer-events-none shadow-xl bg-slate-900/90 border-white/15 text-white">
                <div className="font-bold text-sm">{hoverNode.name}</div>
                <div className="text-slate-400">
                  Acc: {hoverNode.accountNumber} ({hoverNode.bank})
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-300">Role:</span>
                  <span style={{ color: ROLE_COLORS[hoverNode.role] }}>{hoverNode.role}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-300">Risk:</span>
                  <span className="font-bold text-red-500">{(hoverNode.risk * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}

            {/* Tactical Role Legend */}
            <div className="absolute top-3 right-3 z-10 p-2.5 rounded-lg border text-[11px] font-mono space-y-1 bg-slate-900/80 border-white/10 text-white">
              <div className="text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-400">
                Topology Legend
              </div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Victim Node</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Mule Hub (Collector)</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Layering Mule</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Standard Account</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Cash-Out Terminal</div>
            </div>
          </>
        ) : (
          /* ---------------- STRUCTURED DATA TABLE VIEW ---------------- */
          <div className="p-4 h-full flex flex-col font-mono text-xs overflow-hidden">
            {/* Table Sub-Tabs: Nodes (Accounts) vs Edges (Transaction Flows) */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTableSubTab('NODES')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    tableSubTab === 'NODES'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Network Account Nodes ({graphData.nodes.length})</span>
                </button>
                <button
                  onClick={() => setTableSubTab('EDGES')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    tableSubTab === 'EDGES'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Transaction Flow Edges ({graphData.links.length})</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400">
                {maxHops}-Hop Traversal Ledger
              </span>
            </div>

            {/* Table Content Scrollable Container */}
            <div className="flex-1 overflow-y-auto mt-3 pr-1">
              {tableSubTab === 'NODES' ? (
                /* ACCOUNTS / NODES TABLE */
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Holder Name</th>
                      <th className="p-2.5">Account Number</th>
                      <th className="p-2.5">Bank Name</th>
                      <th className="p-2.5">Role</th>
                      <th className="p-2.5">Risk Score</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {graphData.nodes.map((node, idx) => {
                      const isTarget = node.id === accountId;
                      const roleColor = ROLE_COLORS[node.role] || '#94a3b8';
                      const isNodeFrozen = Boolean(
                        node.isFrozen === true ||
                        node.isFrozen === 'true' ||
                        (alerts && alerts.some(a =>
                          (a.target_account_id === node.id || a.target_account_number === node.accountNumber) &&
                          (a.status === 'FREEZE_DISPATCHED' || a.status === 'FREEZE_CONFIRMED')
                        ))
                      );

                      return (
                        <tr
                          key={node.id || idx}
                          onClick={() => onNodeClick && onNodeClick(node)}
                          className={`border-b transition-colors cursor-pointer ${
                            isTarget
                              ? 'bg-blue-950/40 border-blue-500/30'
                              : 'border-white/5 hover:bg-white/5'
                          }`}
                        >
                          <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                            {node.name || 'Account'}
                            {isTarget && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-600 text-white font-bold">
                                TARGET
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-300">{node.accountNumber || 'N/A'}</td>
                          <td className="p-2.5 text-slate-400">{node.bank || 'Bank'}</td>
                          <td className="p-2.5 font-bold" style={{ color: roleColor }}>
                            {node.role}
                          </td>
                          <td className="p-2.5 font-bold">
                            <span className={`px-2 py-0.5 rounded text-[11px] ${
                              node.risk >= 0.75
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {(node.risk * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-2.5">
                            {isNodeFrozen ? (
                              <span className="pill pill-success text-[10px] inline-flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> FROZEN
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold">ACTIVE</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onNodeClick) onNodeClick(node);
                              }}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] font-bold transition-all shadow-sm active:scale-95"
                            >
                              Inspect Node
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                /* TRANSACTION FLOW EDGES TABLE */
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Flow Direction</th>
                      <th className="p-2.5">Amount (INR)</th>
                      <th className="p-2.5">Channel</th>
                      <th className="p-2.5">Flagged</th>
                      <th className="p-2.5">Ring ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {graphData.links.map((link, idx) => {
                      const srcNode = typeof link.source === 'object' ? link.source.name : link.source;
                      const dstNode = typeof link.target === 'object' ? link.target.name : link.target;
                      return (
                        <tr
                          key={idx}
                          className={`border-b transition-colors ${
                            link.isFlagged
                              ? 'bg-red-950/20 border-red-500/20'
                              : 'border-white/5 hover:bg-white/5'
                          }`}
                        >
                          <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-white">
                            <span className="text-slate-300">{srcNode}</span>
                            <span className="mx-2 text-blue-400">→</span>
                            <span className="text-white">{dstNode}</span>
                          </td>
                          <td className="p-2.5 font-bold text-emerald-400">
                            {formatINR(link.amount)}
                          </td>
                          <td className="p-2.5 text-cyan-300 font-bold">{link.channel || 'UPI'}</td>
                          <td className="p-2.5">
                            {link.isFlagged ? (
                              <span className="pill pill-critical text-[10px]">
                                FLAGGED FLOW
                              </span>
                            ) : (
                              <span className="text-slate-400">NORMAL</span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-400">{link.ringId || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
