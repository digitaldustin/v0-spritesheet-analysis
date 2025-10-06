"use client"

import { useState } from "react"
import { TileCanvas } from "./tile-canvas"
import { TilePalette } from "./tile-palette"
import { LayerPanel } from "./layer-panel"
import { Toolbar } from "./toolbar"
import { TopBar } from "./top-bar"

export function TileMapEditor() {
  const [selectedTile, setSelectedTile] = useState<string | null>(null)

  return (
    <div className="flex h-full flex-col">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Tile Palette */}
        <div className="w-80 border-r border-[#2a2a34] bg-[#1a1a24]">
          <TilePalette onSelectTile={setSelectedTile} selectedTile={selectedTile} />
        </div>

        {/* Center - Canvas */}
        <div className="flex flex-1 flex-col">
          <Toolbar selectedTile={selectedTile} />
          <TileCanvas selectedTile={selectedTile} />
        </div>

        {/* Right Panel - Layers */}
        <div className="w-64 border-l border-[#2a2a34] bg-[#1a1a24]">
          <LayerPanel />
        </div>
      </div>
    </div>
  )
}
