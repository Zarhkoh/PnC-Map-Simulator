import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { Building } from '../types';

interface SidebarProps {
  buildings: Building[];
  onAddBuilding: (building: Omit<Building, 'id'>) => void;
  onUpdateBuilding: (id: string, updates: Partial<Building>) => void;
  onDeleteBuilding: (id: string) => void;
  placedBuildingIds: Set<string>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  buildings,
  onAddBuilding,
  onUpdateBuilding,
  onDeleteBuilding,
  placedBuildingIds
}) => {
  const [isAllianceOpen, setIsAllianceOpen] = useState(true);
  const [isCustomOpen, setIsCustomOpen] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const allianceBuildings = buildings.filter(b => b.isBase);
  const customBuildings = buildings.filter(b => !b.isBase);

  return (
    <aside className="w-64 border-r border-slate-700 bg-slate-800 flex flex-col shrink-0 z-10">
      <div className="flex-1 overflow-y-auto">
        {/* Alliance Buildings Section */}
        <div>
          <button
            onClick={() => setIsAllianceOpen(!isAllianceOpen)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-700 transition-colors border-b border-slate-700"
          >
            <span className="font-semibold uppercase text-xs tracking-wider text-slate-400">Alliance Buildings</span>
            {isAllianceOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {isAllianceOpen && (
            <div className="p-2 space-y-1">
              {allianceBuildings.map(b => (
                <BuildingItem
                  key={b.id}
                  building={b}
                  isPlaced={placedBuildingIds.has(b.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Custom Buildings Section */}
        <div>
          <button
            onClick={() => setIsCustomOpen(!isCustomOpen)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-700 transition-colors border-y border-slate-700"
          >
            <span className="font-semibold uppercase text-xs tracking-wider text-slate-400">Custom Buildings</span>
            {isCustomOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {isCustomOpen && (
            <div className="p-2 space-y-1">
              {customBuildings.map(b => (
                <BuildingItem
                  key={b.id}
                  building={b}
                  isPlaced={placedBuildingIds.has(b.id)}
                  onDelete={() => onDeleteBuilding(b.id)}
                />
              ))}
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full p-2 flex items-center justify-center gap-2 rounded border border-dashed border-slate-600 hover:border-slate-400 hover:bg-slate-700 transition-colors text-sm text-slate-400"
              >
                <Plus size={14} /> Add Building
              </button>
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <AddBuildingForm
          onClose={() => setShowAddForm(false)}
          onSubmit={(data) => {
            onAddBuilding(data);
            setShowAddForm(false);
          }}
        />
      )}
    </aside>
  );
};

const BuildingItem: React.FC<{
  building: Building;
  isPlaced: boolean;
  onDelete?: () => void;
}> = ({ building, isPlaced, onDelete }) => {
  return (
    <div
      className={cn(
        "group p-3 rounded bg-slate-700/50 border border-slate-600 flex flex-col gap-1 cursor-grab active:cursor-grabbing hover:bg-slate-700 transition-all",
        isPlaced && "opacity-50 grayscale cursor-not-allowed"
      )}
      draggable={!isPlaced}
      onDragStart={(e) => {
        if (isPlaced) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('buildingId', building.id);
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm truncate">{building.name}</span>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded"
          >
            <X size={12} />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>Size: {building.width}x{building.height}</span>
        <span>Power: {building.power.toLocaleString()}</span>
      </div>
      <div
        className="h-1 w-full rounded-full"
        style={{ backgroundColor: building.color }}
      />
    </div>
  );
};

const AddBuildingForm: React.FC<{
  onClose: () => void;
  onSubmit: (data: Omit<Building, 'id'>) => void
}> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [power, setPower] = useState(0);
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(2);
  const [color, setColor] = useState('#3b82f6');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-lg">Add New Building</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">Building Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Citadel"
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">Power</label>
              <input
                type="number"
                value={power}
                onChange={e => setPower(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={e => setWidth(Number(e.target.value))}
                  min="1"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                  min="1"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1 px-6">
            <label className="text-xs font-semibold text-slate-400 uppercase">Color</label>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-full h-10 bg-slate-900 border border-slate-700 rounded p-1 focus:outline-none"
            />
          </div>
        </div>
        <div className="p-4 bg-slate-700/30 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 hover:bg-slate-700 rounded transition-colors">Cancel</button>
          <button
            disabled={!name}
            onClick={() => onSubmit({ name, power, width, height, color })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none rounded font-bold transition-colors"
          >
            Create Building
          </button>
        </div>
      </div>
    </div>
  );
}

// Utility to merge tailwind classes (I'll need to define it or import it)
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
