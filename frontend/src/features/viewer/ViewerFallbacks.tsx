import { AlertCircle, RefreshCw01 } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'

export interface FallbackImage {
  url: string
  alt: string
}

export function ModelLoadingFallback({ progress }: { progress: number }) {
  const percent = Math.round(progress)
  return (
    <div role="status" aria-live="polite" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div className="h-px w-40 overflow-hidden bg-neutral-300">
        <div className="h-full bg-neutral-900 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs tracking-wide text-tertiary">Preparing 3D model{percent > 0 ? ` · ${percent}%` : ''}</p>
    </div>
  )
}

interface ViewerMessageProps {
  title: string
  message: string
  image?: FallbackImage | null
  onRetry?: () => void
}

/** Shown in place of the canvas when WebGL is unavailable or the model cannot load. */
export function ViewerMessage({ title, message, image, onRetry }: ViewerMessageProps) {
  return (
    <div className="absolute inset-0">
      {image && <img src={image.url} alt={image.alt} className="size-full object-cover" />}
      <div role="alert" className="absolute inset-x-4 bottom-4 flex items-start gap-3 rounded-md bg-primary/95 p-4 shadow-lg backdrop-blur sm:inset-x-auto sm:left-4 sm:max-w-sm">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-fg-warning-primary" aria-hidden />
        <div className="text-sm">
          <p className="font-medium text-primary">{title}</p>
          <p className="mt-1 text-tertiary">{message}</p>
          {onRetry && (
            <Button color="link-color" size="sm" iconLeading={RefreshCw01} className="mt-2" onPress={onRetry}>
              Try loading again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
