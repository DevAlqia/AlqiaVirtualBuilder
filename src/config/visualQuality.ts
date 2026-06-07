/**
 * Visual Quality Mode
 *
 * development_debug: geometría procedural pura, sin GLBs, máxima velocidad de iteración
 * lightweight_demo:  GLBs cuando existen, fallback procedural visible, performance primero
 * investor_demo:     GLBs obligatorio, fallback solo si no hay alternativa, máxima calidad
 *
 * En investor_demo si un producto no tiene GLB y no hay alternativa de calidad,
 * se oculta en lugar de mostrar un cubo primitivo.
 */

export type VisualQualityMode = 'development_debug' | 'lightweight_demo' | 'investor_demo'

export interface VisualQualityConfig {
  mode: VisualQualityMode
  // GLB
  preferGLB: boolean           // intentar cargar GLB antes que geometría procedural
  hidePrimitiveFallback: boolean // ocultar objeto si el fallback es primitivo y no hay GLB
  // Rendering
  enableContactShadows: boolean
  shadowQuality: 'off' | 'low' | 'medium' | 'high'
  ambientOcclusionEnabled: boolean
  toneMapping: boolean
  // Materiales
  enablePBRMaterials: boolean
  floorTexturesEnabled: boolean
  wallTexturesEnabled: boolean
  // Escena
  useRichSceneProps: boolean     // cargar props decorativos automáticamente
  usePrearmedScenes: boolean     // cargar escenas prearmadas en lugar de vacías
  showLoadingSkeletons: boolean
  // Debug
  showBoundingBoxes: boolean
  showGeometryLabels: boolean
}

const CONFIGS: Record<VisualQualityMode, VisualQualityConfig> = {
  development_debug: {
    mode: 'development_debug',
    preferGLB: false,
    hidePrimitiveFallback: false,
    enableContactShadows: false,
    shadowQuality: 'low',
    ambientOcclusionEnabled: false,
    toneMapping: false,
    enablePBRMaterials: false,
    floorTexturesEnabled: false,
    wallTexturesEnabled: false,
    useRichSceneProps: false,
    usePrearmedScenes: false,
    showLoadingSkeletons: false,
    showBoundingBoxes: true,
    showGeometryLabels: true,
  },
  lightweight_demo: {
    mode: 'lightweight_demo',
    preferGLB: true,
    hidePrimitiveFallback: false,
    enableContactShadows: false,
    shadowQuality: 'medium',
    ambientOcclusionEnabled: false,
    toneMapping: true,
    enablePBRMaterials: true,
    floorTexturesEnabled: true,
    wallTexturesEnabled: true,
    useRichSceneProps: true,
    usePrearmedScenes: false,
    showLoadingSkeletons: true,
    showBoundingBoxes: false,
    showGeometryLabels: false,
  },
  investor_demo: {
    mode: 'investor_demo',
    preferGLB: true,
    hidePrimitiveFallback: false, // keep false until sufficient GLBs exist — change to true later
    enableContactShadows: true,
    shadowQuality: 'high',
    ambientOcclusionEnabled: true,
    toneMapping: true,
    enablePBRMaterials: true,
    floorTexturesEnabled: true,
    wallTexturesEnabled: true,
    useRichSceneProps: true,
    usePrearmedScenes: true,
    showLoadingSkeletons: true,
    showBoundingBoxes: false,
    showGeometryLabels: false,
  },
}

// Leer del env — VITE_VISUAL_QUALITY=investor_demo / lightweight_demo / development_debug
const envMode = (import.meta.env.VITE_VISUAL_QUALITY ?? 'lightweight_demo') as VisualQualityMode
export const VISUAL_QUALITY: VisualQualityConfig =
  CONFIGS[envMode] ?? CONFIGS.lightweight_demo

export function getQualityConfig(override?: VisualQualityMode): VisualQualityConfig {
  return override ? CONFIGS[override] : VISUAL_QUALITY
}
