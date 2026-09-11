import React, { useState, useRef } from 'react';

/**
 * ResizableTwoPanel: 2-column layout with a draggable vertical splitter (Code Editor style)
 */
export const ResizableTwoPanel = ({ leftChild, rightChild, initialLeftPct = 40 }) => {
  const containerRef = useRef(null);
  const [leftPct, setLeftPct] = useState(initialLeftPct);
  const [isDragging, setIsDragging] = useState(false);

  const startDragging = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const container = containerRef.current;
    if (!container) return;

    const onMove = (moveEvent) => {
      const clientX = moveEvent.clientX || moveEvent.touches?.[0]?.clientX;
      if (clientX === undefined) return;
      const rect = container.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(15, Math.min(85, pct));
      setLeftPct(clamped);
    };

    const stopDragging = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', stopDragging);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', stopDragging);
  };

  return (
    <div ref={containerRef} className="flex-1 flex w-full h-full overflow-hidden relative select-none">
      {/* Transparent Overlay during dragging to prevent Leaflet map / Canvas pointer capture */}
      {isDragging && <div className="fixed inset-0 z-[99999] cursor-col-resize select-none" />}

      {/* Left Panel */}
      <div style={{ width: `${leftPct}%` }} className="h-full min-w-0 flex flex-col overflow-hidden">
        {leftChild}
      </div>

      {/* Resizer Handle (IDE Style) */}
      <div
        onMouseDown={startDragging}
        onTouchStart={startDragging}
        className="w-2 hover:w-2.5 bg-slate-950 hover:bg-blue-600/70 active:bg-blue-500 cursor-col-resize transition-all shrink-0 flex items-center justify-center relative z-20 border-x border-white/10 group"
        title="Drag edge to resize panels"
      >
        <div className="w-0.5 h-8 bg-slate-600 group-hover:bg-white group-active:bg-white rounded-full transition-colors" />
      </div>

      {/* Right Panel */}
      <div style={{ width: `${100 - leftPct}%` }} className="h-full min-w-0 flex flex-col overflow-hidden">
        {rightChild}
      </div>
    </div>
  );
};

/**
 * ResizableThreePanel: 3-column layout with 2 draggable vertical splitters (Code Editor style)
 */
export const ResizableThreePanel = ({ leftChild, centerChild, rightChild, initialPcts = [33.33, 33.33, 33.34] }) => {
  const containerRef = useRef(null);
  const [widths, setWidths] = useState(initialPcts); // [w1, w2, w3]
  const [isDragging, setIsDragging] = useState(false);

  const startDraggingHandle1 = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const container = containerRef.current;
    if (!container) return;

    const onMove = (moveEvent) => {
      const clientX = moveEvent.clientX || moveEvent.touches?.[0]?.clientX;
      if (clientX === undefined) return;
      const rect = container.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;

      // Clamp w1 between 15% and (100 - w3 - 15%)
      const maxW1 = 100 - widths[2] - 15;
      const clampedW1 = Math.max(15, Math.min(maxW1, pct));
      const newW2 = 100 - clampedW1 - widths[2];

      setWidths([clampedW1, newW2, widths[2]]);
    };

    const stopDragging = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', stopDragging);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', stopDragging);
  };

  const startDraggingHandle2 = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const container = containerRef.current;
    if (!container) return;

    const onMove = (moveEvent) => {
      const clientX = moveEvent.clientX || moveEvent.touches?.[0]?.clientX;
      if (clientX === undefined) return;
      const rect = container.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;

      // Clamp pct (w1 + w2) between (w1 + 15%) and 85%
      const minPct = widths[0] + 15;
      const clampedPct = Math.max(minPct, Math.min(85, pct));
      const newW2 = clampedPct - widths[0];
      const newW3 = 100 - widths[0] - newW2;

      setWidths([widths[0], newW2, newW3]);
    };

    const stopDragging = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', stopDragging);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', stopDragging);
  };

  return (
    <div ref={containerRef} className="flex-1 flex w-full h-full overflow-hidden relative select-none">
      {/* Drag Overlay */}
      {isDragging && <div className="fixed inset-0 z-[99999] cursor-col-resize select-none" />}

      {/* Left Panel (Block 1) */}
      <div style={{ width: `${widths[0]}%` }} className="h-full min-w-0 flex flex-col overflow-hidden">
        {leftChild}
      </div>

      {/* Resizer Handle 1 */}
      <div
        onMouseDown={startDraggingHandle1}
        onTouchStart={startDraggingHandle1}
        className="w-2 hover:w-2.5 bg-slate-950 hover:bg-blue-600/70 active:bg-blue-500 cursor-col-resize transition-all shrink-0 flex items-center justify-center relative z-20 border-x border-white/10 group"
        title="Drag edge to resize blocks"
      >
        <div className="w-0.5 h-8 bg-slate-600 group-hover:bg-white group-active:bg-white rounded-full transition-colors" />
      </div>

      {/* Center Panel (Block 2) */}
      <div style={{ width: `${widths[1]}%` }} className="h-full min-w-0 flex flex-col overflow-hidden">
        {centerChild}
      </div>

      {/* Resizer Handle 2 */}
      <div
        onMouseDown={startDraggingHandle2}
        onTouchStart={startDraggingHandle2}
        className="w-2 hover:w-2.5 bg-slate-950 hover:bg-blue-600/70 active:bg-blue-500 cursor-col-resize transition-all shrink-0 flex items-center justify-center relative z-20 border-x border-white/10 group"
        title="Drag edge to resize blocks"
      >
        <div className="w-0.5 h-8 bg-slate-600 group-hover:bg-white group-active:bg-white rounded-full transition-colors" />
      </div>

      {/* Right Panel (Block 3) */}
      <div style={{ width: `${widths[2]}%` }} className="h-full min-w-0 flex flex-col overflow-hidden">
        {rightChild}
      </div>
    </div>
  );
};
