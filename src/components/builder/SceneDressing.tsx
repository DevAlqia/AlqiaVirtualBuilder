import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * SceneDressing — Capa decorativa de la escena 3D
 *
 * Agrega elementos ambientales que hacen la escena mas viva:
 * muros bajos, marcos de ventana, marcos de puerta, lamparas de techo,
 * plantas decorativas y paneles de fondo.
 *
 * Estos elementos son is_scene_prop: true y no entran en cotizacion.
 * El conjunto de props se elige automaticamente por preset de vertical.
 */

type DressingPreset =
  | 'none'
  | 'industrial'
  | 'living'
  | 'apartment'
  | 'store'
  | 'expo'
  | 'medical'
  | 'showroom'

interface Props {
  sceneWidth: number
  sceneDepth: number
  preset: DressingPreset
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function BackWall({ w, d, wallH, color }: { w: number; h?: number; d: number; wallH: number; color: string }) {
  return (
    <>
      <mesh position={[0, wallH / 2, -d / 2 + 0.05]} receiveShadow castShadow>
        <boxGeometry args={[w + 0.2, wallH, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.02} />
      </mesh>
      <mesh position={[-w / 2 - 0.05, wallH / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, wallH, d + 0.2]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.02} />
      </mesh>
    </>
  )
}

function WindowFrame({ x, z, w = 1.4, h = 1.1, wallD = 0.12, angle = 0 }: {
  x: number; z: number; w?: number; h?: number; wallD?: number; angle?: number
}) {
  const frameT = 0.05
  const frameColor = '#C8CCD8'
  const glassMat = (
    <meshStandardMaterial color="#88CCDD" roughness={0.04} metalness={0.08} transparent opacity={0.38} />
  )
  const frameMat = (
    <meshStandardMaterial color={frameColor} roughness={0.28} metalness={0.28} />
  )
  const sillY = 1.0
  const framePieces: [number, number, number, number, number, number][] = [
    [0,        sillY + h / 2,     0, w,         frameT, wallD],
    [0,        sillY + h + frameT / 2, 0, w + frameT * 2, frameT, wallD],
    [-w / 2 - frameT / 2, sillY + h / 2, 0, frameT, h, wallD],
    [w / 2 + frameT / 2,  sillY + h / 2, 0, frameT, h, wallD],
  ]
  return (
    <group position={[x, 0, z]} rotation={[0, angle, 0]}>
      <mesh position={[0, sillY + h / 2, 0]}>
        <boxGeometry args={[w - frameT * 2, h - frameT * 2, wallD * 0.6]} />
        {glassMat}
      </mesh>
      <mesh position={[0, sillY + h / 2, 0]}>
        <planeGeometry args={[w - frameT * 2, h - frameT * 2]} />
        <meshStandardMaterial color="#B8DDEE" roughness={0.0} metalness={0.0} transparent opacity={0.18} />
      </mesh>
      {framePieces.map(([px, py, pz, fw, fh, fd], i) => (
        <mesh key={i} position={[px, py, pz]}>
          <boxGeometry args={[fw, fh, fd]} />
          {frameMat}
        </mesh>
      ))}
    </group>
  )
}

function DoorFrame({ x, z, w = 0.9, h = 2.1, angle = 0 }: {
  x: number; z: number; w?: number; h?: number; angle?: number
}) {
  const frameT = 0.06
  const frameD = 0.14
  const mat = <meshStandardMaterial color="#8A6E52" roughness={0.55} metalness={0.04} />
  const panelMat = <meshStandardMaterial color="#704E3A" roughness={0.48} metalness={0.04} />
  const handleMat = <meshStandardMaterial color="#9AA0B0" roughness={0.12} metalness={0.82} />
  return (
    <group position={[x, 0, z]} rotation={[0, angle, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, frameD * 0.55]} />
        {panelMat}
      </mesh>
      {[[-w / 2 - frameT / 2, h / 2], [w / 2 + frameT / 2, h / 2], [0, h + frameT / 2]].map(
        ([px, py], i) => (
          <mesh key={i} position={[px as number, py as number, 0]} castShadow>
            <boxGeometry args={[i < 2 ? frameT : w + frameT * 2, i < 2 ? h : frameT, frameD]} />
            {mat}
          </mesh>
        )
      )}
      <mesh position={[w * 0.3, h * 0.52, frameD * 0.35]}>
        <boxGeometry args={[w * 0.18, h * 0.012, h * 0.012]} />
        {handleMat}
      </mesh>
    </group>
  )
}

function CeilingLamp({ x, z, ceilH = 3.0, color = '#FFF8E0' }: {
  x: number; z: number; ceilH?: number; color?: string
}) {
  const pendantH = 0.18
  const shadeR = 0.18
  return (
    <group position={[x, ceilH - pendantH, z]}>
      <mesh>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
        <meshStandardMaterial color="#484E60" roughness={0.3} metalness={0.65} />
      </mesh>
      <mesh position={[0, -0.3 - pendantH / 2, 0]}>
        <cylinderGeometry args={[shadeR, shadeR * 0.6, pendantH, 12, 1, true]} />
        <meshStandardMaterial color="#2A2E3A" roughness={0.4} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.3 - pendantH * 0.9, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} roughness={0} />
      </mesh>
      <pointLight position={[0, -0.3 - pendantH * 1.2, 0]} intensity={0.9} distance={5} color={color} />
    </group>
  )
}

function PlantProp({ x, z }: { x: number; z: number }) {
  const potH = 0.28
  const trunkH = 0.45
  const r1 = 0.28
  const r2 = 0.22
  const r3 = 0.18
  const leafMat = <meshStandardMaterial color="#2A5C2A" roughness={0.85} metalness={0.0} />
  const potMat = <meshStandardMaterial color="#6B4E3D" roughness={0.72} metalness={0.04} />
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, potH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.1, potH, 10]} />
        {potMat}
      </mesh>
      <mesh position={[0, potH + trunkH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.024, trunkH, 6]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.8} metalness={0.0} />
      </mesh>
      <mesh position={[0, potH + trunkH + r1 * 0.62, 0]} castShadow>
        <sphereGeometry args={[r1, 8, 6]} />
        {leafMat}
      </mesh>
      <mesh position={[r2 * 0.7, potH + trunkH + r2 * 0.4, r2 * 0.5]} castShadow>
        <sphereGeometry args={[r2, 7, 5]} />
        {leafMat}
      </mesh>
      <mesh position={[-r3 * 0.8, potH + trunkH + r3 * 0.5, -r3 * 0.4]} castShadow>
        <sphereGeometry args={[r3, 6, 5]} />
        {leafMat}
      </mesh>
    </group>
  )
}

function ExpoBackground({ w, h, d }: { w: number; h: number; d: number }) {
  const panelH = h * 0.88
  const panelW = w * 0.32
  return (
    <>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * panelW * 1.05, panelH / 2, -d / 2 + 0.08]} castShadow receiveShadow>
          <boxGeometry args={[panelW * 0.94, panelH, 0.06]} />
          <meshStandardMaterial
            color={i === 0 ? '#0D1018' : '#111520'}
            roughness={0.3}
            metalness={0.3}
          />
        </mesh>
      ))}
    </>
  )
}

function ShowroomReflector({ x, z, ceilH = 4 }: { x: number; z: number; ceilH?: number }) {
  return (
    <group position={[x, ceilH - 0.08, z]}>
      <mesh>
        <cylinderGeometry args={[0.09, 0.07, 0.16, 10]} />
        <meshStandardMaterial color="#2A2E3C" roughness={0.2} metalness={0.72} />
      </mesh>
      <spotLight
        position={[0, -0.1, 0]}
        target-position={[0, -ceilH + 1, 0]}
        intensity={30}
        angle={0.38}
        penumbra={0.55}
        distance={ceilH + 3}
        color="#FFFFFF"
        castShadow
      />
    </group>
  )
}

// ─── Presets por vertical ─────────────────────────────────────────────────────

export function SceneDressing({ sceneWidth: w, sceneDepth: d, preset }: Props) {
  const h = preset === 'showroom' || preset === 'expo' ? 4.0 : preset === 'industrial' ? 4.5 : 3.0

  const content = useMemo(() => {
    switch (preset) {
      case 'none':
        return null

      case 'industrial':
        return (
          <>
            <CeilingLamp x={-w * 0.22} z={-d * 0.18} ceilH={h} color="#F0F4FF" />
            <CeilingLamp x={ w * 0.22} z={-d * 0.18} ceilH={h} color="#F0F4FF" />
            <CeilingLamp x={0}         z={ d * 0.2}  ceilH={h} color="#F0F4FF" />
          </>
        )

      case 'living':
        return (
          <>
            <BackWall w={w} h={h} d={d} wallH={h} color="#2A2830" />
            <WindowFrame x={-w * 0.2} z={-d / 2 + 0.06} w={1.4} h={1.2} />
            <WindowFrame x={ w * 0.2} z={-d / 2 + 0.06} w={1.4} h={1.2} />
            <DoorFrame x={w / 2 - 0.08} z={0} w={0.9} h={2.1} angle={Math.PI / 2} />
            <PlantProp x={-w / 2 + 0.5} z={-d / 2 + 0.6} />
            <PlantProp x={ w / 2 - 0.5} z={-d / 2 + 0.6} />
            <CeilingLamp x={0} z={0} ceilH={h} color="#FFE8B0" />
          </>
        )

      case 'apartment':
        return (
          <>
            <BackWall w={w} h={h} d={d} wallH={h} color="#22262E" />
            <WindowFrame x={-w * 0.25} z={-d / 2 + 0.06} w={1.6} h={1.4} />
            <WindowFrame x={ w * 0.25} z={-d / 2 + 0.06} w={1.6} h={1.4} />
            <WindowFrame x={0}         z={-d / 2 + 0.06} w={2.0} h={1.6} />
            <DoorFrame x={w / 2 - 0.08} z={d * 0.2} w={0.9} h={2.1} angle={Math.PI / 2} />
            <PlantProp x={ w / 2 - 0.6} z={-d * 0.3} />
            <PlantProp x={-w / 2 + 0.6} z={ d * 0.3} />
            <CeilingLamp x={-w * 0.22} z={-d * 0.15} ceilH={h} color="#FFE4A0" />
            <CeilingLamp x={ w * 0.22} z={ d * 0.15} ceilH={h} color="#FFE4A0" />
          </>
        )

      case 'store':
        return (
          <>
            <CeilingLamp x={-w * 0.2} z={-d * 0.2} ceilH={3.5} color="#F8F8FF" />
            <CeilingLamp x={ w * 0.2} z={-d * 0.2} ceilH={3.5} color="#F8F8FF" />
            <CeilingLamp x={-w * 0.2} z={ d * 0.2} ceilH={3.5} color="#F8F8FF" />
            <CeilingLamp x={ w * 0.2} z={ d * 0.2} ceilH={3.5} color="#F8F8FF" />
            <CeilingLamp x={0}        z={0}        ceilH={3.5} color="#F8F8FF" />
          </>
        )

      case 'expo':
        return (
          <>
            <ExpoBackground w={w} h={h} d={d} />
            <ShowroomReflector x={-w * 0.22} z={-d * 0.15} ceilH={h} />
            <ShowroomReflector x={ w * 0.22} z={-d * 0.15} ceilH={h} />
            <ShowroomReflector x={0}         z={ d * 0.15} ceilH={h} />
          </>
        )

      case 'medical':
        return (
          <>
            <BackWall w={w} h={h} d={d} wallH={h} color="#1A2030" />
            <WindowFrame x={w * 0.25} z={-d / 2 + 0.06} w={1.0} h={1.1} />
            <DoorFrame x={-w / 2 + 0.08} z={0} w={0.9} h={2.1} angle={-Math.PI / 2} />
            <CeilingLamp x={0}        z={0}        ceilH={h} color="#F0F8FF" />
            <CeilingLamp x={-w * 0.2} z={-d * 0.2} ceilH={h} color="#F0F8FF" />
          </>
        )

      case 'showroom':
        return (
          <>
            <ShowroomReflector x={-w * 0.28} z={-d * 0.18} ceilH={h} />
            <ShowroomReflector x={ w * 0.28} z={-d * 0.18} ceilH={h} />
            <ShowroomReflector x={-w * 0.28} z={ d * 0.18} ceilH={h} />
            <ShowroomReflector x={ w * 0.28} z={ d * 0.18} ceilH={h} />
            <ShowroomReflector x={0}         z={0}          ceilH={h} />
          </>
        )

      default:
        return null
    }
  }, [preset, w, d, h])

  return <>{content}</>
}

// Mapa de vertical_key a preset de dressing
export const VERTICAL_DRESSING: Record<string, DressingPreset> = {
  industrial_storage:   'industrial',
  furniture_kitchen:    'living',
  real_estate:          'apartment',
  retail_layout:        'store',
  event_stand:          'expo',
  medical_space:        'medical',
  exterior_enclosures:  'none',
  interior_design:      'living',
  architecture_concept: 'none',
}
