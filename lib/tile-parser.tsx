export interface TileDefinition {
  name: string
  x: number
  y: number
  width: number
  height: number
  imageUrl: string
}

const TILE_ATLAS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<TextureAtlas imagePath="spritesheet-tiles-default.png">
	<SubTexture name="block_blue" x="0" y="0" width="64" height="64"/>
	<SubTexture name="terrain_grass_block_top" x="448" y="960" width="64" height="64"/>
	<SubTexture name="terrain_grass_block_center" x="512" y="0" width="64" height="64"/>
	<SubTexture name="terrain_dirt_block_top" x="576" y="448" width="64" height="64"/>
	<SubTexture name="terrain_dirt_block_center" x="576" y="640" width="64" height="64"/>
	<SubTexture name="terrain_sand_block_top" x="256" y="832" width="64" height="64"/>
	<SubTexture name="terrain_sand_block_center" x="256" y="1024" width="64" height="64"/>
	<SubTexture name="terrain_stone_block_top" x="64" y="704" width="64" height="64"/>
	<SubTexture name="terrain_stone_block_center" x="64" y="896" width="64" height="64"/>
	<SubTexture name="coin_gold" x="960" y="512" width="64" height="64"/>
	<SubTexture name="gem_blue" x="896" y="320" width="64" height="64"/>
	<SubTexture name="heart" x="832" y="1088" width="64" height="64"/>
	<SubTexture name="key_blue" x="768" y="64" width="64" height="64"/>
	<SubTexture name="door_closed" x="960" y="192" width="64" height="64"/>
	<SubTexture name="spikes" x="640" y="512" width="64" height="64"/>
	<SubTexture name="ladder_middle" x="704" y="896" width="64" height="64"/>
</TextureAtlas>`

const BACKGROUND_ATLAS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<TextureAtlas imagePath="spritesheet-backgrounds-default.png">
	<SubTexture name="background_solid_sky" x="0" y="0" width="256" height="256"/>
	<SubTexture name="background_solid_grass" x="0" y="512" width="256" height="256"/>
	<SubTexture name="background_solid_sand" x="0" y="256" width="256" height="256"/>
	<SubTexture name="background_solid_dirt" x="0" y="768" width="256" height="256"/>
	<SubTexture name="background_color_desert" x="768" y="0" width="256" height="256"/>
	<SubTexture name="background_color_hills" x="512" y="768" width="256" height="256"/>
	<SubTexture name="background_fade_desert" x="512" y="0" width="256" height="256"/>
	<SubTexture name="background_fade_hills" x="256" y="768" width="256" height="256"/>
</TextureAtlas>`

const ENEMIES_ATLAS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<TextureAtlas imagePath="spritesheet-enemies-default.png">
	<SubTexture name="enemy_slime_purple" x="0" y="0" width="64" height="64"/>
	<SubTexture name="enemy_snail" x="64" y="64" width="64" height="64"/>
	<SubTexture name="enemy_frog" x="320" y="64" width="64" height="64"/>
	<SubTexture name="enemy_bee" x="192" y="320" width="64" height="64"/>
	<SubTexture name="enemy_fish_blue" x="384" y="192" width="64" height="64"/>
	<SubTexture name="enemy_fish_orange" x="320" y="320" width="64" height="64"/>
	<SubTexture name="enemy_ladybug" x="256" y="192" width="64" height="64"/>
</TextureAtlas>`

const TILE_SPRITESHEET_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/spritesheet-tiles-MjZuROrjqggCsGsGmkrmZ6Zb4kNw3x.png"
const BACKGROUND_SPRITESHEET_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/spritesheet-backgrounds-fTTSCoauhlLCbqkg8tFHBPbB9zAMP5.png"
const ENEMIES_SPRITESHEET_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/spritesheet-enemies-qXmbSOoPGZI42HosNWaIKvQpgWI1Tb.png"

async function parseAtlas(xmlString: string, spritesheetUrl: string): Promise<TileDefinition[]> {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, "text/xml")

  const subTextures = xmlDoc.getElementsByTagName("SubTexture")
  const tiles: TileDefinition[] = []

  const img = new Image()
  img.crossOrigin = "anonymous"
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = spritesheetUrl
  })

  for (let i = 0; i < subTextures.length; i++) {
    const subTexture = subTextures[i]
    const name = subTexture.getAttribute("name") || ""
    const x = Number.parseInt(subTexture.getAttribute("x") || "0")
    const y = Number.parseInt(subTexture.getAttribute("y") || "0")
    const width = Number.parseInt(subTexture.getAttribute("width") || "64")
    const height = Number.parseInt(subTexture.getAttribute("height") || "64")

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")

    if (ctx) {
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height)

      tiles.push({
        name,
        x,
        y,
        width,
        height,
        imageUrl: canvas.toDataURL(),
      })
    }
  }

  return tiles
}

export async function parseTileAtlas(): Promise<TileDefinition[]> {
  return parseAtlas(TILE_ATLAS_XML, TILE_SPRITESHEET_URL)
}

export async function parseBackgroundAtlas(): Promise<TileDefinition[]> {
  return parseAtlas(BACKGROUND_ATLAS_XML, BACKGROUND_SPRITESHEET_URL)
}

export async function parseEnemyAtlas(): Promise<TileDefinition[]> {
  return parseAtlas(ENEMIES_ATLAS_XML, ENEMIES_SPRITESHEET_URL)
}

export function createEntityMarkers(): TileDefinition[] {
  const markers = [
    { name: "start-marker", color: "#00ff00", label: "S" },
    { name: "end-marker", color: "#ff0000", label: "E" },
    { name: "enemy-marker", color: "#ff00ff", label: "!" },
  ]

  return markers.map((marker) => {
    const canvas = document.createElement("canvas")
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext("2d")

    if (ctx) {
      // Draw marker background
      ctx.fillStyle = marker.color
      ctx.beginPath()
      ctx.arc(32, 32, 28, 0, Math.PI * 2)
      ctx.fill()

      // Draw border
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw label
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 32px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(marker.label, 32, 32)
    }

    return {
      name: marker.name,
      x: 0,
      y: 0,
      width: 64,
      height: 64,
      imageUrl: canvas.toDataURL(),
    }
  })
}
