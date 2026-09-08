import React, { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, ZoomIn, ZoomOut, Maximize2, RefreshCw, Filter } from 'lucide-react';
import { fetchAccountGraph } from '../../utils/api';
import { ROLE_COLORS } from '../../utils/constants';

export const TxnGraph = ({ accountId, onNodeClick }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [maxHops, setMaxHops] = useState(2);
  const [hoverNode, setHoverNode] = useState(null);
  const fgRef = useRef();

  const loadGraph = useCallback(async () => {
    if (!accountId) return;
    try {
      setIsLoading(true);
      const data = await fetchAccountGraph(accountId, maxHops);
      // Format data for React-Force-Graph
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

  // Custom node drawing with role color and pulsing halo
  const paintNode = useCallback((node, ctx, globalScale) => {
    const color = ROLE_COLORS[node.role] || ROLE_COLORS.CLEAN;
    const isRoot = node.id === accountId;
    const isMuleHub = node.role === 'MULE_HUB';
    const radius = isRoot ? 8 : (isMuleHub ? 7 : 5);

    // Halo glow for suspect hubs
    if (isMuleHub || isRoot) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI, false);
      ctx.fillStyle = `${color}40`; // 25% opacity
      ctx.fill();
    }

    // Node body
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Text label for zoomed-in view or root
    if (globalScale > 1.2 || isRoot || isMuleHub) {
      const label = `${node.name || 'Account'} (${node.role})`;
      const fontSize = Math.max(10 / globalScale, 3.5);
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(label, node.x, node.y + radius + 2);
    }
  }, [accountId]);

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden relative border-white/10">
      {/* Header & Controls */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between z-10 bg-slate-950/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-blue-400" />
          <h3 className="font-display font-bold text-white text-sm">
            Ego-Network Graph Intelligence
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            ({graphData.nodes.length} Nodes, {graphData.links.length} Flow Edges)
          </span>
        </div>

        {/* Tactical View Controls */}
        <div className="flex items-center gap-1.5">
          {/* Hop Selector */}
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-0.5 text-xs font-mono">
            {[1, 2, 3].map(h => (
              <button
                key={h}
                onClick={() => setMaxHops(h)}
                className={`px-2 py-0.5 rounded ${
                  maxHops === h ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {h} Hop{h > 1 ? 's' : ''}
              </button>
            ))}
          </div>

          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 300)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.3, 300)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fgRef.current?.zoomToFit(400, 50)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            title="Fit to Viewport"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={loadGraph}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            title="Reload Network"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1 relative w-full h-full min-h-[380px] bg-slate-950">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mb-2" />
            <p className="text-xs font-mono">Querying Neo4j Multi-Hop Graph Traversal...</p>
          </div>
        )}

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
          linkColor={link => link.isFlagged ? '#EF4444' : 'rgba(255, 255, 255, 0.2)'}
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
          <div className="absolute bottom-3 left-3 z-20 p-2.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-white/15 text-xs font-mono pointer-events-none shadow-xl">
            <div className="font-bold text-white text-sm">{hoverNode.name}</div>
            <div className="text-slate-400">Acc: {hoverNode.accountNumber} ({hoverNode.bank})</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-300 font-semibold">Role:</span>
              <span style={{ color: ROLE_COLORS[hoverNode.role] }}>{hoverNode.role}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300">Risk:</span>
              <span className="font-bold text-red-400">{(hoverNode.risk * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Tactical Role Legend */}
        <div className="absolute top-3 right-3 z-10 p-2.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-[11px] font-mono space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Topology Legend</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Victim Node</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Mule Hub (Collector)</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Layering Mule</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Standard Account</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Cash-Out Terminal</div>
        </div>
      </div>
    </div>
  );
};
