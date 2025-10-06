"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  parseTileAtlas,
  parseBackgroundAtlas,
  parseEnemyAtlas,
  createEntityMarkers,
  type TileDefinition,
} from "@/lib/tile-parser"
import { useEditorStore } from "@/lib/store"

interface TilePaletteProps {
  onSelectTile: (tileName: string) => void
  selectedTile: string | null
}

export function TilePalette({ onSelectTile, selectedTile }: TilePaletteProps) {
  const [tiles, setTiles] = useState<TileDefinition[]>([])
  const [search, setSearch] = useState("")
  const [hoveredTile, setHoveredTile] = useState<string | null>(null)
  const currentTilesetType = useEditorStore((state) => state.currentTilesetType)
  const setTileDefinitions = useEditorStore((state) => state.setTileDefinitions)

  useEffect(() => {
    async function loadTiles() {
      let loadedTiles: TileDefinition[] = []

      if (currentTilesetType === "foreground") {
        loadedTiles = await parseTileAtlas()
      } else if (currentTilesetType === "background") {
        loadedTiles = await parseBackgroundAtlas()
      } else if (currentTilesetType === "entities") {
        const enemies = await parseEnemyAtlas()
        const markers = createEntityMarkers()
        loadedTiles = [...markers, ...enemies]
      }

      setTiles(loadedTiles)
      setTileDefinitions(loadedTiles)
    }

    loadTiles()
  }, [currentTilesetType, setTileDefinitions])

  const filteredTiles = tiles.filter((tile) => tile.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#2a2a34] p-4">
        <h2 className="mb-3 text-lg font-semibold text-[#00ffff]">
          Tile Palette
          <span className="ml-2 text-sm text-[#808090]">
            (
            {currentTilesetType === "foreground"
              ? "Terrain"
              : currentTilesetType === "background"
                ? "Backgrounds"
                : "Entities"}
            )
          </span>
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#808090]" />
          <Input
            type="text"
            placeholder="Search tiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-[#2a2a34] bg-[#0a0a0f] pl-10 text-[#e0e0e0] placeholder:text-[#808090] focus:border-[#00ffff]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-4 gap-2">
          {filteredTiles.map((tile) => (
            <button
              key={tile.name}
              onClick={() => onSelectTile(tile.name)}
              onMouseEnter={() => setHoveredTile(tile.name)}
              onMouseLeave={() => setHoveredTile(null)}
              className={`relative aspect-square overflow-hidden rounded border-2 transition-all ${
                selectedTile === tile.name
                  ? "border-[#00ffff] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                  : hoveredTile === tile.name
                    ? "border-[#00ffff]/50"
                    : "border-[#2a2a34]"
              } bg-[#0a0a0f] hover:scale-105`}
              title={tile.name}
            >
              <img src={tile.imageUrl || "/placeholder.svg"} alt={tile.name} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
