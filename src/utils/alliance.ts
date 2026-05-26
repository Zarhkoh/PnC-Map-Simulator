import { Building, PlacedBuilding } from '../types';

export const getAllianceTiles = (
  placedBuildings: PlacedBuilding[],
  gridSize: number,
  activeDragItem?: Building | PlacedBuilding | null,
  dragPreviewPos?: { x: number, y: number } | null,
  selectedBuildingIds?: Set<string>,
  excludeIds?: string[]
): Set<string> => {
  const tiles = new Set<string>();

  const addTiles = (b: { id: string, x: number, y: number, width: number, height: number, allianceRadius?: number }) => {
    const radius = b.allianceRadius || 0;
    if (radius > 0) {
      for (let i = b.x - radius; i < b.x + b.width + radius; i++) {
        for (let j = b.y - radius; j < b.y + b.height + radius; j++) {
          if (i >= 0 && i < gridSize && j >= 0 && j < gridSize) {
            tiles.add(`${i},${j}`);
          }
        }
      }
    }
  };

  let dx = 0, dy = 0;
  const isDraggingExisting = activeDragItem && dragPreviewPos && 'x' in activeDragItem;
  if (isDraggingExisting) {
    dx = dragPreviewPos!.x - (activeDragItem as PlacedBuilding).x;
    dy = dragPreviewPos!.y - (activeDragItem as PlacedBuilding).y;
  }

  placedBuildings.forEach(b => {
    if (excludeIds && excludeIds.includes(b.id)) return;

    if (isDraggingExisting && selectedBuildingIds?.has(b.id)) {
      addTiles({ ...b, x: b.x + dx, y: b.y + dy });
    } else {
      addTiles(b);
    }
  });

  if (activeDragItem && dragPreviewPos && !('x' in activeDragItem)) {
    addTiles({ ...activeDragItem, x: dragPreviewPos.x, y: dragPreviewPos.y });
  }

  return tiles;
};

export const isBuildingInAllianceZone = (
  building: { x: number, y: number, width: number, height: number },
  allianceTiles: Set<string>
): boolean => {
  if (allianceTiles.size === 0) return false;
  for (let i = building.x; i < building.x + building.width; i++) {
    for (let j = building.y; j < building.y + building.height; j++) {
      if (!allianceTiles.has(`${i},${j}`)) {
        return false;
      }
    }
  }
  return true;
};
