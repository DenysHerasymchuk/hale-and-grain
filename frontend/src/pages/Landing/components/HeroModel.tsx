import { Bounds, Center, ContactShadows, Environment, Float, Lightformer, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
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

/**
 * Decorative floating model for the landing hero: transparent canvas over the dark
 * backdrop, gentle bob and turn, drag to spin. The full viewer lives on the product page.
 */
export function HeroModel({ model, active }: HeroModelProps) {
  const reducedMotion = usePrefersReducedMotion()
  const config = useMemo(() => normalizeModelConfig(model.config), [model.config])

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active && !reducedMotion ? 'always' : 'demand'}
      camera={{ fov: 30, position: [-2.6, 1.4, 4.2] }}
      gl={{ alpha: true, antialias: true }}
      aria-hidden
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[-3, 5, 4]} intensity={2.2} color="#fff1df" />
      {/* Warm rim from behind to separate the cabinet from the dark sea. */}
      <directionalLight position={[3, 2, -4]} intensity={1.6} color="#e2c49c" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#fff4e6" position={[-3, 3, 4]} scale={[5, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#c9b8ff" position={[4, 1, 2]} scale={[3, 3, 1]} />
        <Lightformer form="ring" intensity={2} color="#e2d3ba" position={[0, 4, -5]} scale={4} />
      </Environment>

      <Suspense fallback={null}>
        <Bounds fit clip margin={1.3}>
          <Float speed={reducedMotion ? 0 : 1.3} rotationIntensity={reducedMotion ? 0 : 0.25} floatIntensity={reducedMotion ? 0 : 0.7} floatingRange={[-0.04, 0.06]}>
            <Center>
              <FurnitureModel url={model.url} config={config} tint={null} onBoundsChange={ignoreBounds} />
            </Center>
          </Float>
        </Bounds>
        {/* Baked once: re-rendering the shadow every frame was the main cost of the floating model. */}
        <ContactShadows frames={1} position={[0, -1.05, 0]} opacity={0.55} scale={4} blur={2.8} far={2} resolution={256} color="#000000" />
      </Suspense>

      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.7}
        enableDamping
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
      />
    </Canvas>
  )
}
