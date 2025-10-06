"use client"

import { Paintbrush, Eraser, Move, Droplet, Pipette, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/lib/store"

interface ToolbarProps {
  selectedTile: string | null
}

export function Toolbar({ selectedTile }: ToolbarProps) {
  const { tool, setTool, gridVisible, toggleGrid } = useEditorStore()

  const tools = [
    { id: "paint" as const, icon: Paintbrush, label: "Paint (P)" },
    { id: "erase" as const, icon: Eraser, label: "Erase (E)" },
    { id: "move" as const, icon: Move, label: "Move (M)" },
    { id: "fill" as const, icon: Droplet, label: "Fill (F)" },
    { id: "eyedropper" as const, icon: Pipette, label: "Eyedropper (I)" },
  ]

  return (
    <div className="flex h-12 items-center justify-between border-b border-[#2a2a34] bg-[#1a1a24] px-4">
      <div className="flex items-center gap-1">
        {tools.map((t) => (
          <Button
            key={t.id}
            variant="ghost"
            size="sm"
            onClick={() => setTool(t.id)}
            className={`${
              tool === t.id
                ? "bg-[#00ffff]/20 text-[#00ffff]"
                : "text-[#e0e0e0] hover:bg-[#2a2a34] hover:text-[#00ffff]"
            }`}
            title={t.label}
          >
            <t.icon className="h-4 w-4" />
          </Button>
        ))}

        <div className="mx-2 h-6 w-px bg-[#2a2a34]" />

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleGrid}
          className={`${
            gridVisible ? "bg-[#00ffff]/20 text-[#00ffff]" : "text-[#e0e0e0] hover:bg-[#2a2a34] hover:text-[#00ffff]"
          }`}
          title="Toggle Grid (G)"
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>
      </div>

      {selectedTile && (
        <div className="flex items-center gap-2 text-sm text-[#808090]">
          <span>Selected:</span>
          <span className="text-[#00ffff]">{selectedTile}</span>
        </div>
      )}
    </div>
  )
}
