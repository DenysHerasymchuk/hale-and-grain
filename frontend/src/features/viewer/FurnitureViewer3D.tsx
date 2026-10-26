import { useGLTF, useProgress } from '@react-three/drei'
import { FlipBackward, FlipForward, Minus, Plus, RefreshCcw01 } from '@untitledui/icons'
import { useCallback, useId, useMemo, useRef, useState, type FC } from 'react'
import type { ProductModel } from '@/types/api'
import { cx } from '@/utils/cx'
import type { ViewerCameraApi } from './CameraRig'
import { normalizeModelConfig } from './modelConfig'
import { ModelErrorBoundary } from './ModelErrorBoundary'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { useWebGLSupport } from './useWebGLSupport'
import { ViewerScene } from './ViewerScene'
import { ModelLoadingFallback, ViewerMessage, type FallbackImage } from './ViewerFallbacks'

export interface FurnitureViewer3DProps {
  model: ProductModel
  productName: string
  /** Hex colour multiplied into the model's target materials, e.g. for a finish variant. */
  tint?: string | null
  /** Shown if WebGL is unavailable or the model fails to load. */
  fallbackImage?: FallbackImage | null
  className?: string
}

const ROTATE_STEP = Math.PI / 8

export function FurnitureViewer3D({ model, productName, tint = null, fallbackImage, className }: FurnitureViewer3DProps) {
  const webGLSupported = useWebGLSupport()
  const reducedMotion = usePrefersReducedMotion()
  const config = useMemo(() => normalizeModelConfig(model.config), [model.config])
  const cameraApi = useRef<ViewerCameraApi | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [ready, setReady] = useState(false)
  const { progress } = useProgress()
  const instructionsId = useId()

  const handleReady = useCallback(() => setReady(true), [])

  const retry = () => {
    useGLTF.clear(model.url)
    setReady(false)
    setAttempt((value) => value + 1)
  }

  return (
    <div
      role="group"
      aria-label={`Interactive 3D view of the ${productName}`}
      aria-describedby={instructionsId}
      className={cx('relative isolate overflow-hidden rounded-[var(--radius-card)] bg-[#ede6db]', className)}
    >
      {!webGLSupported ? (
        <ViewerMessage
          title="3D view unavailable"
          message="Your browser or device does not support WebGL, so here is a photograph instead."
          image={fallbackImage}
        />
      ) : (
        <ModelErrorBoundary
          key={attempt}
          fallback={() => (
            <ViewerMessage
              title="We couldn't load the 3D model"
              message="The photographs below show the piece from every side."
              image={fallbackImage}
              onRetry={retry}
            />
          )}
        >
          <ViewerScene url={model.url} config={config} tint={tint} reducedMotion={reducedMotion} apiRef={cameraApi} onReady={handleReady} />
          {!ready && <ModelLoadingFallback progress={progress} />}
          <div className="absolute right-3 bottom-3 flex flex-col gap-1.5">
            <ViewerButton label="Zoom in" icon={Plus} onPress={() => cameraApi.current?.zoom(1.25)} />
            <ViewerButton label="Zoom out" icon={Minus} onPress={() => cameraApi.current?.zoom(0.8)} />
            <ViewerButton label="Reset view" icon={RefreshCcw01} onPress={() => cameraApi.current?.reset()} />
          </div>
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            <ViewerButton label="Rotate left" icon={FlipBackward} onPress={() => cameraApi.current?.rotate(-ROTATE_STEP)} />
            <ViewerButton label="Rotate right" icon={FlipForward} onPress={() => cameraApi.current?.rotate(ROTATE_STEP)} />
          </div>
        </ModelErrorBoundary>
      )}

      <p id={instructionsId} className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary/80 px-3 py-1 text-xs whitespace-nowrap text-tertiary backdrop-blur">
        Drag to rotate · Scroll or pinch to zoom · Right-drag to pan
      </p>
    </div>
  )
}

interface ViewerButtonProps {
  label: string
  onPress: () => void
  icon: FC<{ className?: string }>
}

function ViewerButton({ label, onPress, icon: Icon }: ViewerButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onPress}
      className="inline-flex size-9 items-center justify-center rounded-full bg-primary/90 text-secondary shadow-sm ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-primary hover:text-primary"
    >
      <Icon className="size-4" aria-hidden />
    </button>
  )
}
