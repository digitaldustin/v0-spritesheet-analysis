"use client"

import { Save, FolderOpen, Download, Undo2, Redo2, FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/lib/store"

export function TopBar() {
  const { newMap, saveMap, loadMap, exportPNG, undo, redo, canUndo, canRedo } = useEditorStore()

  return (
    <div className="flex h-14 items-center justify-between border-b border-[#2a2a34] bg-[#1a1a24] px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-[#00ffff]">Tile Map Editor</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className="text-[#e0e0e0] hover:bg-[#2a2a34] hover:text-[#00ffff] disabled:opacity-30"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className="text-[#e0e0e0] hover:bg-[#2a2a34] hover:text-[#00ffff] disabled:opacity-30"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-[#2a2a34]" />

        <Button
          variant="ghost"
          size="sm"
          onClick={newMap}
          className="text-[#e0e0e0] hover:bg-[#2a2a34] hover:text-[#00ffff]"
        >
          <FilePlus className="mr-2 h-4 w-4" />
          New Map
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={saveMap}
          className="text-[#e0e0e0] hover:bg-[#2a2a34] hover:text-[#00ffff]"
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadMap}
          className="text-[#e0e0e0] hover:bg-[#2a2a34] hover:text-[#00ffff]"
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Load
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={exportPNG}
          className="text-[#e0e0e0] hover:bg-[#2a2a34] hover:text-[#00ffff]"
        >
          <Download className="mr-2 h-4 w-4" />
          Export PNG
        </Button>
      </div>
    </div>
  )
}
