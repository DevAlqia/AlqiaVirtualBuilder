import { useMemo } from 'react'
import * as THREE from 'three'

type FloorMaterial =
  | 'concrete' | 'wood' | 'polished' | 'marble' | 'expo' | 'showroom'
  | 'medical' | 'painted_concrete' | 'dark_showroom' | 'dark_concrete' | 'dark_wood'
  | 'grass' | 'grass_dark' | 'adoquin' | 'patio_stone' | 'tierra'
  | 'terracota' | 'deck_madera' | 'arena' | 'concreto_ext'

interface MatDef { color: string; roughness: number; metalness: number }

// Un solo mapa de colores — el color REAL del material siempre.
// La apariencia oscura en modo dark viene de la iluminación de la escena, no del color del piso.
const FLOOR_MATS: Record<FloorMaterial, MatDef> = {
  concrete:         { color: '#C8CED8', roughness: 0.88, metalness: 0.02 },
  wood:             { color: '#C8A878', roughness: 0.68, metalness: 0.0  },
  polished:         { color: '#D8E0EC', roughness: 0.12, metalness: 0.50 },
  marble:           { color: '#E8ECF2', roughness: 0.10, metalness: 0.06 },
  expo:             { color: '#C4C8D0', roughness: 0.52, metalness: 0.18 },
  showroom:         { color: '#D8DCE8', roughness: 0.08, metalness: 0.60 },
  medical:          { color: '#E0E8F0', roughness: 0.25, metalness: 0.02 },
  painted_concrete: { color: '#C8D0D8', roughness: 0.80, metalness: 0.02 },
  dark_showroom:    { color: '#111520', roughness: 0.10, metalness: 0.60 },
  dark_concrete:    { color: '#282E38', roughness: 0.90, metalness: 0.02 },
  dark_wood:        { color: '#4A3020', roughness: 0.72, metalness: 0.00 },
  // exteriores
  grass:            { color: '#4A8A3A', roughness: 0.98, metalness: 0.00 },
  grass_dark:       { color: '#2E5A22', roughness: 0.98, metalness: 0.00 },
  adoquin:          { color: '#A09888', roughness: 0.94, metalness: 0.00 },
  patio_stone:      { color: '#988878', roughness: 0.95, metalness: 0.00 },
  tierra:           { color: '#7A5A3A', roughness: 0.98, metalness: 0.00 },
  terracota:        { color: '#C8784A', roughness: 0.82, metalness: 0.00 },
  deck_madera:      { color: '#9A6A30', roughness: 0.75, metalness: 0.00 },
  arena:            { color: '#D8C89A', roughness: 0.98, metalness: 0.00 },
  concreto_ext:     { color: '#B8BEC8', roughness: 0.92, metalness: 0.02 },
}

// ─── Generadores de texturas canvas ──────────────────────────────────────────

function makeGrassTexture(dark: boolean): THREE.CanvasTexture {
  const s = 256
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = dark ? '#1E4810' : '#3A7228'
  ctx.fillRect(0, 0, s, s)
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * s
    const y = Math.random() * s
    const bright = Math.random() > 0.5
    ctx.fillStyle = dark
      ? (bright ? '#2A6018' : '#143808')
      : (bright ? '#58A040' : '#2A5818')
    ctx.fillRect(x, y, 1 + Math.random() * 2, 4 + Math.random() * 8)
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(6, 6)
  return t
}

function makeAdoquinTexture(baseColor: string, mortarColor: string): THREE.CanvasTexture {
  const s = 256
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = mortarColor
  ctx.fillRect(0, 0, s, s)
  const bW = 52, bH = 28, gap = 5
  for (let row = 0; row * (bH + gap) < s + bH; row++) {
    const off = row % 2 === 0 ? 0 : (bW + gap) / 2
    for (let col = -1; col * (bW + gap) < s + bW; col++) {
      const x = col * (bW + gap) + off + gap * 0.5
      const y = row * (bH + gap) + gap * 0.5
      const v = Math.floor((Math.random() - 0.5) * 22)
      const c = parseInt(baseColor.slice(1), 16)
      const r = Math.min(255, Math.max(0, ((c >> 16) & 0xff) + v))
      const g = Math.min(255, Math.max(0, ((c >> 8) & 0xff) + v))
      const b = Math.min(255, Math.max(0, (c & 0xff) + v))
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(x, y, bW, bH)
    }
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 4)
  return t
}

function makeStoneTexture(baseColor: string, jointColor: string): THREE.CanvasTexture {
  const s = 256
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = jointColor
  ctx.fillRect(0, 0, s, s)
  const stones = [
    [0, 0, 80, 50], [85, 0, 60, 50], [150, 0, 55, 50], [210, 0, 46, 50],
    [0, 55, 55, 45], [60, 55, 75, 45], [140, 55, 50, 45], [195, 55, 61, 45],
    [0, 105, 90, 50], [95, 105, 45, 50], [145, 105, 65, 50], [215, 105, 41, 50],
    [0, 160, 60, 48], [65, 160, 80, 48], [150, 160, 55, 48], [210, 160, 46, 48],
    [0, 213, 70, 43], [75, 213, 50, 43], [130, 213, 65, 43], [200, 213, 56, 43],
  ]
  const c = parseInt(baseColor.slice(1), 16)
  for (const [x, y, w, h] of stones) {
    const v = Math.floor((Math.random() - 0.5) * 28)
    const r = Math.min(255, Math.max(0, ((c >> 16) & 0xff) + v))
    const g = Math.min(255, Math.max(0, ((c >> 8) & 0xff) + v))
    const b = Math.min(255, Math.max(0, (c & 0xff) + v))
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(x + 3, y + 3, w - 3, h - 3)
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(3, 3)
  return t
}

function makeTerracotaTexture(): THREE.CanvasTexture {
  const s = 256
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = '#B0603A'
  ctx.fillRect(0, 0, s, s)
  const tW = 60, tH = 60, gap = 4
  for (let row = 0; row * (tH + gap) < s + tH; row++) {
    for (let col = 0; col * (tW + gap) < s + tW; col++) {
      const x = col * (tW + gap) + gap * 0.5
      const y = row * (tH + gap) + gap * 0.5
      const v = Math.floor((Math.random() - 0.5) * 18)
      ctx.fillStyle = `rgb(${200 + v},${116 + v},${68 + v})`
      ctx.fillRect(x, y, tW, tH)
    }
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 4)
  return t
}

function makeDeckTexture(dark: boolean): THREE.CanvasTexture {
  const s = 256
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')!
  const planks = 8
  const pH = s / planks
  for (let i = 0; i < planks; i++) {
    const v = Math.floor((Math.random() - 0.5) * 25)
    const base = dark ? [70, 45, 18] : [154, 106, 48]
    ctx.fillStyle = `rgb(${base[0]+v},${base[1]+v},${base[2]+v})`
    ctx.fillRect(0, i * pH + 1, s, pH - 2)
    // grain lines
    ctx.strokeStyle = dark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 0.5
    for (let g = 0; g < 5; g++) {
      const gx = Math.random() * s
      ctx.beginPath(); ctx.moveTo(gx, i * pH); ctx.lineTo(gx + Math.random() * 20 - 10, (i + 1) * pH); ctx.stroke()
    }
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2, 4)
  return t
}

function makeSandTexture(dark: boolean): THREE.CanvasTexture {
  const s = 256
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = dark ? '#8A7840' : '#D8C89A'
  ctx.fillRect(0, 0, s, s)
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * s; const y = Math.random() * s
    const a = Math.random() * 0.3 + 0.05
    ctx.fillStyle = dark ? `rgba(60,50,20,${a})` : `rgba(200,180,110,${a})`
    ctx.beginPath(); ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2); ctx.fill()
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(5, 5)
  return t
}

function makeTierraTexture(dark: boolean): THREE.CanvasTexture {
  const s = 256
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = dark ? '#3A2810' : '#7A5A3A'
  ctx.fillRect(0, 0, s, s)
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * s; const y = Math.random() * s
    const a = Math.random() * 0.4
    ctx.fillStyle = dark ? `rgba(20,14,5,${a})` : `rgba(100,70,40,${a})`
    ctx.beginPath(); ctx.ellipse(x, y, Math.random() * 3 + 1, Math.random() * 2, Math.random() * Math.PI, 0, Math.PI * 2); ctx.fill()
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(5, 5)
  return t
}

// ─── Hook de textura procedural para pisos ────────────────────────────────────

function useFloorTexture(id: string): THREE.CanvasTexture | null {
  return useMemo(() => {
    if (id === 'grass')       return makeGrassTexture(false)
    if (id === 'grass_dark')  return makeGrassTexture(true)
    if (id === 'adoquin')     return makeAdoquinTexture('#A09888', '#787060')
    if (id === 'patio_stone') return makeStoneTexture('#988878', '#685848')
    if (id === 'terracota')   return makeTerracotaTexture()
    if (id === 'deck_madera') return makeDeckTexture(false)
    if (id === 'arena')       return makeSandTexture(false)
    if (id === 'tierra')      return makeTierraTexture(false)
    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface SceneFloorProps {
  width: number
  depth: number
  material?: string
}

export function SceneFloor({ width, depth, material = 'concrete' }: SceneFloorProps) {
  const m = FLOOR_MATS[material as FloorMaterial] ?? FLOOR_MATS.concrete
  const tex = useFloorTexture(material)

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.002, 0]}>
      <planeGeometry args={[width, depth]} />
      {tex
        ? <meshStandardMaterial map={tex} roughness={m.roughness} metalness={m.metalness} />
        : <meshStandardMaterial color={m.color} roughness={m.roughness} metalness={m.metalness} />
      }
    </mesh>
  )
}
