export interface Building {
  id: string;
  name: string;
  power: number;
  width: number;
  height: number;
  color: string;
  isBase?: boolean;
  count?: number;
  maxCount?: number;
  allianceRadius?: number;
}

export interface PlacedBuilding extends Building {
  x: number;
  y: number;
}

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'alliance-fortress',
    name: 'Alliance Fortress',
    power: 0,
    width: 3,
    height: 3,
    color: '#64748b', // Gray-500
    isBase: true,
    maxCount: 1,
    allianceRadius: 6,
  },
  {
    id: 'infernal-gate',
    name: 'Infernal Gate',
    power: 0,
    width: 3,
    height: 3,
    color: '#f97316', // Orange-500
    isBase: true,
    maxCount: 1,
  },
  ...Array.from({ length: 5 }).map((_, i) => ({
    id: `outpost-${i}`,
    name: `Outpost ${i + 1}`,
    power: 0,
    width: 2,
    height: 2,
    color: '#94a3b8', // Gray-400
    isBase: true,
    maxCount: 1, // Treat each as unique in the list as requested
    allianceRadius: 4,
  })),
];
