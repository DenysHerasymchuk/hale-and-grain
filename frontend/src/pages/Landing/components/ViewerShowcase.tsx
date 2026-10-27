import { ArrowRight } from '@untitledui/icons'
import { lazy, Suspense } from 'react'
import { Button } from '@/components/base/buttons/button'
import { useProduct } from '@/features/catalog/hooks'
import { ModelErrorBoundary } from '@/features/viewer/ModelErrorBoundary'
import { useInView } from '@/hooks/useInView'
import { routePaths } from '@/Routes/routePaths'

const FurnitureViewer3D = lazy(() => import('@/features/viewer/FurnitureViewer3D').then((m) => ({ default: m.FurnitureViewer3D })))

const SHOWCASE_SLUG = 'lune-console'

const points = [
  { title: 'Turn it around', text: 'Drag to orbit the piece and see the back, the sides and the underside of the top.' },
  { title: 'Get close', text: 'Zoom in on joints, grain and finish. Every model is true to scale.' },
  { title: 'Try the finishes', text: 'Switch finishes on the product page and the model updates as you choose.' },
]

export function ViewerShowcase() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const { data: product } = useProduct(SHOWCASE_SLUG)
  const poster = product?.images[0]

  return (
    <section id="in-3d" aria-labelledby="in-3d-heading" className="scroll-mt-28 bg-neutral-900 py-16 text-neutral-100 md:py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[2fr_3fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-brand-300 uppercase">Interactive 3D</p>
          <h2 id="in-3d-heading" className="mt-3 font-display text-4xl text-white md:text-5xl">
            The showroom, on your screen
          </h2>
          <p className="mt-5 max-w-md text-neutral-400">
            Every piece in the collection comes with a true-to-scale 3D model. Go ahead and try this one.
          </p>
          <dl className="mt-10 space-y-6">
            {points.map((point, index) => (
              <div key={point.title} className="flex gap-4">
                <dt className="font-display text-xl text-brand-300 tabular-nums">0{index + 1}</dt>
                <dd>
                  <p className="font-medium text-white">{point.title}</p>
                  <p className="mt-1 text-sm text-neutral-400">{point.text}</p>
                </dd>
              </div>
            ))}
          </dl>
          <Button href={routePaths.product(SHOWCASE_SLUG)} size="lg" color="secondary" iconTrailing={ArrowRight} className="mt-10">
            Open the Lune console
          </Button>
        </div>

        <div ref={ref} className="aspect-[4/3] w-full">
          {inView && product?.model ? (
            <ModelErrorBoundary fallback={() => <ShowcasePoster image={poster} />}>
            <Suspense fallback={<div className="size-full animate-pulse rounded-[var(--radius-card)] bg-neutral-800 motion-reduce:animate-none" />}>
              <FurnitureViewer3D
                model={product.model}
                productName={product.name}
                fallbackImage={poster ? { url: poster.url, alt: poster.altText } : null}
                className="size-full"
              />
            </Suspense>
            </ModelErrorBoundary>
          ) : (
            <ShowcasePoster image={poster} />
          )}
        </div>
      </div>
    </section>
  )
}

function ShowcasePoster({ image }: { image: { url: string; altText: string } | undefined }) {
  return (
    <div className="size-full overflow-hidden rounded-[var(--radius-card)] bg-neutral-800">
      {image && <img src={image.url} alt={image.altText} loading="lazy" className="size-full object-cover opacity-90" />}
    </div>
  )
}
