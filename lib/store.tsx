import { create } from "zustand"
import type { TileDefinition } from "./tile-parser"

export type Tool = "paint" | "erase" | "move" | "fill" | "eyedropper"

export type TilesetType = "foreground" | "background" | "entities"

export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  tiles: Record<string, string> // key: "x,y", value: tileName
  tilesetType: TilesetType
}

interface EditorState {
  tool: Tool
  gridVisible: boolean
  layers: Layer[]
  activeLayerId: string
  currentTilesetType: TilesetType
  tileDefinitions: Map<string, TileDefinition>
  history: Layer[][]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean

  setTool: (tool: Tool) => void
  toggleGrid: () => void
  setActiveLayer: (layerId: string) => void
  toggleLayerVisibility: (layerId: string) => void
  toggleLayerLock: (layerId: string) => void
  addLayer: () => void
  removeLayer: (layerId: string) => void
  placeTile: (x: number, y: number, tileName: string) => void
  eraseTile: (x: number, y: number) => void
  setTileDefinitions: (tiles: TileDefinition[]) => void
  newMap: () => void // Added newMap function
  saveMap: () => void
  loadMap: () => void
  exportPNG: () => void
  undo: () => void
  redo: () => void
}

const defaultLayers: Layer[] = [
  { id: "1", name: "Background", visible: true, locked: false, opacity: 1, tiles: {}, tilesetType: "background" },
  { id: "2", name: "Foreground", visible: true, locked: false, opacity: 1, tiles: {}, tilesetType: "foreground" },
  { id: "3", name: "Entities", visible: true, locked: false, opacity: 1, tiles: {}, tilesetType: "entities" },
]

export const useEditorStore = create<EditorState>((set, get) => ({
  tool: "paint",
  gridVisible: true,
  layers: defaultLayers,
  activeLayerId: "2",
  currentTilesetType: "foreground",
  tileDefinitions: new Map(),
  history: [defaultLayers],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,

  setTool: (tool) => set({ tool }),

  toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),

  setActiveLayer: (layerId) =>
    set((state) => {
      const layer = state.layers.find((l) => l.id === layerId)
      return {
        activeLayerId: layerId,
        currentTilesetType: layer?.tilesetType || "foreground",
      }
    }),

  toggleLayerVisibility: (layerId) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)),
    })),

  toggleLayerLock: (layerId) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === layerId ? { ...layer, locked: !layer.locked } : layer)),
    })),

  addLayer: () =>
    set((state) => {
      const newId = String(Math.max(...state.layers.map((l) => Number(l.id))) + 1)
      return {
        layers: [
          ...state.layers,
          {
            id: newId,
            name: `Layer ${newId}`,
            visible: true,
            locked: false,
            opacity: 1,
            tiles: {},
            tilesetType: "foreground",
          },
        ],
        activeLayerId: newId,
      }
    }),

  removeLayer: (layerId) =>
    set((state) => {
      const newLayers = state.layers.filter((l) => l.id !== layerId)
      return {
        layers: newLayers,
        activeLayerId: state.activeLayerId === layerId ? newLayers[0]?.id : state.activeLayerId,
      }
    }),

  placeTile: (x, y, tileName) =>
    set((state) => {
      const activeLayer = state.layers.find((l) => l.id === state.activeLayerId)
      if (!activeLayer || activeLayer.locked) return state

      const key = `${x},${y}`
      const newLayers = state.layers.map((layer) =>
        layer.id === state.activeLayerId ? { ...layer, tiles: { ...layer.tiles, [key]: tileName } } : layer,
      )

      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(newLayers)

      return {
        layers: newLayers,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        canUndo: true,
        canRedo: false,
      }
    }),

  eraseTile: (x, y) =>
    set((state) => {
      const activeLayer = state.layers.find((l) => l.id === state.activeLayerId)
      if (!activeLayer || activeLayer.locked) return state

      const key = `${x},${y}`
      const newTiles = { ...activeLayer.tiles }
      delete newTiles[key]

      const newLayers = state.layers.map((layer) =>
        layer.id === state.activeLayerId ? { ...layer, tiles: newTiles } : layer,
      )

      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(newLayers)

      return {
        layers: newLayers,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        canUndo: true,
        canRedo: false,
      }
    }),

  setTileDefinitions: (tiles) =>
    set((state) => {
      const newMap = new Map(state.tileDefinitions)
      tiles.forEach((tile) => {
        newMap.set(tile.name, tile)
      })
      return { tileDefinitions: newMap }
    }),

  newMap: () => {
    if (confirm("Create a new map? Any unsaved changes will be lost.")) {
      set({
        layers: defaultLayers,
        activeLayerId: "2",
        currentTilesetType: "foreground",
        history: [defaultLayers],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
      })
    }
  },
  // </CHANGE>

  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0) return state
      const newIndex = state.historyIndex - 1
      return {
        layers: state.history[newIndex],
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
      }
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state
      const newIndex = state.historyIndex + 1
      return {
        layers: state.history[newIndex],
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < state.history.length - 1,
      }
    }),

  saveMap: () => {
    const state = get()
    const mapData = {
      layers: state.layers,
      version: "1.0",
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem("tilemap-save", JSON.stringify(mapData))

    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tilemap-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  },

  loadMap: () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          set({
            layers: data.layers,
            activeLayerId: data.layers[0]?.id || "1",
          })
        } catch (error) {
          console.error("Failed to load map:", error)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  },

  exportPNG: () => {
    // This would render all visible layers to a canvas and export as PNG
    console.log("Export PNG functionality would be implemented here")
  },
}))
