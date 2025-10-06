"use client"

import { Eye, EyeOff, Lock, Unlock, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/lib/store"

export function LayerPanel() {
  const { layers, activeLayerId, setActiveLayer, toggleLayerVisibility, toggleLayerLock, addLayer, removeLayer } =
    useEditorStore()

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#2a2a34] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#00ffff]">Layers</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={addLayer}
            className="h-8 w-8 p-0 text-[#e0e0e0] hover:bg-[#2a2a34] hover:text-[#00ffff]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {layers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className={`mb-2 cursor-pointer rounded border-2 p-3 transition-all ${
              activeLayerId === layer.id
                ? "border-[#00ffff] bg-[#00ffff]/10"
                : "border-[#2a2a34] bg-[#0a0a0f] hover:border-[#00ffff]/50"
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-[#e0e0e0]">{layer.name}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLayerVisibility(layer.id)
                  }}
                  className="rounded p-1 text-[#808090] hover:bg-[#2a2a34] hover:text-[#00ffff]"
                >
                  {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLayerLock(layer.id)
                  }}
                  className="rounded p-1 text-[#808090] hover:bg-[#2a2a34] hover:text-[#00ffff]"
                >
                  {layer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </button>
                {layers.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeLayer(layer.id)
                    }}
                    className="rounded p-1 text-[#808090] hover:bg-[#2a2a34] hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="text-xs text-[#808090]">Opacity: {Math.round(layer.opacity * 100)}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}
