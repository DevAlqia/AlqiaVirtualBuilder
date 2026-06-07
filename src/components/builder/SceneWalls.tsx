import { useMemo } from 'react'
import * as THREE from 'three'
import { useTheme } from '@/contexts/ThemeContext'
import { MATERIAL_PROPS_BY_ID } from '@/data/mock/materials'
import type { Scene } from '@/types'

interface SceneWallsProps {
  scene: Scene
}

// ─── Generadores de texturas canvas para muros ────────────────────────────────

function makeBrickTex(brickColor: string, mortarColor: string, offset = false): THREE.CanvasTexture {
  const W = 512, H = 256
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = mortarColor
  ctx.fillRect(0, 0, W, H)
  const bW = 96, bH = 38, gap = 8
  const c = parseInt(brickColor.replace('#', ''), 16)
  for (let row = 0; row * (bH + gap) < H + bH; row++) {
    const rowOff = (row % 2 === 0) === offset ? 0 : (bW + gap) / 2
    for (let col = -1; col * (bW + gap) < W + bW; col++) {
      const x = col * (bW + gap) + rowOff + gap * 0.5
      const y = row * (bH + gap) + gap * 0.5
      const v = Math.floor((Math.random() - 0.5) * 24)
      const r = Math.min(255, Math.max(0, ((c >> 16) & 0xff) + v))
      const g = Math.min(255, Math.max(0, ((c >> 8) & 0xff) + v))
      const b = Math.min(255, Math.max(0, (c & 0xff) + v))
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(x, y, bW, bH)
      // highlight superior
      ctx.fillStyle = `rgba(255,255,255,0.06)`
      ctx.fillRect(x, y, bW, 4)
    }
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

function makePiedraTex(baseColor: string, jointColor: string): THREE.CanvasTexture {
  const W = 512, H = 512
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = jointColor
  ctx.fillRect(0, 0, W, H)
  const c = parseInt(baseColor.replace('#', ''), 16)
  // piedras irregulares
  const stones = [
    [4,4,130,80],[140,4,100,80],[248,4,120,80],[376,4,130,80],
    [4,90,100,90],[110,90,140,90],[258,90,100,90],[366,90,140,90],
    [4,188,150,80],[162,188,110,80],[280,188,120,80],[408,188,96,80],
    [4,276,120,90],[132,276,130,90],[270,276,100,90],[378,276,128,90],
    [4,374,140,80],[152,374,110,80],[270,374,130,80],[408,374,96,80],
    [4,462,150,46],[162,462,120,46],[290,462,130,46],[428,462,80,46],
  ]
  for (const [x, y, w, h] of stones) {
    const v = Math.floor((Math.random() - 0.5) * 32)
    const r = Math.min(255, Math.max(0, ((c >> 16) & 0xff) + v))
    const g = Math.min(255, Math.max(0, ((c >> 8) & 0xff) + v))
    const b = Math.min(255, Math.max(0, (c & 0xff) + v))
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.beginPath()
    ctx.roundRect(x + 4, y + 4, w - 4, h - 4, 3)
    ctx.fill()
    ctx.fillStyle = `rgba(255,255,255,0.05)`
    ctx.fillRect(x + 4, y + 4, w - 4, 6)
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

function makeBlockTex(baseColor: string, jointColor: string): THREE.CanvasTexture {
  const W = 512, H = 256
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = jointColor
  ctx.fillRect(0, 0, W, H)
  const bW = 200, bH = 100, gap = 10
  const c = parseInt(baseColor.replace('#', ''), 16)
  for (let row = 0; row * (bH + gap) < H + bH; row++) {
    const rowOff = row % 2 === 0 ? 0 : (bW + gap) / 2
    for (let col = -1; col * (bW + gap) < W + bW; col++) {
      const x = col * (bW + gap) + rowOff + gap * 0.5
      const y = row * (bH + gap) + gap * 0.5
      const v = Math.floor((Math.random() - 0.5) * 14)
      const r = Math.min(255, Math.max(0, ((c >> 16) & 0xff) + v))
      const g = Math.min(255, Math.max(0, ((c >> 8) & 0xff) + v))
      const b = Math.min(255, Math.max(0, (c & 0xff) + v))
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(x, y, bW, bH)
      // dos agujeros decorativos del block
      ctx.fillStyle = jointColor
      ctx.beginPath(); ctx.ellipse(x + bW * 0.33, y + bH * 0.5, 14, 18, 0, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(x + bW * 0.67, y + bH * 0.5, 14, 18, 0, 0, Math.PI * 2); ctx.fill()
    }
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

function makeGardenTex(): THREE.CanvasTexture {
  const s = 256
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = '#1A3A12'
  ctx.fillRect(0, 0, s, s)
  // hojas / follaje
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * s, y = Math.random() * s
    const size = 3 + Math.random() * 12
    const angle = Math.random() * Math.PI * 2
    const green = Math.floor(Math.random() * 60 + 60)
    ctx.fillStyle = `rgba(20,${green},10,0.7)`
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle)
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.4, size, 0, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
  // flores ocasionales
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * s, y = Math.random() * s
    ctx.fillStyle = `rgba(255,${Math.floor(Math.random() * 100 + 100)},${Math.floor(Math.random() * 80)},0.8)`
    ctx.beginPath(); ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2); ctx.fill()
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

// ─── Hook: textura de muro por material ID ─────────────────────────────────────

function useWallTexture(materialId: string): THREE.CanvasTexture | null {
  return useMemo(() => {
    switch (materialId) {
      case 'wall-ladrillo':       return makeBrickTex('#B8604A', '#C8C0B0', false)
      case 'wall-ladrillo-claro': return makeBrickTex('#D4906A', '#D8D0C0', true)
      case 'wall-piedra':         return makePiedraTex('#888078', '#686058')
      case 'wall-piedra-cafe':    return makePiedraTex('#9A8068', '#706050')
      case 'wall-block':          return makeBlockTex('#B0B4B8', '#888C90')
      case 'wall-block-blanco':   return makeBlockTex('#E0E4E8', '#B8BCC0')
      case 'wall-verde-jardin':   return makeGardenTex()
      default:                    return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId])
}

// ─── Sub-componente: un panel de muro con soporte de textura ──────────────────

function WallPanel({
  position, args, wallColor, roughness, metalness, tex, repeatX, repeatY,
}: {
  position: [number, number, number]
  args: [number, number, number]
  wallColor: string
  roughness: number
  metalness: number
  tex: THREE.CanvasTexture | null
  repeatX: number
  repeatY: number
}) {
  const cloned = useMemo(() => {
    if (!tex) return null
    const c = tex.clone()
    c.wrapS = c.wrapT = THREE.RepeatWrapping
    c.repeat.set(repeatX, repeatY)
    c.needsUpdate = true
    return c
  }, [tex, repeatX, repeatY])

  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={args} />
      {cloned
        ? <meshStandardMaterial map={cloned} roughness={roughness} metalness={metalness} />
        : <meshStandardMaterial color={wallColor} roughness={roughness} metalness={metalness} />
      }
    </mesh>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SceneWalls({ scene }: SceneWallsProps) {
  const { theme } = useTheme()

  if (!scene.wall_enabled) return null

  const w = scene.width
  const d = scene.depth
  const h = scene.height > 0 ? scene.height : 3
  const t = 0.06

  // Resolver material: primero wall_material (ID), luego wall_color (hex), luego default
  const matId       = scene.wall_material ?? ''
  const matProps    = MATERIAL_PROPS_BY_ID[matId]
  const wallColor   = matProps?.color
    ?? scene.wall_color
    ?? (theme === 'light' ? '#F2F0EB' : '#2A2830')
  const roughness   = matProps?.roughness ?? 0.88
  const metalness   = matProps?.metalness ?? 0.0

  const tex = useWallTexture(matId)

  // repeticiones de textura proporcionales a dimensiones
  const repBack   = { x: Math.max(1, Math.round(w / 1.2)), y: Math.max(1, Math.round(h / 0.8)) }
  const repSide   = { x: Math.max(1, Math.round(d / 1.2)), y: Math.max(1, Math.round(h / 0.8)) }

  return (
    <group>
      {/* Pared trasera (Norte) */}
      <WallPanel
        position={[0, h / 2, -d / 2]}
        args={[w + t * 2, h, t]}
        wallColor={wallColor}
        roughness={roughness}
        metalness={metalness}
        tex={tex}
        repeatX={repBack.x}
        repeatY={repBack.y}
      />
      {/* Pared izquierda (Oeste) */}
      <WallPanel
        position={[-w / 2, h / 2, 0]}
        args={[t, h, d]}
        wallColor={wallColor}
        roughness={roughness}
        metalness={metalness}
        tex={tex}
        repeatX={repSide.x}
        repeatY={repSide.y}
      />
      {/* Pared derecha (Este) */}
      <WallPanel
        position={[w / 2, h / 2, 0]}
        args={[t, h, d]}
        wallColor={wallColor}
        roughness={roughness}
        metalness={metalness}
        tex={tex}
        repeatX={repSide.x}
        repeatY={repSide.y}
      />
    </group>
  )
}
