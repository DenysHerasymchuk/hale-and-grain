import { Bounds, Center, ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useState, type RefObject } from 'react'
import { CameraRig, type ViewerCameraApi } from './CameraRig'
import { FurnitureModel } from './FurnitureModel'
import type { SafeModelConfig, Vec3 } from './modelConfig'

const BACKGROUND = '#ede6db'
const DEFAULT_DIRECTION: Vec3 = [-1.4, 0.7, 2.2]

interface ViewerSceneProps {
  url: string
  config: SafeModelConfig
  tint: string | null
  reducedMotion: boolean
  apiRef: RefObject<ViewerCameraApi | null>
  onReady: () => void
}

export function ViewerScene({ url, config, tint, reducedMotion, apiRef, onReady }: ViewerSceneProps) {
  const [radius, setRadius] = useState(1)

  const handleBounds = (nextRadius: number) => {
    setRadius(nextRadius)
    onReady()
  }

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      // Render only when something changes: orbiting, damping, loading. Idle viewers cost nothing.
      frameloop="demand"
      camera={{ fov: 32, near: 0.05, far: 100, position: DEFAULT_DIRECTION }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, radius * 8, radius * 16]} />

      <ambientLight intensity={0.7} />
      <directionalLight
        castShadow
        position={[-3, 5, 4]}
        intensity={2.6}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />

      {/* Procedural studio environment: no HDR download, consistent with the product renders. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.5} color="#fff4e6" position={[-3, 3, 4]} scale={[5, 3, 1]} />
        <Lightformer form="rect" intensity={2} color="#e9efff" position={[4, 2, 2]} scale={[4, 4, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[0, 5, -4]} scale={[8, 2, 1]} />
        <Lightformer form="circle" intensity={0.8} position={[0, -2, 0]} rotation-x={Math.PI / 2} scale={6} />
      </Environment>

      <Suspense fallback={null}>
        <Bounds margin={1.15} maxDuration={reducedMotion ? 0 : 0.6}>
          <group position={config.offset}>
            <Center top>
              <FurnitureModel url={url} config={config} tint={tint} onBoundsChange={handleBounds} />
            </Center>
          </group>
          <CameraRig apiRef={apiRef} defaultDirection={DEFAULT_DIRECTION} cameraPosition={config.cameraPosition} />
        </Bounds>
        <ContactShadows position={[0, 0.001, 0]} opacity={0.65} scale={radius * 4} blur={2.2} far={radius * 2} resolution={512} color="#3b2f25" />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan
        screenSpacePanning
        enableDamping={!reducedMotion}
        minDistance={radius * 1.1}
        maxDistance={radius * 5}
        // Stop just above the floor so the camera never dips under the model.
        maxPolarAngle={Math.PI / 2 - 0.04}
      />
    </Canvas>
  )
}
