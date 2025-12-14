import React, { useRef, useState } from 'react';

interface PanZoomContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PanZoomContainer: React.FC<PanZoomContainerProps> = ({ children, className = '' }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if left click
    if (e.button !== 0) return;
    
    e.preventDefault(); 
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom on wheel
    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, scale + delta), 5); // Max zoom 5x, Min 0.1x
    setScale(newScale);
  };

  const zoomIn = () => setScale(s => Math.min(s * 1.2, 5));
  const zoomOut = () => setScale(s => Math.max(s / 1.2, 0.1));
  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-gray-50 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Pattern Background moved inside so it doesn't move with content */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] z-0"></div>

      {/* Floating Controls */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-1 bg-white border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onMouseDown={e => e.stopPropagation()}>
        <button onClick={zoomIn} className="w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-100 border-b border-gray-200" title="Zoom In">+</button>
        <button onClick={reset} className="w-8 h-8 flex items-center justify-center text-[10px] font-bold hover:bg-gray-100 border-b border-gray-200" title="Reset View">
           {Math.round(scale * 100)}%
        </button>
        <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-100" title="Zoom Out">-</button>
      </div>

      {/* Content Wrapper */}
      <div 
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          willChange: 'transform'
        }}
        className="w-full h-full flex items-center justify-center z-10 relative"
      >
        {children}
      </div>
    </div>
  );
};