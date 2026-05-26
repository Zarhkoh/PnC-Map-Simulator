import { useState, useRef } from 'react'
import { Map } from './components/Map'
import { Sidebar } from './components/Sidebar'
import { Building, INITIAL_BUILDINGS, PlacedBuilding } from './types'
import { X, Download, Upload, Settings, PanelLeftOpen, PanelLeftClose } from 'lucide-react'

function App() {
  const [gridSize, setGridSize] = useState(50)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS)
  const [placedBuildings, setPlacedBuildings] = useState<PlacedBuilding[]>([])
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, building: PlacedBuilding } | null>(null)
  const [editingBuilding, setEditingBuilding] = useState<PlacedBuilding | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [activeDragItem, setActiveDragItem] = useState<Building | PlacedBuilding | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddBuilding = (building: Omit<Building, 'id'>) => {
    const newBuilding: Building = {
      ...building,
      id: `custom-${crypto.randomUUID()}`,
    }
    setBuildings(prev => [...prev, newBuilding])
  }

  const handleUpdateBuilding = (id: string, updates: Partial<Building>) => {
    setBuildings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
    setPlacedBuildings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }

  const handleDeleteBuilding = (id: string) => {
    setBuildings(prev => prev.filter(b => b.id !== id))
    setPlacedBuildings(prev => prev.filter(b => b.id !== id))
  }

  const handlePlaceBuilding = (building: PlacedBuilding) => {
    setPlacedBuildings(prev => [...prev, building])
  }

  const handleReorderBuildings = (newBuildings: Building[]) => {
    setBuildings(newBuildings);
  }

  const handleMoveBuildings = (ids: string[], dx: number, dy: number) => {
    const toMove = placedBuildings.filter(b => ids.includes(b.id));
    const canMove = toMove.every(b => !isOccupied(b.x + dx, b.y + dy, b.width, b.height, ids));

    if (canMove) {
      setPlacedBuildings(prev => prev.map(b =>
        ids.includes(b.id) ? { ...b, x: b.x + dx, y: b.y + dy } : b
      ));
    }
  }

  const handleDuplicate = (b: PlacedBuilding) => {
    const newBuilding: PlacedBuilding = {
      ...b,
      id: `custom-${crypto.randomUUID()}`,
      x: b.x + 1,
      y: b.y + 1,
    }
    if (!isOccupied(newBuilding.x, newBuilding.y, newBuilding.width, newBuilding.height)) {
        setPlacedBuildings(prev => [...prev, newBuilding]);
    }
    setContextMenu(null);
  }

  const isOccupied = (x: number, y: number, width: number, height: number, excludeId?: string | string[]) => {
    if (x < 0 || y < 0 || x + width > gridSize || y + height > gridSize) return true;
    const excludeIds = Array.isArray(excludeId) ? excludeId : (excludeId ? [excludeId] : []);
    return placedBuildings.some(b => {
      if (excludeIds.includes(b.id)) return false;
      return (
        x < b.x + b.width &&
        x + width > b.x &&
        y < b.y + b.height &&
        y + height > b.y
      );
    });
  };

  const exportData = () => {
    const data = {
      gridSize,
      keeps: buildings.filter(b => !b.isBase),
      placedBuildings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hive-map-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target?.result as string);
            if (data.gridSize) setGridSize(data.gridSize);
            const customBuildings = data.keeps || data.buildings || [];
            setBuildings([...INITIAL_BUILDINGS, ...customBuildings]);
            if (data.placedBuildings) setPlacedBuildings(data.placedBuildings);
        } catch (err) {
            alert('Invalid JSON file');
        }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const placedBuildingIds = new Set(placedBuildings.map(b => b.id))

  return (
    <div
      className="fixed inset-0 bg-slate-900 text-white flex flex-col overflow-hidden"
      onClick={() => setContextMenu(null)}
    >
      <header className="h-12 border-b border-slate-700 flex items-center px-4 bg-slate-800 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 transition-colors"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <h1 className="font-bold text-lg tracking-tight italic">HIVE<span className="text-blue-500">MAP</span></h1>
        </div>
        <div className="ml-auto flex gap-2">
           <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 transition-colors"
            title="Settings"
           >
            <Settings size={18} />
           </button>
           <div className="w-px h-6 bg-slate-700 mx-1" />
           <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium transition-colors"
            >
                <Upload size={14} /> IMPORT
           </button>
           <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
           <button
                onClick={exportData}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition-colors"
            >
                <Download size={14} /> EXPORT
           </button>
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          buildings={buildings}
          onAddBuilding={handleAddBuilding}
          onUpdateBuilding={handleUpdateBuilding}
          onDeleteBuilding={handleDeleteBuilding}
          placedBuildingIds={placedBuildingIds}
          setActiveDragItem={setActiveDragItem}
          onReorderBuildings={handleReorderBuildings}
        />
        <div className="flex-1 relative bg-slate-950">
           <Map
            gridSize={gridSize}
            placedBuildings={placedBuildings}
            onPlaceBuilding={handlePlaceBuilding}
            onMoveBuildings={handleMoveBuildings}
            selectedBuildingIds={selectedBuildingIds}
            setSelectedBuildingIds={setSelectedBuildingIds}
            onContextMenu={(e, building) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, building });
            }}
            allBuildings={buildings}
            activeDragItem={activeDragItem}
            setActiveDragItem={setActiveDragItem}
            isOccupied={isOccupied}
           />
        </div>
      </main>

      {contextMenu && (
        <div
            className="fixed bg-slate-800 border border-slate-700 rounded shadow-xl py-1 z-50 min-w-[140px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
        >
            {!contextMenu.building.isBase && (
              <>
                <button
                    className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm"
                    onClick={() => {
                        setEditingBuilding(contextMenu.building);
                        setContextMenu(null);
                    }}
                >
                    Modify
                </button>
                <button
                    className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm"
                    onClick={() => handleDuplicate(contextMenu.building)}
                >
                    Duplicate
                </button>
              </>
            )}
            <button
                className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm text-red-400 border-t border-slate-700 mt-1"
                onClick={() => {
                    setPlacedBuildings(prev => prev.filter(pb => pb.id !== contextMenu.building.id));
                    setContextMenu(null);
                }}
            >
                Remove
            </button>
        </div>
      )}

      {editingBuilding && (
        <EditBuildingForm
            building={editingBuilding}
            onClose={() => setEditingBuilding(null)}
            onSubmit={(updates) => {
                handleUpdateBuilding(editingBuilding.id, updates);
                setEditingBuilding(null);
            }}
        />
      )}

      {showSettings && (
        <SettingsModal
            gridSize={gridSize}
            onClose={() => setShowSettings(false)}
            onSave={(newSize) => {
                setGridSize(newSize);
                setShowSettings(false);
            }}
        />
      )}
    </div>
  )
}

const SettingsModal: React.FC<{
    gridSize: number;
    onClose: () => void;
    onSave: (size: number) => void;
}> = ({ gridSize, onClose, onSave }) => {
    const [size, setSize] = useState(gridSize);
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Settings</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase">Grid Size (East-West / North-South)</label>
                        <input
                            type="number"
                            value={size}
                            onChange={e => setSize(Number(e.target.value))}
                            min="10"
                            max="200"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        />
                        <p className="text-[10px] text-slate-500 italic mt-1">Note: Expanding happens towards the East.</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-700/30 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 hover:bg-slate-700 rounded transition-colors text-sm font-medium">Cancel</button>
                    <button
                        onClick={() => onSave(size)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold transition-colors text-sm"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditBuildingForm: React.FC<{
    building: PlacedBuilding;
    onClose: () => void;
    onSubmit: (data: Partial<Building>) => void
  }> = ({ building, onClose, onSubmit }) => {
    const [name, setName] = useState(building.name);
    const [power, setPower] = useState(building.power);
    const [width, setWidth] = useState(building.width);
    const [height, setHeight] = useState(building.height);
    const [color, setColor] = useState(building.color);

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-lg">Modify {building.name}</h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded"><X size={20}/></button>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">Building Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
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
            <button onClick={onClose} className="px-4 py-2 hover:bg-slate-700 rounded transition-colors text-sm font-medium">Cancel</button>
            <button
              onClick={() => onSubmit({ name, power, width, height, color })}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold transition-colors text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

export default App
