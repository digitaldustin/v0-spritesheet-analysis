"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useEditorStore } from "@/lib/store"

interface TileCanvasProps {
  selectedTile: string | null
}

const FOREGROUND_GRID_SIZE = 64 // Matches 64x64 tiles
const BACKGROUND_GRID_SIZE = 256 // Matches 256x256 background tiles
const ENTITY_GRID_SIZE = 64 // Entities use same grid as foreground

export function TileCanvas({ selectedTile }: TileCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [ghostTile, setGhostTile] = useState<{ x: number; y: number } | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const { tool, gridVisible, layers, activeLayerId, placeTile, eraseTile, tileDefinitions } = useEditorStore()

  const getGridSize = (layerId: string) => {
    const layer = layers.find((l) => l.id === layerId)
    if (!layer) return FOREGROUND_GRID_SIZE

    switch (layer.tilesetType) {
      case "background":
        return BACKGROUND_GRID_SIZE
      case "entities":
        return ENTITY_GRID_SIZE
      default:
        return FOREGROUND_GRID_SIZE
    }
  }

  const activeLayer = layers.find((l) => l.id === activeLayerId)
  const currentGridSize = activeLayer ? getGridSize(activeLayerId) : FOREGROUND_GRID_SIZE

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    ctx.fillStyle = "#0a0a0f"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    if (gridVisible) {
      ctx.strokeStyle = "#2a2a34"
      ctx.lineWidth = 1 / zoom

      const startX = Math.floor(-pan.x / zoom / currentGridSize) * currentGridSize
      const startY = Math.floor(-pan.y / zoom / currentGridSize) * currentGridSize
      const endX = startX + canvas.width / zoom + currentGridSize
      const endY = startY + canvas.height / zoom + currentGridSize

      for (let x = startX; x < endX; x += currentGridSize) {
        ctx.beginPath()
        ctx.moveTo(x, startY)
        ctx.lineTo(x, endY)
        ctx.stroke()
      }

      for (let y = startY; y < endY; y += currentGridSize) {
        ctx.beginPath()
        ctx.moveTo(startX, y)
        ctx.lineTo(endX, y)
        ctx.stroke()
      }
    }

    layers.forEach((layer) => {
      if (!layer.visible) return

      ctx.globalAlpha = layer.opacity
      const layerGridSize = getGridSize(layer.id)

      Object.entries(layer.tiles).forEach(([key, tileName]) => {
        const [x, y] = key.split(",").map(Number)
        const tileDef = tileDefinitions.get(tileName)

        if (tileDef && tileDef.imageUrl) {
          const img = new Image()
          img.src = tileDef.imageUrl
          ctx.drawImage(img, x * layerGridSize, y * layerGridSize, layerGridSize, layerGridSize)
        } else {
          ctx.fillStyle = activeLayerId === layer.id ? "#00ffff" : "#808090"
          ctx.fillRect(x * layerGridSize, y * layerGridSize, layerGridSize, layerGridSize)
        }
      })
    })

    ctx.globalAlpha = 1

    if (ghostTile && selectedTile && tool === "paint") {
      const tileDef = tileDefinitions.get(selectedTile)

      if (tileDef && tileDef.imageUrl) {
        ctx.globalAlpha = 0.5
        const img = new Image()
        img.src = tileDef.imageUrl
        ctx.drawImage(
          img,
          ghostTile.x * currentGridSize,
          ghostTile.y * currentGridSize,
          currentGridSize,
          currentGridSize,
        )
        ctx.globalAlpha = 1
      }

      ctx.strokeStyle = "#00ffff"
      ctx.lineWidth = 2 / zoom
      ctx.strokeRect(ghostTile.x * currentGridSize, ghostTile.y * currentGridSize, currentGridSize, currentGridSize)
    }

    ctx.restore()
  }, [zoom, pan, gridVisible, layers, activeLayerId, ghostTile, selectedTile, tool, tileDefinitions, currentGridSize])

  const getGridPosition = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left - pan.x) / zoom
    const y = (clientY - rect.top - pan.y) / zoom

    return {
      x: Math.floor(x / currentGridSize),
      y: Math.floor(y / currentGridSize),
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && tool === "move")) {
      setIsPanning(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
    } else if (e.button === 0 && tool === "paint" && selectedTile) {
      setIsDrawing(true)
      const pos = getGridPosition(e.clientX, e.clientY)
      placeTile(pos.x, pos.y, selectedTile)
    } else if (e.button === 2 || (e.button === 0 && tool === "erase")) {
      setIsDrawing(true)
      const pos = getGridPosition(e.clientX, e.clientY)
      eraseTile(pos.x, pos.y)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x
      const dy = e.clientY - lastMousePos.y
      setPan({ x: pan.x + dx, y: pan.y + dy })
      setLastMousePos({ x: e.clientX, y: e.clientY })
    } else if (isDrawing) {
      const pos = getGridPosition(e.clientX, e.clientY)
      if (tool === "paint" && selectedTile) {
        placeTile(pos.x, pos.y, selectedTile)
      } else if (tool === "erase") {
        eraseTile(pos.x, pos.y)
      }
    } else {
      const pos = getGridPosition(e.clientX, e.clientY)
      setGhostTile(pos)
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setIsDrawing(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(Math.max(0.1, Math.min(5, zoom * delta)))
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsPanning(false)
        setIsDrawing(false)
        setGhostTile(null)
      }}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      className="h-full w-full cursor-crosshair"
    />
  )
}
