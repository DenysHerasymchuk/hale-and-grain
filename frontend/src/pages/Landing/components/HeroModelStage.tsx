import { lazy, Suspense } from 'react'
import { useProduct } from '@/features/catalog/hooks'
import { ModelErrorBoundary } from '@/features/viewer/ModelErrorBoundary'
import { useWebGLSupport } from '@/features/viewer/useWebGLSupport'
import { useInView } from '@/hooks/useInView'

const HeroModel = lazy(() => import('./HeroModel').then((m) => ({ default: m.HeroModel })))

const HERO_SLUG = 'atelier-drawer-cabinet'

/** Right-hand column of the hero: the turning 3D cabinet, or its cutout photo without WebGL. */
export function HeroModelStage() {
  const { ref, inView } = useInView<HTMLDivElement>('0px', false)
  const { data: product } = useProduct(HERO_SLUG)
  const webGL = useWebGLSupport()
  const fallback = <img src="/images/hero-cabinet.webp" alt="" className="mx-auto h-full w-auto object-contain" />

  return (
    <div ref={ref} aria-hidden className="relative hidden h-[min(72svh,46rem)] lg:block">
      {product?.model && webGL ? (
        <ModelErrorBoundary fallback={() => fallback}>
          <Suspense fallback={null}>
            <HeroModel model={product.model} active={inView} />
          </Suspense>
        </ModelErrorBoundary>
      ) : (
        fallback
      )}
    </div>
  )
}
