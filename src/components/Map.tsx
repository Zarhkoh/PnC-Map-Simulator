import React, { useState, useRef, useEffect } from 'react';
import { PlacedBuilding, Building } from '../types';

interface Point {
  x: number;
  y: number;
}

interface MapProps {
  gridSize: number;
  placedBuildings: PlacedBuilding[];
  allBuildings: Building[];
  onPlaceBuilding: (building: PlacedBuilding) => void;
  onMoveBuilding: (id: string, x: number, y: number) => void;
  onContextMenu: (e: React.MouseEvent, building: PlacedBuilding) => void;
  activeDragItem: Building | PlacedBuilding | null;
  setActiveDragItem: (item: Building | PlacedBuilding | null) => void;
  isOccupied: (x: number, y: number, width: number, height: number, excludeId?: string) => boolean;
}

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

export const Map: React.FC<MapProps> = ({
    gridSize,
    placedBuildings,
    allBuildings,
    onPlaceBuilding,
    onMoveBuilding,
    onContextMenu,
    activeDragItem,
    setActiveDragItem,
    isOccupied
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 400, y: 300 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingMap = useRef(false);
  const lastMousePos = useRef<Point>({ x: 0, y: 0 });

  const [dragPreviewPos, setDragPreviewPos] = useState<{ x: number, y: number } | null>(null);

  const gridToScreen = (i: number, j: number) => {
    return {
      x: (i + j) * (TILE_WIDTH / 2),
      y: (j - i) * (TILE_HEIGHT / 2),
    };
  };

  const screenToGrid = (sx: number, sy: number) => {
    const i = (sx / TILE_WIDTH) - (sy / TILE_HEIGHT);
    const j = (sx / TILE_WIDTH) + (sy / TILE_HEIGHT);
    return { i: Math.floor(i), j: Math.floor(j) };
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = -e.deltaY;
    const factor = Math.pow(1.1, delta / 100);
    setZoom((prev) => Math.min(Math.max(prev * factor, 0.1), 5));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    // Zoom logic only, panning removed
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const sx = (e.clientX - rect.left - offset.x) / zoom;
    const sy = (e.clientY - rect.top - offset.y) / zoom;

    const { i, j } = screenToGrid(sx, sy);
    setDragPreviewPos({ x: i, y: j });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!activeDragItem || !dragPreviewPos) return;

    const { x: i, y: j } = dragPreviewPos;
    const isExisting = 'x' in activeDragItem;

    if (isExisting) {
        const b = activeDragItem as PlacedBuilding;
        if (!isOccupied(i, j, b.width, b.height, b.id)) {
            onMoveBuilding(b.id, i, j);
        }
    } else {
        const b = activeDragItem as Building;
        if (!placedBuildings.some(pb => pb.id === b.id)) {
            if (!isOccupied(i, j, b.width, b.height)) {
                onPlaceBuilding({ ...b, x: i, y: j });
            }
        }
    }
    setActiveDragItem(null);
    setDragPreviewPos(null);
  };

  const onDragStartMapItem = (e: React.DragEvent, b: PlacedBuilding) => {
    setActiveDragItem(b);
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingMap.current) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDraggingMap.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const west = gridToScreen(0, 0);
  const north = gridToScreen(gridSize, 0);
  const south = gridToScreen(0, gridSize);
  const east = gridToScreen(gridSize, gridSize);

  const renderBuilding = (b: PlacedBuilding | (Building & { x: number, y: number }), isGhost = false) => {
    const isCurrentlyBeingDragged = activeDragItem && activeDragItem.id === b.id;
    if (isCurrentlyBeingDragged && !isGhost) return null;

    const pW = gridToScreen(b.x, b.y);
    const pN = gridToScreen(b.x + b.width, b.y);
    const pS = gridToScreen(b.x, b.y + b.height);
    const pE = gridToScreen(b.x + b.width, b.y + b.height);

    const points = `${pW.x},${pW.y} ${pN.x},${pN.y} ${pE.x},${pE.y} ${pS.x},${pS.y}`;

    const isValid = isGhost ? !isOccupied(b.x, b.y, b.width, b.height, 'x' in b ? (b as PlacedBuilding).id : undefined) : true;

    return (
      <g
        key={b.id + (isGhost ? '-ghost' : '')}
        className={isGhost ? 'pointer-events-none' : 'cursor-move'}
        onDragStart={(e) => !isGhost && onDragStartMapItem(e, b as PlacedBuilding)}
        onContextMenu={(e) => !isGhost && onContextMenu(e, b as PlacedBuilding)}
      >
        <polygon
          points={points}
          fill={isGhost ? (isValid ? b.color : '#ef4444') : b.color}
          fillOpacity={isGhost ? 0.6 : 1}
          stroke={isGhost ? (isValid ? "#60a5fa" : "#f87171") : "rgba(255,255,255,0.4)"}
          strokeWidth={isGhost ? 3 : 1}
          style={isGhost ? { filter: `drop-shadow(0 0 10px ${isValid ? '#3b82f6' : '#ef4444'})` } : {}}
        />
        <text
            x={(pW.x + pE.x) / 2}
            y={(pW.y + pE.y) / 2 - 5}
            fill="white"
            fontSize="10"
            textAnchor="middle"
            className="font-bold pointer-events-none"
            style={{ textShadow: '1px 1px 2px black' }}
        >
            {b.name}
        </text>
        <text
            x={(pW.x + pE.x) / 2}
            y={(pW.y + pE.y) / 2 + 8}
            fill="white"
            fontSize="8"
            textAnchor="middle"
            className="pointer-events-none"
            style={{ textShadow: '1px 1px 2px black' }}
        >
            {b.power.toLocaleString()}
        </text>
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden bg-slate-950 relative"
      onWheel={handleWheel}
      onMouseDown={onMouseDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute"
      >
        <svg className="overflow-visible">
          <g>
            <polygon
              points={`${west.x},${west.y} ${north.x},${north.y} ${east.x},${east.y} ${south.x},${south.y}`}
              fill="#1e293b"
            />

            {Array.from({ length: gridSize + 1 }).map((_, i) => (
                <React.Fragment key={i}>
                    <line x1={gridToScreen(i, 0).x} y1={gridToScreen(i, 0).y} x2={gridToScreen(i, gridSize).x} y2={gridToScreen(i, gridSize).y} stroke="#334155" strokeWidth="0.5" />
                    <line x1={gridToScreen(0, i).x} y1={gridToScreen(0, i).y} x2={gridToScreen(gridSize, i).x} y2={gridToScreen(gridSize, i).y} stroke="#334155" strokeWidth="0.5" />
                </React.Fragment>
            ))}

            {placedBuildings.map(b => renderBuilding(b))}
            {activeDragItem && dragPreviewPos && renderBuilding({ ...activeDragItem, x: dragPreviewPos.x, y: dragPreviewPos.y }, true)}

            <text x={west.x - 20} y={west.y} fill="white" fontSize="32" textAnchor="end" alignmentBaseline="middle" className="font-bold opacity-30">W</text>
            <text x={east.x + 20} y={east.y} fill="white" fontSize="32" textAnchor="start" alignmentBaseline="middle" className="font-bold opacity-30">E</text>
            <text x={north.x} y={north.y - 20} fill="white" fontSize="32" textAnchor="middle" alignmentBaseline="baseline" className="font-bold opacity-30">N</text>
            <text x={south.x} y={south.y + 20} fill="white" fontSize="32" textAnchor="middle" alignmentBaseline="hanging" className="font-bold opacity-30">S</text>
          </g>
        </svg>
      </div>
    </div>
  );
};
