import { Component, useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { TransformControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useBuilderStore } from '@/store/builderStore'
import { orbitControlsRef } from './sceneRefs'
import type { ProjectObject, GeometryType } from '@/types'

interface ProductObjectProps {
  object: ProjectObject
}

// ─── Utilidad de color ────────────────────────────────────────────────────────

function lighten(hex: string, amt = 25): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (n >> 16) + amt)
  const g = Math.min(255, ((n >> 8) & 0xff) + amt)
  const b = Math.min(255, (n & 0xff) + amt)
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

// ─── GLB Loader con fallback procedural ──────────────────────────────────────

class GLBErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { error: boolean }
> {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  render() {
    return this.state.error ? this.props.fallback : this.props.children
  }
}

function GLBScene({ url, w, h, d }: { url: string; w: number; h: number; d: number }) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => {
    const obj = scene.clone(true)
    const bbox = new THREE.Box3().setFromObject(obj)
    const size = bbox.getSize(new THREE.Vector3())
    const scale = Math.min(
      w / Math.max(size.x, 0.001),
      h / Math.max(size.y, 0.001),
      d / Math.max(size.z, 0.001),
    )
    obj.scale.setScalar(scale)
    const nb = new THREE.Box3().setFromObject(obj)
    const center = nb.getCenter(new THREE.Vector3())
    obj.position.x -= center.x
    obj.position.z -= center.z
    obj.position.y -= nb.min.y
    return obj
  }, [scene, w, h, d])
  return <primitive object={cloned} castShadow receiveShadow />
}

// ─── Geometrias procedurales mejoradas ───────────────────────────────────────

// 1. CABINET — gabinete con puertas simuladas y manijas metálicas
function CabinetGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const doorD = Math.max(d * 0.05, 0.02)
  const gap = w * 0.008
  const doorW = (w - gap) / 2 - w * 0.01
  const doorH = h * 0.93
  const handleW = doorW * 0.15
  const handleH = Math.max(h * 0.012, 0.008)
  const handleZ = d / 2 + doorD + handleH
  const handleY = h * 0.12
  const bodyMat = <meshStandardMaterial color={color} roughness={0.42} metalness={0.08} />
  const doorMat = <meshStandardMaterial color={lighten(color, 18)} roughness={0.28} metalness={0.06} />
  const handleMat = <meshStandardMaterial color="#9A9FA8" roughness={0.12} metalness={0.85} />
  return (
    <group>
      <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} />{bodyMat}</mesh>
      {/* Puerta izquierda */}
      <mesh position={[-(w / 4 + gap / 4), 0, d / 2 + doorD / 2]} castShadow>
        <boxGeometry args={[doorW, doorH, doorD]} />{doorMat}
      </mesh>
      {/* Puerta derecha */}
      <mesh position={[w / 4 + gap / 4, 0, d / 2 + doorD / 2]} castShadow>
        <boxGeometry args={[doorW, doorH, doorD]} />{doorMat}
      </mesh>
      {/* Manija izquierda */}
      <mesh position={[-gap / 2 - w * 0.04, handleY, handleZ]} castShadow>
        <boxGeometry args={[handleW, handleH, handleH]} />{handleMat}
      </mesh>
      {/* Manija derecha */}
      <mesh position={[gap / 2 + w * 0.04, handleY, handleZ]} castShadow>
        <boxGeometry args={[handleW, handleH, handleH]} />{handleMat}
      </mesh>
      {/* Linea divisora entre puertas */}
      <mesh position={[0, 0, d / 2 + doorD * 0.6]}>
        <boxGeometry args={[gap, h * 0.97, doorD * 0.4]} />
        <meshStandardMaterial color={lighten(color, -20)} roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  )
}

// 2. SHELF_RACK — anaquel/rack con postes, travesaños y cruces de refuerzo
function ShelfRackGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const postW = Math.max(w * 0.03, 0.01)
  const shelfH = Math.max(h * 0.018, 0.008)
  const levels = Math.max(2, Math.round(h / (w * 0.65)))
  const mat = <meshStandardMaterial color={color} roughness={0.38} metalness={0.35} />
  const xMat = <meshStandardMaterial color={lighten(color, -12)} roughness={0.4} metalness={0.3} />
  const posts: [number, number][] = [
    [-w / 2 + postW / 2, -d / 2 + postW / 2],
    [w / 2 - postW / 2, -d / 2 + postW / 2],
    [-w / 2 + postW / 2, d / 2 - postW / 2],
    [w / 2 - postW / 2, d / 2 - postW / 2],
  ]
  return (
    <group>
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]} castShadow>
          <boxGeometry args={[postW, h, postW]} />{mat}
        </mesh>
      ))}
      {Array.from({ length: levels + 1 }).map((_, i) => {
        const y = -h / 2 + (h / levels) * i
        return (
          <group key={i}>
            <mesh position={[0, y, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, shelfH, d]} />{mat}
            </mesh>
            {i < levels && (
              <mesh position={[0, y + (h / levels) * 0.5, -d / 2 + postW * 0.7]}>
                <boxGeometry args={[w, postW * 0.6, postW * 0.6]} />{xMat}
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

// 3. BOX_FLAT — mesa / cama / plataforma con patas
function BoxFlatGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const topH = Math.max(h * 0.12, 0.01)
  const legSize = Math.min(w, d) * 0.045
  const legH = h - topH
  const mat = <meshStandardMaterial color={color} roughness={0.45} metalness={0.12} />
  const isFlat = h < w * 0.22
  if (isFlat) {
    return <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} />{mat}</mesh>
  }
  const legs: [number, number][] = [
    [-w / 2 + legSize, d / 2 - legSize],
    [w / 2 - legSize, d / 2 - legSize],
    [-w / 2 + legSize, -d / 2 + legSize],
    [w / 2 - legSize, -d / 2 + legSize],
  ]
  return (
    <group>
      <mesh position={[0, h / 2 - topH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, topH, d]} />{mat}
      </mesh>
      {legs.map(([x, z], i) => (
        <mesh key={i} position={[x, -h / 2 + legH / 2, z]} castShadow>
          <boxGeometry args={[legSize, legH, legSize]} />{mat}
        </mesh>
      ))}
    </group>
  )
}

// 4. PANEL_V — pantalla / video wall con bezel y area activa emissiva
function PanelVGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const panelD = Math.max(d, w * 0.038)
  const standH = h * 0.14
  const bezel = w * 0.018
  return (
    <group>
      <mesh position={[0, standH / 2, 0]} castShadow>
        <boxGeometry args={[w * 0.1, standH, panelD * 2.2]} />
        <meshStandardMaterial color="#181828" roughness={0.5} metalness={0.48} />
      </mesh>
      <mesh position={[0, standH + (h - standH) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h - standH, panelD]} />
        <meshStandardMaterial color="#0D0F14" roughness={0.18} metalness={0.55} />
      </mesh>
      <mesh position={[0, standH + (h - standH) / 2, panelD / 2 + 0.002]}>
        <planeGeometry args={[w - bezel * 2, h - standH - bezel * 2]} />
        <meshStandardMaterial color={color} roughness={0.04} metalness={0.0} emissive={color} emissiveIntensity={0.28} />
      </mesh>
    </group>
  )
}

// 5. SEATING — sofa / silla con asiento, respaldo, brazos y patas
function SeatingGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const seatH = h * 0.42
  const backH = h * 0.58
  const seatD = d * 0.62
  const backD = d * 0.14
  const armW = w * 0.065
  const armH = h * 0.28
  const armD = seatD * 0.88
  const legS = Math.min(w, d) * 0.042
  const legH = seatH * 0.36
  const mat = <meshStandardMaterial color={color} roughness={0.78} metalness={0.02} />
  const legMat = <meshStandardMaterial color={lighten(color, -18)} roughness={0.42} metalness={0.38} />
  return (
    <group>
      <mesh position={[0, -h / 2 + seatH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, seatH, seatD]} />{mat}
      </mesh>
      <mesh position={[0, -h / 2 + seatH + backH / 2, -seatD / 2 + backD / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, backH, backD]} />{mat}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - armW / 2), -h / 2 + seatH + armH / 2, -seatD / 2 + armD / 2 + backD / 2]} castShadow>
          <boxGeometry args={[armW, armH, armD]} />{mat}
        </mesh>
      ))}
      {([ [-1,1],[ 1,1],[-1,-1],[ 1,-1] ] as [number,number][]).map(([sx,sz], i) => (
        <mesh key={i} position={[sx * (w / 2 - legS), -h / 2 + legH / 2, sz * (seatD / 2 - legS)]} castShadow>
          <boxGeometry args={[legS, legH, legS]} />{legMat}
        </mesh>
      ))}
    </group>
  )
}

// 6. VEHICLE — auto con carrocería, cabina, vidrios, llantas con rin y faros
function VehicleGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const bodyH = h * 0.52
  const cabinH = h * 0.48
  const cabinW = w * 0.72
  const cabinD = d * 0.52
  const wr = h * 0.21
  const ww = d * 0.065
  const rimR = wr * 0.55
  const bodyMat = <meshStandardMaterial color={color} roughness={0.16} metalness={0.72} />
  const glassMat = <meshStandardMaterial color="#88BBCC" roughness={0.03} metalness={0.06} transparent opacity={0.5} />
  const tireMat = <meshStandardMaterial color="#111111" roughness={0.88} metalness={0.04} />
  const rimMat = <meshStandardMaterial color="#A8B0BC" roughness={0.1} metalness={0.9} />
  const lightMat = <meshStandardMaterial color="#F0E070" roughness={0.04} emissive="#F0E070" emissiveIntensity={0.45} />
  const wheelPos: [number, number, number][] = [
    [-w * 0.34, -h / 2 + wr, -d / 2 + ww * 0.5],
    [w * 0.34, -h / 2 + wr, -d / 2 + ww * 0.5],
    [-w * 0.34, -h / 2 + wr, d / 2 - ww * 0.5],
    [w * 0.34, -h / 2 + wr, d / 2 - ww * 0.5],
  ]
  return (
    <group>
      <mesh position={[0, -h / 2 + bodyH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, bodyH, d]} />{bodyMat}
      </mesh>
      <mesh position={[w * 0.03, -h / 2 + bodyH + cabinH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[cabinW, cabinH, cabinD]} />{bodyMat}
      </mesh>
      <mesh position={[w * 0.03 + cabinW * 0.44, -h / 2 + bodyH + cabinH * 0.45, 0]} rotation={[0, 0, 0.28]}>
        <planeGeometry args={[cabinD * 0.87, cabinH * 0.72]} />{glassMat}
      </mesh>
      <mesh position={[w * 0.03, -h / 2 + bodyH + cabinH * 0.55, -cabinD / 2 + 0.002]}>
        <planeGeometry args={[cabinW * 0.84, cabinH * 0.62]} />{glassMat}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[w * 0.5 + 0.001, -h / 2 + bodyH * 0.7, s * d * 0.28]}>
          <planeGeometry args={[d * 0.15, bodyH * 0.18]} />{lightMat}
        </mesh>
      ))}
      {wheelPos.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[wr, wr, ww, 20]} />{tireMat}
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, i < 2 ? ww * 0.52 : -ww * 0.52]}>
            <cylinderGeometry args={[rimR, rimR, ww * 0.14, 16]} />{rimMat}
          </mesh>
        </group>
      ))}
    </group>
  )
}

// 7. KITCHEN_UNIT — cocina modular con gabinetes, cubierta y manijas horizontales
function KitchenUnitGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const topH = Math.max(h * 0.055, 0.012)
  const cabH = h - topH
  const numDoors = Math.max(2, Math.round(w / (h * 0.42)))
  const dW = w / numDoors - w * 0.007
  const dH = cabH * 0.87
  const dD = d * 0.052
  const hW = dW * 0.58
  const hH = Math.max(h * 0.011, 0.006)
  return (
    <group>
      <mesh position={[0, -topH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, cabH, d]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.08} />
      </mesh>
      <mesh position={[0, h / 2 - topH / 2, d * 0.01]} castShadow receiveShadow>
        <boxGeometry args={[w + d * 0.04, topH, d + d * 0.06]} />
        <meshStandardMaterial color={lighten(color, 42)} roughness={0.1} metalness={0.18} />
      </mesh>
      {Array.from({ length: numDoors }).map((_, i) => {
        const x = -w / 2 + (w / numDoors) * (i + 0.5)
        return (
          <group key={i}>
            <mesh position={[x, -topH / 2, d / 2 + dD / 2]} castShadow>
              <boxGeometry args={[dW, dH, dD]} />
              <meshStandardMaterial color={lighten(color, 22)} roughness={0.28} metalness={0.06} />
            </mesh>
            <mesh position={[x, -topH / 2 + cabH * 0.19, d / 2 + dD + hH]}>
              <boxGeometry args={[hW, hH, hH]} />
              <meshStandardMaterial color="#8890A0" roughness={0.08} metalness={0.88} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// 8. CLOSET — armario con paneles de puertas corredizas y manijas verticales
function ClosetGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const numPanels = Math.max(2, Math.round(w / (h * 0.3)))
  const pW = w / numPanels - w * 0.006
  const pD = d * 0.042
  const hW = pW * 0.07
  const hH = h * 0.16
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.38} metalness={0.06} />
      </mesh>
      {Array.from({ length: numPanels - 1 }).map((_, i) => (
        <mesh key={i} position={[-w / 2 + (w / numPanels) * (i + 1), 0, d / 2 + pD * 0.15]}>
          <boxGeometry args={[w * 0.008, h * 0.96, pD * 0.35]} />
          <meshStandardMaterial color={lighten(color, -16)} roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
      {Array.from({ length: numPanels }).map((_, i) => {
        const x = -w / 2 + (w / numPanels) * (i + 0.5)
        const hXOff = pW * (i % 2 === 0 ? 0.3 : -0.3)
        return (
          <group key={i}>
            <mesh position={[x, 0, d / 2 + pD / 2]} castShadow>
              <boxGeometry args={[pW, h * 0.96, pD]} />
              <meshStandardMaterial color={lighten(color, 24)} roughness={0.26} metalness={0.05} />
            </mesh>
            <mesh position={[x + hXOff, 0, d / 2 + pD + hW / 2]}>
              <boxGeometry args={[hW, hH, hW]} />
              <meshStandardMaterial color="#9098A8" roughness={0.1} metalness={0.82} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// 9. MEDICAL_BED — camilla con colchoneta, rieles laterales y cabecera
function MedicalBedGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const frameH = h * 0.12
  const mattH = h * 0.18
  const railH = h * 0.22
  const railT = w * 0.012
  const legH = h * 0.65
  const legS = w * 0.036
  const chromeMat = <meshStandardMaterial color="#B8BEC8" roughness={0.25} metalness={0.62} />
  return (
    <group>
      <mesh position={[0, -h / 2 + frameH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, frameH, d]} />{chromeMat}
      </mesh>
      <mesh position={[0, -h / 2 + frameH + mattH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.92, mattH, d * 0.91]} />
        <meshStandardMaterial color={color} roughness={0.82} metalness={0.0} />
      </mesh>
      <mesh position={[0, -h / 2 + frameH + mattH + railH / 2, -d / 2 + railT]} castShadow>
        <boxGeometry args={[w * 0.84, railH, railT * 2]} />{chromeMat}
      </mesh>
      <mesh position={[0, -h / 2 + frameH + mattH + railH * 0.62 / 2, d / 2 - railT]} castShadow>
        <boxGeometry args={[w * 0.84, railH * 0.62, railT * 2]} />{chromeMat}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - railT / 2), -h / 2 + frameH + mattH + railH * 0.38, 0]} castShadow>
          <boxGeometry args={[railT, railH * 0.76, d * 0.72]} />
          <meshStandardMaterial color="#C8CED8" roughness={0.2} metalness={0.62} transparent opacity={0.65} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * w * 0.3, -h / 2 + legH / 2, 0]} castShadow>
          <boxGeometry args={[legS, legH, d * 0.78]} />{chromeMat}
        </mesh>
      ))}
    </group>
  )
}

// 10. COUNTER — mostrador / recepcion con frente, cubierta saliente y zoclo
function CounterGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const topH = Math.max(h * 0.08, 0.01)
  const kickH = h * 0.1
  const frontH = h - topH - kickH
  const topOH = d * 0.06
  return (
    <group>
      <mesh position={[0, -h / 2 + kickH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, kickH, d * 0.86]} />
        <meshStandardMaterial color={lighten(color, -16)} roughness={0.62} metalness={0.05} />
      </mesh>
      <mesh position={[0, -h / 2 + kickH + frontH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, frontH, d]} />
        <meshStandardMaterial color={color} roughness={0.36} metalness={0.08} />
      </mesh>
      <mesh position={[0, h / 2 - topH / 2, topOH / 2]} castShadow receiveShadow>
        <boxGeometry args={[w + d * 0.04, topH, d + topOH]} />
        <meshStandardMaterial color={lighten(color, 38)} roughness={0.1} metalness={0.22} />
      </mesh>
    </group>
  )
}

// 11. GONDOLA — gondola de retail doble cara con espina, estantes y extremos
function GondolaGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const spineT = d * 0.065
  const shelfH = Math.max(h * 0.016, 0.008)
  const reach = (d - spineT) / 2
  const levels = Math.max(3, Math.round(h * 2.2))
  const capT = w * 0.038
  const spineMat = <meshStandardMaterial color={lighten(color, -12)} roughness={0.45} metalness={0.22} />
  const shelfMat = <meshStandardMaterial color={color} roughness={0.4} metalness={0.16} />
  const capMat = <meshStandardMaterial color={color} roughness={0.38} metalness={0.18} />
  return (
    <group>
      <mesh castShadow receiveShadow><boxGeometry args={[w, h, spineT]} />{spineMat}</mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - capT / 2), 0, 0]} castShadow>
          <boxGeometry args={[capT, h, d]} />{capMat}
        </mesh>
      ))}
      {Array.from({ length: levels }).map((_, i) => {
        const y = -h / 2 + (h / levels) * i + h / levels / 2
        return (
          <group key={i}>
            <mesh position={[0, y, reach / 2 + spineT / 2]} castShadow>
              <boxGeometry args={[w - capT * 2, shelfH, reach]} />{shelfMat}
            </mesh>
            <mesh position={[0, y, -reach / 2 - spineT / 2]} castShadow>
              <boxGeometry args={[w - capT * 2, shelfH, reach]} />{shelfMat}
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// 12. STAND_MODULAR — stand expo con pared trasera, laterales y mostrador frontal
function StandModularGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const wallT = Math.max(w * 0.04, 0.02)
  const platH = h * 0.055
  const backH = h - platH
  const sideW = d * 0.68
  const ctrW = w * 0.44
  const ctrH = h * 0.37
  const ctrD = d * 0.32
  const bodyMat = <meshStandardMaterial color={color} roughness={0.34} metalness={0.08} />
  const sideMat = <meshStandardMaterial color={lighten(color, 10)} roughness={0.34} metalness={0.08} />
  const platMat = <meshStandardMaterial color={lighten(color, -20)} roughness={0.6} metalness={0.1} />
  return (
    <group>
      <mesh position={[0, -h / 2 + platH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, platH, d]} />{platMat}
      </mesh>
      <mesh position={[0, -h / 2 + platH + backH / 2, -d / 2 + wallT / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, backH, wallT]} />{bodyMat}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - wallT / 2), -h / 2 + platH + backH * 0.58 / 2, -d / 2 + sideW / 2]} castShadow>
          <boxGeometry args={[wallT, backH * 0.58, sideW]} />{sideMat}
        </mesh>
      ))}
      <mesh position={[0, -h / 2 + platH + ctrH / 2, d / 2 - ctrD / 2]} castShadow receiveShadow>
        <boxGeometry args={[ctrW, ctrH, ctrD]} />{sideMat}
      </mesh>
    </group>
  )
}

// 13. LAMP — lampara de piso con poste, pantalla cónica y foco emissivo
function LampGeometry({ w, h, color }: { w: number; h: number; d?: number; color: string }) {
  const poleR = Math.max(w * 0.04, 0.008)
  const shadeR = w * 0.36
  const shadeH = h * 0.19
  const shadeY = h / 2 - shadeH * 0.55
  const baseR = w * 0.24
  const baseH = h * 0.04
  return (
    <group>
      <mesh position={[0, -h / 2 + baseH / 2, 0]} receiveShadow>
        <cylinderGeometry args={[baseR, baseR * 1.22, baseH, 16]} />
        <meshStandardMaterial color="#282E3C" roughness={0.38} metalness={0.52} />
      </mesh>
      <mesh castShadow>
        <cylinderGeometry args={[poleR, poleR, h * 0.86, 8]} />
        <meshStandardMaterial color="#303848" roughness={0.32} metalness={0.62} />
      </mesh>
      <mesh position={[0, shadeY, 0]} castShadow>
        <cylinderGeometry args={[shadeR, shadeR * 0.5, shadeH, 16, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.68} metalness={0.0} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, shadeY - shadeH * 0.25, 0]}>
        <sphereGeometry args={[poleR * 1.9, 8, 8]} />
        <meshStandardMaterial color="#FFF8E0" emissive="#FFF8E0" emissiveIntensity={1.4} roughness={0} />
      </mesh>
    </group>
  )
}

// ─── Geometrías de escena / props ────────────────────────────────────────────

function DoorGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const fT = Math.max(w * 0.07, 0.05)
  const lD = Math.max(d, 0.04)
  const frameMat  = <meshStandardMaterial color={color} roughness={0.45} metalness={0.06} />
  const leafMat   = <meshStandardMaterial color={lighten(color, 14)} roughness={0.32} metalness={0.04} />
  const handleMat = <meshStandardMaterial color="#B8BEC8" roughness={0.12} metalness={0.88} />
  return (
    <group>
      <mesh position={[-w / 2 + fT / 2, 0, 0]} castShadow><boxGeometry args={[fT, h, lD * 1.3]} />{frameMat}</mesh>
      <mesh position={[w / 2 - fT / 2, 0, 0]} castShadow><boxGeometry args={[fT, h, lD * 1.3]} />{frameMat}</mesh>
      <mesh position={[0, h / 2 - fT / 2, 0]} castShadow><boxGeometry args={[w, fT, lD * 1.3]} />{frameMat}</mesh>
      <mesh position={[w * 0.03, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[w - fT * 2 - 0.01, h - fT - 0.01, lD]} />{leafMat}
      </mesh>
      <mesh position={[w * 0.03, h * 0.1, lD / 2 + 0.005]}>
        <boxGeometry args={[(w - fT * 2) * 0.7, h * 0.55, 0.006]} />
        <meshStandardMaterial color={lighten(color, -6)} roughness={0.4} metalness={0} />
      </mesh>
      <mesh position={[w / 2 - fT - 0.05, 0, lD / 2 + 0.02]} castShadow>
        <sphereGeometry args={[0.018, 8, 8]} />{handleMat}
      </mesh>
    </group>
  )
}

function WindowFrameGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const fT = Math.max(w * 0.06, 0.04)
  const gD = Math.max(d, 0.02)
  const frameMat = <meshStandardMaterial color={color} roughness={0.4} metalness={0.06} />
  const glassMat = <meshStandardMaterial color="#88CCDD" roughness={0.02} metalness={0.04} transparent opacity={0.38} />
  const iW = (w - fT * 2) / 2 - fT / 4
  const iH = h - fT * 2
  return (
    <group>
      <mesh position={[-w / 2 + fT / 2, 0, 0]} castShadow><boxGeometry args={[fT, h, gD * 2]} />{frameMat}</mesh>
      <mesh position={[w / 2 - fT / 2, 0, 0]} castShadow><boxGeometry args={[fT, h, gD * 2]} />{frameMat}</mesh>
      <mesh position={[0, h / 2 - fT / 2, 0]} castShadow><boxGeometry args={[w, fT, gD * 2]} />{frameMat}</mesh>
      <mesh position={[0, -h / 2 + fT / 2, 0]} castShadow><boxGeometry args={[w, fT, gD * 2]} />{frameMat}</mesh>
      <mesh position={[0, 0, 0]}><boxGeometry args={[fT * 0.7, h - fT * 2, gD * 2]} />{frameMat}</mesh>
      <mesh position={[-iW / 2 - fT / 4, 0, 0]}><planeGeometry args={[iW, iH]} />{glassMat}</mesh>
      <mesh position={[iW / 2 + fT / 4, 0, 0]}><planeGeometry args={[iW, iH]} />{glassMat}</mesh>
    </group>
  )
}

function PlantPotGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const r    = Math.min(w, d) / 2
  const potH = h * 0.30
  const trkH = h * 0.18
  const trkR = r * 0.10
  const folR = r * 0.90
  return (
    <group>
      <mesh position={[0, -h / 2 + potH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.82, r * 0.66, potH, 10]} />
        <meshStandardMaterial color="#6B4E3D" roughness={0.72} metalness={0} />
      </mesh>
      <mesh position={[0, -h / 2 + potH + trkH / 2, 0]} castShadow>
        <cylinderGeometry args={[trkR, trkR * 1.2, trkH, 6]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.80} metalness={0} />
      </mesh>
      <mesh position={[0, -h / 2 + potH + trkH + folR * 0.72, 0]} castShadow>
        <sphereGeometry args={[folR, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.82} metalness={0} />
      </mesh>
    </group>
  )
}

function DividerPanelGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const thick  = Math.max(d, 0.04)
  const postW  = 0.045
  const isGlass = color.toLowerCase().startsWith('#88')
  const panelMat = isGlass
    ? <meshStandardMaterial color={color} roughness={0.02} metalness={0.04} transparent opacity={0.42} />
    : <meshStandardMaterial color={color} roughness={0.55} metalness={0.02} />
  const postMat = <meshStandardMaterial color="#909090" roughness={0.28} metalness={0.52} />
  return (
    <group>
      <mesh position={[-w / 2 + postW / 2, 0, 0]} castShadow><boxGeometry args={[postW, h, thick * 1.2]} />{postMat}</mesh>
      <mesh position={[w / 2 - postW / 2, 0, 0]} castShadow><boxGeometry args={[postW, h, thick * 1.2]} />{postMat}</mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w - postW * 2, h * 0.97, thick]} />{panelMat}
      </mesh>
    </group>
  )
}

function CarpetRugGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const rugH = Math.max(h, 0.018)
  return (
    <mesh receiveShadow>
      <boxGeometry args={[w, rugH, d]} />
      <meshStandardMaterial color={color} roughness={0.96} metalness={0} />
    </mesh>
  )
}

function SignTotemGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const postW  = Math.max(w * 0.09, 0.04)
  const boardH = h * 0.48
  const boardD = Math.max(d, 0.04)
  const legH   = h - boardH
  const bodyMat  = <meshStandardMaterial color={color} roughness={0.38} metalness={0.14} />
  const boardMat = <meshStandardMaterial color={lighten(color, 8)} roughness={0.36} metalness={0.08} />
  return (
    <group>
      <mesh position={[0, -h / 2 + 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.56, 0.06, boardD * 2.5]} />{bodyMat}
      </mesh>
      <mesh position={[0, -h / 2 + 0.07 + legH / 2, 0]} castShadow>
        <boxGeometry args={[postW, legH, postW]} />{bodyMat}
      </mesh>
      <mesh position={[0, h / 2 - boardH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, boardH, boardD]} />{boardMat}
      </mesh>
    </group>
  )
}

function CeilingLampGeometry({ w, h, color }: { w: number; h: number; d?: number; color: string }) {
  const wireH  = h * 0.60
  const shadeR = w * 0.44
  const shadeH = h * 0.30
  return (
    <group>
      <mesh position={[0, h / 2 - wireH / 2, 0]}>
        <cylinderGeometry args={[0.007, 0.007, wireH, 4]} />
        <meshStandardMaterial color="#303848" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, h / 2 - wireH - shadeH / 2, 0]} castShadow>
        <cylinderGeometry args={[shadeR, shadeR * 0.42, shadeH, 16, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.65} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, h / 2 - wireH - shadeH * 0.78, 0]}>
        <sphereGeometry args={[shadeR * 0.20, 8, 8]} />
        <meshStandardMaterial color="#FFF8E0" emissive="#FFF8E0" emissiveIntensity={2.0} roughness={0.02} />
      </mesh>
      <mesh position={[0, h / 2 - wireH - shadeH / 2, 0]}>
        <cylinderGeometry args={[shadeR * 1.02, shadeR * 0.44, shadeH * 0.18, 16]} />
        <meshStandardMaterial color={lighten(color, -10)} roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  )
}

// ─── Geometrías de Arquitectura / Construcción ───────────────────────────────

function WallStraightGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const isNew      = color === '#4ADE80' // verde = nuevo
  const isDemolish = color === '#FB7185' // rojo  = demoler
  const baseColor  = isNew ? '#4ADE80' : isDemolish ? '#FB7185' : color
  const opacity    = isDemolish ? 0.55 : 1.0
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.82}
          metalness={0.02}
          transparent={isDemolish}
          opacity={opacity}
          wireframe={isDemolish}
        />
      </mesh>
      {/* línea superior para contraste visual */}
      <mesh position={[0, h / 2 - 0.015, 0]}>
        <boxGeometry args={[w, 0.03, d + 0.01]} />
        <meshStandardMaterial color={lighten(baseColor, 30)} roughness={0.5} metalness={0} />
      </mesh>
    </group>
  )
}

function WallLowGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  return <WallStraightGeometry w={w} h={h} d={d} color={color} />
}

function ColumnGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const r = Math.min(w, d) / 2
  return (
    <group>
      {/* fuste */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.82, r * 0.9, h * 0.88, 10]} />
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.04} />
      </mesh>
      {/* capitel */}
      <mesh position={[0, h * 0.44 + 0.06, 0]} castShadow>
        <boxGeometry args={[w * 1.05, h * 0.08, d * 1.05]} />
        <meshStandardMaterial color={lighten(color, 10)} roughness={0.7} metalness={0.04} />
      </mesh>
      {/* basa */}
      <mesh position={[0, -h * 0.44 - 0.04, 0]} receiveShadow>
        <boxGeometry args={[w * 1.08, h * 0.06, d * 1.08]} />
        <meshStandardMaterial color={lighten(color, 8)} roughness={0.7} metalness={0.04} />
      </mesh>
    </group>
  )
}

function RoofFlatGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const thick = Math.max(h, 0.18)
  return (
    <group>
      {/* losa principal */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, thick, d]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.04} />
      </mesh>
      {/* pretil perimetral */}
      {[
        { pos: [0,           thick / 2 + 0.1, -d / 2 + 0.05], args: [w, 0.2, 0.1] as [number,number,number] },
        { pos: [0,           thick / 2 + 0.1,  d / 2 - 0.05], args: [w, 0.2, 0.1] as [number,number,number] },
        { pos: [-w / 2 + 0.05, thick / 2 + 0.1, 0           ], args: [0.1, 0.2, d] as [number,number,number] },
        { pos: [ w / 2 - 0.05, thick / 2 + 0.1, 0           ], args: [0.1, 0.2, d] as [number,number,number] },
      ].map((p, i) => (
        <mesh key={i} position={p.pos as [number, number, number]} castShadow>
          <boxGeometry args={p.args} />
          <meshStandardMaterial color={lighten(color, -8)} roughness={0.8} metalness={0.04} />
        </mesh>
      ))}
    </group>
  )
}

function RoofSlopeGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  // Techo a dos aguas con triángulos laterales + planos inclinados
  const ridgeH = Math.max(h * 0.7, 0.4)
  return (
    <group>
      {/* inclinación frontal */}
      <mesh rotation={[Math.atan2(ridgeH, d / 2), 0, 0]} position={[0, ridgeH / 4, -d / 8]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.08, Math.sqrt((d / 2) ** 2 + ridgeH ** 2)]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* inclinación trasera */}
      <mesh rotation={[-Math.atan2(ridgeH, d / 2), 0, 0]} position={[0, ridgeH / 4, d / 8]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.08, Math.sqrt((d / 2) ** 2 + ridgeH ** 2)]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* tapas triangulares */}
      {[-w / 2 + 0.04, w / 2 - 0.04].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <boxGeometry args={[0.08, ridgeH * 0.5, d * 0.6]} />
          <meshStandardMaterial color={lighten(color, -10)} roughness={0.8} metalness={0.04} />
        </mesh>
      ))}
    </group>
  )
}

function StaircaseGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const steps = 6
  const stepH = h / steps
  const stepD = d / steps
  return (
    <group>
      {Array.from({ length: steps }).map((_, i) => (
        <mesh key={i} position={[0, -h / 2 + stepH * i + stepH / 2, -d / 2 + stepD * i + stepD / 2]}
          castShadow receiveShadow>
          <boxGeometry args={[w, stepH * (i + 1), stepD]} />
          <meshStandardMaterial color={color} roughness={0.78} metalness={0.06} />
        </mesh>
      ))}
    </group>
  )
}

function TerrainBaseGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const baseH = Math.max(h, 0.08)
  return (
    <mesh receiveShadow>
      <boxGeometry args={[w, baseH, d]} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </mesh>
  )
}

function ArchOpeningGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const jamb = Math.max(w * 0.08, 0.06)
  const thick = Math.max(d, 0.06)
  const archH = h * 0.38
  const mat = <meshStandardMaterial color={color} roughness={0.5} metalness={0.06} />
  return (
    <group>
      {/* jambas laterales */}
      <mesh position={[-w / 2 + jamb / 2, 0, 0]} castShadow><boxGeometry args={[jamb, h, thick]} />{mat}</mesh>
      <mesh position={[ w / 2 - jamb / 2, 0, 0]} castShadow><boxGeometry args={[jamb, h, thick]} />{mat}</mesh>
      {/* dintel recto */}
      <mesh position={[0, h / 2 - jamb / 2, 0]} castShadow>
        <boxGeometry args={[w, jamb, thick]} />{mat}
      </mesh>
      {/* arco simulado (serie de cajas) */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (Math.PI * i) / 6
        const r = (w - jamb * 2) / 2
        const x = Math.cos(angle) * r
        const y = h / 2 - jamb - archH + Math.sin(angle) * archH
        return (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, -angle + Math.PI / 2]} castShadow>
            <boxGeometry args={[jamb * 0.9, archH * 0.35, thick]} />{mat}
          </mesh>
        )
      })}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BedGeometry — cama real con cabecera, base, colchón y almohadas
// ─────────────────────────────────────────────────────────────────────────────
function BedGeometry({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  // w = ancho (ej. 160cm), h = altura total (ej. 55cm), d = largo (ej. 200cm)
  const frameColor  = color
  const mattressCol = '#EEEAE4'
  const pillowCol   = '#F5F2EE'
  const blanketCol  = '#C8BDB0'
  const frameH = Math.max(h * 0.28, 0.06)
  const headH  = Math.max(h * 1.6, 0.45)
  const mattressH = h - frameH
  const mattressThick = Math.max(mattressH * 0.7, 0.05)
  const legW = Math.max(w * 0.04, 0.03)
  const legH = frameH * 0.9
  return (
    <group>
      {/* Cabecera */}
      <mesh position={[0, headH / 2 - h / 2, -d / 2 + 0.04]} castShadow>
        <boxGeometry args={[w * 0.96, headH, 0.08]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Pie de cama */}
      <mesh position={[0, h * 0.2, d / 2 - 0.04]} castShadow>
        <boxGeometry args={[w * 0.96, h * 0.5, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Base / bastidor */}
      <mesh position={[0, -h / 2 + frameH / 2, 0]} castShadow>
        <boxGeometry args={[w * 0.96, frameH, d * 0.96]} />
        <meshStandardMaterial color={frameColor} roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Patas x4 */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (w / 2 - legW), -h / 2 - legH / 2, sz * (d / 2 - legW)]} castShadow>
          <boxGeometry args={[legW, legH, legW]} />
          <meshStandardMaterial color={frameColor} roughness={0.7} metalness={0.05} />
        </mesh>
      ))}
      {/* Colchon */}
      <mesh position={[0, -h / 2 + frameH + mattressThick / 2, 0]} castShadow>
        <boxGeometry args={[w * 0.94, mattressThick, d * 0.92]} />
        <meshStandardMaterial color={mattressCol} roughness={0.85} metalness={0.0} />
      </mesh>
      {/* Sabana / cobija (plana sobre colchon) */}
      <mesh position={[0, -h / 2 + frameH + mattressThick + 0.015, d * 0.08]} castShadow>
        <boxGeometry args={[w * 0.92, 0.03, d * 0.72]} />
        <meshStandardMaterial color={blanketCol} roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Almohadas x2 */}
      {[-0.28, 0.28].map((ox, i) => (
        <mesh key={i}
          position={[ox * w, -h / 2 + frameH + mattressThick + 0.045, -d / 2 + d * 0.14]}
          castShadow>
          <boxGeometry args={[w * 0.38, 0.09, 0.52]} />
          <meshStandardMaterial color={pillowCol} roughness={0.95} metalness={0.0} />
        </mesh>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SteelBeamGeometry — perfil I / H de acero estructural
// ─────────────────────────────────────────────────────────────────────────────
function SteelBeamGeometry({ w, h, d, color: _color }: { w: number; h: number; d: number; color: string }) {
  // w = largo de la viga, h = altura del perfil, d = ancho del ala
  const steelCol = '#8A9BA8'
  const flangeT  = Math.max(h * 0.14, 0.02)   // grosor de ala (flange)
  const webT     = Math.max(d * 0.12, 0.015)   // grosor del alma (web)
  const webH     = h - flangeT * 2
  return (
    <group>
      {/* Ala superior */}
      <mesh position={[0, h / 2 - flangeT / 2, 0]} castShadow>
        <boxGeometry args={[w, flangeT, d]} />
        <meshStandardMaterial color={steelCol} roughness={0.35} metalness={0.75} />
      </mesh>
      {/* Alma central */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[w, webH, webT]} />
        <meshStandardMaterial color={steelCol} roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Ala inferior */}
      <mesh position={[0, -h / 2 + flangeT / 2, 0]} castShadow>
        <boxGeometry args={[w, flangeT, d]} />
        <meshStandardMaterial color={steelCol} roughness={0.35} metalness={0.75} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RebarBundleGeometry — paquete de varillas corrugadas de construccion
// ─────────────────────────────────────────────────────────────────────────────
function RebarBundleGeometry({ w, h, d, color: _color }: { w: number; h: number; d: number; color: string }) {
  // w = largo del paquete, h/d se usan para el patron de varillas
  const rebarCol  = '#5A6068'
  const bindCol   = '#2E3236'
  const rebarR    = Math.max(Math.min(h, d) * 0.08, 0.008)
  // patron hexagonal: centro + 6 alrededor
  const offsets: [number, number][] = [
    [0, 0],
    [rebarR * 2.4, 0],
    [-rebarR * 2.4, 0],
    [rebarR * 1.2, rebarR * 2.1],
    [-rebarR * 1.2, rebarR * 2.1],
    [rebarR * 1.2, -rebarR * 2.1],
    [-rebarR * 1.2, -rebarR * 2.1],
  ]
  // Posiciones de los collares de amarre (cada ~50cm logicamente)
  const bindCount = Math.max(Math.round(w / 0.5), 2)
  return (
    <group>
      {offsets.map(([ox, oz], i) => (
        <mesh key={i} position={[0, ox, oz]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[rebarR, rebarR, w, 7]} />
          <meshStandardMaterial color={rebarCol} roughness={0.6} metalness={0.55} />
        </mesh>
      ))}
      {/* Collares de amarre */}
      {Array.from({ length: bindCount }).map((_, bi) => {
        const x = -w / 2 + (w / (bindCount + 1)) * (bi + 1)
        return (
          <mesh key={`bind-${bi}`} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[rebarR * 2.8, rebarR * 0.6, 6, 12]} />
            <meshStandardMaterial color={bindCol} roughness={0.7} metalness={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GlassPanelGeometry — cancel de vidrio con marco de aluminio
// ─────────────────────────────────────────────────────────────────────────────
function GlassPanelGeometry({ w, h, d, color: _color }: { w: number; h: number; d: number; color: string }) {
  const frameCol = '#B8BEC4'    // aluminio anodizado
  const glassCol = '#C5E0EC'    // vidrio azulado
  const frameT   = Math.max(w * 0.04, 0.025)
  const thick    = Math.max(d, 0.03)
  return (
    <group>
      {/* Marco: arriba, abajo, izquierda, derecha */}
      <mesh position={[0,  h / 2 - frameT / 2, 0]} castShadow>
        <boxGeometry args={[w, frameT, thick]} />
        <meshStandardMaterial color={frameCol} roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, -h / 2 + frameT / 2, 0]} castShadow>
        <boxGeometry args={[w, frameT, thick]} />
        <meshStandardMaterial color={frameCol} roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[-w / 2 + frameT / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameT, h, thick]} />
        <meshStandardMaterial color={frameCol} roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[ w / 2 - frameT / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameT, h, thick]} />
        <meshStandardMaterial color={frameCol} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Panel de vidrio */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w - frameT * 2, h - frameT * 2, thick * 0.4]} />
        <meshStandardMaterial
          color={glassCol}
          roughness={0.05}
          metalness={0.1}
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  )
}

// ─── Main ProductObject ───────────────────────────────────────────────────────

export function ProductObject({ object }: ProductObjectProps) {
  const { selectedObjectId, setSelectedObjectId, activeTool, snapEnabled, updateObject } =
    useBuilderStore()

  const isSelected = selectedObjectId === object.id
  const showTransform = isSelected && (activeTool === 'move' || activeTool === 'rotate')

  const w = (object.configuration?.width as number) ?? 60
  const h = (object.configuration?.height as number) ?? 180
  const d = (object.configuration?.depth as number) ?? 45
  const geoType = (object.metadata?.geometry_type as GeometryType | undefined) ?? 'box_tall'
  const modelUrl = object.metadata?.model_url as string | undefined

  const isDraggingRef = useRef(false)
  const [groupNode, setGroupNode] = useState<THREE.Group | null>(null)

  useEffect(() => {
    if (!isDraggingRef.current && groupNode) {
      const baseY = object.position_y > 0 ? object.position_y : h / 2
      groupNode.position.set(object.position_x, baseY, object.position_z)
      groupNode.rotation.set(object.rotation_x ?? 0, object.rotation_y, object.rotation_z ?? 0)
    }
  }, [object.position_x, object.position_y, object.position_z, object.rotation_y, object.rotation_x, object.rotation_z, h, groupNode])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setSelectedObjectId(object.id)
  }

  const handleDragStart = () => {
    isDraggingRef.current = true
    if (orbitControlsRef.current) orbitControlsRef.current.enabled = false
  }

  const handleDragEnd = () => {
    isDraggingRef.current = false
    if (orbitControlsRef.current) orbitControlsRef.current.enabled = true
    if (!groupNode) return
    updateObject(object.id, {
      position_x: parseFloat(groupNode.position.x.toFixed(3)),
      position_y: parseFloat(groupNode.position.y.toFixed(3)),
      position_z: parseFloat(groupNode.position.z.toFixed(3)),
      rotation_y: parseFloat(groupNode.rotation.y.toFixed(4)),
    })
  }

  const productColor = isSelected ? '#F98058' : (object.color ?? '#4A5568')
  const baseProps = { w, h, d, color: productColor }

  const renderProcedural = () => {
    switch (geoType) {
      case 'cabinet':       return <CabinetGeometry {...baseProps} />
      case 'shelf_rack':    return <ShelfRackGeometry {...baseProps} />
      case 'box_flat':      return <BoxFlatGeometry {...baseProps} />
      case 'panel_v':       return <PanelVGeometry {...baseProps} />
      case 'seating':       return <SeatingGeometry {...baseProps} />
      case 'vehicle':       return <VehicleGeometry {...baseProps} />
      case 'kitchen_unit':  return <KitchenUnitGeometry {...baseProps} />
      case 'closet':        return <ClosetGeometry {...baseProps} />
      case 'medical_bed':   return <MedicalBedGeometry {...baseProps} />
      case 'counter':       return <CounterGeometry {...baseProps} />
      case 'gondola':       return <GondolaGeometry {...baseProps} />
      case 'stand_modular': return <StandModularGeometry {...baseProps} />
      case 'lamp':          return <LampGeometry {...baseProps} />
      case 'door':          return <DoorGeometry {...baseProps} />
      case 'window_frame':  return <WindowFrameGeometry {...baseProps} />
      case 'plant_pot':     return <PlantPotGeometry {...baseProps} />
      case 'divider_panel': return <DividerPanelGeometry {...baseProps} />
      case 'carpet_rug':    return <CarpetRugGeometry {...baseProps} />
      case 'sign_totem':    return <SignTotemGeometry {...baseProps} />
      case 'ceiling_lamp':  return <CeilingLampGeometry {...baseProps} />
      // ── Arquitectura / Construcción ─────────────────────────────────────
      case 'wall_straight': return <WallStraightGeometry {...baseProps} />
      case 'wall_low':      return <WallLowGeometry {...baseProps} />
      case 'column':        return <ColumnGeometry {...baseProps} />
      case 'roof_flat':     return <RoofFlatGeometry {...baseProps} />
      case 'roof_slope':    return <RoofSlopeGeometry {...baseProps} />
      case 'staircase':     return <StaircaseGeometry {...baseProps} />
      case 'terrain_base':  return <TerrainBaseGeometry {...baseProps} />
      case 'arch_opening':  return <ArchOpeningGeometry {...baseProps} />
      // ── Nuevas geometrias (construccion y mobiliario) ───────────────────
      case 'bed':          return <BedGeometry {...baseProps} />
      case 'steel_beam':   return <SteelBeamGeometry {...baseProps} />
      case 'rebar_bundle': return <RebarBundleGeometry {...baseProps} />
      case 'glass_panel':  return <GlassPanelGeometry {...baseProps} />
      default:              return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={productColor} roughness={0.35} metalness={0.2} />
        </mesh>
      )
    }
  }

  const renderContent = () => {
    if (modelUrl) {
      const fallback = renderProcedural()
      return (
        <GLBErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <GLBScene url={modelUrl} w={w} h={h} d={d} />
          </Suspense>
        </GLBErrorBoundary>
      )
    }
    return renderProcedural()
  }

  return (
    <>
      <group ref={setGroupNode} onClick={handleClick}>
        {renderContent()}

        {isSelected && (
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(w + 0.02 * w, h + 0.02 * h, d + 0.02 * d)]} />
            <lineBasicMaterial color="#F98058" linewidth={1} />
          </lineSegments>
        )}

        <mesh position={[0, -h / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w * 1.14, d * 1.14]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.1} depthWrite={false} />
        </mesh>
      </group>

      {showTransform && groupNode && (
        <TransformControls
          object={groupNode}
          mode={activeTool === 'rotate' ? 'rotate' : 'translate'}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          showX={true}
          showY={true}
          showZ={true}
          translationSnap={snapEnabled ? 0.5 : null}
          rotationSnap={snapEnabled ? Math.PI / 8 : null}
          size={0.7}
        />
      )}
    </>
  )
}
