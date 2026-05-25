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
}

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

export const Map: React.FC<MapProps> = ({
    gridSize,
    placedBuildings,
    allBuildings,
    onPlaceBuilding,
    onMoveBuilding,
    onContextMenu
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 400, y: 300 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingMap = useRef(false);
  const lastMousePos = useRef<Point>({ x: 0, y: 0 });

  const [draggedBuilding, setDraggedBuilding] = useState<{
    building: Building | PlacedBuilding;
    x: number;
    y: number;
    isNew: boolean;
  } | null>(null);

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
    if (e.button === 0) {
        isDraggingMap.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const isOccupied = (x: number, y: number, width: number, height: number, excludeId?: string) => {
    for (let i = x; i < x + width; i++) {
      for (let j = y; j < y + height; j++) {
        if (i < 0 || j < 0 || i >= gridSize || j >= gridSize) return true;

        for (const b of placedBuildings) {
          if (b.id === excludeId) continue;
          if (i >= b.x && i < b.x + b.width && j >= b.y && j < b.y + b.height) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const sx = (e.clientX - rect.left - offset.x) / zoom;
    const sy = (e.clientY - rect.top - offset.y) / zoom;

    const { i, j } = screenToGrid(sx, sy);

    if (draggedBuilding) {
        setDraggedBuilding(prev => prev ? { ...prev, x: i, y: j } : null);
    } else {
        const buildingId = e.dataTransfer.getData('buildingId');
        if (buildingId) {
            const b = allBuildings.find(ab => ab.id === buildingId);
            if (b) {
                setDraggedBuilding({ building: b, x: i, y: j, isNew: true });
            }
        }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const buildingId = e.dataTransfer.getData('buildingId');
    const isExisting = e.dataTransfer.getData('isExisting') === 'true';

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sx = (e.clientX - rect.left - offset.x) / zoom;
    const sy = (e.clientY - rect.top - offset.y) / zoom;
    const { i, j } = screenToGrid(sx, sy);

    if (isExisting) {
        const b = placedBuildings.find(pb => pb.id === buildingId);
        if (b && !isOccupied(i, j, b.width, b.height, b.id)) {
            onMoveBuilding(b.id, i, j);
        }
    } else {
        const b = allBuildings.find(ab => ab.id === buildingId);
        if (b && !placedBuildings.some(pb => pb.id === b.id)) {
            if (!isOccupied(i, j, b.width, b.height)) {
                onPlaceBuilding({ ...b, x: i, y: j });
            }
        }
    }
    setDraggedBuilding(null);
  };

  const onDragStartMapItem = (e: React.DragEvent, b: PlacedBuilding) => {
    e.dataTransfer.setData('buildingId', b.id);
    e.dataTransfer.setData('isExisting', 'true');
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
    setDraggedBuilding({ building: b, x: b.x, y: b.y, isNew: false });
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
    const pW = gridToScreen(b.x, b.y);
    const pN = gridToScreen(b.x + b.width, b.y);
    const pS = gridToScreen(b.x, b.y + b.height);
    const pE = gridToScreen(b.x + b.width, b.y + b.height);

    const points = `${pW.x},${pW.y} ${pN.x},${pN.y} ${pE.x},${pE.y} ${pS.x},${pS.y}`;

    return (
      <g
        key={b.id + (isGhost ? '-ghost' : '')}
        className={isGhost ? 'pointer-events-none opacity-50' : 'cursor-move'}
        onDragStart={(e) => !isGhost && onDragStartMapItem(e, b as PlacedBuilding)}
        onContextMenu={(e) => !isGhost && onContextMenu(e, b as PlacedBuilding)}
      >
        <polygon
          points={points}
          fill={b.color}
          stroke="white"
          strokeWidth={isGhost ? 0.5 : 1}
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
            {draggedBuilding && renderBuilding({ ...draggedBuilding.building, x: draggedBuilding.x, y: draggedBuilding.y }, true)}

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
