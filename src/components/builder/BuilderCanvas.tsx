import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { Suspense, useEffect } from 'react'
import * as THREE from 'three'
import { useBuilderStore } from '@/store/builderStore'
import { SceneFloor } from './SceneFloor'
import { SceneWalls } from './SceneWalls'
import { SceneDressing, VERTICAL_DRESSING } from './SceneDressing'
import { ProductObject } from './ProductObject'
import { CameraController } from './CameraController'
import { orbitControlsRef } from './sceneRefs'
import { useTheme } from '@/contexts/ThemeContext'

// ─── Presets visuales por vertical ───────────────────────────────────────────

type VerticalPreset = {
  bg: string
  ambient: number
  dirIntensity: number
  dirColor: string
  fillColor: string
  floor: string
}

const VERTICAL_PRESETS_DARK: Record<string, VerticalPreset> = {
  industrial_storage:   { bg: '#0D1117', ambient: 0.55, dirIntensity: 1.1,  dirColor: '#FFFFFF', fillColor: '#A7B3C2', floor: 'concrete' },
  furniture_kitchen:    { bg: '#130F0A', ambient: 0.62, dirIntensity: 0.95, dirColor: '#FFF6E8', fillColor: '#D8C4A8', floor: 'wood' },
  real_estate:          { bg: '#0F1318', ambient: 0.66, dirIntensity: 0.9,  dirColor: '#FFF8F0', fillColor: '#C8D4E0', floor: 'marble' },
  retail_layout:        { bg: '#0C0E14', ambient: 0.72, dirIntensity: 1.22, dirColor: '#F8F8FF', fillColor: '#D8E4F0', floor: 'polished' },
  event_stand:          { bg: '#080A10', ambient: 0.36, dirIntensity: 1.48, dirColor: '#F0ECFF', fillColor: '#7068C0', floor: 'expo' },
  medical_space:        { bg: '#0C1018', ambient: 0.8,  dirIntensity: 1.04, dirColor: '#F2F6FF', fillColor: '#B8C8DC', floor: 'medical' },
  exterior_enclosures:  { bg: '#0E1418', ambient: 0.65, dirIntensity: 1.3,  dirColor: '#F8F4E8', fillColor: '#A8B8C0', floor: 'concrete' },
  interior_design:      { bg: '#100C08', ambient: 0.7,  dirIntensity: 0.9,  dirColor: '#FFF6E8', fillColor: '#C0A880', floor: 'wood' },
  architecture_concept: { bg: '#0E1210', ambient: 0.58, dirIntensity: 1.2,  dirColor: '#FFF4E8', fillColor: '#B8A890', floor: 'concrete' },
}

const VERTICAL_PRESETS_LIGHT: Record<string, VerticalPreset> = {
  industrial_storage:   { bg: '#D8DDE6', ambient: 1.1,  dirIntensity: 1.4,  dirColor: '#FFFFFF', fillColor: '#B0C0D0', floor: 'concrete' },
  furniture_kitchen:    { bg: '#EDE8E0', ambient: 1.2,  dirIntensity: 1.2,  dirColor: '#FFF6E8', fillColor: '#C8B090', floor: 'wood' },
  real_estate:          { bg: '#E4EAF0', ambient: 1.2,  dirIntensity: 1.1,  dirColor: '#FFF8F0', fillColor: '#A0B8D0', floor: 'marble' },
  retail_layout:        { bg: '#E8EAF0', ambient: 1.3,  dirIntensity: 1.5,  dirColor: '#F8F8FF', fillColor: '#C0C8D8', floor: 'polished' },
  event_stand:          { bg: '#DCDAE8', ambient: 1.0,  dirIntensity: 1.6,  dirColor: '#F0ECFF', fillColor: '#9090C0', floor: 'expo' },
  medical_space:        { bg: '#E6EAF0', ambient: 1.4,  dirIntensity: 1.3,  dirColor: '#F2F6FF', fillColor: '#A0B8CC', floor: 'medical' },
  exterior_enclosures:  { bg: '#D8E0E8', ambient: 1.3,  dirIntensity: 1.5,  dirColor: '#F8F4E8', fillColor: '#A8C0B0', floor: 'concrete' },
  interior_design:      { bg: '#EDE8E0', ambient: 1.25, dirIntensity: 1.1,  dirColor: '#FFF6E8', fillColor: '#C8B090', floor: 'wood' },
  architecture_concept: { bg: '#E0DED8', ambient: 1.3,  dirIntensity: 1.4,  dirColor: '#F8F4E8', fillColor: '#B8B0A8', floor: 'concrete' },
}

function SceneBackground({ color }: { color: string }) {
  const { scene } = useThree()
  useEffect(() => {
    scene.background = new THREE.Color(color)
  }, [color, scene])
  return null
}

export function BuilderCanvas() {
  const { projectObjects, sceneConfig, gridEnabled, clearSelection, currentProject } = useBuilderStore()
  const { theme } = useTheme()

  const sceneWidth  = sceneConfig?.width  ?? 10
  const sceneDepth  = sceneConfig?.depth  ?? 8
  const verticalKey = (currentProject?.metadata?.vertical_key as string) ?? 'industrial_storage'
  const PRESETS = theme === 'light' ? VERTICAL_PRESETS_LIGHT : VERTICAL_PRESETS_DARK
  const preset = PRESETS[verticalKey] ?? PRESETS.industrial_storage
  const floorMat    = sceneConfig?.floor_material ?? preset.floor

  return (
    <Canvas
      shadows
      camera={{ position: [8, 6, 8], fov: 45, near: 0.1, far: 500 }}
      gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
      onPointerMissed={clearSelection}
    >
      <SceneBackground color={preset.bg} />
      <CameraController />

      {/* Iluminacion adaptada al vertical activo */}
      <ambientLight intensity={preset.ambient} />
      <directionalLight
        position={[10, 14, 6]}
        intensity={preset.dirIntensity}
        color={preset.dirColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <pointLight position={[-6, 5, -6]} intensity={0.35} color={preset.fillColor} />
      <hemisphereLight args={[theme === 'light' ? '#C8D4E0' : '#202D3D', theme === 'light' ? '#E8EDF2' : '#111923', theme === 'light' ? 0.8 : 0.4]} />

      {/* Escena */}
      <Suspense fallback={null}>
        <SceneFloor width={sceneWidth} depth={sceneDepth} material={floorMat} />
        {sceneConfig && <SceneWalls scene={sceneConfig} />}
        <SceneDressing
          sceneWidth={sceneWidth}
          sceneDepth={sceneDepth}
          preset={VERTICAL_DRESSING[verticalKey] ?? 'industrial'}
        />
        {projectObjects.map((obj) => (
          <ProductObject key={obj.id} object={obj} />
        ))}
      </Suspense>

      {/* Cuadricula */}
      {gridEnabled && (
        <Grid
          position={[0, 0.001, 0]}
          args={[sceneWidth + 4, sceneDepth + 4]}
          cellSize={1}
          cellThickness={0.4}
          cellColor="#243040"
          sectionSize={5}
          sectionThickness={0.8}
          sectionColor="#2D3F55"
          fadeDistance={60}
          fadeStrength={3}
          followCamera={false}
          infiniteGrid={false}
        />
      )}

      {/* Limites del espacio */}
      <lineSegments position={[0, 0, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(sceneWidth, 0.01, sceneDepth)]} />
        <lineBasicMaterial color="#2D3F55" linewidth={1} />
      </lineSegments>

      <OrbitControls
        ref={(ref: any) => { orbitControlsRef.current = ref }}
        makeDefault
        minDistance={2}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.1}
        enableDamping
        dampingFactor={0.07}
      />
    </Canvas>
  )
}
