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
  onMoveBuildings: (ids: string[], dx: number, dy: number) => void;
  selectedBuildingIds: Set<string>;
  setSelectedBuildingIds: (ids: Set<string>) => void;
  onContextMenu: (e: React.MouseEvent, building: PlacedBuilding) => void;
  activeDragItem: Building | PlacedBuilding | null;
  setActiveDragItem: (item: Building | PlacedBuilding | null) => void;
  isOccupied: (x: number, y: number, width: number, height: number, excludeId?: string | string[]) => boolean;
}

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

export const Map: React.FC<MapProps> = ({
    gridSize,
    placedBuildings,
    allBuildings,
    onPlaceBuilding,
    onMoveBuildings,
    selectedBuildingIds,
    setSelectedBuildingIds,
    onContextMenu,
    activeDragItem,
    setActiveDragItem,
    isOccupied
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 400, y: 300 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingMap = useRef(false);
  const isMovingBuilding = useRef(false);
  const isSelecting = useRef(false);
  const selectionStart = useRef<Point | null>(null);
  const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

  const lastMousePos = useRef<Point>({ x: 0, y: 0 });
  const dragOffset = useRef<{ i: number, j: number }>({ i: 0, j: 0 });

  const [dragPreviewPos, setDragPreviewPos] = useState<{ x: number, y: number } | null>(null);
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null);

  const gridToScreen = (i: number, j: number) => {
    return {
      x: (i + j) * (TILE_WIDTH / 2),
      y: (j - i + gridSize) * (TILE_HEIGHT / 2),
    };
  };

  const screenToGrid = (sx: number, sy: number) => {
    const i = (sx / TILE_WIDTH) - (sy / TILE_HEIGHT) + (gridSize / 2);
    const j = (sx / TILE_WIDTH) + (sy / TILE_HEIGHT) - (gridSize / 2);
    return { i, j };
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = -e.deltaY;
    const factor = Math.pow(1.1, delta / 100);
    const newZoom = Math.min(Math.max(zoom * factor, 0.1), 5);

    if (newZoom !== zoom) {
        const zoomRatio = newZoom / zoom;

        // Calculate new offset to keep mouse position fixed
        // (mouseX - offset.x) / zoom = (mouseX - newOffset.x) / newZoom
        // mouseX - offset.x = (mouseX - newOffset.x) / zoomRatio
        // zoomRatio * (mouseX - offset.x) = mouseX - newOffset.x
        // newOffset.x = mouseX - zoomRatio * (mouseX - offset.x)

        setOffset(prev => ({
            x: mouseX - zoomRatio * (mouseX - prev.x),
            y: mouseY - zoomRatio * (mouseY - prev.y)
        }));
        setZoom(newZoom);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1) { // Middle mouse button
        e.preventDefault();
        isDraggingMap.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        (e.target as Element).setPointerCapture(e.pointerId);
    } else if (e.button === 0) {
        // Left click on grid background
        isSelecting.current = true;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            selectionStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }
        (e.currentTarget as Element).setPointerCapture(e.pointerId);

        if (!e.shiftKey) {
            setSelectedBuildingIds(new Set());
        }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!containerRef.current || !activeDragItem) return;

    const rect = containerRef.current.getBoundingClientRect();
    const sx = (e.clientX - rect.left - offset.x) / zoom;
    const sy = (e.clientY - rect.top - offset.y) / zoom;

    const { i, j } = screenToGrid(sx, sy);

    let finalI, finalJ;
    if ('x' in activeDragItem) {
        finalI = Math.round(i - dragOffset.current.i);
        finalJ = Math.round(j - dragOffset.current.j);
    } else {
        finalI = Math.round(i - activeDragItem.width / 2);
        finalJ = Math.round(j - activeDragItem.height / 2);
    }

    setDragPreviewPos({ x: finalI, y: finalJ });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the container
    if (e.relatedTarget === null || !containerRef.current?.contains(e.relatedTarget as Node)) {
        setDragPreviewPos(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeDragItem || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const sx = (e.clientX - rect.left - offset.x) / zoom;
    const sy = (e.clientY - rect.top - offset.y) / zoom;

    const { i, j } = screenToGrid(sx, sy);
    const isExisting = 'x' in activeDragItem;

    let finalI, finalJ;
    if (isExisting) {
        finalI = Math.round(i - dragOffset.current.i);
        finalJ = Math.round(j - dragOffset.current.j);
    } else {
        finalI = Math.round(i - activeDragItem.width / 2);
        finalJ = Math.round(j - activeDragItem.height / 2);
    }

    if (isExisting) {
        const b = activeDragItem as PlacedBuilding;
        const dx = finalI - b.x;
        const dy = finalJ - b.y;
        if (dx !== 0 || dy !== 0) {
            onMoveBuildings([b.id], dx, dy);
        }
    } else {
        const b = activeDragItem as Building;
        if (!placedBuildings.some(pb => pb.id === b.id)) {
            if (!isOccupied(finalI, finalJ, b.width, b.height)) {
                onPlaceBuilding({ ...b, x: finalI, y: finalJ });
            }
        }
    }
    setActiveDragItem(null);
    setDragPreviewPos(null);
  };

  const onPointerDownBuilding = (e: React.PointerEvent, b: PlacedBuilding) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();

    if (e.shiftKey) {
        const newSelected = new Set(selectedBuildingIds);
        if (newSelected.has(b.id)) {
            newSelected.delete(b.id);
        } else {
            newSelected.add(b.id);
        }
        setSelectedBuildingIds(newSelected);
        return;
    }

    if (!selectedBuildingIds.has(b.id)) {
        setSelectedBuildingIds(new Set([b.id]));
    }

    isMovingBuilding.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);

    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const sx = (e.clientX - rect.left - offset.x) / zoom;
        const sy = (e.clientY - rect.top - offset.y) / zoom;
        const { i, j } = screenToGrid(sx, sy);
        dragOffset.current = { i: i - b.x, j: j - b.y };
    }

    setActiveDragItem(b);
    setDragPreviewPos({ x: b.x, y: b.y });
  };

  useEffect(() => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();

        // Full map width in pixels = gridSize * TILE_WIDTH
        // Full map height in pixels = gridSize * TILE_HEIGHT
        const mapWidth = gridSize * TILE_WIDTH;
        const mapHeight = gridSize * TILE_HEIGHT;

        // Calculate zoom to fit
        const zoomX = (rect.width * 0.8) / mapWidth;
        const zoomY = (rect.height * 0.8) / mapHeight;
        const initialZoom = Math.min(zoomX, zoomY, 1);

        setZoom(initialZoom);

        // Center the map
        // The isometric grid's center in screen coordinates at (0,0) offset is:
        // x: (gridSize/2 + gridSize/2) * (TILE_WIDTH/2) = gridSize * TILE_WIDTH / 2
        // y: (gridSize/2 - gridSize/2) * (TILE_HEIGHT/2) = 0
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        setOffset({
            x: centerX - (gridSize * (TILE_WIDTH / 2)) * initialZoom,
            y: centerY - (gridSize * (TILE_HEIGHT / 2)) * initialZoom
        });
    }
  }, [gridSize]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingMap.current) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      } else if (isMovingBuilding.current && activeDragItem && 'x' in activeDragItem) {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const sx = (e.clientX - rect.left - offset.x) / zoom;
        const sy = (e.clientY - rect.top - offset.y) / zoom;
        const { i, j } = screenToGrid(sx, sy);

        const finalI = Math.round(i - dragOffset.current.i);
        const finalJ = Math.round(j - dragOffset.current.j);

        setDragPreviewPos({ x: finalI, y: finalJ });
      } else if (isSelecting.current && selectionStart.current) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            const x = Math.min(selectionStart.current.x, currentX);
            const y = Math.min(selectionStart.current.y, currentY);
            const w = Math.abs(selectionStart.current.x - currentX);
            const h = Math.abs(selectionStart.current.y - currentY);
            setSelectionRect({ x, y, w, h });

            // Real-time selection update
            const newSelected = new Set(e.shiftKey ? selectedBuildingIds : []);
            placedBuildings.forEach(b => {
                const pW = gridToScreen(b.x, b.y);
                const pE = gridToScreen(b.x + b.width, b.y + b.height);

                // Screen coordinates of building (bounding box is enough for rectangle intersection)
                const bLeft = (pW.x * zoom) + offset.x;
                const bTop = (pW.y * zoom) + offset.y;
                const bRight = (pE.x * zoom) + offset.x;
                const bBottom = (pE.y * zoom) + offset.y;

                // Adjust building screen coords to container local coords
                const localBLeft = bLeft - rect.left;
                const localBTop = bTop - rect.top;
                const localBRight = bRight - rect.left;
                const localBBottom = bBottom - rect.top;

                // Intersection check
                if (!(x + w < localBLeft || x > localBRight || y + h < localBTop || y > localBBottom)) {
                    newSelected.add(b.id);
                }
            });
            setSelectedBuildingIds(newSelected);
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.button === 1) {
          isDraggingMap.current = false;
      } else if (e.button === 0 && isMovingBuilding.current && activeDragItem && 'x' in activeDragItem) {
          if (dragPreviewPos) {
              const b = activeDragItem as PlacedBuilding;
              const dx = dragPreviewPos.x - b.x;
              const dy = dragPreviewPos.y - b.y;
              if (dx !== 0 || dy !== 0) {
                  onMoveBuildings(Array.from(selectedBuildingIds), dx, dy);
              }
          }
          isMovingBuilding.current = false;
          setActiveDragItem(null);
          setDragPreviewPos(null);
      } else if (e.button === 0 && isSelecting.current) {
          isSelecting.current = false;
          selectionStart.current = null;
          setSelectionRect(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeDragItem, dragPreviewPos, offset, zoom, gridSize, isOccupied, onMoveBuildings, setActiveDragItem, selectedBuildingIds, setSelectedBuildingIds, placedBuildings]);

  const west = gridToScreen(0, 0);
  const north = gridToScreen(gridSize, 0);
  const south = gridToScreen(0, gridSize);
  const east = gridToScreen(gridSize, gridSize);

  const getAllianceTiles = () => {
    const tiles = new Set<string>();
    placedBuildings.forEach(b => {
        let radius = 0;
        if (b.id === 'alliance-fortress') radius = 6;
        else if (b.id.startsWith('outpost-')) radius = 4;

        if (radius > 0) {
            for (let i = b.x - radius; i < b.x + b.width + radius; i++) {
                for (let j = b.y - radius; j < b.y + b.height + radius; j++) {
                    if (i >= 0 && i < gridSize && j >= 0 && j < gridSize) {
                        tiles.add(`${i},${j}`);
                    }
                }
            }
        }
    });
    return tiles;
  };

  const allianceTiles = getAllianceTiles();

  const renderAllianceZone = () => {
    if (allianceTiles.size === 0) return null;

    const tilesArray = Array.from(allianceTiles).map(s => s.split(',').map(Number));

    // Borders calculation (stepped)
    const borders: {x1: number, y1: number, x2: number, y2: number}[] = [];
    tilesArray.forEach(([i, j]) => {
        // Check 4 neighbors
        [[i-1, j], [i+1, j], [i, j-1], [i, j+1]].forEach(([ni, nj], index) => {
            if (!allianceTiles.has(`${ni},${nj}`)) {
                const p1 = gridToScreen(
                    index === 0 ? i : (index === 1 ? i + 1 : (index === 2 ? i : i)),
                    index === 0 ? j : (index === 1 ? j : (index === 2 ? j : j + 1))
                );
                const p2 = gridToScreen(
                    index === 0 ? i : (index === 1 ? i + 1 : (index === 2 ? i + 1 : i + 1)),
                    index === 0 ? j + 1 : (index === 1 ? j + 1 : (index === 2 ? j : j + 1))
                );
                borders.push({x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y});
            }
        });
    });

    return (
        <g pointerEvents="none">
            {tilesArray.map(([i, j]) => {
                const pW = gridToScreen(i, j);
                const pN = gridToScreen(i + 1, j);
                const pS = gridToScreen(i, j + 1);
                const pE = gridToScreen(i + 1, j + 1);
                return (
                    <polygon
                        key={`${i},${j}`}
                        points={`${pW.x},${pW.y} ${pN.x},${pN.y} ${pE.x},${pE.y} ${pS.x},${pS.y}`}
                        fill="rgba(34, 197, 94, 0.15)"
                    />
                );
            })}
            {borders.map((b, i) => (
                <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
            ))}
        </g>
    );
  };

  const renderBuilding = (b: PlacedBuilding | (Building & { x: number, y: number }), isGhost = false) => {
    const isCurrentlyBeingDragged = activeDragItem && activeDragItem.id === b.id;
    const isSelected = !isGhost && selectedBuildingIds.has(b.id);
    const isHovered = !isGhost && hoveredBuildingId === b.id;

    // When moving an existing building, we want to show it as a ghost at the new position
    // and hide/fade the original one at the old position.

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
        style={isCurrentlyBeingDragged && !isGhost ? { opacity: 0.2 } : {}}
        onContextMenu={(e) => !isGhost && onContextMenu(e, b as PlacedBuilding)}
        onMouseEnter={() => !isGhost && setHoveredBuildingId(b.id)}
        onMouseLeave={() => !isGhost && setHoveredBuildingId(null)}
        pointerEvents={isGhost ? "none" : "auto"}
      >
        <polygon
          points={points}
          onPointerDown={(e) => {
            if (!isGhost) onPointerDownBuilding(e, b as PlacedBuilding);
          }}
          fill={isGhost ? (isValid ? b.color : '#ef4444') : b.color}
          fillOpacity={isGhost ? 0.6 : 1}
          stroke={isGhost ? (isValid ? "#60a5fa" : "#f87171") : (isSelected ? "#3b82f6" : (isHovered ? "#ffffff" : "rgba(255,255,255,0.4)"))}
          strokeWidth={isGhost || isSelected || isHovered ? 4 : 1}
          style={(isGhost || isSelected || isHovered) ? {
            filter: isGhost
              ? `drop-shadow(0 0 10px ${isValid ? '#3b82f6' : '#ef4444'})`
              : (isSelected
                  ? `drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))`
                  : `drop-shadow(0 0 20px rgba(255,255,255,0.9))`)
          } : {}}
          className={isGhost ? "" : "transition-all duration-150"}
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
        {!b.isBase && (
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
        )}
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden bg-slate-950 relative"
      onWheel={handleWheel}
      onPointerDown={onPointerDown}
      onDragOver={handleDragOver}
      onDragEnter={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute"
      >
        <svg
            width={gridSize * TILE_WIDTH}
            height={gridSize * TILE_HEIGHT}
            viewBox={`0 0 ${gridSize * TILE_WIDTH} ${gridSize * TILE_HEIGHT}`}
            className="overflow-visible pointer-events-auto"
        >
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

            {renderAllianceZone()}

            {placedBuildings.map(b => renderBuilding(b))}
            {activeDragItem && dragPreviewPos && 'x' in activeDragItem && Array.from(selectedBuildingIds).map(id => {
                const b = placedBuildings.find(pb => pb.id === id);
                if (!b) return null;
                const dx = dragPreviewPos.x - (activeDragItem as PlacedBuilding).x;
                const dy = dragPreviewPos.y - (activeDragItem as PlacedBuilding).y;
                return renderBuilding({ ...b, x: b.x + dx, y: b.y + dy }, true);
            })}
            {activeDragItem && dragPreviewPos && !('x' in activeDragItem) && renderBuilding({ ...activeDragItem, x: dragPreviewPos.x, y: dragPreviewPos.y }, true)}

            <text x={west.x - 30} y={west.y} fill="white" fontSize="48" textAnchor="end" alignmentBaseline="middle" className="font-bold opacity-30 select-none pointer-events-none">WEST</text>
            <text x={east.x + 30} y={east.y} fill="white" fontSize="48" textAnchor="start" alignmentBaseline="middle" className="font-bold opacity-30 select-none pointer-events-none">EAST</text>
            <text x={north.x} y={north.y - 30} fill="white" fontSize="48" textAnchor="middle" alignmentBaseline="baseline" className="font-bold opacity-30 select-none pointer-events-none">NORTH</text>
            <text x={south.x} y={south.y + 30} fill="white" fontSize="48" textAnchor="middle" alignmentBaseline="hanging" className="font-bold opacity-30 select-none pointer-events-none">SOUTH</text>
          </g>
        </svg>
      </div>
      {selectionRect && (
        <div
            className="absolute border border-blue-400 bg-blue-500/20 pointer-events-none"
            style={{
                left: selectionRect.x,
                top: selectionRect.y,
                width: selectionRect.w,
                height: selectionRect.h
            }}
        />
      )}
    </div>
  );
};
