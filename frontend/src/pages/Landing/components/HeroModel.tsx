import { Center, Environment, Lightformer } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import { MathUtils, type Group } from 'three'
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

// Peek choreography, in seconds and scene units (metres).
const ENTER_DELAY = 0.5
const ENTER_DURATION = 1.6
const PEEK_PERIOD = 6.5
const VISIBLE_SHARE = 0.72 // how much of the cabinet shows when it rests at the edge
const EXTRA_LEAN = 0.18 // how much further it leans out during a peek
const MODEL_WIDTH = 1.14

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/** Positions the cabinet at the canvas's right edge and animates the peek. */
function PeekingCabinet({ model, reducedMotion }: { model: ProductModel; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  const config = useMemo(() => normalizeModelConfig(model.config), [model.config])

  useFrame((state, delta) => {
    const node = group.current
    if (!node) return

    const edge = state.viewport.width / 2
    const hidden = edge + MODEL_WIDTH / 2 + 0.1
    const resting = edge + MODEL_WIDTH / 2 - MODEL_WIDTH * VISIBLE_SHARE

    if (reducedMotion) {
      node.position.x = resting
      node.rotation.set(0, 0.5, 0.04)
      return
    }

    const t = state.clock.elapsedTime
    const enter = easeOutCubic(MathUtils.clamp((t - ENTER_DELAY) / ENTER_DURATION, 0, 1))
    // A slow swell that peaks once per period: lean out, hold briefly, settle back.
    const cycle = Math.pow(Math.max(0, Math.sin(((t - ENTER_DELAY - ENTER_DURATION) / PEEK_PERIOD) * Math.PI * 2)), 3)
    const peek = enter >= 1 ? cycle : 0
    // The pointer on the right half coaxes it out a little more.
    const coax = Math.max(0, state.pointer.x) * 0.12

    const targetX = MathUtils.lerp(hidden, resting, enter) - (peek * EXTRA_LEAN + coax) * enter
    node.position.x = enter < 1 ? targetX : MathUtils.damp(node.position.x, targetX, 6, delta)
    // Positive yaw turns the drawer fronts towards the headline on the left.
    node.rotation.y = MathUtils.lerp(0.25, 0.5 + peek * 0.12, enter)
    // Tip the top towards the page, as if leaning round a corner.
    node.rotation.z = (0.03 + peek * 0.05) * enter
    node.position.y = Math.sin(t * 0.8) * 0.015
  })

  return (
    <group ref={group} position={[10, 0, 0]}>
      <Center>
        <FurnitureModel url={model.url} config={config} tint={null} onBoundsChange={ignoreBounds} />
      </Center>
    </group>
  )
}

/**
 * Decorative hero model: the cabinet hides past the right edge of the screen and leans
 * out to peek at the page. No controls; the full viewer lives on the product page.
 */
export function HeroModel({ model, active }: HeroModelProps) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active && !reducedMotion ? 'always' : 'demand'}
      camera={{ fov: 30, position: [0, 0.15, 5.8] }}
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
        <PeekingCabinet model={model} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  )
}
