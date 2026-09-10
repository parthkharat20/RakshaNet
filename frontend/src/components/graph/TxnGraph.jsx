import React, { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
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
      const nodes = (data.nodes || []).map(n => ({
        id: n.id,
        name: n.holder_name,
        accountNumber: n.account_number,
        bank: n.bank_name,
        role: n.role || 'MULE_HUB',
        risk: n.risk_score || 0.85,
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

      // Auto-fit to view with generous padding
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 90);
        }
      }, 400);
    } catch (err) {
      console.error('Failed to load force graph data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, maxHops]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // Adjust physics forces to spread nodes apart cleanly
  useEffect(() => {
    if (fgRef.current) {
      const charge = fgRef.current.d3Force('charge');
      if (charge) {
        charge.strength(-480);
        charge.distanceMax(600);
      }
      const link = fgRef.current.d3Force('link');
      if (link) {
        link.distance(120);
      }
    }
  }, [graphData]);

  // Custom node drawing with high-contrast mission-critical style
  const paintNode = useCallback((node, ctx, globalScale) => {
    const color = ROLE_COLORS[node.role] || '#EF4444';
    const isRoot = node.id === accountId;
    const isMuleHub = node.role === 'MULE_HUB';
    const radius = isRoot ? 7 : (isMuleHub ? 6 : 4.5);

    // Subtle outer halo ring for flagged suspect nodes
    if (isMuleHub || isRoot) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI, false);
      ctx.fillStyle = `${color}25`;
      ctx.fill();
    }

    // Node body
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Crisp text label with background plate for maximum readability
    const label = `${node.name || 'Account'}`;
    const fontSize = Math.max(9 / globalScale, 3.2);
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Label pill backdrop
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(7, 10, 18, 0.85)';
    ctx.fillRect(node.x - textWidth / 2 - 2, node.y + radius + 2, textWidth + 4, fontSize + 2);

    // Label text
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(label, node.x, node.y + radius + 3);
  }, [accountId]);

  return (
    <div className="flex flex-col h-full overflow-hidden relative select-none">
      {/* Header & Controls Bar */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between z-10 bg-[#070A12]/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-blue-400" />
          <span className="font-mono font-bold text-white text-xs">
            Multi-Hop Transaction Topology
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            ({graphData.nodes.length} Nodes • {graphData.links.length} Edges)
          </span>
        </div>

        {/* Hop Depth & Zoom Controls */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <div className="flex items-center bg-[#0F172A] rounded border border-white/10 p-0.5 mr-2">
            {[1, 2, 3].map(h => (
              <button
                key={h}
                onClick={() => setMaxHops(h)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  maxHops === h ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {h} {h === 1 ? 'Hop' : 'Hops'}
              </button>
            ))}
          </div>

          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.25, 200)}
            className="p-1 rounded bg-[#0F172A] hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.25, 200)}
            className="p-1 rounded bg-[#0F172A] hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fgRef.current?.zoomToFit(400, 90)}
            className="p-1 rounded bg-[#0F172A] hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
            title="Fit to Canvas"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={loadGraph}
            className="p-1 rounded bg-[#0F172A] hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
            title="Recalculate Network"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1 relative w-full h-full min-h-[380px] bg-[#070A12]">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070A12]/80 backdrop-blur-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-400 mb-2" />
            <p className="text-xs font-mono">Traversing Neo4j Graph Topology...</p>
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
          linkWidth={link => link.isFlagged ? 1.8 : 1}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.8}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleColor={link => link.isFlagged ? '#EF4444' : '#3B82F6'}
          onNodeClick={(node) => {
            if (onNodeClick) onNodeClick(node);
          }}
          onNodeHover={setHoverNode}
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />

        {/* Hover Tooltip Overlay */}
        {hoverNode && (
          <div className="absolute bottom-3 left-3 z-20 p-2.5 rounded-md bg-[#0F172A]/95 border border-white/15 text-xs font-mono pointer-events-none shadow-xl">
            <div className="font-bold text-white text-sm">{hoverNode.name}</div>
            <div className="text-slate-400">Acc: {hoverNode.accountNumber} ({hoverNode.bank})</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-300">Role:</span>
              <span style={{ color: ROLE_COLORS[hoverNode.role] || '#EF4444' }}>{hoverNode.role}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Risk:</span>
              <span className="font-bold text-red-400">{(hoverNode.risk * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Topology Legend */}
        <div className="absolute top-3 right-3 z-10 p-2.5 rounded-md bg-[#070A12]/90 border border-white/10 text-[10px] font-mono space-y-1">
          <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">Network Legend</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Victim Account</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Mule Hub (Collector)</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500" /> Layering Mule</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Cash-Out Point</div>
        </div>
      </div>
    </div>
  );
};
