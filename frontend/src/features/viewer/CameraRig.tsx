import { useBounds } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, type RefObject } from 'react'
import { Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Vec3 } from './modelConfig'

export interface ViewerCameraApi {
  reset: () => void
  zoom: (factor: number) => void
  rotate: (radians: number) => void
}

interface CameraRigProps {
  apiRef: RefObject<ViewerCameraApi | null>
  defaultDirection: Vec3
  cameraPosition: Vec3 | null
}

export function CameraRig({ apiRef, defaultDirection, cameraPosition }: CameraRigProps) {
  const bounds = useBounds()
  const camera = useThree((state) => state.camera)
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (!controls) return

    const reset = () => {
      const { center, distance } = bounds.refresh().getSize()
      if (cameraPosition) {
        camera.position.set(...cameraPosition)
        controls.target.copy(center)
        controls.update()
      } else {
        camera.position.copy(center).add(new Vector3(...defaultDirection).normalize().multiplyScalar(distance))
        bounds.fit()
      }
      invalidate()
    }

    const zoom = (factor: number) => {
      const offset = camera.position.clone().sub(controls.target)
      const length = Math.min(controls.maxDistance, Math.max(controls.minDistance, offset.length() / factor))
      camera.position.copy(controls.target).add(offset.setLength(length))
      controls.update()
      invalidate()
    }

    const rotate = (radians: number) => {
      const offset = camera.position.clone().sub(controls.target).applyAxisAngle(new Vector3(0, 1, 0), radians)
      camera.position.copy(controls.target).add(offset)
      controls.update()
      invalidate()
    }

    apiRef.current = { reset, zoom, rotate }
    reset()
    return () => {
      apiRef.current = null
    }
  }, [apiRef, bounds, camera, controls, invalidate, cameraPosition, defaultDirection])

  return null
}
