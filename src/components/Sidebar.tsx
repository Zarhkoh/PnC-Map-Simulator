import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X, GripVertical } from 'lucide-react';
import { Building } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SidebarProps {
  isOpen: boolean;
  buildings: Building[];
  onAddBuilding: (building: Omit<Building, 'id'>) => void;
  onUpdateBuilding: (id: string, updates: Partial<Building>) => void;
  onDeleteBuilding: (id: string) => void;
  placedBuildingIds: Set<string>;
  setActiveDragItem: (item: Building | null) => void;
  onReorderBuildings: (buildings: Building[]) => void;
}

type SortMode = 'manual' | 'name' | 'power';

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  buildings,
  onAddBuilding,
  onUpdateBuilding,
  onDeleteBuilding,
  placedBuildingIds,
  setActiveDragItem,
  onReorderBuildings
}) => {
  const [isAllianceOpen, setIsAllianceOpen] = useState(true);
  const [isCustomOpen, setIsCustomOpen] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('manual');

  const allianceBuildings = buildings.filter(b => b.isBase);
  const customBuildings = buildings.filter(b => !b.isBase);

  const sortedCustomBuildings = [...customBuildings].sort((a, b) => {
      if (sortMode === 'name') return a.name.localeCompare(b.name);
      if (sortMode === 'power') return b.power - a.power;
      return 0; // Manual
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndex = buildings.findIndex((b) => b.id === active.id);
        const newIndex = buildings.findIndex((b) => b.id === over.id);
        onReorderBuildings(arrayMove(buildings, oldIndex, newIndex));
    }
  };

  return (
    <aside className={cn(
      "border-r border-slate-700 bg-slate-800 flex flex-col shrink-0 z-10 transition-all duration-300 ease-in-out overflow-hidden",
      isOpen ? "w-64" : "w-0 border-r-0"
    )}>
      <div className={cn("flex-1 overflow-y-auto min-w-64 transition-opacity duration-300", !isOpen && "opacity-0 pointer-events-none")}>
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={allianceBuildings.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {allianceBuildings.map(b => (
                    <BuildingItem
                      key={b.id}
                      building={b}
                      isPlaced={placedBuildingIds.has(b.id)}
                      setActiveDragItem={setActiveDragItem}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* Custom Buildings Section */}
        <div>
          <div className="flex items-center justify-between hover:bg-slate-700 border-y border-slate-700 group/header">
            <button
                onClick={() => setIsCustomOpen(!isCustomOpen)}
                className="flex-1 p-4 flex items-center gap-2 transition-colors text-left"
            >
                {isCustomOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="font-semibold uppercase text-xs tracking-wider text-slate-400">Custom Buildings</span>
            </button>
            {isCustomOpen && (
                <div className="flex gap-1 pr-2 opacity-0 group-hover/header:opacity-100 transition-opacity">
                    <button
                        onClick={() => setSortMode('manual')}
                        className={cn(
                            "p-1.5 rounded text-[10px] uppercase font-bold transition-colors",
                            sortMode === 'manual' ? "bg-blue-600 text-white" : "hover:bg-slate-600 text-slate-400"
                        )}
                        title="Manual Sort"
                    >
                        <GripVertical size={12} />
                    </button>
                    <button
                        onClick={() => setSortMode('name')}
                        className={cn(
                            "p-1.5 rounded text-[10px] uppercase font-bold transition-colors",
                            sortMode === 'name' ? "bg-blue-600 text-white" : "hover:bg-slate-600 text-slate-400"
                        )}
                        title="Sort by Name"
                    >
                        AZ
                    </button>
                    <button
                        onClick={() => setSortMode('power')}
                        className={cn(
                            "p-1.5 rounded text-[10px] uppercase font-bold transition-colors",
                            sortMode === 'power' ? "bg-blue-600 text-white" : "hover:bg-slate-600 text-slate-400"
                        )}
                        title="Sort by Power"
                    >
                        PW
                    </button>
                </div>
            )}
          </div>
          {isCustomOpen && (
            <div className="p-2 space-y-1">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedCustomBuildings.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedCustomBuildings.map(b => (
                    <BuildingItem
                      key={b.id}
                      building={b}
                      isPlaced={placedBuildingIds.has(b.id)}
                      onDelete={() => onDeleteBuilding(b.id)}
                      setActiveDragItem={setActiveDragItem}
                      isSortable={sortMode === 'manual'}
                    />
                  ))}
                </SortableContext>
              </DndContext>
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
  setActiveDragItem: (item: Building | null) => void;
  isSortable?: boolean;
}> = ({ building, isPlaced, onDelete, setActiveDragItem, isSortable = true }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: building.id, disabled: !isSortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group p-3 rounded bg-slate-700/50 border border-slate-600 flex flex-col gap-1 cursor-grab active:cursor-grabbing hover:bg-slate-700 transition-all",
        isPlaced && "opacity-50 grayscale cursor-not-allowed",
        isDragging && "opacity-50"
      )}
      draggable={!isPlaced}
      onDragStart={(e) => {
        if (isPlaced) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', building.id);
        e.dataTransfer.effectAllowed = 'move';

        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);

        setTimeout(() => {
          setActiveDragItem(building);
        }, 0);
      }}
      onDragEnd={() => setActiveDragItem(null)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
            {isSortable && (
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-slate-600 rounded text-slate-500"
                >
                    <GripVertical size={14} />
                </button>
            )}
            <span className="font-medium text-sm truncate">{building.name}</span>
        </div>
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
        {!building.isBase && <span>Power: {building.power.toLocaleString()}</span>}
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
        <div className="p-4 space-y-4">
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
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">Power</label>
              <input
                type="number"
                value={power}
                onChange={e => setPower(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">Width</label>
              <input
                type="number"
                value={width}
                onChange={e => setWidth(Number(e.target.value))}
                min="1"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">Height</label>
              <input
                type="number"
                value={height}
                onChange={e => setHeight(Number(e.target.value))}
                min="1"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">Color</label>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-full h-10 bg-slate-900 border border-slate-700 rounded cursor-pointer"
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
