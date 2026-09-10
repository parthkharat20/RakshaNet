import React, { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { fetchAccountGraph } from '../../utils/api';
import { ROLE_COLORS, formatINR } from '../../utils/constants';

export const TxnGraph = ({ accountId, onNodeClick }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [maxHops, setMaxHops] = useState(2);
  const [hoverNode, setHoverNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });

  const containerRef = useRef(null);
  const fgRef = useRef(null);

  // Measure container dimensions dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 50 && height > 50) {
          setDimensions({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCenterAndFit = useCallback((nodesCount = null) => {
    if (!fgRef.current) return;
    const count = nodesCount ?? graphData.nodes.length;
    if (count === 0) return;

    // Small graph: center and set comfortable zoom so it fills the screen nicely
    if (count <= 6) {
      fgRef.current.centerAt(0, 0, 350);
      fgRef.current.zoom(2.0, 350);
    } else {
      fgRef.current.zoomToFit(400, 60);
    }
  }, [graphData.nodes.length]);

  const loadGraph = useCallback(async () => {
    if (!accountId) return;
    try {
      setIsLoading(true);
      const data = await fetchAccountGraph(accountId, maxHops);
      const rawNodes = data.nodes || [];
      const rawLinks = data.links || [];

      // Arrange initial node positions symmetrically around center (0,0)
      const nodeCount = rawNodes.length;
      const nodes = rawNodes.map((n, idx) => {
        const angle = (idx / (nodeCount || 1)) * 2 * Math.PI;
        const radius = n.id === accountId ? 0 : 90 + (idx % 3) * 30;
        return {
          id: n.id,
          name: n.holder_name,
          accountNumber: n.account_number,
          bank: n.bank_name,
          role: n.role || (n.id === accountId ? 'MULE_HUB' : 'MULE_NODE'),
          risk: n.risk_score || 0.85,
          isFrozen: n.is_frozen,
          age: n.account_age_days,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        };
      });

      const links = rawLinks.map(l => ({
        source: l.source,
        target: l.target,
        amount: l.amount,
        channel: l.channel,
        isFlagged: l.is_flagged,
        ringId: l.ring_id
      }));

      setGraphData({ nodes, links });

      // Auto-fit after data is loaded and simulation starts
      setTimeout(() => {
        handleCenterAndFit(nodes.length);
      }, 300);
    } catch (err) {
      console.error('Failed to load force graph data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, maxHops, handleCenterAndFit]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // Adjust physics forces to spread nodes apart cleanly
  useEffect(() => {
    if (fgRef.current) {
      const charge = fgRef.current.d3Force('charge');
      if (charge) {
        charge.strength(-450);
        charge.distanceMax(500);
      }
      const link = fgRef.current.d3Force('link');
      if (link) {
        link.distance(110);
      }
    }
  }, [graphData]);

  // Custom node drawing with high-contrast mission-critical style
  const paintNode = useCallback((node, ctx, globalScale) => {
    const color = ROLE_COLORS[node.role] || '#EF4444';
    const isRoot = node.id === accountId;
    const isMuleHub = node.role === 'MULE_HUB';
    const radius = isRoot ? 8 : (isMuleHub ? 7 : 5.5);

    // Subtle outer halo ring for flagged suspect nodes
    if (isMuleHub || isRoot) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI, false);
      ctx.fillStyle = `${color}25`;
      ctx.fill();
    }

    // Node body
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = isRoot ? 2 : 1.2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Node label badge
    const label = node.name || 'Account';
    const fontSize = Math.max(9 / globalScale, 3.4);
    ctx.font = `600 ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(10, 15, 26, 0.9)';
    ctx.fillRect(node.x - textWidth / 2 - 3, node.y + radius + 3, textWidth + 6, fontSize + 3);

    // Border around label plate
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeRect(node.x - textWidth / 2 - 3, node.y + radius + 3, textWidth + 6, fontSize + 3);

    // Label text
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(label, node.x, node.y + radius + 4);
  }, [accountId]);

  // Custom link label for transaction amounts
  const paintLink = useCallback((link, ctx, globalScale) => {
    if (!link.amount || globalScale < 1.2) return;
    const start = link.source;
    const end = link.target;
    if (typeof start !== 'object' || typeof end !== 'object') return;

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const amountLabel = formatINR(link.amount);

    const fontSize = Math.max(7 / globalScale, 2.8);
    ctx.font = `500 ${fontSize}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(amountLabel).width;
    ctx.fillStyle = 'rgba(8, 11, 17, 0.85)';
    ctx.fillRect(midX - textWidth / 2 - 2, midY - fontSize / 2 - 1, textWidth + 4, fontSize + 2);

    ctx.fillStyle = link.isFlagged ? '#fca5a5' : '#93c5fd';
    ctx.fillText(amountLabel, midX, midY);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden relative select-none bg-[#090D16]">
      {/* Header & Controls Bar */}
      <div className="px-3.5 py-2.5 border-b border-white/10 flex items-center justify-between z-10 bg-[#0B101D]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Network className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-xs">
                Multi-Hop Transaction Topology
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10">
                {graphData.nodes.length} Nodes • {graphData.links.length} Transfers
              </span>
            </div>
          </div>
        </div>

        {/* Hop Depth & Zoom Controls */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <div className="flex items-center bg-[#070A12] rounded border border-white/10 p-0.5 mr-1">
            {[1, 2, 3].map(h => (
              <button
                key={h}
                onClick={() => setMaxHops(h)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  maxHops === h ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {h} {h === 1 ? 'Hop' : 'Hops'}
              </button>
            ))}
          </div>

          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 200)}
            className="p-1 rounded bg-[#0E1526] hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.3, 200)}
            className="p-1 rounded bg-[#0E1526] hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleCenterAndFit()}
            className="p-1 rounded bg-[#0E1526] hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
            title="Recenter & Fit"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={loadGraph}
            className="p-1 rounded bg-[#0E1526] hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
            title="Refresh Network"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Graph Canvas Container */}
      <div ref={containerRef} className="flex-1 relative w-full h-full min-h-[360px] bg-[#070A12] overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070A12]/80 backdrop-blur-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-400 mb-2" />
            <p className="text-xs font-mono">Traversing Neo4j Multi-Hop Graph...</p>
          </div>
        )}

        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={paintNode}
          linkCanvasObjectMode={() => 'after'}
          linkCanvasObject={paintLink}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 9, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          linkColor={link => link.isFlagged ? '#EF4444' : 'rgba(147, 197, 253, 0.35)'}
          linkWidth={link => link.isFlagged ? 2 : 1.2}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalParticleColor={link => link.isFlagged ? '#EF4444' : '#60A5FA'}
          onNodeClick={(node) => {
            if (onNodeClick) onNodeClick(node);
          }}
          onNodeHover={setHoverNode}
          cooldownTicks={100}
          d3AlphaDecay={0.03}
          d3VelocityDecay={0.3}
          onEngineStop={() => handleCenterAndFit()}
        />

        {/* Hover Tooltip Overlay */}
        {hoverNode && (
          <div className="absolute bottom-3 left-3 z-20 p-2.5 rounded-lg bg-[#0E1526]/95 border border-white/15 text-xs font-mono pointer-events-none shadow-xl">
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

        {/* Floating Topology Legend */}
        <div className="absolute bottom-3 right-3 z-10 p-2.5 rounded-lg bg-[#0B101D]/90 border border-white/10 text-[10px] font-mono space-y-1 shadow-md">
          <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">Topology Legend</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Victim Account</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Mule Hub (Collector)</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500" /> Layering Intermediary</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> ATM Terminal</div>
        </div>
      </div>
    </div>
  );
};
