import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useBuilderStore } from '@/store/builderStore'
import * as THREE from 'three'

const PERSPECTIVE_POS = new THREE.Vector3(8, 6, 8)
const TOP_POS = new THREE.Vector3(0, 20, 0.01)
const LOOK_TARGET = new THREE.Vector3(0, 0, 0)

export function CameraController() {
  const { camera } = useThree()
  const cameraMode = useBuilderStore((s) => s.cameraMode)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      camera.position.copy(PERSPECTIVE_POS)
      camera.lookAt(LOOK_TARGET)
      initialized.current = true
    }
  }, [camera])

  useEffect(() => {
    if (cameraMode === 'top') {
      camera.position.copy(TOP_POS)
      camera.lookAt(LOOK_TARGET)
    } else {
      camera.position.copy(PERSPECTIVE_POS)
      camera.lookAt(LOOK_TARGET)
    }
  }, [cameraMode, camera])

  return null
}
