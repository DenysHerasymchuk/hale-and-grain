import { Bounds, Center, Environment, Lightformer } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import type { Group } from 'three'
import { FurnitureModel } from '@/features/viewer/FurnitureModel'
import { normalizeModelConfig } from '@/features/viewer/modelConfig'
import { usePrefersReducedMotion } from '@/features/viewer/usePrefersReducedMotion'
import type { ProductModel } from '@/types/api'

interface HeroModelProps {
  model: ProductModel
  /** Stops the render loop while the hero is scrolled out of view. */
  active: boolean
}

const ignoreBounds = () => {}
const TURN_SPEED = 0.35 // radians per second: one slow revolution every ~18 s

function TurningModel({ model, reducedMotion }: { model: ProductModel; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  const config = useMemo(() => normalizeModelConfig(model.config), [model.config])

  useFrame((_, delta) => {
    if (group.current && !reducedMotion) group.current.rotation.y += delta * TURN_SPEED
  })

  return (
    <group ref={group} rotation={[0, 0.6, 0]}>
      <Center>
        <FurnitureModel url={model.url} config={config} tint={null} onBoundsChange={ignoreBounds} />
      </Center>
    </group>
  )
}

/** Decorative hero model that turns slowly on the spot. The full viewer lives on the product page. */
export function HeroModel({ model, active }: HeroModelProps) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active && !reducedMotion ? 'always' : 'demand'}
      camera={{ fov: 30, position: [0, 0.6, 5] }}
      gl={{ alpha: true, antialias: true }}
      aria-hidden
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[-3, 4, 4]} intensity={2.2} color="#fff1df" />
      {/* Warm rim from behind so the silhouette separates from the dark backdrop. */}
      <directionalLight position={[3, 2, -4]} intensity={1.8} color="#e2c49c" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} color="#fff4e6" position={[-3, 3, 4]} scale={[5, 3, 1]} />
        <Lightformer form="ring" intensity={2} color="#e2d3ba" position={[0, 4, -5]} scale={4} />
      </Environment>

      <Suspense fallback={null}>
        {/* Fit once on the widest pose so the turning cabinet never clips the frame. */}
        <Bounds fit margin={1.05}>
          <TurningModel model={model} reducedMotion={reducedMotion} />
        </Bounds>
      </Suspense>
    </Canvas>
  )
}
